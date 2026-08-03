import React from 'react';

interface RecommendationCardProps {
  product: any;
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
  onWhyThisClick: () => void;
}

export default function RecommendationCard({
  product,
  quantity,
  onAdd,
  onUpdateQuantity,
  onWhyThisClick
}: RecommendationCardProps) {
  return (
    <div style={{
      flex: '0 0 160px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '12px',
      border: `1px solid ${quantity > 0 ? 'var(--color-primary)' : 'var(--border-color)'}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Image Area */}
      <div style={{
        width: '100%',
        height: '120px',
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {product.icon || '🛒'}
      </div>
      
      {/* Content Area */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {product.weight_or_pack || '1 pack'}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: Prices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              ₹{product.price_inr}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {product.price_per_unit || '₹--/unit'}
            </div>
          </div>
          
          {/* Right: Actions stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            {quantity === 0 ? (
              <button 
                onClick={onAdd}
                style={{
                  minWidth: '70px',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                  padding: '6px 0',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                ADD
              </button>
            ) : (
              <div style={{
                minWidth: '70px',
                backgroundColor: 'var(--color-primary)',
                color: '#000',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <button onClick={() => onUpdateQuantity(quantity - 1)} style={{ color: '#000', padding: '0 4px', fontSize: '16px' }}>−</button>
                <span>{quantity}</span>
                <button onClick={() => onUpdateQuantity(quantity + 1)} style={{ color: '#000', padding: '0 4px', fontSize: '16px' }}>+</button>
              </div>
            )}
            
            <button 
              onClick={onWhyThisClick}
              style={{
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                backgroundColor: '#222',
                padding: '4px 8px',
                borderRadius: '16px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Why This?
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
