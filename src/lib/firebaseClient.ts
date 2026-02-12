import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

// Singleton initialization pattern to prevent multiple instances
let app: any;
let auth: any;
let db: any;

try {
  // Use the standard configuration provided in src/firebase/config.ts
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  if (typeof window !== "undefined") {
    console.error("Firebase singleton initialization failed:", error);
  }
}

export { app, auth, db };
