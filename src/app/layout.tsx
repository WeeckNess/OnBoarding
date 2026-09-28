import type { Metadata } from 'next';
import './globals.css';
import { OnboardingProvider } from '@/context/OnboardingContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Onboarding Data Insight | Midi Agency',
  description: 'Plateforme d’onboarding nouvelle génération pour les salariés de Data Insight',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        <OnboardingProvider>
          <div className="min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(19,107,252,0.15),rgba(255,255,255,0))]">
            <AppShell>
              {children}
            </AppShell>
          </div>
        </OnboardingProvider>
      </body>
    </html>
  );
}
