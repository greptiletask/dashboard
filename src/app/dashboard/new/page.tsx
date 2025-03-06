"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid"; // For creating unique draft IDs

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
import slugify from "slugify";
interface DateRange {
  from?: Date;
  to?: Date;
}

interface Repo {
  id: string;
  fullName: string;
}

export interface Changelog {
  /**
   * A unique ID for this draft. We'll store it so we can find & update the
   * same draft if user continues editing.
   */
  draftId: string;

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

  // 1) If user is editing an existing draft, we get a "draftId" in the URL
  const urlDraftId = searchParams.get("draftId") || null;

  // State for form fields
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [version, setVersion] = useState("");
  const [generatedContent, setGeneratedContent] = useState(""); // raw Markdown

  // For date range
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Commits dialog
  const [openCommitsModal, setOpenCommitsModal] = useState(false);
  const [commits, setCommits] = useState<any[]>([]);
  const [isFetchingCommits, setIsFetchingCommits] = useState(false);

  const [draftId, setDraftId] = useState<string | null>(urlDraftId);

  useEffect(() => {
    if (urlDraftId) {
      loadExistingDraft(urlDraftId);
    }
  }, []);

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
    } else {
      toast.error("Draft not found.");
    }
  };

  useEffect(() => {
    const hasAnyContent =
      selectedRepo.trim() || version.trim() || generatedContent.trim();

    if (!hasAnyContent) {
      return;
    }

    autoSaveDraft();
  }, [selectedRepo, version, generatedContent]);

  const autoSaveDraft = () => {
    let storedDrafts = JSON.parse(
      localStorage.getItem("draft-changelogs") || "[]"
    ) as Changelog[];

    if (draftId) {
      const index = storedDrafts.findIndex((d) => d.draftId === draftId);
      if (index !== -1) {
        // Update
        storedDrafts[index] = {
          ...storedDrafts[index],
          changelog: generatedContent,
          version,
          repo: selectedRepo,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // If user typed a draftId that doesn't exist, create new
        const newDraft: Changelog = {
          draftId,
          userId: "user-123",
          changelog: generatedContent,
          version: version || "v0.0.0",
          repo: selectedRepo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storedDrafts.push(newDraft);
      }
    } else {
      const newId = uuidv4();
      setDraftId(newId);

      const newDraft: Changelog = {
        draftId: newId,
        userId: "user-123",
        changelog: generatedContent,
        version: version || "v0.0.0",
        repo: selectedRepo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storedDrafts.push(newDraft);
    }

    localStorage.setItem("draft-changelogs", JSON.stringify(storedDrafts));
  };

  // -----------------------------
  // C. FETCH REPOS & COMMITS
  // -----------------------------
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

  useEffect(() => {
    handleFetchRepos();
  }, []);

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
  // D. GENERATE CHANGELOG WITH AI
  // -----------------------------
  const handleGenerateChangelog = async () => {
    if (!selectedRepo || !dateRange.from || !dateRange.to) {
      toast.error("Please select a repository and date range");
      return;
    }
    setIsGenerating(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/github/generate-changelog`,
        {
          owner: selectedRepo.split("/")[0],
          repo: selectedRepo.split("/")[1],
          start: format(dateRange.from!, "yyyy-MM-dd"),
          end: format(dateRange.to!, "yyyy-MM-dd"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      setGeneratedContent(
        JSON.parse(response.data.changelog).summaryBulletPoints
      );
    } catch (error) {
      console.error("Error generating changelog:", error);
      toast.error("Error generating changelog");
    } finally {
      setIsGenerating(false);
    }
  };

  // -----------------------------
  // E. EXPLICIT "SAVE AS DRAFT"
  // -----------------------------
  // This is effectively the same as autoSave but we show a success toast
  const handleSaveDraft = () => {
    autoSaveDraft();
    toast.success("Draft saved successfully!");
  };

  // -----------------------------
  // F. PUBLISH
  // -----------------------------
  const handlePublish = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog`,
        {
          changelog: generatedContent,
          version,
          repo: selectedRepo,
          projectSlug: selectedRepo.toLowerCase().replace("/", "-"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      console.log(response.data, "response from publish");
      toast.success("Changelog published successfully!");
      router.push("/dashboard/changelogs");
    } catch (error) {
      console.error("Error publishing changelog:", error);
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        {/* Row for Repository + Version */}
        <div className="grid grid-cols-2 gap-4">
          {/* Repository */}
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
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
            <Button onClick={() => setOpenCommitsModal(true)}>
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
          className="bg-primary hover:bg-primary/90"
          onClick={handlePublish}
        >
          Publish Changelog
        </Button>
      </CardFooter>
    </Card>
  );
}
