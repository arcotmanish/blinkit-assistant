"use client";

import React, { useState } from 'react';
import AssistantToggleCard from '@/components/AssistantToggleCard';
import GoalSearchBar from '@/components/GoalSearchBar';
import FilterRow from '@/components/FilterRow';
import ShopByCategory from '@/components/ShopByCategory';
import FrequentlyOrdered from '@/components/FrequentlyOrdered';
import BottomNav from '@/components/BottomNav';
import RecommendationsView from '@/components/RecommendationsView';

export default function Home() {
  const [isAiMode, setIsAiMode] = useState(false);
  const [query, setQuery] = useState('');
  const [detectedGoal, setDetectedGoal] = useState<{ id: string; label: string } | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleToggleAiMode = (checked: boolean) => {
    setIsAiMode(checked);
    // Reset state when toggling off
    if (!checked) {
      setQuery('');
      setDetectedGoal(null);
      setRecommendations([]);
    }
  };

  const handleGoalDetected = (goalId: string, goalLabel: string) => {
    setDetectedGoal({ id: goalId, label: goalLabel });
    setRecommendations([]);
  };

  const handleFiltersSubmit = async (selectedFilters: string[], freeText: string) => {
    if (!detectedGoal) return;
    
    setIsLoadingRecommendations(true);
    setRecommendations([]);
    
    try {
      // 1. Fetch Candidates
      const candidatesRes = await fetch('/api/get-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_id: detectedGoal.id, filters: selectedFilters })
      });
      const candidatesData = await candidatesRes.json();
      
      if (!candidatesData.candidates || candidatesData.candidates.length === 0) {
        alert('No products found for these filters.');
        setIsLoadingRecommendations(false);
        return;
      }
      
      // 2. Fetch Recommendations
      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates: candidatesData.candidates,
          goal_label: detectedGoal.label,
          free_text_preference: freeText
        })
      });
      const recommendData = await recommendRes.json();
      
      setRecommendations(recommendData.recommendations || []);
      setQuery(''); // Reset search input so placeholder 'Change goal...' shows
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to get recommendations.");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const showStandardContent = !(isAiMode && detectedGoal);

  return (
    <main className="app-container">
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg-main)' }}>
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

        <div style={{ padding: '0 16px 8px' }}>
          <AssistantToggleCard 
            isAiMode={isAiMode} 
            onToggle={handleToggleAiMode} 
          />

          <GoalSearchBar 
            isAiMode={isAiMode} 
            query={query}
            setQuery={setQuery}
            onGoalDetected={handleGoalDetected} 
            placeholder={(recommendations.length > 0 || isLoadingRecommendations) ? 'Change goal...' : undefined}
          />
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {isAiMode && detectedGoal && recommendations.length === 0 && !isLoadingRecommendations && (
          <FilterRow 
            goalId={detectedGoal.id} 
            onSubmitFilters={handleFiltersSubmit} 
          />
        )}
        
        {isLoadingRecommendations && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '12px', fontSize: '24px' }}>
              ⚡
            </div>
            <div>Finding the best products for you...</div>
          </div>
        )}

        {recommendations.length > 0 && (
          <RecommendationsView 
            goalLabel={detectedGoal!.label}
            recommendations={recommendations}
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
