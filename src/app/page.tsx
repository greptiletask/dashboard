"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
export default function Home() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    handleAuthState();
  }, [isLoaded]);
  const handleAuthState = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL as string);
    }
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start"></main>
    </div>
  );
}
