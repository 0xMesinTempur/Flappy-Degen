import type { Metadata } from "next";

import { getSession } from "~/auth"
import "~/app/globals.css";
import { Providers } from './providers';
import { 
  APP_NAME, 
  APP_DESCRIPTION, 
  APP_ICON_URL, 
  APP_SPLASH_URL, 
  APP_SPLASH_BACKGROUND_COLOR 
} from "~/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: APP_ICON_URL,
    apple: APP_ICON_URL,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': APP_NAME,
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': APP_SPLASH_BACKGROUND_COLOR,
    'msapplication-config': '/browserconfig.xml',
    'theme-color': APP_SPLASH_BACKGROUND_COLOR,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content={APP_SPLASH_BACKGROUND_COLOR} />
        <meta name="theme-color" content={APP_SPLASH_BACKGROUND_COLOR} />
        
        {/* Splash Screen Images for different devices */}
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" 
          href="/splash.png" 
        />
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" 
          href="/splash.png" 
        />
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" 
          href="/splash.png" 
        />
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" 
          href="/splash.png" 
        />
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" 
          href="/splash.png" 
        />
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" 
          href="/splash.png" 
        />
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" 
          href="/splash.png" 
        />
        <link 
          rel="apple-touch-startup-image" 
          media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" 
          href="/splash.png" 
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
