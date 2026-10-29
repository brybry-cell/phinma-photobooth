
function attachmentUrl(url) {
  if (!url) return "";
  return url.replace("/upload/", "/upload/fl_attachment/");
}

export default function DownloadPage() {
  const params = new URLSearchParams(window.location.search);
  const stripUrl = params.get("strip") || "";
  const videoUrl = params.get("video") || "";

  return (
    <main className="download-page">
      <header className="site-header">
        <div className="brand-mark">PF</div>
        <div>
          <p className="eyebrow">PHINMA FRIDAYS</p>
          <h1>Your memories, saved.</h1>
        </div>
      </header>

      <section className="download-intro">
        <h2>Thanks for making memories with us!</h2>
        <p>
          Your photobooth keepsakes are ready. Preview your files
          and download the ones you want to keep.
        </p>
      </section>

      {stripUrl ? (
        <section className="download-card">
          <p className="eyebrow">YOUR KEEPSAKE</p>
          <h2>Photostrip</h2>

          <img
            className="download-strip-preview"
            src={stripUrl}
            alt="Your PHINMA Fridays photostrip"
          />

          <a
            className="button button-primary full-width"
            href={attachmentUrl(stripUrl)}
          >
            Download photostrip
          </a>
        </section>
      ) : (
        <p className="download-error">
          The photostrip link is missing or invalid.
        </p>
      )}

      {videoUrl && (
        <section className="download-card">
          <p className="eyebrow">BEHIND THE SCENES</p>
          <h2>Session video</h2>

          <video
            className="download-video"
            src={videoUrl}
            controls
            playsInline
          />

          <a
            className="button button-secondary full-width"
            href={attachmentUrl(videoUrl)}
          >
            Download session video
          </a>
        </section>
      )}

      <p className="privacy-note centered">
        Keep your memories safe by downloading your files to your device.
      </p>
    </main>
  );
}
