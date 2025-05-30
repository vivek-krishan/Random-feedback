import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/user.model';
import dbConnect from '@/lib/dbConnection';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                    placeholder: 'jonsnow@example.com',
                },
                password: { label: 'Password', type: 'password' },
                role: {
                    label: 'Role',
                    type: 'text',
                    placeholder: 'teacher/student',
                },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();

                try {
                    const user = await UserModel.findOne({
                        email: credentials.email,
                        role: credentials.role,
                    });

                    if (!user) throw new Error('User not found!');
                    if (!user.isVerified)
                        throw new Error('Please verify before sign-in');

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (isPasswordCorrect) return user;
                    else throw new Error('Incorrect password');
                } catch (err: any) {
                    throw new Error(err);
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.isVerified = user.isVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.isVerified = token.isVerified;
            }

<<<<<<< HEAD
        try {

          const user = await UserModel.findOne({
              email: credentials.identifier,
          });


          if (!user) throw new Error("User not found!");
          if (!user.isVerified) throw new Error("Please verify before sign-in");

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) return user;
          else throw new Error("Incorrect password");
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.availableForMessages = user.availableForMessages;
      }

      return token;
=======
            return session;
        },
>>>>>>> 8d22a9d64aa75489dc6503aec8135c2147a5268b
    },

    pages: {
        signIn: '/api/sign-in',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
