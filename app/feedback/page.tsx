"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import productsData from '@/data/products.json';

const REASONS = [
  "Too expensive",
  "Doesn't match my preference",
  "Didn't trust the brand",
  "Already have something similar",
  "Other"
];

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [skippedProducts, setSkippedProducts] = useState<any[]>([]);
  const [goalId, setGoalId] = useState<string>('');
  
  // Track selected reason and free text per product
  const [selectedReasons, setSelectedReasons] = useState<Record<string, string>>({});
  const [freeTexts, setFreeTexts] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const cartParam = searchParams.get('cart');
    const recsParam = searchParams.get('recs');
    const goalParam = searchParams.get('goal');
    const opt4Param = searchParams.get('opt4');
    
    setGoalId(goalParam || '');
    
    const parsedRecs = recsParam ? recsParam.split(',') : [];
    const parsedOpt4 = opt4Param ? opt4Param.split(',') : [];
    
    const parsedCart: Record<string, number> = {};
    if (cartParam) {
      cartParam.split(',').forEach(item => {
        const [id, qty] = item.split(':');
        if (id && qty) {
          parsedCart[id] = parseInt(qty, 10);
        }
      });
    }

    // Skipped = in recs, NOT in cart, NOT in opt4. (Max 2)
    const skippedIds = parsedRecs.filter(id => !parsedCart[id] && !parsedOpt4.includes(id)).slice(0, 2);
    const skipped = skippedIds.map(id => productsData.find(p => p.product_id === id)).filter(Boolean);
    setSkippedProducts(skipped);
  }, [searchParams]);

  const handleSelectReason = (productId: string, reason: string) => {
    setSelectedReasons(prev => ({
      ...prev,
      [productId]: reason
    }));
  };

  const handleTextChange = (productId: string, text: string) => {
    setFreeTexts(prev => ({
      ...prev,
      [productId]: text
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Only submit feedback for products where a reason was selected
    const submissions = Object.entries(selectedReasons).map(([productId, reason]) => {
      return fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          reason,
          free_text: freeTexts[productId] || '',
          goal_id: goalId,
          timestamp: new Date().toISOString()
        })
      });
    });

    try {
      await Promise.all(submissions);
    } catch (e) {
      console.error("Feedback submission error:", e);
    }

    setIsSubmitting(false);
    setShowToast(true);
    
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  return (
    <main className="app-container" style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-main)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <button 
          onClick={() => router.back()}
          style={{
            background: 'var(--bg-card)',
            border: 'none',
            color: 'var(--color-primary)',
            width: '36px', height: '36px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
          Help us improve
        </h1>
        
        {/* Placeholder for symmetry */}
        <div style={{ width: '36px' }}></div>
      </div>

      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {skippedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            No skipped products to review.
          </div>
        ) : (
          skippedProducts.map(product => (
            <div key={product.product_id} style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                }}>
                  {product.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{product.name}</h3>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {REASONS.map(reason => {
                  const isSelected = selectedReasons[product.product_id] === reason;
                  return (
                    <button
                      key={reason}
                      onClick={() => handleSelectReason(product.product_id, reason)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '24px',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                        color: isSelected ? '#000' : 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>

              <textarea
                placeholder="Tell us about it..."
                value={freeTexts[product.product_id] || ''}
                onChange={(e) => handleTextChange(product.product_id, e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  minHeight: '80px',
                  marginTop: '8px'
                }}
              />
            </div>
          ))
        )}
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
          onClick={handleSubmit}
          disabled={Object.keys(selectedReasons).length === 0 || isSubmitting}
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
            cursor: (Object.keys(selectedReasons).length === 0 || isSubmitting) ? 'not-allowed' : 'pointer',
            opacity: (Object.keys(selectedReasons).length === 0 || isSubmitting) ? 0.5 : 1
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '100px', // above the bottom nav/action bar
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fff',
          color: '#000',
          padding: '12px 20px',
          borderRadius: '24px',
          fontWeight: 600,
          fontSize: '14px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 0.3s ease-out',
          whiteSpace: 'nowrap'
        }}>
          Thank you! This helps us improve 🙏
        </div>
      )}
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>}>
      <FeedbackContent />
    </Suspense>
  );
}
