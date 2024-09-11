import Navbar from "@/components/navbar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      {children}
    </div>
  );
}