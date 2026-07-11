import { BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import Dashboard from "./pages/dashbooard";
import Login, { type LoginFormData } from "./pages/Login";
import Register, { type RegisterFormData } from "./pages/Register";
import JingleLibrary from "./pages/JingleLibrary";
import NewJingleStep1 from "./pages/NewJingleStep1";
import NewJingleStep2 from "./pages/NewJingleStep2";
import NewJingleStep3 from "./pages/NewJingleStep3";
import NewJingleStep4 from "./pages/NewJingleStep4";
import GeneratedJingle from "./pages/GeneratedJingle";
import JingleChangeRequest from "./pages/JingleChangeRequest"; 
import LandingPage from "./pages/LandingPage";
// 1. IMPORT YOUR EXAMPLES PAGE HERE
import ExamplesPage from "./pages/Exemple"; 

function AppRoutes() {
  const navigate = useNavigate();

  const handleLoginSubmit = (data: LoginFormData): void => {
    console.log("login submit", data);
    navigate("/");
  };

  const handleRegisterSubmit = (data: RegisterFormData): void => {
    console.log("register submit", data);
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      
      {/* 2. ADDED THE EXAMPLES ROUTE ENTRY HERE */}
      <Route path="/examples" element={<ExamplesPage />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/Library" element={<JingleLibrary />} />
      <Route path="/NewJingle1" element={<NewJingleStep1 onNext={() => navigate("/NewJingle2")} />} />
      <Route path="/NewJingle2" element={<NewJingleStep2 onNext={() => navigate("/NewJingle3")} onBack={() => navigate("/NewJingle1")} />} />
      <Route path="/NewJingle3" element={<NewJingleStep3 onNext={() => navigate("/NewJingle4")} onBack={() => navigate("/NewJingle2")} />} />
      <Route path="/NewJingle4" element={<NewJingleStep4 onBack={() => navigate("/NewJingle3")} onSubmit={() => navigate("/GeneratedJingle")} />} />
      
      <Route
        path="/GeneratedJingle"
        element={
          <GeneratedJingle
            onBack={() => navigate("/NewJingle4")}
            onRequestChanges={() => navigate("/changeRequest")}
            onApprove={() => navigate("/dashboard")}
          />
        }
      />

      <Route 
        path="/changeRequest" 
        element={
          <JingleChangeRequest 
            onBack={() => navigate("/GeneratedJingle")}
            onCancel={() => navigate("/dashboard")}
            onRegenerate={(feedback: string) => {
              console.log("Submitting feedback:", feedback);
              navigate("/NewJingle4");
            }}
          />
        } 
      />

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