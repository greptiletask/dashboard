"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

/**
 * A layout that places the AppSidebar on the left,
 * and the Header + Content on the right. The header
 * won't spill over the sidebar.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  // Build breadcrumb data from the path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    return pathSegments.map((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      return {
        href,
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
      };
    });
  };

  // Layout: left sidebar, right column with header + main
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        {/* LOADING SCREEN */}
        {loading ? (
          <div className="flex w-full h-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {/* Sidebar on the left */}
            <AppSidebar />

            {/* Main area on the right */}
            <div className="flex flex-1 flex-col relative">
              {/* Sticky header at the top of the main column */}
              <header className="sticky top-0 z-50 flex h-16 items-center gap-2 bg-inherit px-6">
                {/* SidebarTrigger if you need mobile toggling, etc. */}
                <SidebarTrigger className="-ml-2" />

                {/* Breadcrumb */}
                <Breadcrumb>
                  <BreadcrumbList>
                    {generateBreadcrumbs().map((breadcrumb, index) => (
                      <React.Fragment key={breadcrumb.href}>
                        <BreadcrumbItem className="hidden md:inline-flex">
                          <BreadcrumbLink href={breadcrumb.href}>
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index < generateBreadcrumbs().length - 1 && (
                          <BreadcrumbSeparator className="hidden md:inline-flex" />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </header>

              {/* Main content area below header */}
              <main className="flex-1 w-full overflow-auto p-4 px-6">
                {children}
              </main>
            </div>
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
