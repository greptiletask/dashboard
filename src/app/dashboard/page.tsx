"use client";
import { UserButton, useSession } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
export default function Dashboard() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { session } = useSession();
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      console.log(user);
      handleFetchOrCreateUser();
    }
  }, [isLoaded]);

  const handleFetchOrCreateUser = async () => {
    const token = await session?.getToken({
      skipCache: true,
    });
    console.log(token, "tokenFROM");
    localStorage.setItem("authToken", token!);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/fetch-or-create`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      console.log(data, "data from fetch-or-create-user");
    } catch (error) {
      console.error(error, "error from fetch-or-create-user");
    }
  };

  return (
    <div className="flex justify-start items-start h-screen w-full">
      Page in dashboard
    </div>
  );
}
