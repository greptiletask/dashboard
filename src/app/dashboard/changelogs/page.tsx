"use client";

import { useState } from "react";
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
import { ArrowRight, Plus } from "lucide-react";
import { ChangelogModal } from "@/components/changelog-modal";

// Mock data for changelogs
const changelogs = [
  {
    id: "1",
    version: "v2.0.0",
    date: "2025-03-01",
    title: "Major Release: Enhanced AI Generation",
    type: "major",
  },
  {
    id: "2",
    version: "v1.5.0",
    date: "2025-02-15",
    title: "GitHub Integration and Performance Improvements",
    type: "minor",
  },
  {
    id: "3",
    version: "v1.4.2",
    date: "2025-02-01",
    title: "Bug Fixes and UI Enhancements",
    type: "patch",
  },
  {
    id: "4",
    version: "v1.4.1",
    date: "2025-01-15",
    title: "Security Updates",
    type: "patch",
  },
  {
    id: "5",
    version: "v1.4.0",
    date: "2025-01-01",
    title: "New Year, New Features",
    type: "minor",
  },
];

export default function ChangelogsPage() {
  const [selectedChangelog, setSelectedChangelog] = useState(null);

  const handleOpenModal = (changelog: any) => {
    setSelectedChangelog(changelog);
  };

  const handleCloseModal = () => {
    setSelectedChangelog(null);
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Changelogs</h1>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Changelog
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Changelogs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changelogs.map((changelog) => (
                <TableRow key={changelog.id}>
                  <TableCell className="font-medium">
                    {changelog.version}
                  </TableCell>
                  <TableCell>{changelog.title}</TableCell>
                  <TableCell>{changelog.date}</TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(changelog)}
                    >
                      View <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ChangelogModal
        changelog={selectedChangelog}
        isOpen={!!selectedChangelog}
        onClose={handleCloseModal}
      />
    </div>
  );
}
