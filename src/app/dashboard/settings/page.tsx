"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Github, Globe, LogOut, Moon, Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
  };

  const handleConnectGithub = () => {
    // Implement GitHub connection logic here
    console.log("Connecting to GitHub...");
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account and connections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  GitHub Connection
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account to sync repositories.
                </p>
              </div>
              <Button onClick={handleConnectGithub} variant="outline">
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">Logout</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account.
                </p>
              </div>
              <Button onClick={handleLogout} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-md bg-secondary">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {isDarkMode
                      ? "Currently using dark mode"
                      : "Currently using light mode"}
                  </p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
