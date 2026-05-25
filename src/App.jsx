import React, { useEffect, useState } from 'react';
import WaterDropCanvas from './components/WaterDropCanvas';
import { DonationCard } from './components/ui/donation-card';
import './index.css';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="bubble-canvas-wrap">
          {ready && <WaterDropCanvas />}
        </div>
      </section>

      <section className="donate-section">
        <DonationCard />
      </section>

      {!ready && (
        <div className="loading-overlay">
          <div className="loader" />
        </div>
      )}
    </>
  );
}
