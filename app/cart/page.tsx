"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import productsData from '@/data/products.json';

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  
  const [recs, setRecs] = useState<string[]>([]);
  const [opt4, setOpt4] = useState<string[]>([]);
  const [goalId, setGoalId] = useState<string>('');
  
  const [skippedProducts, setSkippedProducts] = useState<any[]>([]);

  useEffect(() => {
    // Parse URL params
    const cartParam = searchParams.get('cart');
    const recsParam = searchParams.get('recs');
    const goalParam = searchParams.get('goal');
    const opt4Param = searchParams.get('opt4');
    
    setGoalId(goalParam || '');
    
    const parsedRecs = recsParam ? recsParam.split(',') : [];
    setRecs(parsedRecs);
    
    const parsedOpt4 = opt4Param ? opt4Param.split(',') : [];
    setOpt4(parsedOpt4);
    
    const parsedCart: Record<string, number> = {};
    if (cartParam) {
      cartParam.split(',').forEach(item => {
        const [id, qty] = item.split(':');
        if (id && qty) {
          parsedCart[id] = parseInt(qty, 10);
        }
      });
    }
    setCart(parsedCart);
  }, [searchParams]);

  useEffect(() => {
    // Derive cart products
    const items = Object.keys(cart).map(id => productsData.find(p => p.product_id === id)).filter(Boolean);
    setCartProducts(items);
    
    // Derive skipped products
    // Skipped = in recs, NOT in cart, NOT in opt4. (Max 2)
    const skippedIds = recs.filter(id => !cart[id] && !opt4.includes(id)).slice(0, 2);
    const skipped = skippedIds.map(id => productsData.find(p => p.product_id === id)).filter(Boolean);
    setSkippedProducts(skipped);
    
  }, [cart, recs, opt4]);

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      
      const newCart = { ...prev };
      if (next <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = next;
      }
      return newCart;
    });
  };

  const totalPrice = cartProducts.reduce((sum, product) => {
    const qty = cart[product.product_id] || 0;
    return sum + (product.price_inr * qty);
  }, 0);

  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <main className="app-container" style={{ paddingBottom: '100px' }}>
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
        
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
          Checkout
        </h1>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            background: 'var(--bg-card)', border: 'none', color: 'var(--color-primary)',
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button style={{
            background: 'var(--bg-card)', border: 'none', color: 'var(--color-primary)',
            height: '36px', padding: '0 12px', borderRadius: '18px',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 600
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Delivery Banner */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            backgroundColor: 'rgba(0, 177, 64, 0.15)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0' }}>Delivery in 10 minutes</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Shipment of {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {cartProducts.map(product => (
            <div key={product.product_id} style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              gap: '16px'
            }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '12px', 
                backgroundColor: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
              }}>
                {product.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', lineHeight: '1.3' }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                  {product.weight_or_pack}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>
                    ₹{product.price_inr}
                  </div>
                  
                  {/* Stepper */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    backgroundColor: 'rgba(0, 177, 64, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-primary)'
                  }}>
                    <button 
                      onClick={() => handleUpdateQuantity(product.product_id, -1)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '18px', fontWeight: 500, padding: 0, cursor: 'pointer' }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', minWidth: '16px', textAlign: 'center' }}>
                      {cart[product.product_id]}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(product.product_id, 1)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '18px', fontWeight: 500, padding: 0, cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {cartProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              Your cart is empty.
            </div>
          )}
        </div>

        {/* Feedback Card */}
        {skippedProducts.length > 0 && (
          <div 
            onClick={() => {
              const url = new URL('/feedback', window.location.origin);
              url.searchParams.set('cart', searchParams.get('cart') || '');
              url.searchParams.set('recs', searchParams.get('recs') || '');
              url.searchParams.set('goal', searchParams.get('goal') || '');
              const opt4Param = searchParams.get('opt4');
              if (opt4Param) {
                url.searchParams.set('opt4', opt4Param);
              }
              router.push(url.pathname + url.search);
            }}
            style={{
            backgroundColor: '#4A8BFF', // Blue accent
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(74, 139, 255, 0.2)'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
                Help us improve your recommendations
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: 500 }}>
                You skipped some suggestions. Tell us why?
              </p>
            </div>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        )}

        {/* Delivering To */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                Delivering to <span style={{ fontWeight: 800 }}>Home</span>
              </h2>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>Change</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Blinkit Demo Area, Hyderabad</p>
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
        backgroundColor: 'var(--bg-card)',
        padding: '16px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50
      }}>
        <div style={{ 
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)' }}>
            TOTAL <span style={{ color: 'var(--color-primary)' }}>₹{totalPrice}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Cash on Delivery
          </div>
        </div>
        
        <button 
          onClick={() => {
            if (cartProducts.length === 0) return;
            router.push(`/order-confirmation?total=${totalPrice}&count=${totalItemsCount}`);
          }}
          disabled={cartProducts.length === 0}
          style={{
          backgroundColor: 'var(--color-primary)',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 24px',
          fontWeight: 800,
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: cartProducts.length > 0 ? 'pointer' : 'not-allowed',
          opacity: cartProducts.length > 0 ? 1 : 0.5
        }}>
          PLACE ORDER
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </main>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>}>
      <CartContent />
    </Suspense>
  );
}
