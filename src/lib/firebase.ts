/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: getFirestore must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler throwing structured JSON
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Tests connection to Firestore backend using getDocFromServer
 */
export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs: number;
}> {
  const start = performance.now();
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    const latency = Math.round(performance.now() - start);
    return {
      connected: true,
      message: "Firestore bağlantısı başarıyla kuruldu.",
      latencyMs: latency,
    };
  } catch (error: any) {
    const latency = Math.round(performance.now() - start);
    if (error instanceof Error && error.message.includes("the client is offline")) {
      return {
        connected: false,
        message: "İstemci çevrimdışı. Firebase yapılandırmasını kontrol edin.",
        latencyMs: latency,
      };
    }
    // Permissions or not-found are still proof of server reachability
    return {
      connected: true,
      message: "Firestore sunucusuna erişildi (Test dokümanı mevcut değil veya okuma kuralı devrede).",
      latencyMs: latency,
    };
  }
}

export {
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
};
export type { User };
