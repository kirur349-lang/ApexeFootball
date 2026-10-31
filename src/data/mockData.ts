import { SlideItem, NewsItem, MatchSchedule, CoinPackage, AppNotification } from '../types';

export const PROMO_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    category: 'eFOOTBALL COINS',
    headline: 'Get Your eFootball Coins',
    description: 'Top up your account and build your dream team.',
    buttonText: 'Buy Now',
    targetTab: 'coins',
    accentBadge: 'INSTANT DELIVERY',
  },
  {
    id: 'slide-2',
    category: 'TOURNAMENTS',
    headline: 'Join Apex Championships',
    description: 'Compete against the best players and win amazing prizes.',
    buttonText: 'Explore Tournaments',
    targetTab: 'tournaments',
    accentBadge: '$5,000 PRIZE POOL',
  },
  {
    id: 'slide-3',
    category: 'APEX NEWS',
    headline: 'Stay Ahead of the Game',
    description: 'Discover the latest eFootball updates, announcements and news.',
    buttonText: 'Read More',
    targetTab: 'home',
    accentBadge: 'OFFICIAL INTEL',
  },
];

export const LATEST_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    category: 'GAME NEWS',
    title: 'eFootball Update 4.2.0 – New Features & Fixes',
    date: 'Oct 28, 2026',
    readTime: '3 min read',
    author: 'Apex Tactical Desk',
    summary: 'Konami introduces revamped physical shielding, refined AI offensive runs, and updated stadium physics in the latest 4.2.0 patch.',
    content: [
      'The highly anticipated eFootball 4.2.0 update has officially rolled out globally across mobile and console ecosystems. This release focuses on competitive gameplay fidelity, response timing, and realistic inertia mechanics.',
      'Key gameplay enhancements include an overhaul to physical defending and automatic shielding mechanics. Players will experience more reliable contact battles when jostling shoulder-to-shoulder with physical target men like Haaland and Osimhen.',
      'Additionally, tactical AI has received significant polish: interior wingers now recognize half-space overloads faster, while full-backs in "Defensive" instructions maintain tighter central compact spacing during transitional phases.',
      'Server-side netcode optimizations have been deployed to minimize input latency during peer-to-peer Division matches, ensuring crisp touch responsiveness for esports competitors.'
    ],
    keyHighlights: [
      'Refined Physical Defending & Auto-Shielding inertia',
      'Overhauled wing-play AI and half-space penetration',
      'Lower input latency on Mobile 60/120 FPS modes',
      'Updated player face scans and seasonal kits'
    ]
  },
  {
    id: 'news-2',
    category: 'TOURNAMENT',
    title: 'Apex Championship – Registration Now Open!',
    date: 'Oct 26, 2026',
    readTime: '4 min read',
    author: 'Apex Esports Operations',
    summary: 'Enter the ultimate mobile eFootball championship featuring 128 top competitive contenders and a guaranteed $5,000 cash pool.',
    content: [
      'Registrations for Season 4 of the flagship Apex eFootball Championship are officially live. Competitors from across Europe, Asia, and the Americas are invited to test their tactical mastery in a grueling double-elimination tournament format.',
      'The tournament will be conducted in a Best-of-3 format for qualifying rounds, escalating to Best-of-5 for the Upper/Lower Finals and the Grand Final on Sunday. All matches are strictly monitored by official Apex stewards to ensure zero connection tampering.',
      'The prize pool stands at $5,000 USD distributed across top 8 finishers, with direct qualification seeds awarded for the Apex Global Masters tournament in Tokyo.'
    ],
    keyHighlights: [
      'Guaranteed $5,000 USD verified cash pool',
      'Double Elimination 128-player master bracket',
      'Live streamed with pro commentary on Telegram Arena',
      'Official Konami Fair-Play verification required'
    ]
  },
  {
    id: 'news-3',
    category: 'COINS',
    title: 'Get Your eFootball Coins – Safe, Fast & Reliable',
    date: 'Oct 24, 2026',
    readTime: '2 min read',
    author: 'Apex Financial Services',
    summary: 'Direct eFootball coin top-ups delivered in under 60 seconds with 100% account security guarantee and zero ban risks.',
    content: [
      'Looking to unlock Epic Booster Showtime cards or acquire the newest Managers pack? Apexify offers verified, direct-to-ID coin top-ups designed specifically for eFootball mobile managers.',
      'With over 250,000 successful transactions completed through our Telegram Mini App integration, our automated API channels ensure credits arrive instantly into your Konami balance without requiring sensitive account passwords.',
      'Take advantage of this weekend’s 15% bonus coins campaign on all bundles above 2,130 coins. All purchases are backed by the Apex 100% money-back safe delivery guarantee.'
    ],
    keyHighlights: [
      'Only your Konami Game ID needed — no passwords ever',
      'Instant delivery in under 60 seconds 24/7',
      '15% Bonus coins active on high tier packs',
      'Secure payment processing via Apple Pay, Google Pay & Crypto'
    ]
  },
  {
    id: 'news-4',
    category: 'PLAYER NEWS',
    title: 'Top 5 Players to Watch',
    date: 'Oct 21, 2026',
    readTime: '5 min read',
    author: 'Scouting & Analytics',
    summary: 'Meet the 5 esports prodigies setting new benchmarks in division rankings and tournament win rates this season.',
    content: [
      'As we gear up for the Apex Championship, our analytics department analyzed over 1,200 Division 1 competitive matches to highlight five standout talents whose playstyles are redefining the meta.',
      'Leading the list is 19-year-old phenom "ViperX", famous for his 4-2-2-2 quick-counter possession transitions and manual passing precision averaging 92.4% under press.',
      'Other notable contenders include "Kage_99", the master of manual cursor switching defense who conceded zero goals across 14 consecutive Swiss stage games.'
    ],
    keyHighlights: [
      'ViperX (Rank 1 Global, 4-2-2-2 Quick Counter)',
      'Kage_99 (Defensive master, 0.4 goals conceded/game)',
      'Silva_Pro (Out-wide cross specialist & aerial dominator)',
      'Apex_Zenith (Current defending Apex Cup holder)'
    ]
  }
];

export const ADDITIONAL_NEWS: NewsItem[] = [
  {
    id: 'news-5',
    category: 'GAME NEWS',
    title: 'Mastering the 4-3-1-2 Possession Meta in Division 1',
    date: 'Oct 18, 2026',
    readTime: '4 min read',
    author: 'Apex Tactical Desk',
    summary: 'A deep-dive tutorial into spacing, individual instructions, and creative playmaker movement in tight midfield battles.',
    content: [
      'Possession game has seen a dramatic resurgence following recent physical shielding adjustments. Here is how to construct a suffocating midfield cage using central overloads.',
      'Position your Anchorman DM deep between center-backs while allowing your orchestrator CM to dictate tempo with one-touch lofted switches.'
    ],
    keyHighlights: [
      'Individual instructions for Anchor Man and Hole Player',
      'How to bypass hyper-aggressive pressing traps',
      'Optimal skill training additions for AMF creators'
    ]
  },
  {
    id: 'news-6',
    category: 'TOURNAMENT',
    title: 'Apex Weekly Cup #42 Results & Best Goals',
    date: 'Oct 15, 2026',
    readTime: '3 min read',
    author: 'Apex Esports Operations',
    summary: 'Highlights from the dramatic 3-2 final between Team Phantom and Apex Velocity, featuring a 90th-minute dipping volley.',
    content: [
      'The 42nd edition of the Apex Weekly Cup concluded with a thriller that had 18,000 concurrent viewers in the Telegram Live Arena on Sunday night.',
      'Watch the full replay and vote for your Goal of the Week in our community poll.'
    ],
    keyHighlights: [
      'Team Phantom claims $1,000 first prize',
      'Over 640 matches played in 8 hours',
      'Next weekly qualifier opens this Thursday'
    ]
  }
];

export const MATCH_SCHEDULES: MatchSchedule[] = [
  {
    id: 'm-1',
    stage: 'GRAND FINAL',
    time: '20:00 UTC',
    status: 'LIVE',
    teamA: {
      name: 'Apex Velocity',
      tag: 'APX',
      score: 2,
      avatarBg: '#087BFF',
      player: 'ViperX'
    },
    teamB: {
      name: 'Nova Esports',
      tag: 'NVA',
      score: 1,
      avatarBg: '#101C3A',
      player: 'Kage_99'
    },
    matchTimeMinute: "74'",
    bracketGroup: 'Championship Bracket'
  },
  {
    id: 'm-2',
    stage: 'SEMIFINAL 2',
    time: '18:30 UTC',
    status: 'FINISHED',
    teamA: {
      name: 'Cyber Tigers',
      tag: 'CBR',
      score: 0,
      avatarBg: '#E02424',
      player: 'Tigre'
    },
    teamB: {
      name: 'Nova Esports',
      tag: 'NVA',
      score: 2,
      avatarBg: '#101C3A',
      player: 'Kage_99'
    },
    bracketGroup: 'Upper Bracket'
  },
  {
    id: 'm-3',
    stage: 'QUARTERFINAL',
    time: '21:30 UTC',
    status: 'UPCOMING',
    teamA: {
      name: 'Thunderbolt FC',
      tag: 'TBC',
      avatarBg: '#F59E0B',
      player: 'Zenith'
    },
    teamB: {
      name: 'Shadow Syndicate',
      tag: 'SHD',
      avatarBg: '#6366F1',
      player: 'Phantom'
    },
    bracketGroup: 'Lower Bracket'
  },
  {
    id: 'm-4',
    stage: 'ROUND OF 16',
    time: 'Tomorrow, 15:00 UTC',
    status: 'UPCOMING',
    teamA: {
      name: 'Red Dragons',
      tag: 'RDG',
      avatarBg: '#EF4444',
      player: 'Drake'
    },
    teamB: {
      name: 'Blue Legion',
      tag: 'BLG',
      avatarBg: '#0284C7',
      player: 'Stratos'
    },
    bracketGroup: 'Championship Bracket'
  }
];

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'coin-1', coins: 550, bonus: 0, price: '$4.99' },
  { id: 'coin-2', coins: 1050, bonus: 50, price: '$9.99' },
  { id: 'coin-3', coins: 2130, bonus: 200, price: '$19.99', popular: true },
  { id: 'coin-4', coins: 3250, bonus: 450, price: '$29.99' },
  { id: 'coin-5', coins: 5700, bonus: 900, price: '$49.99', bestValue: true },
  { id: 'coin-6', coins: 12000, bonus: 2200, price: '$99.99' },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Apex Championship Registration',
    message: 'Registrations are 80% full! Secure your bracket spot before 23:59 UTC.',
    time: '12m ago',
    read: false,
    type: 'tournament'
  },
  {
    id: 'notif-2',
    title: 'Weekend Coin Bonus Active',
    message: 'Enjoy up to 2,200 bonus coins on all high-tier coin top-ups this weekend.',
    time: '1h ago',
    read: false,
    type: 'coins'
  },
  {
    id: 'notif-3',
    title: 'Update 4.2.0 Breakdown',
    message: 'Check out the tactical shielding adjustments guide in Latest News.',
    time: '4h ago',
    read: true,
    type: 'patch'
  }
];
