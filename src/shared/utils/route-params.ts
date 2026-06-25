export function requireRouteParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing route param: ${name}`);
  }

  return value;
}
