import React from 'react';

const categories = [
  { name: 'Milk', icon: '🥛' },
  { name: 'Vegetables', icon: '🥦' },
  { name: 'Fruits', icon: '🍎' },
  { name: 'Snacks', icon: '🥨' },
  { name: 'Cold Drinks', icon: '🥤' },
  { name: 'Bakery', icon: '🍞' },
  { name: 'Instant Food', icon: '🍜' },
  { name: 'Cleaning', icon: '🧽' },
];

export default function ShopByCategory() {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Shop by Category</h2>
        <span style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>SEE ALL</span>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        rowGap: '20px', 
        columnGap: '12px' 
      }}>
        {categories.map((cat, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              backgroundColor: '#262626',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              {cat.icon}
            </div>
            <span style={{ fontSize: '12px', textAlign: 'center', color: '#e0e0e0' }}>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
