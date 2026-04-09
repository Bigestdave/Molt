import { useRef, useEffect, useState } from 'react';

interface ApyChartProps {
  data: { timestamp: number; apy: number }[];
  accentRgb: string;
  height?: number;
}

export default function ApyChart({ data, accentRgb, height = 180 }: ApyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const ob = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    if (containerRef.current) {
      ob.observe(containerRef.current);
      setWidth(containerRef.current.getBoundingClientRect().width);
    }
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || data.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const validData = data.filter(d => typeof d.apy === 'number' && !isNaN(d.apy));
    if (validData.length === 0) return;
    const chartData = validData.length === 1
      ? [{ ...validData[0], timestamp: validData[0].timestamp - 1000 }, validData[0]]
      : validData;

    const minApy = Math.min(...chartData.map(d => d.apy));
    const maxApy = Math.max(...chartData.map(d => d.apy));
    const range = maxApy - minApy || 1;
    const yMin = Math.max(0, minApy - range * 0.2);
    const yMax = maxApy + range * 0.2;
    const yRange = yMax - yMin;
    const chartHeight = height - 20;
    const minTime = chartData[0].timestamp;
    const maxTime = chartData[chartData.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1;

    const points = chartData.map(d => ({
      x: ((d.timestamp - minTime) / timeRange) * width,
      y: ((yMax - d.apy) / yRange) * chartHeight,
    }));

    // Fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.save();
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.lineTo(points[0].x, height);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
    fillGrad.addColorStop(0, `rgba(${accentRgb}, 0.2)`);
    fillGrad.addColorStop(1, `rgba(${accentRgb}, 0.0)`);
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    // Stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
    strokeGrad.addColorStop(0, `rgba(${accentRgb}, 0.15)`);
    strokeGrad.addColorStop(0.3, `rgba(${accentRgb}, 0.8)`);
    strokeGrad.addColorStop(1, `rgba(${accentRgb}, 1)`);
    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Dot
    const lastP = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${accentRgb})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accentRgb}, 0.25)`;
    ctx.fill();
  }, [data, accentRgb, width, height]);

  return (
    <div ref={containerRef} className="w-full relative" style={{ height }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
