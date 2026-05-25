import React, { useEffect, useState } from 'react';
import WaterDropCanvas from './components/WaterDropCanvas';
import { PricingInteraction } from './components/ui/pricing-interaction';
import './index.css';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <div className="bubble-canvas-wrap">
        {ready && <WaterDropCanvas />}
      </div>

      <div className="page">
        <section className="section" />

        <section
          className="relative min-h-screen flex items-center justify-center"
          style={{ pointerEvents: "auto" }}
        >
          <PricingInteraction />
        </section>
      </div>

      {!ready && (
        <div className="loading-overlay">
          <div className="loader" />
        </div>
      )}
    </>
  );
}
