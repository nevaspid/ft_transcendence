const keys: Record<string, boolean> = {};
const codes: Record<string, boolean> = {};
window.addEventListener('keydown', e => { keys[e.key] = true; codes[e.code] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = false; codes[e.code] = false; });

export function pressed(key: string): boolean {
  return !!keys[key];
}

export function pressedCode(code: string): boolean {
  return !!codes[code];
}
