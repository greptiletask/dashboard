import type * as React from "react";
import { useState } from "react";
import {
  FileText,
  Home,
  SettingsIcon,
  Laptop2,
  Settings,
  Code,
  Key,
  Book,
  ChevronDown,
  Sparkles,
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

// Updated sample data with icons and correct URLs
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      items: [
        {
          title: "Reports",
          url: "/dashboard/reports",
          icon: FileText,
        },
        {
          title: "Feature Requests",
          url: "/dashboard/feature-requests",
          icon: Sparkles,
        },
        {
          title: "Projects",
          url: "/dashboard/projects",
          icon: Laptop2,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Developer",
      url: "/developer",
      icon: Code,
      items: [
        {
          title: "API Keys",
          url: "/developer/keys",
          icon: Key,
        },
        {
          title: "Documentation",
          url: "https://docs.recurv.dev",
          icon: Book,
          external: true,
        },
        {
          title: "Logs",
          url: "/developer/logs",
          icon: FileText,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { user } = useUser();
  const [selectedProject, setSelectedProject] = useState("My Project");

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-full justify-between"
              onClick={toggleSidebar}
            >
              <div className="flex items-center">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {state === "expanded" ? "R" : ""}
                </div>
                {state === "expanded" && (
                  <div className="ml-3 font-semibold">Recurv</div>
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
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={subItem.url}>
                          {subItem.icon && (
                            <subItem.icon className="mr-2 h-4 w-4" />
                          )}
                          {state === "expanded" && subItem.title}
                        </Link>
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
