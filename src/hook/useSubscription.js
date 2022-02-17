import { useState, useEffect } from "react";
import useAuth from "./useAuth";

const useSubscription = () => {
  const { user } = useAuth();

  const [subscription, setSubscription] = useState(null);

  const getSubscriptionServer = async () => {
    const token = await user.getIdToken();
    const res = await fetch(
      process.env.REACT_APP_SERVER_URL + "/subscription",
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

  const getSubscriptionFront = async () => {
    let res = await getSubscriptionServer();
    setSubscription(res);
  }

  useEffect(() => {
    if (user) getSubscriptionFront();
  }, [user]);

  return subscription;
};

export default useSubscription;
