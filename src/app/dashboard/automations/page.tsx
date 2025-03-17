"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Calendar } from "lucide-react";
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
import { ScheduleOptions } from "@/components/schedule-options";

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
const mockSchedules: ScheduleType[] = [
  { id: "1", type: "daily", enabled: true, projectSlug: "project-a" },
  { id: "2", type: "weekly", enabled: true, projectSlug: "project-a" },
  { id: "3", type: "monthly", enabled: false, projectSlug: "project-a" },
];

export default function ChangelogsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [changelogs, setChangelogs] = useState<ChangelogType[]>([]);
  const [schedules, setSchedules] = useState<ScheduleType[]>(mockSchedules);

  // The currently selected project slug
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // For the modal
  const [selectedChangelog, setSelectedChangelog] =
    useState<ChangelogType | null>(null);

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Load schedules for the selected project
        // loadSchedules(finalProjects[0].slug);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  // -----------------------------
  // 2) Load Changelogs with Pagination
  // -----------------------------

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
    // loadSchedules(value);
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
            <h1 className="text-3xl font-bold mb-2">Automations</h1>
            <p className="text-muted-foreground">
              Manage and schedule automations for your projects
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
            {/* <Link href="/dashboard/new">
              <Button className="w-full sm:w-auto bg-sidebar text-primary hover:bg-sidebar/80">
                <Plus className="mr-2 h-4 w-4" />
                New Automation
              </Button>
            </Link> */}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Automated Generation</h2>
          <Dialog
            open={scheduleDialogOpen}
            onOpenChange={setScheduleDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                <Calendar className="mr-2 h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[50vw]">
              <DialogHeader>
                <DialogTitle>Create Changelog Schedule</DialogTitle>
                <DialogDescription>
                  Set up automatic changelog generation for your project. You
                  can enable multiple schedules simultaneously.
                </DialogDescription>
              </DialogHeader>

              <ScheduleOptions
                selectedType={newScheduleType}
                onTypeChange={setNewScheduleType}
                onSubmit={handleCreateSchedule}
                onCancel={() => setScheduleDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="pt-6">
            {schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          schedule.enabled
                            ? "bg-green-500"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      ></div>
                      <span className="font-medium">
                        {formatScheduleType(schedule.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={(checked) =>
                          handleToggleSchedule(schedule.id, checked)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No schedules configured
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up automatic changelog generation for your project
                </p>
                <Button
                  variant="outline"
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  Create your first schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
