
export interface UserProfile {
  name: string;
  physical: {
    activityLevel: 'sedentary' | 'moderate' | 'active';
    sleepAverage: number;
    dietaryNotes: string;
    stepGoal: number;
  };
  mental: {
    stressLevel: number; // 1-10
    currentMood: string;
    wellbeingGoals: string;
  };
  academic: {
    major: string;
    challenges: string;
    shortTermGoals: string;
  };
  hobbies: string[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Insight {
  category: 'physical' | 'mental' | 'academic' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}
