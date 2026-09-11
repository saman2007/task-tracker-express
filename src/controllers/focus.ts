import { Request, Response } from "express";
import { Op } from "sequelize";
import { FocusSession, Task, User } from "../models";

interface DayData {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  minutes: number;
}

interface TaskShare {
  taskId: number | null;
  taskTitle: string;
  minutes: number;
  percentage: number;
  color: string;
}

const PALETTE_COLORS = [
  "var(--chart-0)", // brand yellow
  "var(--chart-1)", // emerald green (priority-low)
  "var(--chart-2)", // info blue
  "var(--chart-3)", // accent coral
  "var(--chart-4)", // amber (priority-medium)
  "var(--chart-5)", // crimson (priority-high)
];
export async function focusGetController(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  if (!user) {
    res.redirect("/signin");
    return;
  }

  // 1. Fetch user tasks for selection
  const tasks = await Task.findAll({
    where: { userId: user.id },
    order: [["createdAt", "DESC"]],
  });

  // 2. Fetch recent sessions
  const sessions = await FocusSession.findAll({
    where: { userId: user.id },
    order: [["completedAt", "DESC"]],
    limit: 60,
  });

  // 3. Compute 7-day daily distribution
  const now = new Date();
  const dailyDistribution: DayData[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = dayNames[d.getDay()];

    const dayMinutes = sessions
      .filter((s) => {
        if (!s.completedAt) return false;
        const sDate = new Date(s.completedAt).toISOString().split("T")[0];
        return sDate === dateStr && s.mode === "focus";
      })
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    dailyDistribution.push({
      date: dateStr,
      dayLabel,
      minutes: dayMinutes,
    });
  }

  // 4. Compute task distribution
  const totalFocusMinutes = sessions
    .filter((s) => s.mode === "focus")
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const taskMinutesMap = new Map<string, { taskId: number | null; title: string; minutes: number }>();

  for (const s of sessions) {
    if (s.mode !== "focus") continue;
    const title = s.taskTitle || "General Focus";
    const key = s.taskId ? `task_${s.taskId}` : `title_${title}`;

    if (!taskMinutesMap.has(key)) {
      taskMinutesMap.set(key, {
        taskId: s.taskId || null,
        title,
        minutes: 0,
      });
    }
    const item = taskMinutesMap.get(key)!;
    item.minutes += s.durationMinutes || 0;
  }

  const taskDistribution: TaskShare[] = [];
  let colorIdx = 0;

  for (const item of taskMinutesMap.values()) {
    const pct = totalFocusMinutes > 0 ? Math.round((item.minutes / totalFocusMinutes) * 100) : 0;
    taskDistribution.push({
      taskId: item.taskId,
      taskTitle: item.title,
      minutes: item.minutes,
      percentage: pct,
      color: PALETTE_COLORS[colorIdx % PALETTE_COLORS.length],
    });
    colorIdx++;
  }

  taskDistribution.sort((a, b) => b.minutes - a.minutes);

  // 5. Compute summary stats
  const todayStr = now.toISOString().split("T")[0];
  const todayMinutes = sessions
    .filter((s) => {
      if (!s.completedAt) return false;
      const sDate = new Date(s.completedAt).toISOString().split("T")[0];
      return sDate === todayStr && s.mode === "focus";
    })
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const completedFocusCount = sessions.filter((s) => s.mode === "focus").length;

  res.render("focus", {
    pageTitle: "Focus Timer & Sessions",
    currentPath: "/focus",
    tasks,
    sessions,
    stats: {
      totalMinutes: totalFocusMinutes,
      totalHours: (totalFocusMinutes / 60).toFixed(1),
      todayMinutes,
      todayHours: (todayMinutes / 60).toFixed(1),
      completedCount: completedFocusCount,
    },
    dailyDistribution,
    taskDistribution,
  });
}

export async function focusSessionCreatePostController(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { durationMinutes, taskId, taskTitle, mode, notes } = req.body;

    let resolvedTitle = taskTitle;
    let resolvedTaskId = taskId ? Number(taskId) : null;

    if (resolvedTaskId && !resolvedTitle) {
      const t = await Task.findOne({ where: { id: resolvedTaskId, userId: user.id } });
      if (t) resolvedTitle = t.title;
    }

    const session = await FocusSession.create({
      userId: user.id,
      taskId: resolvedTaskId,
      taskTitle: resolvedTitle || (mode === "focus" ? "General Focus" : mode === "shortBreak" ? "Short Break" : "Long Break"),
      durationMinutes: Math.max(1, Number(durationMinutes) || 25),
      mode: mode || "focus",
      completedAt: new Date(),
      notes: notes || null,
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error("Failed to log focus session:", err);
    res.status(500).json({ error: "Failed to record session" });
  }
}

export async function focusSessionDeletePostController(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const id = Number(req.params.id);
    await FocusSession.destroy({
      where: {
        id,
        userId: user.id,
      },
    });

    if (req.headers.accept?.includes("application/json")) {
      res.json({ success: true });
    } else {
      res.redirect("/focus");
    }
  } catch (err) {
    console.error("Failed to delete focus session:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
}

export async function focusStatsGetController(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const sessions = await FocusSession.findAll({
      where: { userId: user.id },
      order: [["completedAt", "DESC"]],
      limit: 60,
    });

    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daily: DayData[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = dayNames[d.getDay()];

      const dayMinutes = sessions
        .filter((s) => {
          if (!s.completedAt) return false;
          const sDate = new Date(s.completedAt).toISOString().split("T")[0];
          return sDate === dateStr && s.mode === "focus";
        })
        .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

      daily.push({ date: dateStr, dayLabel, minutes: dayMinutes });
    }

    const totalFocusMinutes = sessions
      .filter((s) => s.mode === "focus")
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const taskMinutesMap = new Map<string, { taskId: number | null; title: string; minutes: number }>();

    for (const s of sessions) {
      if (s.mode !== "focus") continue;
      const title = s.taskTitle || "General Focus";
      const key = s.taskId ? `task_${s.taskId}` : `title_${title}`;

      if (!taskMinutesMap.has(key)) {
        taskMinutesMap.set(key, { taskId: s.taskId || null, title, minutes: 0 });
      }
      taskMinutesMap.get(key)!.minutes += s.durationMinutes || 0;
    }

    const tasks: TaskShare[] = [];
    let cIdx = 0;
    for (const item of taskMinutesMap.values()) {
      const pct = totalFocusMinutes > 0 ? Math.round((item.minutes / totalFocusMinutes) * 100) : 0;
      tasks.push({
        taskId: item.taskId,
        taskTitle: item.title,
        minutes: item.minutes,
        percentage: pct,
        color: PALETTE_COLORS[cIdx % PALETTE_COLORS.length],
      });
      cIdx++;
    }

    tasks.sort((a, b) => b.minutes - a.minutes);

    const todayStr = now.toISOString().split("T")[0];
    const todayMinutes = sessions
      .filter((s) => {
        if (!s.completedAt) return false;
        const sDate = new Date(s.completedAt).toISOString().split("T")[0];
        return sDate === todayStr && s.mode === "focus";
      })
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    res.json({
      daily,
      tasks,
      totalMinutes: totalFocusMinutes,
      todayMinutes,
      sessionsCount: sessions.length,
    });
  } catch (err) {
    console.error("Failed to fetch focus stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}
