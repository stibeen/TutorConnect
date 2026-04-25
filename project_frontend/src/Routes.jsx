import LandingPage from "./pages/LandingPage";
import NoPage from "./pages/NoPage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import SignupTutor from "./pages/Auth/SignupTutor";
import TuteeDashboard from "./pages/Tutee Dashboard/TuteeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ExtraProtectedRoute from "./components/ExtraProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardHome from "./pages/Tutee Dashboard/DashboardHome";
import MySessions from "./pages/Tutee Dashboard/MySessions";
import FindTutor from "./pages/Tutee Dashboard/FindTutor";
import Settings from "./pages/Tutee Dashboard/Settings";
import Notifications from "./pages/Tutee Dashboard/Notifications";
import TutorProfile from "./pages/Tutee Dashboard/TutorProfile";
import TutorDashboard from "./pages/Tutor Dashboard/TutorDashboard";
import TutorHome from "./pages/Tutor Dashboard/TutorHome";
import TutorNotifs from "./pages/Tutor Dashboard/TutorNotifs";
import TutorManageSchedule from "./pages/Tutor Dashboard/TutorManageSchedule";
import TutorSessions from "./pages/Tutor Dashboard/TutorSessions";
import TutorSettings from "./pages/Tutor Dashboard/TutorSettings";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/Admin Dashboard/AdminDashboard";
import AdminHome from "./pages/Admin Dashboard/AdminHome";
import AdminManageUsers from "./pages/Admin Dashboard/AdminManageUsers";
import AdminPaymentRecords from "./pages/Admin Dashboard/AdminPaymentRecords";
import AdminSettings from "./pages/Admin Dashboard/AdminSettings";
import AdminLoginForm from "./pages/Auth/AdminLogin";

const routes = [
  {
    path: "/",
    element: (
      <MainLayout>
        <LandingPage />
      </MainLayout>
    ),
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NoPage />,
  },
  // Auth routes
  {
    path: "/login",
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthLayout>
        <Signup />
      </AuthLayout>
    ),
  },
  {
    path: "/signupTutor",
    element: (
      <AuthLayout>
        <SignupTutor />
      </AuthLayout>
    ),
  },
  {
    path: "/loginAdmin",
    element: (
        <AdminLoginForm />
    ),
  },
  // Tutee (student) routes
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute roles={["student"]}>
        <TuteeDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "overview", element: <DashboardHome /> },
      { path: "my-sessions", element: <MySessions /> },
      { path: "find-tutor", element: <FindTutor /> },
      { path: "notifications", element: <Notifications /> },
      { path: "settings", element: <Settings /> },
      {
        path: "tutor-profile/:tutorId",
        element: <TutorProfile />,
      },
    ],
  },
  // Tutor routes
  {
    path: "/dashboardTutor",
    element: (
      <ProtectedRoute roles={["tutor"]}>
        <TutorDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TutorHome /> },
      { path: "tutor-home", element: <TutorHome /> },
      { path: "tutor-sessions", element: <TutorSessions /> },
      { path: "tutor-manage-schedule", element: <TutorManageSchedule /> },
      { path: "tutor-notifications", element: <TutorNotifs /> },
      { path: "tutor-settings", element: <TutorSettings /> },
    ],
  },
  // Admin routes
  {
    path: "/adminDashboard",
    element: (
      <ExtraProtectedRoute>
        <AdminDashboard />
      </ExtraProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminHome /> },
      { path: "admin-dashboard", element: <AdminHome /> },
      { path: "admin-manage-users", element: <AdminManageUsers /> },
      { path: "admin-records", element: <AdminPaymentRecords /> },
      { path: "admin-settings", element: <AdminSettings /> },
    ],
  },
];

export default routes;
