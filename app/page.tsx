"use client";

import React, { useState } from 'react';
import AssistantToggleCard from '@/components/AssistantToggleCard';
import GoalSearchBar from '@/components/GoalSearchBar';
import FilterRow from '@/components/FilterRow';
import ShopByCategory from '@/components/ShopByCategory';
import FrequentlyOrdered from '@/components/FrequentlyOrdered';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const [isAiMode, setIsAiMode] = useState(false);
  const [query, setQuery] = useState('');
  const [detectedGoal, setDetectedGoal] = useState<{ id: string; label: string } | null>(null);

  const handleToggleAiMode = (checked: boolean) => {
    setIsAiMode(checked);
    // Reset state when toggling off
    if (!checked) {
      setQuery('');
      setDetectedGoal(null);
    }
  };

  const handleGoalDetected = (goalId: string, goalLabel: string) => {
    setDetectedGoal({ id: goalId, label: goalLabel });
  };

  const handleFiltersSubmit = (selectedFilters: string[], freeText: string) => {
    console.log("--- Find Products Clicked ---");
    console.log("Goal ID:", detectedGoal?.id);
    console.log("Goal Label:", detectedGoal?.label);
    console.log("Selected Filters:", selectedFilters);
    console.log("Free Text Preference:", freeText);
    
    // In Phase 7, this will trigger the recommendation API fetch and render the cards
  };

  const showStandardContent = !(isAiMode && detectedGoal);

  return (
    <main className="app-container">
      {/* Top Header Placeholder (simulating Blinkit's top bar) */}
      <div style={{ padding: '12px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>Delivery in 10 minutes</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📍</span> Blinkit Demo Area <span style={{ fontSize: '10px' }}>▼</span>
          </div>
        </div>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(0, 177, 64, 0.15)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <AssistantToggleCard 
          isAiMode={isAiMode} 
          onToggle={handleToggleAiMode} 
        />

        <GoalSearchBar 
          isAiMode={isAiMode} 
          query={query}
          setQuery={setQuery}
          onGoalDetected={handleGoalDetected} 
        />

        {isAiMode && detectedGoal && (
          <FilterRow 
            goalId={detectedGoal.id} 
            onSubmitFilters={handleFiltersSubmit} 
          />
        )}
        
        {showStandardContent && (
          <>
            <ShopByCategory />
            <FrequentlyOrdered />
            
            {/* Promo Banner to fill the remaining visual space on mobile */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: '100%',
                height: '100px',
                backgroundColor: 'rgba(0, 177, 64, 0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 177, 64, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ zIndex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Mega Sale</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600 }}>Up to 50% OFF</div>
                </div>
                <div style={{ fontSize: '48px', zIndex: 1, filter: 'grayscale(0.2)' }}>🛒</div>
                
                {/* Decorative background circle */}
                <div style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 177, 64, 0.05)',
                  zIndex: 0
                }} />
              </div>
            </div>
          </>
        )}
      </div>
      
      <BottomNav />
    </main>
  );
}
