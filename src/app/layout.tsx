import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WhatsApp Agent | Calendar-Driven Messaging Automation',
  description: 'AI-driven conversational widget and automation system to schedule WhatsApp messages to individuals and groups based on Google Calendar events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-[#25d366]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
