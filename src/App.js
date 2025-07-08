import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import { useAuth } from "./app/hooks";
import { checkAuthStatus } from "./features/auth/authSlice";
import PrivateRoute from "./components/PrivateRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import CreateEvent from "./pages/CreateEvent";

function App() {
  const dispatch = useAppDispatch();
  const { loading } = useAuth();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner size="large" text="Initializing..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/create" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
