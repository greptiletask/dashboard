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

interface Changelog {
  id: string;
  version: string;
  date: string;
  title: string;
  type: "major" | "minor" | "patch";
  content?: string;
}

interface ChangelogModalProps {
  changelog: Changelog | null;
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
      setContent(`
        <h2>New Features</h2>
        <ul>
          <li>Implemented user authentication system</li>
          <li>Added dark mode support</li>
          <li>Introduced new dashboard widgets</li>
        </ul>
        <h2>Improvements</h2>
        <ul>
          <li>Enhanced performance of data loading</li>
          <li>Updated UI components for better accessibility</li>
          <li>Refactored codebase for improved maintainability</li>
        </ul>
        <h2>Bug Fixes</h2>
        <ul>
          <li>Fixed issue with form submission on Safari</li>
          <li>Resolved data synchronization problems</li>
          <li>Corrected styling inconsistencies in mobile view</li>
        </ul>
      `);
    }
  }, [changelog]);

  if (!changelog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
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
            Released on {changelog.date}
          </p>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
