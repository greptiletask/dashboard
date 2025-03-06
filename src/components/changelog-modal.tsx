"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { marked } from "marked";

interface ChangelogModalProps {
  changelog: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({
  changelog,
  isOpen,
  onClose,
}: ChangelogModalProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (changelog) {
      // Simulate fetching detailed content
      setContent(changelog.changelog || "");
    }
  }, [changelog]);

  if (!changelog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[80vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {changelog.title}
            <Badge
              variant={
                changelog.type === "major"
                  ? "default"
                  : changelog.type === "minor"
                  ? "secondary"
                  : "outline"
              }
            >
              {changelog.version}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Released on{" "}
            {new Date(changelog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <div
            className="prose prose-sm dark:prose-invert max-w-none markdown-content"
            dangerouslySetInnerHTML={{ __html: marked(content) }}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-sidebar text-primary hover:bg-sidebar/80"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
