import './globals.css';

export const metadata = {
  title: "Sarah's Tasty Foods",
  description: 'Order food and manage restaurant operations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
