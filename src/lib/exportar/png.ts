/** Exportar la pizarra como PNG 1080 × 1350 (SPEC 6.5): pensado para mandar por WhatsApp. */

export const POSTER = { ancho: 1080, alto: 1350 } as const;

/** Reemplaza cada `var(--x)` por su valor resuelto. Lo que no se resuelve queda como estaba. */
export function resolverVariables(texto: string, valor: (nombre: string) => string): string {
  return texto.replace(/var\(--([a-z0-9-]+)\)/gi, (todo, nombre: string) => valor(`--${nombre}`).trim() || todo);
}

/** Parte el nombre en hasta 3 renglones sin cortar palabras; si no entra, achica la letra. */
export function partirTitulo(nombre: string, maxPorLinea: number): { lineas: string[]; escala: number } {
  for (let escala = 1; escala >= 0.6; escala -= 0.1) {
    const max = Math.floor(maxPorLinea / escala);
    const lineas: string[] = [];
    let actual = "";
    for (const palabra of nombre.trim().split(/\s+/)) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (prueba.length <= max || !actual) actual = prueba;
      else {
        lineas.push(actual);
        actual = palabra;
      }
    }
    if (actual) lineas.push(actual);
    if (lineas.length <= (escala > 0.75 ? 2 : 3)) return { lineas, escala: Math.round(escala * 10) / 10 };
  }
  const max = Math.floor(maxPorLinea / 0.6);
  return { lineas: [nombre.slice(0, max * 3 - 1) + "…"], escala: 0.6 };
}

/** Nombre de archivo legible y sin caracteres raros: "playbook-rondo-3-contra-1.png". */
export function nombreArchivo(nombre: string): string {
  const limpio = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `playbook-${limpio || "ejercicio"}.png`;
}

/** Busca el woff2 de Archivo entre las hojas de estilo cargadas y lo devuelve como data URL. */
export async function fuenteComoDataUrl(): Promise<string | null> {
  let url: string | null = null;
  for (const hoja of Array.from(document.styleSheets)) {
    let reglas: CSSRuleList;
    try {
      reglas = hoja.cssRules;
    } catch {
      continue;
    }
    for (const r of Array.from(reglas)) {
      if (r instanceof CSSFontFaceRule && /archivo/i.test(r.style.getPropertyValue("font-family"))) {
        const m = r.style.getPropertyValue("src").match(/url\(["']?([^"')]+\.woff2)["']?\)/);
        if (m) url = new URL(m[1], hoja.href ?? location.href).href;
      }
    }
  }
  if (!url) return null;
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((ok) => {
      const lector = new FileReader();
      lector.onload = () => ok(String(lector.result).replace(/^data:[^;]*;/, "data:font/woff2;"));
      lector.onerror = () => ok(null);
      lector.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Pasa el póster (un `<svg>` montado en la página) a PNG: resuelve las variables CSS
 * contra el propio nodo, incrusta la fuente y lo dibuja en un canvas de 1080 × 1350.
 */
export async function svgAPng(svg: SVGSVGElement): Promise<Blob> {
  const estilos = getComputedStyle(svg);
  const fuente = await fuenteComoDataUrl();
  const copia = svg.cloneNode(true) as SVGSVGElement;
  copia.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copia.setAttribute("width", String(POSTER.ancho));
  copia.setAttribute("height", String(POSTER.alto));
  if (fuente) {
    const estilo = document.createElementNS("http://www.w3.org/2000/svg", "style");
    estilo.textContent = `@font-face{font-family:"PB Archivo";src:url(${fuente}) format("woff2");font-weight:100 900;font-stretch:62% 125%;}`;
    copia.insertBefore(estilo, copia.firstChild);
  }
  // Los valores van dentro de atributos: se escapan para no romper el XML (las familias tipográficas traen comillas).
  const escapar = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const texto = resolverVariables(new XMLSerializer().serializeToString(copia), (n) => escapar(estilos.getPropertyValue(n)));
  const url = URL.createObjectURL(new Blob([texto], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = POSTER.ancho;
    canvas.height = POSTER.alto;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, POSTER.ancho, POSTER.alto);
    return await new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo generar el PNG"))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** En el celu abre el menú de compartir (WhatsApp); si no se puede, lo descarga. */
export async function compartirODescargar(png: Blob, nombre: string, titulo: string): Promise<"compartido" | "descargado" | "cancelado"> {
  const archivo = new File([png], nombreArchivo(nombre), { type: "image/png" });
  const tactil = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  if (tactil && navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: titulo });
      return "compartido";
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return "cancelado";
    }
  }
  const url = URL.createObjectURL(png);
  const a = document.createElement("a");
  a.href = url;
  a.download = archivo.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "descargado";
}
