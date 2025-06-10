import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUser from "../../../hooks/useUser";

const Vendorhome = () => {
  // Get user data from cookies via useUser hook
  const { user, loading: userLoading } = useUser();
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (userLoading) {
      return; // Wait for user data to load
    }

    if (!user) {
      navigate("/startscreen"); // Redirect if no user is logged in
    } else {
      const userNameValue = user.userName || user.storeName || user.name || "Vendor";
      setUsername(userNameValue);
    }
  }, [user, userLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <h1 className="text-3xl font-bold">Hi, {username}! Welcome to the Dashboard 🚀</h1>
      <Link to="/productPost">
      <button>post product</button>
      </Link>
    </div>
  );
};

export default Vendorhome;
