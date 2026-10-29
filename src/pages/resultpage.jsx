
import { useEffect, useState } from "react";
import Photostrip, { PHOTO_SLOTS } from "../components/photostrip";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { uploadToCloudinary } from "../utils/cloudinary";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function createStripBlob(photos) {
  return new Promise(async (resolve, reject) => {
    try {
      const background = await loadImage("/photostrip.png");
      const canvas = document.createElement("canvas");

      canvas.width = 1000;
      canvas.height = Math.round(1000 * 990.5 / 334.3);

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to create photostrip.");

      context.drawImage(background, 0, 0, canvas.width, canvas.height);

      for (let i = 0; i < Math.min(3, photos.length); i++) {
        const image = await loadImage(photos[i]);
        const slot = PHOTO_SLOTS[i];

        const x = slot.left / 100 * canvas.width;
        const y = slot.top / 100 * canvas.height;
        const w = slot.width / 100 * canvas.width;
        const h = slot.height / 100 * canvas.height;

        const scale = Math.max(w / image.width, h / image.height);
        const sw = w / scale;
        const sh = h / scale;

        context.save();
        context.beginPath();
        context.rect(x, y, w, h);
        context.clip();
        context.drawImage(
          image,
          (image.width - sw) / 2,
          (image.height - sh) / 2,
          sw,
          sh,
          x,
          y,
          w,
          h
        );
        context.restore();
      }

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate the photostrip image."));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

export default function ResultPage({ result, onRestart }) {
  const [qrUrl, setQrUrl] = useState("");
  const [status, setStatus] = useState("Uploading your memories...");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function prepareMemories() {
      setQrUrl("");
      setError("");
      setStatus("Preparing your photostrip...");

      try {
        if (!result?.photos?.length) {
          throw new Error("No photos were found for this session.");
        }

        const stripBlob = await createStripBlob(result.photos);

        if (cancelled) return;

        setStatus("Uploading your photostrip and video...");

        const stripFile = new File(
          [stripBlob],
          "phinma-fridays-photostrip.png",
          { type: "image/png" }
        );

        const [stripUrl, videoUrl] = await Promise.all([
          uploadToCloudinary(stripFile, "image"),
          result.videoBlob
            ? uploadToCloudinary(
                new File(
                  [result.videoBlob],
                  "phinma-fridays-session.webm",
                  { type: result.videoBlob.type || "video/webm" }
                ),
                "video"
              )
            : Promise.resolve(""),
        ]);

        if (cancelled) return;

        const downloadUrl = new URL("/download", window.location.origin);
        downloadUrl.searchParams.set("strip", stripUrl);

        if (videoUrl) {
          downloadUrl.searchParams.set("video", videoUrl);
        }

        setQrUrl(downloadUrl.toString());
        setStatus("Your memories are ready!");
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to upload your memories.");
          setStatus("");
        }
      }
    }

    prepareMemories();

    return () => {
      cancelled = true;
    };
  }, [result]);

  return (
    <div className="result-page">
      <header className="site-header">
        <div className="brand-mark">PF</div>
        <div>
          <p className="eyebrow">PHINMA FRIDAYS</p>
          <h1>Your memories are ready!</h1>
        </div>
      </header>

      <div className="result-layout">
        <section className="result-strip-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR KEEPSAKE</p>
              <h2>Photostrip</h2>
            </div>
            <span className="success-pill">3 PHOTOS</span>
          </div>

          <div className="result-strip-stage">
            <Photostrip photos={result?.photos || []} />
          </div>
        </section>

        <section className="result-qr-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SCAN TO SAVE</p>
              <h2>Your QR code</h2>
            </div>
          </div>

          <QRCodeDisplay
            value={qrUrl}
            loading={!qrUrl && !error}
            error={error}
          />

          <p className="result-description" role="status">
            {status}
          </p>

          {error && (
            <button
              className="button button-primary full-width"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          )}

          <button
            className="text-button"
            onClick={onRestart}
          >
            Take another set of photos
          </button>
        </section>
      </div>

      <p className="privacy-note centered">
        Scan the QR code with your phone to access your photostrip
        and session video.
      </p>
    </div>
  );
}
