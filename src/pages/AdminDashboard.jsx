import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard({ setUser }) {
  const token = localStorage.getItem("token");

  const [view, setView] = useState("assign");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    deadline: "",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/auth/allusers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch tasks for selected user
  const fetchUserTasks = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/tasks/assigned?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    }
  };

  //  DELETE TASK
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(
        `http://localhost:3000/tasks/admin/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks((prev) => prev.filter((t) => t.id !== taskId));

    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  // Assign task
  const handleAssign = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:3000/tasks/assign",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setForm({
        title: "",
        description: "",
        assigned_to: "",
        deadline: "",
      });

      alert("Task Assigned!");
    } catch {
      alert("Error assigning task");
    }
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:3000/auth/register",
        userForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserForm({
        name: "",
        email: "",
        password: "",
      });

      alert("User Created!");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  //  Logout
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-layout">

      <div className="sidebar">
        <h2>Admin</h2>

        <button onClick={() => setView("assign")}>Assign Task</button>
        <button onClick={() => setView("users")}>View Users</button>
        <button onClick={() => setView("create")}>Create User</button>

        <button onClick={handleLogout} className="logout">
          Logout
        </button>
      </div>

      <div className="content">

        {view === "assign" && (
          <form className="task-form" onSubmit={handleAssign}>
            <h2>Assign Task</h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              placeholder="User ID"
              value={form.assigned_to}
              onChange={(e) =>
                setForm({ ...form, assigned_to: e.target.value })
              }
            />

            <input
                type="date"
                value={form.deadline}
                min={new Date().toISOString().split("T")[0]}  
                onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
  }
/>

            <button type="submit">Assign Task</button>
          </form>
        )}

        {/* CREATE USER */}
        {view === "create" && (
          <form className="task-form" onSubmit={handleCreateUser}>
            <h2>Create User</h2>

            <input
              placeholder="Name"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
            />

            <button type="submit">Create User</button>
          </form>
        )}

        {view === "users" && (
          <div className="users-section">

            {/* USER LIST */}
            <div className="user-list">
              <h3>Users</h3>

              {users.map((u) => (
                <div
                  key={u.id}
                  className={`user-card ${
                    selectedUser?.id === u.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedUser(u);
                    setTasks([]);
                    fetchUserTasks(u.id);
                  }}
                >
                  {u.name}
                </div>
              ))}
            </div>

            <div className="user-tasks">
              {selectedUser ? (
                <>
                  <h3>{selectedUser.name}'s Tasks</h3>

                  {tasks.length === 0 ? (
                    <p>No tasks</p>
                  ) : (
                    tasks.map((task) => (
                        <div className="task-card" key={task.id}>
  <h4>{task.title}</h4>
  <p>{task.description}</p>

  <div className="task-dates">
    <p>
      📅 <strong>Deadline:</strong>{" "}
      {new Date(task.deadline).toLocaleDateString()}
    </p>

    <p>
      🕒 <strong>Created:</strong>{" "}
      {new Date(task.created_at).toLocaleDateString()}
    </p>
  </div>

  <span className={`badge ${task.status}`}>
    {task.status}
  </span>

  <button
    className="delete-btn"
    onClick={() => deleteTask(task.id)}
  >
    Delete
  </button>
</div>
                    ))
                  )}
                </>
              ) : (
                <p>Select a user to view tasks</p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;