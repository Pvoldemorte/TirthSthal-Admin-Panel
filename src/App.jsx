import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainPage from './Pages/MainPage/MainPage'
import Temple from "./Components/Temple/temple"
// import Dieties from "./Components/Dieties/dieties"
import Festivals from "./Components/Festivals/festivals"
import Dashboard from './Components/Dashboard/dashboard'
import Login from "./Components/Login/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"

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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
