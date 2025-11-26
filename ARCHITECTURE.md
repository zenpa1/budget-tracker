Budget Tracker Dashboard - Full Specification

## Overview

A comprehensive corporate budget tracking and management dashboard built for finance departments. The application enables Finance Heads to manage event budgets, detect spending anomalies, generate reports for executive review, and includes an anonymous HR feedback channel for workplace concerns.

---

## User Roles & Permissions

### 1. Finance Head

- **Full dashboard access**: View all statistics, charts, and budget overviews
- **Budget management**: Create, edit, and delete budgets for events (company parties, conferences, team activities, etc.)
- **Anomaly control**: Review, approve, or reject budget anomalies when spending exceeds allocated amounts
- **Report generation**: Generate and download PDF reports of anomalies to present to executives/council
- **HR Channel**: Can submit anonymous reports and check status only (no access to HR Dashboard)
- **Notifications**: View budget-related notifications and anomaly alerts


### 2. HR Admin

- **Limited dashboard access**: View general statistics and charts
- **HR Dashboard access**: Full access to view, investigate, and manage all anonymous employee reports
- **Report management**: Update investigation status, add internal notes, mark reports as resolved
- **No anomaly control**: Cannot approve/reject budget anomalies (read-only view)
- **No report generation**: Cannot access the Reports tab for PDF generation


### 3. Employee

- **Limited dashboard access**: View general statistics and charts only
- **HR Channel**: Can submit anonymous reports and check report status using tracking codes
- **No anomaly control**: Cannot see approve/reject buttons on anomalies (read-only view)
- **No report generation**: Cannot access the Reports tab
- **No HR Dashboard**: Cannot see HR administration features


---

## Core Features

### 1. Dashboard Overview (All Users)

- **Statistics Cards**: Display key metrics

- Total Allocated Budget (sum of all budget allocations)
- Total Spent (sum of all current spending)
- Active Budgets (count of ongoing budgets)
- Pending Anomalies (count of unresolved budget overruns) - *Finance Head only*



- **Spending Trend Chart**: Line/area chart showing monthly spending over time
- **Spending by Category**: Pie chart breaking down spending by category (Events, Marketing, Operations, HR, Technology, Travel) with distinct colors (indigo, green, amber, rose, cyan, purple)
- **Team Budget Comparison**: Bar chart comparing allocated vs. spent amounts per team


### 2. Budget Management (All Users View, Finance Head Controls)

- **Budget List Table**: Displays all budgets with columns:

- Budget name and team assignment
- Category (Events, Marketing, Operations, HR, Technology, Travel)
- Allocated amount vs. spent amount
- Progress bar (visual indicator, turns red when exceeded)
- Start and end dates
- Status badge (Active, Completed, Exceeded)



- **Create Budget Dialog** (Finance Head only): Form to add new budgets with:

- Budget name
- Team selection dropdown
- Category selection
- Allocated amount (currency input)
- Start date and end date pickers



- **Edit/Delete Actions** (Finance Head only): Modify or remove existing budgets


### 3. Anomaly Detection & Management

- **Automatic Detection**: System flags budgets when spent amount exceeds allocated amount
- **Anomaly List**: Shows all detected anomalies with:

- Budget name and team
- Exceeded amount (how much over budget)
- Percentage over budget
- Detection date
- Severity level (Low: `<10%, Medium: 10-25%, High: >`25%)
- Status (Pending, Reviewed, Approved, Rejected)



- **Anomaly Actions** (Finance Head only):

- Mark as Reviewed
- Approve (accept the overspend)
- Reject (flag for correction)
- Generate individual anomaly report



- **Non-Finance Users**: See read-only view with message "Only Finance Heads can manage anomalies"


### 4. Notifications System

- **Real-time Alerts**: Notifications when:

- Budget exceeds allocation (anomaly detected)
- Budget reaches warning threshold (e.g., 80%)
- Anomaly status changes



- **Notification Center**:

- List of all notifications with timestamps
- Mark as read/unread functionality
- Filter by type (anomaly, warning, info)



- **Badge Indicators**: Unread count shown in sidebar navigation


### 5. Reports & PDF Export (Finance Head Only)

- **Report Generator**: Interface to create executive-ready reports
- **Report Configuration**:

- Date range selection
- Filter by team or category
- Include/exclude specific anomalies
- Add custom notes or recommendations



- **Report Preview**: Visual preview showing:

- Executive summary
- Anomaly status distribution pie chart (Pending: yellow, Reviewed: blue, Approved: green, Rejected: red)
- Detailed anomaly breakdown table
- Spending trends visualization



- **PDF Download**: Generate downloadable PDF for presentation to council/executives


### 6. Anonymous HR Feedback Channel

#### Submit Report (All Users)

- **Anonymous Form**: No identifying information collected
- **Report Categories**:

- Unfair Promotion Practices
- Toxic Leadership Behavior
- Workplace Harassment
- Discrimination
- Retaliation Concerns
- Other



- **Form Fields**:

- Category selection (required)
- Department involved (optional, dropdown)
- Severity level (Low, Medium, High, Critical)
- Detailed description (required, text area)
- Date of incident (optional)



- **Submission Confirmation**:

- Generates unique tracking code (e.g., "HR-XXXXXX")
- User must save code to check status later



- **Trust Indicators**: Visual badges showing anonymity protection, HR-only access, no retaliation policy


#### Check Status (All Users)

- **Status Checker**: Enter tracking code to view report status
- **Status Information Displayed**:

- Current status (Received, Under Review, Investigation Active, Resolved)
- Date submitted
- Last updated date
- HR response/notes (if any public response provided)





#### HR Dashboard (HR Admin Only)

- **Report Queue**: List of all submitted reports with:

- Tracking code
- Category and severity
- Department mentioned
- Submission date
- Current status



- **Filters**: Filter by status (New, Active, Resolved), severity, category
- **Report Details View**:

- Full report content
- Internal notes section (not visible to reporter)
- Status update controls
- Investigation timeline



- **Actions**:

- Update status (Received → Under Review → Investigation Active → Resolved)
- Add internal notes
- Mark as resolved with resolution summary



- **Notification Badge**: Yellow badge in sidebar showing count of new/unread reports (HR Admin only)


### 7. Settings Page

- **Profile Settings**: View/edit user profile information
- **Notification Preferences**: Toggle email/in-app notifications
- **Display Settings**: Additional display customizations


---

## UI/UX Features

### Theme System

- **Dark Mode**: Default theme with dark backgrounds, high contrast text
- **Light Mode**: Alternative theme with light backgrounds
- **Theme Toggle**: Sun/moon icon button in header
- **Persistence**: Theme preference saved to localStorage, persists across sessions


### Authentication

- **Login Page**:

- Email and password fields
- Role-based demo accounts for testing
- No "Forgot Password" option



- **Session Management**: User state persisted in localStorage
- **Auth Guard**: Protected routes redirect to login if unauthenticated
- **User Menu**: Avatar dropdown in header showing:

- User name and role
- Profile link
- Logout button





### Navigation

- **Collapsible Sidebar**:

- Dashboard (home)
- Budgets
- Anomalies
- Reports (Finance Head only)
- Notifications (with unread badge)
- HR Channel (with new reports badge for HR Admin only)
- Settings



- **Responsive Design**: Works on desktop and mobile devices
- **Active State**: Current page highlighted in navigation


---

## Technical Specifications

### Data Models

```plaintext
Budget {
  id: string
  name: string
  team: string
  category: "Events" | "Marketing" | "Operations" | "HR" | "Technology" | "Travel"
  allocated: number
  spent: number
  startDate: Date
  endDate: Date
  status: "Active" | "Completed" | "Exceeded"
}

Anomaly {
  id: string
  budgetId: string
  budgetName: string
  team: string
  exceededAmount: number
  percentageOver: number
  detectedDate: Date
  severity: "Low" | "Medium" | "High"
  status: "Pending" | "Reviewed" | "Approved" | "Rejected"
}

HRReport {
  id: string
  trackingCode: string
  category: string
  department: string
  severity: "Low" | "Medium" | "High" | "Critical"
  description: string
  incidentDate?: Date
  submittedDate: Date
  status: "Received" | "Under Review" | "Investigation Active" | "Resolved"
  internalNotes: string[]
  lastUpdated: Date
}

User {
  id: string
  name: string
  email: string
  role: "Finance Head" | "HR Admin" | "Employee"
  avatar: string
}

Notification {
  id: string
  type: "anomaly" | "warning" | "info"
  title: string
  message: string
  date: Date
  read: boolean
}
```

### Charts & Visualization

- **Spending Trend**: Area/Line chart (Recharts)
- **Category Distribution**: Pie chart with legend - colors: Indigo (`#6366f1`), Green (`#22c55e`), Amber (`#f59e0b`), Rose (`#f43f5e`), Cyan (`#06b6d4`), Purple (`#a855f7`)
- **Team Comparison**: Horizontal bar chart
- **Anomaly Status Distribution**: Pie chart - colors: Pending (Yellow `#eab308`), Reviewed (Blue `#3b82f6`), Approved (Green `#22c55e`), Rejected (Red `#ef4444`)


### Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Charts**: Recharts library
- **State Management**: React Context API
- **Storage**: localStorage for theme and auth persistence
- **PDF Generation**: Client-side PDF generation library


---

## Color Scheme

- **Primary**: Emerald (`#10b981`) - main actions, positive indicators
- **Background (Dark)**: Slate 950 (`#020617`)
- **Background (Light)**: White (`#ffffff`)
- **Cards (Dark)**: Slate 900 (`#0f172a`)
- **Cards (Light)**: White with subtle border
- **Text Primary**: Foreground token (dark: white, light: slate 900)
- **Text Muted**: Muted foreground token
- **Destructive**: Red (`#ef4444`) - errors, exceeded budgets, rejected
- **Warning**: Amber (`#f59e0b`) - warnings, pending items
- **Success**: Green (`#22c55e`) - approved, within budget


---

This specification provides everything needed to rebuild the Budget Tracker Dashboard with all its role-based access controls, features, and visual design.