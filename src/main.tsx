import React from "react";
import ReactDOM from "react-dom/client";
import { SignUpForm } from "./components";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SignUpForm onSubmit={console.log} />
  </React.StrictMode>
);
