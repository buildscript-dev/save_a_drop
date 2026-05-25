import React, { useEffect, useRef } from 'react';
import { Water } from '../water.js';

/**
 * WaterBackground
 * Full-screen animated water canvas that sits behind all content.
 * pointer-events:none — the Water class listens on window instead.
 */
const WaterBackground = ({ colors }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const water = new Water(canvas, colors ?? {});
    return () => water.destroy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      id="water-bg"
      aria-hidden="true"
    />
  );
};

export default WaterBackground;
