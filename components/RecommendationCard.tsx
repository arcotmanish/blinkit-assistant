import React from 'react';

interface RecommendationCardProps {
  product: any;
  quantity: number;
  isOpen?: boolean;
  onAdd: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
  onWhyThisClick: () => void;
}

export default function RecommendationCard({
  product,
  quantity,
  isOpen,
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
      <div style={{ padding: '12px 12px 16px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {/* Product Name */}
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          color: '#fff',
          marginBottom: '4px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          height: '48px'
        }}>
          {product.name}
        </div>
        
        {/* Weight */}
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {product.weight_or_pack || '1 pack'}
        </div>
        
        {/* Price & Unit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
            ₹{product.price_inr}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {product.price_per_unit || '₹--/unit'}
          </div>
        </div>
        
        {/* Actions Row (Bottom, side by side) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '8px' }}>
          {/* ADD Button */}
          {quantity === 0 ? (
            <button 
              onClick={onAdd}
              style={{
                flex: 1,
                minWidth: '60px',
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
              flex: 1,
              minWidth: '60px',
              backgroundColor: 'var(--color-primary)',
              color: '#000',
              padding: '6px 4px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button onClick={() => onUpdateQuantity(quantity - 1)} style={{ color: '#000', padding: '0', fontSize: '16px', width: '20px' }}>−</button>
              <span>{quantity}</span>
              <button onClick={() => onUpdateQuantity(quantity + 1)} style={{ color: '#000', padding: '0', fontSize: '16px', width: '20px' }}>+</button>
            </div>
          )}
          
          {/* Why This Button */}
          <button 
            onClick={onWhyThisClick}
            style={{
              flex: '0 0 auto',
              border: isOpen ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
              color: isOpen ? 'var(--color-primary)' : 'var(--text-secondary)',
              backgroundColor: isOpen ? 'rgba(0, 177, 64, 0.1)' : '#222',
              padding: '4px 8px',
              borderRadius: '16px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: '30px'
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
  );
}
