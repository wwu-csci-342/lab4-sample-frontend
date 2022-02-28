import { useState, useEffect } from "react";
import { useQueryClient } from "react-query";
import { Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import useAuth from "../../hook/useAuth";
import useSubscription from "../../hook/useSubscription";
import useIsMountedRef from "../../hook/useIsMountedRef";
import Error from "../../components/Error";

const DashboardView = () => {
  const { user, logout } = useAuth();
  const isMountedRef = useIsMountedRef();

  const [error, setError] = useState(null);

  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([]);

  const subscription = useSubscription();

  // query manager
  const queryClient = useQueryClient();

  // Fetch Tasks
  const fetchTasksServer = async () => {
    const token = await user.getIdToken();
    const res = await fetch(process.env.REACT_APP_SERVER_URL + "/tasks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return data.result;
  };

  // fetch tasks front
  useEffect(() => {
    const getTasks = async () => {
      try {
        const tasksFromServer = await fetchTasksServer();
        if (isMountedRef.current) setTasks(tasksFromServer);
      } catch (err) {
        setError(err.message);
      }
    };

    getTasks();
  }, []);

  // Add Task server
  const addTaskServer = async (task) => {
    const token = await user.getIdToken();
    const res = await fetch(process.env.REACT_APP_SERVER_URL + "/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ task: task }),
    });

    const data = await res.json();
    return data.result;
  };

  // Add Task
  const addTask = async (task) => {
    try {
      const data = await addTaskServer(task);
      if (isMountedRef.current) setTasks([...tasks, data]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Task server
  const deleteTaskServer = async (id) => {
    const token = await user.getIdToken();
    const res = await fetch(process.env.REACT_APP_SERVER_URL + `/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.status;
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      const status = await deleteTaskServer(id);

      if (status === 200 && isMountedRef.current)
        setTasks(tasks.filter((task) => task.id !== id));
      else throw new Error("Error Deleting This Task");
    } catch (err) {
      setError(err.message);
    }
  };

  // update reminder server
  const updateReminderServer = async (id, reminder) => {
    const token = await user.getIdToken();
    const res = await fetch(process.env.REACT_APP_SERVER_URL + `/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reminder: !reminder }),
    });

    const data = await res.json();
    return data.result;
  };

  // update reminder
  const updateReminder = async (id, reminder) => {
    try {
      const data = await updateReminderServer(id, reminder);

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, reminder: data.reminder } : task
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // create subscription
  const [clientSecret, setClientSecret] = useState(null);

  // create subscription server
  const createSubscriptionServer = async () => {
    const token = await user.getIdToken();
    const res = await fetch(
      process.env.REACT_APP_SERVER_URL + `/subscription/stripe/create`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data.result;
  };

  // create subscription front
  const createSubscriptionFront = async () => {
    let response = await createSubscriptionServer();
    if (isMountedRef.current) setClientSecret(response.clientSecret);
  };

  // cancel subscription server
  const cancelSubscriptionServer = async () => {
    const token = await user.getIdToken();
    const res = await fetch(
      process.env.REACT_APP_SERVER_URL + `/subscription/stripe/cancel`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data.result;
  };

  const cancelSubscriptionFront = async () => {
    let response = await cancelSubscriptionServer();
    // invalidate subscription
    queryClient.invalidateQueries("getSubscription");
    return response;
  };

  const getUserInfo = () => {
    let message = "";

    if (
      subscription &&
      subscription.tier === "premium" &&
      (subscription.canceled === null || subscription.canceled === undefined)
    )
      message = (
        <p>
          Your subscription is being processed. You can refresh the page in a
          minute.
        </p>
      );
    else if (
      subscription &&
      subscription.tier === "premium" &&
      subscription.canceled
    )
      message = (
        <p>
          Your subscription is canceled but you can still use the premium
          service till {subscription.renewTime.split("T")[0]}.
        </p>
      );
    else if (
      subscription &&
      subscription.tier === "premium" &&
      subscription.canceled === false
    )
      message = <p>Welcome premium user!</p>;

    return message;
  };

  if (user === null || user === undefined)
    return <Navigate to={{ pathname: "/" }} />;

  if (clientSecret)
    return <Navigate to="/checkout" state={{ clientSecret: clientSecret }} />;

  return (
    <div className="container">
      <Header
        subscription={subscription}
        onAdd={() => setShowAddTask(!showAddTask)}
        onSubscription={createSubscriptionFront}
        onCancel={cancelSubscriptionFront}
        showAdd={showAddTask}
        logout={logout}
      />

      {getUserInfo()}

      {showAddTask && <AddTask onAdd={addTask} />}

      {tasks.length > 0 ? (
        <Tasks tasks={tasks} onDelete={deleteTask} onToggle={updateReminder} />
      ) : (
        "No Tasks To Show"
      )}

      {error && <Error error={error} />}

      <Footer />
    </div>
  );
};

export default DashboardView;
