import goals from '../data/goals.json';

const BETTER_SKIN_KEYWORDS = [
  "skin", "skincare", "skin care", "glow", "glowing", "pimple", "acne", "dull", "dry skin",
  "oily skin", "face", "serum", "moisturiser", "moisturizer", "lotion", "complexion",
  "fairness", "brightening", "hydration", "radiant", "blemish", "pigmentation",
  "vitamin c", "spf", "sunscreen", "toner", "cleanse", "cleanser", "dermatologist",
  "beauty", "skinroutine", "skin routine", "nourish skin", "clear skin",
  "improve", "improve my skin", "improving"
];

const HEALTHY_SNACKING_KEYWORDS = [
  "snack", "snacks", "snacking", "munchies", "munching", "eat", "eating", "food", "hungry",
  "hunger", "bite", "bites", "treat", "treats", "junk", "guilt", "low calorie", "calorie",
  "protein", "fibre", "fiber", "diet", "weight", "healthy", "health", "nutritious",
  "nutrition", "wholesome", "light food", "light eating", "grain", "nuts", "seeds",
  "chips", "crackers", "biscuit", "bar", "granola", "muesli", "yogurt", "curd"
];

const MORNING_ENERGY_KEYWORDS = [
  "morning", "energy", "breakfast", "fuel", "wake up", "boost", "fatigue", "tired",
  "afternoon slump", "lunch", "start the day", "coffee", "tea"
];

export function detectGoal(userInput: string) {
  const text = userInput.toLowerCase().trim();

  // Better skin is checked FIRST (more specific, takes priority)
  if (BETTER_SKIN_KEYWORDS.some(kw => text.includes(kw))) {
    return "better_skin";
  }
  
  if (HEALTHY_SNACKING_KEYWORDS.some(kw => text.includes(kw))) {
    return "healthy_snacking";
  }
  
  if (MORNING_ENERGY_KEYWORDS.some(kw => text.includes(kw))) {
    return "morning_energy";
  }

  return null;
}

export function getGoalResponse(goalId: string | null) {
  if (!goalId) {
    return {
      goal_id: null,
      error: "We couldn't detect a goal. Try typing something like 'I want healthier snacks' or 'help me with my skin'."
    };
  }

  const goalData = (goals as any)[goalId];
  
  if (!goalData) {
    return {
      goal_id: null,
      error: "Goal data not found."
    };
  }

  return {
    goal_id: goalId,
    goal_label: goalData.label,
    display_text: `Recommended for your ${goalData.label}...`
  };
}
