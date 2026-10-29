export default function Countdown({ value, message }) {
  if (value == null && !message) return null;
  return <div className="countdown-overlay" aria-live="assertive">
    {value != null && <span className="countdown-number">{value}</span>}
    {message && <span className="countdown-message">{message}</span>}
  </div>;
}
