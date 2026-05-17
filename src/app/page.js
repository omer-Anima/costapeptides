"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShieldCheck, Clock, Zap, Target, Leaf, CheckCircle,
  MessageSquare, User, TrendingUp, Settings
} from 'lucide-react';

export default function LandingPage() {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeToggle = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.setAttribute('data-theme', selectedTheme);
  };

  return (
    <div className="landing-layout min-h-screen">
      {/* Landing Header */}
      <header className="header landing-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="theme-toggle">
            <button onClick={() => handleThemeToggle('light')} className={theme === 'light' ? 'active' : ''} title="Light Mode">☀️</button>
            <button onClick={() => handleThemeToggle('dark')} className={theme === 'dark' ? 'active' : ''} title="Dark Mode">🌙</button>
          </div>
          
          <a href="/" className="logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src="/logo_transparent.png" 
              alt="Peptides Costa Rica Logo" 
              className="logo-img-custom"
              style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain' }}
            />
          </a>

          <div className="landing-nav-actions" style={{ display: 'flex', gap: '12px' }}>
            <Link href="/catalog" className="landing-btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Shop <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container hero-content">
            <div className="hero-badge">Verified Local Supplier</div>
            <h1 className="hero-title">Buy Peptides Costa Rica</h1>
            <h2 className="hero-subtitle">Lab-Tested, High Purity Peptides</h2>
            <p className="hero-text">
              Welcome to Peptides Costa Rica, your local source for premium peptides, offering high-quality, research-grade peptide products with reliable delivery.
            </p>
            <div className="hero-actions">
              <Link href="/catalog" className="btn-hero-primary">
                Browse All Products <ArrowRight size={18} />
              </Link>
              <Link href="/admin" className="btn-hero-secondary">
                <Settings size={18} /> Admin Portal
              </Link>
            </div>
            
            <div className="hero-features-row">
              <span><CheckCircle size={14} color="#4ade80" /> Verified Quality</span>
              <span><CheckCircle size={14} color="#4ade80" /> Transparent Pricing</span>
              <span><CheckCircle size={14} color="#4ade80" /> Local Reliability</span>
            </div>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: '0' }}>
        <div className="container">
          <img src="/logo_transparent.png" alt="Logo" style={{ height: '40px', marginBottom: '16px', opacity: 0.8 }} />
          <p>Peptides Costa Rica offers premium, research-backed peptides with trusted quality and bulk savings.</p>
          
          <div className="footer-links" style={{ marginBottom: '24px' }}>
            <Link href="/catalog">Shop Catalog</Link>
            <Link href="/admin">Admin Portal</Link>
            <a href="mailto:info@peptidescostarica.net">info@peptidescostarica.net</a>
            <a href="tel:+50684046973">CR: +506 8404-6973</a>
          </div>
          
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Peptides Costa Rica. All rights reserved. For research purposes.
          </div>
        </div>
      </footer>
    </div>
  );
}
