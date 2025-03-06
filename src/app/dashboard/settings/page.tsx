"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SettingsClient from "./SettingsClient";

export default function SettingsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <SettingsClient />
    </Suspense>
  );
}
