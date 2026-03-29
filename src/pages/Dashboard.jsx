import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard({ setUser }) {
  const token = localStorage.getItem("token");

  const [view, setView] = useState("assigned");
  const [tasks, setTasks] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  //  Fetch assigned tasks
  const fetchAssignedTasks = async (pageNum = 1) => {
    const res = await axios.get(
      `http://localhost:3000/tasks/userTasks?page=${pageNum}&limit=3`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTasks(res.data.tasks);
    setPage(res.data.page);
    setTotalPages(res.data.totalPages);
  };

  //  Fetch my tasks
  const fetchMyTasks = async (pageNum = 1) => {
    const res = await axios.get(
      `http://localhost:3000/tasks/myTasks?page=${pageNum}&limit=3`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTasks(res.data.tasks);
    setPage(res.data.page);
    setTotalPages(res.data.totalPages);
  };

  //  Fetch stats
  const fetchStats = async () => {
    const res = await axios.get(
      "http://localhost:3000/tasks/taskStats",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStats(res.data.stats);
  };

  useEffect(() => {
    if (view === "assigned") {
      fetchAssignedTasks(page);
      fetchStats();
    } else if (view === "my") {
      fetchMyTasks(page);
    }
  }, [page, view]);

  //  Update status
  const updateStatus = async (id, status) => {
    await axios.patch(
      `http://localhost:3000/tasks/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (view === "assigned") {
      fetchAssignedTasks(page);
      fetchStats();
    } else {
      fetchMyTasks(page);
    }
  };

  //  Create task
  const handleCreate = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:3000/tasks",
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setForm({ title: "", description: "", deadline: "" });
    setView("my");
    setPage(1);
  };

  const deleteTask = async (id) => {
  try {
    await axios.delete(
      `http://localhost:3000/tasks/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Task deleted");

    // refresh tasks
    if (view === "my") {
      fetchMyTasks(page);
    }

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Delete failed");
  }
};

  //  Logout
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="dashboard-layout">

      <div className="sidebar">
        <h2>User</h2>

        <button onClick={() => { setView("assigned"); setPage(1); }}>
          Assigned Tasks
        </button>

        <button onClick={() => { setView("my"); setPage(1); }}>
          My Tasks
        </button>

        <button onClick={() => setView("create")}>
          Create Task
        </button>

        <button onClick={handleLogout} className="logout">
          Logout
        </button>
      </div>

      <div className="content">

        {view === "create" && (
          <div className="form-wrapper">
            <form className="task-form" onSubmit={handleCreate}>
              <h2>Create Task</h2>

              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
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

              <button type="submit">Create Task</button>
            </form>
          </div>
        )}

        {(view === "assigned" || view === "my") && (
          <div className="task-container">

            <div className="content-header">
              <h2>
                {view === "assigned" ? "Assigned Tasks" : "My Tasks"}
              </h2>

              {view === "assigned" && (
                <div className="stats">
                  <div className="stat pending">Pending: {stats.pending}</div>
                  <div className="stat progress">In Progress: {stats.in_progress}</div>
                  <div className="stat completed">Completed: {stats.completed}</div>
                </div>
              )}
            </div>

            {tasks.map((task) => (
  <div className="task-card" key={task.id}>

    <h3>{task.title}</h3>
    <p>{task.description}</p>

    <div className="task-info">
      <span className={`badge ${task.status}`}>
        {task.status}
      </span>

      <span className="deadline">
        📅 {new Date(task.deadline).toLocaleDateString()}
      </span>
    </div>

    <div className="actions">
      <button onClick={() => updateStatus(task.id, "pending")}>
        Pending
      </button>

      <button onClick={() => updateStatus(task.id, "in_progress")}>
        In Progress
      </button>

      <button onClick={() => updateStatus(task.id, "completed")}>
        Done
      </button>
    </div>

    {/* 🔥 DELETE ONLY FOR MY TASKS */}
    {view === "my" && (
      <button
        className="delete-btn"
        onClick={() => deleteTask(task.id)}
      >
        Delete
      </button>
    )}

  </div>
))}

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;