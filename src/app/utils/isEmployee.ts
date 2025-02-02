import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';

export const isEmployee = async () => {
  const session = await auth();
  return session?.user.userType === 'EMPLOYEE';
}

export const guardEmployee = async () => {
  if (!await isEmployee()) {
    redirect('/404');
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export const apiGuardEmployee = async () => {
  const session = await auth();
  const isUserEmployee = await isEmployee();
  
  if (!session?.user || !isUserEmployee) {
    throw new UnauthorizedError();
  }
}