import type { DefaultSession, User } from 'next-auth';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    role: Role;
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: Role;
    };
    iat?: number;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser extends User {
    role: Role;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: Role;
  }
}
