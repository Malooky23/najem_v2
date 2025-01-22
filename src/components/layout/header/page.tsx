import Link from "next/link";
import { auth } from "@/lib/auth";
import { NavigationMenu } from "@radix-ui/react-navigation-menu";
import { NavigationLinks } from "./navigation-links";
import { UserMenu } from "./user-menu";
import { Logo } from "./logo";

// ... existing imports ...

export async function Header() {
  const session = await auth();
  const userType = session?.user?.userType;
  const isAdmin = session?.user?.isAdmin || false;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full flex items-center px-6">
        <NavigationMenu className="grid grid-cols-3 items-center">
          <div className="justify-self-start">
            <Logo />
          </div>
          {session?.user && (
            <div className="justify-self-center">
              <NavigationLinks userType={userType} isAdmin={isAdmin} />
            </div>
          )}
          <div className="justify-self-end">
            <UserMenu session={session} />
          </div>
        </NavigationMenu>
      </div>
    </header>
  );
}

// return (
//   <header className="border-b bg-white">
//     <div className="container mx-auto px-2 sm:px-4 py-4">
//       <NavigationMenu className="flex justify-between items-center">
//         <div className="flex items-center gap-4 sm:gap-8">
//           <Logo />
//           {session?.user && (
//                  <div className="justify-self-center">
//                  <NavigationLinks userType={userType} isAdmin={isAdmin} />
//                </div>
//             // <NavigationLinks userType={userType} isAdmin={isAdmin} />
//           )}
//         </div>
//         <UserMenu session={session} />
//       </NavigationMenu>
//     </div>
//   </header>
// );
// }