import type * as React from "react";
import { useState } from "react";
import {
  FileText,
  Home,
  SettingsIcon,
  Settings,
  Plus,
  Save,
  Globe,
  Sparkles,
  Zap,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      items: [
        {
          title: "Generate Changelog",
          url: "/dashboard/new",
          icon: Sparkles,
        },
        {
          title: "Scan",
          url: "/dashboard/scan",
          icon: Search,
        },
        {
          title: "Automations",
          url: "/dashboard/automations",
          icon: Zap,
        },
        {
          title: "Drafts",
          url: "/dashboard/drafts",
          icon: Save,
        },
        {
          title: "Domains",
          url: "/dashboard/domains",
          icon: Globe,
          disabled: true,
          tooltip: "Coming soon",
        },
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="z-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-full justify-between z-50"
              onClick={toggleSidebar}
            >
              <div className="flex items-center">
                <div className="flex aspect-square size-8 bg-[#3B82F6] items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  {state === "expanded" ? "A" : "A"}
                </div>
                {state === "expanded" && (
                  <div className="ml-3 font-semibold">AutoCL</div>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {state === "expanded" && item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => {
                  const isActive = pathname === subItem.url;

                  return (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton
                        disabled={subItem.disabled}
                        isActive={isActive}
                        asChild
                        className={
                          subItem.disabled
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }
                      >
                        {/* If item is disabled, don't render a Link.
                            Instead, render a div with the same styling. */}
                        {subItem.disabled ? (
                          <div className="flex items-center">
                            {subItem.icon && (
                              <subItem.icon className="mr-2 h-4 w-4" />
                            )}
                            {state === "expanded" && (
                              <div className="flex items-center gap-2">
                                {subItem.title}
                                {/* Show a 'badge' if tooltip is provided */}
                                {subItem.tooltip && (
                                  <span
                                    className="inline-block rounded-full bg-muted 
                                               px-2 py-0.5 text-xs font-medium text-muted-foreground"
                                  >
                                    {subItem.tooltip}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link href={subItem.url}>
                            {subItem.icon && (
                              <subItem.icon className="mr-2 h-4 w-4" />
                            )}
                            {state === "expanded" && subItem.title}
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="flex items-center gap-2 p-3 border-t flex-row">
        <UserButton />
        {state === "expanded" && user && (
          <div className="flex-1 truncate flex flex-row justify-between items-center">
            <div className="text-sm font-medium">{user.fullName}</div>
            <Link
              href="/dashboard/settings"
              className="text-xs text-muted-foreground hover:underline"
            >
              <SettingsIcon className="w-5 h-5 stroke-[1.5] group-hover:stroke-2 transition-all text-primary" />
            </Link>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
