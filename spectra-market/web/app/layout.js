import '../../web/styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'Pritam Market',
  description: 'Modern NFT marketplace'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}