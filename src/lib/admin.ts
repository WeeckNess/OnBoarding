import type { HrCompliance, OnboardingRecord } from '@/types/manager';

export const HR_COMPLIANCE_ITEMS = [
  { key: 'dpae', label: 'DPAE', description: 'Déclaration préalable à l’embauche' },
  { key: 'mutuelle', label: 'Mutuelle', description: 'Affiliation à la complémentaire santé' },
  { key: 'rib', label: 'RIB', description: 'Coordonnées bancaires pour la paie' },
  { key: 'identity', label: 'Pièce d’identité', description: 'Document d’identité reçu et vérifié' },
  { key: 'socialSecurity', label: 'Attestation Sécurité sociale', description: 'Justificatif de droits reçu' },
  { key: 'itCharter', label: 'Charte informatique', description: 'Signature enregistrée avec le dossier' },
] as const satisfies { key: keyof HrCompliance; label: string; description: string }[];

export function getHrCompliance(record: OnboardingRecord): HrCompliance {
  return {
    dpae: record.hrCompliance?.dpae || 'pending',
    mutuelle: record.hrCompliance?.mutuelle || 'pending',
    rib: record.hrCompliance?.rib || 'pending',
    identity: record.hrCompliance?.identity || 'pending',
    socialSecurity: record.hrCompliance?.socialSecurity || 'pending',
    itCharter: record.hrCompliance?.itCharter || 'pending',
  };
}

export function addMonths(value: string, months: number) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(value: string, today: string) {
  return Math.round(
    (Date.parse(`${value.slice(0, 10)}T12:00:00Z`) -
      Date.parse(`${today.slice(0, 10)}T12:00:00Z`)) /
      86400000
  );
}

export function missingComplianceCount(record: OnboardingRecord) {
  const status = getHrCompliance(record);
  return HR_COMPLIANCE_ITEMS.filter((item) => status[item.key] !== 'complete').length;
}

export function openBlockingRequests(record: OnboardingRecord) {
  return record.requests.filter((request) => request.blocking && request.status !== 'ready');
}
