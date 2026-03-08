import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DailyCompletion, Task, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

/* ─── Tasks ──────────────────────────────────────────────────── */
export function useGetTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      time,
      daysOfWeek,
      notes,
    }: {
      title: string;
      time: string;
      daysOfWeek: bigint[];
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTask(title, time, daysOfWeek, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      time,
      daysOfWeek,
      notes,
    }: {
      id: bigint;
      title: string;
      time: string;
      daysOfWeek: bigint[];
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTask(id, title, time, daysOfWeek, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/* ─── Completions ────────────────────────────────────────────── */
export function useGetCompletions(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DailyCompletion[]>({
    queryKey: ["completions", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletionsForDate(date);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkTaskDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, date }: { taskId: bigint; date: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.markTaskDone(taskId, date);
    },
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: ["completions", date] });
    },
  });
}

export function useUnmarkTaskDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, date }: { taskId: bigint; date: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.unmarkTaskDone(taskId, date);
    },
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: ["completions", date] });
    },
  });
}

/* ─── User Profile ───────────────────────────────────────────── */
export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

/* ─── Admin ──────────────────────────────────────────────────── */
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsersSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<{ taskCount: bigint; userPrincipal: string }>>({
    queryKey: ["allUsersSummary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersSummary();
    },
    enabled: !!actor && !isFetching,
  });
}
