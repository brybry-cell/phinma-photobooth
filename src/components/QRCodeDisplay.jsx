
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeDisplay({
  value = "",
  loading = false,
  error = "",
}) {
  return (
    <div className="qr-display">
      <div className="qr-code-frame">
        {loading ? (
          <p>Uploading your memories...</p>
        ) : error ? (
          <p className="qr-error">{error}</p>
        ) : value ? (
          <QRCodeSVG
            value={value}
            size={220}
            level="M"
            marginSize={2}
            title="Scan to download your photobooth memories"
          />
        ) : (
          <div className="qr-placeholder">
            <span>QR</span>
            <small>Your QR code will appear here</small>
          </div>
        )}
      </div>

      <h3>Take your memories with you</h3>
      <p>
        Scan this QR code with your phone to access your
        photostrip and session video.
      </p>
    </div>
  );
}
