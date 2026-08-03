"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  
  const total = searchParams.get('total') || '0';
  const count = searchParams.get('count') || '0';

  useEffect(() => {
    // Generate random 5-digit order number on mount
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    setOrderId(`#VEL-${randomNum}`);
  }, []);

  const handleGoHome = () => {
    // Hard refresh to clear all local state in app/page.tsx
    window.location.href = '/';
  };

  return (
    <main className="app-container" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-main)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '150px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(12,131,31,0.2) 0%, rgba(12,131,31,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Top Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'var(--bg-main)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <button 
          onClick={handleGoHome}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 0'
          }}
        >
          close
        </button>
        
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
          Order Confirmed
        </h1>
        
        {/* Placeholder for symmetry */}
        <div style={{ width: '40px' }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        
        {/* Checkmark */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          marginTop: '24px',
          boxShadow: '0 8px 32px rgba(12,131,31,0.4)'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        {/* Hero Text */}
        <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
            Thank you for your order!
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            Your delivery is on its way and will<br/>arrive in <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>12 minutes.</span>
          </p>
        </div>

        {/* Order Summary */}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          marginTop: '16px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Order Summary</span>
            <span style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600 }}>{orderId}</span>
          </div>

          {/* Items Row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{count} items in basket</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>View details</span>
              </div>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>₹{total}</span>
          </div>

          {/* Delivery Row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px',
            backgroundColor: 'rgba(245, 166, 35, 0.05)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-amber)' }}>HASSLE-FREE DELIVERY</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Driver will call upon arrival at your doorstep.</span>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>Invoice</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Download PDF</span>
          </div>
          
          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
            <span style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>Support</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>24/7 help desk</span>
          </div>
        </div>

      </div>

      {/* Fixed Bottom Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '390px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-main)',
        padding: '16px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--border-color)',
        zIndex: 50
      }}>
        <button 
          onClick={handleGoHome}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            width: '100%',
            fontWeight: 800,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          Go to Home
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
