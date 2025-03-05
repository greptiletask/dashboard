"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, GitBranch } from "lucide-react";
import { toast } from "sonner";
interface Repo {
  id: string;
  fullName: string;
}

export interface Changelog {
  userId: string;
  changelog: string;
  version: string;
  repo: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function NewChangelogForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [activeTab, setActiveTab] = useState("edit");

  // For the repo selection
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");

  const [version, setVersion] = useState("");

  const handleFetchRepos = useMemo(
    () => async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/github/repos`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "clerk-authToken"
              )}`,
            },
          }
        );
        console.log(response.data, "RESPONSE DATA FROM FETCH REPOS");
        if (response.data && Array.isArray(response.data.data)) {
          setRepositories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    },
    []
  );

  useEffect(() => {
    handleFetchRepos();
  }, []);

  useEffect(() => {
    const storedRepo = localStorage.getItem("selectedRepo");
    if (storedRepo) {
      setSelectedRepo(storedRepo);
    }
  }, []);

  const handleGenerateChangelog = async () => {
    setIsGenerating(true);
    try {
      // Mock delay just to show the spinner
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setGeneratedContent(
        "### Mock AI-generated changelog\n- Added new feature\n- Fixed bugs"
      );
    } catch (error) {
      console.error("Error generating changelog:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    try {
      // Build the changelog object
      const newDraft: Changelog = {
        userId: "user-123",
        changelog: generatedContent,
        version: version || "v0.0.0",
        repo: selectedRepo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const storedDrafts = JSON.parse(
        localStorage.getItem("draft-changelogs") || "[]"
      );
      storedDrafts.push(newDraft);

      // Save back to localStorage
      localStorage.setItem("draft-changelogs", JSON.stringify(storedDrafts));

      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // -----------------------------
  // 4. Publish Changelog
  // -----------------------------
  const handlePublish = async () => {
    try {
      // ...logic to publish. Typically a POST request to your server.
      // e.g. await axios.post(...);

      alert("Changelog published!");
    } catch (error) {
      console.error("Error publishing changelog:", error);
    }
  };

  // -----------------------------
  // 5. Render
  // -----------------------------
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Changelog Entry</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Row for Repository + Version */}
        <div className="grid grid-cols-2 gap-4">
          {/* Repository */}
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            <Select
              value={selectedRepo}
              onValueChange={(value) => {
                setSelectedRepo(value);
                // Store in localStorage so it persists
                localStorage.setItem("selectedRepo", value);
              }}
            >
              <SelectTrigger className="w-[100%]">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories && repositories.length > 0 ? (
                  repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>
                      <div className="flex items-center">
                        <GitBranch className="mr-2 h-4 w-4" />
                        {repo.fullName}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-repos">
                    No repositories found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Version */}
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="e.g. v1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>
        </div>

        {/* Changelog Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Changelog Content</Label>
            <Button
              onClick={handleGenerateChangelog}
              disabled={isGenerating}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* EDIT TAB */}
            <TabsContent value="edit">
              <Textarea
                id="content"
                placeholder="Enter changelog content or generate with AI..."
                className="min-h-[300px] font-mono"
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
              />
            </TabsContent>

            {/* PREVIEW TAB */}
            <TabsContent value="preview">
              <Card className="bg-secondary/50 border-none">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge>{version || "v0.0.0"}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Draft Preview
                    </span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert">
                    {generatedContent ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        No content to preview yet.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>

      {/* FOOTER ACTIONS */}
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handlePublish}
        >
          Publish Changelog
        </Button>
      </CardFooter>
    </Card>
  );
}
