'use client';

import { useEffect, useRef } from 'react';

interface SquaresProps {
    speed?: number;
    squareSize?: number;
    direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
    borderColor?: string;
    hoverFillColor?: string;
    className?: string;
}

export default function Squares({
    speed = 0.5,
    squareSize = 40,
    direction = 'right',
    borderColor = 'rgba(255, 255, 255, 0.05)',
    hoverFillColor = 'rgba(255, 255, 255, 0.1)',
    className = '',
}: SquaresProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);
    const gridOffset = useRef({ x: 0, y: 0 });
    const hoveredSquare = useRef<{ x: number; y: number } | null>(null);
    const mousePos = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const draw = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update grid offset based on direction
            switch (direction) {
                case 'right':
                    gridOffset.current.x -= speed;
                    break;
                case 'left':
                    gridOffset.current.x += speed;
                    break;
                case 'up':
                    gridOffset.current.y += speed;
                    break;
                case 'down':
                    gridOffset.current.y -= speed;
                    break;
                case 'diagonal':
                    gridOffset.current.x -= speed;
                    gridOffset.current.y -= speed;
                    break;
            }

            // Reset offset to prevent overflow
            if (Math.abs(gridOffset.current.x) >= squareSize) {
                gridOffset.current.x = 0;
            }
            if (Math.abs(gridOffset.current.y) >= squareSize) {
                gridOffset.current.y = 0;
            }

            // Draw grid
            const startX = gridOffset.current.x % squareSize;
            const startY = gridOffset.current.y % squareSize;

            for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
                for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
                    const squareX = Math.floor((x - gridOffset.current.x) / squareSize);
                    const squareY = Math.floor((y - gridOffset.current.y) / squareSize);

                    // Check if mouse is hovering over this square
                    const isHovered =
                        mousePos.current.x >= x &&
                        mousePos.current.x < x + squareSize &&
                        mousePos.current.y >= y &&
                        mousePos.current.y < y + squareSize;

                    if (isHovered) {
                        ctx.fillStyle = hoverFillColor;
                        ctx.fillRect(x, y, squareSize, squareSize);
                    }

                    // Draw border
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, squareSize, squareSize);
                }
            }

            requestRef.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mousePos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mousePos.current = { x: -1000, y: -1000 };
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        requestRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [speed, squareSize, direction, borderColor, hoverFillColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${className}`}
            style={{ background: 'transparent' }}
        />
    );
}
