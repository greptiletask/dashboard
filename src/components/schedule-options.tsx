"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock } from "lucide-react";

interface ScheduleOptionsProps {
  selectedType: "daily" | "weekly" | "monthly";
  onTypeChange: (type: "daily" | "weekly" | "monthly") => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ScheduleOptions({
  selectedType,
  onTypeChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ScheduleOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Schedule Options</span>
        </div>
        <p className="text-sm text-muted-foreground">
          You can enable multiple schedules simultaneously for more flexible
          changelog generation.
        </p>
      </div>

      <RadioGroup
        value={selectedType}
        onValueChange={(value: "daily" | "weekly" | "monthly") =>
          onTypeChange(value)
        }
        className="space-y-4"
      >
        <div className="flex items-start space-x-3 space-y-0">
          <RadioGroupItem value="daily" id="daily" />
          <div className="grid gap-1.5">
            <Label htmlFor="daily" className="font-medium">
              Daily
            </Label>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Every day at 11:59 PM UTC</span>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-3 space-y-0">
          <RadioGroupItem value="weekly" id="weekly" />
          <div className="grid gap-1.5">
            <Label htmlFor="weekly" className="font-medium">
              Weekly
            </Label>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Every Friday at 11:59 PM UTC</span>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-3 space-y-0">
          <RadioGroupItem value="monthly" id="monthly" />
          <div className="grid gap-1.5">
            <Label htmlFor="monthly" className="font-medium">
              Monthly
            </Label>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>1st of each month at 11:59 PM UTC</span>
            </div>
          </div>
        </div>
      </RadioGroup>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Schedule"}
        </Button>
      </div>
    </div>
  );
}
