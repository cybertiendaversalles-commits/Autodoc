// ══════════════════════════════════════════════════════════════════════════
//  SharedComponents.jsx  —  Utilidades y componentes compartidos
//  AutoDoc · Colombia · Cali
//
//  CONTIENE:
//  ✅ Constantes de estilo (MESES, colores)
//  ✅ Helpers de formato (UC, fCC, iso, fTs, fMoney, fm)
//  ✅ Storage helpers (stG, stS)
//  ✅ Exportadores (ldSc, expWord, expFromEl)
//  ✅ Llamadas a la API de IA (callAI, SYS_DOC, SYS_CV_JSON, SYS_SUGG)
//  ✅ Modal WAModal
//  ✅ Modal HistModal
//  ✅ Modal EjemploModal
//  ✅ CSS global (inyección automática)
//  ✅ EJEMPLO_DATA (datos de muestra por categoría)
//
//  USO EN OTROS MÓDULOS:
//  import {
//    MO, UC, fCC, iso, fTs, fMoney, fm,
//    stG, stS,
//    ldSc, expWord, expFromEl,
//    callAI, SYS_DOC, SYS_CV_JSON, SYS_SUGG,
//    WAModal, HistModal, EjemploModal,
//    EJEMPLO_DATA,
//  } from "./SharedComponents";
// ══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";

/* ─── CSS GLOBAL ─────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
*{font-family:'Plus Jakarta Sans',sans-serif!important;box-sizing:border-box}
#DOC,#DOC *{font-family:Arial,sans-serif!important}
#CV-RENDER,#CV-RENDER *{font-family:inherit!important}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.step-in{animation:fadeIn .25s ease}
.slide-in{animation:slideRight .25s ease}
@media print{body *{visibility:hidden!important}#DOC,#DOC *{visibility:visible!important}#DOC{position:fixed!important;top:0!important;left:0!important;width:100%!important;padding:2cm 2.5cm!important}@page{margin:2cm 2.5cm;size:letter}}`;

if (typeof document !== "undefined" && !document.getElementById("ad-css15")) {
  const s = document.createElement("style");
  s.id = "ad-css15";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTES
══════════════════════════════════════════════════════════════════════════ */
export const MO = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS DE FORMATO
══════════════════════════════════════════════════════════════════════════ */

/** Convierte string a mayúsculas */
export const UC = s => (s || "").toUpperCase();

/** Formatea cédula colombiana con puntos: 1.234.567.890 */
export const fCC = r => {
  const d = (r || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.slice(0, -3) + "." + d.slice(-3);
  if (d.length <= 9) return d.slice(0, -6) + "." + d.slice(-6, -3) + "." + d.slice(-3);
  return d.slice(0, -9) + "." + d.slice(-9, -6) + "." + d.slice(-6, -3) + "." + d.slice(-3);
};

/** Fecha ISO actual: YYYY-MM-DD */
export const iso = () => new Date().toISOString().split("T")[0];

/** Formatea timestamp a DD/MM/YYYY HH:MM */
export const fTs = ts => {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

/** Formatea número como dinero colombiano: 1.800.000 */
export const fMoney = v => {
  const n = (v || "").toString().replace(/\D/g, "");
  if (!n) return "";
  return parseInt(n, 10).toLocaleString("es-CO");
};

/** Alias de fMoney (compatibilidad con VehiculoModule) */
export const fm = v => {
  const n = (v || "").toString().replace(/\D/g, "");
  return n ? parseInt(n, 10).toLocaleString("es-CO") : "";
};

/** Objeto con día, mes y año de hoy */
export const hoy = () => {
  const d = new Date();
  return { dia: String(d.getDate()), mes: MO[d.getMonth()], anio: String(d.getFullYear()) };
};

/* ══════════════════════════════════════════════════════════════════════════
   STORAGE HELPERS (window.storage)
══════════════════════════════════════════════════════════════════════════ */

/** Lee un valor del storage, retorna `defaultVal` si no existe */
export const stG = async (k, defaultVal) => {
  try {
    const r = await window.storage.get(k);
    return r ? JSON.parse(r.value) : defaultVal;
  } catch {
    return defaultVal;
  }
};

/** Guarda un valor en el storage */
export const stS = async (k, v) => {
  try {
    await window.storage.set(k, JSON.stringify(v));
  } catch {}
};

/* ══════════════════════════════════════════════════════════════════════════
   EXPORTADORES DE ARCHIVOS
══════════════════════════════════════════════════════════════════════════ */

/** Carga un script externo dinámicamente (singleton) */
export const ldSc = src => new Promise((res, rej) => {
  if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
  const s = document.createElement("script");
  s.src = src; s.onload = res; s.onerror = rej;
  document.head.appendChild(s);
});

/** Exporta texto plano a archivo .docx */
export const expWord = async (text, fn) => {
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: text.split("\n").map(l => {
        const up = l === l.toUpperCase() && l.trim().length > 3 && l.trim().length < 60 && !l.includes("_");
        return new Paragraph({
          alignment: up ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          spacing: { line: 320, before: up ? 100 : 0, after: 40 },
          children: [new TextRun({ text: l, font: "Arial", size: up ? 26 : 24, bold: up })],
        });
      }),
    }],
  });
  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fn;
  a.click();
};

/** Exporta un elemento HTML a PDF o PNG */
export const expFromEl = async (id, fn, type = "pdf") => {
  await ldSc("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  const el = document.getElementById(id);
  if (!el) throw new Error("Elemento no encontrado: " + id);
  const cv = await window.html2canvas(el, {
    scale: 2, backgroundColor: "#fff", useCORS: true, allowTaint: true, logging: false,
  });
  if (type === "png") {
    const a = document.createElement("a"); a.download = fn; a.href = cv.toDataURL("image/png"); a.click(); return;
  }
  await ldSc("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const iw = cv.width / 2; const ih = cv.height / 2;
  const ratio = Math.min((pw - 20) / iw, (ph - 20) / ih);
  const fw = iw * ratio; const fh = ih * ratio;
  const x = (pw - fw) / 2; const y = (ph - fh) / 2;
  pdf.addImage(cv.toDataURL("image/jpeg", 0.95), "JPEG", x, y, fw, Math.min(fh, ph - 20));
  pdf.save(fn);
};

/* ══════════════════════════════════════════════════════════════════════════
   LLAMADAS A LA IA (Anthropic API)
══════════════════════════════════════════════════════════════════════════ */

export const SYS_DOC = `Eres AutoDoc, experto en documentos legales colombianos de Cali.
Genera el documento completo en texto plano:

Santiago de Cali, DD de mes de AAAA

SEÑORES
ENTIDAD EN MAYÚSCULAS
CIUDAD

ASUNTO: EN MAYÚSCULAS

Cuerpo formal. NOMBRES en MAYÚSCULAS. Cédulas con puntos.

Cordialmente,


________________________________
NOMBRE EN MAYÚSCULAS
C.C. No. X.XXX.XXX.XXX

Sin emojis. Solo el documento.`;

export const SYS_CV_JSON = `Eres experto en hojas de vida colombianas. Genera JSON completo a partir de los datos. SOLO JSON sin backticks:
{"nombre":"NOMBRE MAYÚSCULAS","cargo_aspirado":"CARGO","cedula":"X.XXX.XXX","fecha_nacimiento":"DD/MM/AAAA","lugar_nacimiento":"Ciudad","edad":"XX años","estado_civil":"Soltero","direccion":"Dirección","barrio":"Barrio","ciudad":"Cali, Valle","telefono":"3XX-XXX-XXXX","email":"email@email.com","perfil":"Párrafo 3-4 oraciones tercera persona.","formacion":[{"titulo":"TÍTULO","institucion":"Institución","ciudad":"Ciudad","año":"AAAA","tipo":"Técnico"}],"experiencia":[{"cargo":"CARGO","empresa":"EMPRESA","ciudad":"Cali","desde":"MM/AAAA","hasta":"Actual","funciones":["función 1","función 2","función 3"]}],"habilidades":["habilidad 1","habilidad 2","habilidad 3","habilidad 4"],"idiomas":[{"idioma":"Español","nivel":"Nativo"}],"logros":["logro 1"],"referencias":[{"nombre":"NOMBRE","cargo":"Cargo","empresa":"Empresa","telefono":"3XX-XXX-XXXX"}]}`;

export const SYS_SUGG = `Papelería colombiana. SOLO JSON: {"cat":"id","tipo":"nombre","confianza":0-100,"campos":{"nombre":"","cedula":"","destino":"","concepto":""}}
IDs: referencias,poderes,autorizaciones,cuentas,cotizaciones,desistimientos,contratos,acuerdos,compraventa,renuncias,permisos,memorandos,pagares,certificados,solicitudes,peticiones,hojasvida`;

/** Llama a la API de Claude y retorna el texto de la respuesta */
export const callAI = async (sys, msg, max = 1500) => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: max,
      system: sys,
      messages: [{ role: "user", content: msg }],
    }),
  });
  const d = await r.json();
  return d.content?.map(c => c.text || "").join("") || "";
};

/* ══════════════════════════════════════════════════════════════════════════
   DATOS DE EJEMPLO (por categoría)
══════════════════════════════════════════════════════════════════════════ */
export const EJEMPLO_DATA = {
  referencias:    { nombre: "CARLOS ANDRÉS MUÑOZ TORRES",    cedula: "1130654321", destino: "A QUIEN INTERESE",                       concepto: "Ha laborado con responsabilidad durante 3 años.",                    extra: "Cargo: Auxiliar de bodega · Salario: $1.600.000" },
  poderes:        { nombre: "LUZ AMANDA CASTAÑO RÍOS",       cedula: "31987654",   destino: "COLPENSIONES REGIONAL CALI",              concepto: "Otorgo poder para adelantar trámites de pensión de vejez.",           extra: "Apoderada: SANDRA MILENA CASTAÑO RÍOS · CC 31123456" },
  autorizaciones: { nombre: "PEDRO ANTONIO LÓPEZ SALCEDO",   cedula: "16789012",   destino: "TRANSPORTES RÁPIDO S.A.",                 concepto: "Autorizo entrega de paquete con documentos personales.",              extra: "Paquete: Sobre manila" },
  cuentas:        { nombre: "DIANA PAOLA HERRERA OSPINA",    cedula: "1107345678", destino: "CONSTRUCTORA ALTOS DEL VALLE S.A.S.",     concepto: "Servicio de digitación enero.",                                       extra: "Valor: $350.000" },
  cotizaciones:   { nombre: "CARLOS ANDRES FERNANDEZ",       cedula: "94321012",   destino: "PROPIEDAD HORIZONTAL LOS PINOS",          concepto: "Mantenimiento áreas comunes.",                                        extra: "Valor: $2.800.000" },
  desistimientos: { nombre: "JUAN PABLO QUINTERO MENA",      cedula: "1130987651", destino: "JUZGADO PROMISCUO MUNICIPAL",             concepto: "Acta de desistimiento accidente de tránsito.",                        extra: "Vehículo 1: Toyota ABC-123 · Vehículo 2: Renault XYZ-789" },
  contratos:      { nombre: "MARTHA CECILIA VARGAS PINTO",   cedula: "66812345",   destino: "ARRENDATARIO: JOSE LUIS GARCIA MEJIA",   concepto: "Arrendamiento vivienda urbana Ciudad Jardín.",                        extra: "Canon: $950.000/mes · 12 meses" },
  acuerdos:       { nombre: "ADRIANA ISABEL ZAPATA CÓRDOBA", cedula: "43876543",   destino: "BANCOLOMBIA S.A.",                        concepto: "Acuerdo de pago en 6 cuotas.",                                        extra: "Deuda: $3.500.000 · Cuota: $583.334" },
  compraventa:    { nombre: "ROBERTO CARLOS SALAZAR MENA",   cedula: "94012345",   destino: "HENRY MAURICIO RESTREPO CANO",            concepto: "Compraventa vehículo automotor.",                                      extra: "Chevrolet Spark 2018 · Placa DLM-456 · $18.000.000" },
  renuncias:      { nombre: "GLORIA ESPERANZA PATIÑO RÍOS",  cedula: "34765432",   destino: "GERENCIA SUPERMERCADO LA COSECHA S.A.",  concepto: "Renuncia voluntaria al cargo de Cajera.",                             extra: "2 años 3 meses laborados" },
  permisos:       { nombre: "JHON ALEXANDER RIVAS MORALES",  cedula: "1130543210", destino: "JEFE DE RECURSOS HUMANOS",               concepto: "Permiso para cita médica.",                                           extra: "Viernes 3 horas · Cargo: Operario" },
  memorandos:     { nombre: "COORDINACIÓN RECURSOS HUMANOS", cedula: "",           destino: "WILSON ARLEY GUTIERREZ MESA",            concepto: "Llamado de atención por tardanzas.",                                   extra: "Fechas: 8, 15 y 22 de enero" },
  pagares:        { nombre: "BLANCA NUBIA MOSQUERA SINISTERRA", cedula: "66987654",destino: "INVERSIONES CALI LTDA.",                 concepto: "Promesa de pago por préstamo.",                                        extra: "Valor: $2.000.000 · 6 meses" },
  certificados:   { nombre: "EDILBERTO ANTONIO CAICEDO LEMOS",  cedula: "14987321",destino: "A QUIEN INTERESE",                       concepto: "Certifica residencia barrio Normandía.",                               extra: "Calle 23 # 45-67" },
  solicitudes:    { nombre: "VIVIANA MARCELA TORRES ECHEVERRI",  cedula: "1107654321", destino: "GERENCIA TALENTO HUMANO",            concepto: "Solicitud de empleo Auxiliar Administrativo.",                         extra: "3 años experiencia" },
  peticiones:     { nombre: "NANCY LORENA CIFUENTES DURÁN",  cedula: "38765432",   destino: "DIRECCIÓN TERRITORIAL EPS SURA",         concepto: "Autorización procedimiento quirúrgico.",                               extra: "HC-2024-0045678" },
};

/* ══════════════════════════════════════════════════════════════════════════
   MODAL: WHATSAPP
══════════════════════════════════════════════════════════════════════════ */
export function WAModal({ text, onClose }) {
  const [num, setNum] = useState("");
  const cl = num.replace(/\D/g, "");
  const ok = cl.length >= 10;

  const send = () => {
    if (!ok) return;
    const f = cl.startsWith("57") ? cl : "57" + cl;
    window.open(`https://wa.me/${f}?text=${encodeURIComponent((text || "").slice(0, 4000))}`, "_blank");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:18, padding:32, width:380, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>📲</div>
        <div style={{ fontWeight:900, fontSize:16, marginBottom:4 }}>Enviar por WhatsApp</div>
        <div style={{ fontSize:12, color:"#64748B", marginBottom:18 }}>Número del cliente</div>
        <input
          type="tel" value={num} onChange={e => setNum(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="3XX XXX XXXX" autoFocus
          style={{ width:"100%", padding:"12px 14px", border:`2px solid ${ok?"#22C55E":"#E2E8F0"}`, borderRadius:10, fontSize:16, outline:"none", marginBottom:8, boxSizing:"border-box" }}
        />
        {ok && <div style={{ fontSize:11, color:"#16A34A", marginBottom:12, fontWeight:600 }}>✅ +57 {cl}</div>}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={send} disabled={!ok}
            style={{ flex:1, padding:"12px", background:ok?"linear-gradient(135deg,#16A34A,#22C55E)":"#D1FAE5", color:ok?"white":"#86EFAC", border:"none", borderRadius:10, fontWeight:900, fontSize:14, cursor:ok?"pointer":"default" }}>
            📲 Abrir WhatsApp
          </button>
          <button onClick={onClose}
            style={{ padding:"12px 18px", background:"#F1F5F9", color:"#475569", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer" }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODAL: HISTORIAL
══════════════════════════════════════════════════════════════════════════ */
export function HistModal({ onClose, onReopen }) {
  const [hist, setHist]   = useState([]);
  const [q, setQ]         = useState("");
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    stG("ad:hist:v1", []).then(setHist);
    stG("ad:stats:v1", { total: 0 }).then(setStats);
  }, []);

  const fil = hist.filter(h => !q || (h.label + h.nombre).toLowerCase().includes(q.toLowerCase()));

const clr = async () => {
  // eslint-disable-next-line no-restricted-globals
  if (!confirm("¿Borrar historial?")) return;
    await stS("ad:hist:v1", []); await stS("ad:stats:v1", { total: 0 });
  setHist([]); setStats({ total: 0 });
};

    return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:18, width:660, maxWidth:"95vw", maxHeight:"85vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,.22)" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px 14px", borderBottom:"2px solid #F1F5F9", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:26 }}>📂</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:900, fontSize:16 }}>Historial</div>
            <div style={{ fontSize:11, color:"#64748B" }}>{stats.total || 0} documentos generados</div>
          </div>
          {hist.length > 0 && (
            <button onClick={clr}
              style={{ padding:"5px 11px", background:"#FEF2F2", color:"#DC2626", border:"1.5px solid #FECACA", borderRadius:7, fontWeight:700, fontSize:11, cursor:"pointer" }}>
              🗑️ Borrar todo
            </button>
          )}
          <button onClick={onClose}
            style={{ padding:"6px 14px", background:"#F1F5F9", color:"#475569", border:"none", borderRadius:9, fontWeight:700, cursor:"pointer" }}>
            ✕
          </button>
        </div>

        {/* Buscador */}
        <div style={{ padding:"12px 24px 0" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Buscar documento o nombre..."
            style={{ width:"100%", padding:"9px 13px", border:"2px solid #E2E8F0", borderRadius:9, fontSize:13, outline:"none", boxSizing:"border-box" }} />
        </div>

        {/* Lista */}
        <div style={{ flex:1, overflowY:"auto", padding:"12px 24px 20px" }}>
          {fil.length === 0
            ? <div style={{ textAlign:"center", padding:"40px", color:"#94A3B8", fontSize:13 }}>
                {hist.length === 0 ? "El historial aparece al generar documentos" : "Sin resultados para esa búsqueda"}
              </div>
            : fil.map((h, i) => (
              <div key={i} style={{ background:"#F8FAFF", border:"1.5px solid #BFDBFE", borderRadius:11, padding:"13px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:22 }}>{h.icon || "📄"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#0F172A" }}>{h.nombre}</div>
                  <div style={{ fontSize:11, color:"#2563EB", fontWeight:600 }}>{h.label}</div>
                  <div style={{ fontSize:10, color:"#94A3B8" }}>🕐 {fTs(h.ts)}</div>
                </div>
                <button onClick={() => { onReopen(h); onClose(); }}
                  style={{ padding:"6px 13px", background:"linear-gradient(135deg,#1D4ED8,#3B82F6)", color:"white", border:"none", borderRadius:8, fontWeight:700, fontSize:11, cursor:"pointer" }}>
                  ♻️ Reutilizar
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODAL: EJEMPLO (genera documento de muestra con IA)
══════════════════════════════════════════════════════════════════════════ */
export function EjemploModal({ cat, tipo, onClose }) {
  const [text, setDocText]  = useState("");
  const [loading, setLoading] = useState(true);
  const [expState, setExpState] = useState({ p: false });
  const [showWA, setShowWA]  = useState(false);

  const today = new Date();
  const dia   = String(today.getDate()).padStart(2, "0");
  const mes   = MO[today.getMonth()];
  const anio  = today.getFullYear();

  useEffect(() => {
    const ej = EJEMPLO_DATA[cat?.id] || EJEMPLO_DATA.solicitudes;
    callAI(
      SYS_DOC,
      `Tipo: ${tipo} · Categoría: ${cat?.label}
Ciudad: Cali · Fecha: ${dia} de ${mes} de ${anio}
Nombre: ${ej.nombre} · Cédula: ${fCC(ej.cedula || "")}
Destinatario: ${ej.destino}
Concepto: ${ej.concepto}
Detalles: ${ej.extra}
NOTA: EJEMPLO datos ficticios.`,
      1500
    ).then(t => { setDocText(t); setLoading(false); });
  }, []);

  const fn = ext => `EJEMPLO_${(tipo || "DOC").replace(/\s+/g, "_").toUpperCase()}.${ext}`;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:9998, display:"flex", alignItems:"flex-start", justifyContent:"center", overflowY:"auto", padding:"20px 16px" }}>
      {showWA && <WAModal text={text} onClose={() => setShowWA(false)} />}

      <div style={{ background:"white", borderRadius:18, width:780, maxWidth:"98vw", boxShadow:"0 24px 64px rgba(0,0,0,.28)", marginTop:10, marginBottom:20 }}>

        {/* Header */}
        <div style={{ padding:"14px 20px", borderBottom:"2px solid #F1F5F9", display:"flex", alignItems:"center", gap:10, background:"linear-gradient(135deg,#FEF3C7,#FFFBEB)", borderRadius:"18px 18px 0 0" }}>
          <div style={{ fontSize:26 }}>{cat?.icon || "📄"}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:900, fontSize:14 }}>Vista Previa · Ejemplo</div>
            <div style={{ fontSize:11, color:"#92400E", fontWeight:700 }}>{cat?.label} · {tipo}</div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {!loading && (
              <>
                <button
                  onClick={async () => {
                    setExpState(p => ({ ...p, p: true }));
                    try { await expFromEl("EJ-DOC", fn("pdf"), "pdf"); } catch {}
                    setExpState(p => ({ ...p, p: false }));
                  }}
                  disabled={expState.p}
                  style={{ padding:"6px 11px", background:"#DC2626", color:"white", border:"none", borderRadius:8, fontWeight:800, fontSize:11, cursor:"pointer" }}>
                  {expState.p ? "⏳" : "📕 PDF"}
                </button>
                <button onClick={() => setShowWA(true)}
                  style={{ padding:"6px 11px", background:"#16A34A", color:"white", border:"none", borderRadius:8, fontWeight:800, fontSize:11, cursor:"pointer" }}>
                  📲
                </button>
              </>
            )}
            <button onClick={onClose}
              style={{ padding:"6px 14px", background:"#0F172A", color:"white", border:"none", borderRadius:8, fontWeight:800, fontSize:12, cursor:"pointer" }}>
              ✕
            </button>
          </div>
        </div>

        {/* Aviso */}
        <div style={{ background:"#FEF3C7", padding:"6px 20px", fontSize:11, color:"#92400E", fontWeight:700 }}>
          👁 Datos ficticios · Descarga para ver el formato real
        </div>

        {/* Contenido */}
        <div style={{ padding:"22px 26px" }}>
          {loading
            ? <div style={{ textAlign:"center", padding:"50px" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
                <div style={{ fontWeight:800, color:"#1D4ED8" }}>Generando ejemplo con IA...</div>
              </div>
            : <div id="EJ-DOC" style={{ background:"white", border:"1px solid #E2E8F0", borderRadius:10, padding:"44px 56px", fontFamily:"Arial,sans-serif", fontSize:12.5, lineHeight:1.9, color:"#111", whiteSpace:"pre-wrap", textAlign:"justify" }}>
                {text}
              </div>
          }
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TOAST HELPER — componente de notificación
   Uso: <Toast msg={toast} />  (toast = string | null)
══════════════════════════════════════════════════════════════════════════ */
export function Toast({ msg }) {
  if (!msg) return null;
  const isErr = msg.startsWith("❌");
  return (
    <div style={{
      position:"fixed", top:16, right:16, zIndex:9999,
      padding:"10px 18px", borderRadius:11,
      fontWeight:700, fontSize:12,
      boxShadow:"0 8px 28px rgba(0,0,0,.14)",
      background: isErr ? "#FEF2F2" : "#F0FDF4",
      border: `1.5px solid ${isErr ? "#FECACA" : "#BBF7D0"}`,
      color: isErr ? "#B91C1C" : "#15803D",
    }}>
      {msg}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   useNotify — hook para manejar toasts
   Uso:  const { toast, notify } = useNotify();
══════════════════════════════════════════════════════════════════════════ */
export function useNotify(duration = 3200) {
  const [toast, setToast] = useState(null);
  const notify = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };
  return { toast, notify };
}
