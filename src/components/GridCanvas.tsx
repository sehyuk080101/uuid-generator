"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "@/shaders/grid";

const SPACING = 0.35;
const COLS = 80;
const ROWS = 50;

export default function GridCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x0b0b0b, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 14);

    const count = COLS * ROWS;
    const positions = new Float32Array(count * 3);
    const baseXArr = new Float32Array(count);
    const baseYArr = new Float32Array(count);

    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = (c - COLS / 2) * SPACING;
        const y = (r - ROWS / 2) * SPACING;
        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = 0;
        baseXArr[idx] = x;
        baseYArr[idx] = y;
        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aBaseX", new THREE.BufferAttribute(baseXArr, 1));
    geometry.setAttribute("aBaseY", new THREE.BufferAttribute(baseYArr, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 1.8 * renderer.getPixelRatio() },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(-999, -999) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const mouse = new THREE.Vector2(-999, -999);
    const smoothMouse = new THREE.Vector2(-999, -999);
    let rawX = -999;
    let rawY = -999;

    const reset = () => {
      rawX = -999;
      rawY = -999;
      mouse.set(-999, -999);
      smoothMouse.set(-999, -999);
    };

    const onMouseMove = (e: MouseEvent) => {
      rawX = e.clientX;
      rawY = e.clientY;
      mouse.x = (rawX / window.innerWidth) * 2 - 1;
      mouse.y = -((rawY / window.innerHeight) * 2 - 1);
      if (smoothMouse.x === -999) smoothMouse.copy(mouse);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", reset);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let rafId = 0;
    const startTime = performance.now();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      material.uniforms.uTime.value = (performance.now() - startTime) / 1000;

      if (
        rawX < 0 ||
        rawX > window.innerWidth ||
        rawY < 0 ||
        rawY > window.innerHeight
      ) {
        mouse.set(-999, -999);
        smoothMouse.set(-999, -999);
      }

      smoothMouse.lerp(mouse, 0.06);
      material.uniforms.uMouse.value.copy(smoothMouse);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", reset);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
