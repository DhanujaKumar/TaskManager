import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login setUser={setUser} />}
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard setUser={setUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/adminDashboard"
          element={
            user?.role === "admin" ? (
              <AdminDashboard setUser={setUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;