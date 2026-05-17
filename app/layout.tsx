import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://food-delivery-performance-analytics-dashboard.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Food Delivery Performance Analytics Dashboard',
    template: '%s | Food Delivery Analytics',
  },
  description:
    'Executive analytics dashboard for food delivery operations, customer behavior, restaurant performance, revenue quality, cancellation risk, and delivery efficiency.',
  keywords: [
    'Food Delivery Analytics',
    'Operations Analytics',
    'Customer Analytics',
    'Delivery Performance Dashboard',
    'Next.js Dashboard',
    'Recharts',
    'SQL Analytics',
    'BI Portfolio',
  ],
  authors: [{ name: 'Shivam Mahajan' }],
  creator: 'Shivam Mahajan',
  openGraph: {
    title: 'Food Delivery Performance Analytics Dashboard',
    description:
      'Recruiter-ready food delivery BI platform with executive KPIs, customer analytics, delivery operations, and restaurant insights.',
    url: siteUrl,
    siteName: 'Food Delivery Analytics Portfolio',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Food Delivery Performance Analytics Dashboard',
    description: 'Professional operations analytics dashboard built with Next.js, TypeScript, and Recharts.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#f5f7fb',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
