# verity

A comprehensive corporate budget tracking and management dashboard built for finance departments. [cite_start]This application enables Finance Heads to manage event budgets, detect spending anomalies, generate reports for executive review, and includes an anonymous HR feedback channel for workplace concerns[cite: 1, 2].

## 🚀 Features

### Core Functionality
* [cite_start]**Role-Based Access Control:** Distinct dashboards and permissions for Finance Heads, HR Admins, and Employees[cite: 3].
* [cite_start]**Budget Management:** Create, edit, and track budgets for various teams (Marketing, Engineering, HR, etc.) with visual progress indicators[cite: 5, 6].
* [cite_start]**Anomaly Detection:** Automated flagging of budgets that exceed their allocated amounts with approval/rejection workflows[cite: 7].
* [cite_start]**Real-time Dashboard:** Visualizations for spending trends, category distribution, and team comparisons using interactive charts[cite: 5].
* [cite_start]**PDF Reporting:** Generate downloadable reports for budget anomalies and executive reviews[cite: 8].

### HR Channel
* [cite_start]**Anonymous Reporting:** Secure, confidential submission form for workplace concerns (Harassment, Toxic Leadership, etc.)[cite: 9].
* [cite_start]**Tracking System:** Users receive a unique tracking code (e.g., `FB-2025-001`) to check the status of their report without revealing their identity[cite: 9, 10].
* [cite_start]**HR Dashboard:** Dedicated view for HR Admins to manage, investigate, and resolve employee reports[cite: 4, 10].

## 🛠️ Technology Stack

* [cite_start]**Framework:** [Next.js 16](https://nextjs.org/) (App Router)[cite: 21].
* [cite_start]**Language:** TypeScript[cite: 22].
* [cite_start]**Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables[cite: 21].
* [cite_start]**UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)[cite: 21].
* [cite_start]**Charts:** Recharts[cite: 27].
* [cite_start]**Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Realtime)[cite: 25].
* [cite_start]**State Management:** React Context API[cite: 21].
* [cite_start]**Icons:** Lucide React[cite: 22].

## 📋 Prerequisites

* Node.js 18+ installed.
* A Supabase account and project.

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/budget-tracker.git](https://github.com/yourusername/budget-tracker.git)
    cd budget-tracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Configuration**
    [cite_start]Create a `.env.local` file in the root directory and add your Supabase credentials[cite: 940]:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    [cite_start]Run the following SQL in your Supabase SQL Editor to create the necessary tables based on the data models[cite: 13, 14, 15, 17, 19, 20]:

    ```sql
    -- Users Table
    create table users (
      id uuid default uuid_generate_v4() primary key,
      email text unique not null,
      password text not null, -- Note: For demo purposes only. Use Supabase Auth in production.
      name text not null,
      role text not null check (role in ('finance_head', 'hr_admin', 'employee')),
      department text not null,
      avatar text
    );

    -- Budgets Table
    create table budgets (
      id uuid default uuid_generate_v4() primary key,
      "eventName" text not null,
      team text not null,
      "allocatedAmount" numeric not null,
      "spentAmount" numeric default 0,
      "startDate" date,
      "endDate" date,
      status text check (status in ('active', 'completed', 'exceeded')),
      category text,
      description text,
      "createdAt" timestamp with time zone default timezone('utc'::text, now())
    );

    -- Expenses Table
    create table expenses (
      id uuid default uuid_generate_v4() primary key,
      "budgetId" uuid references budgets(id),
      description text,
      amount numeric not null,
      date date,
      "submittedBy" text,
      category text
    );

    -- Anomalies Table
    create table anomalies (
      id uuid default uuid_generate_v4() primary key,
      "budgetId" uuid references budgets(id),
      "eventName" text,
      team text,
      "allocatedAmount" numeric,
      "exceededAmount" numeric,
      "percentageOver" numeric,
      "detectedAt" date,
      status text check (status in ('pending', 'reviewed', 'approved', 'rejected')),
      reason text
    );

    -- Feedback Reports Table
    create table "feedbackReports" (
      id uuid default uuid_generate_v4() primary key,
      category text not null,
      department text not null,
      severity text not null,
      subject text not null,
      description text not null,
      "incidentDate" date,
      "submittedAt" timestamp with time zone default timezone('utc'::text, now()),
      status text default 'new',
      "hrNotes" text,
      "assignedTo" text,
      "isAnonymous" boolean default true,
      "trackingCode" text unique not null,
      "involvedParties" text
    );

    -- Notifications Table
    create table notifications (
      id uuid default uuid_generate_v4() primary key,
      type text not null,
      title text not null,
      message text not null,
      timestamp timestamp with time zone default timezone('utc'::text, now()),
      read boolean default false,
      "budgetId" uuid
    );
    ```

5.  **Run the application**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🔐 Demo Credentials

[cite_start]The application comes with a login form configured for specific roles[cite: 380, 381]:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Finance Head** | `finance@company.com` | `finance123` | Full Access, Budget Controls, Anomaly Approval |
| **HR Admin** | `hr@company.com` | `hr123` | HR Dashboard, Feedback Management |
| **Employee** | `employee@company.com` | `emp123` | Read-only Dashboard, Submit Anonymous Reports |

## 📂 Project Structure

* `app/` - Next.js App Router pages and layouts.
    * [cite_start]`budgets/` - Budget list and creation[cite: 62].
    * [cite_start]`anomalies/` - Anomaly detection view[cite: 60].
    * [cite_start]`hr-channel/` - Anonymous reporting and HR dashboard[cite: 66].
    * [cite_start]`reports/` - Report generation tools[cite: 104].
* `components/` - Reusable UI components (shadcn/ui) and feature-specific widgets.
* `lib/` - Utilities, types, and context providers.
    * [cite_start]`budget-context.tsx` - Main global state and data fetching[cite: 873].
    * [cite_start]`supabase.ts` - Database client configuration[cite: 940].

## 🎨 Theme System

The application supports both Light and Dark modes, utilizing `oklch` color spaces for vibrant and accessible interfaces. [cite_start]Theme preference is persisted locally[cite: 11, 30].

## 📄 License

This project is for educational and demonstration purposes.
