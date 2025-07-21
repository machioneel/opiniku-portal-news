import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Settings,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, ROLES } from '../../lib/supabase';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/admin',
      requiredRole: ROLES.CONTRIBUTOR
    },
    { 
      icon: FileText, 
      label: 'Artikel', 
      path: '/admin/articles',
      requiredRole: ROLES.CONTRIBUTOR
    },
    { 
      icon: Plus, 
      label: 'Buat Artikel', 
      path: '/admin/articles/create',
      requiredRole: ROLES.CONTRIBUTOR
    },
    { 
      icon: CheckSquare, 
      label: 'Persetujuan', 
      path: '/admin/approvals',
      requiredRole: ROLES.EDITOR
    },
    { 
      icon: Users, 
      label: 'Pengguna', 
      path: '/admin/users',
      requiredRole: ROLES.EDITOR
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/admin/analytics',
      requiredRole: ROLES.CONTRIBUTOR
    },
    { 
      icon: Settings, 
      label: 'Pengaturan', 
      path: '/admin/settings',
      requiredRole: ROLES.EDITOR
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    profile && hasPermission(profile.role, item.requiredRole)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              O
            </div>
            <span className="text-lg font-bold text-gray-800">Admin Panel</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <Users size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{profile?.full_name}</p>
              <p className="text-sm text-gray-500 capitalize">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600">Logged in as</p>
            <p className="text-sm font-medium text-gray-800 capitalize">
              {profile?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;