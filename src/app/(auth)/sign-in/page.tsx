'use client'
import { useSession, signIn } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return <p>Signed in as {session.user.email}</p>;
  }

  return <a onClick={()=> signIn()}>Sign in</a>;
}
