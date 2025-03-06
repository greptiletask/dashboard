"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import NewClient from "./NewClient";

export default function NewChangelogForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <NewClient />
    </Suspense>
  );
}
