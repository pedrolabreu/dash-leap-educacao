"use client";

export function GoalInput({
  goal,
  onChange,
}: {
  goal: number | null;
  onChange: (goal: number | null) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      Meta do período (R$)
      <input
        type="number"
        min={0}
        step={100}
        inputMode="decimal"
        placeholder="ex: 50000"
        value={goal ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
        className="w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--text-primary)] tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--text-secondary)]"
      />
    </label>
  );
}
