export function base64ToString(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function stringToBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}
