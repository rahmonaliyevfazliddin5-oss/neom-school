import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '../styles/globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NEOM SCHOOL — Zamonaviy xususiy maktab',
  description:
    'NEOM SCHOOL maktab boshqaruv platformasi — davomat, sinflar, o‘quvchilar va ta’lim jarayonlari nazorati.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={poppins.variable}>
      <body className="min-h-screen font-sans bg-[#f4f7fc] text-[#0b2a5b]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
