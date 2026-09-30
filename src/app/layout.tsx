import type { Metadata } from 'next';
import './globals.css';
import { OnboardingProvider } from '@/context/OnboardingContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Parcours d’intégration | Data Insight',
  description: 'Parcours d’intégration salarié et portail de préparation manager Data Insight',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#141518] text-[#f6f5f2] min-h-screen antialiased selection:bg-zinc-100 selection:text-[#141518]">
        <OnboardingProvider>
          <div className="min-h-screen bg-[radial-gradient(ellipse_80%_70%_at_50%_-15%,rgba(255,255,255,0.035),rgba(20,21,24,0))]">
            <AppShell>
              {children}
            </AppShell>
          </div>
        </OnboardingProvider>
      </body>
    </html>
  );
}
