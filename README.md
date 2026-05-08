# Project Name

A full-stack monorepo application consisting of:

- `api/` — Backend API built with NestJS
- `web/` — Frontend application built with Next.js

---

# Tech Stack

- NestJS
- Next.js
- Supabase
- Google Spreadsheet Integration
- Vercel Hosting

---

# Project Structure

```bash
root/
├── api/    # NestJS backend
└── web/    # Next.js frontend
```

---

# Requirements

## API

- Node.js `v20`

---

# Getting Started

## Clone the Repository

```bash
git clone <https://github.com/2026-ADET-Capstone/JDW-Capstone.git>
cd <JDW-CAPSTONE>
```

---

# API Setup (`/api`)

## Install Dependencies

```bash
cd api
npm install
```

## Run Development Server

```bash
npm run start:dev
```

The API server will start in development mode with hot reload enabled.

---

# Web Setup (`/web`)

## Install Dependencies

```bash
cd web
npm install
```

## Run Development Server

```bash
npm run dev
```

The frontend application will start in development mode.

---

# Environment Variables

Both projects may require environment variables.

Create `.env` files inside:

```bash
/api/.env
/web/.env
```

Example variables - Backend:

```env
PORT=3000  # The port number on which the server will listen (e.g., 3000)

# Google Sheets Integration
GOOGLE_SERVICE_PRIVATE_KEY=your-private-key-here  # Private key for Google Service Account authentication, required for spreadsheet access
GOOGLE_SERVICE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com  # Email address of the Google Service Account used to access the spreadsheet
GOOGLE_SPREADSHEET_URL_ID=your-spreadsheet-id-here  # The unique ID of the Google Spreadsheet (found in the URL: https://docs.google.com/spreadsheets/d/{id}/edit)

# Supabase Database Configuration
SUPABASE_URL=https://your-project.supabase.co  # The URL of your Supabase project, required for database connection
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # Service role key for Supabase, used for server-side operations with elevated permissions
```
Example variables - Frontend:
```env
NEXT_PUBLIC_API_URL=Backend Port (Local or Hosted)
```
---

# Deployment

## Frontend

The Next.js frontend is deployed using Vercel.

## Backend

The NestJS API can be deployed separately depending on your hosting setup.

---

# Development Notes

- API uses Node.js v20
- Monorepo structure with separated frontend and backend applications
- Hot reload enabled for both projects during development

---

# Available Scripts

## API

```bash
npm run start:dev
```

## Web

```bash
npm run dev
```
