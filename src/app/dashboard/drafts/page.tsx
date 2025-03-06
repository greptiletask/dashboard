"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { Changelog } from "@/app/dashboard/new/page";

import { ChangelogModal } from "@/components/changelog-modal";

export default function ChangelogsPage() {
  const [selectedChangelog, setSelectedChangelog] = useState<any>(null);

  const [drafts, setDrafts] = useState<Changelog[]>([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const stored = localStorage.getItem("draft-changelogs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Changelog[];
        setDrafts(parsed);
      } catch (error) {
        console.error("Error parsing draft-changelogs:", error);
      }
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    const updated = drafts.filter((d) => d.draftId !== draftId);
    setDrafts(updated);
    localStorage.setItem("draft-changelogs", JSON.stringify(updated));
  };

  const handleOpenModal = (ch: any) => {
    setSelectedChangelog(ch);
  };
  const handleCloseModal = () => {
    setSelectedChangelog(null);
  };

  return (
    <div className="container mx-auto py-0 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Drafts</h1>
        <Link href="/dashboard/new">
          <Button className="bg-sidebar text-primary hover:bg-sidebar/80">
            <Plus className="mr-2 h-4 w-4" />
            New Changelog
          </Button>
        </Link>
      </div>

      {/* --- Table 2: Draft Changelogs (localStorage) --- */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Changelogs</CardTitle>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No draft changelogs found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Repo</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.draftId}>
                    <TableCell className="font-medium">
                      {draft.version}
                    </TableCell>
                    <TableCell>{draft.repo}</TableCell>
                    <TableCell>
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Continue editing => pass ?draftId */}
                      <Link href={`/dashboard/new?draftId=${draft.draftId}`}>
                        <Button variant="ghost" size="sm">
                          Continue Editing
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>

                      {/* Delete draft button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.draftId)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View a published changelog in a modal, if you use it */}
      <ChangelogModal
        changelog={selectedChangelog}
        isOpen={!!selectedChangelog}
        onClose={handleCloseModal}
      />
    </div>
  );
}
