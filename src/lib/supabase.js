// src/lib/supabase.js
// Cliente único de Supabase — importar desde cualquier archivo.
// Las variables VITE_* las expone Vite al bundle del cliente.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local"
  );
}

export const supabase = createClient(url, key);

// ── Helpers de autenticación ──────────────────────────────────

/** Retorna el usuario activo o null. */
export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
};

/** Login con email + password (usuarios del gimnasio). */
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();
