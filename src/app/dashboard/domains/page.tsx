"use client";

import { useRouter } from "next/navigation";
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
import Link from "next/link";

// Mock data for projects and their domains
const projects = [
  {
    id: "project-1",
    name: "Marketing Website",
    customDomain: "marketing.example.com",
  },
  {
    id: "project-2",
    name: "Customer Portal",
    customDomain: "customers.example.com",
  },
  {
    id: "project-3",
    name: "Admin Dashboard",
    customDomain: null,
  },
  {
    id: "project-4",
    name: "API Documentation",
    customDomain: "api-docs.example.com",
  },
  {
    id: "project-5",
    name: "Analytics Platform",
    customDomain: null,
  },
];

export default function DomainsPage() {
  const router = useRouter();

  const handleRowClick = (projectId: string) => {
    router.push(`/dashboard/domains/${projectId}`);
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Domains</h1>
        <Link href="/dashboard/domains/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Domain
          </Button>
        </Link>
      </div>

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
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  onClick={() => handleRowClick(project.id)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <TableCell className="font-medium">
                    {project.id.substring(0, 4)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Github className="mr-2 h-4 w-4" />
                      {project.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.customDomain ? (
                      <div className="flex items-center">
                        {project.customDomain}
                        <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        greptile-changelogs.com/{project.id}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.customDomain ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
