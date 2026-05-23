import React from "react";

import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
 Route,
} from "react-router-dom";

import Login from "./pages/Login";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<App />}
        />

      </Routes>

    </BrowserRouter>

  </React.StrictMode>
);
