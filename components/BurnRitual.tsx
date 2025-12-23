import React, { useRef, useEffect, useState } from 'react';
import { Particle, Letter } from '../types';

interface BurnRitualProps {
  letter: Letter;
  onComplete: () => void;
}

export const BurnRitual: React.FC<BurnRitualProps> = ({ letter, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [burnProgress, setBurnProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Simulation state
    const particles: Particle[] = [];
    let progress = 0;
    let animationId: number;

    const paperRect = {
      x: canvas.width / 2 - 300,
      y: canvas.height / 2 - 200, // Roughly center
      w: 600,
      h: 500
    };
    
    // Adjust for mobile
    if (canvas.width < 768) {
        paperRect.w = canvas.width - 40;
        paperRect.x = 20;
        paperRect.h = canvas.height * 0.6;
        paperRect.y = canvas.height * 0.2;
    }

    // Function to draw text wrapped
    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    };

    const animate = () => {
      // 1. Update State
      progress += 0.003; // Burn speed
      setBurnProgress(Math.min(progress, 1));
      
      if (progress > 1.5 && particles.length === 0) {
        // Finished
        onComplete();
        return;
      }

      // 2. Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 3. Draw Paper (The part that hasn't burned yet)
      if (progress < 1.1) {
        ctx.save();
        ctx.beginPath();
        
        // The burn line moves from bottom to top
        // Simple logic: Burn height is determined by progress
        // To make it ragged, we can use noise or simple sine waves
        
        const burnY = paperRect.y + paperRect.h - (paperRect.h * progress * 1.2) + (Math.random() * 5);
        
        ctx.rect(paperRect.x, paperRect.y, paperRect.w, Math.max(0, burnY - paperRect.y));
        ctx.clip();

        // Draw Paper Background
        ctx.fillStyle = '#f8fafc'; // slate-50
        ctx.fillRect(paperRect.x, paperRect.y, paperRect.w, paperRect.h);

        // Draw Paper Texture/Lines
        ctx.strokeStyle = '#cbd5e1'; // slate-300
        ctx.lineWidth = 1;
        for(let i=0; i<paperRect.h; i+=30) {
             ctx.beginPath();
             ctx.moveTo(paperRect.x + 20, paperRect.y + i + 40);
             ctx.lineTo(paperRect.x + paperRect.w - 20, paperRect.y + i + 40);
             ctx.stroke();
        }

        // Draw Text
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.font = '20px Lora, serif';
        drawWrappedText(letter.content, paperRect.x + 30, paperRect.y + 60, paperRect.w - 60, 30);
        
        // Draw Emotion Tag
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 16px Inter, sans-serif';
        ctx.fillText(letter.emotion, paperRect.x + 30, paperRect.y + 30);

        ctx.restore();

        // 4. Spawn Particles at the Burn Line
        // We only spawn if the burn line is still within the paper
        if (burnY > paperRect.y && burnY < paperRect.y + paperRect.h) {
            const spawnCount = 10;
            for(let i=0; i<spawnCount; i++) {
                const pX = paperRect.x + Math.random() * paperRect.w;
                // Only spawn if close to the "burn line"
                // To create a ragged edge effect, we only spawn closer to actual burning edge
                particles.push({
                    x: pX,
                    y: burnY + (Math.random() * 10 - 5),
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: -(Math.random() * 2 + 1),
                    life: 0,
                    maxLife: 100 + Math.random() * 100,
                    size: Math.random() * 4 + 1,
                    color: Math.random() > 0.5 ? '#fb923c' : '#475569', // Orange or Slate (Ash)
                    alpha: 1
                });
            }
            
            // Draw the glowing edge
            ctx.shadowColor = '#f97316'; // orange-500
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ef4444'; // red-500
            ctx.fillRect(paperRect.x, burnY - 2, paperRect.w, 4);
            ctx.shadowBlur = 0;
        }
      }

      // 5. Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - (p.life / p.maxLife);
        
        // Turbulence
        p.vx += Math.sin(p.life * 0.1) * 0.05;

        // Color transition: Fire -> Ash -> Fade
        if (p.life < 20) {
             p.color = '#fb923c'; // Orange
        } else if (p.life < 50) {
            p.color = '#ef4444'; // Reddish
        } else {
            p.color = '#94a3b8'; // Grey ash
        }

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [letter, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="absolute top-12 left-0 right-0 text-center z-20 pointer-events-none animate-in fade-in duration-1000">
        <h1 className="text-white/30 font-serif-display text-lg tracking-[0.2em] uppercase opacity-60">
          Read After Burning
        </h1>
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      <div className="absolute bottom-10 text-center w-full z-20 pointer-events-none transition-opacity duration-1000" style={{ opacity: burnProgress > 0.8 ? 1 : 0 }}>
        <p className="text-white/70 font-serif-display text-xl tracking-widest animate-pulse">
          RELEASING...
        </p>
      </div>
    </div>
  );
};