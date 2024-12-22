import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Устанавливаем размер canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Создаем частицу
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = Math.random() > 0.5 ? 'rgba(255, 16, 240, 0.5)' : 'rgba(0, 255, 255, 0.5)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Инициализация частиц
    const init = () => {
      particles = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    // Анимация
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Инициализация
    resizeCanvas();
    init();
    animate();

    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
      resizeCanvas();
      init();
    });

    // Очистка
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <Box
      as="canvas"
      ref={canvasRef}
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      pointerEvents="none"
      zIndex="0"
      sx={{
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default ParticlesBackground;
