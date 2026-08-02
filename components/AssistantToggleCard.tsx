import React from 'react';

interface AssistantToggleCardProps {
  isAiMode: boolean;
  onToggle: (checked: boolean) => void;
}

export default function AssistantToggleCard({ isAiMode, onToggle }: AssistantToggleCardProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-default)',
      border: `1px solid ${isAiMode ? 'rgba(0, 177, 64, 0.2)' : 'var(--border-color)'}`,
      marginBottom: '12px',
      transition: 'border-color 0.3s'
    }}>
      {/* Custom toggle switch */}
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '44px',
        height: '24px',
        marginRight: '12px',
        cursor: 'pointer'
      }}>
        <input 
          type="checkbox" 
          checked={isAiMode}
          onChange={(e) => onToggle(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0, margin: 0, padding: 0 }}
        />
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isAiMode ? 'var(--color-primary)' : '#444',
          transition: '.3s',
          borderRadius: '24px'
        }}>
          <span style={{
            position: 'absolute',
            content: '""',
            height: '18px',
            width: '18px',
            left: '3px',
            bottom: '3px',
            backgroundColor: '#fff',
            transition: '.3s',
            borderRadius: '50%',
            transform: isAiMode ? 'translateX(20px)' : 'translateX(0)'
          }} />
        </span>
      </label>

      <span style={{
        fontSize: '15px',
        fontWeight: 600,
        color: isAiMode ? 'var(--color-primary)' : 'var(--text-primary)',
        transition: 'color 0.3s'
      }}>
        Blinkit Assistant ✨
      </span>
    </div>
  );
}
