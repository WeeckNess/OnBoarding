import type { Employee, RoadmapTask } from './index';

export type AppRole = 'manager' | 'employee' | 'admin';
export type Account = Employee & { appRole: AppRole };
export type RequestStatus = 'requested' | 'in_progress' | 'ready' | 'blocked';
export interface PreparationRequest {
  id: string;
  kind: 'hardware' | 'access';
  title: string;
  details: string;
  owner: 'IT' | 'RH' | 'Manager';
  dueDate: string;
  status: RequestStatus;
  blocking: boolean;
  note: string;
}
export interface ManagedTask extends RoadmapTask {
  owner: 'employee' | 'manager';
  dueDate: string;
}
export type ComplianceStatus = 'pending' | 'complete';
export interface HrCompliance {
  dpae: ComplianceStatus;
  mutuelle: ComplianceStatus;
  rib: ComplianceStatus;
  identity: ComplianceStatus;
  socialSecurity: ComplianceStatus;
  itCharter: ComplianceStatus;
}
export interface OnboardingRecord {
  employee: Employee;
  managerId: string;
  version: number;
  hrCompliance?: HrCompliance;
  welcome: { host: string; location: string; time: string; message: string };
  requests: PreparationRequest[];
  documents: {
    id: string;
    title: string;
    status: 'pending' | 'signed';
    signedAt?: string;
  }[];
  tasks: ManagedTask[];
  goals: { id: string; title: string; dueDate: string; done: boolean }[];
  meetings: {
    id: string;
    title: string;
    dueDate: string;
    done: boolean;
    notes: string;
  }[];
  blockers: {
    id: string;
    title: string;
    createdAt: string;
    resolvedAt?: string;
    response?: string;
  }[];
  feedback: { rating: number; comment: string; updatedAt: string } | null;
  notifications: {
    id: string;
    message: string;
    createdAt: string;
    read: boolean;
  }[];
  activity: { id: string; actor: string; label: string; createdAt: string }[];
}
export interface Workspace {
  account: Account | null;
  records: OnboardingRecord[];
}
export type OnboardingAction =
  | {
      type: 'welcome';
      host: string;
      location: string;
      time: string;
      message: string;
      buddyId: string;
    }
  | {
      type: 'request.save';
      request: Omit<PreparationRequest, 'id'> & { id?: string };
    }
  | {
      type: 'task.save';
      task: Omit<ManagedTask, 'id' | 'dayNumber'> & { id?: string };
    }
  | { type: 'task.toggle'; id: string; done: boolean }
  | { type: 'task.delete'; id: string }
  | {
      type: 'goal.save';
      id?: string;
      title: string;
      dueDate: string;
      done: boolean;
    }
  | {
      type: 'meeting.save';
      id: string;
      dueDate: string;
      done: boolean;
      notes: string;
    }
  | { type: 'blocker.create'; title: string }
  | { type: 'blocker.resolve'; id: string; response: string }
  | { type: 'coffee.reserve'; time: string }
  | { type: 'feedback'; rating: number; comment: string }
  | { type: 'reminder'; message: string }
  | { type: 'notification.read'; id: string }
  | { type: 'hr.compliance.set'; key: keyof HrCompliance; status: ComplianceStatus }
  | { type: 'sign'; signatureImage: string }
  | { type: 'reset' };
