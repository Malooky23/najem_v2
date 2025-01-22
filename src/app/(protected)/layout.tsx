import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 relative bg-background">
        <div className="absolute inset-0 overflow-auto">
          <div className="h-full p-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
