import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Vendorhome = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/startscreen"); // Redirect if no user is logged in
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

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
