const COLOR = /^#[0-9a-fA-F]{6}$/;

export function parseHexColor(value: unknown, field: string, fallback: string) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string' || !COLOR.test(value)) throw new Error(`${field} must be a 6-digit hex color`);
  return value;
}
