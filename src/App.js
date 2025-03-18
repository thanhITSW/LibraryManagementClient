import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home } from "./pages/Home";
import { MyBorrow } from "./pages/MyBorrow";
import { ManageProducts } from "./pages/ManageProducts";
import { ManageAccounts } from "./pages/ManageAccounts";
import { SystemConfigs } from "./pages/SystemConfig";
import { ManageActivityLog } from "./pages/ManageActivityLog";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { EmailVerificationSuccess } from "./pages/EmailVerificationSuccess";
import { ForceChangePassword } from "./pages/ForceChangePassword";
import { PageNotFound } from "./pages/PageNotFound";
import { MaintenancePage } from "./pages/MaintenancePage";
import { Report } from "./pages/Report";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./utils/ProtectedRoute";
import { AuthProvider } from "./services/AuthContext";
import api from "./services/api";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [role, setRole] = useState(localStorage.getItem("role") || "guest");
  const [firstLogin, setFirstLogin] = useState(localStorage.getItem("firstLogin") === "true");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkMaintenanceMode = async () => {
    try {
      const response = await api.get("/common/system-config");

      const data = response.data
      setIsMaintenance(data.maintenanceMode);
    } catch (error) {
      setIsMaintenance(false);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    checkMaintenanceMode();

    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setRole(localStorage.getItem("role") || "guest");
      setFirstLogin(localStorage.getItem("firstLogin") === "true");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <>
      <AuthProvider>
        {/* <Popup /> */}
        <Header />

        {isMaintenance ? (
          <Routes>
            <Route
              path="/login"
              element={<ProtectedRoute element={<Login />} allowGuest={true} isLoggedIn={isLoggedIn} requiredNotLogged={true} />}
            />
            <Route
              path="/manage-systems"
              element={<ProtectedRoute element={<SystemConfigs />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute element={<Profile />} isLoggedIn={isLoggedIn} />}
            />
            <Route path="*" element={<MaintenancePage />} />
          </Routes>
        ) : (
          <Routes>
            {/* Truy cập tự do */}
            <Route path="/" element={<Home />} />

            <Route path="/verify-email" element={<EmailVerificationSuccess />} />

            <Route path="/force-change-password" element={<ProtectedRoute element={<ForceChangePassword />} firstLogin={firstLogin} />} />

            <Route
              path="/my-borrows"
              element={<ProtectedRoute element={<MyBorrow />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_USER"]} userRole={role} />}
            />

            <Route
              path="/manage-books"
              element={<ProtectedRoute element={<ManageProducts />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
            />

            <Route
              path="/manage-accounts"
              element={<ProtectedRoute element={<ManageAccounts />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
            />

            <Route
              path="/manage-systems"
              element={<ProtectedRoute element={<SystemConfigs />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
            />

            <Route
              path="/manage-activity-logs"
              element={<ProtectedRoute element={<ManageActivityLog />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
            />

            <Route
              path="/report"
              element={<ProtectedRoute element={<Report />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
            />

            <Route
              path="/login"
              element={<ProtectedRoute element={<Login />} allowGuest={true} isLoggedIn={isLoggedIn} requiredNotLogged={true} />}
            />

            <Route
              path="/profile"
              element={<ProtectedRoute element={<Profile />} isLoggedIn={isLoggedIn} />}
            />

            <Route path="*" element={<PageNotFound />} />

          </Routes>
        )}

        <Footer />
      </AuthProvider>
    </>
  );
}

export default App;