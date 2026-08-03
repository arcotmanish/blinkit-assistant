"use client";

import React, { useState, useEffect } from 'react';

interface Product {
  product_id: string;
  name: string;
  icon: string;
}

interface FeedbackSheetProps {
  isOpen: boolean;
  onClose: () => void;
  skippedProducts: Product[];
  goalId: string;
}

const REASONS = [
  "Too expensive",
  "Doesn't match my preference",
  "Didn't trust the brand",
  "Already have something similar",
  "Other"
];

export default function FeedbackSheet({
  isOpen,
  onClose,
  skippedProducts,
  goalId
}: FeedbackSheetProps) {
  // Track which reason is selected for which product
  const [selectedReasons, setSelectedReasons] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedReasons({});
      setShowToast(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectReason = async (productId: string, reason: string) => {
    // Update local state to highlight the pill
    setSelectedReasons(prev => ({
      ...prev,
      [productId]: reason
    }));

    // Send to API in background
    try {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          reason,
          goal_id: goalId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error(e);
    }

    // Wait 800ms, then close and show toast
    setTimeout(() => {
      onClose();
      // We show toast from the parent or from here?
      // "toast appears at bottom of screen... disappears after 2s".
      // We can manage the toast here but if we onClose(), this component might still be mounted.
      // Better to have the toast inside this component, fixed to bottom.
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }, 800);
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '390px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-main)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '24px 20px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        zIndex: 101,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Why did you skip these?</h2>
          <button 
            onClick={onClose}
            style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              backgroundColor: 'var(--bg-card)', border: 'none', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {skippedProducts.map(product => (
            <div key={product.product_id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '12px', 
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                }}>
                  {product.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{product.name}</h3>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {REASONS.map(reason => {
                  const isSelected = selectedReasons[product.product_id] === reason;
                  return (
                    <button
                      key={reason}
                      onClick={() => handleSelectReason(product.product_id, reason)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '20px',
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
            </div>
          ))}
        </div>
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
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          Thank you! This helps us improve 🙏
        </div>
      )}
    </>
  );
}
