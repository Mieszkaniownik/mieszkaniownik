import { ErrorBoundary } from "react-error-boundary";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import ErrorFallback from "./components/ErrorFallback";
import ScrollToTop from "./components/ScrollToTop";
import UserProvider from "./context/UserContext/UserProvider";
import AlertsPage from "./pages/AlertsPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import CreateAlertPage from "./pages/CreateAlertPage";
import DashboardPage from "./pages/DashboardPage";
import EditAlertPage from "./pages/EditAlertPage";
import EditPasswordPage from "./pages/EditPasswordPage";
import HeatmapPage from "./pages/HeatmapPage";
import HomePage from "./pages/HomePage";
import LoginForm from "./pages/LoginForm";
import MatchDetailPage from "./pages/MatchDetailPage";
import MatchesPage from "./pages/MatchesPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterForm from "./pages/RegisterForm";

function App() {
  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ScrollToTop />
        <UserProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/profile/edit/password"
              element={<EditPasswordPage />}
            />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/new" element={<CreateAlertPage />} />
            <Route path="/alerts/:id/edit" element={<EditAlertPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </UserProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
