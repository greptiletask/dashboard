"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Copy,
  Download,
  GitBranch,
  Github,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { DateRange } from "react-day-picker";

const formSchema = z.object({
  repoUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine((url) => url.includes("github.com"), {
      message: "URL must be a GitHub repository",
    }),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  branch: z.string().min(1, "Please select a branch"),
});

type FormValues = z.infer<typeof formSchema>;

// Mock branches for demo
const branches = [
  { value: "main", label: "main" },
  { value: "develop", label: "develop" },
  { value: "feature/new-ui", label: "feature/new-ui" },
  { value: "bugfix/issue-123", label: "bugfix/issue-123" },
];

export default function ScanPage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [changelog, setChangelog] = React.useState<string>("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      branch: "main",
      dateRange,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setChangelog("");

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("data for scan", data);

      const formattedDateRange = {
        from: format(data.dateRange?.from || new Date(), "yyyy-MM-dd"),
        to: format(data.dateRange?.to || new Date(), "yyyy-MM-dd"),
      };
      console.log("formattedDateRange", formattedDateRange);

      // Mock response
      const mockChangelog = `## Changes between ${formattedDateRange.from} and ${formattedDateRange.to} on branch ${data.branch}

### Features
- Add new dashboard UI components
- Implement authentication flow with GitHub OAuth
- Add dark mode support

### Bug Fixes
- Fix issue with pagination in repository list
- Resolve styling issues in mobile view
- Fix date range picker in Safari

### Performance
- Optimize bundle size with code splitting
- Improve loading time for large repositories

### Documentation
- Update README with new features
- Add contributing guidelines
- Improve API documentation
`;

      setChangelog(mockChangelog);
    } catch (error) {
      console.error("Error generating changelog:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(changelog);
  };

  const downloadChangelog = () => {
    // Create a hidden iframe to render the PDF
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Write the changelog content with basic HTML styling
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Changelog</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${changelog}</pre>
        </body>
      </html>
    `;

    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(content);
    iframe.contentWindow?.document.close();

    // Use setTimeout to ensure content is loaded
    setTimeout(() => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 250);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Changelog Generator
        </CardTitle>
        <CardDescription>
          Generate changelogs for public GitHub repositories by providing the
          repository URL, date range, and branch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="repoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/username/repository"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the URL of the public GitHub repository.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Range</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange(range);
                            field.onChange(range);
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the date range for the changelog.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Branch</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <div className="flex items-center">
                              <GitBranch className="mr-2 h-4 w-4" />
                              {field.value
                                ? branches.find(
                                    (branch) => branch.value === field.value
                                  )?.label
                                : "Select branch"}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search branch..." />
                          <CommandList>
                            <CommandEmpty>No branch found.</CommandEmpty>
                            <CommandGroup>
                              {branches.map((branch) => (
                                <CommandItem
                                  key={branch.value}
                                  value={branch.value}
                                  onSelect={() => {
                                    form.setValue("branch", branch.value);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      branch.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {branch.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the branch to generate the changelog for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Changelog"
              )}
            </Button>
          </form>
        </Form>

        {changelog && (
          <div className="mt-6">
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              {/* <h3 className="text-lg font-medium">Generated Changelog</h3> */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadChangelog}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm">{changelog}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
