import type { Account } from '@/types/manager';

export const DEMO_MANAGERS: Account[] = [
  {
    id: 'manager-antoine',
    appRole: 'manager',
    firstName: 'Antoine',
    lastName: 'Laurent',
    email: 'antoine.laurent@datainsight.io',
    role: 'Head of Data',
    department: 'Data Platform & Analytics',
    startDate: '',
    contractSigned: false,
    buddyId: '',
    managerName: '',
    completedTaskIds: [],
  },
  {
    id: 'manager-claire',
    appRole: 'manager',
    firstName: 'Claire',
    lastName: 'Vasseur',
    email: 'claire.vasseur@datainsight.io',
    role: 'VP Engineering',
    department: 'Data Applications',
    startDate: '',
    contractSigned: false,
    buddyId: '',
    managerName: '',
    completedTaskIds: [],
  },
];
