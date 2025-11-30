# Expense Management System Implementation

## Overview

This implementation adds a complete expense entry system with automatic budget tracking and anomaly detection.

## Features Implemented

### 1. Frontend Components

#### ExpenseForm Component (`components/expense-form.tsx`)

- Modal-based form for adding expenses
- Budget selection dropdown (only active budgets)
- Fields: description, amount, date, category
- Validation for required fields and amounts
- Can be used standalone or tied to a specific budget
- Loading states and error handling

### 2. Backend Logic

#### Updated BudgetContext (`lib/budget-context.tsx`)

- Enhanced `addExpense()` function to:
  - Insert expense into database
  - Calculate new `spentAmount` for the budget
  - Automatically update budget status (active/exceeded)
  - Trigger realtime updates across all clients

#### Database Triggers (`supabase/migrations/001_expense_triggers.sql`)

Two PostgreSQL triggers for automation:

**Trigger 1: `update_budget_spent_amount()`**

- Automatically recalculates `budgets.spentAmount` when expenses change
- Updates budget status based on allocated vs spent amounts
- Handles INSERT, UPDATE, and DELETE operations
- Performance optimized with index on `expenses.budgetId`

**Trigger 2: `check_budget_anomaly()`**

- Detects when a budget exceeds its allocated amount
- Creates anomaly records automatically
- Generates notifications for finance heads
- Calculates exceeded amount and percentage

### 3. UI Integration

#### Budget Details Page (`app/budgets/[id]/page.tsx`)

- Shows all expenses for the budget
- "Add Expense" button in expenses section
- Displays: description, amount, date, category

#### Main Budgets Page (`app/budgets/page.tsx`)

- Global "Add Expense" button for quick entry
- Dropdown to select any active budget

## Setup Instructions

### Database Migration

Run the SQL migration in your Supabase dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_expense_triggers.sql`
3. Execute the SQL script
4. Verify triggers are created:

```sql
-- Check triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%budget%';

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_name LIKE '%budget%';
```

### Testing the System

1. **Add an expense:**

   - Navigate to Budgets page
   - Click "Add Expense"
   - Select a budget, enter details
   - Submit

2. **Verify automatic updates:**

   - Budget's `spentAmount` should update immediately
   - If spent > allocated, status changes to "exceeded"
   - Anomaly record created automatically
   - Notification appears in header

3. **Test realtime sync:**
   - Open app in two browser windows
   - Add expense in one window
   - See updates appear in second window instantly

## Database Schema Requirements

Ensure these tables exist with proper structure:

### expenses table

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budgetId UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  submittedBy UUID NOT NULL,
  category TEXT,
  receipt TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### budgets table

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eventName TEXT NOT NULL,
  team TEXT NOT NULL,
  allocatedAmount DECIMAL(10,2) NOT NULL,
  spentAmount DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'completed', 'exceeded')),
  -- ... other fields
);
```

### anomalies table (for automatic detection)

```sql
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budgetId UUID UNIQUE REFERENCES budgets(id) ON DELETE CASCADE,
  eventName TEXT,
  team TEXT,
  allocatedAmount DECIMAL(10,2),
  exceededAmount DECIMAL(10,2),
  percentageOver DECIMAL(5,2),
  detectedAt TIMESTAMP,
  status TEXT DEFAULT 'pending'
);
```

## Architecture Notes

### Client-Side Flow

1. User fills ExpenseForm
2. Form validates input
3. Calls `addExpense()` from BudgetContext
4. Context inserts expense to Supabase
5. Context calculates new spentAmount
6. Context updates budget record
7. Realtime subscription propagates changes

### Server-Side Flow (with triggers)

1. Expense INSERT fires trigger
2. Trigger recalculates SUM(amount) for budget
3. Trigger updates budget.spentAmount automatically
4. If exceeded, second trigger fires
5. Anomaly and notification created

### Why Both Client + Trigger?

- **Client logic**: Immediate feedback, works without triggers
- **Triggers**: Data integrity, handles direct DB inserts, prevents desync
- **Together**: Redundant safety, handles edge cases

## Performance Considerations

- Index on `expenses.budgetId` speeds up aggregation queries
- Triggers use efficient aggregate queries
- Realtime subscription filters by table for minimal overhead
- Optimistic updates in UI for instant feedback

## Future Enhancements

1. **Bulk expense import** (CSV upload)
2. **Expense approval workflow** (pending → approved)
3. **Receipt attachment** (file upload to Supabase Storage)
4. **Expense categories** (predefined dropdown)
5. **Expense editing/deletion** (with audit trail)
6. **Budget forecasting** (predictive analytics)
7. **Export expenses** (PDF/Excel reports)

## Troubleshooting

### Expenses not updating budget

- Check trigger is installed: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_budget_spent';`
- Verify function exists: `SELECT * FROM pg_proc WHERE proname = 'update_budget_spent_amount';`
- Check for errors: `SELECT * FROM pg_stat_statements WHERE query LIKE '%expense%';`

### Realtime not working

- Verify Supabase channel subscription is active
- Check browser console for WebSocket errors
- Ensure RLS policies allow SELECT on tables

### Form validation failing

- Check budget is "active" status
- Verify amount is positive number
- Ensure user is authenticated

## Security Notes

- Implement Row Level Security (RLS) policies in Supabase
- Validate `submittedBy` matches authenticated user
- Restrict expense deletion to authorized roles
- Audit trail for all expense modifications

## Migration Rollback

To remove the triggers if needed:

```sql
DROP TRIGGER IF EXISTS trigger_update_budget_spent ON expenses;
DROP TRIGGER IF EXISTS trigger_check_budget_anomaly ON budgets;
DROP FUNCTION IF EXISTS update_budget_spent_amount();
DROP FUNCTION IF EXISTS check_budget_anomaly();
```
