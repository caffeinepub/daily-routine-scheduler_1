import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    title: string;
    createdAt: bigint;
    daysOfWeek: Array<bigint>;
    time: string;
    notes: string;
}
export interface DailyCompletion {
    completedAt: bigint;
    date: string;
    taskId: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / ADD TASK
     */
    addTask(title: string, time: string, daysOfWeek: Array<bigint>, notes: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / DELETE TASK
     */
    deleteTask(id: bigint): Promise<boolean>;
    /**
     * / GET ALL USERS SUMMARY (ADMIN ONLY)
     */
    getAllUsersSummary(): Promise<Array<{
        taskCount: bigint;
        userPrincipal: string;
    }>>;
    /**
     * / GET CALLER USER PROFILE
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / GET COMPLETIONS FOR DATE
     */
    getCompletionsForDate(date: string): Promise<Array<DailyCompletion>>;
    /**
     * / GET TASKS (SORTED BY TIME)
     */
    getTasks(): Promise<Array<Task>>;
    /**
     * / GET USER PROFILE
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / MARK TASK DONE
     */
    markTaskDone(taskId: bigint, date: string): Promise<boolean>;
    /**
     * / SAVE CALLER USER PROFILE
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / UNMARK TASK DONE
     */
    unmarkTaskDone(taskId: bigint, date: string): Promise<boolean>;
    /**
     * / UPDATE TASK
     */
    updateTask(id: bigint, title: string, time: string, daysOfWeek: Array<bigint>, notes: string): Promise<boolean>;
}
