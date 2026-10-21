/** The site reads top to bottom as a data pipeline. Order matters: it sets the "01 / …" index. */
export const STAGES = ['extract', 'transform', 'load', 'model', 'output'] as const;
export type Stage = (typeof STAGES)[number];
