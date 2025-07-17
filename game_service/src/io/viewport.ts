import { RATIO } from '../core/constants';

export function fitCanvas(wrapper: HTMLElement, hud: HTMLElement, canvas: HTMLCanvasElement): void {
  const freeH = window.innerHeight - hud.getBoundingClientRect().height;
  const freeW = window.innerWidth;

  let w = freeW * 0.95;
  let h = w / RATIO;
  if (h > freeH * 0.95) {
    h = freeH * 0.95;
    w = h * RATIO;
  }
  wrapper.style.width  = `${w}px`;
  wrapper.style.height = `${h}px`;
  canvas.width = w;
  canvas.height = h;
}
