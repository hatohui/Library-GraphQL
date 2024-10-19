import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useUserDispatch } from "../context/currentUser";
import { useApolloClient } from "@apollo/client";
import { useNotificationDispatch } from "../context/NotificationContext";

const NavBar = () => {
  const navigate = useNavigate();
  const currentUser = useUser();
  const client = useApolloClient();
  const dispatchU = useUserDispatch();
  const dispatchN = useNotificationDispatch();

  const handleLogout = (event) => {
    event.preventDefault();
    dispatchU({ type: "LOGOUT", payload: null });
    client.resetStore();
    dispatchN({ type: "SET", payload: "Logged out" });
    setTimeout(() => {
      dispatchN({ type: "RESET" });
    }, 5000);
  };

  return (
    <div>
      <button onClick={() => navigate("/authors")}>To Author</button>
      <button onClick={() => navigate("/books")}>To Books</button>
      {currentUser && (
        <button onClick={() => navigate("/add")}>Create New</button>
      )}
      {!currentUser ? (
        <button onClick={() => navigate("/login")}>login</button>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
};

export default NavBar;
