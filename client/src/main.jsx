import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ShopHome from "./ShopHome";
import "./index.css";

createRoot(document.getElementById("root")).render(<StrictMode><ShopHome /></StrictMode>);
