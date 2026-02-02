import { Outlet } from 'react-router-dom';

/**
 * AppLayout Component
 * 
 * Main application layout matching Figma design - no sidebar, header in pages.
 * Background beige for entire app.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-200">
      <Outlet />
    </div>
  );
}
