import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import CalendarPage from "./pages/Calendar";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import StudyPlan from "./pages/StudyPlan";
import Notifications from "./pages/Notifications";
import StudyTimer from "./pages/StudyTimer";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";

function PlaceholderPage({ title }) {
  return (
    <h2 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">
      {title} — coming next
    </h2>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/timer/:sessionId" element={<StudyTimer />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/study-plan" element={<PlaceholderPage title="Study Plan" />} />
        <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="/categories" element={<PlaceholderPage title="Categories" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  );
}

export default App;