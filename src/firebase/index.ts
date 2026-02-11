
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase services correctly for both local and deployment environments.
 * Uses the firebaseConfig object directly to avoid initialization errors.
 */
export function initializeFirebase() {
  try {
    if (!getApps().length) {
      // Always initialize with config object to be safe in all environments
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    }
    return getSdks(getApp());
  } catch (error) {
    console.warn("Firebase fallback initialization:", error);
    // In some server-side or early build contexts, app might not be available
    const fallbackApp = initializeApp(firebaseConfig, "fallback-" + Math.random());
    return getSdks(fallbackApp);
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
