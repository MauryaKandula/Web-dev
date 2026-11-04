import { StageDef } from '../types.ts';

export const STAGES: StageDef[] = [
  {
    id: 'shibuya',
    name: 'Neon Shibuya Rooftop',
    subtitle: 'Midnight Cyber Skyline',
    groundY: 420,
    primaryColor: '#0f172a',
    accentColor: '#00e5ff'
  },
  {
    id: 'ramen',
    name: 'Cyber Ramen Alley',
    subtitle: 'Sub-level Gastronomy District',
    groundY: 420,
    primaryColor: '#1c1917',
    accentColor: '#f97316'
  },
  {
    id: 'orbital',
    name: 'Orbital Ring Platform',
    subtitle: 'Low-Earth Solar Collector',
    groundY: 420,
    primaryColor: '#09090b',
    accentColor: '#a855f7'
  }
];

export function renderStageBackground(
  ctx: CanvasRenderingContext2D,
  stage: StageDef,
  width: number,
  height: number,
  timeMs: number
) {
  // Clear Sky
  if (stage.id === 'shibuya') {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#030712');
    skyGradient.addColorStop(0.6, '#0f172a');
    skyGradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Distant City Skyscrapers
    ctx.fillStyle = '#090d16';
    for (let x = 20; x < width; x += 70) {
      const bHeight = 160 + ((x * 37) % 180);
      ctx.fillRect(x, stage.groundY - bHeight, 55, bHeight);

      // Windows
      ctx.fillStyle = '#1e293b';
      for (let wy = stage.groundY - bHeight + 20; wy < stage.groundY - 20; wy += 25) {
        if ((x + wy) % 3 === 0) {
          ctx.fillStyle = (x + wy) % 2 === 0 ? 'rgba(0, 229, 255, 0.4)' : 'rgba(236, 72, 153, 0.4)';
          ctx.fillRect(x + 10, wy, 8, 12);
          ctx.fillRect(x + 30, wy, 8, 12);
        }
      }
      ctx.fillStyle = '#090d16';
    }

    // Neon Rooftop Signs
    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.font = 'bold 16px "Orbitron", sans-serif';
    ctx.fillText('SHIBUYA NET // 2026', 80, 140);
  } else if (stage.id === 'ramen') {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#1c1917');
    skyGradient.addColorStop(0.7, '#292524');
    skyGradient.addColorStop(1, '#44403c');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Warm Lanterns
    for (let lx = 120; lx < width; lx += 220) {
      ctx.beginPath();
      ctx.arc(lx, 150, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('拉麺', lx - 12, 155);
    }
  } else {
    // Orbital
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 70; i++) {
      const sx = (i * 123) % width;
      const sy = (i * 77) % (stage.groundY - 50);
      const twinkle = Math.sin(timeMs * 0.003 + i) > 0 ? 2 : 1;
      ctx.fillRect(sx, sy, twinkle, twinkle);
    }

    // Earth Curve
    ctx.beginPath();
    ctx.arc(width / 2, height + 400, 700, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Ground Stage Floor
  const floorGradient = ctx.createLinearGradient(0, stage.groundY, 0, height);
  floorGradient.addColorStop(0, '#1e293b');
  floorGradient.addColorStop(0.1, '#0f172a');
  floorGradient.addColorStop(1, '#020617');
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, stage.groundY, width, height - stage.groundY);

  // Ground Border Line
  ctx.strokeStyle = stage.accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, stage.groundY);
  ctx.lineTo(width, stage.groundY);
  ctx.stroke();
}
