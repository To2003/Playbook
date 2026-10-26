import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlaybookDB } from "@/lib/db";
import { leerContadores, sumarContador } from "@/lib/feedback/contadores";
import { enviarFeedback, vaciarCola, type Deps } from "@/lib/feedback/envio";
import { armarCuerpo, faltantes, leerConfig, respuestaVacia, resumirUA, textoFeedback, type Entries, type Respuesta, type Tecnico } from "@/lib/feedback/modelo";

const URL_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSprueba/formResponse";
const ENTRIES: Entries = {
  categorias: "entry.101",
  usos: "entry.102",
  tal_cual: "entry.103",
  ejercicio_malo: "entry.104",
  ejercicio: "entry.105",
  falto: "entry.106",
  seguiria: "entry.107",
  por_que: "entry.108",
  contacto: "entry.109",
  calificacion: "entry.110",
  origen: "entry.111",
  version: "entry.112",
  dispositivo: "entry.113",
  pwa: "entry.114",
  sesiones: "entry.115",
  cancha: "entry.116",
  propios: "entry.117",
  info: "entry.118",
};
const TECNICO: Tecnico = { version: "71542f9", dispositivo: "Android · Chrome 141", pwa: true, sesiones: 7, cancha: 3, propios: 2 };
const completa = (): Respuesta => ({
  ...respuestaVacia("inicio"),
  categorias: ["Juveniles", "Mayores"],
  usos: "2–3",
  talCual: 4,
  ejercicioMalo: "  No se entiende quién rota  ",
  ejercicioId: "rondo-3-contra-1",
  falto: "Ejercicios de córner",
  seguiria: "Sí",
  porQue: "Me ahorra tiempo",
  contacto: "Caro, Club Atlético",
});

const bases: PlaybookDB[] = [];
const nuevaBase = () => {
  const b = new PlaybookDB(`feedback-${Math.random()}`);
  bases.push(b);
  return b;
};
afterEach(async () => {
  await Promise.all(bases.splice(0).map((b) => b.delete()));
});
const deps = (base: PlaybookDB, extra: Partial<Deps> = {}): Deps => ({
  base,
  fetch: vi.fn(async () => new Response(null)) as unknown as typeof fetch,
  online: () => true,
  abrir: vi.fn(),
  copiar: vi.fn(async () => {}),
  ...extra,
});

describe("feedback: armado del body", () => {
  it("cada campo va con su entry, recortado, y los vacíos no viajan", () => {
    const r = { ...completa(), falto: "", contacto: "" };
    const cuerpo = armarCuerpo(r, TECNICO, ENTRIES, "Rondo 3 contra 1");
    // Casillas: un parámetro por categoría marcada.
    expect(cuerpo.getAll("entry.101")).toEqual(["Juveniles", "Mayores"]);
    expect(cuerpo.get("entry.102")).toBe("2–3");
    // Escala lineal: solo el número.
    expect(cuerpo.get("entry.103")).toBe("4");
    expect(cuerpo.get("entry.104")).toBe("No se entiende quién rota");
    expect(cuerpo.get("entry.105")).toBe("Rondo 3 contra 1 (rondo-3-contra-1)");
    expect(cuerpo.get("entry.107")).toBe("Sí");
    expect(cuerpo.get("entry.111")).toBe("inicio");
    expect(cuerpo.get("entry.112")).toBe("71542f9");
    expect(cuerpo.get("entry.114")).toBe("Sí");
    expect(cuerpo.get("entry.115")).toBe("7");
    expect(cuerpo.has("entry.106")).toBe(false);
    expect(cuerpo.has("entry.109")).toBe(false);
    expect(cuerpo.has("entry.110")).toBe(false);
  });

  it("info junta origen, calificación del cierre e info técnica en un solo texto", () => {
    const cuerpo = armarCuerpo({ ...respuestaVacia("cierre"), calificacion: 4 }, TECNICO, ENTRIES);
    expect(cuerpo.get("entry.118")).toBe("Desde: cierre · Calificación de la sesión: 4/5 · v71542f9 · Android · Chrome 141 · instalada · 7 sesiones · 3 veces en modo cancha · 2 ejercicios propios");
  });

  it("con el Form de la beta (10 preguntas) cada respuesta cae en su pregunta", () => {
    const formBeta: Entries = {
      categorias: "entry.614718372",
      usos: "entry.1833832473",
      tal_cual: "entry.488569987",
      ejercicio_malo: "entry.789987621",
      ejercicio: "entry.263847174",
      falto: "entry.478530584",
      seguiria: "entry.461666061",
      por_que: "entry.2060276923",
      contacto: "entry.172308889",
      info: "entry.420581240",
    };
    const cuerpo = armarCuerpo(completa(), TECNICO, formBeta, "Rondo 3 contra 1");
    expect(cuerpo.toString()).toBe(
      [
        "entry.614718372=Juveniles",
        "entry.614718372=Mayores",
        "entry.1833832473=2%E2%80%933",
        "entry.488569987=4",
        "entry.789987621=No+se+entiende+qui%C3%A9n+rota",
        "entry.263847174=Rondo+3+contra+1+%28rondo-3-contra-1%29",
        "entry.478530584=Ejercicios+de+c%C3%B3rner",
        "entry.461666061=S%C3%AD",
        "entry.2060276923=Me+ahorra+tiempo",
        "entry.172308889=Caro%2C+Club+Atl%C3%A9tico",
        `entry.420581240=${new URLSearchParams({ x: "Desde: inicio · v71542f9 · Android · Chrome 141 · instalada · 7 sesiones · 3 veces en modo cancha · 2 ejercicios propios" }).toString().slice(2)}`,
      ].join("&"),
    );
  });

  it("un campo sin entry configurado no se manda", () => {
    const cuerpo = armarCuerpo(completa(), TECNICO, { usos: "entry.9" });
    expect([...cuerpo.keys()]).toEqual(["entry.9"]);
  });

  it("la calificación rápida del cierre viaja sola, sin las obligatorias", () => {
    const cuerpo = armarCuerpo({ ...respuestaVacia("cierre"), calificacion: 5 }, TECNICO, ENTRIES);
    expect(cuerpo.get("entry.110")).toBe("5");
    expect(cuerpo.get("entry.111")).toBe("cierre");
    expect(cuerpo.has("entry.101")).toBe(false);
  });

  it("marca las obligatorias que faltan, en orden", () => {
    expect(faltantes(respuestaVacia("inicio"))).toEqual(["categorias", "usos", "tal_cual", "seguiria"]);
    expect(faltantes(completa())).toEqual([]);
  });

  it("la configuración se valida: URL que termina en /formResponse y JSON con entry.N", () => {
    expect(leerConfig({ url: URL_FORM, entries: JSON.stringify(ENTRIES) }).form?.url).toBe(URL_FORM);
    expect(leerConfig({ url: "https://docs.google.com/forms/d/e/x/viewform", entries: JSON.stringify(ENTRIES) }).form).toBeUndefined();
    expect(leerConfig({ url: URL_FORM, entries: "{roto" }).form).toBeUndefined();
    expect(leerConfig({ whatsapp: "+54 9 11 5555-0000" }).whatsapp).toBe("5491155550000");
  });

  it("resume el user agent sin el resto", () => {
    expect(resumirUA("Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36")).toBe("Android · Chrome 141");
    expect(resumirUA("Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1")).toBe("iPhone · Safari 18");
    expect(resumirUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0")).toBe("Windows · Firefox 132");
  });
});

describe("feedback: envío y cola offline", () => {
  it("con señal hace POST no-cors al Form y cuenta como enviado", async () => {
    const base = nuevaBase();
    const d = deps(base);
    const r = await enviarFeedback(completa(), TECNICO, { form: { url: URL_FORM, entries: ENTRIES } }, d);
    expect(r).toBe("enviado");
    const [url, init] = (d.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(URL_FORM);
    expect(init).toMatchObject({ method: "POST", mode: "no-cors" });
    expect(new URLSearchParams(init.body).get("entry.107")).toBe("Sí");
    expect(await base.feedback.count()).toBe(0);
  });

  it("sin señal la guarda en la cola, y al volver la manda y la vacía", async () => {
    const base = nuevaBase();
    let online = false;
    const d = deps(base, { online: () => online });
    expect(await enviarFeedback(completa(), TECNICO, { form: { url: URL_FORM, entries: ENTRIES } }, d)).toBe("pendiente");
    expect(await enviarFeedback({ ...respuestaVacia("cierre"), calificacion: 3 }, TECNICO, { form: { url: URL_FORM, entries: ENTRIES } }, d)).toBe("pendiente");
    expect(await base.feedback.count()).toBe(2);
    expect(d.fetch).not.toHaveBeenCalled();

    expect(await vaciarCola(base, d.fetch, () => online)).toBe(0);
    online = true;
    expect(await vaciarCola(base, d.fetch, () => online)).toBe(2);
    expect(await base.feedback.count()).toBe(0);
    const cuerpos = (d.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map((c) => new URLSearchParams(c[1].body));
    expect(cuerpos[0].get("entry.111")).toBe("inicio");
    expect(cuerpos[1].get("entry.110")).toBe("3");
  });

  it("si el fetch falla, queda en la cola; un reintento que falla a la mitad no pierde nada", async () => {
    const base = nuevaBase();
    const caido = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const d = deps(base, { fetch: caido });
    expect(await enviarFeedback(completa(), TECNICO, { form: { url: URL_FORM, entries: ENTRIES } }, d)).toBe("pendiente");
    await enviarFeedback(completa(), TECNICO, { form: { url: URL_FORM, entries: ENTRIES } }, d);
    let llamadas = 0;
    const unaYCae = vi.fn(async () => {
      if (++llamadas > 1) throw new TypeError("Failed to fetch");
      return new Response(null);
    }) as unknown as typeof fetch;
    expect(await vaciarCola(base, unaYCae, () => true)).toBe(1);
    expect(await base.feedback.count()).toBe(1);
  });
});

describe("feedback: sin Google Form", () => {
  it("abre WhatsApp con las respuestas en texto", async () => {
    const base = nuevaBase();
    const d = deps(base);
    expect(await enviarFeedback(completa(), TECNICO, { whatsapp: "5491155550000" }, d, "Rondo 3 contra 1")).toBe("whatsapp");
    const url = (d.abrir as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url.startsWith("https://wa.me/5491155550000?text=")).toBe(true);
    const texto = decodeURIComponent(url.split("text=")[1]);
    expect(texto).toContain("¿La usaría tal cual? (1 a 5): 4 · Casi tal cual");
    expect(texto).toContain("Ejercicio flojo: Rondo 3 contra 1 (rondo-3-contra-1)");
    expect(texto).toContain("Info técnica: v71542f9");
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it("sin WhatsApp copia el texto; si no se puede copiar, avisa para hacerlo a mano", async () => {
    const base = nuevaBase();
    const d = deps(base);
    expect(await enviarFeedback(completa(), TECNICO, {}, d)).toBe("copiado");
    expect((d.copiar as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(textoFeedback(completa(), TECNICO));
    const sinPortapapeles = deps(base, {
      copiar: async () => {
        throw new Error("denegado");
      },
    });
    expect(await enviarFeedback(completa(), TECNICO, {}, sinPortapapeles)).toBe("manual");
  });
});

describe("feedback: contadores de uso", () => {
  it("arrancan en cero y suman de a uno, por separado", async () => {
    const base = nuevaBase();
    expect(await leerContadores(base)).toEqual({ sesiones: 0, cancha: 0, propios: 0 });
    await sumarContador(base, "sesiones");
    await sumarContador(base, "sesiones");
    await sumarContador(base, "cancha");
    await Promise.all([sumarContador(base, "propios"), sumarContador(base, "propios"), sumarContador(base, "propios")]);
    expect(await leerContadores(base)).toEqual({ sesiones: 2, cancha: 1, propios: 3 });
  });
});

describe("feedback: textos", () => {
  it("los contadores van en singular cuando es uno", () => {
    const uno: Tecnico = { ...TECNICO, sesiones: 1, cancha: 1, propios: 1 };
    const cuerpo = armarCuerpo(respuestaVacia("inicio"), uno, ENTRIES);
    expect(cuerpo.get("entry.118")).toContain("1 sesión · 1 vez en modo cancha · 1 ejercicio propio");
    expect(textoFeedback(respuestaVacia("inicio"), uno)).toContain("1 sesión · 1 vez en modo cancha · 1 ejercicio propio");
  });
});
