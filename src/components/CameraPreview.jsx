import { forwardRef } from "react";
const CameraPreview = forwardRef(function CameraPreview({ stream, cameraError, isRecording, recordingTime }, ref) {
  return <section className="camera-card">
    <div className="panel-heading"><div><p className="eyebrow">YOUR CAMERA</p><h2>Get photo-ready</h2></div>
      <span className={`recording-pill ${isRecording ? "is-recording" : ""}`}><i className="recording-dot"/>{isRecording ? `REC ${recordingTime}` : "READY"}</span>
    </div>
    <div className="camera-window">
      <video ref={ref} className="camera-video" autoPlay playsInline muted aria-label="Live webcam feed" />
      {!stream && <div className="camera-placeholder">
        </div>}
      {cameraError && <div className="camera-error"><strong>Camera notice</strong><span>{cameraError}</span></div>}
      {isRecording && <span className="recording-indicator">Recording session</span>}
    </div>
  </section>;
});
export default CameraPreview;
