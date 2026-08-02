"use client";

import React, { useState } from 'react';
import AssistantToggleCard from '@/components/AssistantToggleCard';
import GoalSearchBar from '@/components/GoalSearchBar';
import FilterRow from '@/components/FilterRow';

export default function Home() {
  const [isAiMode, setIsAiMode] = useState(false);
  const [detectedGoal, setDetectedGoal] = useState<{ id: string; label: string } | null>(null);

  const handleToggleAiMode = (checked: boolean) => {
    setIsAiMode(checked);
    // Reset state when toggling off
    if (!checked) {
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

  return (
    <main className="app-container">
      {/* Top Header Placeholder (simulating Blinkit's top bar) */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700 }}>Delivery in 10 minutes</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Blinkit Demo Area</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <AssistantToggleCard 
          isAiMode={isAiMode} 
          onToggle={handleToggleAiMode} 
        />

        <GoalSearchBar 
          isAiMode={isAiMode} 
          onGoalDetected={handleGoalDetected} 
        />

        {isAiMode && detectedGoal && (
          <FilterRow 
            goalId={detectedGoal.id} 
            onSubmitFilters={handleFiltersSubmit} 
          />
        )}
      </div>
    </main>
  );
}
