import { useState, useEffect } from 'react';
import {
  db,
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
} from './firebase';
import type { NewsItem, MatchSchedule, AppNotification } from '../types';
import { LATEST_NEWS, ADDITIONAL_NEWS, MATCH_SCHEDULES, INITIAL_NOTIFICATIONS } from '../data/mockData';

export interface FirestoreTournament {
  id: string;
  name: string;
  description?: string;
  rules?: string;
  prizePool: number;
  format?: string;
  status: string;
  platform?: string;
  registrationDeadline?: string;
  registeredPlayersCount?: number;
  maxPlayers?: number;
  registrations?: Array<{
    id: string;
    tournamentId: string;
    playerId: string;
    playerName: string;
    username: string;
    teamName?: string;
    country?: string;
    avatar?: string;
    status: string;
    registeredAt: string;
  }>;
  bracket?: any[];
}

export interface FirestoreLiveArena {
  isLive: boolean;
  matchId: string;
  tournamentName: string;
  player1Name: string;
  player1Score: number;
  player2Name: string;
  player2Score: number;
  currentMinute: number;
  viewerCount: number;
  streamUrl: string;
  resolution?: string;
  fps?: number;
  bitrateKbps?: number;
}

export interface FirestoreCoinOrder {
  id: string;
  playerId: string;
  playerName: string;
  playerUsername: string;
  efootballId: string;
  packageName: string;
  packageCoins: number;
  amountUsd: number;
  paymentMethod: string;
  paymentStatus: 'Verification Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Approved' | 'Rejected';
  orderDate: string;
  transactionRef: string;
}

// Convert Firestore news document into NewsItem format expected by the UI
function transformFirestoreNews(docData: any): NewsItem {
  const contentArray = typeof docData.content === 'string'
    ? docData.content.split('\n\n').filter((p: string) => p.trim())
    : Array.isArray(docData.content) ? docData.content : [docData.excerpt || ''];

  let cat: 'GAME NEWS' | 'TOURNAMENT' | 'COINS' | 'PLAYER NEWS' = 'GAME NEWS';
  const rawCat = (docData.category || '').toUpperCase();
  if (rawCat.includes('TOURN')) cat = 'TOURNAMENT';
  else if (rawCat.includes('COIN')) cat = 'COINS';
  else if (rawCat.includes('PLAYER')) cat = 'PLAYER NEWS';

  return {
    id: docData.id,
    category: cat,
    title: docData.title || 'Apex eFootball News',
    date: docData.publishedAt || 'Recent',
    readTime: '3 min read',
    author: docData.author || 'Apex Intel',
    summary: docData.excerpt || (contentArray[0] || '').slice(0, 140) + '...',
    content: contentArray,
    keyHighlights: [
      `Author: ${docData.author || 'Apex Esports'}`,
      `Status: ${docData.status || 'Published'}`,
      `Live on Firestore Database`,
    ],
  };
}

// Convert Firestore match document into MatchSchedule format
function transformFirestoreMatch(docData: any): MatchSchedule {
  let status: 'LIVE' | 'UPCOMING' | 'FINISHED' = 'UPCOMING';
  const rawStatus = (docData.status || '').toUpperCase();
  if (rawStatus === 'LIVE') status = 'LIVE';
  else if (rawStatus === 'COMPLETED' || rawStatus === 'FINISHED') status = 'FINISHED';

  return {
    id: docData.id,
    stage: docData.roundName || docData.tournamentName || 'Apex Bracket',
    time: docData.scheduledTime || 'Scheduled',
    status,
    teamA: {
      name: docData.player1?.name || 'Player 1',
      tag: docData.player1?.team || 'APX-A',
      score: typeof docData.player1?.score === 'number' ? docData.player1.score : undefined,
      avatarBg: '#087BFF',
      player: docData.player1?.username || docData.player1?.name || 'Player 1',
    },
    teamB: {
      name: docData.player2?.name || 'Player 2',
      tag: docData.player2?.team || 'APX-B',
      score: typeof docData.player2?.score === 'number' ? docData.player2.score : undefined,
      avatarBg: '#FF4D4D',
      player: docData.player2?.username || docData.player2?.name || 'Player 2',
    },
    matchTimeMinute: status === 'LIVE' ? "74'" : undefined,
    bracketGroup: docData.tournamentName || 'Season 4 Finals',
  };
}

// Hook for live tournaments from Firestore
export function useTournamentsLive() {
  const [tournaments, setTournaments] = useState<FirestoreTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = collection(db, 'tournaments');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: FirestoreTournament[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as FirestoreTournament);
            });
            setTournaments(list);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('[Firestore] Tournaments snapshot error, using fallback:', err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  return { tournaments, loading };
}

// Hook for live news from Firestore
export function useNewsLive() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = collection(db, 'news');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NewsItem[] = [];
            snapshot.forEach((d) => {
              list.push(transformFirestoreNews({ id: d.id, ...d.data() }));
            });
            setNews(list);
          } else {
            setNews([...LATEST_NEWS, ...ADDITIONAL_NEWS]);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('[Firestore] News snapshot error, using fallback:', err);
          setNews([...LATEST_NEWS, ...ADDITIONAL_NEWS]);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setNews([...LATEST_NEWS, ...ADDITIONAL_NEWS]);
      setLoading(false);
    }
  }, []);

  return { news, loading };
}

// Hook for live matches from Firestore
export function useMatchesLive() {
  const [matches, setMatches] = useState<MatchSchedule[]>(MATCH_SCHEDULES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = collection(db, 'matches');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: MatchSchedule[] = [];
            snapshot.forEach((d) => {
              list.push(transformFirestoreMatch({ id: d.id, ...d.data() }));
            });
            setMatches(list);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('[Firestore] Matches snapshot error:', err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  return { matches, loading };
}

// Hook for live arena broadcast current state
export function useLiveArenaCurrent() {
  const [arena, setArena] = useState<FirestoreLiveArena | null>(null);

  useEffect(() => {
    try {
      const ref = doc(db, 'liveArena', 'current');
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            setArena(snapshot.data() as FirestoreLiveArena);
          }
        },
        (err) => {
          console.warn('[Firestore] LiveArena snapshot error:', err);
        }
      );
      return () => unsubscribe();
    } catch {
      // ignore
    }
  }, []);

  return arena;
}

// Hook for live notifications from Firestore
export function useNotificationsLive() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    try {
      const q = collection(db, 'notifications');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AppNotification[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              let notifType: 'tournament' | 'coins' | 'patch' = 'tournament';
              const t = (data.type || '').toLowerCase();
              if (t.includes('coin')) notifType = 'coins';
              else if (t.includes('match') || t.includes('patch')) notifType = 'patch';

              list.push({
                id: d.id,
                title: data.title || 'Apex Notification',
                message: data.message || '',
                time: data.sentAt || 'Recently',
                read: false,
                type: notifType,
              });
            });
            setNotifications(list);
          }
        },
        (err) => {
          console.warn('[Firestore] Notifications snapshot error:', err);
        }
      );
      return () => unsubscribe();
    } catch {
      // ignore
    }
  }, []);

  return { notifications, setNotifications };
}

// Hook for real-time customer's OWN coin orders from Firestore
export function useCustomerOrdersLive(playerId: string | undefined | null) {
  const [orders, setOrders] = useState<FirestoreCoinOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'coinOrders'), where('playerId', '==', playerId));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: FirestoreCoinOrder[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as FirestoreCoinOrder);
          });
          list.sort((a, b) => (b.orderDate || '').localeCompare(a.orderDate || ''));
          setOrders(list);
          setLoading(false);
        },
        (err) => {
          console.warn('[Firestore] Customer orders listener error:', err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error('[Firestore] Query error:', err);
      setLoading(false);
    }
  }, [playerId]);

  return { orders, loading };
}

// Hook for live player profile from Firestore
export function useLivePlayerDoc(playerId: string | undefined | null) {
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    if (!playerId) {
      setLiveData(null);
      return;
    }

    try {
      const ref = doc(db, 'players', playerId);
      const unsubscribe = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setLiveData(snap.data());
          }
        },
        (err) => {
          console.warn('[Firestore] Live player doc listener error:', err);
        }
      );
      return () => unsubscribe();
    } catch {
      // ignore
    }
  }, [playerId]);

  return liveData;
}
