import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let renderer, scene, camera, sphereBg, nucleus, stars, controls;
    const container = containerRef.current;
    const noise = createNoise3D();

    // Initialize scene
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 0, 230);

    const directionalLight = new THREE.DirectionalLight("#fff", 2);
    directionalLight.position.set(0, 50, -20);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight("#ffffff", 1);
    ambientLight.position.set(0, 20, 20);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // OrbitControl
    controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 4;
    controls.maxDistance = 350;
    controls.minDistance = 150;
    controls.enablePan = false;

    const loader = new THREE.TextureLoader();
    const textureSphereBg = loader.load('https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg');
    const texturenucleus = loader.load('https://i.ibb.co/hcN2qXk/star-nc8wkw.jpg');
    const textureStar = loader.load("https://i.ibb.co/ZKsdYSz/p1-g3zb2a.png");
    const texture1 = loader.load("https://i.ibb.co/F8by6wW/p2-b3gnym.png");
    const texture2 = loader.load("https://i.ibb.co/yYS2yx5/p3-ttfn70.png");
    const texture4 = loader.load("https://i.ibb.co/yWfKkHh/p4-avirap.png");

    // Nucleus
    texturenucleus.anisotropy = 16;
    const icosahedronGeometry = new THREE.IcosahedronGeometry(30, 10);
    const lambertMaterial = new THREE.MeshPhongMaterial({ map: texturenucleus });
    nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    scene.add(nucleus);

    // Sphere Background
    textureSphereBg.anisotropy = 12;
    const geometrySphereBg = new THREE.SphereGeometry(105, 40, 40);
    const materialSphereBg = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: textureSphereBg,
    });
    sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    scene.add(sphereBg);

    // Moving Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 50; i++) {
      const particleStar = randomPointSphere(150);
      particleStar.velocity = THREE.MathUtils.randInt(50, 200);
      particleStar.startX = particleStar.x;
      particleStar.startY = particleStar.y;
      particleStar.startZ = particleStar.z;
      starVertices.push(particleStar.x, particleStar.y, particleStar.z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 5,
      color: "#ffffff",
      transparent: true,
      opacity: 0.8,
      map: textureStar,
      blending: THREE.AdditiveBlending,
    });
    starsMaterial.depthWrite = false;
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    function randomPointSphere(radius) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const dx = 0 + (radius * Math.sin(phi) * Math.cos(theta));
      const dy = 0 + (radius * Math.sin(phi) * Math.sin(theta));
      const dz = 0 + (radius * Math.cos(phi));
      return new THREE.Vector3(dx, dy, dz);
    }

    function animate() {
      const positions = stars.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (0 - positions[i]) / stars.geometry.attributes.position.array[i + 2];
        positions[i + 1] += (0 - positions[i + 1]) / stars.geometry.attributes.position.array[i + 2];
        positions[i + 2] += (0 - positions[i + 2]) / stars.geometry.attributes.position.array[i + 2];
        positions[i + 2] -= 0.3;

        if (positions[i] <= 5 && positions[i] >= -5 && positions[i + 2] <= 5 && positions[i + 2] >= -5) {
          positions[i] = Math.random() * 300 - 150;
          positions[i + 1] = Math.random() * 300 - 150;
          positions[i + 2] = Math.random() * 300 - 150;
        }
      }

      nucleus.geometry.attributes.position.needsUpdate = true;
      nucleus.rotation.y += 0.002;

      sphereBg.rotation.x += 0.002;
      sphereBg.rotation.y += 0.002;
      sphereBg.rotation.z += 0.002;

      controls.update();
      stars.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    function onWindowResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener("resize", onWindowResize);
    animate();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeDBackground;
