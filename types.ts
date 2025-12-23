export enum AppView {
  LANDING = 'LANDING',
  WRITE = 'WRITE',
  BURNING = 'BURNING',
  SKY = 'SKY',
  VAULT = 'VAULT',
  EXPLORE = 'EXPLORE'
}

export enum Emotion {
  GRIEF = 'Grief',
  HOPE = 'Hope',
  GRATITUDE = 'Gratitude',
  REGRET = 'Regret',
  ANGER = 'Anger',
  LOVE = 'Love',
  CONFUSION = 'Confusion',
  PEACE = 'Peace'
}

export interface Attachment {
  type: 'image' | 'video';
  url: string;
}

export interface Letter {
  id: string;
  content: string;
  emotion: Emotion;
  createdAt: number;
  burnedAt?: number;
  attachment?: Attachment;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}