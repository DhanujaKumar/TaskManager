import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ setUser }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Please fill all fields");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/auth/login",
        form
      );

      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      if (user.role === "admin") {
        navigate("/adminDashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      
      <div className="login-left">
        <h1>Task Manager</h1>
        <p>
          Organize your tasks, track progress, and boost your productivity.
        </p>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          
          <h2>Welcome Back</h2>
          <p className="subtitle">Manage your tasks efficiently</p>

          {error && <p className="error">{error}</p>}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>

    </div>
  );
}

export default Login;