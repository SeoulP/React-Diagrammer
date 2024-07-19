import React, { useEffect, useRef } from 'react';
import { Leaf } from "./utils/Leaf.ts";
import { useLocalStorage } from "../utils/hooks/useLocalStorage.tsx";

interface LineDrawerProps {
    leaves: Map<string, Leaf>;
}

const LineDrawer: React.FC<LineDrawerProps> = ({ leaves }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [colors] = useLocalStorage('colors', {
        primaryColor: '#6a5acd',
        secondaryColor: '#efefef',
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = 6;

                leaves.forEach(leaf => {
                    if (leaf.root) {
                        const startX = leaf.coords.posX + (leaf.dimensions.posX / 1.75);
                        const startY = leaf.coords.posY + (leaf.dimensions.posY / 1.35);
                        const endX = leaf.root.coords.posX + (leaf.root.dimensions.posX / 1.75);
                        const endY = leaf.root.coords.posY + (leaf.root.dimensions.posY / 1.35);

                        // Create gradient
                        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                        gradient.addColorStop(1, colors.secondaryColor);
                        gradient.addColorStop(0, `${colors.secondaryColor}20`); // 70% opacity

                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.strokeStyle = gradient; // Apply the gradient
                        ctx.stroke();
                    }
                });
            }
        }
    }, [leaves, colors]);

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default LineDrawer;
