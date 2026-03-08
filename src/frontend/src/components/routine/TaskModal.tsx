import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Task } from "../../backend.d";
import { useAddTask, useUpdateTask } from "../../hooks/useQueries";
import { DAY_LABELS } from "../../utils/date";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

const ALL_DAYS: bigint[] = [0n, 1n, 2n, 3n, 4n, 5n, 6n];

export default function TaskModal({ open, onClose, editTask }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [selectedDays, setSelectedDays] = useState<bigint[]>([
    1n,
    2n,
    3n,
    4n,
    5n,
  ]);
  const [notes, setNotes] = useState("");

  const addTask = useAddTask();
  const updateTask = useUpdateTask();
  const isPending = addTask.isPending || updateTask.isPending;

  // Prefill when editing (reset when modal opens or editTask changes)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset when modal opens
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setTime(editTask.time);
      setSelectedDays([...editTask.daysOfWeek]);
      setNotes(editTask.notes);
    } else {
      setTitle("");
      setTime("08:00");
      setSelectedDays([1n, 2n, 3n, 4n, 5n]);
      setNotes("");
    }
  }, [editTask, open]);

  const toggleDay = (day: bigint) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    try {
      if (editTask) {
        await updateTask.mutateAsync({
          id: editTask.id,
          title: title.trim(),
          time,
          daysOfWeek: selectedDays,
          notes: notes.trim(),
        });
        toast.success("Task updated");
      } else {
        await addTask.mutateAsync({
          title: title.trim(),
          time,
          daysOfWeek: selectedDays,
          notes: notes.trim(),
        });
        toast.success("Task added");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            {editTask ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-sm font-medium">
              Task title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              data-ocid="task.input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning meditation"
              className="h-9"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <Label htmlFor="task-time" className="text-sm font-medium">
              Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-time"
              data-ocid="task.time_input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9 w-36"
            />
          </div>

          {/* Days of week */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Repeat on <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-1.5">
              {ALL_DAYS.map((day) => {
                const isActive = selectedDays.includes(day);
                return (
                  <button
                    key={day.toString()}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`day-pill ${isActive ? "day-pill-active" : "day-pill-inactive"}`}
                    aria-pressed={isActive}
                    title={DAY_LABELS[Number(day)]}
                  >
                    {DAY_LABELS[Number(day)].charAt(0)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedDays.length === 0
                ? "No days selected"
                : selectedDays.length === 7
                  ? "Every day"
                  : selectedDays
                      .sort((a, b) => Number(a) - Number(b))
                      .map((d) => DAY_LABELS[Number(d)])
                      .join(", ")}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="task-notes" className="text-sm font-medium">
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="task-notes"
              data-ocid="task.notes_input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details about this task..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="task.cancel_button"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            data-ocid="task.submit_button"
            disabled={isPending || !title.trim() || selectedDays.length === 0}
            className="bg-primary text-primary-foreground gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </>
            ) : editTask ? (
              "Update Task"
            ) : (
              "Add Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
