import { useEffect, useRef } from 'react';

interface BackgroundAnimationProps {
  className?: string;
}

export default function BackgroundAnimation({ className = '' }: BackgroundAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    // Initial resize
    resizeCanvas();

    // Resize on window resize
    window.addEventListener('resize', resizeCanvas);

    // Store canvas reference to prevent TypeScript null check warnings
    const canvasEl = canvas as HTMLCanvasElement;
    
    // Create particles
    const particlesArray: Particle[] = [];
    const numberOfParticles = 20; // Keep this number low for better performance

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.size = Math.random() * 5 + 1; // Small particle size
        this.speedX = Math.random() * 0.5 - 0.25; // Slow movement
        this.speedY = Math.random() * 0.5 - 0.25; // Slow movement
        
        // Use theme colors
        const colors = ['rgba(129, 140, 248, 0.1)', 'rgba(167, 243, 208, 0.15)', 'rgba(216, 180, 254, 0.1)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.1; // Low opacity
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Boundary check
        if (this.x > canvasEl.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvasEl.height || this.y < 0) {
          this.speedY = -this.speedY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    // Animation loop with throttling
    let lastTime = 0;
    const throttleAmount = 30; // Milliseconds to wait between frames

    const animate = (timestamp: number) => {
      // Throttle frame rate for performance
      if (timestamp - lastTime < throttleAmount) {
        requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;

      if (!ctx) return;

      // Clear only the areas where particles are
      particlesArray.forEach(particle => {
        ctx.clearRect(
          particle.x - particle.size - 1,
          particle.y - particle.size - 1,
          particle.size * 2 + 2,
          particle.size * 2 + 2
        );
      });

      // Update and redraw particles
      particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Schedule next frame
      requestAnimationFrame(animate);
    };

    // Start animation
    const animationId = requestAnimationFrame(animate);

    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 -z-10 ${className}`} />;
}