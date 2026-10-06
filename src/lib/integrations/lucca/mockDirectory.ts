import type { Employee } from '@/types';
import { addDays, dateOnly } from '@/lib/onboarding';
import { MOCK_MANAGERS } from '@/lib/mockAccounts';

export interface LuccaMockPerson extends Employee {
  managerId: string;
  employmentStatus: 'active' | 'planned';
  legalEntity: string;
  office: string;
  source: 'lucca-mock';
  sourcePersonId: string;
}

const firstNames = [
  'Léa', 'Noé', 'Maya', 'Adam', 'Inès', 'Hugo', 'Lina', 'Sami', 'Jade', 'Elias',
];
const lastNames = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
  'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel',
  'Girard', 'André', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet',
  'François', 'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc',
  'Guérin', 'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin',
  'Mathieu', 'Clément', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine',
  'Chevalier', 'Robin', 'Masson',
];
const departments = [
  'Data Platform',
  'Data Analytics',
  'Data Applications',
  'Data Product',
  'Opérations',
];
const roles = [
  'Data Engineer',
  'Analytics Engineer',
  'Développeur Data',
  'Product Analyst',
  'Operations Manager',
  'Data Analyst',
  'Platform Engineer',
  'Product Manager',
  'Data Scientist',
  'Responsable opérations',
];

function slug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.');
}

/**
 * Jeu de données local qui imite une lecture du Socle RH Lucca.
 * Les adresses .example sont réservées aux exemples et ne peuvent pas recevoir d'email.
 */
export const LUCCA_MOCK_DIRECTORY: LuccaMockPerson[] = Array.from(
  { length: 50 },
  (_, index) => {
    const number = index + 1;
    const firstName = firstNames[index % firstNames.length];
    // Rotate family names independently from the manager/departement assignment.
    const lastName = lastNames[(index * 7) % lastNames.length];
    const departmentIndex = index % departments.length;
    const manager = MOCK_MANAGERS[departmentIndex];
    const employmentStatus = number <= 10 ? 'planned' : 'active';
    const startDate =
      number <= 10
        ? addDays(dateOnly(), (number - 1) * 6 + 1)
        : addDays(dateOnly(), -(number - 10) * 8);
    const localPart = `${slug(firstName)}.${slug(lastName)}.${String(number).padStart(2, '0')}`;

    return {
      id: `emp-${String(number).padStart(2, '0')}`,
      sourcePersonId: `LUCCA-MOCK-${String(number).padStart(3, '0')}`,
      source: 'lucca-mock',
      firstName,
      lastName,
      email: `${localPart}@datainsight.example`,
      role: roles[(number - 1) % roles.length],
      department: departments[departmentIndex],
      startDate,
      employmentStatus,
      legalEntity: 'Data Insight SAS',
      office: 'Paris',
      managerId: manager.id,
      managerName: `${manager.firstName} ${manager.lastName} (${manager.role})`,
      contractSigned: false,
      buddyId: number % 2 === 0 ? 'buddy-camille' : 'buddy-julien',
      completedTaskIds: [],
    };
  }
);

export const HEADCOUNT_PROJECTION = {
  baseline: 50,
  target: 70,
  targetDate: '2027-12-31',
  source: 'scenario-fictif',
} as const;
