import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PandaSub IL - ניהול מינויים חכם',
  description: 'המערכת החכמה לניהול מינויים אישיים, מעקב הוצאות ותזכורות אוטומטיות',
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
        <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        {children}
      </body>
    </html>
  );
}
