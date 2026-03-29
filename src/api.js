const BASE_URL = "http://localhost:3000";

export const login = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks/userTasks`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  });
  return res.json();
};

export const createTask = async (data) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(data)
  });
  return res.json();
};