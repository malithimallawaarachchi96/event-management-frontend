import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import { useAuth } from "./app/hooks";
import { checkAuthStatus } from "./features/auth/authSlice";
import PrivateRoute from "./components/PrivateRoute";
import LoadingSpinner from "./components/LoadingSpinner";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));

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
      <Suspense fallback={<LoadingSpinner size="large" text="Loading page..." />}> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
