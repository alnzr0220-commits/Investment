# Project: Investment Portfolio Manager (Arabic/RTL)

## Overview
A professional investment portfolio management website designed for Arabic users with RTL support.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Hono + Drizzle ORM (Youbase)
- **Database**: SQLite (D1) for Admin Config
- **Data Source**: Google Sheets (CSV Publish)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

## Features
1. **User System**:
   - Login: Full Name (4 parts) + Phone Number.
   - Auth: Verifies credentials against Google Sheet data via Backend.
   - Dashboard: Displays Name, Subscriber Number, Shares, Total Amount.
2. **Admin System**:
   - Secure Login (`/admin`).
   - **Subscribers List**: View all subscribers fetched from Google Sheets.
   - **Search**: Filter by Name, Phone, or ID.
   - **User View**: Admin can view any subscriber's dashboard (Read-only).
   - Configuration: Manage Google Sheet URL securely.
3. **Backend API**:
   - `POST /api/login`: Authenticates user against Sheet.
   - `POST /api/admin/config`: Saves Sheet URL.
   - `GET /api/admin/subscribers`: Fetches all subscribers.
   - `GET /api/user/me`: Returns logged-in user data.

## Setup
1. **Backend**:
   - `cd backend`
   - `npx edgespark deploy`
2. **Frontend**:
   - `npm install`
   - `npm run build`

## Google Sheets Setup
1. Create a Google Sheet with the following **EXACT** columns (Arabic):
   - `رقم المرور` (Password/Phone)
   - `اسم المشترك` (Subscriber Name)
   - `رقم المشترك` (Subscriber ID)
   - `عدد الاسهم` (Shares Count)
   - `إجمالي مدخراتك` (Total Savings)
   - `دفعة شهرية (ريال)` (Monthly Payment)
   - `قيمة سهم الاساس` (Base Share Value)
   - `قيمة سهم الحالي` (Current Share Value)
   - `القيمة الحقيقة لمحفظتك` (Real Portfolio Value)
   - `نسبة تملك في صندوق` (Ownership Percentage)
   - `نسبة النمو المحفظة` (Growth Percentage)

2. File -> Share -> Publish to web -> Select Sheet -> CSV.
3. Copy the CSV link.
4. Go to `/admin`, login, and paste the link.
