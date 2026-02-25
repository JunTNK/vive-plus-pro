import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user: {
      id?: string;
      email?: string;
      name?: string;
      image?: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
