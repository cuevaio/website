"use client";

import { ChromaFlow, Shader, Swirl } from "shaders/react";

interface ShaderBackgroundProps {
	colorA?: string;
	colorB?: string;
	baseColor?: string;
	upColor?: string;
	downColor?: string;
	leftColor?: string;
	rightColor?: string;
	intensity?: number;
	overlayColor?: string;
	overlayOpacity?: number;
}

export function ShaderBackground({
	colorA = "#080808",
	colorB = "#0a0a0a",
	baseColor = "#1a1a1a",
	upColor = "#0d0d0d",
	downColor = "#050505",
	leftColor = "#080808",
	rightColor = "#060606",
	intensity = 0.8,
	overlayColor = "#000000",
	overlayOpacity = 0.2,
}: ShaderBackgroundProps) {
	return (
		<div className="shader-background pointer-events-none fixed inset-0 z-0 hidden md:block">
			<Shader className="h-full w-full">
				{/* Layer 1: Swirl Effect */}
				<Swirl
					colorA={colorA}
					colorB={colorB}
					speed={0.6}
					detail={0.8}
					blend={40}
					coarseX={30}
					coarseY={30}
					mediumX={25}
					mediumY={25}
					fineX={20}
					fineY={20}
				/>
				{/* Layer 2: ChromaFlow Effect */}
				<ChromaFlow
					baseColor={baseColor}
					upColor={upColor}
					downColor={downColor}
					leftColor={leftColor}
					rightColor={rightColor}
					intensity={intensity}
					radius={1.9}
					momentum={28}
					maskType="alpha"
					opacity={0.88}
				/>
			</Shader>
			{/* Overlay keeps the decorative shader behind readable content. */}
			<div
				className="absolute inset-0"
				style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
			/>
		</div>
	);
}
