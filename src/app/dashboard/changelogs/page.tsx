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
import {
  ArrowRight,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { ChangelogModal } from "@/components/changelog-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface ScheduleType {
  id: string;
  type: "daily" | "weekly" | "monthly";
  enabled: boolean;
  projectSlug: string;
}

export default function ChangelogsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [changelogs, setChangelogs] = useState<ChangelogType[]>([]);
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);

  // The currently selected project slug
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // For the modal
  const [selectedChangelog, setSelectedChangelog] =
    useState<ChangelogType | null>(null);

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 5;

  // For schedule dialog
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [newScheduleType, setNewScheduleType] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

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

      const finalProjects = [...fetchedProjects];
      setProjects(finalProjects);

      // Default selection: "all" or the first real project
      if (finalProjects.length > 0) {
        setSelectedProject(finalProjects[0].slug);
        // Load all changelogs initially (or pick first project)
        loadChangelogs(finalProjects[0].slug, 1);
        // Load schedules for the selected project
        loadSchedules(finalProjects[0].slug);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  // -----------------------------
  // 2) Load Changelogs with Pagination
  // -----------------------------
  const loadChangelogs = async (projectSlug: string, page: number) => {
    try {
      // If user chooses "all", you might have a dedicated endpoint for all
      // or pass "all" to the route. Adjust as needed:
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/changelogs`;
      if (projectSlug !== "all") {
        url += `/${projectSlug}`;
      }

      const response = await axios.get(url, {
        params: {
          page,
          limit: rowsPerPage,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
        },
      });

      // Suppose your API returns { changelogs: ChangelogType[], totalPages: number }
      setChangelogs(response.data.changelogs || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading changelogs:", error);
      setChangelogs([]);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  // -----------------------------
  // 3) Load Schedules
  // -----------------------------
  const loadSchedules = async (projectSlug: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/schedules/${projectSlug}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
        },
      });

      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      setSchedules([]);
    }
  };

  // -----------------------------
  // 4) Handle Project Change (Select)
  // -----------------------------
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    loadChangelogs(value, 1);
    loadSchedules(value);
  };

  // -----------------------------
  // 5) Pagination Handlers
  // -----------------------------
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadChangelogs(selectedProject, currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadChangelogs(selectedProject, currentPage - 1);
    }
  };

  // -----------------------------
  // 6) Schedule Handlers
  // -----------------------------
  const handleCreateSchedule = async () => {
    try {
      const scheduleData = {
        type: newScheduleType,
        projectSlug: selectedProject,
        enabled: true,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/schedules`,
        scheduleData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );

      // Reload schedules
      loadSchedules(selectedProject);
      setScheduleDialogOpen(false);

      // Reset form
      setNewScheduleType("daily");
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, enabled: boolean) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/schedules/${scheduleId}`,
        { enabled },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );

      // Update local state
      setSchedules(
        schedules.map((schedule) =>
          schedule.id === scheduleId ? { ...schedule, enabled } : schedule
        )
      );
    } catch (error) {
      console.error("Error toggling schedule:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/schedules/${scheduleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-authToken")}`,
          },
        }
      );

      // Update local state
      setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId));
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  // -----------------------------
  // 7) Modal Helpers
  // -----------------------------
  const handleOpenModal = (changelog: ChangelogType) => {
    setSelectedChangelog(changelog);
  };

  const handleCloseModal = () => {
    setSelectedChangelog(null);
  };

  // Helper function to format schedule type with fixed time
  const formatScheduleType = (type: string) => {
    switch (type) {
      case "daily":
        return "Daily (11:59 PM UTC)";
      case "weekly":
        return "Weekly (Friday 11:59 PM UTC)";
      case "monthly":
        return "Monthly (1st of month 11:59 PM UTC)";
      default:
        return "Unknown";
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="py-0 space-y-8">
      {/* Project Selection Header */}
      <div className="py-0 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Changelogs</h1>
            <p className="text-muted-foreground">
              Manage and schedule changelogs for your projects
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Select value={selectedProject} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full sm:w-[200px] text-sm min-w-[250px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project: ProjectType) => (
                  <SelectItem
                    key={project.slug}
                    value={project.slug}
                    className="text-sm min-w-[250px]"
                  >
                    {project.repoFullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/dashboard/new">
              <Button className="w-full sm:w-auto bg-sidebar text-primary hover:bg-sidebar/80">
                <Plus className="mr-2 h-4 w-4" />
                New Changelog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Changelogs Section */}

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
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
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
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No changelogs found for this project
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {changelogs.length > 0 && (
            <div className="flex items-center justify-between mt-0">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
