import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend.d";
import DeleteDialog from "../components/routine/DeleteDialog";
import TaskCard from "../components/routine/TaskCard";
import TaskModal from "../components/routine/TaskModal";
import {
  useDeleteTask,
  useGetCompletions,
  useGetTasks,
  useGetUserProfile,
  useMarkTaskDone,
  useSaveUserProfile,
  useUnmarkTaskDone,
} from "../hooks/useQueries";
import {
  formatDisplayDate,
  timeOfDay,
  timeToMinutes,
  todayDayOfWeek,
  todayString,
} from "../utils/date";

export default function SchedulePage() {
  const today = todayString();
  const todayDow = todayDayOfWeek();

  const { data: tasks, isLoading: tasksLoading } = useGetTasks();
  const { data: completions, isLoading: completionsLoading } =
    useGetCompletions(today);
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();

  const markDone = useMarkTaskDone();
  const unmarkDone = useUnmarkTaskDone();
  const deleteTask = useDeleteTask();
  const saveProfile = useSaveUserProfile();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Profile editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // All tasks section toggle
  const [allTasksExpanded, setAllTasksExpanded] = useState(false);

  // Tracking which tasks are toggling
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const isLoading = tasksLoading || completionsLoading;

  // Derived data
  const doneTaskIds = new Set(
    completions?.map((c) => c.taskId.toString()) ?? [],
  );

  const todayTasks = (tasks ?? [])
    .filter((t) => t.daysOfWeek.map(Number).includes(todayDow))
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const allTasks = [...(tasks ?? [])].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
  );

  const completedCount = todayTasks.filter((t) =>
    doneTaskIds.has(t.id.toString()),
  ).length;
  const progress =
    todayTasks.length > 0 ? completedCount / todayTasks.length : 0;

  const greetingTime = timeOfDay();
  const greetingWord =
    greetingTime === "morning"
      ? "Good morning"
      : greetingTime === "afternoon"
        ? "Good afternoon"
        : "Good evening";

  const displayName = profile?.name?.trim() || null;

  const handleToggleDone = async (task: Task) => {
    const idStr = task.id.toString();
    const isDone = doneTaskIds.has(idStr);
    setTogglingIds((prev) => new Set(prev).add(idStr));
    try {
      if (isDone) {
        await unmarkDone.mutateAsync({ taskId: task.id, date: today });
      } else {
        await markDone.mutateAsync({ taskId: task.id, date: today });
      }
    } catch {
      toast.error("Failed to update task. Please try again.");
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(idStr);
        return next;
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask.mutateAsync(taskToDelete.id);
      toast.success(`"${taskToDelete.title}" deleted`);
    } catch {
      toast.error("Failed to delete task.");
    } finally {
      setDeleteOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    try {
      await saveProfile.mutateAsync({ name: trimmed });
      toast.success("Name saved");
      setEditingName(false);
      setNameInput("");
    } catch {
      toast.error("Failed to save name.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* ─── Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        {profileLoading ? (
          <Skeleton className="h-7 w-56" />
        ) : displayName ? (
          <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
            {greetingWord}, <span className="text-gradient">{displayName}</span>
            ! 👋
          </h1>
        ) : (
          <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
            {greetingWord}! 👋
          </h1>
        )}
        <p className="text-sm text-muted-foreground">
          {formatDisplayDate(today)}
        </p>

        {/* Profile name prompt */}
        {!profileLoading && !displayName && (
          <div className="mt-3">
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  data-ocid="profile.input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  className="h-8 text-sm w-44"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  disabled={!nameInput.trim() || saveProfile.isPending}
                  className="h-8 px-3 text-xs bg-primary text-primary-foreground"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingName(false);
                    setNameInput("");
                  }}
                  className="h-8 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                + Set your name
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* ─── Progress Bar ─────────────────────────────────────── */}
      {todayTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4 shadow-task"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">
              Today's progress
            </p>
            <span className="text-sm font-bold text-primary">
              {completedCount} / {todayTasks.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          {progress === 1 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-primary font-semibold mt-2"
            >
              🎉 All done for today!
            </motion.p>
          )}
        </motion.div>
      )}

      {/* ─── Today's Tasks ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Today's Tasks
            {todayTasks.length > 0 && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {todayTasks.length}
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div data-ocid="schedule.loading_state" className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <motion.div
            data-ocid="task.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-border"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <CalendarDays className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              No tasks for today
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Add your first routine to start building a schedule
            </p>
            <Button
              onClick={() => {
                setEditTask(null);
                setModalOpen(true);
              }}
              size="sm"
              className="mt-4 bg-primary text-primary-foreground gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add your first routine
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {todayTasks.map((task, i) => (
                <TaskCard
                  key={task.id.toString()}
                  task={task}
                  index={i + 1}
                  isDone={doneTaskIds.has(task.id.toString())}
                  isTogglingDone={togglingIds.has(task.id.toString())}
                  onToggleDone={() => handleToggleDone(task)}
                  onEdit={() => handleEdit(task)}
                  onDelete={() => handleDeleteClick(task)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>

      {/* ─── All Tasks ────────────────────────────────────────── */}
      {allTasks.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setAllTasksExpanded((v) => !v)}
            className="flex items-center gap-2 mb-3 group"
          >
            <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2">
              All Routines
              <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {allTasks.length}
              </span>
            </h2>
            {allTasksExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>

          <AnimatePresence>
            {allTasksExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {allTasks.map((task, i) => (
                    <TaskCard
                      key={task.id.toString()}
                      task={task}
                      index={i + 1}
                      isDone={doneTaskIds.has(task.id.toString())}
                      isTogglingDone={togglingIds.has(task.id.toString())}
                      onToggleDone={() => handleToggleDone(task)}
                      onEdit={() => handleEdit(task)}
                      onDelete={() => handleDeleteClick(task)}
                      showDays
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ─── Floating Add Button ──────────────────────────────── */}
      <motion.button
        type="button"
        data-ocid="schedule.add_button"
        onClick={() => {
          setEditTask(null);
          setModalOpen(true);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-6 z-30 flex items-center gap-2 bg-primary text-primary-foreground rounded-2xl px-5 py-3.5 font-semibold text-sm shadow-float transition-all duration-200 hover:bg-primary/90"
        style={{
          boxShadow:
            "0 8px 32px oklch(0.52 0.1 155 / 0.35), 0 2px 8px oklch(0.2 0.02 85 / 0.15)",
        }}
      >
        <Plus className="w-4 h-4" />
        <span>Add Task</span>
      </motion.button>

      {/* ─── Task Modal ───────────────────────────────────────── */}
      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTask(null);
        }}
        editTask={editTask}
      />

      {/* ─── Delete Dialog ────────────────────────────────────── */}
      <DeleteDialog
        open={deleteOpen}
        taskTitle={taskToDelete?.title ?? ""}
        isPending={deleteTask.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
}
