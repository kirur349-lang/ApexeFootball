export type TabType = 'home' | 'tournaments' | 'live' | 'coins' | 'more';

export interface SlideItem {
  id: string;
  category: string;
  headline: string;
  description: string;
  buttonText: string;
  targetTab?: TabType;
  accentBadge?: string;
}

export interface NewsItem {
  id: string;
  category: 'GAME NEWS' | 'TOURNAMENT' | 'COINS' | 'PLAYER NEWS';
  title: string;
  date: string;
  readTime: string;
  author: string;
  summary: string;
  content: string[];
  keyHighlights: string[];
}

export interface MatchSchedule {
  id: string;
  stage: string;
  time: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  teamA: {
    name: string;
    tag: string;
    score?: number;
    avatarBg: string;
    player: string;
  };
  teamB: {
    name: string;
    tag: string;
    score?: number;
    avatarBg: string;
    player: string;
  };
  matchTimeMinute?: string;
  bracketGroup?: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  price: string;
  popular?: boolean;
  bestValue?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'tournament' | 'coins' | 'patch';
}
