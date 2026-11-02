import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  getDocFromServer,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  QuerySnapshot,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore targeting the EXACT shared database ID
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

let isConnected = false;

/**
 * Validates connection to the live Cloud Firestore database
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Quick probe to settings or tournaments to verify live server connectivity
    await getDocFromServer(doc(db, 'settings', 'global'));
    isConnected = true;
    return true;
  } catch (err: unknown) {
    // If settings/global probe succeeded or returned permission check, server is reached
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('offline')) {
      console.warn('[Firebase] Client is offline or database unreachable');
      isConnected = false;
      return false;
    }
    isConnected = true;
    return true;
  }
}

// Trigger initial probe silently
testFirestoreConnection().catch(() => {});

export {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  setDoc,
  updateDoc,
  arrayUnion,
};
export type { QuerySnapshot, DocumentData, Unsubscribe };
