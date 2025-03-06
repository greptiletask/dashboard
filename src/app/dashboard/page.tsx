"use client";
import { UserButton, useSession } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
export default function Dashboard() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      console.log(user);
      console.log("calling handleFetchOrCreateUser");
      handleFetchOrCreateUser();
    } else {
      router.push("/sign-in");
    }
  }, [isLoaded]);

  const handleFetchOrCreateUser = async () => {
    const token = await session?.getToken({
      skipCache: true,
    });
    console.log(token, "tokenFROM");
    localStorage.setItem("clerk-authToken", token!);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/fetch-or-create`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      const data = await response.json();
      console.log(data, "data from fetch-or-create-user");
    } catch (error) {
      console.error(error, "error from fetch-or-create-user");
    } finally {
      router.push("/dashboard/changelogs");
    }
  };

  return (
    <div className="flex justify-start items-start h-screen w-full">
      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  );
}
