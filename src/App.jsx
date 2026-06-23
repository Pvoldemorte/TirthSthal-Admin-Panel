import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainPage from './Pages/MainPage/MainPage'
import Temple from "./components/Temple/temple"
// import Dieties from "./Components/Dieties/dieties"
import Festivals from "./components/Festivals/festivals"
import Dashboard from './components/Dashboard/dashboard'
import Login from "./components/Login/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"
import BulkImport from "./components/BulkImport/BulkImport";
import Blog from "./components/Blog/Blog"


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="temple" element={<Temple />} />
            {/* <Route path="dieties" element={<Dieties />} /> */}
            <Route path="festivals" element={<Festivals />} />
            <Route path="bulk-import" element={<BulkImport />} />
            <Route path='blog'  element={<Blog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
