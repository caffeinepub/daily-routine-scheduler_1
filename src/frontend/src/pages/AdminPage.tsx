import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LayoutDashboard, ListTodo, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useGetAllUsersSummary } from "../hooks/useQueries";

function truncatePrincipal(principal: string) {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}…${principal.slice(-6)}`;
}

export default function AdminPage() {
  const { data: users, isLoading } = useGetAllUsersSummary();

  const totalUsers = users?.length ?? 0;
  const totalTasks =
    users?.reduce((sum, u) => sum + Number(u.taskCount), 0) ?? 0;
  const avgTasks = totalUsers > 0 ? (totalTasks / totalUsers).toFixed(1) : "—";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Owner Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-1">
          Overview of all users and their schedules
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <StatCard
          icon={Users}
          label="Total Users"
          value={isLoading ? "—" : totalUsers.toString()}
          color="primary"
        />
        <StatCard
          icon={ListTodo}
          label="Total Tasks"
          value={isLoading ? "—" : totalTasks.toString()}
          color="accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Tasks / User"
          value={isLoading ? "—" : avgTasks}
          color="success"
        />
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-card rounded-xl border border-border shadow-task overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">Users</h2>
          {!isLoading && (
            <Badge variant="secondary" className="text-xs">
              {totalUsers} {totalUsers === 1 ? "user" : "users"}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : users && users.length > 0 ? (
          <Table data-ocid="admin.table">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">
                  Principal
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-5">
                  Tasks
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow
                  key={user.userPrincipal}
                  data-ocid={`admin.row.${i + 1}`}
                  className="border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="pl-5 py-3">
                    <span className="font-mono text-xs text-foreground/80 bg-muted/60 px-2 py-0.5 rounded">
                      {truncatePrincipal(user.userPrincipal)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-5 py-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        {Number(user.taskCount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Number(user.taskCount) === 1 ? "task" : "tasks"}
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No users yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Users will appear here once they log in
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "primary" | "accent" | "success";
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-green-100 text-green-700",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-task">
      <div
        className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
