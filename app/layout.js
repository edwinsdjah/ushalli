import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegister from '@/app/Components/serviceWorkerRegister';
import { LocationProvider } from './context/locationContext';
import { PushProvider } from './context/pushContext';
import Navbar from './Components/Navbar';

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pwa-body`}
      >
        <div className='pwa-body'>
          <LocationProvider>
            <PushProvider>
              <ServiceWorkerRegister />
              <Navbar />
              {children}
            </PushProvider>
          </LocationProvider>
        </div>
      </body>
    </html>
  );
}
