"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for projects
const projects = [
  { id: "all", name: "All Projects" },
  { id: "project1", name: "Dashboard App" },
  { id: "project2", name: "Marketing Website" },
  { id: "project3", name: "Mobile Application" },
  { id: "project4", name: "E-commerce Platform" },
];

// Mock data for changelogs
const changelogs = [
  {
    id: "1",
    version: "v2.0.0",
    date: "2025-03-01",
    title: "Major Release: Enhanced AI Generation",
    type: "major",
    projectId: "project1",
  },
  {
    id: "2",
    version: "v1.5.0",
    date: "2025-02-15",
    title: "GitHub Integration and Performance Improvements",
    type: "minor",
    projectId: "project2",
  },
  {
    id: "3",
    version: "v1.4.2",
    date: "2025-02-01",
    title: "Bug Fixes and UI Enhancements",
    type: "patch",
    projectId: "project1",
  },
  {
    id: "4",
    version: "v1.4.1",
    date: "2025-01-15",
    title: "Security Updates",
    type: "patch",
    projectId: "project3",
  },
  {
    id: "5",
    version: "v1.4.0",
    date: "2025-01-01",
    title: "New Year, New Features",
    type: "minor",
    projectId: "project2",
  },
];

export default function ChangelogsPage() {
  const [selectedChangelog, setSelectedChangelog] = useState(null);
  const [selectedProject, setSelectedProject] = useState("all");

  const handleOpenModal = (changelog: any) => {
    setSelectedChangelog(changelog);
  };

  const handleCloseModal = () => {
    setSelectedChangelog(null);
  };

  // Filter changelogs based on selected project
  const filteredChangelogs =
    selectedProject === "all"
      ? changelogs
      : changelogs.filter(
          (changelog) => changelog.projectId === selectedProject
        );

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Changelogs</h1>
        <div className="flex items-center gap-4">
          <div className="w-[220px]">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="w-[220px]">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/dashboard/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Changelog
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedProject === "all"
              ? "All Changelogs"
              : `Changelogs for ${
                  projects.find((p) => p.id === selectedProject)?.name
                }`}
          </CardTitle>
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
              {filteredChangelogs.length > 0 ? (
                filteredChangelogs.map((changelog) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No changelogs found for this project
                  </TableCell>
                </TableRow>
              )}
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
