import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardHome from './DashboardHome';
import ArticleManagement from './ArticleManagement';
import ApprovalQueue from './ApprovalQueue';
import UserManagement from './UserManagement';
import CreateArticle from './CreateArticle';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, ROLES } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has minimum required role
  if (!hasPermission(profile.role, ROLES.CONTRIBUTOR)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki izin untuk mengakses admin panel.
          </p>
          <p className="text-sm text-gray-500">
            Role Anda: <span className="font-medium capitalize">{profile.role.replace('_', ' ')}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/articles" element={<ArticleManagement />} />
            <Route path="/articles/create" element={<CreateArticle />} />
            <Route 
              path="/approvals" 
              element={
                hasPermission(profile.role, ROLES.EDITOR) ? (
                  <ApprovalQueue />
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
                    <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                  </div>
                )
              } 
            />
            <Route 
              path="/users" 
              element={
                hasPermission(profile.role, ROLES.EDITOR) ? (
                  <UserManagement />
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
                    <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                  </div>
                )
              } 
            />
            <Route path="/analytics" element={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600">Fitur analytics akan segera tersedia.</p>
              </div>
            } />
            <Route path="/settings" element={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pengaturan</h3>
                <p className="text-gray-600">Fitur pengaturan akan segera tersedia.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;