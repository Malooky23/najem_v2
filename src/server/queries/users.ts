// 'use server'

// import { db } from '@/server/db';
// import { and, eq } from 'drizzle-orm';
// import { users } from '@/server/db/schema';
// import {UserType} from '@/lib/types/users'
// import { unstable_cache } from 'next/cache';

// import { revalidateTag } from 'next/cache';
// import { CACHE_KEYS, CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from '@/lib/config/cache';

// // Helper function to create a delay
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// export const getUsers = unstable_cache(
//     async (): Promise<UserType[]> => {
//         try {
//             // Add a 5-second delay at the beginning
//             // console.log('Fetching customers...');
//             // await delay(5000);
//             // console.log('Customers fetched 5 seconds');

//             // Fetch customer data
//             const userList = await db
//                 .select({
//                     userId: users.userId,
//                     email: users.email,
//                     firstName: users.firstName,
//                     lastName: users.lastName,
//                     userType: users.userType,
//                     isAdmin: users.isAdmin,
//                     isActive: users.isActive,
//                     lastLogin: users.lastLogin,
//                     customerId: users.customerId,
//                     loginCount: users.loginCount,
//                     createdAt: users.createdAt,
//                     updatedAt: users.updatedAt
//                 });

//             return userList as UserType[]
//         } catch (error) {
//             console.error('[GET_CUSTOMERS_CACHE]', error);
//             throw error;
//         }
//     },
//     [CACHE_KEYS.users],
//     {
//         tags: [CACHE_TAGS.customers],
//         revalidate: CACHE_REVALIDATE_SECONDS.customers
//     }
// );

// // Add a revalidation helper
// export async function revalidateCustomers() {
//     revalidateTag(CACHE_TAGS.customers);
// }