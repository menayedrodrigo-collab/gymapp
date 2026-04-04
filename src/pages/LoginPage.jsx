// src/pages/LoginPage.jsx
// Pantalla de login. Supabase maneja la sesión con JWT.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, supabase } from "../lib/supabase";

const S = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center",
    justifyContent:"center", background:"#0C0E14", fontFamily:"'DM Sans',system-ui,sans-serif" },
  card: { background:"#13161F", border:"1px solid #222636", borderRadius:14,
    padding:"32px 28px", width:"100%", maxWidth:360 },
  logo: { fontSize:22, fontWeight:700, letterSpacing:"-.03em", marginBottom:6,
    background:"linear-gradient(135deg,#7B9FFF,#1DB87A)", WebkitBackgroundClip:"text",
    WebkitTextFillColor:"transparent" },
  label: { fontSize:11, color:"#6B7290", textTransform:"uppercase",
    letterSpacing:".05em", marginBottom:6, display:"block" },
  inp: { width:"100%", background:"#191D28", border:"1px solid #222636", borderRadius:8,
    padding:"10px 12px", color:"#E4E8F5", fontSize:13, outline:"none",
    fontFamily:"inherit", marginBottom:14 },
  btn: { width:"100%", background:"#5B7FFF", border:"none", borderRadius:8,
    padding:"11px 0", color:"#fff", fontSize:13, fontWeight:600,
    cursor:"pointer", fontFamily:"inherit", marginTop:4 },
  err: { fontSize:12, color:"#D95B5B", marginTop:10, textAlign:"center" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError("Credenciales incorrectas. Verificá tu email y contraseña.");
      setLoading(false);
      return;
    }

    // Leer rol para redirigir
    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
      .from("usuarios").select("rol").eq("id", user.id).single();

    const dest = perfil?.rol === "profesor" ? "/admin" : "/entrenamiento";
    navigate(dest, { replace: true });
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <p style={S.logo}>GymApp Pro</p>
        <p style={{ fontSize:13, color:"#6B7290", marginBottom:24 }}>
          Ingresá con tu cuenta del gimnasio
        </p>
        <form onSubmit={handleSubmit}>
          <label style={S.label}>Email</label>
          <input style={S.inp} type="email" value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="nombre@gimnasio.com" required autoFocus />
          <label style={S.label}>Contraseña</label>
          <input style={S.inp} type="password" value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="••••••••" required />
          <button style={{...S.btn, opacity:loading?.6:1}}
            type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar →"}
          </button>
        </form>
        {error && <p style={S.err}>{error}</p>}
      </div>
    </div>
  );
}
