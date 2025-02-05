// app/profile/page.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth"; // Assume you have auth setup
import { db } from "@/server/db";
import { users } from "@/server/drizzle/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { TableSkeleton } from "@/components/common/data-table/skeleton";
import { Suspense } from "react";

export async function DelayDiv() {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  await delay(10000);

  return <div>DONE DONE DONE</div>;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;

  const userData = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      userType: users.userType,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.userId, session.user.id!))
    .then((res) => res[0]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Suspense fallback={<TableSkeleton/>}>
      <Card>
        <CardHeader className="border-b">
          <h2 className="text-2xl font-semibold">Profile</h2>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <p className="p-2 bg-muted rounded-md">{userData.firstName}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <p className="p-2 bg-muted rounded-md">{userData.lastName}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <p className="p-2 bg-muted rounded-md">{userData.email}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Type</label>
            <p className="p-2 bg-muted rounded-md">{userData.userType}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last Login</label>
            <p className="p-2 bg-muted rounded-md">
              {format(new Date(userData.lastLogin ?? ""), "PPpp")}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Member Since</label>
            <p className="p-2 bg-muted rounded-md">
              {format(new Date(userData.createdAt), "PP")}
            </p>
          </div>
          <DelayDiv />
        </CardContent>
      </Card>
      </Suspense>
    </div>
  );
}
