const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2025-06" → "Jun 2025"; "present" → "Present". */
export function formatYearMonth(value: string): string {
  if (value === 'present') return 'Present';
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatRange(start: string, end: string): string {
  return `${formatYearMonth(start)} – ${formatYearMonth(end)}`;
}

/** 4200 → "4,200" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-AU').format(value);
}
