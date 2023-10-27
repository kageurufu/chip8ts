export function decodeProgram(program: string): number[] {
  return Array.from(atob(program)).map((c) => c.charCodeAt(0));
}
