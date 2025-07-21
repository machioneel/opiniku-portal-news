import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ArticleDetail from './components/ArticleDetail';
import CategoryPage from './components/CategoryPage';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './components/auth/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { NewsProvider } from './contexts/NewsContext';

function App() {
  return (
    <AuthProvider>
      <NewsProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/artikel/:id" element={<ArticleDetail />} />
              <Route path="/kategori/:category" element={<CategoryPage />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </div>
        </Router>
      </NewsProvider>
    </AuthProvider>
  );
}

export default App;