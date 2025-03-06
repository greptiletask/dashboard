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

/**
 * Example shape from your backend:
 * {
 *   "_id": { "$oid": "67c8ed805d4b6e43b5668d27" },
 *   "userId": "user_2tt3W9HDx36wQzPSwzNnfF9vHKQ",
 *   "repoFullName": "10DollarJob/marketplace",
 *   "customDomain": "",
 *   "isDomainVerified": false,
 *   "slug": "10dollarjob-marketplace",
 *   ...
 * }
 */
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

  // -----------------------------------------
  // 1) useMemo for fetch function
  // -----------------------------------------
  const fetchProjects = useMemo(
    () => async () => {
      try {
        // Adjust to match your actual endpoint
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
        // Suppose the response looks like { projects: ProjectItem[] }
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    []
  );

  // -----------------------------------------
  // 2) Call the memoized fetch on mount
  // -----------------------------------------
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // -----------------------------------------
  // 3) Row click => navigate
  // -----------------------------------------
  const handleRowClick = (projectId: string) => {
    // Navigate to /dashboard/domains/[projectId]
    router.push(`/dashboard/domains/${projectId}`);
  };

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  return (
    <div className="container mx-auto py-10 space-y-10">
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
                <TableHead>Project ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                // If customDomain is empty, show fallback domain
                const domainToShow = project.customDomain
                  ? project.customDomain
                  : `greptile-changelogs.com/${project.slug}`;

                // Determine status
                const isCustom =
                  project.customDomain && project.customDomain !== "";
                const domainStatus = isCustom ? "Active" : "Default";

                return (
                  <TableRow
                    key={project.slug}
                    onClick={() => handleRowClick(project.slug)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell className="font-medium">{project.slug}</TableCell>
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
