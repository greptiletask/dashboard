"use client";

import { useState, useEffect } from "react";
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
import axios from "axios";

// Adjust these interfaces/types according to your backend response
interface ProjectType {
  id: string;
  slug: string;
  repoFullName: string;
}

interface ChangelogType {
  id: string;
  version: string;
  createdAt: string;
  title: string;
  projectSlug: string;
}

export default function ChangelogsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [changelogs, setChangelogs] = useState<ChangelogType[]>([]);

  // The currently selected project slug
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // For the modal
  const [selectedChangelog, setSelectedChangelog] =
    useState<ChangelogType | null>(null);

  // -----------------------------
  // 1) Load Projects on Mount
  // -----------------------------
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/projects`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );

      // Suppose your API returns { projects: ProjectType[] }
      const fetchedProjects: ProjectType[] = response.data.projects || [];

      // Optionally prepend an "All Projects" item if you want to handle that
      const allItem: ProjectType = {
        id: "all",
        slug: "all",
        repoFullName: "All Projects",
      };

      const finalProjects = [...fetchedProjects];
      setProjects(finalProjects);

      // Default selection: "all" or the first real project
      setSelectedProject(finalProjects[0].slug);
      // Load all changelogs initially (or pick first project)
      loadChangelogs(finalProjects[0].slug);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  // -----------------------------
  // 2) Load Changelogs
  // -----------------------------
  const loadChangelogs = async (projectSlug: string) => {
    try {
      // If user chooses "all", you might have a dedicated endpoint for all
      // or pass "all" to the route. Adjust as needed:
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/changelogs`;
      if (projectSlug !== "all") {
        url += `/${projectSlug}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
        },
      });

      // Suppose your API returns { changelogs: ChangelogType[] }
      setChangelogs(response.data.changelogs || []);
    } catch (error) {
      console.error("Error loading changelogs:", error);
      setChangelogs([]);
    }
  };

  // -----------------------------
  // 3) Handle Project Change (Select)
  // -----------------------------
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    loadChangelogs(value);
  };

  // -----------------------------
  // 4) Modal Helpers
  // -----------------------------
  const handleOpenModal = (changelog: ChangelogType) => {
    setSelectedChangelog(changelog);
  };

  const handleCloseModal = () => {
    setSelectedChangelog(null);
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="py-0 space-y-10">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Changelogs</h1>
        <div className="flex items-center gap-4">
          {/* Project Selector */}
          <div className="w-fit">
            <Select value={selectedProject} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-fit px-4">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="w-fit">
                {projects.map((project: ProjectType) => (
                  <SelectItem key={project.slug} value={project.slug}>
                    {project.repoFullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Changelog Button */}
          <Link href="/dashboard/new">
            <Button className="bg-sidebar text-primary hover:bg-sidebar/80">
              <Plus className="mr-2 h-4 w-4" />
              New Changelog
            </Button>
          </Link>
        </div>
      </div>

      {/* Changelogs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedProject === "all"
              ? "All Changelogs"
              : `Changelogs for ${selectedProject}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>View at</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changelogs.length > 0 ? (
                changelogs.map((changelog: ChangelogType) => (
                  <TableRow key={changelog.id}>
                    <TableCell className="font-medium">
                      {changelog.version}
                    </TableCell>
                    <TableCell>{changelog.title}</TableCell>
                    <TableCell>
                      <a
                        href={`https://autocl.live/${changelog.projectSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        autocl.live/{changelog.projectSlug}
                      </a>
                    </TableCell>
                    <TableCell>
                      {new Date(changelog.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </TableCell>
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
                    colSpan={3}
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

      {/* Modal */}
      <ChangelogModal
        changelog={selectedChangelog}
        isOpen={!!selectedChangelog}
        onClose={handleCloseModal}
      />
    </div>
  );
}
