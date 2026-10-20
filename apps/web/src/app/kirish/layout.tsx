import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kirish — NEOM School',
  robots: {
    index: false,
    follow: false,
  },
};

export default function KirishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
