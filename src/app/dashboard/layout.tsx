"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { isSignedIn, isLoaded } = useUser();

  const handleAuthState = () => {
    if (!isSignedIn) {
      router.push(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL as string);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAuthState();
  }, [isLoaded]);

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

  return (
    <SidebarProvider>
      <div className="flex w-screen h-screen justify-start items-start">
        {loading ? (
          <div className="flex justify-center items-center h-full w-full">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <AppSidebar />
            <SidebarInset className="flex-1 items-start justify-start">
              <header className="fixed top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background px-4 w-full">
                <SidebarTrigger className="-ml-2" />
                {/* <Separator orientation="vertical" className="h-6" /> */}
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
              <main className="flex-1 px-4 w-full h-content flex justify-start items-start mt-16">
                {children}
              </main>
            </SidebarInset>
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
