// Confetti celebration utilities

interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x: number; y: number };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    zIndex?: number;
}

// Simple confetti implementation using canvas
class ConfettiCannon {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private particles: Particle[] = [];
    private animationId: number | null = null;

    private colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
        '#ffa500', '#ff69b4', '#7cfc00', '#00ced1', '#9400d3', '#ff1493'
    ];

    private createCanvas() {
        if (this.canvas) return;
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', this.resize);
    }

    private resize = () => {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    };

    private random(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    private createParticle(x: number, y: number, options: ConfettiOptions = {}): Particle {
        const spread = options.spread || 70;
        const angle = this.random(0, Math.PI * 2);
        const velocity = this.random(10, 25);

        return {
            x,
            y,
            vx: Math.cos(angle) * velocity * (spread / 70),
            vy: Math.sin(angle) * velocity - 10,
            color: options.colors?.[Math.floor(Math.random() * (options.colors?.length || this.colors.length))] ||
                this.colors[Math.floor(Math.random() * this.colors.length)],
            size: this.random(5, 12),
            rotation: this.random(0, Math.PI * 2),
            rotationSpeed: this.random(-0.2, 0.2),
            gravity: options.gravity ?? 0.5,
            friction: 0.99,
            opacity: 1,
            shape: options.shapes?.[Math.floor(Math.random() * (options.shapes?.length || 1))] || 'square'
        };
    }

    private animate = () => {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.01;

            if (p.opacity <= 0 || p.y > this.canvas!.height + 50) {
                return false;
            }

            this.ctx!.save();
            this.ctx!.translate(p.x, p.y);
            this.ctx!.rotate(p.rotation);
            this.ctx!.globalAlpha = p.opacity;
            this.ctx!.fillStyle = p.color;

            if (p.shape === 'circle') {
                this.ctx!.beginPath();
                this.ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx!.fill();
            } else {
                this.ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            this.ctx!.restore();
            return true;
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(this.animate);
        } else {
            this.destroy();
        }
    };

    fire(options: ConfettiOptions = {}) {
        this.createCanvas();

        const particleCount = options.particleCount || 50;
        const origin = options.origin || { x: 0.5, y: 0.5 };
        const x = origin.x * (this.canvas?.width || window.innerWidth);
        const y = origin.y * (this.canvas?.height || window.innerHeight);

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle(x, y, options));
        }

        if (!this.animationId) {
            this.animate();
        }
    }

    private destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.canvas) {
            window.removeEventListener('resize', this.resize);
            document.body.removeChild(this.canvas);
            this.canvas = null;
            this.ctx = null;
        }
    }
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    gravity: number;
    friction: number;
    opacity: number;
    shape: 'square' | 'circle';
}

const confetti = new ConfettiCannon();

export function fireConfetti(options?: ConfettiOptions) {
    confetti.fire(options);
}

export function firePerfectScoreCelebration() {
    // Fire multiple bursts for a perfect score celebration
    const defaults = {
        spread: 100,
        ticks: 200,
        gravity: 0.8,
        decay: 0.95,
        startVelocity: 30,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4']
    };

    function shoot() {
        confetti.fire({
            ...defaults,
            particleCount: 40,
            origin: { x: 0.2, y: 0.5 }
        });

        confetti.fire({
            ...defaults,
            particleCount: 40,
            origin: { x: 0.8, y: 0.5 }
        });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
    setTimeout(() => {
        confetti.fire({
            ...defaults,
            particleCount: 100,
            spread: 180,
            origin: { x: 0.5, y: 0.6 }
        });
    }, 300);
}

export default confetti;
