"use client";

import { format } from "date-fns";
import {
  Calendar,
  GitCommit,
  User,
  Clock,
  Code,
  Bug,
  Puzzle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function to determine commit type and icon
const getCommitTypeInfo = (message: string) => {
  if (
    message.toLowerCase().startsWith("ft:") ||
    message.toLowerCase().startsWith("feat:") ||
    message.toLowerCase().startsWith("feature:")
  ) {
    return {
      type: "Feature",
      icon: Puzzle,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
  } else if (
    message.toLowerCase().startsWith("fix:") ||
    message.toLowerCase().startsWith("bug:")
  ) {
    return {
      type: "Fix",
      icon: Bug,
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
  } else {
    return {
      type: "Code",
      icon: Code,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
  }
};

// Helper function to format date
const formatCommitDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    return dateString;
  }
};

export default function CommitsDialog({
  isOpen,
  setOpen,
  commits,
  dateRange,
  isFetchingCommits,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  commits: any[];
  dateRange: { from?: Date; to?: Date } | undefined;
  isFetchingCommits: boolean;
}) {
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const copyToClipboard = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
        {isFetchingCommits ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <GitCommit className="h-5 w-5" />
                Considered Commits
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1 mt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  From{" "}
                  <strong>
                    {dateRange?.from
                      ? format(dateRange.from, "PPP")
                      : "Not selected"}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {dateRange?.to
                      ? format(dateRange.to, "PPP")
                      : "Not selected"}
                  </strong>
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 mt-4">
              <div className="space-y-4">
                {commits.map((commit) => {
                  const {
                    type,
                    icon: TypeIcon,
                    color,
                  } = getCommitTypeInfo(commit.commit.message);
                  const shortSha = commit.sha.substring(0, 7);
                  const commitDate = commit.commit.author.date;
                  const authorName = commit.commit.author.name;
                  const avatarUrl = commit.author?.avatar_url;

                  return (
                    <div
                      key={commit.sha}
                      className="border rounded-lg overflow-hidden bg-card shadow-sm"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 ${color}`}
                            >
                              <TypeIcon className="h-3 w-3" />
                              <span>{type}</span>
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 font-mono text-xs"
                                    onClick={() => copyToClipboard(commit.sha)}
                                  >
                                    {shortSha}
                                    {copiedSha === commit.sha ? (
                                      <Check className="ml-1 h-3 w-3" />
                                    ) : (
                                      <Copy className="ml-1 h-3 w-3 opacity-70" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {copiedSha === commit.sha
                                    ? "Copied!"
                                    : "Copy full SHA"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  asChild
                                >
                                  <a
                                    href={commit.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View on GitHub</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <h3 className="text-base font-medium mb-3">
                          {commit.commit.message}
                        </h3>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={avatarUrl} alt={authorName} />
                              <AvatarFallback className="text-xs">
                                {authorName
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {authorName}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatCommitDate(commitDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="mt-4 pt-2 border-t">
              <div className="text-xs text-muted-foreground mr-auto">
                Showing {commits.length} commit{commits.length !== 1 ? "s" : ""}
              </div>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
