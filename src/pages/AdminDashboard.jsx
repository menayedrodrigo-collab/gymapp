// src/pages/AdminDashboard.jsx
// Shell del Dashboard del Profesor.
// Maneja la navegación entre secciones internamente.
// El componente visual completo vive en GymApp.jsx (Paso 5).

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { signOut } from "../lib/supabase";

// Secciones del dashboard (las páginas del Paso 5 se importan aquí)
import ConstructorRutina from "../components/ConstructorRutina";
// import AlumnosPage    from "../components/AlumnosPage";
// import EquipoPage     from "../components/EquipoPage";
// import ImportarPage   from "../components/ImportarPage";
// import BibliotecaPage from "../components/BibliotecaPage";

const SECCIONES = [
  { id: "alumnos",     label: "Alumnos",     icon: "👥" },
  { id: "constructor", label: "Constructor",  icon: "🏗" },
  { id: "biblioteca",  label: "Biblioteca",   icon: "🎬" },
  { id: "equipo",      label: "Equipo",       icon: "🛡" },
  { id: "importar",    label: "Importar",     icon: "📥" },
];

export default function AdminDashboard() {
  const { section } = useParams();
  const navigate    = useNavigate();
  const [sec, setSec] = useState(section ?? "alumnos");

  const C = { bg:"#0C0E14", surf:"#13161F", bord:"#222636",
    acc:"#5B7FFF", accL:"#7B9FFF", tx:"#E4E8F5", sub:"#6B7290" };

  const goTo = (id) => { setSec(id); navigate(`/admin/${id}`, { replace: true }); };
  const logout = async () => { await signOut(); navigate("/login"); };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg,
      color:C.tx, fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Sidebar */}
      <nav style={{ width:180, background:C.surf, borderRight:`1px solid ${C.bord}`,
        display:"flex", flexDirection:"column", padding:"14px 10px", gap:4 }}>

        <div style={{ padding:"6px 6px 16px", marginBottom:4,
          borderBottom:`1px solid ${C.bord}`, fontSize:15, fontWeight:700,
          background:"linear-gradient(135deg,#7B9FFF,#1DB87A)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          GymApp Pro
        </div>

        {SECCIONES.map(s => (
          <button key={s.id} onClick={() => goTo(s.id)} style={{
            display:"flex", alignItems:"center", gap:9, padding:"8px 10px",
            borderRadius:8, border:"none", cursor:"pointer", fontSize:12,
            fontWeight: sec===s.id ? 600 : 400,
            background: sec===s.id ? C.acc+"22" : "transparent",
            color:       sec===s.id ? C.accL    : C.sub,
            textAlign:"left",
          }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}

        <button onClick={logout} style={{ marginTop:"auto", fontSize:11,
          color:C.sub, background:"none", border:"none", cursor:"pointer",
          textAlign:"left", padding:"8px 10px" }}>
          Cerrar sesión →
        </button>
      </nav>

      {/* Área de trabajo */}
      <main style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {sec === "constructor" && <ConstructorRutina />}
        {sec === "alumnos"     && <PlaceholderSeccion label="Alumnos" />}
        {sec === "biblioteca"  && <PlaceholderSeccion label="Biblioteca de Videos" />}
        {sec === "equipo"      && <PlaceholderSeccion label="Gestión de Equipo" />}
        {sec === "importar"    && <PlaceholderSeccion label="Importar Alumnos" />}
      </main>
    </div>
  );
}

function PlaceholderSeccion({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height:"100%", color:"#3D4260", fontSize:14 }}>
      {label} — importar componente del Paso 5
    </div>
  );
}
