import Navbar from "@/components/navbar"

interface RootLayoutProps {
  children: React.ReactNode;
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        {children}
        </body>
    </html>
  )
}
