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

export const DEMO_SERVICES: Account[] = [
  {
    ...DEMO_MANAGERS[0],
    id: 'service-rh',
    appRole: 'rh',
    firstName: 'Sonia',
    lastName: '',
    email: 'rh@datainsight.io',
    role: 'Responsable RH',
    department: 'Ressources humaines',
  },
  {
    ...DEMO_MANAGERS[0],
    id: 'service-it',
    appRole: 'it',
    firstName: 'Équipe',
    lastName: 'IT',
    email: 'it@datainsight.io',
    role: 'Support informatique',
    department: 'Informatique',
  },
];
export const DEMO_STAFF = [...DEMO_MANAGERS, ...DEMO_SERVICES];
