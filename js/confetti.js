/* ==========================================================================
   SahaayaMind - Lightweight Celebratory Confetti Burst
   Zero-dependency, high-performance celebratory visual effect for seniors
   ========================================================================== */

(function () {
  'use strict';

  const COLORS = [
    '#0D9488', // Teal
    '#5EEAD4', // Mint
    '#F59E0B', // Warm Amber Gold
    '#FBBF24', // Sunshine Yellow
    '#2563EB', // Medical Blue
    '#10B981', // Calming Green
    '#EC4899', // Lotus Rose
    '#8B5CF6'  // Soft Violet
  ];

  function burstConfetti(options) {
    const opts = options || {};
    const count = opts.count || 85;
    const duration = opts.duration || 3200;

    let canvas = document.getElementById('sahaaya-confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'sahaaya-confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '10002';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const originX = width / 2;
    const originY = height * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 6;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: (Math.sin(angle) * speed * 0.8) - 4, // initial upward lift
        size: Math.random() * 8 + 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'star'),
        opacity: 1,
        oscillationSpeed: Math.random() * 0.1 + 0.05,
        oscillationVal: Math.random() * Math.PI
      });
    }

    const startTime = performance.now();
    let animationId = null;

    function render(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        ctx.clearRect(0, 0, width, height);
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        // Apply physics
        p.vx *= 0.98; // Air resistance
        p.vy += 0.28; // Gravity
        p.x += p.vx + Math.sin(p.oscillationVal) * 1.5;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.oscillationVal += p.oscillationSpeed;

        // Fade out in last 30% of duration
        if (progress > 0.65) {
          p.opacity = Math.max(0, 1 - ((progress - 0.65) / 0.35));
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw small festive star
          ctx.font = `${Math.round(p.size * 1.4)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 0);
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);
  }

  // Expose globally
  window.SahaayaConfetti = {
    burst: burstConfetti
  };

})();
