import React, { useState, useEffect } from 'react';
import productsData from '@/data/products.json';

interface CompareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: any[];
  onCompare: (products: any[]) => void;
}

export default function CompareBottomSheet({
  isOpen,
  onClose,
  recommendations,
  onCompare
}: CompareBottomSheetProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [option4Product, setOption4Product] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSearchQuery('');
      setOption4Product(null);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Reset Option 4 if it gets deselected (manually or by 3rd selection shift)
  useEffect(() => {
    if (option4Product && !selectedIds.includes(option4Product.product_id)) {
      setOption4Product(null);
      setSearchQuery('');
      setIsSearching(false);
    }
  }, [selectedIds, option4Product]);

  if (!isOpen) return null;

  const handleSelect = (productId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId); // Deselect
      }
      const newSelection = [...prev, productId];
      if (newSelection.length > 2) {
        newSelection.shift(); // Remove oldest if 3rd is selected
      }
      return newSelection;
    });
  };

  const allRecommendationsIds = recommendations.map(r => r.product_id);
  const searchResults = productsData.filter(p => {
    if (allRecommendationsIds.includes(p.product_id)) return false;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q));
  });

  const handleSelectOption4 = (product: any) => {
    setOption4Product(product);
    setSearchQuery('');
    setIsSearching(false);
    
    // Auto-select it
    setSelectedIds(prev => {
      const filtered = prev.filter(id => id !== product.product_id);
      const newSelection = [...filtered, product.product_id];
      if (newSelection.length > 2) newSelection.shift();
      return newSelection;
    });
  };

  const handleCompareNow = () => {
    if (selectedIds.length !== 2) return;
    const prod1 = recommendations.find(r => r.product_id === selectedIds[0]) || (option4Product?.product_id === selectedIds[0] ? option4Product : null);
    const prod2 = recommendations.find(r => r.product_id === selectedIds[1]) || (option4Product?.product_id === selectedIds[1] ? option4Product : null);
    
    if (prod1 && prod2) {
      onCompare([prod1, prod2]);
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const renderPill = (product: any, index: number, isOption4: boolean = false) => {
    const active = isSelected(product.product_id);
    return (
      <div 
        key={product.product_id}
        onClick={() => handleSelect(product.product_id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: active ? 'rgba(0, 177, 64, 0.1)' : 'var(--bg-card)',
          border: `1px solid ${active ? 'var(--color-primary)' : 'var(--border-color)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '8px'
        }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${active ? 'var(--color-primary)' : 'var(--text-secondary)'}`,
          backgroundColor: active ? 'var(--color-primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto'
        }}>
          {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }} />}
        </div>
        <div style={{ flex: 1, color: '#fff', fontSize: '14px', fontWeight: active ? 600 : 400 }}>
          <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Option {index + 1}:</span>
          {product.name}
        </div>
        {isOption4 && (
          <button 
            onClick={(e) => { e.stopPropagation(); setOption4Product(null); setSelectedIds(prev => prev.filter(id => id !== product.product_id)); }}
            style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: '4px' }}
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 50,
          backdropFilter: 'blur(4px)'
        }} 
      />
      
      {/* Bottom Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '390px',
        backgroundColor: '#111',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '24px 20px',
        zIndex: 51,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Choose 2 products to compare</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          {recommendations.map((prod, idx) => renderPill(prod, idx))}
          
          {/* Option 4 */}
          {option4Product ? (
            renderPill(option4Product, 3, true)
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--text-secondary)', flex: '0 0 auto' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Option 4:</span>
                <input 
                  type="text"
                  placeholder="Search any other product..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearching(true);
                  }}
                  onFocus={() => setIsSearching(true)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              {/* Dropdown */}
              {isSearching && searchQuery.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%', left: 0, right: 0,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  zIndex: 60,
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {searchResults.length > 0 ? (
                    searchResults.map(p => (
                      <div 
                        key={p.product_id}
                        onClick={() => handleSelectOption4(p)}
                        style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <span>{p.icon}</span> {p.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>No matching products.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={handleCompareNow}
          disabled={selectedIds.length !== 2}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: selectedIds.length === 2 ? 'var(--color-primary)' : '#2a2a2a',
            color: selectedIds.length === 2 ? '#000' : '#666',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            cursor: selectedIds.length === 2 ? 'pointer' : 'not-allowed'
          }}
        >
          Compare Now
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); }
          to { transform: translate(-50%, 0); }
        }
      `}} />
    </>
  );
}
