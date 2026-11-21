
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Resumes from "./pages/Resumes";
import JobMatching from "./pages/JobMatching";
import AIHistory from "./pages/AIHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/job-matching" element={<JobMatching />} />
          <Route path="/ai-history" element={<AIHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
