import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROF = { nombre: "Rodri", avatar: "RO" };

const STUDENTS = [
  { id: 1,  nombre: "Vicente Zorita",       nivel: "Avanzado",    sesiones: 3, estado: "actualizada",     objetivo: "Triatleta · estab. unipodal", lesiones: ["Periostitis tibial"],     riesgo: ["RODILLA","PLYO"] },
  { id: 2,  nombre: "Bautista Zaccara",     nivel: "Principiante",sesiones: 3, estado: "actualizada",     objetivo: "Hipertrofia · base general",  lesiones: ["Lumbalgia crónica"],      riesgo: ["CADERA"] },
  { id: 3,  nombre: "Ailen Laurna",         nivel: "Intermedio",  sesiones: 3, estado: "actualizada",     objetivo: "Rendimiento funcional",       lesiones: [],                         riesgo: [] },
  { id: 4,  nombre: "Martin Aimene",        nivel: "Avanzado",    sesiones: 2, estado: "actualizada",     objetivo: "Fuerza máxima · potencia",   lesiones: ["Tendinitis rotuliana"],   riesgo: ["RODILLA_UNI"] },
  { id: 5,  nombre: "Mika Iha",             nivel: "Intermedio",  sesiones: 3, estado: "actualizada",     objetivo: "Acondicionamiento general",  lesiones: ["Tendinitis hombro der."], riesgo: ["EMPUJE","EMPUJE_UNI"] },
  { id: 6,  nombre: "Ignacio Burgos",       nivel: "Principiante",sesiones: 3, estado: "actualizada",     objetivo: "Pérdida de peso · salud",    lesiones: [],                         riesgo: [] },
  { id: 7,  nombre: "Agustin Scotti",       nivel: "Intermedio",  sesiones: 3, estado: "actualizada",     objetivo: "Fuerza · composición corp.",  lesiones: [],                         riesgo: [] },
  { id: 8,  nombre: "Cecilia Abelairas",    nivel: "Principiante",sesiones: 3, estado: "actualizada",     objetivo: "Tonificación · movilidad",   lesiones: ["Hernia L4-L5"],           riesgo: ["CADERA"] },
  { id: 9,  nombre: "Lucas Martin",         nivel: "Intermedio",  sesiones: 3, estado: "no-actualizada",  objetivo: "Rendimiento deportivo",       lesiones: [],                         riesgo: [] },
  { id: 10, nombre: "Dante Bochicchio",     nivel: "Intermedio",  sesiones: 3, estado: "actualizada",     objetivo: "Fuerza · hipertrofia",        lesiones: [],                         riesgo: [] },
  { id: 11, nombre: "Cristopher Adinolfi",  nivel: "Principiante",sesiones: null,estado:"actualizada",    objetivo: "Base general · movilidad",   lesiones: [],                         riesgo: [] },
  { id: 12, nombre: "Gimena Argomaniz",     nivel: "Principiante",sesiones: 1, estado: "actualizada",     objetivo: "Salud general · postura",    lesiones: ["Escoliosis leve"],        riesgo: ["CADERA"] },
];

const LIBRARY_ALERTS = [
  { id: "a1", ejercicio: "Flexor con polea",                 alumno: "Vicente Zorita",    bloque: "PLUS",       estado: "sin-url" },
  { id: "a2", ejercicio: "ISO hold 1 hip entre bancos",      alumno: "Vicente Zorita",    bloque: "ACTIVACIÓN", estado: "sin-url" },
  { id: "a3", ejercicio: "Valija + mesero marcha",           alumno: "Bautista Zaccara",  bloque: "ZONA MEDIA", estado: "sin-url" },
  { id: "a4", ejercicio: "Reactive skater jumps",            alumno: "Martin Aimene",     bloque: "PLYO",       estado: "pendiente" },
  { id: "a5", ejercicio: "Sentadilla asimétrica rack pos.",  alumno: "Ailen Laurna",      bloque: "ACCESORIO",  estado: "sin-url" },
];

const EJERCICIOS_BIBLIOTECA = {
  RODILLA: [
    { nombre: "Sentadilla con barra",    url: "https://youtu.be/Rvy12jFLBFo" },
    { nombre: "Sentadilla de copa",      url: "https://youtu.be/o9ciQXuDPFo" },
    { nombre: "Sentadilla frontal",      url: "https://youtu.be/IJYdbEnZOgQ" },
    { nombre: "Sentadilla sumo",         url: "https://youtu.be/wdZ-0Ua-Mqc" },
    { nombre: "Hack squat",              url: null },
    { nombre: "Camilla cuádriceps",      url: "https://youtu.be/Gln04RkyQzw" },
  ],
  RODILLA_UNI: [
    { nombre: "Estocada",                url: "https://youtu.be/gfMduXbtPnM" },
    { nombre: "Estocada hacia atrás",    url: null },
    { nombre: "Estocada caminando",      url: null },
    { nombre: "Estocada con déficit",    url: null },
    { nombre: "Estocada lateral",        url: "https://youtu.be/gfMduXbtPnM" },
  ],
  CADERA: [
    { nombre: "Peso muerto convencional",url: null },
    { nombre: "Peso muerto sumo",        url: null },
    { nombre: "Peso muerto trap bar",    url: null },
    { nombre: "RDL mancuernas",          url: null },
    { nombre: "Hip thrust con barra",    url: "https://youtu.be/6wVxlTKfyuY" },
    { nombre: "Hip thrust con pausa",    url: "https://youtu.be/6wVxlTKfyuY" },
  ],
  TRACCION: [
    { nombre: "Dominadas neutras",       url: "https://youtu.be/hcnw20S-ljk" },
    { nombre: "Remo con mancuerna parado",url:"https://youtu.be/VP_f9V854og" },
    { nombre: "Remo invertido supino",   url: null },
    { nombre: "Remo en TRX",             url: null },
  ],
  EMPUJE: [
    { nombre: "Press plano",             url: null },
    { nombre: "Press inclinado 45 m.",   url: null },
    { nombre: "Press hombro mancuerna",  url: "https://youtu.be/CuiVu0qv3lo" },
    { nombre: "Pecho con mancuerna",     url: null },
  ],
  EMPUJE_UNI: [
    { nombre: "Press Arnold",            url: null },
    { nombre: "Press plano 1 brazo",     url: "https://youtu.be/q7wtx3mvDs4" },
    { nombre: "Press ladmine 1 brazo",   url: null },
    { nombre: "Flexiones explosivas",    url: "https://youtu.be/uchZG7I86yw" },
  ],
  CORE: [
    { nombre: "Bicho muerto con banda",  url: "https://youtu.be/wCwn7-Z-XjE" },
    { nombre: "Plancha alta con tracción",url:null },
    { nombre: "Plancha Copenhage",       url: "https://youtu.be/y8ZrXfUv0EI" },
    { nombre: "Reloj 1 pierna",          url: "https://youtu.be/IUbNRYGw5mI" },
    { nombre: "Twist ruso halo",         url: null },
  ],
  PLYO: [
    { nombre: "Drop jump + Broad jump",  url: "https://youtu.be/rDaKt2UF4cM" },
    { nombre: "Reactive skater jumps",   url: "https://youtu.be/IASI5JQsH6E" },
    { nombre: "CMJ extensivo",           url: null },
    { nombre: "Pogos horizontales",      url: null },
  ],
};

const BLOQUES = [
  { key: "ACTIVACION", label: "Activación", color: "#534AB7", bg: "#EEEDFE" },
  { key: "PLYO",       label: "Plyo / Throw", color: "#0F6E56", bg: "#E1F5EE" },
  { key: "FUERZA",     label: "Fuerza",     color: "#185FA5", bg: "#E6F1FB" },
  { key: "ACCESORIO",  label: "Accesorio",  color: "#854F0B", bg: "#FAEEDA" },
  { key: "CORE",       label: "Zona media", color: "#993C1D", bg: "#FAECE7" },
];

const CAT_LABELS = {
  RODILLA: "Rodilla", RODILLA_UNI: "Rodilla unilateral",
  CADERA: "Cadera", TRACCION: "Tracción", EMPUJE: "Empuje",
  EMPUJE_UNI: "Empuje unilateral", CORE: "Core / Zona media", PLYO: "Pliometría",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const initRutina = () =>
  Object.fromEntries(BLOQUES.map(b => [b.key, []]));

const statusLabel = s =>
  s === "actualizada" ? "Actualizada" :
  s === "no-actualizada" ? "Sin actualizar" : "No aplica";

const statusColor = s =>
  s === "actualizada"
    ? { bg: "#E1F5EE", color: "#085041", dot: "#1D9E75" }
    : s === "no-actualizada"
    ? { bg: "#FCEBEB", color: "#A32D2D", dot: "#E24B4A" }
    : { bg: "#F1EFE8", color: "#5F5E5A", dot: "#888780" };

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function InjuryWarning({ student, ejercicio, categoria }) {
  if (!student || !student.riesgo.includes(categoria)) return null;
  return (
    <div style={{
      background: "#FAEEDA", border: "0.5px solid #FAC775",
      borderRadius: 8, padding: "8px 12px", marginTop: 6,
      display: "flex", alignItems: "flex-start", gap: 8,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M7 1L13 12H1L7 1Z" stroke="#EF9F27" strokeWidth="1" fill="none"/>
        <rect x="6.5" y="5" width="1" height="4" rx=".5" fill="#854F0B"/>
        <circle cx="7" cy="10.5" r=".7" fill="#854F0B"/>
      </svg>
      <p style={{ fontSize: 12, color: "#633806", lineHeight: 1.4, margin: 0 }}>
        <strong style={{ fontWeight: 500 }}>Atención:</strong> Este ejercicio ({CAT_LABELS[categoria]}) puede impactar en{" "}
        <strong style={{ fontWeight: 500 }}>{student.lesiones.join(", ")}</strong>.
      </p>
    </div>
  );
}

function LibraryAlerts({ alerts, onVincular }) {
  const [vinculando, setVinculando] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [resueltos, setResueltos] = useState([]);

  const resolver = (id) => {
    setResueltos(r => [...r, id]);
    setVinculando(null);
    setUrlInput("");
  };

  const activos = alerts.filter(a => !resueltos.includes(a.id));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="#E24B4A" strokeWidth="1" fill="none"/>
            <rect x="7.5" y="6" width="1" height="4" rx=".5" fill="#A32D2D"/>
            <circle cx="8" cy="11.5" r=".8" fill="#A32D2D"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
            Alertas de biblioteca
          </span>
          {activos.length > 0 && (
            <span style={{
              background: "#FCEBEB", color: "#A32D2D", fontSize: 11, fontWeight: 500,
              padding: "2px 8px", borderRadius: 20,
            }}>{activos.length}</span>
          )}
        </div>
      </div>

      {activos.length === 0 ? (
        <div style={{
          background: "#E1F5EE", border: "0.5px solid #9FE1CB",
          borderRadius: 10, padding: "14px 16px", textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: "#085041" }}>Todos los videos están vinculados.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activos.map(a => (
            <div key={a.id} style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
                    {a.ejercicio}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                    {a.alumno} · bloque {a.bloque}
                  </p>
                </div>
                <span style={{
                  background: a.estado === "sin-url" ? "#FCEBEB" : "#FAEEDA",
                  color: a.estado === "sin-url" ? "#A32D2D" : "#633806",
                  fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap",
                }}>
                  {a.estado === "sin-url" ? "Sin video" : "Pendiente"}
                </span>
              </div>
              {vinculando === a.id ? (
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    placeholder="Pegar URL de YouTube..."
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    style={{ width: "100%", marginBottom: 6, fontSize: 12 }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => urlInput && resolver(a.id)}
                      style={{ flex: 1, fontSize: 12, background: "#534AB7", color: "#fff", border: "none", cursor: "pointer", borderRadius: 6, padding: "6px 0" }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setVinculando(null)}
                      style={{ fontSize: 12 }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setVinculando(a.id)}
                  style={{ marginTop: 10, fontSize: 12, width: "100%" }}
                >
                  + Vincular URL
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RutinaBuilder({ student }) {
  const [rutina, setRutina] = useState(initRutina());
  const [catActiva, setCatActiva] = useState("RODILLA");
  const [bloqueDestino, setBloqueDestino] = useState("FUERZA");
  const [warning, setWarning] = useState(null);

  const agregarEjercicio = (ex, cat) => {
    if (student?.riesgo.includes(cat)) {
      setWarning({ ex, cat });
      return;
    }
    setWarning(null);
    _insertar(ex, cat);
  };

  const _insertar = (ex, cat) => {
    setRutina(r => ({
      ...r,
      [bloqueDestino]: [...r[bloqueDestino], { ...ex, cat, id: Date.now() + Math.random() }],
    }));
    setWarning(null);
  };

  const quitarEjercicio = (bloqueKey, id) => {
    setRutina(r => ({ ...r, [bloqueKey]: r[bloqueKey].filter(e => e.id !== id) }));
  };

  const totalExs = Object.values(rutina).flat().length;

  return (
    <div>
      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10, padding: "12px 14px", marginBottom: 14,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#534AB7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 500, color: "#EEEDFE",
          }}>
            {student ? student.nombre.split(" ").map(w=>w[0]).slice(0,2).join("") : "?"}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>
              {student ? student.nombre : "Seleccioná un alumno"}
            </p>
            {student && (
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>
                {student.objetivo}
              </p>
            )}
          </div>
        </div>
        {student?.lesiones?.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "#FCEBEB", border: "0.5px solid #F09595",
            borderRadius: 20, padding: "4px 10px",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#E24B4A" }}/>
            <span style={{ fontSize: 11, color: "#A32D2D", fontWeight: 500 }}>
              {student.lesiones[0]}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* LEFT: biblioteca */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
            Biblioteca de ejercicios
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {Object.keys(EJERCICIOS_BIBLIOTECA).map(cat => (
              <button
                key={cat}
                onClick={() => setCatActiva(cat)}
                style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 20,
                  background: catActiva === cat ? "#EEEDFE" : "transparent",
                  color: catActiva === cat ? "#534AB7" : "var(--color-text-secondary)",
                  border: catActiva === cat ? "0.5px solid #534AB7" : "0.5px solid var(--color-border-tertiary)",
                  cursor: "pointer",
                }}
              >
                {CAT_LABELS[cat].split(" ")[0]}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(EJERCICIOS_BIBLIOTECA[catActiva] || []).map((ex, i) => {
              const esRiesgo = student?.riesgo.includes(catActiva);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 8, padding: "8px 10px",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                      {ex.nombre}
                    </p>
                    <p style={{ fontSize: 10, color: ex.url ? "#1D9E75" : "var(--color-text-tertiary)", margin: 0 }}>
                      {ex.url ? "Video disponible" : "Sin video"}
                    </p>
                  </div>
                  <button
                    onClick={() => agregarEjercicio(ex, catActiva)}
                    style={{
                      fontSize: 11, padding: "4px 8px", flexShrink: 0,
                      background: esRiesgo ? "#FAEEDA" : "var(--color-background-secondary)",
                      color: esRiesgo ? "#854F0B" : "var(--color-text-primary)",
                      border: esRiesgo ? "0.5px solid #FAC775" : "0.5px solid var(--color-border-tertiary)",
                      borderRadius: 6, cursor: "pointer",
                    }}
                  >
                    + {bloqueDestino.charAt(0) + bloqueDestino.slice(1).toLowerCase()}
                  </button>
                </div>
              );
            })}
          </div>

          {warning && (
            <div style={{
              background: "#FAEEDA", border: "0.5px solid #FAC775",
              borderRadius: 8, padding: "10px 12px", marginTop: 10,
            }}>
              <p style={{ fontSize: 12, color: "#633806", fontWeight: 500, margin: "0 0 4px" }}>
                Advertencia de lesión
              </p>
              <p style={{ fontSize: 11, color: "#854F0B", margin: "0 0 8px", lineHeight: 1.4 }}>
                <strong style={{fontWeight:500}}>{warning.ex.nombre}</strong> pertenece a la categoría{" "}
                <strong style={{fontWeight:500}}>{CAT_LABELS[warning.cat]}</strong>, que puede impactar en{" "}
                <strong style={{fontWeight:500}}>{student?.lesiones?.join(", ")}</strong>.
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => _insertar(warning.ex, warning.cat)}
                  style={{ fontSize: 11, flex: 1, background: "#EF9F27", color: "#fff", border: "none", borderRadius: 6, padding: "5px 0", cursor: "pointer" }}
                >
                  Agregar igual
                </button>
                <button
                  onClick={() => setWarning(null)}
                  style={{ fontSize: 11, flex: 1 }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: bloques de rutina */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", margin: 0 }}>
              Rutina · {totalExs} ej.
            </p>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>Bloque destino:</span>
              <select
                value={bloqueDestino}
                onChange={e => setBloqueDestino(e.target.value)}
                style={{ fontSize: 11 }}
              >
                {BLOQUES.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BLOQUES.map(bloque => {
              const exs = rutina[bloque.key];
              return (
                <div key={bloque.key} style={{
                  background: "var(--color-background-primary)",
                  border: bloqueDestino === bloque.key
                    ? `1.5px solid ${bloque.color}`
                    : "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 10, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 12px",
                    background: bloqueDestino === bloque.key ? bloque.bg : "transparent",
                    cursor: "pointer",
                  }} onClick={() => setBloqueDestino(bloque.key)}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: bloque.color }}/>
                    <span style={{ fontSize: 12, fontWeight: 500, color: bloque.color, flex: 1 }}>
                      {bloque.label}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                      {exs.length > 0 ? `${exs.length} ej.` : "vacío"}
                    </span>
                  </div>
                  {exs.length > 0 && (
                    <div style={{ padding: "4px 10px 8px" }}>
                      {exs.map(ex => (
                        <div key={ex.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: "0.5px solid var(--color-border-tertiary)",
                        }}>
                          <span style={{ fontSize: 11, color: "var(--color-text-primary)" }}>
                            {ex.nombre}
                          </span>
                          <button
                            onClick={() => quitarEjercicio(bloque.key, ex.id)}
                            style={{
                              fontSize: 10, padding: "2px 6px",
                              color: "var(--color-text-tertiary)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalExs > 0 && (
            <button
              style={{
                marginTop: 10, width: "100%", fontSize: 13, fontWeight: 500,
                background: "#534AB7", color: "#EEEDFE",
                border: "none", borderRadius: 8, padding: "9px 0", cursor: "pointer",
              }}
              onClick={() => { setRutina(initRutina()); setWarning(null); }}
            >
              Guardar rutina ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function ProfesorDashboard() {
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0]);
  const [activeTab, setActiveTab] = useState("alertas");
  const [filterNivel, setFilterNivel] = useState("todos");

  const filtered = filterNivel === "todos"
    ? STUDENTS
    : STUDENTS.filter(s => s.nivel.toLowerCase() === filterNivel);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-background-tertiary)",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Top nav */}
      <div style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "0 20px",
        display: "flex", alignItems: "center", gap: 12, height: 52,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", background: "#534AB7",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 500, color: "#EEEDFE", flexShrink: 0,
        }}>
          {PROF.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>
            Panel del profesor
          </p>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>
            {PROF.nombre} · {STUDENTS.length} alumnos activos
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "alertas", label: "Alertas", badge: LIBRARY_ALERTS.length },
            { key: "rutina",  label: "Crear rutina" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                fontWeight: activeTab === t.key ? 500 : 400,
                background: activeTab === t.key ? "#EEEDFE" : "transparent",
                color: activeTab === t.key ? "#534AB7" : "var(--color-text-secondary)",
                border: activeTab === t.key
                  ? "0.5px solid #534AB7"
                  : "0.5px solid var(--color-border-tertiary)",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {t.label}
              {t.badge && activeTab !== t.key && (
                <span style={{
                  background: "#FCEBEB", color: "#A32D2D",
                  fontSize: 10, fontWeight: 500, padding: "1px 5px", borderRadius: 10,
                }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{
        display: "grid", gridTemplateColumns: "260px 1fr",
        gap: 14, padding: "14px 16px", maxWidth: 1100, margin: "0 auto",
      }}>
        {/* LEFT: student list */}
        <div>
          <div style={{ marginBottom: 8 }}>
            <select
              value={filterNivel}
              onChange={e => setFilterNivel(e.target.value)}
              style={{ width: "100%", fontSize: 12 }}
            >
              <option value="todos">Todos los niveles</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(s => {
              const sc = statusColor(s.estado);
              const isSelected = selectedStudent?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  style={{
                    background: "var(--color-background-primary)",
                    border: isSelected
                      ? "1.5px solid #534AB7"
                      : "0.5px solid var(--color-border-tertiary)",
                    borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                    transition: "border-color .1s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: isSelected ? "#534AB7" : "var(--color-text-primary)", margin: 0, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.nombre}
                    </p>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4,
                      background: sc.bg, borderRadius: 20, padding: "2px 7px", flexShrink: 0,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }}/>
                      <span style={{ fontSize: 10, color: sc.color, fontWeight: 500 }}>
                        {statusLabel(s.estado)}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                    {s.nivel}
                    {s.sesiones ? ` · ${s.sesiones}x/sem` : ""}
                  </p>
                  {s.lesiones.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#E24B4A" }}/>
                      <span style={{ fontSize: 10, color: "#A32D2D" }}>{s.lesiones[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: main panel */}
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 12, padding: "16px",
        }}>
          {activeTab === "alertas" && (
            <LibraryAlerts alerts={LIBRARY_ALERTS} />
          )}
          {activeTab === "rutina" && (
            <RutinaBuilder student={selectedStudent} />
          )}
        </div>
      </div>
    </div>
  );
}
