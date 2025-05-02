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
    const numberOfParticles = 35; // Increased for a more vibrant effect while still being light

    // Generate a mesh-like connection between particles
    function connectParticles() {
      if (!ctx) return;
      const maxDistance = 150; // Maximum distance to draw a connection
      
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Calculate opacity based on distance (closer = more visible)
            const opacity = 0.2 * (1 - distance / maxDistance);
            ctx.strokeStyle = `rgba(180, 180, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      glowing: boolean;
      glowIntensity: number;
      glowDirection: boolean;

      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.size = Math.random() * 4 + 1; // Small particle size
        this.speedX = Math.random() * 0.5 - 0.25; // Slow movement
        this.speedY = Math.random() * 0.5 - 0.25; // Slow movement
        
        // Enhanced color palette with higher saturation
        const colors = [
          'rgba(130, 179, 255, 0.25)', // Soft blue
          'rgba(180, 210, 255, 0.2)',  // Light blue
          'rgba(167, 243, 208, 0.25)', // Soft teal
          'rgba(216, 180, 254, 0.25)', // Soft purple
          'rgba(255, 175, 230, 0.2)',  // Soft pink
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.6 + 0.2; // Slightly higher opacity
        
        // Glow effect parameters
        this.glowing = Math.random() > 0.6; // 40% of particles will glow
        this.glowIntensity = Math.random() * 0.2 + 0.3;
        this.glowDirection = Math.random() > 0.5; // Whether intensity is increasing or decreasing
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Boundary check with smoother bounce effect
        if (this.x > canvasEl.width || this.x < 0) {
          this.speedX = -this.speedX * 0.95; // Slight energy loss for natural feel
          if (this.x > canvasEl.width) this.x = canvasEl.width;
          if (this.x < 0) this.x = 0;
        }
        if (this.y > canvasEl.height || this.y < 0) {
          this.speedY = -this.speedY * 0.95; // Slight energy loss for natural feel
          if (this.y > canvasEl.height) this.y = canvasEl.height;
          if (this.y < 0) this.y = 0;
        }
        
        // Pulsating glow effect
        if (this.glowing) {
          if (this.glowDirection) {
            this.glowIntensity += 0.005;
            if (this.glowIntensity > 0.6) this.glowDirection = false;
          } else {
            this.glowIntensity -= 0.005;
            if (this.glowIntensity < 0.2) this.glowDirection = true;
          }
        }
      }

      draw() {
        if (!ctx) return;
        
        // Draw particle with gradient for better visual effect
        if (this.glowing) {
          const gradient = ctx.createRadialGradient(
            this.x, 
            this.y, 
            0, 
            this.x, 
            this.y, 
            this.size * 2
          );
          
          // Parse the rgba values to extract the color components
          const rgbaRegex = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/;
          const match = this.color.match(rgbaRegex);
          
          if (match) {
            const [_, r, g, b, a] = match;
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.glowIntensity})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Draw the main particle
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
    const throttleAmount = 20; // Slightly faster frame rate but still efficient

    const animate = (timestamp: number) => {
      // Throttle frame rate for performance
      if (timestamp - lastTime < throttleAmount) {
        requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;

      if (!ctx) return;

      // Clear canvas with a slight transparency effect for trails
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

      // Connect particles with subtle lines to create a mesh effect
      connectParticles();

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