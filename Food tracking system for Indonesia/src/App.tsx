import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Public pages
import Landing from "@/pages/Landing";
import References from "@/pages/References";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// User pages
import Dashboard from "@/pages/Dashboard";
import FoodDiary from "@/pages/FoodDiary";
import NutritionSummary from "@/pages/NutritionSummary";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import CaseWorkspace from "@/pages/CaseWorkspace";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminFoods from "@/pages/admin/AdminFoods";
import AdminLogs from "@/pages/admin/AdminLogs";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/references" element={<References />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tools" element={<div className="public-tools"><CaseWorkspace /></div>} />

            {/* User protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/diary"
              element={
                <ProtectedRoute>
                  <Layout><FoodDiary /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <Layout><NutritionSummary /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Layout><History /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin protected */}
            <Route path="/case-workspace" element={<ProtectedRoute><Layout><CaseWorkspace /></Layout></ProtectedRoute>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminUsers /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/foods"
              element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminFoods /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminLogs /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
