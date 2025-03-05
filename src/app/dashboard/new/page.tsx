"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";

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
import { Sparkles, Loader2, GitBranch, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// shadcn date/calendar primitives
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
// shadcn dialog for commits modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommitsDialog from "@/components/commits-modal";

// Type for date range used by `react-day-picker` (or shadcn’s `Calendar` in range mode)
interface DateRange {
  from?: Date;
  to?: Date;
}

// Example of your Repo + Changelog types
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

  // Repository selection
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");

  // Version
  const [version, setVersion] = useState("");

  // -----------------------------
  // 1) Date Range
  // -----------------------------
  // We store the selected date range in state.
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // For showing commits in a modal
  const [openCommitsModal, setOpenCommitsModal] = useState(false);

  // For fetching commits
  const [commits, setCommits] = useState<any[]>([]);
  const [isFetchingCommits, setIsFetchingCommits] = useState(false);
  const [fetchCommitsError, setFetchCommitsError] = useState<string | null>(
    null
  );

  const handleFetchCommits = async () => {
    setIsFetchingCommits(true);
    setFetchCommitsError(null);
    console.log(
      dateRange,
      "DATE RANGE, fetching commits...",
      selectedRepo,
      "SELECTED REPO"
    );

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/github/commits?&owner=${
          selectedRepo.split("/")[0]
        }&repo=${selectedRepo.split("/")[1]}&start=${format(
          dateRange.from!,
          "yyyy-MM-dd"
        )}&end=${format(dateRange.to!, "yyyy-MM-dd")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );
      console.log(response.data, "RESPONSE FROM FETCH COMMITS");
      if (response.data && Array.isArray(response.data)) {
        setCommits(response.data);
      }
    } catch (error) {
      console.error("Error fetching commits:", error);
      setFetchCommitsError("Failed to fetch commits");
    } finally {
      setIsFetchingCommits(false);
    }
  };

  useEffect(() => {
    if (openCommitsModal) {
      handleFetchCommits();
    }
  }, [openCommitsModal]);

  // Memoized fetch for Repos
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
        if (response.data && Array.isArray(response.data.data)) {
          setRepositories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    },
    []
  );

  // Fetch repositories on mount
  useEffect(() => {
    handleFetchRepos();
  }, [handleFetchRepos]);

  // Load saved repo from localStorage
  useEffect(() => {
    const storedRepo = localStorage.getItem("selectedRepo");
    if (storedRepo) {
      setSelectedRepo(storedRepo);
    }
  }, []);

  // AI generation (mock)
  const handleGenerateChangelog = async () => {
    setIsGenerating(true);
    try {
      // Mock delay just to show spinner
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

  // Save as draft
  const handleSaveDraft = () => {
    try {
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
      localStorage.setItem("draft-changelogs", JSON.stringify(storedDrafts));

      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // Publish
  const handlePublish = async () => {
    try {
      // Typically a POST request to your server
      // e.g. await axios.post(...);
      alert("Changelog published!");
    } catch (error) {
      console.error("Error publishing changelog:", error);
    }
  };

  // -----------------------------
  // 2) Show commits (Modal)
  // -----------------------------
  // For now, we mock the data. Later you can fetch actual commits based on dateRange & repo.

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
                console.log(value, "VALUE SELECTED");
                setSelectedRepo(value);
                localStorage.setItem("selectedRepo", value);
              }}
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
                  onSelect={(range) => {
                    console.log(range, "RANGESELECTED");
                    setDateRange(range || { from: undefined, to: undefined });
                  }}
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
