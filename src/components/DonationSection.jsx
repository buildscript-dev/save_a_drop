import { motion } from 'framer-motion';
import { Droplets, Waves, Globe, ArrowRight } from 'lucide-react';

const TIERS = [
  {
    id: 'droplet',
    icon: Droplets,
    label: 'A Droplet',
    amount: '$5',
    description: 'Provides clean drinking water for one person for a full week.',
    cta: 'Give a Droplet',
  },
  {
    id: 'stream',
    icon: Waves,
    label: 'A Stream',
    amount: '$25',
    description: 'Funds a household water filter lasting up to five years.',
    cta: 'Give a Stream',
    featured: true,
  },
  {
    id: 'ocean',
    icon: Globe,
    label: 'An Ocean',
    amount: '$100',
    description: 'Plants a community well serving more than fifty people.',
    cta: 'Give an Ocean',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export default function DonationSection() {
  return (
    <section className="donate-section">
      <div className="donate-bg-glow" />

      <motion.div
        className="donate-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={headingVariants}
      >
        <p className="donate-eyebrow">Save A Drop</p>
        <h2 className="donate-title">Every ripple starts<br />with a single drop.</h2>
        <p className="donate-subtitle">
          Your contribution creates waves that reach further than you can imagine.
        </p>
      </motion.div>

      <div className="donate-cards">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.id}
              className={`donate-card${tier.featured ? ' donate-card--featured' : ''}`}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
            >
              {tier.featured && <span className="donate-badge">Most Impact</span>}

              <div className="donate-icon-wrap">
                <Icon size={22} strokeWidth={1.4} />
              </div>

              <p className="donate-tier-label">{tier.label}</p>
              <p className="donate-amount">{tier.amount}</p>
              <p className="donate-desc">{tier.description}</p>

              <motion.button
                className="donate-btn"
                whileHover={{ gap: '10px' }}
                whileTap={{ scale: 0.97 }}
              >
                {tier.cta}
                <ArrowRight size={14} strokeWidth={1.8} />
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="donate-footnote"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: 1, delay: 0.5 } }}
        viewport={{ once: true }}
      >
        100% of proceeds go directly to clean water initiatives worldwide.
      </motion.p>
    </section>
  );
}
