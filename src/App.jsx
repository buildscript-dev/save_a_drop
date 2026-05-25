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
    <div className="min-h-screen bg-[#02030A] flex flex-col">
      <section className="hero-section">
        <div className="bubble-canvas-wrap">
          {ready && <WaterDropCanvas />}
        </div>
      </section>

      <section className="donate-section">
        <div className="donate-bg-glow" />
        <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center justify-center gap-8">
          <div className="donate-header">
            <p className="donate-eyebrow">Pure Water For All</p>
            <h1 className="donate-title text-center">Support clean water</h1>
            <p className="donate-subtitle text-center">Every drop counts in the fight against water scarcity. Your small contribution can change a life.</p>
          </div>
          <DonationCard />
          <div className="donate-footnote">
            © {new Date().getFullYear()} Orate Love. All rights reserved.
          </div>
        </div>
      </section>

      {!ready && (
        <div className="loading-overlay">
          <div className="loader" />
        </div>
      )}
    </div>
  );
}
