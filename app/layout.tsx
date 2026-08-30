import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { FooterGate } from '@/components/footer-gate'
import { ToasterProvider } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Campozy | Africa\'s Student Trust Network',
    template: '%s | Campozy'
  },
  description: 'The definitive student trust network for Africa. Housing intelligence, verified scores, and campus communities built by students for students.',
  keywords: ['student housing', 'hostels africa', 'university accommodation', 'verified reviews', 'student community'],
  authors: [{ name: 'Campozy Team' }],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://campozy.com',
    siteName: 'Campozy',
    images: [{
      url: '/logo.svg',
      width: 1200,
      height: 630,
      alt: 'Campozy Trust Network'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campozy | Student Trust Network',
    description: 'Transforming student life in Africa through trust and intelligence.',
    images: ['/logo.svg'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased text-neutral-900">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <ToasterProvider>
          <Navbar />
          <main className="flex-1 pb-4 lg:pb-0">
            {children}
          </main>
          <FooterGate />
        </ToasterProvider>
      </body>
    </html>
  )
}
