// src/pages/EntrenamientoPage.jsx
// Vista del Alumno. Carga la rutina activa desde Supabase
// y la renderiza con el componente de bloques/ejercicios.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getUser, signOut } from "../lib/supabase";

export default function EntrenamientoPage() {
  const navigate = useNavigate();
  const [alumno,   setAlumno]   = useState(null);
  const [rutina,   setRutina]   = useState(null);
  const [diaActivo,setDiaActivo]= useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        if (!user) { navigate("/login"); return; }

        // 1. Perfil del alumno (tabla alumnos del 01_schema.sql)
        const { data: alumnoData, error: e1 } = await supabase
          .from("alumnos")
          .select(`
            id, nombre, objetivo, lesiones, nivel_experiencia,
            sesiones_semanales,
            profesores ( nombre_corto )
          `)
          .eq("id_usuario", user.id)
          .single();
        if (e1) throw e1;
        setAlumno(alumnoData);

        // 2. Planificación más reciente
        const { data: plan, error: e2 } = await supabase
          .from("planificaciones")
          .select("id, nombre_periodo, estado")
          .eq("id_alumno", alumnoData.id)
          .order("creado_en", { ascending: false })
          .limit(1)
          .single();
        if (e2) throw e2;

        // 3. Días + bloques + ejercicios (join profundo)
        const { data: dias, error: e3 } = await supabase
          .from("dias_entrenamiento")
          .select(`
            id, numero_dia, tipo_sesion,
            rutinas_bloques (
              id, nombre_raw, semana1_reps, semana2_reps,
              semana3_reps, semana4_reps, pendiente_video, estado_match,
              bloques ( codigo, nombre_display, orden_default ),
              ejercicios_maestros ( nombre_display, url_video )
            )
          `)
          .eq("id_planificacion", plan.id)
          .order("numero_dia");
        if (e3) throw e3;

        setRutina({ periodo: plan.nombre_periodo, dias });
      } catch (err) {
        setError(err.message ?? "Error al cargar rutina");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const C = { bg:"#0C0E14", card:"#1E2128", bord:"#222636",
    tx:"#E4E8F5", sub:"#6B7290", acc:"#5B7FFF", teal:"#1DB87A",
    red:"#D95B5B", amb:"#E09A2B" };

  if (loading) return <Cargando />;
  if (error)   return <Error msg={error} />;

  const dias = rutina?.dias ?? [];
  const diaObj = dias[diaActivo];

  // Agrupar ejercicios del día por bloque
  const porBloque = (rb) => {
    const map = {};
    (rb ?? []).forEach(e => {
      const cod = e.bloques?.codigo ?? "SIN_BLOQUE";
      if (!map[cod]) map[cod] = { meta: e.bloques, exs: [] };
      map[cod].exs.push(e);
    });
    return Object.values(map).sort(
      (a,b) => (a.meta?.orden_default??9) - (b.meta?.orden_default??9)
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.tx,
      fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ background:"#13161F", borderBottom:`1px solid ${C.bord}`,
        padding:"0 20px", height:52, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:15, fontWeight:700,
          background:"linear-gradient(135deg,#7B9FFF,#1DB87A)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          GymApp
        </span>
        {alumno && (
          <span style={{ fontSize:12, color:C.sub }}>
            {alumno.nombre} · {rutina?.periodo}
          </span>
        )}
        <button onClick={async()=>{await signOut();navigate("/login");}}
          style={{ marginLeft:"auto", fontSize:11, color:C.sub,
            background:"none", border:"none", cursor:"pointer" }}>
          Salir →
        </button>
      </div>

      <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 16px" }}>

        {/* Perfil */}
        {alumno && (
          <div style={{ background:C.card, border:`1px solid ${C.bord}`,
            borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
            <p style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>
              {alumno.nombre}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {alumno.objetivo && (
                <span style={{ background:C.teal+"22", color:C.teal,
                  fontSize:11, padding:"3px 9px", borderRadius:12 }}>
                  {alumno.objetivo}
                </span>
              )}
              {/* Lectura directa de alumnos.lesiones */}
              {alumno.lesiones && (
                <span style={{ background:C.red+"22", color:C.red,
                  fontSize:11, padding:"3px 9px", borderRadius:12 }}>
                  ⚠ {alumno.lesiones}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Selector de días */}
        <div style={{ display:"flex", gap:6, marginBottom:16 }}>
          {dias.map((d,i) => (
            <button key={d.id} onClick={() => setDiaActivo(i)} style={{
              flex:1, padding:"9px 4px", borderRadius:9,
              border:`1px solid ${diaActivo===i?C.acc:C.bord}`,
              background: diaActivo===i ? C.acc+"22" : C.card,
              color: diaActivo===i ? "#7B9FFF" : C.sub,
              fontSize:11, fontWeight: diaActivo===i ? 600 : 400,
              cursor:"pointer",
            }}>
              Día {d.numero_dia}
            </button>
          ))}
        </div>

        {/* Bloques del día activo */}
        {diaObj && porBloque(diaObj.rutinas_bloques).map(({ meta, exs }) => (
          <div key={meta?.codigo} style={{ marginBottom:18 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"#8B5CF6",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
              {meta?.nombre_display ?? "Ejercicios"}
            </p>
            {exs.map(ex => {
              // Columnas semana1_reps…semana4_reps → array
              const semanas = [
                ex.semana1_reps, ex.semana2_reps,
                ex.semana3_reps, ex.semana4_reps,
              ].filter(Boolean);
              const nombre = ex.ejercicios_maestros?.nombre_display ?? ex.nombre_raw;
              const url    = ex.ejercicios_maestros?.url_video;

              return (
                <div key={ex.id} style={{ background:C.card,
                  border:`1px solid ${C.bord}`, borderRadius:9,
                  marginBottom:7, display:"flex", overflow:"hidden" }}>
                  <div style={{ flex:1, padding:"10px 12px" }}>
                    <p style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>
                      {nombre}
                    </p>
                    {semanas.length > 0 && (
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {semanas.map((s,i) => (
                          <span key={i} style={{ background:"#191D28",
                            border:`1px solid ${C.bord}`, borderRadius:5,
                            padding:"2px 6px", fontSize:10, color:C.sub }}>
                            <span style={{ color:"#7B9FFF", fontWeight:700 }}>
                              S{i+1}
                            </span>{" "}{s}
                          </span>
                        ))}
                      </div>
                    )}
                    {ex.pendiente_video && (
                      <p style={{ fontSize:10, color:C.amb, marginTop:4 }}>
                        ⏳ Video en proceso de carga
                      </p>
                    )}
                  </div>
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer"
                      style={{ display:"flex", alignItems:"center",
                        padding:"0 14px", color:"#7B9FFF", fontSize:11,
                        fontWeight:600, textDecoration:"none",
                        borderLeft:`1px solid ${C.bord}` }}>
                      ▶ Ver
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Cargando() {
  return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#0C0E14", color:"#6B7290",
      fontFamily:"system-ui", fontSize:13, gap:10 }}>
      <span style={{ display:"inline-block", width:16, height:16,
        border:"2px solid #222636", borderTopColor:"#5B7FFF",
        borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      Cargando rutina...
    </div>
  );
}
function Error({ msg }) {
  return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#0C0E14", color:"#D95B5B",
      fontFamily:"system-ui", fontSize:13 }}>
      Error: {msg}
    </div>
  );
}
