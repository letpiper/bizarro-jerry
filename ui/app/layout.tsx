import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SimulatedWorld Dashboard',
  description: 'Web UI for SimulatedWorld observability and control',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
