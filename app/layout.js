import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegister from '@/app/Components/serviceWorkerRegister';
import { LocationProvider } from './context/locationContext';
import { PushProvider } from './context/pushContext';
import Navbar from './Components/Navbar';
import AIFloatingButton from './Components/AIFloatingButton';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <meta name='theme-color' content='#ffffff' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/icons/icon-32.png'
        />
        <meta property='og:url' content='https://ushalli.vercel.app/' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='Ushalli' />
        <meta property='og:description' content='Teman Ibadah dimana saja' />
        <meta
          property='og:image'
          content='https://ushalli.vercel.app/og-image.png'
        />
        <meta name='twitter:card' content='summary_large_image' />
        <meta property='twitter:domain' content='ushalli.vercel.app' />
        <meta property='twitter:url' content='https://ushalli.vercel.app/' />
        <meta name='twitter:title' content='Ushalli' />
        <meta name='twitter:description' content='Teman Ibadah dimana saja' />
        <meta
          name='twitter:image'
          content='https://ushalli.vercel.app/og-image.png'
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pwa-body`}
      >
        <div className='pwa-body'>
          <LocationProvider>
            <PushProvider>
              <ServiceWorkerRegister />
              <Navbar />
              <AIFloatingButton />
              {children}
            </PushProvider>
          </LocationProvider>
        </div>
      </body>
    </html>
  );
}
