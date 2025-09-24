import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'LungVision AI',
  description: 'AI-powered lung cancer detection for medical professionals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthProvider>
          <SidebarProvider>
            <div className="flex h-full">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
