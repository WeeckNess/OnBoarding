import type { Metadata } from 'next';
import './globals.css';
import { OnboardingProvider } from '@/context/OnboardingContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Onboarding Data Insight | Midi Agency',
  description: 'Plateforme d’onboarding nouvelle génération conçue par Midi Agency',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#141518] text-[#f6f5f2] min-h-screen antialiased selection:bg-brand-500 selection:text-[#141518]">
        <OnboardingProvider>
          <div className="min-h-screen bg-[radial-gradient(ellipse_80%_70%_at_50%_-15%,rgba(222,175,74,0.10),rgba(20,21,24,0))]">
            <AppShell>
              {children}
            </AppShell>
          </div>
        </OnboardingProvider>
      </body>
    </html>
  );
}
