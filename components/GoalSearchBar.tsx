import React, { useState } from 'react';

interface GoalSearchBarProps {
  isAiMode: boolean;
  onGoalDetected: (goalId: string, goalLabel: string) => void;
}

export default function GoalSearchBar({ isAiMode, onGoalDetected }: GoalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAiMode) return;
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/detect-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
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
    <div style={{ marginBottom: '24px' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isAiMode ? "Tell us your personal goal…" : "Search for Atta, Daal, Eggs…"}
          disabled={!isAiMode || isLoading}
          style={{
            width: '100%',
            padding: '16px 48px 16px 16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-default)',
            color: 'var(--text-primary)',
            fontSize: '16px',
            opacity: (!isAiMode || isLoading) ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}
        />
        {/* Search icon placeholder */}
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)'
        }}>
          {isLoading ? '⏳' : '🔍'}
        </div>
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
