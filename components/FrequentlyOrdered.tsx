import React from 'react';

const products = [
  { id: 1, name: 'Amul Taaza Toned Fresh Milk', weight: '500 ml', price: 28, icon: '🥛' },
  { id: 2, name: 'Hen Fruit White Farm Eggs', weight: '6 pcs', price: 54, icon: '🥚' },
  { id: 3, name: 'Fresh Coriander Bundle', weight: '100 g', price: 12, icon: '🌿' },
];

export default function FrequentlyOrdered() {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Frequently Ordered</h2>
      
      <div 
        className="hide-scrollbar" 
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '12px',
          paddingBottom: '8px'
        }}
      >
        {products.map(product => (
          <div key={product.id} style={{
            flex: '0 0 115px', // Narrower to prevent horizontal stretching
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '8px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              width: '100%',
              height: '76px', // Smaller height to maintain closer to square aspect ratio
              backgroundColor: '#111',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '8px'
            }}>
              {product.icon}
            </div>
            
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {product.weight}
            </div>
            
            <div style={{ 
              fontSize: '12px', // Smaller font for narrower card
              fontWeight: 500, 
              color: '#fff',
              marginBottom: '12px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '30px' // Enforce consistent height for 2 lines
            }}>
              {product.name}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                ₹{product.price}
              </div>
              
              {product.quantity ? (
                <div style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>-</span>
                  <span>{product.quantity}</span>
                  <span>+</span>
                </div>
              ) : (
                <button style={{
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  ADD
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
