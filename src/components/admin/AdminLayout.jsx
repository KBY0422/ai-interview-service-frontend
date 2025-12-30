// src/components/admin/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import '../../styles/AdminLayout.css'

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}