# Subscriber Dashboard Project

This project is a React-based Subscriber Dashboard application designed to manage and view subscriber portfolios, income, and savings. It includes an Admin interface for managing subscribers.

## Project Overview

- **Type**: React + TypeScript Web Application
- **Key Features**:
  - **User Dashboard**: View subscriber details, portfolio value, income, and savings.
  - **Admin Dashboard**: Manage subscribers and view their dashboards.
  - **Authentication**: Login system for users and admins.
  - **Data Visualization**: Charts and metrics for portfolio performance.
  - **Excel Integration**: (Mocked) capability to upload Excel files.

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Hooks (useState, useEffect)
- **Backend Integration**: Configured to connect to a Youbase backend (currently staging).

## Configuration

- **API URL**: The backend URL is configured in `src/api.ts`.
- **Mock Data**: Some data is mocked in `src/data/mockData.ts` for development/fallback.

## Development

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run preview`: Preview the production build.

## Notes

- The project was restored from a source code archive.
- Ensure the backend API is accessible for full functionality.
