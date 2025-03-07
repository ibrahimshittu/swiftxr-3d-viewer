"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelCenterRef = useRef(new THREE.Vector3(0, 0, 0));
  const modelTopRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const hotspotRef = useRef<HTMLDivElement>(null);

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    if (modelUrl) {
      loader.load(
        modelUrl,
        (gltf: any) => {
          const model = gltf.scene;
          model.position.y -= 0.2;
          scene.add(model);

          setModelName(model.name || "My Model");

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());

          modelCenterRef.current.copy(center);

          const right = center.clone().add(new THREE.Vector3(size / 2, 0, 0));

          modelTopRef.current.copy(right);

          controls.reset();
          camera.near = size / 100;
          camera.far = size * 100;
          camera.updateProjectionMatrix();

          camera.position.copy(center);
          camera.position.x += size / 2.0;
          camera.position.y += size;
          camera.position.z += size / 2.0;
          camera.lookAt(center);
        },
        undefined,
        (error: unknown) => {
          toast.error("Error loading GLTF file, please try again.");
          console.error("Error loading GLTF:", error);
        }
      );
    }

    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);

      if (hotspotRef.current && modelUrl) {
        positionHotspot();
      }
    };
    animate();

    return () => {
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [modelUrl]);

  const positionHotspot = () => {
    if (
      !cameraRef.current ||
      !sceneRef.current ||
      !containerRef.current ||
      !hotspotRef.current
    )
      return;

    const camera = cameraRef.current;
    const container = containerRef.current;
    const hotspotEl = hotspotRef.current;

    const worldPos = modelTopRef.current.clone();

    worldPos.project(camera);

    const x = (worldPos.x * 0.5 + 0.5) * container.clientWidth;
    const y = (-worldPos.y * 0.5 + 0.5) * container.clientHeight;

    hotspotEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="bg-gray-800 text-white p-2 px-6 flex items-center justify-start">
        <Image
          src="/swiftxr-logo.png"
          alt="SwiftXR Logo"
          width={60}
          height={16}
        />
        <h1 className="text-2xl font-bold">
          SwiftXR
          <span className="text-sm font-normal"> 3D Viewer</span>
        </h1>
      </header>

      <Card className="absolute top-[92px] left-4 z-10">
        <CardHeader>
          <CardTitle>Upload Model</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".glb" onChange={handleFileChange} />
        </CardContent>
      </Card>

      <main className="flex-1 relative" ref={containerRef}>
        {!modelUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-gray-600">Please upload a .GLB file.</p>
          </div>
        )}

        {modelUrl && (
          <div
            ref={hotspotRef}
            className="absolute hidden md:flex flex-row items-center space-x-2 pointer-events-none"
          >
            <div className="w-3 h-3 rounded-full border-1 border-gray-800 bg-white opacity-90 flex items-center justify-center" />

            <div className="px-1 py-0 rounded border-1 border-gray-800 bg-white text-black text-xs opacity-90">
              {modelName || "My Model"}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
