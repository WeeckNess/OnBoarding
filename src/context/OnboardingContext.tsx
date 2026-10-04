'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BuddyInfo, RoadmapTask, CodexArticle } from '@/types';
import { BUDDIES_DATA, CODEX_ARTICLES, MILESTONES } from '@/lib/mockData';
import type {
  Account,
  OnboardingAction,
  OnboardingRecord,
  Workspace,
} from '@/types/manager';

interface OnboardingContextType {
  currentUser: Account | null;
  currentBuddy: BuddyInfo | null;
  tasks: RoadmapTask[];
  completedTaskIds: string[];
  progressPercentage: number;
  codexArticles: CodexArticle[];
  milestones: typeof MILESTONES;
  records: OnboardingRecord[];
  currentRecord: OnboardingRecord | null;
  loginUser: (email: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => Promise<void>;
  signContract: (signatureImage: string) => Promise<boolean>;
  toggleTask: (taskId: string) => Promise<boolean>;
  resetProgress: () => Promise<void>;
  mutate: (
    id: string,
    action: OnboardingAction,
    version?: number
  ) => Promise<boolean>;
  refresh: () => Promise<void>;
  error: string;
  clearError: () => void;
  saving: boolean;
  isLoaded: boolean;
  demoResetEnabled: boolean;
  demoProfileSwitchEnabled: boolean;
}
const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.error || 'Le serveur est indisponible.') as Error & { code?: string };
    error.code = body.code;
    throw error;
  }
  return body;
}
export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, setWorkspace] = useState<Workspace>({
    account: null,
    records: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++sequence.current;
    try {
      const result = await api<Workspace>('/api/workspace');
      if (current === sequence.current) setWorkspace(result);
    } catch (e) {
      if (current === sequence.current)
        setError(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setIsLoaded(true);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const update = () => {
      if (!busy.current && document.visibilityState === 'visible')
        void refresh();
    };
    const interval = setInterval(update, 10000);
    window.addEventListener('focus', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', update);
      sequence.current++;
    };
  }, [refresh]);
  const loginUser = async (email: string) => {
    setError('');
    const requestedEmail = email.trim().toLowerCase();
    sequence.current++;
    try {
      await api('/api/session', {
        method: 'POST',
        body: JSON.stringify({ email: requestedEmail }),
      });
      const result = await api<Workspace>('/api/workspace');
      sequence.current++;
      if (result.account?.email?.toLowerCase() !== requestedEmail) {
        setWorkspace({ account: null, records: [] });
        throw new Error(
          'Le compte chargé ne correspond pas à cette adresse email.'
        );
      }
      setWorkspace(result);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Connexion impossible.';
      setError(message);
      return { success: false, message };
    }
  };
  const logoutUser = async () => {
    try {
      await api('/api/session', { method: 'DELETE', body: '{}' });
      sequence.current++;
      setWorkspace({ account: null, records: [] });
      setError('');
      localStorage.removeItem('midi_onboarding_tour_completed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Déconnexion impossible.');
    }
  };
  const mutate = async (
    id: string,
    action: OnboardingAction,
    version?: number
  ) => {
    if (busy.current) return false;
    const record = workspace.records.find((r) => r.employee.id === id);
    if (!record) return false;
    busy.current = true;
    setSaving(true);
    setError('');
    sequence.current++;
    try {
      const next = await api<OnboardingRecord>(
        `/api/onboardings/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ version: version ?? record.version, action }),
        }
      );
      sequence.current++;
      setWorkspace((previous) => ({
        account:
          previous.account?.id === id
            ? { ...next.employee, appRole: 'employee' }
            : previous.account,
        records: previous.records.map((r) => (r.employee.id === id ? next : r)),
      }));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
      await refresh();
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const currentRecord =
    workspace.records.find((r) => r.employee.id === workspace.account?.id) ||
    null;
  const tasks =
    currentRecord?.tasks.filter((t) => t.owner === 'employee') || [];
  const completedTaskIds =
    currentRecord?.employee.completedTaskIds.filter((id) =>
      tasks.some((t) => t.id === id)
    ) || [];
  const toggleTask = async (id: string) => {
    if (!currentRecord) return false;
    return mutate(currentRecord.employee.id, {
      type: 'task.toggle',
      id,
      done: !completedTaskIds.includes(id),
    });
  };
  const signContract = async (signatureImage: string) =>
    currentRecord
      ? mutate(currentRecord.employee.id, { type: 'sign', signatureImage })
      : false;
  const resetProgress = async () => {
    if (
      currentRecord &&
      (await mutate(currentRecord.employee.id, { type: 'reset' }))
    )
      localStorage.removeItem('midi_onboarding_tour_completed');
  };
  return (
    <OnboardingContext.Provider
      value={{
        currentUser: workspace.account,
        currentBuddy: workspace.account
          ? BUDDIES_DATA[workspace.account.buddyId] || null
          : null,
        currentRecord,
        records: workspace.records,
        tasks,
        completedTaskIds,
        progressPercentage: tasks.length
          ? Math.round((completedTaskIds.length / tasks.length) * 100)
          : 0,
        codexArticles: CODEX_ARTICLES,
        milestones: MILESTONES,
        loginUser,
        logoutUser,
        signContract,
        toggleTask,
        resetProgress,
        mutate,
        refresh,
        error,
        clearError: () => setError(''),
        saving,
        isLoaded,
        demoResetEnabled: workspace.features?.demoReset === true,
        demoProfileSwitchEnabled: workspace.features?.profileSwitch === true,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  return context;
}
