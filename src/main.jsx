// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Reset CSS mínimo — sin framework externo
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { -webkit-font-smoothing: antialiased; }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: #252B3B; border-radius: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  a { text-decoration: none; color: inherit; }
  button, input, select, textarea { font-family: inherit; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
