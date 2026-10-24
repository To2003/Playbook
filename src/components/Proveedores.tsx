"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { useEffect, type ReactNode } from "react";
import { useAjustes } from "@/lib/estado/ajustes";
import { iniciarNube } from "@/lib/nube/cuenta";

/** Sincroniza el tema elegido en Mi club con el documento. */
function Tema() {
  const ajustes = useAjustes();
  useEffect(() => {
    if (!ajustes) return;
    document.documentElement.dataset.tema = ajustes.tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", ajustes.tema === "claro" ? "#f2f4f7" : "#070b12");
  }, [ajustes]);
  return null;
}

/** Si la nube está configurada: sesión de Google y sincronización en segundo plano. */
function Nube() {
  useEffect(() => iniciarNube(), []);
  return null;
}

export function Proveedores({ children }: { children: ReactNode }) {
  return (
    // Sin recargar al volver la señal: cortaría el modo cancha en medio de un bloque.
    <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === "development"} reloadOnOnline={false}>
      <Tema />
      <Nube />
      {children}
    </SerwistProvider>
  );
}
