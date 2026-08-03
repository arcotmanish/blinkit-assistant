import React, { useState } from 'react';
import RecommendationCard from './RecommendationCard';
import CompareBottomSheet from './CompareBottomSheet';
import ComparisonTable from './ComparisonTable';

import { useRouter } from 'next/navigation';

interface RecommendationsViewProps {
  goalId: string;
  goalLabel: string;
  recommendations: any[];
}

export default function RecommendationsView({ goalId, goalLabel, recommendations }: RecommendationsViewProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [openWhyThisId, setOpenWhyThisId] = useState<string | null>(null);
  const [option4Ids, setOption4Ids] = useState<string[]>([]);
  
  const [isCompareSheetOpen, setIsCompareSheetOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [comparedProducts, setComparedProducts] = useState<any[]>([]);

  const handleAdd = (productId: string) => {
    setCart(prev => ({ ...prev, [productId]: 1 }));
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (qty <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = qty;
      }
      return newCart;
    });
  };

  const handleToggleWhyThis = (productId: string) => {
    setCompareResult(null); // hide comparison if opening why this
    setOpenWhyThisId(prev => prev === productId ? null : productId);
  };

  const handleOpenCompare = () => {
    setOpenWhyThisId(null);
    setCompareResult(null);
    setIsCompareSheetOpen(true);
  };

  const handleCompare = async (products: any[]) => {
    setIsCompareSheetOpen(false);
    setComparedProducts(products);
    setIsComparing(true);
    
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products,
          goal_label: goalLabel,
          free_text_preference: ''
        })
      });
      const data = await res.json();
      setCompareResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to compare products');
    } finally {
      setIsComparing(false);
    }
  };

  const handleOption4Select = (product: any) => {
    setOption4Ids(prev => {
      if (prev.includes(product.product_id)) return prev;
      return [...prev, product.product_id];
    });
  };

  const handleGoToCart = () => {
    if (!isCartActive) return;
    
    const cartParam = Object.entries(cart)
      .map(([id, qty]) => `${id}:${qty}`)
      .join(',');
      
    const recsParam = recommendations.map(r => r.product_id).join(',');
    const opt4Param = option4Ids.join(',');
    
    const url = new URL('/cart', window.location.origin);
    url.searchParams.set('cart', cartParam);
    url.searchParams.set('recs', recsParam);
    url.searchParams.set('goal', goalId);
    if (opt4Param) {
      url.searchParams.set('opt4', opt4Param);
    }
    
    router.push(url.pathname + url.search);
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const isCartActive = totalItems > 0;
  
  const openProduct = openWhyThisId ? recommendations.find(r => r.product_id === openWhyThisId) : null;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', lineHeight: '1.2' }}>
        Recommended for your<br/>{goalLabel}...
      </h1>
      
      {/* Horizontal Cards Row */}
      <div 
        className="hide-scrollbar"
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '16px',
          paddingBottom: '16px',
          margin: '0 -16px',
          padding: '0 16px 16px' // keep padding so shadows/borders aren't cut
        }}
      >
        {recommendations.map(product => (
          <RecommendationCard
            key={product.product_id}
            product={product}
            quantity={cart[product.product_id] || 0}
            isOpen={openWhyThisId === product.product_id}
            onAdd={() => handleAdd(product.product_id)}
            onUpdateQuantity={(qty) => handleUpdateQuantity(product.product_id, qty)}
            onWhyThisClick={() => handleToggleWhyThis(product.product_id)}
          />
        ))}
      </div>
      
      {/* Comparison Loading State */}
      {isComparing && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-primary)' }}>
          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '12px', fontSize: '24px' }}>
            ⚖️
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Analyzing products...</div>
        </div>
      )}

      {/* Comparison Table */}
      {compareResult && !isComparing && (
        <ComparisonTable 
          compareResult={compareResult}
          products={comparedProducts}
          onClose={() => setCompareResult(null)}
        />
      )}

      {/* Why This Expanded Box */}
      {openProduct && !compareResult && !isComparing && (
        <div style={{
          backgroundColor: '#1c1c1c',
          borderRadius: '16px',
          padding: '16px',
          marginTop: '16px',
          border: '1px solid var(--border-color)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', 
              backgroundColor: 'rgba(0, 177, 64, 0.2)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Matches your {goalLabel} Goal</h3>
          </div>
          
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
            {openProduct.why_this?.goal_match || 'This product is an excellent fit for your personal goal.'}
          </p>
          
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '14px', lineHeight: '1.5' }}>
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Clean Ingredients: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {openProduct.why_this?.ingredient_note || 'Made with clean, transparent ingredients.'}
            </span>
          </div>
        </div>
      )}
      
      {/* Sticky Action Bar */}
      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: '0',
        right: '0',
        maxWidth: '390px',
        margin: '0 auto',
        padding: '12px 16px',
        background: 'linear-gradient(to top, var(--bg-main) 80%, transparent)',
        display: 'flex',
        gap: '12px',
        zIndex: 40
      }}>
        <button 
          onClick={handleOpenCompare}
          style={{
          backgroundColor: 'var(--color-amber)',
          color: '#000',
          borderRadius: '12px',
          padding: '14px',
          flex: '0 0 auto',
          fontWeight: 700,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5"></path>
            <path d="M4 20L21 3"></path>
            <path d="M21 16v5h-5"></path>
            <path d="M15 15l6 6"></path>
            <path d="M4 4l5 5"></path>
          </svg>
          COMPARE
        </button>
        
        <button 
          onClick={handleGoToCart}
          style={{
          backgroundColor: isCartActive ? 'var(--color-primary)' : 'var(--bg-card)',
          color: isCartActive ? '#000' : 'var(--color-primary)',
          border: isCartActive ? 'none' : '1px solid var(--color-primary)',
          borderRadius: '12px',
          padding: '14px',
          flex: '1',
          fontWeight: 700,
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}>
          Go to cart
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>

      <CompareBottomSheet 
        isOpen={isCompareSheetOpen}
        onClose={() => setIsCompareSheetOpen(false)}
        recommendations={recommendations}
        onCompare={handleCompare}
        onOption4Select={handleOption4Select}
      />
    </div>
  );
}
