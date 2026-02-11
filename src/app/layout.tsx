import type {Metadata, Viewport} from 'next';
import './globals.css';
import { SubscriptionsProvider } from '@/context/subscriptions-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export const metadata: Metadata = {
  title: 'PandaSub IL - ניהול מינויים חכם',
  description: 'המערכת החכמה לניהול מינויים אישיים, מעקב הוצאות ותזכורות אוטומטיות',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PandaSub IL',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a73e8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Heebo:wght@100..900&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-body antialiased bg-background overflow-x-hidden">
        <SubscriptionsProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full flex-row-reverse">
              <AppSidebar />
              <div className="flex-1 flex flex-col w-full overflow-x-hidden">
                {children}
              </div>
            </div>
          </SidebarProvider>
        </SubscriptionsProvider>
      </body>
    </html>
  );
}
