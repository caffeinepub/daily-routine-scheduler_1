# Daily Routine Scheduler

## Current State
The project currently contains an AI Q&A app (main.mo) with a public question/answer feed. The frontend renders questions and answers with a cosmic dark theme.

## Requested Changes (Diff)

### Add
- User authentication (authorization component) so each person has their own private schedule
- Schedule/routine data model: each user can create named tasks with a time of day, days of the week, and optional notes
- Backend APIs: addTask, updateTask, deleteTask, getTasks (per-user)
- Admin/owner view: the app owner can see all users and their task counts
- Frontend: Daily schedule view showing tasks grouped and sorted by time
- Ability to mark tasks as done for the day (daily completion tracking)
- Add/edit/delete task modal
- Owner dashboard accessible only to the admin principal

### Modify
- Replace the Q&A backend entirely with the new routine/schedule backend
- Replace the Q&A frontend with the new Daily Routine Scheduler UI

### Remove
- All Q&A-related backend logic (questions, askQuestion, getQuestions)
- All Q&A-related frontend components and pages

## Implementation Plan
1. Select the authorization component for per-user identity
2. Generate Motoko backend with:
   - Task type: id, title, time (text HH:MM), daysOfWeek ([Nat] 0-6), notes, createdAt
   - DailyCompletion type: taskId, date (text YYYY-MM-DD), completedAt
   - Per-user task storage keyed by principal
   - addTask, updateTask, deleteTask, getTasks, markTaskDone, unmarkTaskDone, getCompletionsForDate
   - Admin functions: getAllUsersSummary (owner-only, returns list of {principal, taskCount})
3. Build frontend:
   - Login/logout via Internet Identity
   - Main schedule view: tasks sorted by time, grouped visually
   - Today's date header with completion checkboxes per task
   - Add/Edit task modal with fields: title, time, days of week checkboxes, notes
   - Delete confirmation
   - Owner dashboard tab (visible only to admin) showing user count and task counts
