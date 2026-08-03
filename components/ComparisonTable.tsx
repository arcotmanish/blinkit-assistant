import React from 'react';

interface ComparisonTableProps {
  compareResult: any;
  products: any[];
  onClose: () => void;
}

export default function ComparisonTable({ compareResult, products, onClose }: ComparisonTableProps) {
  if (!compareResult || !products || products.length !== 2) return null;

  return (
    <div style={{
      marginTop: '16px',
      animation: 'fadeIn 0.2s ease-out',
      paddingBottom: '24px' // Extra space before sticky nav
    }}>
      {/* Table Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', 
              backgroundColor: 'rgba(245, 166, 35, 0.2)', color: 'var(--color-amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5"></path>
                <path d="M4 20L21 3"></path>
                <path d="M21 16v5h-5"></path>
                <path d="M15 15l6 6"></path>
                <path d="M4 4l5 5"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Comparison</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>
            ✕ Close
          </button>
        </div>

        {/* The Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ width: '28%', padding: '12px 8px 12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border-color)' }}>
                  Criteria
                </th>
                <th style={{ width: '36%', padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>{products[0].icon}</span>
                  </div>
                  <div style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100px'
                  }}>
                    {products[0].name}
                  </div>
                </th>
                <th style={{ width: '36%', padding: '12px 16px 12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>{products[1].icon}</span>
                  </div>
                  <div style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100px'
                  }}>
                    {products[1].name}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {compareResult.comparison_rows?.map((row: any, idx: number) => {
                const winner = row.winner;
                
                return (
                  <tr key={idx} style={{ borderBottom: idx === compareResult.comparison_rows.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px 12px 16px', color: 'var(--text-secondary)', fontWeight: 500, verticalAlign: 'top' }}>
                      {row.feature_name}
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      <div style={{ marginBottom: '4px', lineHeight: '1.4' }}>{row.product_1_value}</div>
                      {winner === 1 && <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '12px' }}>✓ Better</span>}
                      {winner === 2 && <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: '12px' }}>✗</span>}
                      {winner === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Tie</span>}
                    </td>
                    <td style={{ padding: '12px 16px 12px 8px', verticalAlign: 'top' }}>
                      <div style={{ marginBottom: '4px', lineHeight: '1.4' }}>{row.product_2_value}</div>
                      {winner === 2 && <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '12px' }}>✓ Better</span>}
                      {winner === 1 && <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: '12px' }}>✗</span>}
                      {winner === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Tie</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Summary Card */}
      <div style={{
        backgroundColor: '#1c1c1c',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-amber)' }}>AI Summary</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {compareResult.ai_summary}
        </p>
      </div>
    </div>
  );
}
