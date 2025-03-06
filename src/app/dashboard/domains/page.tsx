"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Github } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton here

interface ProjectItem {
  userId: string;
  repoFullName: string;
  customDomain: string;
  isDomainVerified: boolean;
  slug: string;
  [key: string]: any; // for additional fields
}

export default function DomainsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized fetch
  const fetchProjects = useMemo(
    () => async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/changelog/projects`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "clerk-authToken"
              )}`,
            },
          }
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Row click => navigate
  const handleRowClick = (projectId: string) => {
    router.push(`/dashboard/domains/${projectId}`);
  };

  return (
    <div className="container mx-auto py-0 space-y-10">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Domains</h1>
        <Link href="/dashboard/domains/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Domain
          </Button>
        </Link>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Display multiple skeleton rows while loading
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : projects.length > 0 ? (
                projects.map((project) => {
                  const domainToShow = project.customDomain
                    ? project.customDomain
                    : `greptile-changelogs.com/${project.slug}`;
                  const isCustom =
                    project.customDomain && project.customDomain !== "";
                  const domainStatus = isCustom ? "Active" : "Default";

                  return (
                    <TableRow
                      key={project.slug}
                      onClick={() => handleRowClick(project.slug)}
                      className="cursor-pointer hover:bg-muted"
                    >
                      <TableCell className="font-medium">
                        {project.slug}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Github className="mr-2 h-4 w-4" />
                          {project.repoFullName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isCustom ? (
                          <div className="flex items-center">
                            {domainToShow}
                            <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {domainToShow}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isCustom ? (
                          <Badge variant="default">{domainStatus}</Badge>
                        ) : (
                          <Badge variant="outline">{domainStatus}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                // No projects found after loading
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
