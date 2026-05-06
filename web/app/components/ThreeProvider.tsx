'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeContext, ThreeContextValue } from '../context/ThreeContext';

export default function ThreeProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [threeCtx, setThreeCtx] = useState<ThreeContextValue | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- Scene, Camera, Renderer (global — initialized once) ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent — body CSS owns background

    // --- Star Background (global, persists across navigation) ---
    const starGroup = new THREE.Group();
    for (let i = 0; i < 800; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 32, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0x8b0e04 });
      const cube = new THREE.Mesh(geometry, material);

      let x = Math.random() * 300 - 150;
      let y = Math.random() * 300 - 150;

      if (Math.random() >= 0.5) {
        x /= 2;
        y /= 2;
      }

      cube.position.x = y;
      cube.position.y = x;
      cube.position.z = -40;

      starGroup.add(cube);
    }
    scene.add(starGroup);

    // --- Mouse tracking for star interaction ---
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // --- Resize handler ---
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- Animation loop ---
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      raycaster.setFromCamera(mouse, camera);
      starGroup.rotation.x = -mouse.y / 2;
      starGroup.rotation.y = mouse.x / 4;
      renderer.render(scene, camera);
    };
    animate();

    setThreeCtx({ scene, camera, renderer });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      // Dispose stars
      starGroup.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      scene.remove(starGroup);
      renderer.dispose();
    };
  }, []);

  return (
    <ThreeContext.Provider value={threeCtx}>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{ width: '100vw', height: '100vh', zIndex: 0 }}
        aria-hidden="true"
      />
      {children}
    </ThreeContext.Provider>
  );
}
