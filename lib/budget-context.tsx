"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import type {
  Budget,
  Expense,
  Anomaly,
  Notification,
  FeedbackReport,
} from "./types";

interface BudgetContextType {
  budgets: Budget[];
  expenses: Expense[];
  anomalies: Anomaly[];
  notifications: Notification[];
  feedbackReports: FeedbackReport[];
  loading: boolean;

  addBudget: (
    b: Omit<
      Budget,
      "id" | "spentAmount" | "status" | "createdAt"
    >
  ) => Promise<void>;

  addExpense: (e: Expense) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;

  updateAnomalyStatus: (id: string, status: string) => Promise<void>;

  addFeedbackReport: (
    r: Omit<
      FeedbackReport,
      "id" | "submittedAt" | "status" | "trackingCode"
    >
  ) => Promise<string>;

  updateFeedbackStatus: (
    id: string,
    status: FeedbackReport["status"],
    hrNotes?: string
  ) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  getUnreadNotificationsCount: () => number;
  getAnomaliesCount: () => number;
  getNewFeedbackCount: () => number;

  getBudgetExpenses: (budgetId: string) => Expense[];
  getTotalAllocated: () => number;
  getTotalSpent: () => number;
  getFeedbackByStatus: (status: FeedbackReport["status"]) => FeedbackReport[];
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbackReports, setFeedbackReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // INITIAL DATA LOAD
  // ---------------------------
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);

      const [b, e, a, n, f] = await Promise.all([
        supabase.from("budgets").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("anomalies").select("*"),
        supabase.from("notifications").select("*"),
        supabase.from("feedbackReports").select("*"),
      ]);

      setBudgets(b.data || []);
      setExpenses(e.data || []);
      setAnomalies(a.data || []);
      setNotifications(n.data || []);
      setFeedbackReports(f.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // REAL-TIME DB SYNC
  // ---------------------------
  useEffect(() => {
    const channel = supabase.channel("realtime-updates");

    const tables = [
      "budgets",
      "expenses",
      "anomalies",
      "notifications",
      "feedbackReports",
    ];

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          handleRealtimeUpdate(table, payload);
        }
      );
    });

    channel.subscribe(); // don't return the promise!
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleRealtimeUpdate(table: string, payload: any) {
    const sets: Record<string, Function> = {
      budgets: setBudgets,
      expenses: setExpenses,
      anomalies: setAnomalies,
      notifications: setNotifications,
      feedbackReports: setFeedbackReports,
    };

    const setter = sets[table];

    setter((prev: any[]) => {
      if (payload.eventType === "INSERT") return [...prev, payload.new];
      if (payload.eventType === "UPDATE")
        return prev.map((x) => (x.id === payload.new.id ? payload.new : x));
      if (payload.eventType === "DELETE")
        return prev.filter((x) => x.id !== payload.old.id);
      return prev;
    });
  }

  // ---------------------------
  // BUDGETS
  // ---------------------------

  async function addBudget(
    input: Omit<Budget, "id" | "spentAmount" | "status" | "createdAt">
  ) {
    const newBudget = {
      ...input,
      id: crypto.randomUUID(),
      spentAmount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from("budgets").insert(newBudget);

    if (error) console.error("Failed to add budget:", error);
  }

  async function updateBudget(id: string, updates: Partial<Budget>) {
    await supabase.from("budgets").update(updates).eq("id", id);
  }

  // ---------------------------
  // EXPENSES
  // ---------------------------
  async function addExpense(e: Expense) {
    await supabase.from("expenses").insert(e);
  }

  // ---------------------------
  // ANOMALIES
  // ---------------------------
  async function updateAnomalyStatus(id: string, status: string) {
    await supabase.from("anomalies").update({ status }).eq("id", id);
  }

  // ---------------------------
  // FEEDBACK - CREATE
  // ---------------------------
  function generateTrackingCode() {
    const year = new Date().getFullYear();
    const num = String(feedbackReports.length + 1).padStart(3, "0");
    return `FB-${year}-${num}`;
  }

  async function addFeedbackReport(
    r: Omit<
      FeedbackReport,
      "id" | "submittedAt" | "status" | "trackingCode"
    >
  ): Promise<string> {
    const tracking = generateTrackingCode();

    const dataInsert = {
      ...r,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      status: "new",
      trackingCode: tracking,
    };

    const { error } = await supabase
      .from("feedbackReports")
      .insert(dataInsert);

    if (error) console.error("Insert error:", error);

    return tracking;
  }

  // ---------------------------
  // FEEDBACK - UPDATE STATUS
  // ---------------------------
  async function updateFeedbackStatus(
    id: string,
    status: FeedbackReport["status"],
    hrNotes?: string
  ) {
    const updates: any = { status };
    if (hrNotes !== undefined) updates.hrNotes = hrNotes;

    const { data, error } = await supabase
      .from("feedbackReports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update feedback:", error);
      return;
    }

    // Instant local patch
    setFeedbackReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  }

  // ---------------------------
  // NOTIFICATIONS
  // ---------------------------
  async function markNotificationRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  async function markAllNotificationsRead() {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
  }

  // ---------------------------
  // HELPERS
  // ---------------------------
  function getUnreadNotificationsCount() {
    return notifications.filter((n) => !n.read).length;
  }

  function getAnomaliesCount() {
    return anomalies.filter((a) => a.status === "pending").length;
  }

  function getNewFeedbackCount() {
    return feedbackReports.filter((x) => x.status === "new").length;
  }

  function getBudgetExpenses(budgetId: string) {
    return expenses.filter((e) => e.budgetId === budgetId);
  }

  function getTotalAllocated() {
    return budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
  }

  function getTotalSpent() {
    return budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  }

  function getFeedbackByStatus(status: FeedbackReport["status"]) {
    return feedbackReports.filter((f) => f.status === status);
  }

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        expenses,
        anomalies,
        notifications,
        feedbackReports,
        loading,

        addBudget,
        addExpense,
        updateBudget,
        updateAnomalyStatus,

        addFeedbackReport,
        updateFeedbackStatus,

        markNotificationRead,
        markAllNotificationsRead,

        getUnreadNotificationsCount,
        getAnomaliesCount,
        getNewFeedbackCount,
        getBudgetExpenses,
        getTotalAllocated,
        getTotalSpent,
        getFeedbackByStatus,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be inside BudgetProvider");
  return ctx;
}
