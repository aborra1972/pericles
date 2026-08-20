export type QualityLevel = 'economic' | 'balanced' | 'maximum';

export interface QualityProfile {
  model: string;
  maxTokens: number;
  temperature: number;
}

const profiles: Record<QualityLevel, QualityProfile> = {
  economic: {
    model: 'gpt-4o-mini',
    maxTokens: 256,
    temperature: 0.3,
  },
  balanced: {
    model: 'gpt-4o',
    maxTokens: 512,
    temperature: 0.7,
  },
  maximum: {
    model: 'gpt-4o',
    maxTokens: 1024,
    temperature: 0.9,
  },
};

export function getQualityProfile(level: QualityLevel): QualityProfile {
  const profile = profiles[level];
  if (!profile) {
    throw new Error(`Unknown quality profile: ${level}`);
  }
  return profile;
}

export function mapBackendProfile(backendLevel: string): QualityLevel {
  switch (backendLevel) {
    case 'economic':
    case 'low':
      return 'economic';
    case 'balanced':
    case 'medium':
    case 'normal':
      return 'balanced';
    case 'maximum':
    case 'high':
      return 'maximum';
    default:
      return 'balanced';
  }
}
