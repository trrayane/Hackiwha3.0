import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashbooard";
import LandingPage from "./pages/landing";
import Login, { type LoginFormData } from "./pages/Login";
import Register, { type RegisterFormData } from "./pages/Register";
import JingleLibrary from "./pages/JingleLibrary";
import JingleDetailView from "./pages/JingleDetailView";
import NewJingleStep1 from "./pages/NewJingleStep1";
import NewJingleStep2 from "./pages/NewJingleStep2";
import NewJingleStep3 from "./pages/NewJingleStep3";
import NewJingleStep4 from "./pages/NewJingleStep4";
import GeneratedJingle from "./pages/GeneratedJingle";
import ChangeRequest from "./pages/ChangeRequest";
function AppRoutes() {
  const navigate = useNavigate();

  const handleLoginSubmit = (data: LoginFormData): void => {
    // TODO: replace with real authentication call
    console.log("login submit", data);
    navigate("/");
  };

  const handleRegisterSubmit = (data: RegisterFormData): void => {
    // TODO: replace with real account-creation call
    console.log("register submit", data);
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/Library" element={<JingleLibrary />} />
      <Route path="/NewJingle1" element={<NewJingleStep1 onNext={() => navigate("/NewJingle2")} />} />
       <Route path="/NewJingle2" element={<NewJingleStep2 onNext={() => navigate("/NewJingle3")} onBack={() => navigate("/NewJingle1")} />} />
      <Route path="/NewJingle3" element={<NewJingleStep3 onNext={() => navigate("/NewJingle4")} onBack={() => navigate("/NewJingle2")} />} />
      <Route path="/NewJingle4" element={<NewJingleStep4 onBack={() => navigate("/NewJingle3")} onSubmit={() => navigate("/GeneratedJingle")} />} />
       <Route path="/GeneratedJingle" element={<GeneratedJingle />} />
        <Route path="/changeRequest" element={<ChangeRequest />} />
         <Route path="/jingle/:id" element={<JingleDetailView onBack={() => navigate("/Library")} />} />
       <Route path="/login"
        element={
          <Login
            onSubmit={handleLoginSubmit}
            onSwitchToRegister={() => navigate("/register")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onSubmit={handleRegisterSubmit}
            onSwitchToLogin={() => navigate("/login")}
          />
        }
      />
    </Routes>
  );
}


export default function App(){
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}