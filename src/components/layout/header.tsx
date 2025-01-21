import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { User, Package, Truck, Users, Warehouse } from "lucide-react";
import { LogoutButton } from "../auth/logout-button";

export async function Header() {
  const session = await auth();
  const userType = session?.user?.userType;
  const isAdmin = session?.user?.isAdmin || false;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <NavigationMenu className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              Najem Aleen Shipping
            </Link>

            {session?.user && (
              <NavigationMenuList className="flex items-center gap-6">
                {userType === "EMPLOYEE" && (
                  <>
                    <NavigationMenuItem>
                      <Link href="/orders" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                        <Package className="h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/inventory" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                        <Warehouse className="h-4 w-4" />
                        <span>Inventory</span>
                      </Link>
                    </NavigationMenuItem>
                    {isAdmin && (
                      <>
                        <NavigationMenuItem>
                          <Link href="/customers" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                            <Users className="h-4 w-4" />
                            <span>Customers</span>
                          </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                          <Link href="/vendors" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                            <Truck className="h-4 w-4" />
                            <span>Vendors</span>
                          </Link>
                        </NavigationMenuItem>
                      </>
                    )}
                  </>
                )}
                
                {userType === "CUSTOMER" && (
                  <>
                    <NavigationMenuItem>
                      <Link href="/orders" className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                        <Package className="h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            )}
          </div>

          <NavigationMenuList className="flex items-center gap-4">
            {session?.user ? (
              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors outline-none">
                      <div className="text-sm text-right mr-2">
                        <div className="font-medium">{session.user.name}</div>
                        {userType && (
                          <div className="text-xs text-gray-500">
                            {userType.toLowerCase()}
                          </div>
                        )}
                      </div>
                      <Avatar>
                        <AvatarFallback className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                          <User className="h-5 w-5 text-gray-600" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    sideOffset={8}
                    className="w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="py-1">
                      <DropdownMenuItem asChild>
                        <Link 
                          href="/profile" 
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 outline-none cursor-pointer"
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <div className="h-px bg-gray-200 my-1" />
                      <LogoutButton />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
                >
                  Login
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
