import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="text-lg sm:text-xl font-bold truncate">
      <span className="hidden sm:inline">Najem Aleen Shipping</span>
      <span className="sm:hidden">NAS</span>
    </Link>
  );

//   return (
//     <Link href="/dashboard" className="text-center text-lg sm:text-xl font-bold truncate">
//       <span className="block">Najem Aleen</span> 
//       <span className="block sm:hidden">Shipping</span> {/* Hide "Shipping" on small screens */}
//       <span className="hidden sm:block">Shipping</span> {/* Show "Shipping" on medium and larger screens */}
//     </Link>
//   );

}