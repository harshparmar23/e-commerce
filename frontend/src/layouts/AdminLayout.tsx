import type { ReactNode } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 md:ml-20 lg:ml-64 transition-all duration-300">
        <AdminHeader title={title} />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
