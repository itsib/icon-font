export function slugify(value: string): string {
  value = value.trim();
  if (value.includes(' ')) {
    value = value.toLowerCase().replace(/\s+/g, '-');
  } else if (/[A-Z]/.test(value)) {
    value = value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  return value;
}