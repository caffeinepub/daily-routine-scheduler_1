import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { Task } from "../../backend.d";
import { DAY_LABELS, formatTime12 } from "../../utils/date";

interface TaskCardProps {
  task: Task;
  index: number;
  isDone: boolean;
  isTogglingDone: boolean;
  onToggleDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showDays?: boolean;
}

export default function TaskCard({
  task,
  index,
  isDone,
  isTogglingDone,
  onToggleDone,
  onEdit,
  onDelete,
  showDays = false,
}: TaskCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`group flex items-start gap-3 p-4 rounded-xl bg-card border transition-all duration-200 ${
        isDone
          ? "border-border/40 shadow-xs"
          : "border-border shadow-task hover:shadow-task-hover"
      }`}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        <Checkbox
          data-ocid={`task.checkbox.${index}`}
          checked={isDone}
          onCheckedChange={onToggleDone}
          disabled={isTogglingDone}
          className={`w-5 h-5 rounded-md transition-all duration-150 ${
            isDone
              ? "border-primary/40 bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              : "border-border"
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Time */}
            <span className="text-xs font-semibold text-primary/80 mb-0.5 block font-mono tracking-wide">
              {formatTime12(task.time)}
            </span>
            {/* Title */}
            <p
              className={`text-sm font-semibold leading-snug transition-all duration-300 ${
                isDone ? "task-done text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.title}
            </p>
            {/* Notes */}
            {task.notes && (
              <p
                className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                  isDone ? "text-muted-foreground/50" : "text-muted-foreground"
                }`}
              >
                {task.notes}
              </p>
            )}
            {/* Day badges */}
            {showDays && (
              <div className="flex flex-wrap gap-1 mt-2">
                {[...task.daysOfWeek]
                  .sort((a, b) => Number(a) - Number(b))
                  .map((d) => (
                    <Badge
                      key={d.toString()}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 rounded-full"
                    >
                      {DAY_LABELS[Number(d)]}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Button
              variant="ghost"
              size="icon"
              data-ocid={`task.edit_button.${index}`}
              onClick={onEdit}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-ocid={`task.delete_button.${index}`}
              onClick={onDelete}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
