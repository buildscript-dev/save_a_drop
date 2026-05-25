import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VS = /* glsl */`
  uniform float uT;
  uniform float uRipple;
  uniform vec2  uRipplePos;
  uniform float uPress;
  uniform float uHover;

  varying vec3  vN;
  varying vec3  vP;
  varying vec2  vUv;
  varying float vFresnel;

  void main() {
    vUv = uv;

    float beat   = sin(uT * 1.20);
    float breath = beat            * 0.0055
                 + sin(uT * 2.40) * 0.0022
                 + sin(uT * 0.55) * 0.0015;

    float d  = distance(uv, uRipplePos);
    float rw = sin(d * 28.0 - uT * 7.0) * exp(-d * 10.0) * uRipple * 0.008;

    float wob = sin(position.y * 6.0 + uT * 1.2) * 0.003 * uPress;

    float hov = sin(position.x * 8.0 + uT * 2.5)
              * sin(position.y * 8.0 - uT * 2.0) * 0.002 * uHover;

    vec3 pos = position + normal * (breath + rw + wob + hov);

    vN = normal;
    vP = pos;

    vec3  viewDir  = normalize(cameraPosition - pos);
    float cosTheta = max(dot(normal, viewDir), 0.0);
    vFresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 4.5);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FS = /* glsl */`
  precision highp float;

  uniform float uT;
  uniform float uRipple;
  uniform float uPress;
  uniform float uHover;

  varying vec3  vN;
  varying vec3  vP;
  varying vec2  vUv;
  varying float vFresnel;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 17.5);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),             hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.1 + vec2(1.3, 0.7); a *= 0.5; }
    return v;
  }

  void main() {
    vec3 n    = normalize(vN);
    vec3 view = normalize(-vP);

    if (!gl_FrontFacing) {
      float innerCos = max(dot(-n, view), 0.0);
      float backFr   = pow(1.0 - innerCos, 5.0);
      float backFr2  = backFr * backFr;
      vec3  backCol  = vec3(0.686, 0.878, 0.906) * backFr * 0.55;
      float backAlpha = backFr2 * backFr * 0.22;
      gl_FragColor = vec4(backCol, backAlpha);
      return;
    }

    vec3 l1 = normalize(vec3( 2.5,  3.0,  2.5));
    vec3 l2 = normalize(vec3(-2.0,  1.5, -1.5));

    vec3  h1  = normalize(l1 + view);
    float s1  = pow(max(dot(n, h1), 0.0), 900.0) * 4.50;
    float s1b = pow(max(dot(n, h1), 0.0),  65.0) * 0.38;
    vec3  h2  = normalize(l2 + view);
    float s2  = pow(max(dot(n, h2), 0.0), 220.0) * 0.42;

    vec2  refractUV = vUv + n.xy * 0.04;
    float iFlow     = fbm(refractUV * 4.0 + uT * 0.07) * 0.04;
    float rFlow     = fbm(refractUV * 9.0 + uT * 0.30 * (1.0 + uRipple)) * 0.07 * uRipple;

    float caus1   = abs(sin(vUv.x * 58.0 + vUv.y * 43.0 + uT * 0.95));
    float caus2   = abs(sin(vUv.x * 78.0 - vUv.y * 52.0 - uT * 0.72));
    float caustic = pow(caus1, 46.0) * 0.16 + pow(caus2, 52.0) * 0.10;
    caustic *= (1.0 + uRipple * 0.9);

    float spark = vnoise(vUv * 80.0 + uT * 0.35) * vnoise(vUv * 120.0 - uT * 0.42);
    spark = pow(spark, 8.0) * 0.12;

    float fr  = vFresnel;
    float fr2 = fr * fr;
    float fr4 = fr2 * fr2;

    float hGlow = fr2 * 0.30 * uHover;
    float pGlow = fr  * 0.35 * uPress;

    vec3 brandCol = vec3(0.686, 0.878, 0.906); /* ← change sphere colour here (#afe0e7) */

    vec3 rim =
        vec3(0.22, 0.55, 1.00) * fr   * 0.70
      + vec3(0.45, 0.78, 1.00) * fr2  * 1.10
      + brandCol               * fr4  * 1.05;

    vec3 interior = vec3(0.15, 0.42, 1.00) * 0.12
                  + vec3(0.30, 0.62, 1.00) * (iFlow + rFlow + caustic * 0.40) * 0.65;

    vec3 iGlow = vec3(0.35, 0.68, 1.00) * (hGlow + pGlow);

    vec3 col =
        interior
      + rim
      + iGlow
      + brandCol               * (s1 + s1b + s2)
      + vec3(0.40, 0.72, 1.00) * caustic * 0.75
      + brandCol               * spark  * 0.75;

    float alpha =
        0.06
      + fr2  * 0.72
      + fr4  * 0.26
      + s1   * 0.84
      + s1b  * 0.16
      + s2   * 0.12
      + caustic  * 0.07
      + spark    * 0.05
      + (iFlow + rFlow) * 0.05
      + hGlow    * 0.24
      + pGlow    * 0.24
      + uPress   * 0.06;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

const WaterDropCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
    mount.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.z = 3.2;

    const geo = new THREE.SphereGeometry(0.22, 192, 192);
    const mat = new THREE.ShaderMaterial({
      vertexShader:   VS,
      fragmentShader: FS,
      uniforms: {
        uT:         { value: 0 },
        uRipple:    { value: 0 },
        uRipplePos: { value: new THREE.Vector2(0.5, 0.5) },
        uPress:     { value: 0 },
        uHover:     { value: 0 },
      },
      transparent: true,
      depthWrite:  false,
      side: THREE.DoubleSide,
    });
    const drop = new THREE.Mesh(geo, mat);
    drop.position.set(0, 0, 0);
    scene.add(drop);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const pl1 = new THREE.PointLight(0xffffff, 2.0, 40); pl1.position.set( 2.5,  3.5,  2.5); scene.add(pl1);
    const pl2 = new THREE.PointLight(0xffffff, 0.6, 25); pl2.position.set(-2.5,  1.5, -2.0); scene.add(pl2);
    const pl3 = new THREE.PointLight(0xffffff, 0.3, 20); pl3.position.set( 0.0, -3.0,  2.0); scene.add(pl3);

    const raycaster = new THREE.Raycaster();
    const pointer   = new THREE.Vector2();

    let t = 0;
    let ripple = 0, press = 0, hover = 0, targetHover = 0;
    let rotX = 0, rotY = 0, tRotX = 0, tRotY = 0;
    let velX = 0, velY = 0;
    let mx = 0, my = 0;
    let dragging = false, lastMx = 0, lastMy = 0;
    let scrollY      = 0;
    let targetDropY  = 0;
    let currentDropY = 0;
    let scrollRippleCooldown = 0;
    let zoom = 1.0, targetZoom = 1.0;
    let animId;

    const ndcX = cx => (cx / W) *  2 - 1;
    const ndcY = cy => (cy / H) * -2 + 1;

    const isHit = (cx, cy) => {
      pointer.set(ndcX(cx), ndcY(cy));
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObject(drop).length > 0;
    };

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };

    const onMouseMove = e => {
      mx = ndcX(e.clientX);
      my = ndcY(e.clientY);
      targetHover = isHit(e.clientX, e.clientY) ? 1 : 0;
      if (dragging) {
        velX = (e.clientX - lastMx) * 0.006;
        velY = (e.clientY - lastMy) * 0.006;
        lastMx = e.clientX; lastMy = e.clientY;
      }
    };

    const onMouseDown = e => {
      if (!isHit(e.clientX, e.clientY)) return;
      dragging = true; lastMx = e.clientX; lastMy = e.clientY;
      mat.uniforms.uRipplePos.value.set(e.clientX / W, 1 - e.clientY / H);
      ripple = 1.2; press = 1.0;
    };

    const onMouseUp    = () => { dragging = false; };
    const onMouseLeave = () => { dragging = false; };

    const onWheel = e => {
      if (targetHover > 0.5) {
        targetZoom = Math.max(1.0, Math.min(3.5, targetZoom - e.deltaY * 0.003));
      } else if (scrollRippleCooldown <= 0) {
        ripple = Math.min(ripple + Math.abs(e.deltaY) * 0.004, 1.5);
        mat.uniforms.uRipplePos.value.set(0.5, 0.5);
        scrollRippleCooldown = 12;
      }
    };

    const onScroll = () => {
      const newY = window.scrollY;
      const delta = newY - scrollY;
      scrollY = newY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress  = maxScroll > 0 ? scrollY / maxScroll : 0;
      targetDropY = -progress * 0.28;
      if (Math.abs(delta) > 8 && scrollRippleCooldown <= 0) {
        ripple = Math.min(ripple + 0.4, 1.5);
        mat.uniforms.uRipplePos.value.set(0.5, 0.5);
        scrollRippleCooldown = 8;
      }
    };

    const onTouchStart = e => {
      const t0 = e.touches[0];
      if (!isHit(t0.clientX, t0.clientY)) return;
      dragging = true; lastMx = t0.clientX; lastMy = t0.clientY;
      ripple = 1.2; press = 1.0;
    };
    const onTouchMove = e => {
      if (!dragging) return;
      const t0 = e.touches[0];
      velX = (t0.clientX - lastMx) * 0.006;
      velY = (t0.clientY - lastMy) * 0.006;
      lastMx = t0.clientX; lastMy = t0.clientY;
    };
    const onTouchEnd = () => { dragging = false; };

    window.addEventListener('resize',     onResize);
    window.addEventListener('mousemove',  onMouseMove,  { passive: true });
    window.addEventListener('mousedown',  onMouseDown,  { passive: true });
    window.addEventListener('mouseup',    onMouseUp,    { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('wheel',      onWheel,      { passive: true });
    window.addEventListener('scroll',     onScroll,     { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.016;
      mat.uniforms.uT.value = t;

      ripple *= 0.965;
      press  *= 0.920;
      hover  += (targetHover - hover) * 0.08;
      if (scrollRippleCooldown > 0) scrollRippleCooldown--;

      mat.uniforms.uRipple.value = ripple;
      mat.uniforms.uPress.value  = press;
      mat.uniforms.uHover.value  = hover;

      if (dragging) {
        tRotY += velX; tRotX += velY;
      } else {
        velX *= 0.96; velY *= 0.96;
        tRotY += velX; tRotX += velY;
        tRotY += mx * 0.010 - tRotY * 0.0015;
        tRotX += my * 0.007 - tRotX * 0.0015;
      }
      rotX += (tRotX - rotX) * 0.055;
      rotY += (tRotY - rotY) * 0.055;
      drop.rotation.x = rotX;
      drop.rotation.y = rotY;

      const beat    = Math.sin(t * 1.20);
      const beat2   = Math.sin(t * 2.40) * 0.35;
      const longW   = Math.sin(t * 0.55) * 0.20;
      const breathe = 1 + (beat + beat2 + longW) * 0.052 + press * 0.022;
      const flutter = hover * Math.sin(t * 4.2) * 0.008;

      if (targetHover < 0.1) targetZoom += (1.0 - targetZoom) * 0.06;
      zoom += (targetZoom - zoom) * 0.07;

      drop.scale.setScalar((breathe + flutter) * zoom);

      currentDropY += (targetDropY - currentDropY) * 0.04;
      drop.position.y = currentDropY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize',     onResize);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mouseup',    onMouseUp);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('scroll',     onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
      if (mount.contains(canvas)) mount.removeChild(canvas);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
};

export default WaterDropCanvas;
