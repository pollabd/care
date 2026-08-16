import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Secure Notes',
  description: 'Secure note-taking platform with role-based access control'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
