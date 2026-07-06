import { STATUS } from "@/lib/colors";
import type { PaceStatus } from "@/lib/aggregate";

const ICON: Record<PaceStatus, string> = {
  good: "▲",
  warning: "●",
  critical: "▼",
  none: "–",
};

const COLOR: Record<PaceStatus, string> = {
  good: STATUS.good.light,
  warning: STATUS.warning.light,
  critical: STATUS.critical.light,
  none: "var(--text-muted)",
};

export function StatusBadge({
  status,
  label,
}: {
  status: PaceStatus;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      style={{ color: COLOR[status] }}
    >
      <span aria-hidden="true">{ICON[status]}</span>
      {label}
    </span>
  );
}
