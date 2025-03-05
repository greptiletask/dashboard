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

import { Switch } from "@/components/ui/switch";
import { Github, Globe, LogOut, Moon, Sun } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { user } = useUser();
  const query = useSearchParams();
  const [githubCode, setGithubCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [githubData, setGithubData] = useState<any>({});
  const { signOut } = useClerk();

  useEffect(() => {
    const code = query.get("code");
    if (code) {
      setGithubCode(code);
      console.log("github code", githubCode);
      handleExchangeToken(code);
    }
  }, [query]);

  useEffect(() => {
    const ghToken = localStorage.getItem("gh_token");
    if (ghToken) {
      setIsGithubConnected(true);
      handleFetchGHUser(ghToken);
    }
  }, []);

  const handleExchangeToken = async (code: string) => {
    if (!code) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/github/exchange-token`,
        { code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      if (response.data.data) {
        console.log(
          "response.data.data from exchange token",
          response.data.data
        );
        localStorage.setItem("gh_token", response.data.data.access_token);

        setIsGithubConnected(true);
      }
    } catch (error) {
      console.error("Error exchanging token:", error);
    } finally {
      setLoading(false);
      router.replace("/settings");
      handleFetchGHUser(localStorage.getItem("gh_token") as string);
    }
  };

  const handleFetchGHUser = async (ghToken: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/github/user?ghToken=${ghToken}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      console.log("response.data.data from fetch gh user", response.data.data);
      if (response.data.data) {
        setGithubData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching GitHub user:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem("gh_token");
    localStorage.removeItem("clerk-authToken");
    setIsGithubConnected(false);
    setGithubData({});

    router.replace("/");
  };

  const handleGithubAuth = () => {
    const url =
      "https://github.com/login/oauth/authorize?client_id=Ov23liHiYsB7iad0aRlP&scope=repo+read:org";
    window.open(url, "_blank");
  };

  const handleUpdateGithubSettings = () => {
    window.open(
      "https://github.com/settings/connections/applications/Ov23liHiYsB7iad0aRlP",
      "_blank"
    );
  };

  const handleDisconnectGithub = () => {
    localStorage.removeItem("gh_token");
    setIsGithubConnected(false);
    setGithubData({});
  };

  if (!user) {
    return null;
  }

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
              <Button
                className="w-fit"
                onClick={handleGithubAuth}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isGithubConnected ? (
                  <>
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage
                        src={githubData?.avatar_url}
                        alt={githubData?.login}
                      />
                      <AvatarFallback>
                        {githubData?.login?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {githubData?.login}
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4 w-fit" />
                    Connect GitHub
                  </>
                )}
              </Button>
              {isGithubConnected && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleUpdateGithubSettings}
                  >
                    Update GitHub Settings
                  </Button>
                  <Button
                    className="w-full border-red-500 text-red-500 hover:border hover:border-red-500 hover:text-red-500"
                    onClick={handleDisconnectGithub}
                  >
                    Disconnect Github
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">Logout</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account.
                </p>
              </div>
              <Button onClick={handleSignOut} variant="destructive">
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
