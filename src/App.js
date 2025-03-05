import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home } from "./pages/Home";
import { MyBorrow } from "./pages/MyBorrow";
import { ManageProducts } from "./pages/ManageProducts";
import { ManageAccounts } from "./pages/ManageAccounts";
import { SystemConfigs } from "./pages/SystemConfig";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { PageNotFound } from "./pages/PageNotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./utils/ProtectedRoute";

import { AuthProvider } from "./services/AuthContext";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [role, setRole] = useState(localStorage.getItem("role") || "guest");

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setRole(localStorage.getItem("role") || "guest");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
    <AuthProvider>
      {/* <Popup /> */}
      <Header />

      <Routes>
        {/* Truy cập tự do */}
        <Route path="/" element={<Home />} />

        {/*Yêu cầu đăng nhập và role phải là "customer"*/}
        <Route
          path="/my-borrows"
          element={<ProtectedRoute element={<MyBorrow />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_USER"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "manager", "admin*/}
        <Route
          path="/manage-books"
          element={<ProtectedRoute element={<ManageProducts />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "manager", "admin*/}
        <Route
          path="/manage-accounts"
          element={<ProtectedRoute element={<ManageAccounts />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "manager", "admin*/}
        <Route
          path="/manage-systems"
          element={<ProtectedRoute element={<SystemConfigs />} isLoggedIn={isLoggedIn} requiredRole={["ROLE_ADMIN"]} userRole={role} />}
        />

        {/*Chỉ có thể truy cập nếu chưa đăng nhập*/}
        <Route
          path="/login"
          element={<ProtectedRoute element={<Login />} allowGuest={true} isLoggedIn={isLoggedIn} requiredNotLogged={true} />}
        />

        {/*Yêu cầu phải đăng nhập*/}
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} isLoggedIn={isLoggedIn} />}
        />

        <Route path="*" element={<PageNotFound />} />

      </Routes>

      <Footer />
      </AuthProvider>
    </>
  );
}

export default App;