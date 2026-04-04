// src/components/ConstructorRutina.jsx
// Constructor de rutinas con drag-and-drop y guardado en Supabase.
// Tablas que usa: ejercicios_maestros, planificaciones,
//                dias_entrenamiento, rutinas_bloques (01_schema.sql)

import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";

// ─── Colores ──────────────────────────────────────────────────
const C = {
  bg:"#0C0E14", surf:"#13161F", card:"#1E2128", bord:"#222636",
  acc:"#5B7FFF", accL:"#7B9FFF", teal:"#1DB87A", amb:"#E09A2B",
  red:"#D95B5B", tx:"#E4E8F5", sub:"#6B7290", hint:"#3D4260",
};

const BLOQUES_DEFAULT = [
  { cod:"ACTIVACION", label:"Activación",   color:"#8B5CF6" },
  { cod:"PLYO",       label:"Plyo / Throw", color:"#1DB87A" },
  { cod:"FUERZA",     label:"Fuerza",       color:"#5B7FFF" },
  { cod:"ACCESORIO",  label:"Accesorio",    color:"#E09A2B" },
  { cod:"CORE",       label:"Zona media",   color:"#D95B5B" },
];

const SEMANAS = ["S1","S2","S3","S4"];

// ─── Hook: cargar ejercicios maestros desde Supabase ──────────
function useEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    supabase
      .from("ejercicios_maestros")
      .select("id, nombre_display, url_video, categoria")
      .order("nombre_display")
      .then(({ data, error }) => {
        if (!error && data) setEjercicios(data);
        setLoading(false);
      });
  }, []);

  return { ejercicios, loading };
}

// ─── Hook: guardar rutina completa en Supabase ────────────────
function useGuardarRutina() {
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState(null); // "ok" | "error"

  /**
   * Persiste la rutina completa en tres tablas:
   *   planificaciones → dias_entrenamiento → rutinas_bloques
   *
   * @param {Object} params
   * @param {string} params.idAlumno       — UUID de alumnos.id
   * @param {string} params.idProfesor     — UUID de profesores.id
   * @param {string} params.nombrePeriodo  — ej: "Abril-Mayo 2025"
   * @param {number} params.numeroDia      — 1 | 3 | 5
   * @param {string} params.tipoSesion     — "MD+1 — Recuperación"
   * @param {Array}  params.bloques        — [ { cod, exs: [ { uid, id, semanas } ] } ]
   */
  const guardar = async ({ idAlumno, idProfesor, nombrePeriodo,
                           numeroDia, tipoSesion, bloques }) => {
    setGuardando(true);
    setResultado(null);
    try {
      // 1. Upsert planificación (match por alumno + período)
      const { data: plan, error: e1 } = await supabase
        .from("planificaciones")
        .upsert(
          { id_alumno: idAlumno, id_profesor: idProfesor,
            nombre_periodo: nombrePeriodo, estado: "ACTUALIZADA" },
          { onConflict: "id_alumno,nombre_periodo", ignoreDuplicates: false }
        )
        .select("id")
        .single();
      if (e1) throw e1;

      // 2. Upsert día de entrenamiento
      const { data: dia, error: e2 } = await supabase
        .from("dias_entrenamiento")
        .upsert(
          { id_planificacion: plan.id, numero_dia: numeroDia,
            tipo_sesion: tipoSesion, lado_hoja: "izquierda" },
          { onConflict: "id_planificacion,numero_dia" }
        )
        .select("id")
        .single();
      if (e2) throw e2;

      // 3. Borrar ejercicios anteriores del día (reemplazar completamente)
      const { error: e3 } = await supabase
        .from("rutinas_bloques")
        .delete()
        .eq("id_dia", dia.id);
      if (e3) throw e3;

      // 4. Consultar UUIDs de bloques
      const codigos = bloques.map(b => b.cod);
      const { data: bloquesDB } = await supabase
        .from("bloques")
        .select("id, codigo")
        .in("codigo", codigos);
      const bloqueMap = Object.fromEntries(
        (bloquesDB ?? []).map(b => [b.codigo, b.id])
      );

      // 5. Insertar ejercicios de todos los bloques
      const rows = [];
      bloques.forEach((bl, ordenBloque) => {
        const idBloque = bloqueMap[bl.cod];
        (bl.exs ?? []).forEach((ex, orden) => {
          const [s1, s2, s3, s4] = ex.semanas; // { r: "4X5", p: "80" }
          rows.push({
            id_dia:         dia.id,
            id_bloque:      idBloque,
            id_ejercicio:   ex.id,     // UUID de ejercicios_maestros
            nombre_raw:     ex.n,
            semana1_reps:   s1?.r || null,
            semana2_reps:   s2?.r || null,
            semana3_reps:   s3?.r || null,
            semana4_reps:   s4?.r || null,
            semana1_peso:   s1?.p || null,
            semana2_peso:   s2?.p || null,
            semana3_peso:   s3?.p || null,
            semana4_peso:   s4?.p || null,
            pendiente_video: !ex.url_video,
            estado_match:   ex.url_video ? "EXACTO" : "SIN_MATCH",
            orden_en_bloque: orden,
          });
        });
      });

      if (rows.length > 0) {
        const { error: e4 } = await supabase
          .from("rutinas_bloques")
          .insert(rows);
        if (e4) throw e4;
      }

      setResultado("ok");
      return { ok: true, idPlanificacion: plan.id };
    } catch (err) {
      console.error("Error guardando rutina:", err);
      setResultado("error");
      return { ok: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  };

  return { guardar, guardando, resultado };
}

// ─── Componente principal ─────────────────────────────────────
export default function ConstructorRutina({
  idAlumno   = null,   // UUID del alumno seleccionado
  idProfesor = null,   // UUID del profesor activo
  nombrePeriodo = "Abril-Mayo 2025",
  alumnoNombre  = "Vicente Zorita",
  alumnoLesion  = "Periostitis Tib Der",
}) {
  const { ejercicios, loading } = useEjercicios();
  const { guardar, guardando, resultado } = useGuardarRutina();

  const [bloques, setBloques] = useState(
    BLOQUES_DEFAULT.map(b => ({ ...b, exs: [] }))
  );
  const [catFiltro, setCatFiltro] = useState(null);
  const [busqueda,  setBusqueda]  = useState("");
  const [numeroDia, setNumeroDia] = useState(1);
  const [tipoSesion, setTipoSesion] = useState("MD+1 — Recuperación");
  const [dragOver,  setDragOver]  = useState(null);
  const dragging = useRef(null);

  // Categorías únicas de la biblioteca
  const categorias = useMemo(
    () => [...new Set(ejercicios.map(e => e.categoria).filter(Boolean))],
    [ejercicios]
  );

  // Ejercicios filtrados para la biblioteca lateral
  const libFiltrada = useMemo(() => ejercicios.filter(e =>
    (!catFiltro || e.categoria === catFiltro) &&
    e.nombre_display.toLowerCase().includes(busqueda.toLowerCase())
  ), [ejercicios, catFiltro, busqueda]);

  // ── Drag handlers ──────────────────────────────────────────
  const onDragStart = (ex) => { dragging.current = ex; };
  const onDragEnd   = ()   => { dragging.current = null; };

  const onDrop = (cod) => {
    const ex = dragging.current;
    if (!ex) return;
    setDragOver(null);
    dragging.current = null;
    setBloques(bs => bs.map(b => b.cod !== cod ? b : {
      ...b,
      exs: [...b.exs, {
        uid:      `${ex.id}-${Date.now()}`,
        id:       ex.id,
        n:        ex.nombre_display,
        url_video: ex.url_video,
        // 4 semanas vacías al agregar
        semanas: [{ r:"", p:"" }, { r:"", p:"" }, { r:"", p:"" }, { r:"", p:"" }],
      }],
    }));
  };

  // ── Editor de semana ───────────────────────────────────────
  const updateSemana = (blodCod, uid, si, field, val) => {
    setBloques(bs => bs.map(b => b.cod !== blodCod ? b : {
      ...b,
      exs: b.exs.map(e => e.uid !== uid ? e : {
        ...e,
        semanas: e.semanas.map((s, i) => i !== si ? s : { ...s, [field]: val }),
      }),
    }));
  };

  const removeEx = (cod, uid) => {
    setBloques(bs => bs.map(b => b.cod !== cod ? b : {
      ...b, exs: b.exs.filter(e => e.uid !== uid),
    }));
  };

  // ── Guardar ────────────────────────────────────────────────
  const handleGuardar = async () => {
    const res = await guardar({
      idAlumno, idProfesor, nombrePeriodo,
      numeroDia, tipoSesion, bloques,
    });
    if (res.ok) {
      // Feedback al usuario — el estado `resultado` controla el botón
      setTimeout(() => setBloques(BLOQUES_DEFAULT.map(b => ({ ...b, exs: [] }))), 2000);
    }
  };

  const totalExs = bloques.reduce((s, b) => s + b.exs.length, 0);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden",
      fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* ── Área principal (bloques) ── */}
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>

        {/* Header del alumno */}
        <div style={{ background:C.card, border:`1px solid ${C.bord}`,
          borderRadius:10, padding:"12px 14px", marginBottom:14,
          display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:C.acc,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>
            {alumnoNombre.split(" ").map(w=>w[0]).slice(0,2).join("")}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:600 }}>{alumnoNombre}</p>
            {alumnoLesion && (
              <p style={{ fontSize:11, color:C.red }}>⚠ {alumnoLesion}</p>
            )}
          </div>
          {/* Selector de día */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.sub }}>Día:</span>
            {[1,3,5].map(d => (
              <button key={d} onClick={() => setNumeroDia(d)} style={{
                padding:"3px 10px", borderRadius:7, border:"1px solid",
                cursor:"pointer", fontSize:11, fontWeight:numeroDia===d?600:400,
                background: numeroDia===d ? C.acc+"22" : "transparent",
                borderColor: numeroDia===d ? C.acc : C.bord,
                color: numeroDia===d ? C.accL : C.sub,
              }}>{d}</button>
            ))}
          </div>
        </div>

        <p style={{ fontSize:11, color:C.hint, marginBottom:10 }}>
          Arrastrá ejercicios desde la biblioteca → sueltos en el bloque deseado
        </p>

        {/* Bloques drop zones */}
        {bloques.map(bl => (
          <div key={bl.cod}
            onDragOver={e => { e.preventDefault(); setDragOver(bl.cod); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => onDrop(bl.cod)}
            style={{ background: dragOver===bl.cod ? bl.color+"15" : C.card,
              border: `1px solid ${dragOver===bl.cod ? bl.color : C.bord}`,
              borderRadius:10, marginBottom:8, overflow:"hidden",
              transition:"all .15s" }}>

            {/* Header del bloque */}
            <div style={{ display:"flex", alignItems:"center", gap:7,
              padding:"9px 12px",
              background: dragOver===bl.cod ? bl.color+"10" : "transparent",
              borderBottom: bl.exs.length > 0 ? `1px solid ${C.bord}` : "none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:bl.color }} />
              <span style={{ fontSize:11, fontWeight:700, color:bl.color,
                textTransform:"uppercase", letterSpacing:".06em", flex:1 }}>
                {bl.label}
              </span>
              <span style={{ fontSize:10, color:C.hint }}>
                {bl.exs.length > 0
                  ? `${bl.exs.length} ejercicio${bl.exs.length>1?"s":""}`
                  : dragOver===bl.cod ? "Soltar aquí ↓" : "Arrastrá aquí"}
              </span>
            </div>

            {/* Ejercicios del bloque */}
            {bl.exs.map(ex => (
              <div key={ex.uid} style={{ borderBottom:`1px solid ${C.bord}` }}>

                {/* Fila nombre */}
                <div style={{ display:"flex", alignItems:"center", gap:8,
                  padding:"8px 12px 4px" }}>
                  <span style={{ fontSize:13, fontWeight:500, flex:1 }}>
                    {ex.n}
                  </span>
                  {ex.url_video && (
                    <a href={ex.url_video} target="_blank" rel="noreferrer"
                      style={{ fontSize:10, color:C.accL, textDecoration:"none",
                        display:"flex", alignItems:"center", gap:3 }}>
                      ▶ Ver
                    </a>
                  )}
                  <button onClick={() => removeEx(bl.cod, ex.uid)}
                    style={{ background:"none", border:"none", cursor:"pointer",
                      color:C.hint, fontSize:14, lineHeight:1, padding:"0 2px" }}>
                    ×
                  </button>
                </div>

                {/* Editor 4 semanas — campos Reps + Kg/% */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                  gap:6, padding:"0 12px 10px" }}>
                  {ex.semanas.map((sem, si) => (
                    <div key={si}>
                      <p style={{ fontSize:9, color:C.hint, textAlign:"center",
                        marginBottom:3 }}>
                        {SEMANAS[si]}
                      </p>
                      <input
                        value={sem.r}
                        onChange={e => updateSemana(bl.cod, ex.uid, si, "r", e.target.value)}
                        placeholder="Reps"
                        style={{ width:"100%", background:C.surf,
                          border:`1px solid ${C.bord}`, borderRadius:5,
                          padding:"4px 5px", color:C.tx, fontSize:11,
                          outline:"none", textAlign:"center", marginBottom:3 }}
                      />
                      <input
                        value={sem.p}
                        onChange={e => updateSemana(bl.cod, ex.uid, si, "p", e.target.value)}
                        placeholder="Kg/%"
                        style={{ width:"100%", background:C.surf,
                          border:`1px solid ${C.bord}`, borderRadius:5,
                          padding:"4px 5px", color:C.tx, fontSize:11,
                          outline:"none", textAlign:"center" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Botón guardar */}
        <div style={{ display:"flex", gap:8, marginTop:14 }}>
          <button onClick={handleGuardar}
            disabled={guardando || totalExs === 0}
            style={{ flex:1, background: resultado==="ok" ? C.teal :
              resultado==="error" ? C.red : C.acc,
              border:"none", borderRadius:8, padding:"10px 0",
              color:"#fff", fontSize:13, fontWeight:600,
              cursor: guardando || totalExs===0 ? "not-allowed" : "pointer",
              opacity: totalExs===0 ? .4 : 1, transition:"background .3s" }}>
            {guardando       ? "Guardando…"
             : resultado==="ok"    ? "✓ Guardado en Supabase"
             : resultado==="error" ? "Error — reintentar"
             : `Guardar rutina (${totalExs} ej.)`}
          </button>
          <button onClick={() => setBloques(BLOQUES_DEFAULT.map(b=>({...b,exs:[]})))}
            style={{ background:C.card, border:`1px solid ${C.bord}`,
              borderRadius:8, padding:"10px 14px", color:C.sub,
              fontSize:12, cursor:"pointer" }}>
            Limpiar
          </button>
        </div>
      </div>

      {/* ── Biblioteca lateral ── */}
      <div style={{ width:240, flexShrink:0, borderLeft:`1px solid ${C.bord}`,
        display:"flex", flexDirection:"column", background:C.surf, overflowY:"auto" }}>

        <div style={{ padding:"12px 12px 8px", borderBottom:`1px solid ${C.bord}` }}>
          <p style={{ fontSize:10, fontWeight:700, color:C.sub,
            textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
            Biblioteca · {ejercicios.length} ej.
          </p>
          {/* Buscador */}
          <div style={{ display:"flex", alignItems:"center", gap:6,
            background:C.card, border:`1px solid ${C.bord}`,
            borderRadius:7, padding:"5px 9px", marginBottom:8 }}>
            <span style={{ color:C.hint }}>⌕</span>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)}
              placeholder="Buscar…"
              style={{ border:"none", outline:"none", background:"transparent",
                color:C.tx, fontSize:11, flex:1 }} />
          </div>
          {/* Filtro de categorías */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
            <button onClick={()=>setCatFiltro(null)} style={{
              fontSize:9, padding:"2px 7px", borderRadius:12, border:"1px solid",
              cursor:"pointer", background:!catFiltro?C.acc+"22":"transparent",
              borderColor:!catFiltro?C.acc:C.bord, color:!catFiltro?C.accL:C.hint }}>
              Todo
            </button>
            {categorias.map(cat => (
              <button key={cat} onClick={()=>setCatFiltro(cat)} style={{
                fontSize:9, padding:"2px 7px", borderRadius:12, border:"1px solid",
                cursor:"pointer",
                background: catFiltro===cat ? C.acc+"22" : "transparent",
                borderColor: catFiltro===cat ? C.acc : C.bord,
                color:       catFiltro===cat ? C.accL : C.hint,
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize:11, color:C.hint, padding:14 }}>
            Cargando ejercicios de Supabase…
          </p>
        ) : (
          <div style={{ overflowY:"auto", flex:1, padding:"8px 10px" }}>
            {libFiltrada.map(ex => (
              <div key={ex.id}
                draggable
                onDragStart={() => onDragStart(ex)}
                onDragEnd={onDragEnd}
                style={{ display:"flex", alignItems:"center", gap:7,
                  background:C.card, border:`1px solid ${C.bord}`,
                  borderRadius:8, padding:"8px 10px", marginBottom:5,
                  cursor:"grab", userSelect:"none" }}>
                <span style={{ color:C.hint, fontSize:13 }}>⠿</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:11, fontWeight:500,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {ex.nombre_display}
                  </p>
                  <p style={{ fontSize:9, color: ex.url_video ? C.teal : C.hint }}>
                    {ex.url_video ? "▶ Video disponible" : "Sin video"}
                  </p>
                </div>
              </div>
            ))}
            {libFiltrada.length === 0 && (
              <p style={{ fontSize:11, color:C.hint, padding:"8px 0" }}>
                Sin resultados
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
