import { Button } from "@/components/ui/button";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: CalendarDays,
    title: "Plan your week",
    desc: "Set recurring tasks for any days of the week",
  },
  {
    icon: CheckCircle2,
    title: "Track completions",
    desc: "Check off tasks each day and build healthy habits",
  },
  {
    icon: Clock,
    title: "Time-based schedule",
    desc: "Organize your day hour by hour, from morning to night",
  },
  {
    icon: Bell,
    title: "Stay consistent",
    desc: "Your routine lives in the cloud, always with you",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{
        backgroundImage:
          "url(/assets/generated/routine-hero-bg.dim_1920x1080.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/70 backdrop-blur-[2px]" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-lg mx-auto"
        >
          {/* Logo mark */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-panel">
              <CalendarDays className="w-7 h-7 text-primary" />
            </div>
          </div>

          <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground mb-3">
            Daily <span className="text-gradient">Routine</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto mb-8">
            Your personal schedule, every day. Build habits that stick.
          </p>

          {/* Login Button */}
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="rounded-xl px-8 py-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-float transition-all duration-200 gap-2.5"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Get Started — Sign In
              </>
            )}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground/60">
            Powered by Internet Identity · No password needed
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full mx-auto"
        >
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              className="flex gap-3 p-4 rounded-xl bg-card/80 border border-border/60 shadow-task backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-5 text-center">
        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary/60">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
