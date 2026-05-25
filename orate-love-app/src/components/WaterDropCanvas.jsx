// WaterDropCanvas.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  uniform float uT;
  uniform float uRipple;
  uniform vec2 uRipplePos;
  uniform float uPress;
  varying vec3 vN;
  varying vec3 vP;
  varying vec2 vUv;
  
  void main(){
    vUv = uv;
    vN = normal;
    vP = position;
    vec3 pos = position;
    // apply ripple effect
    float d = distance(uv, uRipplePos);
    pos.z += sin((d - uRipple) * 10.0 - uT * 5.0) * 0.1;
    // press effect
    pos.z += uPress * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vN;
  varying vec3 vP;
  varying vec2 vUv;
  void main(){
    // simple water colour with lighting approximation
    float shade = dot(normalize(vN), vec3(0.0,0.0,1.0))*0.5+0.5;
    gl_FragColor = vec4(0.0, 0.3, 0.6, 1.0) * shade;
  }
`;

export default function WaterDropCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2, 200, 200);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uT: { value: 0 },
        uRipple: { value: 0 },
        uRipplePos: { value: new THREE.Vector2(0.5, 0.5) },
        uPress: { value: 0 }
      },
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    let start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000;
      material.uniforms.uT.value = elapsed;
      renderer.render(scene, camera);
    };
    const raf = renderer.setAnimationLoop(animate);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // simple interaction: click creates ripple
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      material.uniforms.uRipplePos.value.set(x, y);
      material.uniforms.uRipple.value = 0;
      // animate ripple value
      const rippleStart = Date.now();
      const rippleAnim = () => {
        const t = (Date.now() - rippleStart) / 500;
        material.uniforms.uRipple.value = t * Math.PI * 2;
        if (t < 1) requestAnimationFrame(rippleAnim);
      };
      rippleAnim();
    };
    renderer.domElement.addEventListener('pointerdown', onClick);

    return () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener('pointerdown', onClick);
      window.removeEventListener('resize', onResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
}
