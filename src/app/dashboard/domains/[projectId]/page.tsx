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
export default function CustomDomainPage() {
  const [domain, setDomain] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const params = useParams();
  const projectSlug = params.projectSlug as string;

  const handleFetchProject = async (projectSlug: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/projects/${projectSlug}`
    );
    const data = await response.json();
    console.log(data, "data from project!");
  };

  useEffect(() => {
    handleFetchProject(projectSlug);
  }, [projectSlug]);

  const handleAddDomain = async () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStatus(Math.random() > 0.5 ? "success" : "error");
    }, 2000);
  };

  return (
    <div className="container mx-auto py-0">
      <h1 className="text-3xl font-bold mb-6">Custom Domain Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Domain</CardTitle>
          <CardDescription>
            Connect your own domain to your Greptile Changelogs project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                  disabled={isVerifying || !domain}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </div>
            {verificationStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4" />
                <AlertTitle>Domain added successfully!</AlertTitle>
                <AlertDescription>
                  Your custom domain has been verified and added to your
                  project.
                </AlertDescription>
              </Alert>
            )}
            {verificationStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification failed</AlertTitle>
                <AlertDescription>
                  We couldn't verify your domain. Please check your DNS settings
                  and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="space-y-4 w-full">
            <h3 className="text-lg font-semibold">Next steps:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create a CNAME record in your DNS settings:</li>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <p>CNAME changelog.example.com → greptilechangelogs.com</p>
              </div>
              <li>Wait for DNS propagation (may take up to 48 hours)</li>
              <li>
                Your custom domain will be automatically verified once DNS is
                updated
              </li>
            </ol>
          </div>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Current Domains</CardTitle>
          <CardDescription>
            Manage your project's domains and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-md">
              <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  greptilechangelogs.com/your-project-id
                </span>
              </div>
              <span className="text-sm text-muted-foreground">Default</span>
            </div>
            {domain && verificationStatus === "success" && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                <div className="flex items-center space-x-4">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{domain}</span>
                </div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
