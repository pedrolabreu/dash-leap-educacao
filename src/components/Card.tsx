export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-[var(--surface)] border border-[var(--border)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}
