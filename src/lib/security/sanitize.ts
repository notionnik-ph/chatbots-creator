export function cleanText(value: unknown, maxLength: number, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error('A required text field is missing');
    return '';
  }
  if (typeof value !== 'string') throw new Error('Text fields must be strings');
  const cleaned = value.replace(/\u0000/g, '').trim();
  if (cleaned.length > maxLength) throw new Error(`Text exceeds ${maxLength} characters`);
  if (required && !cleaned) throw new Error('A required text field is empty');
  return cleaned;
}

export function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
