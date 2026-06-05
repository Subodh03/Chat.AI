import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'AI Chatbot',
  description: 'Your intelligent AI companion',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
