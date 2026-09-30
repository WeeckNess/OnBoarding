'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, BuddyInfo, RoadmapTask, CodexArticle } from '@/types';
import { INITIAL_EMPLOYEES, BUDDIES_DATA, ROADMAP_TASKS, CODEX_ARTICLES, MILESTONES, CONTRACT_TASK_ID } from '@/lib/mockData';

interface OnboardingContextType {
  currentUser: Employee | null;
  currentBuddy: BuddyInfo | null;
  tasks: RoadmapTask[];
  completedTaskIds: string[];
  progressPercentage: number;
  codexArticles: CodexArticle[];
  milestones: typeof MILESTONES;
  loginUser: (email: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;
  signContract: (signatureImage: string) => void;
  toggleTask: (taskId: string) => void;
  resetProgress: () => void;
  isLoaded: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'midi_onboarding_user';
const STORAGE_KEY_TASKS = 'midi_onboarding_completed_tasks';
const STORAGE_KEY_TOUR = 'midi_onboarding_tour_completed';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      }
      if (storedTasks) {
        setCompletedTaskIds(JSON.parse(storedTasks));
      }
    } catch (e) {
      console.error('Failed to load storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveUserState = (user: Employee | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  };

  const loginUser = async (email: string, firstName?: string, lastName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let user = INITIAL_EMPLOYEES.find(e => e.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: `emp-${Date.now()}`,
        firstName: firstName || cleanEmail.split('@')[0].split('.')[0] || 'Nouveau',
        lastName: lastName || cleanEmail.split('@')[0].split('.')[1] || 'Collaborateur',
        email: cleanEmail,
        role: 'Data Engineer / Analytics',
        department: 'Équipe Data Platform',
        startDate: new Date().toISOString().split('T')[0],
        contractSigned: false,
        buddyId: 'buddy-camille',
        managerName: 'Antoine Laurent (Head of Data)',
        completedTaskIds: [],
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`
      };
    }

    saveUserState(user);
    return { success: true };
  };

  const logoutUser = () => {
    saveUserState(null);
    setCompletedTaskIds([]);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_TOUR);
  };

  const signContract = (signatureImage: string) => {
    if (!currentUser) return;
    const updated: Employee = {
      ...currentUser,
      contractSigned: true,
      signatureDate: new Date().toISOString(),
      signatureImage,
      completedTaskIds: Array.from(new Set([...completedTaskIds, CONTRACT_TASK_ID]))
    };
    saveUserState(updated);
    
    // La signature valide aussi la tâche correspondante de la roadmap.
    const nextTasks = Array.from(new Set([...completedTaskIds, CONTRACT_TASK_ID]));
    setCompletedTaskIds(nextTasks);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(nextTasks));
  };

  const toggleTask = (taskId: string) => {
    // Le contrat ne se valide qu'en le signant (voir signContract) : on ne
    // peut ni le « cocher » sans signature, ni l'annuler d'un clic.
    if (taskId === CONTRACT_TASK_ID) return;

    // Calculé hors du « updater » de setState : un updater doit rester pur
    // (React peut l'appeler deux fois en mode strict).
    const exists = completedTaskIds.includes(taskId);
    const next = exists ? completedTaskIds.filter(id => id !== taskId) : [...completedTaskIds, taskId];
    setCompletedTaskIds(next);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(next));
  };

  const resetProgress = () => {
    // 1. Clear all task state & storage
    setCompletedTaskIds([]);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_TOUR);

    // 2. Reset user's contract state in state & storage
    if (currentUser) {
      const resetUser: Employee = {
        ...currentUser,
        contractSigned: false,
        signatureDate: undefined,
        signatureImage: undefined,
        completedTaskIds: []
      };
      saveUserState(resetUser);
    }
  };

  const currentBuddy: BuddyInfo = currentUser 
    ? (BUDDIES_DATA[currentUser.buddyId] || BUDDIES_DATA['buddy-camille'])
    : BUDDIES_DATA['buddy-camille'];

  const progressPercentage = ROADMAP_TASKS.length > 0 
    ? Math.round((completedTaskIds.length / ROADMAP_TASKS.length) * 100) 
    : 0;

  return (
    <OnboardingContext.Provider
      value={{
        currentUser,
        currentBuddy,
        tasks: ROADMAP_TASKS,
        completedTaskIds,
        progressPercentage,
        codexArticles: CODEX_ARTICLES,
        milestones: MILESTONES,
        loginUser,
        logoutUser,
        signContract,
        toggleTask,
        resetProgress,
        isLoaded
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
