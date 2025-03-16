"use client";

import { useState, useEffect } from "react";
import { Globe, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "next/navigation";
import { Project } from "@/types/project";

/**
 * This component expects your backend to:
 * 1) Return { project, verificationToken } when the user adds a domain.
 * 2) Return { success, project } when verifying domain.
 */

export default function CustomDomainPage() {
  // The user types a domain here:
  const [domain, setDomain] = useState("");

  // Holds the token from the backend; used to show DNS instructions.
  const [verificationToken, setVerificationToken] = useState("");

  // Overall project info from the backend
  const [project, setProject] = useState<Project | null>(null);

  // Various loading and status states
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Extract project slug from URL, e.g. /dashboard/domains/[projectId]
  const params = useParams();
  const projectSlug = params.projectId as string;

  // -----------------------------
  // 1) Load the project on mount
  // -----------------------------
  useEffect(() => {
    if (projectSlug) {
      handleFetchProject(projectSlug);
    }
  }, [projectSlug]);

  async function handleFetchProject(slug: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/projects/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      const data = await res.json();
      // We assume { project } is returned
      setProject(data.project);
      if (data.project.verificationToken && !data.project.isDomainVerified) {
        setVerificationToken(data.project.verificationToken);
      }
    } catch (error) {
      console.error("[FETCH PROJECT] Error:", error);
    }
  }

  // -----------------------------
  // 2) Add / Update Domain
  // -----------------------------
  // On success, we expect { project, verificationToken } from server
  async function handleAddDomain() {
    if (!domain) return;
    setIsAddingDomain(true);
    setVerificationStatus("idle");
    setVerificationToken("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/projects/${projectSlug}/domains`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
          body: JSON.stringify({ domain, projectSlug }),
        }
      );
      const data = await res.json();

      // If successful, the backend might return { project, verificationToken }
      if (data.project) {
        setProject(data.project);
        setVerificationStatus("success");

        if (data.project.verificationToken) {
          setVerificationToken(data.project.verificationToken);
        }
      } else {
        setVerificationStatus("error");
      }
    } catch (err) {
      console.error("[ADD DOMAIN] Error:", err);
      setVerificationStatus("error");
    } finally {
      setIsAddingDomain(false);
    }
  }

  // -----------------------------
  // 3) Verify Domain
  // -----------------------------
  // We call a verify endpoint, expecting { success, project } if verified
  async function handleVerifyDomain() {
    if (!project?.customDomain) return;
    setIsVerifyLoading(true);
    setVerificationStatus("idle");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/projects/${projectSlug}/domains/verify`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      const data = await res.json();
      console.log("[VERIFY DOMAIN] DATA", data);
      if (data.status === 200 && data.project) {
        setProject(data.project);
        setVerificationStatus("success");
      } else {
        setVerificationStatus("error");
      }
    } catch (err) {
      console.error("[VERIFY DOMAIN] error:", err);
      setVerificationStatus("error");
    } finally {
      setIsVerifyLoading(false);
    }
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="container mx-auto py-0">
      <h1 className="text-3xl font-bold mb-6">Custom Domain Settings</h1>

      {/* 1) Add/Update Domain Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Domain</CardTitle>
          <CardDescription>
            Connect your own domain to your Greptile Changelogs project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Domain Input */}
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <div className="flex space-x-2">
                <Input
                  id="domain"
                  placeholder="changelog.example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <Button
                  onClick={handleAddDomain}
                  disabled={!domain || isAddingDomain}
                >
                  {isAddingDomain ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </div>

            {/* Alert messages */}
            {verificationStatus === "success" && (
              <Alert className="bg-green-200/10 text-green-800 border-black-200 border-[0.5px]">
                <Check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Domain saved. Please add the DNS record below and then click
                  &quot;Verify Domain&quot; once DNS is propagated.
                </AlertDescription>
              </Alert>
            )}
            {verificationStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action failed</AlertTitle>
                <AlertDescription>
                  We couldn&apos;t save or verify your domain. Check your DNS
                  settings and try again.
                </AlertDescription>
              </Alert>
            )}

            {/* If we got a verificationToken from the server, show instructions */}
            {verificationToken && (
              <div className="border border-muted rounded-md p-4 space-y-2">
                <h4 className="font-semibold">DNS Verification</h4>
                <p className="text-sm">
                  To verify ownership, create a TXT record in your DNS with the
                  following value:
                </p>
                <div className="bg-muted p-2 text-sm font-mono rounded-md break-all">
                  {verificationToken}
                </div>
                <p className="text-sm">
                  Name/Host: <strong>@</strong> or <strong>changelog</strong>{" "}
                  (depending on your DNS provider) <br />
                  Type: <strong>TXT</strong> <br />
                  Value: <strong>{verificationToken}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Once your DNS changes propagate (this can take up to 48
                  hours), come back and click &quot;Verify Domain&quot; below.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="space-y-4 w-full">
            <h3 className="text-lg font-semibold">Next steps:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Create a CNAME or TXT record in your DNS pointing your subdomain
                to greptilechangelogs.com
              </li>
              <li>Wait for DNS propagation (may take up to 48 hours).</li>
              <li>
                Once your DNS record is set, click &quot;Verify Domain&quot;
                (below) to confirm.
              </li>
            </ol>
          </div>
        </CardFooter>
      </Card>

      {/* 2) Current Domain Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Current Domain</CardTitle>
          <CardDescription>
            Manage your project&apos;s domain and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!project ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {project.customDomain ? (
                <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                  <div className="flex items-center space-x-4">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{project.customDomain}</span>
                  </div>
                  {project.isDomainVerified ? (
                    <span className="text-sm text-green-600">Active</span>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-yellow-600">
                        Not Verified
                      </span>
                      <Button
                        onClick={handleVerifyDomain}
                        disabled={isVerifyLoading}
                      >
                        {isVerifyLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Domain"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                  <div
                    className="flex items-center space-x-4 cursor-pointer"
                    onClick={() => {
                      window.open(
                        `https://autocl.live/${project.slug}`,
                        "_blank"
                      );
                    }}
                  >
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      https://autocl.live/{project.slug}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">Default</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
