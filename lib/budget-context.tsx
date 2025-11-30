"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  loading: boolean;
  feedbackReports: FeedbackReport[];
  addBudget: (b: Budget) => Promise<void>;
  addExpense: (e: Expense) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  updateAnomalyStatus: (id: string, status: string) => Promise<void>;
  addFeedbackReport: (r: Omit<FeedbackReport, "id" | "submittedAt" | "status" | "trackingCode">) => Promise<string>; // ⭐ ADDED
  updateFeedbackStatus: (id: string, status: FeedbackReport["status"], hrNotes?: string) => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);

  // INITIAL LOAD
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const { data: b } = await supabase.from("budgets").select("*");
      const { data: e } = await supabase.from("expenses").select("*");
      const { data: a } = await supabase.from("anomalies").select("*");
      const { data: n } = await supabase.from("notifications").select("*");
      const { data: f } = await supabase.from("feedbackReports").select("*"); // ⭐ FIXED table name

      setBudgets(b || []);
      setExpenses(e || []);
      setAnomalies(a || []);
      setNotifications(n || []);
      setFeedbackReports(f || []);
    } catch (err) {
      console.error('Failed to load initial data', err);
    } finally {
      setLoading(false);
    }
  }

  // REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    const channel = supabase.channel("all-tables");

    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "budgets" }, payload => {
        syncTable(payload, setBudgets);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, payload => {
        syncTable(payload, setExpenses);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "anomalies" }, payload => {
        syncTable(payload, setAnomalies);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, payload => {
        syncTable(payload, setNotifications);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "feedbackReports" }, payload => { // ⭐ FIXED
        syncTable(payload, setFeedbackReports);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // REAL-TIME SYNC UTIL
  function syncTable(payload: any, setter: Function) {
    setter((prev: any[]) => {
      if (payload.eventType === "INSERT") {
        return [...prev, payload.new];
      }
      if (payload.eventType === "UPDATE") {
        return prev.map(i => (i.id === payload.new.id ? payload.new : i));
      }
      if (payload.eventType === "DELETE") {
        return prev.filter(i => i.id !== payload.old.id);
      }
      return prev;
    });
  }

  // ----------------------------
  //   ⭐ FEEDBACK: ADDED BACK
  // ----------------------------

  // Generate tracking code
  function generateTrackingCode() {
    const year = new Date().getFullYear();
    const num = String(feedbackReports.length + 1).padStart(3, "0");
    return `FB-${year}-${num}`;
  }

  // Add a feedback report (SQL version)
  async function addFeedbackReport(
    r: Omit<FeedbackReport, "id" | "submittedAt" | "status" | "trackingCode">
  ): Promise<string> {
    const trackingCode = generateTrackingCode();

    const insertData = {
      ...r,
      submittedAt: new Date().toISOString(),
      status: "new",
      trackingCode,
    };

    const { error } = await supabase.from("feedbackReports").insert(insertData);

    if (error) {
      console.error("Failed to insert feedback:", JSON.stringify(error, null, 2));
    }

    // Notification for HR
    await supabase.from("notifications").insert({
      type: "info",
      title: "New Anonymous Report",
      message: `A new ${r.category.replace("-", " ")} report has been submitted.`,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return trackingCode;
  }

  // Update feedback status
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

  // 🚀 Instant local update (no waiting for realtime)
  setFeedbackReports(prev =>
    prev.map(r => (r.id === id ? { ...r, ...data } : r))
  );
}


  // ----- Helper / Query functions -----

  function getNewFeedbackCount() {
    return feedbackReports.filter(f => f.status === "new").length;
  }

  function getFeedbackByStatus(status: FeedbackReport["status"]) {
    return feedbackReports.filter(f => f.status === status);
  }

  // -------------------------------------

  // CRUD FUNCTIONS (UNCHANGED)
  async function addBudget(b: Budget) {
    await supabase.from("budgets").insert(b);
  }

  async function addExpense(e: Expense) {
    await supabase.from("expenses").insert(e);
  }

  async function updateBudget(id: string, updates: Partial<Budget>) {
    await supabase.from("budgets").update(updates).eq("id", id);
  }

  async function updateAnomalyStatus(id: string, status: string) {
    await supabase.from("anomalies").update({ status }).eq("id", id);
  }

  async function markNotificationRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  async function markAllNotificationsRead() {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
  }

  function getUnreadNotificationsCount() {
    return notifications.filter(n => !n.read).length;
  }

  function getAnomaliesCount() {
    return anomalies.filter(a => a.status === "pending").length;
  }

  function getBudgetExpenses(budgetId: string) {
    return expenses.filter(e => e.budgetId === budgetId || e.budgetId === budgetId);
  }

  function getTotalAllocated() {
    return budgets.reduce((s, b) => s + Number(b.allocatedAmount ?? b.allocatedAmount ?? 0), 0);
  }

  function getTotalSpent() {
    return budgets.reduce((s, b) => s + Number(b.spentAmount ?? b.spentAmount ?? 0), 0);
  }

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        expenses,
        anomalies,
        notifications,
        loading,
        feedbackReports,
        addBudget,
        addExpense,
        updateBudget,
        updateAnomalyStatus,
        addFeedbackReport, // ⭐ RESTORED
        updateFeedbackStatus, // ⭐ RESTORED
        markNotificationRead,
        markAllNotificationsRead,
        getUnreadNotificationsCount,
        getAnomaliesCount,
        getNewFeedbackCount, // ⭐ RESTORED
        getBudgetExpenses,
        getTotalAllocated,
        getTotalSpent,
        getFeedbackByStatus, // ⭐ RESTORED
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
