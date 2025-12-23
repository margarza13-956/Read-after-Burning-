import React, { useRef, useEffect } from 'react';
import { Particle } from '../types';

interface ParticleSkyProps {
  density?: 'low' | 'high';
  interactive?: boolean;
}

export const ParticleSky: React.FC<ParticleSkyProps> = ({ density = 'low', interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Initialize particles
    const count = density === 'high' ? 150 : 60;
    particles.current = []; // Clear existing
    for (let i = 0; i < count; i++) {
      particles.current.push(createSkyParticle(canvas.width, canvas.height));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background - Deep blues and purples
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f0c29'); // Deep midnight blue/purple
      gradient.addColorStop(0.5, '#302b63'); // Rich purple
      gradient.addColorStop(1, '#24243e'); // Dark blue-grey
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, index) => {
        // Update
        p.y += p.vy;
        p.x += Math.sin(p.life * 0.01) * 0.2 + p.vx; // Gentle sway
        p.life++;

        // Mouse interaction (gentle push)
        if (interactive) {
          const dx = p.x - mouse.current.x;
          const dy = p.y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p.vx += (dx / dist) * force * 0.05;
            p.vy += (dy / dist) * force * 0.05;
          }
        }

        // Friction to return to normal drift
        p.vx *= 0.99;
        // p.vy is constant upwards mostly, but we clamp it
        if (p.vy > -0.2) p.vy -= 0.01; // Tendency to float up
        if (p.vy < -1.5) p.vy = -1.5;

        // Reset if out of bounds
        if (p.y < -50 || p.alpha <= 0) {
          particles.current[index] = createSkyParticle(canvas.width, canvas.height, true);
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.5 + Math.sin(p.life * 0.05) * 0.2); // Twinkle
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, interactive]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

function createSkyParticle(w: number, h: number, resetAtBottom = false): Particle {
  const isAsh = Math.random() > 0.4; // 60% ash, 40% star/ember
  return {
    x: Math.random() * w,
    y: resetAtBottom ? h + 20 : Math.random() * h,
    vx: (Math.random() - 0.5) * 0.2,
    vy: -(Math.random() * 0.5 + 0.2), // Always float up
    life: Math.random() * 1000,
    maxLife: 1000 + Math.random() * 1000,
    size: isAsh ? Math.random() * 2 + 0.5 : Math.random() * 2 + 1,
    color: isAsh ? '#a78bfa' : '#fbbf24', // light purple (ash) or amber (ember)
    alpha: Math.random() * 0.5 + 0.2,
  };
}