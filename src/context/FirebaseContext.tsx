/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  User,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from "../lib/firebase";

export interface FirebaseNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: "general" | "architecture" | "jvm" | "vscode" | "dependencies" | "build" | "cache";
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseProject {
  id: string;
  userId: string;
  name: string;
  packageName: string;
  versionName: string;
  targetSdk: number;
  language: string;
  activeModules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  userId: string;
  title: string;
  type: "learned" | "todo" | "not_to_do" | "best_practice";
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface DevEnvConfig {
  id: string;
  userId: string;
  jvmVersion: string;
  gradleVersion: string;
  vscodeExtensions: string[];
  cachePolicy: string;
  dependencyNotes: string;
  updatedAt: string;
}

interface FirebaseContextType {
  user: User | null;
  authLoading: boolean;
  connectionStatus: {
    connected: boolean;
    message: string;
    latencyMs: number;
  } | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Notes
  notes: FirebaseNote[];
  addNote: (note: Omit<FirebaseNote, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  // Projects
  cloudProjects: FirebaseProject[];
  saveProjectToCloud: (project: Omit<FirebaseProject, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  deleteCloudProject: (id: string) => Promise<void>;
  // Knowledge (Öğrenilenler / Yapılacak / Yapılmayacaklar)
  knowledgeItems: KnowledgeItem[];
  addKnowledgeItem: (item: Omit<KnowledgeItem, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  toggleKnowledgeStatus: (id: string, currentStatus: "active" | "completed" | "archived") => Promise<void>;
  deleteKnowledgeItem: (id: string) => Promise<void>;
  // Dev Env & VSCode & JVM & Önbellek
  devConfig: DevEnvConfig | null;
  saveDevConfig: (config: Omit<DevEnvConfig, "id" | "userId" | "updatedAt">) => Promise<void>;
  // Utilities
  refreshConnection: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);

  const [notes, setNotes] = useState<FirebaseNote[]>([]);
  const [cloudProjects, setCloudProjects] = useState<FirebaseProject[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [devConfig, setDevConfig] = useState<DevEnvConfig | null>(null);

  // Connection health probe
  const probeConnection = async () => {
    const status = await testFirestoreConnection();
    setConnectionStatus(status);
  };

  useEffect(() => {
    probeConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sign In with Google
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      await probeConnection();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      throw err;
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setNotes([]);
      setCloudProjects([]);
      setKnowledgeItems([]);
      setDevConfig(null);
    } catch (err: any) {
      console.error("Sign-Out Error:", err);
    }
  };

  // Real-time Firestore Listeners (only when authenticated)
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setCloudProjects([]);
      setKnowledgeItems([]);
      setDevConfig(null);
      return;
    }

    const userId = user.uid;

    // 1. Notes listener
    const notesPath = "notes";
    const notesQuery = query(collection(db, notesPath), where("userId", "==", userId));
    const unsubNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        const loaded: FirebaseNote[] = [];
        snapshot.forEach((d) => {
          loaded.push({ id: d.id, ...d.data() } as FirebaseNote);
        });
        setNotes(loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, notesPath);
      }
    );

    // 2. Projects listener
    const projectsPath = "projects";
    const projectsQuery = query(collection(db, projectsPath), where("userId", "==", userId));
    const unsubProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const loaded: FirebaseProject[] = [];
        snapshot.forEach((d) => {
          loaded.push({ id: d.id, ...d.data() } as FirebaseProject);
        });
        setCloudProjects(loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, projectsPath);
      }
    );

    // 3. Knowledge Items listener (Öğrenilenler, Yapılacaklar, Yapılmayacaklar)
    const knowledgePath = "knowledge";
    const knowledgeQuery = query(collection(db, knowledgePath), where("userId", "==", userId));
    const unsubKnowledge = onSnapshot(
      knowledgeQuery,
      (snapshot) => {
        const loaded: KnowledgeItem[] = [];
        snapshot.forEach((d) => {
          loaded.push({ id: d.id, ...d.data() } as KnowledgeItem);
        });
        setKnowledgeItems(loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, knowledgePath);
      }
    );

    // 4. Dev Environments listener (VSCode, JVM, Cache, Dependencies)
    const devEnvPath = "dev_environments";
    const devEnvQuery = query(collection(db, devEnvPath), where("userId", "==", userId));
    const unsubDevEnv = onSnapshot(
      devEnvQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const firstDoc = snapshot.docs[0];
          setDevConfig({ id: firstDoc.id, ...firstDoc.data() } as DevEnvConfig);
        } else {
          // Default initial template if empty
          setDevConfig({
            id: `env-${userId.slice(0, 8)}`,
            userId,
            jvmVersion: "OpenJDK 21.0.5 LTS (Android 15 AGP 8.7)",
            gradleVersion: "Gradle 8.7",
            vscodeExtensions: [
              "vscjava.vscode-java-pack",
              "fwcd.kotlin",
              "mathiasfrohlich.Kotlin",
              "ms-vscode.cpptools",
              "rust-lang.rust-analyzer",
              "Dart-Code.flutter",
            ],
            cachePolicy: "aggressive-gradle-daemon-cache-enabled",
            dependencyNotes: "AndroidX Core KTX 1.15, Jetpack Compose 1.7, Kotlin Coroutines 1.9, NDK r27c 16KB compliant",
            updatedAt: new Date().toISOString(),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, devEnvPath);
      }
    );

    return () => {
      unsubNotes();
      unsubProjects();
      unsubKnowledge();
      unsubDevEnv();
    };
  }, [user]);

  // Add Note
  const addNote = async (noteData: Omit<FirebaseNote, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("Lütfen önce Google ile oturum açın.");
    const noteId = "note-" + Date.now();
    const docPath = `notes/${noteId}`;
    const now = new Date().toISOString();
    const newNote: FirebaseNote = {
      ...noteData,
      id: noteId,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, "notes", noteId), newNote);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  };

  // Delete Note
  const deleteNote = async (id: string) => {
    if (!user) return;
    const docPath = `notes/${id}`;
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // Save Project to Cloud
  const saveProjectToCloud = async (
    projectData: Omit<FirebaseProject, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    if (!user) throw new Error("Lütfen önce Google ile oturum açın.");
    const projectId = "proj-" + Date.now();
    const docPath = `projects/${projectId}`;
    const now = new Date().toISOString();
    const newProject: FirebaseProject = {
      ...projectData,
      id: projectId,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, "projects", projectId), newProject);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  };

  // Delete Cloud Project
  const deleteCloudProject = async (id: string) => {
    if (!user) return;
    const docPath = `projects/${id}`;
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // Add Knowledge Item (Öğrenilenler / Yapılacak / Yapılmayacaklar)
  const addKnowledgeItem = async (
    itemData: Omit<KnowledgeItem, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    if (!user) throw new Error("Lütfen önce Google ile oturum açın.");
    const itemId = "know-" + Date.now();
    const docPath = `knowledge/${itemId}`;
    const now = new Date().toISOString();
    const newItem: KnowledgeItem = {
      ...itemData,
      id: itemId,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, "knowledge", itemId), newItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  };

  // Toggle Knowledge Status
  const toggleKnowledgeStatus = async (
    id: string,
    currentStatus: "active" | "completed" | "archived"
  ) => {
    if (!user) return;
    const docPath = `knowledge/${id}`;
    const nextStatus = currentStatus === "active" ? "completed" : "active";
    try {
      await setDoc(
        doc(db, "knowledge", id),
        { status: nextStatus, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  // Delete Knowledge Item
  const deleteKnowledgeItem = async (id: string) => {
    if (!user) return;
    const docPath = `knowledge/${id}`;
    try {
      await deleteDoc(doc(db, "knowledge", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // Save Dev Config (VSCode, JVM, Cache, Dependencies)
  const saveDevConfig = async (
    configData: Omit<DevEnvConfig, "id" | "userId" | "updatedAt">
  ) => {
    if (!user) throw new Error("Lütfen önce Google ile oturum açın.");
    const envId = devConfig?.id || `env-${user.uid.slice(0, 8)}`;
    const docPath = `dev_environments/${envId}`;
    const payload: DevEnvConfig = {
      ...configData,
      id: envId,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "dev_environments", envId), payload);
      setDevConfig(payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authLoading,
        connectionStatus,
        signInWithGoogle,
        signOut,
        notes,
        addNote,
        deleteNote,
        cloudProjects,
        saveProjectToCloud,
        deleteCloudProject,
        knowledgeItems,
        addKnowledgeItem,
        toggleKnowledgeStatus,
        deleteKnowledgeItem,
        devConfig,
        saveDevConfig,
        refreshConnection: probeConnection,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
