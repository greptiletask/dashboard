"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { Sparkles, Loader2, GitBranch, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CommitsDialog from "@/components/commits-modal";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface Repo {
  id: string;
  fullName: string;
}

export interface Changelog {
  draftId: string;
  title: string;
  userId: string;
  changelog: string; // The raw Markdown
  version: string;
  repo: string;
  createdAt: string; // stored as string in localStorage
  updatedAt: string; // stored as string in localStorage
}

export default function NewChangelogForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If user is editing an existing draft, we get a "draftId" in the URL
  const urlDraftId = searchParams.get("draftId") || null;

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [version, setVersion] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [title, setTitle] = useState("");

  // For date range
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // For commits dialog
  const [openCommitsModal, setOpenCommitsModal] = useState(false);
  const [commits, setCommits] = useState<any[]>([]);
  const [isFetchingCommits, setIsFetchingCommits] = useState(false);

  // For identifying the draft
  const [draftId, setDraftId] = useState<string | null>(urlDraftId);

  const [isGithubConnected, setIsGithubConnected] = useState(false);

  const [responseStyle, setResponseStyle] = useState("non-technical");

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  // -----------------------------
  // 1) Load Existing Draft if present
  // -----------------------------
  useEffect(() => {
    if (urlDraftId) {
      loadExistingDraft(urlDraftId);
    }
  }, [urlDraftId]);

  const loadExistingDraft = (id: string) => {
    const storedDrafts = JSON.parse(
      localStorage.getItem("draft-changelogs") || "[]"
    ) as Changelog[];
    const existingDraft = storedDrafts.find((d) => d.draftId === id);
    if (existingDraft) {
      setDraftId(id);
      setSelectedRepo(existingDraft.repo || "");
      setVersion(existingDraft.version || "");
      setGeneratedContent(existingDraft.changelog || "");
      setTitle(existingDraft.title || "");
    } else {
      toast.error("Draft not found.");
    }
  };

  // -----------------------------
  // 2) Auto-Save Draft on Changes
  // -----------------------------
  useEffect(() => {
    const hasAnyContent =
      selectedRepo.trim() ||
      version.trim() ||
      generatedContent.trim() ||
      title.trim();

    if (!hasAnyContent) {
      return;
    }
    autoSaveDraft();
  }, [selectedRepo, version, generatedContent, title]);

  const autoSaveDraft = () => {
    const storedDrafts = JSON.parse(
      localStorage.getItem("draft-changelogs") || "[]"
    ) as Changelog[];

    if (draftId) {
      const index = storedDrafts.findIndex((d) => d.draftId === draftId);
      if (index !== -1) {
        storedDrafts[index] = {
          ...storedDrafts[index],
          changelog: generatedContent,
          version,
          title,
          repo: selectedRepo,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const newDraft: Changelog = {
          draftId,
          userId: "",
          changelog: generatedContent,
          version: version || "v0.0.0",
          title,
          repo: selectedRepo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storedDrafts.push(newDraft);
      }
    } else {
      // No draftId => create new
      const newId = uuidv4();
      setDraftId(newId);

      const newDraft: Changelog = {
        draftId: newId,
        userId: "user-123",
        changelog: generatedContent,
        version: version || "v0.0.0",
        title: title || "",
        repo: selectedRepo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storedDrafts.push(newDraft);
    }

    localStorage.setItem("draft-changelogs", JSON.stringify(storedDrafts));
  };

  // -----------------------------
  // 3) Fetch Repos
  // -----------------------------
  useEffect(() => {
    handleFetchRepos();
    handleFetchUser();
  }, []);

  const handleFetchBranches = async (owner: string, repo: string) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/github/branches`,
      {
        params: { owner, repo },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
        },
      }
    );
    console.log(response.data, "response from branches");
    setBranches(response.data);
    if (response.data.length > 0) {
      const defaultBranch = response.data.find(
        (branch: any) => branch.name === "master" || branch.name === "main"
      );
      if (defaultBranch) {
        setSelectedBranch(defaultBranch.name);
      }
    }
  };

  useEffect(() => {
    if (selectedRepo) {
      const [owner, repo] = selectedRepo.split("/");
      handleFetchBranches(owner, repo);
    }
  }, [selectedRepo]);

  const handleFetchUser = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      console.log(response.data, "response from user");
      if (response.data.accessToken) {
        setIsGithubConnected(true);
      } else {
        setIsGithubConnected(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleFetchRepos = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/github/repos`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      if (response.data && Array.isArray(response.data.data)) {
        setRepositories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  };

  // -----------------------------
  // 4) Fetch Commits
  // -----------------------------
  const handleFetchCommits = async () => {
    setIsFetchingCommits(true);
    try {
      if (selectedRepo && dateRange.from && dateRange.to) {
        const [owner, repo] = selectedRepo.split("/");
        const start = format(dateRange.from, "yyyy-MM-dd");
        const end = format(dateRange.to, "yyyy-MM-dd");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/github/commits`,
          {
            params: { owner, repo, start, end },
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "clerk-authToken"
              )}`,
            },
          }
        );
        if (Array.isArray(response.data)) {
          setCommits(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching commits:", error);
    } finally {
      setIsFetchingCommits(false);
    }
  };

  useEffect(() => {
    if (openCommitsModal) {
      handleFetchCommits();
    }
  }, [openCommitsModal]);

  // -----------------------------
  // 5) Generate Changelog (AI)
  // -----------------------------
  const handleGenerateChangelog = async () => {
    if (!version || !selectedRepo || !dateRange.from || !dateRange.to) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsGenerating(true);

    try {
      const [owner, repo] = selectedRepo.split("/");
      const start = format(dateRange.from!, "yyyy-MM-dd");
      const end = format(dateRange.to!, "yyyy-MM-dd");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/github/generate-changelog`,
        { owner, repo, start, end, response_style: responseStyle },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );

      const parsed = JSON.parse(response.data.changelog);
      setGeneratedContent(parsed.summaryBulletPoints);
      setTitle(parsed.title || "");
    } catch (error) {
      console.error("Error generating changelog:", error);
      toast.error("Error generating changelog");
    } finally {
      setIsGenerating(false);
    }
  };

  // -----------------------------
  // 6) Explicit "Save as Draft"
  // -----------------------------
  const handleSaveDraft = () => {
    autoSaveDraft();
    toast.success("Draft saved successfully!");
  };

  // -----------------------------
  // 7) Publish (and remove from drafts)
  // -----------------------------
  const handlePublish = async () => {
    if (!selectedRepo || !version || !generatedContent) {
      toast.error("The changelog cannot be empty");
      return;
    }
    setIsPublishing(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog`,
        {
          changelog: generatedContent,
          version,
          repo: selectedRepo,
          projectSlug: selectedRepo.toLowerCase().replace("/", "-"),
          title,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );

      console.log(response.data, "response from publish");
      toast.success("Changelog published successfully!");

      // Remove this draft from localStorage if it exists
      if (draftId) {
        let storedDrafts = JSON.parse(
          localStorage.getItem("draft-changelogs") || "[]"
        ) as Changelog[];
        storedDrafts = storedDrafts.filter((d) => d.draftId !== draftId);
        localStorage.setItem("draft-changelogs", JSON.stringify(storedDrafts));
      }

      // Clear form fields
      setSelectedRepo("");
      setVersion("");
      setTitle("");
      setGeneratedContent("");
      setDateRange({ from: undefined, to: undefined });
      setDraftId(null);

      // Redirect to main changelogs page
      window.open(
        `https://autocl.live/${selectedRepo.toLowerCase().replace("/", "-")}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error publishing changelog:", error);
      toast.error("Error publishing changelog");
    } finally {
      setIsPublishing(false);
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        {/* Row for Repository + Version */}
        <div className="grid grid-cols-3 gap-4">
          {/* Repository */}
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            {isGithubConnected ? (
              <>
                <Select
                  value={selectedRepo}
                  onValueChange={(value) => setSelectedRepo(value)}
                >
                  <SelectTrigger className="w-[100%]">
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories && repositories.length > 0 ? (
                      repositories.map((repo) => (
                        <SelectItem key={repo.fullName} value={repo.fullName}>
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
                <Label className="text-xs text-muted-foreground">
                  The changelogs for this repo will be published to{" "}
                  <a
                    href={`https://autocl.live/${selectedRepo
                      .toLowerCase()
                      .replace("/", "-")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    autocl.live/{selectedRepo.toLowerCase().replace("/", "-")}
                  </a>
                </Label>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-[100%]"
                onClick={() => {
                  window.location.href = "/dashboard/settings";
                }}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Connect Github
              </Button>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="version">Branch</Label>
            <Select
              value={selectedBranch}
              onValueChange={(value) => setSelectedBranch(value)}
            >
              <SelectTrigger className="w-[100%]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

        {/* Row for Date Range & Show Commits Button */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "LLL dd, y")} - ${format(
                          dateRange.to,
                          "LLL dd, y"
                        )}`
                      : format(dateRange.from, "LLL dd, y")
                    : "Pick a date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) =>
                    setDateRange(range || { from: undefined, to: undefined })
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end justify-end">
            <Button
              onClick={() => setOpenCommitsModal(true)}
              className="bg-sidebar text-primary hover:bg-sidebar/80"
            >
              View Commits
            </Button>
            <CommitsDialog
              isOpen={openCommitsModal}
              setOpen={setOpenCommitsModal}
              commits={commits}
              dateRange={dateRange}
              isFetchingCommits={isFetchingCommits}
            />
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Security Updates and New Integrations"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Changelog Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Changelog Content</Label>
            <div className="flex items-center gap-2">
              <Select
                value={responseStyle}
                onValueChange={(value) => setResponseStyle(value)}
              >
                <SelectTrigger className="px-3 min-w-[400px] text-xs">
                  <SelectValue
                    placeholder="Select format"
                    defaultValue="technical"
                  />
                </SelectTrigger>
                <SelectContent className="min-w-[400px] text-xs">
                  <SelectItem value="non-technical">
                    Feature-Focused (Customer-Friendly)
                  </SelectItem>
                  <SelectItem value="technical">
                    Technical (Developer-Oriented)
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleGenerateChangelog}
                disabled={isGenerating}
                size="sm"
                className="bg-sidebar text-primary hover:bg-sidebar/80"
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

            <TabsContent value="edit">
              <Textarea
                id="content"
                placeholder="Enter or modify your Markdown here..."
                className="min-h-[275px] font-mono"
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
                        className="markdown-content"
                        dangerouslySetInnerHTML={{
                          __html: marked(generatedContent),
                        }}
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
          className="bg-sidebar text-primary hover:bg-sidebar/80"
          onClick={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Changelog"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
