import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import {Header}  from "@/components/layout/header";
import { Providers } from "@/components/providers";
import {Toaster} from "@/components/ui/toaster";
import { Header } from "@/components/layout/header/page";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Najem Aleen Shipping",
  description: "Shipping and Logistics Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
        <Providers>


      <body className={`${inter.className} h-full bg-gray-50 overflow-hidden`}>
          <div className="h-full flex flex-col">
            <Header />
            <div className="flex-1 pt-12">
              {children}
            </div>
            <Toaster />
          </div>
      </body>
        </Providers>
    </html>
  );
}
