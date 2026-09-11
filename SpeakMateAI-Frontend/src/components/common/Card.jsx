export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] ${className}`}>
      {children}
    </div>
  );
}

export default Card;
