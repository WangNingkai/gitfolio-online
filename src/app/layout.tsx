import type { Metadata } from 'next'
import { Poppins, Questrial } from 'next/font/google'
import '@/styles/globals.css'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const questrial = Questrial({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-questrial',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gitfolio Online',
  description: 'A portfolio website for everyone to showcase their GitHub work',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.1.0/css/all.min.css"
        />
      </head>
      <body className={`${poppins.variable} ${questrial.variable}`}>{children}</body>
    </html>
  )
}
