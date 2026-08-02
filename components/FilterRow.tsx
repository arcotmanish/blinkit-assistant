import React, { useState } from 'react';

interface FilterRowProps {
  goalId: string;
  onSubmitFilters: (selectedFilters: string[], freeText: string) => void;
}

export default function FilterRow({ goalId, onSubmitFilters }: FilterRowProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  // Determine pills based on goal
  let availableFilters: { id: string; label: string }[] = [];
  if (goalId === 'healthy_snacking') {
    availableFilters = [
      { id: 'high_protein', label: 'High Protein' },
      { id: 'low_sugar', label: 'Low Sugar' }
    ];
  } else if (goalId === 'better_skin') {
    availableFilters = [
      { id: 'no_paraben', label: 'No Paraben' },
      { id: 'fragrance_free', label: 'Fragrance Free' }
    ];
  }

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFilters(selectedFilters, freeText);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      padding: '16px',
      borderRadius: 'var(--radius-default)',
      border: '1px solid var(--border-color)',
      marginBottom: '24px'
    }}>
      <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
        Refine your recommendations
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {availableFilters.map(filter => {
          const isSelected = selectedFilters.includes(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                color: isSelected ? '#fff' : 'var(--text-primary)',
                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
              }}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Anything else? Type a preference…"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Find Products
        </button>
      </form>
    </div>
  );
}
