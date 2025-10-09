import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import IdeaPage from './pages/IdeaPage'
import DashboardPage from './pages/DashboardPage'
import EvaluatorDashboard from './pages/EvaluatorDashboard'
import NotFound from './pages/NotFound'
import Topbar from './components/Topbar'
import BottomNav from './components/BottomNav'
import AddIdeaButton from './components/AddIdeaButton'
import { useAuth } from './context/AuthContext'
import SubmitPage from './pages/SubmitPage'
import AdminCategories from './pages/AdminCategories'
import AdminUsers from './pages/AdminUsers'
import AdminLanding from './pages/AdminLanding'

export default function App() {
  const { user } = useAuth()

  return (
<div className="flex flex-col min-h-screen">

      <Topbar />
      <main className="pb-24">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/ideas/:id" element={user ? <IdeaPage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/evaluator" element={user ? <EvaluatorDashboard /> : <Navigate to="/login" />} />
          <Route path="/submit" element={user ? <SubmitPage/> : <Navigate to="/login" />} />
          <Route path="/admin/AdminLanding" element={user && user.roles && user.roles.includes('admin') ? <AdminLanding /> : <Navigate to="/login" />} />
          <Route path="/admin/AdminUsers" element={user && user.roles && user.roles.includes('admin') ? <AdminUsers /> : <Navigate to="/login" />} />
          <Route path="/admin/AdminCategories" element={user && user.roles && user.roles.includes('admin') ? <AdminCategories /> : <Navigate to="/login" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AddIdeaButton />
      <BottomNav />
    </div>
  )
}
