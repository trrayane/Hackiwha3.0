import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import type { AuthFormData } from "./types";

type View = "login" | "register";

/**
 * App
 * Minimal demo wiring: toggles between Login and Register and logs
 * submitted form values. Replace with your router (react-router, etc.)
 * in a real app — swap onSwitchToRegister/onSwitchToLogin for navigate().
 */
export default function App() {
  const [view, setView] = useState<View>("login");

  const handleLoginSubmit = (data: AuthFormData): void => {
    console.log("login submit", data);
  };

  const handleRegisterSubmit = (data: AuthFormData): void => {
    console.log("register submit", data);
  };

  if (view === "register") {
    return (
      <Register
        onSubmit={handleRegisterSubmit}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return (
    <Login
      onSubmit={handleLoginSubmit}
      onSwitchToRegister={() => setView("register")}
    />
  );
}