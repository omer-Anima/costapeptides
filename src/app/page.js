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

        {/* Why Choose Us */}
        <section className="features-section container">
          <div className="section-header">
            <h3>Why Buy Locally Instead of International Suppliers?</h3>
            <p>International sourcing can introduce uncertainty. As a local peptide supplier in Costa Rica, we eliminate international shipping issues.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <Clock className="feature-icon" />
              <h4>No cross-border delays</h4>
              <p>Ensuring faster delivery and consistent availability right here in Costa Rica.</p>
            </div>
            <div className="feature-card">
              <ShieldCheck className="feature-icon" />
              <h4>Fast, Safe & Secure Ordering</h4>
              <p>Place your orders with confidence using our streamlined payment process.</p>
            </div>
            <div className="feature-card">
              <Zap className="feature-icon" />
              <h4>No hidden import fees</h4>
              <p>Avoid unexpected customs costs. Our local distribution network ensures no international charges.</p>
            </div>
            <div className="feature-card">
              <MessageSquare className="feature-icon" />
              <h4>Professional service</h4>
              <p>We combine premium peptide quality with responsive customer service.</p>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="categories-preview-section">
          <div className="container">
            <div className="section-header">
              <h3>Targeted Research Applications</h3>
              <p>Peptides are studied for their specific effects in the body.</p>
            </div>
            
            <div className="categories-grid">
              <Link href="/catalog?category=Weight+Loss+%26+Metabolism" className="cat-preview-card">
                <div className="cat-icon-wrapper">⚖️</div>
                <h4>Weight Loss & Metabolism</h4>
              </Link>
              <Link href="/catalog?category=Anti-Aging+%26+Longevity" className="cat-preview-card">
                <div className="cat-icon-wrapper">✨</div>
                <h4>Anti-Aging & Skin</h4>
              </Link>
              <Link href="/catalog?category=Recovery+%26+Healing" className="cat-preview-card">
                <div className="cat-icon-wrapper">🛡️</div>
                <h4>Recovery & Tissue Support</h4>
              </Link>
              <Link href="/catalog?category=Performance+%26+Hormones" className="cat-preview-card">
                <div className="cat-icon-wrapper">💪</div>
                <h4>Performance & Muscle</h4>
              </Link>
              <Link href="/catalog?category=Cognitive+%26+Mood" className="cat-preview-card">
                <div className="cat-icon-wrapper">🧠</div>
                <h4>Cognitive & Focus</h4>
              </Link>
              <Link href="/catalog?category=Sexual+Health" className="cat-preview-card">
                <div className="cat-icon-wrapper">🔥</div>
                <h4>Hormonal Balance</h4>
              </Link>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/catalog" className="btn-outline">Explore Full Catalog</Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section container">
          <div className="section-header">
            <h3>Customer Success Stories</h3>
            <p>We take pride in the trust and loyalty of our customers across Costa Rica.</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"They have always delivered high-quality products that have significantly improved our research findings."</p>
              <div className="reviewer"><User size={14}/> Verified Customer</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"The level of customer support and technical advice we receive from their team is unmatched."</p>
              <div className="reviewer"><User size={14}/> Research Partner</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Timely delivery and seamless ordering experience helped us meet our project deadlines with ease."</p>
              <div className="reviewer"><User size={14}/> Return Buyer</div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section container">
          <div className="section-header">
            <h3>Common Questions</h3>
          </div>
          
          <div className="faq-list">
            <div className="faq-item">
              <h4>Do you ship internationally?</h4>
              <p>No. Peptides Costa Rica operates exclusively within Costa Rica. By serving only Costa Rica, we keep communication clear and deliver without customs issues.</p>
            </div>
            <div className="faq-item">
              <h4>Can I pay online?</h4>
              <p>Yes. We now provide a fast, safe, and secure online checkout system and accept SINPE Móvil, Zelle, PayPal, and Cash.</p>
            </div>
            <div className="faq-item">
              <h4>Do you offer bulk discounts?</h4>
              <p>Yes. Purchase five or more vials of the same product and receive 15% off.</p>
            </div>
            <div className="faq-item">
              <h4>How do I know what's in stock?</h4>
              <p>We always check that your items are in stock before you pay. You never pay for something we can't deliver.</p>
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
