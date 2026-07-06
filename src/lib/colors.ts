// Categorical palette — fixed hue order, never cycled by rank.
// See dataviz skill: references/palette.md
export const CATEGORICAL: { light: string; dark: string }[] = [
  { light: "#2a78d6", dark: "#3987e5" }, // blue
  { light: "#1baf7a", dark: "#199e70" }, // aqua
  { light: "#eda100", dark: "#c98500" }, // yellow
  { light: "#008300", dark: "#008300" }, // green
  { light: "#4a3aa7", dark: "#9085e9" }, // violet
  { light: "#e34948", dark: "#e66767" }, // red
  { light: "#e87ba4", dark: "#d55181" }, // magenta
  { light: "#eb6834", dark: "#d95926" }, // orange
];

export const STATUS = {
  good: { light: "#0ca30c", dark: "#0ca30c" },
  warning: { light: "#fab219", dark: "#fab219" },
  serious: { light: "#ec835a", dark: "#ec835a" },
  critical: { light: "#d03b3b", dark: "#d03b3b" },
};

/**
 * Stable entity -> categorical slot mapping. The order must be derived from
 * the full, unfiltered roster so that toggling a filter never repaints the
 * survivors.
 */
export function buildCategoricalColorMap(
  allEntitiesInFixedOrder: string[],
): Map<string, { light: string; dark: string }> {
  const map = new Map<string, { light: string; dark: string }>();
  allEntitiesInFixedOrder.forEach((entity, i) => {
    map.set(entity, CATEGORICAL[i % CATEGORICAL.length]);
  });
  return map;
}
