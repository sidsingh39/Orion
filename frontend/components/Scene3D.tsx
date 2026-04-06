"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

/**
 * Central ORION visual core
 * Premium restrained motion — no neon sci-fi dominance
 */
function HolographicCore({ isDark }: { isDark: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    // ORION palette aligned colors
    const wireframeColor = isDark ? "#b68c24" : "#8a6a22";
    const coreColor = isDark ? "#d4af37" : "#b68c24";
    const ring1Color = isDark ? "#caa84a" : "#8a6a22";
    const ring2Color = isDark ? "#8a6a22" : "#b68c24";
    const particleColor = isDark ? "#f5efe2" : "#2a2118";

    useFrame((state) => {
        if (groupRef.current) {
            // Slow premium motion — deliberate, not flashy
            groupRef.current.rotation.y += 0.0025;
            groupRef.current.rotation.z =
                Math.sin(state.clock.getElapsedTime() * 0.18) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>

            {/* Outer wireframe shell */}
            <mesh>
                <icosahedronGeometry args={[1.2, 2]} />
                <meshBasicMaterial
                    color={wireframeColor}
                    wireframe
                    transparent
                    opacity={0.18}
                />
            </mesh>

            {/* Inner core */}
            <mesh>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshBasicMaterial
                    color={coreColor}
                    transparent
                    opacity={0.18}
                />
            </mesh>

            {/* Ring layer 1 */}
            <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[1.8, 0.018, 16, 100]} />
                <meshBasicMaterial
                    color={ring1Color}
                    transparent
                    opacity={0.22}
                />
            </mesh>

            {/* Ring layer 2 */}
            <mesh rotation={[-Math.PI / 3, 0, 0]}>
                <torusGeometry args={[2.2, 0.018, 16, 100]} />
                <meshBasicMaterial
                    color={ring2Color}
                    transparent
                    opacity={0.16}
                />
            </mesh>

            {/* Floating particles */}
            <points>
                <sphereGeometry args={[2.5, 64, 64]} />
                <pointsMaterial
                    color={particleColor}
                    size={0.012}
                    transparent
                    opacity={0.12}
                />
            </points>
        </group>
    );
}

/**
 * Soft star field
 * Subtle interaction only — background support, never visual competition
 */
function MovingStars({ isDark }: { isDark: boolean }) {
    const count = 1600;
    const mesh = useRef<THREE.Points>(null);
    const { viewport, mouse } = useThree();

    const [positions, velocities, originalPositions] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);
        const orig = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 10;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            orig[i * 3] = x;
            orig[i * 3 + 1] = y;
            orig[i * 3 + 2] = z;

            vel[i * 3] = 0;
            vel[i * 3 + 1] = 0;
            vel[i * 3 + 2] = 0;
        }

        return [pos, vel, orig];
    }, []);

    useFrame(() => {
        if (!mesh.current) return;

        const mouseX = (mouse.x * viewport.width) / 2;
        const mouseY = (mouse.y * viewport.height) / 2;

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;

            const px = positions[ix];
            const py = positions[iy];

            const dx = mouseX - px;
            const dy = mouseY - py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const radius = 4;

            if (dist < radius) {
                const force = (radius - dist) / radius;
                const angle = Math.atan2(dy, dx);

                velocities[ix] -= Math.cos(angle) * force * 0.01;
                velocities[iy] -= Math.sin(angle) * force * 0.01;
            }

            const ox = originalPositions[ix];
            const oy = originalPositions[iy];

            velocities[ix] += (ox - px) * 0.004;
            velocities[iy] += (oy - py) * 0.004;

            positions[ix] += velocities[ix];
            positions[iy] += velocities[iy];

            velocities[ix] *= 0.94;
            velocities[iy] *= 0.94;
        }

        mesh.current.geometry.attributes.position.needsUpdate = true;
        mesh.current.rotation.y += 0.00025;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[positions, 3]}
                />
            </bufferGeometry>

            <pointsMaterial
                size={0.025}
                color={isDark ? "#f5efe2" : "#2a2118"}
                transparent
                opacity={isDark ? 0.18 : 0.10}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

/**
 * ORION 3D background scene
 * Luxury subtle depth — not sci-fi centerpiece
 */
export default function Scene3D() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>

                {/* Soft lighting */}
                <ambientLight intensity={0.45} />

                <pointLight
                    position={[10, 10, 10]}
                    intensity={0.45}
                    color={isDark ? "#b68c24" : "#8a6a22"}
                />

                <pointLight
                    position={[-10, -10, -10]}
                    intensity={0.20}
                    color={isDark ? "#d4af37" : "#b68c24"}
                />

                <HolographicCore isDark={isDark} />
                <MovingStars isDark={isDark} />
            </Canvas>
        </div>
    );
}