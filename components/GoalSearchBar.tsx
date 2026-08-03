import React, { useState } from 'react';

interface GoalSearchBarProps {
  isAiMode: boolean;
  query: string;
  setQuery: (val: string) => void;
  onGoalDetected: (goalId: string, goalLabel: string) => void;
  placeholder?: string;
}

export default function GoalSearchBar({ isAiMode, query, setQuery, onGoalDetected, placeholder }: GoalSearchBarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAiMode) return;
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/detect-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: query }),
      });

      const data = await res.json();
      
      if (res.ok && data.goal_id) {
        onGoalDetected(data.goal_id, data.goal_label);
      } else {
        setErrorMsg("Try something like 'healthy snacking' or 'better skin'");
      }
    } catch (err) {
      setErrorMsg("Try something like 'healthy snacking' or 'better skin'");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={!isAiMode ? "Search for Atta, Daal, Eggs…" : (placeholder || "Tell us your personal goal…")}
          disabled={!isAiMode || isLoading}
          style={{
            width: '100%',
            padding: '12px 48px 12px 16px',
            backgroundColor: '#262626',
            border: 'none',
            borderRadius: '16px',
            color: 'var(--text-primary)',
            fontSize: '15px',
            opacity: (!isAiMode || isLoading) ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}
        />
        <button
          type="button"
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
          disabled={!isAiMode || isLoading}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: (!isAiMode || isLoading) ? 'default' : 'pointer'
          }}
        >
          {isLoading ? (
            <span style={{ fontSize: '18px' }}>⏳</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          )}
        </button>
      </form>
      
      {errorMsg && (
        <div style={{
          marginTop: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          paddingLeft: '4px'
        }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}
