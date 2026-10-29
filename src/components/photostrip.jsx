import "./photostrip.css";

// Slot coordinates are percentages of the full strip. Adjust these four values per
// slot if the artwork's yellow windows differ from this reference.
export const PHOTO_SLOTS = [
  { left: 10.2, top: 25.3, width: 79.0, height: 16.0 },
  { left: 10.2, top: 44.9, width: 79.0, height: 16.0 },
  { left: 10.2, top: 63.2, width: 79.0, height: 16.0 },
];

export default function Photostrip({ photos = [], className = "" }) {
  return <div className={`photostrip-frame ${className}`}>
    <img className="photostrip-background" src="/photostrip.png" alt="PHINMA Fridays Kids Party photostrip background" />
    {PHOTO_SLOTS.map((slot, i) => <div key={i} className={`photostrip-photo-slot ${photos[i] ? "has-photo" : ""}`}
      style={{ left: `${slot.left}%`, top: `${slot.top}%`, width: `${slot.width}%`, height: `${slot.height}%` }}>
      {photos[i] ? <img src={photos[i]} alt={`Captured photo ${i + 1}`} /> : <span className="empty-slot-label">PHOTO {i + 1}</span>}
    </div>)}
  </div>;
}
