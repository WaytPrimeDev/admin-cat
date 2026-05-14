import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Layout from "./components/Layout/Layout";
import DashboardPage from "./pages/DashboardPage/DashboardPage";

const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage"));
const KittensPage = lazy(() => import("./pages/KittensPage/KittensPage"));
const ParentsPage = lazy(() => import("./pages/ParentsPage/ParentsPage"));
const FamiliesPage = lazy(() => import("./pages/FamiliesPage/FamiliesPage"));

function App() {
  return (
    <Suspense>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="kittens" element={<KittensPage />} />
          <Route path="parents" element={<ParentsPage />} />
          <Route path="families" element={<FamiliesPage />} />
        </Route>
        <Route path="*" element={<>OOOPS...</>} />
      </Routes>
    </Suspense>
  );
}

export default App;
