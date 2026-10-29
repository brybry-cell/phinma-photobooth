import { useCallback, useEffect, useRef, useState } from "react";
import CameraPreview from "../components/cameraPreview";
import Countdown from "../components/countdown";
import Photostrip from "../components/photostrip";

const SHOTS = 3, COUNTDOWN = 3;
const wait = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
const fmt = (n) => `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;

export default function PhotoboothPage({ onComplete }) {
  const videoRef = useRef(null), streamRef = useRef(null), recorderRef = useRef(null);
  const chunksRef = useRef([]), photosRef = useRef([]), timerRef = useRef(null), cancelledRef = useRef(false);
  const startAtRef = useRef(0);
  const [stream,setStream] = useState(null), [cameraError,setCameraError] = useState("");
  const [photos,setPhotos] = useState([]), [countdown,setCountdown] = useState(null), [status,setStatus] = useState("");
  const [isRecording,setIsRecording] = useState(false), [busy,setBusy] = useState(false), [seconds,setSeconds] = useState(0);

  useEffect(() => {
    let active = true;
    async function setup() {
      if (!navigator.mediaDevices?.getUserMedia) { setCameraError("Camera access requires localhost or HTTPS."); return; }
      try {
        let s;
        try { s = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:true}); }
        catch { s = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false}); if(active) setCameraError("Microphone unavailable; video will record without audio."); }
        if (!active) { s.getTracks().forEach(t=>t.stop()); return; }
        streamRef.current=s; setStream(s); if(videoRef.current) videoRef.current.srcObject=s;
      } catch { setCameraError("Please allow camera access in your browser settings, then refresh."); }
    }
    setup();
    return () => { active=false; clearInterval(timerRef.current); if(recorderRef.current?.state==="recording") recorderRef.current.stop(); streamRef.current?.getTracks().forEach(t=>t.stop()); };
  },[]);
  useEffect(() => {
    if(!isRecording) return;
    timerRef.current=window.setInterval(()=>setSeconds(Math.floor((Date.now()-startAtRef.current)/1000)),250);
    return ()=>clearInterval(timerRef.current);
  },[isRecording]);

  const capture = useCallback(() => {
    const v=videoRef.current; if(!v?.videoWidth) throw new Error("Camera is still starting. Please try again.");
    const c=document.createElement("canvas"); c.width=v.videoWidth; c.height=v.videoHeight;
    const ctx=c.getContext("2d"); ctx.translate(c.width,0); ctx.scale(-1,1); ctx.drawImage(v,0,0,c.width,c.height);
    return c.toDataURL("image/jpeg",.92);
  },[]);
  const startRecorder = () => {
    const type=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(t=>MediaRecorder.isTypeSupported?.(t));
    const r=type?new MediaRecorder(streamRef.current,{mimeType:type}):new MediaRecorder(streamRef.current);
    chunksRef.current=[]; r.ondataavailable=e=>{if(e.data?.size) chunksRef.current.push(e.data);};
    recorderRef.current=r; r.start(1000); startAtRef.current=Date.now(); setSeconds(0); setIsRecording(true);
  };
  const stopRecorder = () => new Promise(resolve => {
    const r=recorderRef.current;
    if(!r || r.state==="inactive") { resolve(chunksRef.current.length?new Blob(chunksRef.current,{type:r?.mimeType||"video/webm"}):null); return; }
    r.onstop=()=>{setIsRecording(false); const b=new Blob(chunksRef.current,{type:r.mimeType||"video/webm"}); resolve(b.size?b:null);};
    r.stop();
  });

  const startSession = async () => {
    if(!streamRef.current || busy) return;
    if(!window.MediaRecorder) {setCameraError("This browser does not support recording. Try current Chrome or Edge.");return;}
    cancelledRef.current=false; photosRef.current=[]; chunksRef.current=[]; setPhotos([]); setCameraError(""); setBusy(true);
    try {
      startRecorder(); await wait(700);
      for(let shot=0;shot<SHOTS;shot++) {
        if(cancelledRef.current) return;
        setStatus(`Get ready for photo ${shot+1} of ${SHOTS}`);
        for(let n=COUNTDOWN;n>=1;n--) {if(cancelledRef.current)return;setCountdown(n);await wait(1000);}
        setCountdown(null);setStatus("Smile!");await wait(250);
        const p=capture(); photosRef.current=[...photosRef.current,p];setPhotos([...photosRef.current]);
        setStatus(shot<SHOTS-1?"Nice! Next photo coming up…":"All photos captured!");
        await wait(shot<SHOTS-1?1400:500);
      }
      setCountdown(null);
      const videoBlob=await stopRecorder();
      onComplete?.({photos:photosRef.current,videoBlob,videoType:videoBlob?.type||"video/webm",durationSeconds:Math.floor((Date.now()-startAtRef.current)/1000)});
    } catch(e) {
      setCountdown(null); setCameraError(e?.message||"Something went wrong. Please try again.");
      if(recorderRef.current?.state==="recording") await stopRecorder();
    } finally {setBusy(false);setStatus("");}
  };
  const cancel = async () => {
    cancelledRef.current=true;setCountdown(null);
    if(recorderRef.current?.state==="recording") await stopRecorder();
    photosRef.current=[];setPhotos([]);setBusy(false);setStatus("");setIsRecording(false);
  };

  return <div className="photobooth-page">
    <div className="booth-layout">
      <div className="booth-left">
        <CameraPreview ref={videoRef} stream={stream} cameraError={cameraError} isRecording={isRecording} recordingTime={fmt(seconds)} />
        <div className="session-controls">
          <div className="session-status">
            </div>
          {busy?<button className="button button-secondary" onClick={cancel}>Cancel session</button>:<button className="button button-primary" onClick={startSession} disabled={!stream}>✦ Start photobooth</button>}
        </div>
      </div>
      <aside className="preview-panel">
        <div className="strip-stage"><Photostrip photos={photos}/></div>
        <div className="shot-progress">{Array.from({length:SHOTS},(_,i)=><div className={`shot-step ${photos[i]?"complete":""}`} key={i}><span>{photos[i]?"✓":i+1}</span><small>{photos[i]?"Captured":`Photo ${i+1}`}</small></div>)}</div>
      </aside>
    </div>
    <Countdown value={countdown} message={status==="Smile!"?"SMILE!":null}/>
  </div>;
}
