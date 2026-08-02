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
      { id: 'fragrance_free', label: 'Fragrance free' }
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
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {availableFilters.map(filter => {
          const isSelected = selectedFilters.includes(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 400,
                backgroundColor: isSelected ? 'rgba(0, 177, 64, 0.1)' : 'transparent',
                color: isSelected ? 'var(--color-primary)' : '#d0d0d0',
                border: `1px solid ${isSelected ? 'var(--color-primary)' : '#444'}`,
                transition: 'all 0.2s ease'
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
          placeholder="Anything else? Type a preference.."
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#1c1c1c', // Match the dark grey input box
            border: '1px solid #333',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontSize: '15px',
            marginBottom: '16px'
          }}
        />

        {/* Hidden or subtle submit button - we'll keep it but style it nicely */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          Find Products
        </button>
      </form>
    </div>
  );
}
