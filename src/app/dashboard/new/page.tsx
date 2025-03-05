"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, GitBranch } from "lucide-react";

// Mock data for repositories
const repositories = [
  { id: "1", name: "my-awesome-project" },
  { id: "2", name: "cool-new-app" },
  { id: "3", name: "super-library" },
];

export default function NewChangelogForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [activeTab, setActiveTab] = useState("edit");

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(`
# New Features
- Implemented user authentication system
- Added dark mode support
- Introduced new dashboard widgets

# Improvements
- Enhanced performance of data loading
- Updated UI components for better accessibility
- Refactored codebase for improved maintainability

# Bug Fixes
- Fixed issue with form submission on Safari
- Resolved data synchronization problems
- Corrected styling inconsistencies in mobile view
      `);
      setIsGenerating(false);
      setActiveTab("preview");
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Changelog Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    <div className="flex items-center">
                      <GitBranch className="mr-2 h-4 w-4" />
                      {repo.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input id="version" placeholder="e.g. v1.0.0" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Changelog Content</Label>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                id="content"
                placeholder="Enter changelog content or generate with AI..."
                className="min-h-[300px] font-mono"
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="preview">
              <Card className="bg-secondary/50 border-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Badge>v1.0.0</Badge>
                    <span className="text-sm text-muted-foreground">
                      Minor Release
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert">
                    {generatedContent ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        No content to preview yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Save as Draft</Button>
        <Button className="bg-primary hover:bg-primary/90">
          Publish Changelog
        </Button>
      </CardFooter>
    </Card>
  );
}
