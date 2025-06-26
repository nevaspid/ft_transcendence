export function drawOverlay (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: string): void {
	ctx.save();
	ctx.fillStyle = 'rgba(0,0,0,0.5)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#fff';
	ctx.font = `${canvas.height * 0.12}px sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(message, canvas.width / 2, canvas.height / 2);
	ctx.restore();
}