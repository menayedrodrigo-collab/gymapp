// src/App.jsx
// Enrutamiento principal con React Router v6.
// Tres rutas: /login  /admin (Profesor)  /entrenamiento (Alumno)
//
// npm install react-router-dom @supabase/supabase-js

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { supabase, getUser } from "./lib/supabase";

// Páginas — importación lazy para code splitting automático
import { lazy, Suspense } from "react";
const LoginPage         = lazy(() => import("./pages/LoginPage"));
const AdminDashboard    = lazy(() => import("./pages/AdminDashboard"));
const EntrenamientoPage = lazy(() => import("./pages/EntrenamientoPage"));

// ─── Loading fallback ─────────────────────────────────────────
function Loader() {
  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0C0E14", color: "#6B7290",
      fontSize: 13, gap: 10,
    }}>
      <span style={{ display: "inline-block", animation: "spin 1s linear infinite",
        border: "2px solid #222636", borderTopColor: "#5B7FFF",
        borderRadius: "50%", width: 18, height: 18 }} />
      Cargando GymApp Pro...
    </div>
  );
}

// ─── Auth context mínimo ──────────────────────────────────────
// En producción podés reemplazar esto por un Context Provider completo.

/**
 * Guard para rutas protegidas.
 * - Verifica sesión de Supabase.
 * - Redirige a /login si no hay usuario.
 * - `allowedRoles` filtra por la columna `rol` de la tabla `usuarios`.
 */
function ProtectedRoute({ allowedRoles }) {
  const [status, setStatus] = useState("loading"); // loading | ok | denied
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await getUser();
      if (!user) { navigate("/login", { replace: true }); return; }

      if (allowedRoles) {
        // Consulta el rol desde la tabla `usuarios` del esquema 01_schema.sql
        const { data } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id", user.id)
          .single();

        if (!data || !allowedRoles.includes(data.rol)) {
          // Redirige al destino correcto según rol real
          const dest = data?.rol === "profesor" ? "/admin" : "/entrenamiento";
          navigate(dest, { replace: true });
          return;
        }
      }
      if (mounted) setStatus("ok");
    })();
    return () => { mounted = false; };
  }, []);

  if (status === "loading") return <Loader />;
  return <Outlet />;  // React Router v6: renderiza la ruta hija
}

// ─── Redirección por rol al hacer login ──────────────────────
// LoginPage llama onSuccess(rol) cuando Supabase confirma la sesión.
function RootRedirect() {
  const [dest, setDest] = useState(null);
  useEffect(() => {
    getUser().then(async (user) => {
      if (!user) { setDest("/login"); return; }
      const { data } = await supabase
        .from("usuarios").select("rol").eq("id", user.id).single();
      setDest(data?.rol === "profesor" ? "/admin" : "/entrenamiento");
    });
  }, []);
  if (!dest) return <Loader />;
  return <Navigate to={dest} replace />;
}

// ─── APP ──────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Raíz → redirige según rol */}
          <Route path="/" element={<RootRedirect />} />

          {/* Login público */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard del Profesor — rol: "profesor" */}
          <Route element={<ProtectedRoute allowedRoles={["profesor"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/:section" element={<AdminDashboard />} />
          </Route>

          {/* Entrenamiento del Alumno — rol: "alumno" */}
          <Route element={<ProtectedRoute allowedRoles={["alumno"]} />}>
            <Route path="/entrenamiento" element={<EntrenamientoPage />} />
            <Route path="/entrenamiento/:idPlanificacion" element={<EntrenamientoPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
