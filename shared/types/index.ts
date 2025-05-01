// shared/types.ts - Common types used across the application

// Age groups for the application
export enum AgeGroup {
  CHILD = 'child',       // 5-12 years
  TEEN = 'teen',         // 13-17 years
  YOUNG_ADULT = 'young', // 18-25 years
  ADULT = 'adult',       // 26-59 years
  SENIOR = 'senior'      // 60+ years
}

// User profile settings
export interface UserSettings {
  ageGroup: AgeGroup;
  voiceEnabled: boolean;
  voiceType: string; // Voice identifier for text-to-speech
}

// Default settings
export const defaultSettings: UserSettings = {
  ageGroup: AgeGroup.ADULT,
  voiceEnabled: true,
  voiceType: 'default'
};
