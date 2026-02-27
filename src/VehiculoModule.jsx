// ══════════════════════════════════════════════════════════════════════════
//  VehiculoModule.jsx  —  Módulo: TRASPASO Y COMPRAVENTA DE VEHÍCULO
//  AutoDoc v15 · Colombia · Cali
//
//  INTEGRACIÓN EN AutoDoc_v15.jsx:
//  1) Añade al inicio:   import { VehiculoWizard, VehiculoPreview } from "./VehiculoModule";
//  2) Añade state:       const [vehDocs, setVehDocs] = useState(null);
//  3) Añade al return, ANTES del bloque de HOME:
//
//     if(view==="vehiculo-wizard") return <VehiculoWizard
//       onBack={()=>setView(selCat?"cat":"home")}
//       onDone={async docs=>{
//         setVehDocs(docs);
//         setView("vehiculo-preview");
//         const entry={label:"🚗 Traspaso/Compraventa Vehículo",nombre:docs.masterData.vehiculo_placa||"—",icon:"🚗",ts:Date.now()};
//         const h=await stG("ad:hist:v1",[]);h.unshift(entry);await stS("ad:hist:v1",h.slice(0,50));
//         const s=await stG("ad:stats:v1",{total:0});s.total=(s.total||0)+1;await stS("ad:stats:v1",s);setStats(s);
//         stG("ad:hist:v1",[]).then(x=>setRecent(x.slice(0,3)));
//         notify("✅ Documentos del trámite generados");
//       }}
//       notify={notify}/>;
//
//     if(view==="vehiculo-preview"&&vehDocs) return <VehiculoPreview
//       docs={vehDocs} onBack={()=>setView("vehiculo-wizard")} onNew={resetAll} notify={notify}/>;
//
//  4) En la sección CATEGORÍA (view==="cat"), dentro del botón "Crear →",
//     detecta el tipo "Vehículo automotor" y redirige:
//     onClick={()=>{setSelTipo(tipo); if(selCat.id==="compraventa"&&tipo==="Vehículo automotor")
//       setView("vehiculo-wizard"); else setView("gen");}}
//
//  5) (Opcional) Añade el banner en HOME igual que el de Promesa de Compraventa
// ══════════════════════════════════════════════════════════════════════════

import { useState } from "react";

/* ─── COLORES ────────────────────────────────────────────────────────────── */
const CV  = "#7C2D12";
const CV2 = "#C2410C";
const CVG = "#FDF6F0";

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const MOS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
             "septiembre","octubre","noviembre","diciembre"];
const u  = s => (s || "").toUpperCase();
const cc = r => {
  const d = (r || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.slice(0,-3)+"."+d.slice(-3);
  if (d.length <= 9) return d.slice(0,-6)+"."+d.slice(-6,-3)+"."+d.slice(-3);
  return d.slice(0,-9)+"."+d.slice(-9,-6)+"."+d.slice(-6,-3)+"."+d.slice(-3);
};
const fm = v => {
  const n = (v || "").toString().replace(/\D/g, "");
  return n ? parseInt(n, 10).toLocaleString("es-CO") : "";
};
const hoy = () => {
  const d = new Date();
  return { dia: String(d.getDate()), mes: MOS[d.getMonth()], anio: String(d.getFullYear()) };
};
const iso = () => new Date().toISOString().split("T")[0];

/* ─── EXPORTADORES (standalone, no depende de AutoDoc) ──────────────────── */
const ldSc = src => new Promise((res, rej) => {
  if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
  const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej;
  document.head.appendChild(s);
});

export const vhExpPDF = async (id, fn) => {
  await ldSc("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await ldSc("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const el = document.getElementById(id);
  if (!el) throw new Error("Elemento no encontrado: " + id);
  const cv = await window.html2canvas(el, { scale: 2, backgroundColor: "#fff", useCORS: true, logging: false });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
  const ratio = Math.min((pw - 20) / (cv.width / 2), (ph - 20) / (cv.height / 2));
  const fw = (cv.width / 2) * ratio, fh = (cv.height / 2) * ratio;
  pdf.addImage(cv.toDataURL("image/jpeg", .95), "JPEG", (pw-fw)/2, (ph-fh)/2, fw, Math.min(fh, ph-20));
  pdf.save(fn);
};

export const vhExpWord = async (text, fn) => {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("https://cdn.skypack.dev/docx@8.5.0");
  const doc = new Document({
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: text.split("\n").map(l => {
        const up = l === l.toUpperCase() && l.trim().length > 3 && l.trim().length < 60 && !l.includes("_");
        return new Paragraph({
          alignment: up ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          spacing: { line: 320, before: up ? 100 : 0, after: 40 },
          children: [new TextRun({ text: l, font: "Arial", size: up ? 26 : 24, bold: up })]
        });
      })
    }]
  });
  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fn; a.click();
};

/* ══════════════════════════════════════════════════════════════════════════
   PLANTILLAS DE DOCUMENTOS (texto legal exacto de los PDFs)
══════════════════════════════════════════════════════════════════════════ */

export const buildCompraventa = d => `CONTRATO DE COMPRAVENTA DE VEHÍCULO AUTOMOTOR

El señor(a) ${u(d.vendedor_nombre)||"___________________________"} mayor de edad y vecino de la ciudad de ${u(d.vendedor_ciudad)||"____________"}, identificado con cédula de ciudadanía No. ${cc(d.vendedor_cedula)||"________________"}, quien en adelante se denominará EL VENDEDOR, y el señor(a) ${u(d.comprador_nombre)||"____________________________"}, mayor de edad y vecino de la ciudad de ${u(d.comprador_ciudad)||"____________"} quien se identifica con cédula de ciudadanía No. ${cc(d.comprador_cedula)||"________________"} y en adelante se denominará EL COMPRADOR, hemos acordado celebrar contrato de compraventa que se regirá por las normas civiles y comerciales que regulan la materia, según las siguientes cláusulas:

Primera. Objeto: EL VENDEDOR transfiere a EL COMPRADOR la propiedad del vehículo que a continuación se identifica:
Placa: ${d.vehiculo_placa||"______"}  Marca: ${u(d.vehiculo_marca)||"____________"}  Línea: ${u(d.vehiculo_linea)||"_____________"}
Clase: ${u(d.vehiculo_clase)||"_______________"}  Modelo: ${d.vehiculo_modelo||"______"}  Color: ${u(d.vehiculo_colores)||"_______________"}
Motor No.: ${u(d.vehiculo_motor)||"__________________"}  Chasis No.: ${u(d.vehiculo_chasis)||"_______________________"}

Segunda. Precio: Las partes pactan la suma de ${d.cv_precio_letras||"_________________________________________"} pesos Mcte. ($${fm(d.cv_precio)||"_______________"}).

Tercera. Forma de pago: EL COMPRADOR paga el precio a que se refiere la cláusula anterior en la siguiente forma: ${d.cv_forma_pago||"_______________________________________________"}.

Cuarta. Obligaciones de EL VENDEDOR: EL VENDEDOR se obliga a hacer entrega del automotor en buen estado, libre de gravámenes embargos, multas, impuestos, pactos de reserva de dominio y cualquiera otra circunstancia que afecte el libre comercio del bien objeto del presente contrato.

Quinta. Gastos: Los gastos como impuestos, multas y demás que recaigan sobre el vehículo antes de la inscripción del traspaso ante la Oficina de Tránsito corre por cuenta de EL VENDEDOR.

Sexta. Cláusula penal: las partes establecen que quien incumpla cualquiera de las estipulaciones derivadas de este contrato, pagará a la otra como sanción la suma de ${d.cv_penal_letras||"________________________________"} pesos ($${fm(d.cv_penal_valor)||"___________"}).

Séptima. Cláusula Compromisoria: Toda controversia o diferencia relativa a este contrato, su ejecución y liquidación se resolverá por un mecanismo alternativo de justicia como un Tribunal de Arbitramento o un Centro de Arbitraje o Conciliación, si no existe arreglo por este medio, se agotará esta etapa y se podrá acudir a la Justicia Ordinaria.

Se firma en la ciudad de ${u(d.cv_ciudad)||"____________"} a los ${d.cv_dia||"___"} días del mes de ${d.cv_mes||"_______"} del año ${d.cv_anio||"______"}.`;

export const buildMandato = d => `Santiago de Cali, ${d.mandato_dia||"____"} de ${d.mandato_mes||"____________"} de ${d.mandato_anio||"______"}
Señores
Secretaría de Movilidad de Cali
La ciudad

Entre los suscritos; ${u(d.vendedor_nombre)||"___________________________"} mayor de edad, vecino de la ciudad de ${u(d.vendedor_ciudad)||"____________"}, identificado con documento (CC) ${cc(d.vendedor_cedula)||"_____________"}, quien para efectos del presente contrato se denominará EL MANDANTE, y de otro ${u(d.mandatario_nombre)||"___________________________"} también mayor de edad, vecino de esta ciudad, identificado con cédula de ciudadanía No. ${cc(d.mandatario_cedula)||"_____________"}, quien para efectos del presente contrato se denominará EL MANDATARIO, hemos acordado suscribir el siguiente contrato de mandato dando cumplimiento a la Resolución 12379 expedida por el Ministerio de Transporte el 28 de diciembre de 2012 (Art. 5), que se regirá por las normas civiles y comerciales que regulan la materia y las siguientes cláusulas.

PRIMERA: OBJETO DEL CONTRATO. EL MANDATARIO por cuenta y riesgo del MANDANTE queda facultado para solicitar, realizar, radicar y retirar el (los) trámite (s) de ${d.mandato_tramites||"traspaso"} del vehículo de propiedad del MANDANTE identificado con placa ${d.vehiculo_placa||"______"} ante la Secretaría de Movilidad de Cali. Como consecuencia, EL MANDATARIO queda facultado para realizar todas las gestiones propias de este mandato y en especial para representar, notificarse, recibir, impugnar, transigir, desistir, sustituir, reasumir, pedir, conciliar o asumir obligaciones en nombre del MANDANTE.

SEGUNDA: OBLIGACIONES DEL MANDANTE. EL MANDANTE declara que la información contenida en los documentos que se anexan a la solicitud del trámite es veraz y auténtica, razón por la que se hace responsable ante la autoridad competente de cualquier irregularidad que los mismos puedan contener.

Para constancia se firma en la ciudad de ${u(d.mandato_ciudad)||"____________"}, a los ${d.mandato_dia||"___"} días del mes de ${d.mandato_mes||"____________"} del año ${d.mandato_anio||"______"}.

Atentamente;`;

/* ══════════════════════════════════════════════════════════════════════════
   FORMULARIO RUNT — Representación visual del formulario oficial
══════════════════════════════════════════════════════════════════════════ */
function RUNTDoc({ data }) {
  const BX = ({ label, value, style }) => (
    <div style={{ border: "1px solid #333", padding: "3px 6px", ...style }}>
      <div style={{ fontSize: 6.5, color: "#444", textTransform: "uppercase", letterSpacing: .3, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 9, fontWeight: 700, minHeight: 11, letterSpacing: .5 }}>{value || ""}</div>
    </div>
  );
  const DocCheck = ({ label, active }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, fontSize: 7 }}>
      <div style={{ width: 9, height: 9, border: "1px solid #333", flexShrink: 0, background: active ? "#333" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {active && <span style={{ color: "white", fontSize: 7, fontWeight: 900, lineHeight: 1 }}>X</span>}
      </div>
      <span style={{ lineHeight: 1.2 }}>{label}</span>
    </div>
  );

  const placaL = (data.vehiculo_placa || "").slice(0, 3).toUpperCase();
  const placaN = (data.vehiculo_placa || "").slice(3);
  const comb = u(data.vehiculo_combustible || "");
  const serv = u(data.vehiculo_servicio || "PARTICULAR");

  return (
    <div id="VHCL-RUNT" style={{
      width: 794, background: "white", fontFamily: "Arial, sans-serif",
      fontSize: 9, padding: "14px 16px", color: "#000", lineHeight: 1.3
    }}>
      {/* Encabezado */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: .5, marginBottom: 1 }}>MINISTERIO DE TRANSPORTE</div>
        <div style={{ fontWeight: 700, fontSize: 8.5, letterSpacing: .2 }}>
          FORMULARIO DE SOLICITUD DE TRÁMITES DEL REGISTRO NACIONAL AUTOMOTOR
        </div>
      </div>
      <div style={{ height: 2, background: "#333", marginBottom: 4 }} />

      {/* Fila 1: Organismo + Placa + Trámite */}
      <div style={{ display: "grid", gridTemplateColumns: "160px 120px 1fr", border: "1px solid #333", marginBottom: 0 }}>
        <BX label="1. Organismo de Tránsito" value="SECRETARÍA DE MOVILIDAD DE CALI" style={{ border: "none", borderRight: "1px solid #333", fontSize: 7 }} />
        <div style={{ borderRight: "1px solid #333", padding: "3px 6px" }}>
          <div style={{ fontSize: 6.5, color: "#444", textTransform: "uppercase", marginBottom: 3 }}>2. Placa</div>
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ flex: 1, borderRight: "1px dashed #aaa", paddingRight: 4 }}>
              <div style={{ fontSize: 6, color: "#888" }}>LETRAS</div>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 3, color: "#000" }}>{placaL}</div>
            </div>
            <div style={{ flex: 1, paddingLeft: 4 }}>
              <div style={{ fontSize: 6, color: "#888" }}>NÚMEROS</div>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 3, color: "#000" }}>{placaN}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "3px 6px" }}>
          <div style={{ fontSize: 6.5, color: "#444", textTransform: "uppercase", marginBottom: 3 }}>3. Trámite Solicitado</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "3px 6px" }}>
            {[
              ["CANCELACIÓN MATRÍCULA", false], ["TRASPASO", true], ["MATRÍCULA/REGISTRO", false],
              ["TRANSLADO MATRÍCULA", false], ["INSCRIPC. PRENDA", false],
              ["CAMBIO DE COLOR", false], ["DUPLICADO PLACAS", false], ["LEVANTA. PRENDA", false],
              ["REMATRÍCULA", false], ["REGRABAR MOTOR", false],
            ].map(([lab, act]) => <DocCheck key={lab} label={lab} active={act} />)}
          </div>
        </div>
      </div>

      {/* Fila 2: Datos técnicos vehículo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 0.8fr", border: "1px solid #333", borderTop: "none" }}>
        <BX label="4. Clase de Vehículo" value={u(data.vehiculo_clase)} style={{ border: "none", borderRight: "1px solid #333" }} />
        <BX label="5. Marca" value={u(data.vehiculo_marca)} style={{ border: "none", borderRight: "1px solid #333" }} />
        <BX label="6. Línea" value={u(data.vehiculo_linea)} style={{ border: "none", borderRight: "1px solid #333" }} />
        <BX label="9. Modelo" value={data.vehiculo_modelo} style={{ border: "none" }} />
      </div>

      {/* Fila 3: Combustible */}
      <div style={{ border: "1px solid #333", borderTop: "none", padding: "3px 6px" }}>
        <div style={{ fontSize: 6.5, color: "#444", textTransform: "uppercase", marginBottom: 3 }}>7. Combustible</div>
        <div style={{ display: "flex", gap: 18 }}>
          {["GASOLINA", "DIESEL", "GAS", "MIXTO", "ELÉCTRICO", "HIDRÓGENO", "ETANOL", "BIODIÉSEL"].map(c => (
            <DocCheck key={c} label={c} active={comb.replace("É","E").replace("Ó","O").includes(c.replace("É","E").replace("Ó","O"))} />
          ))}
        </div>
      </div>

      {/* Fila 4: Colores + Números identificación */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 2fr 1fr 1fr", border: "1px solid #333", borderTop: "none" }}>
        <BX label="8. Colores" value={u(data.vehiculo_colores)} style={{ border: "none", borderRight: "1px solid #333" }} />
        <BX label="No. de Motor" value={u(data.vehiculo_motor)} style={{ border: "none", borderRight: "1px solid #333" }} />
        <BX label="No. de Chasis / Serial" value={u(data.vehiculo_chasis)} style={{ border: "none", borderRight: "1px solid #333" }} />
        <BX label="No. de VIN" value={u(data.vehiculo_vin)} style={{ border: "none", borderRight: "1px solid #333" }} />
        <BX label="10. Cilindrada" value={data.vehiculo_cilindraje} style={{ border: "none" }} />
      </div>

      {/* Fila 5: Capacidad, Blindaje, Potencia, Servicio */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", border: "1px solid #333", borderTop: "none" }}>
        <BX label="11. Capacidad Kg/Psj" value={data.vehiculo_capacidad} style={{ border: "none", borderRight: "1px solid #333" }} />
        <div style={{ border: "none", borderRight: "1px solid #333", padding: "3px 6px" }}>
          <div style={{ fontSize: 6.5, color: "#444", textTransform: "uppercase", marginBottom: 3 }}>12. Blindaje</div>
          <div style={{ display: "flex", gap: 10 }}>
            <DocCheck label="SÍ" active={data.vehiculo_blindaje === "si"} />
            <DocCheck label="NO" active={data.vehiculo_blindaje !== "si"} />
          </div>
        </div>
        <BX label="14. Potencia/HP" value={data.vehiculo_potencia} style={{ border: "none", borderRight: "1px solid #333" }} />
        <div style={{ padding: "3px 6px" }}>
          <div style={{ fontSize: 6.5, color: "#444", textTransform: "uppercase", marginBottom: 3 }}>18. Tipo de Servicio</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["PARTICULAR", "PÚBLICO", "DIPLOMÁTICO", "OFICIAL", "ESPECIAL"].map(s => (
              <DocCheck key={s} label={s} active={serv.includes(s.split("Ú")[0].split("Á")[0])} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 2, background: "#555", margin: "4px 0" }} />

      {/* Sección 21: Datos del Propietario (VENDEDOR) */}
      <div style={{ border: "1px solid #333", padding: "4px 6px", marginBottom: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 7.5, marginBottom: 4, textTransform: "uppercase", letterSpacing: .3 }}>
          21. Datos del Propietario Actual
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr", marginBottom: 4 }}>
          <BX label="Primer Apellido · Segundo Apellido · Nombres" value={u(data.vendedor_nombre)} style={{ border: "1px solid #ccc", borderRight: "none" }} />
          <div style={{ border: "1px solid #ccc", borderRight: "none", padding: "3px 5px" }}>
            <div style={{ fontSize: 6, color: "#444", marginBottom: 3 }}>Tipo Documento</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["C.C", "C.EXTRANJ.", "T.IDENTI.", "NIT", "PASAPORTE"].map(t => (
                <DocCheck key={t} label={t} active={data.vendedor_tipo_doc === t || (!data.vendedor_tipo_doc && t === "C.C")} />
              ))}
            </div>
          </div>
          <BX label="No. Documento" value={cc(data.vendedor_cedula)} style={{ border: "1px solid #ccc" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr" }}>
          <BX label="Dirección" value={u(data.vendedor_direccion)} style={{ border: "1px solid #ccc", borderRight: "none" }} />
          <BX label="Ciudad" value={u(data.vendedor_ciudad)} style={{ border: "1px solid #ccc", borderRight: "none" }} />
          <BX label="Teléfono" value={data.vendedor_telefono} style={{ border: "1px solid #ccc" }} />
        </div>
        <div style={{ marginTop: 6, paddingTop: 4, borderTop: "1px dashed #ccc" }}>
          <div style={{ fontSize: 6.5, color: "#555", marginBottom: 14 }}>Firma del Propietario:</div>
          <div style={{ borderTop: "1px solid #333", width: 220, height: 0 }} />
        </div>
      </div>

      {/* Sección 22: Datos del Comprador (TRASPASO) */}
      <div style={{ border: "1px solid #333", borderTop: "none", padding: "4px 6px" }}>
        <div style={{ fontWeight: 800, fontSize: 7.5, marginBottom: 4, textTransform: "uppercase", letterSpacing: .3 }}>
          22. Datos del Comprador (Traspaso)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr", marginBottom: 4 }}>
          <BX label="Primer Apellido · Segundo Apellido · Nombres" value={u(data.comprador_nombre)} style={{ border: "1px solid #ccc", borderRight: "none" }} />
          <div style={{ border: "1px solid #ccc", borderRight: "none", padding: "3px 5px" }}>
            <div style={{ fontSize: 6, color: "#444", marginBottom: 3 }}>Tipo Documento</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["C.C", "C.EXTRANJ.", "T.IDENTI.", "NIT", "PASAPORTE"].map(t => (
                <DocCheck key={t} label={t} active={data.comprador_tipo_doc === t || (!data.comprador_tipo_doc && t === "C.C")} />
              ))}
            </div>
          </div>
          <BX label="No. Documento" value={cc(data.comprador_cedula)} style={{ border: "1px solid #ccc" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr" }}>
          <BX label="Dirección" value={u(data.comprador_direccion)} style={{ border: "1px solid #ccc", borderRight: "none" }} />
          <BX label="Ciudad" value={u(data.comprador_ciudad)} style={{ border: "1px solid #ccc", borderRight: "none" }} />
          <BX label="Teléfono" value={data.comprador_telefono} style={{ border: "1px solid #ccc" }} />
        </div>
        <div style={{ marginTop: 6, paddingTop: 4, borderTop: "1px dashed #ccc" }}>
          <div style={{ fontSize: 6.5, color: "#555", marginBottom: 14 }}>Firma del Comprador:</div>
          <div style={{ borderTop: "1px solid #333", width: 220, height: 0 }} />
        </div>
      </div>

      {/* Sección 23: Observaciones */}
      <div style={{ border: "1px solid #333", borderTop: "none", padding: "4px 6px" }}>
        <div style={{ fontSize: 7, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>23. Observaciones</div>
        <div style={{ fontSize: 8, minHeight: 28, paddingTop: 2, paddingBottom: 4, borderTop: "1px dashed #ccc" }}>
          {data.vehiculo_observaciones || ""}
        </div>
        <div style={{ fontSize: 6, color: "#666", marginTop: 4, fontStyle: "italic", lineHeight: 1.4 }}>
          SI SU VEHÍCULO HA SIDO MATRICULADO ANTES DEL RUNT TRANSCRIBA EL TIPO DE CARROCERÍA Y CLASE QUE CONSTA EN LA LICENCIA DE TRÁNSITO.
        </div>
      </div>

      {/* Nota final */}
      <div style={{ marginTop: 5, fontSize: 5.5, color: "#888", borderTop: "1px solid #ddd", paddingTop: 3, textAlign: "center" }}>
        NOTA: EL SISTEMA REGISTRO ÚNICO NACIONAL DE TRÁNSITO-RUNT MANTENDRÁ ACTUALIZADOS LOS CÓDIGOS Y EL CONTENIDO DE LOS DIFERENTES CAMPOS DE ESTE FORMULARIO.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VEHICULO WIZARD — Asistente paso a paso
══════════════════════════════════════════════════════════════════════════ */
const STEP_NAMES = { 0:"Trámite", 1:"Vehículo", 2:"Vendedor", 3:"Comprador", 4:"Compraventa", 5:"Mandato", 6:"Revisión" };

export function VehiculoWizard({ onBack, onDone, notify }) {
  const [step, setStep] = useState(0);
  const H = hoy();

  /* ── Paso 0: Tipo de trámite ── */
  const [haTraspaso, setHaTraspaso]       = useState(true);
  const [haCompraventa, setHaCompraventa] = useState(true);
  const [haMandatario, setHaMandatario]   = useState(false);

  /* ── Paso 1: Vehículo (CAMPOS MAESTROS) ── */
  const [placa, setPlaca]           = useState("");
  const [marca, setMarca]           = useState("");
  const [linea, setLinea]           = useState("");
  const [modelo, setModelo]         = useState("");
  const [clase, setClase]           = useState("AUTOMÓVIL");
  const [servicio, setServicio]     = useState("PARTICULAR");
  const [colores, setColores]       = useState("");
  const [combustible, setCombustible] = useState("GASOLINA");
  const [cilindraje, setCilindraje] = useState("");
  const [motor, setMotor]           = useState("");
  const [chasis, setChasis]         = useState("");
  const [vin, setVin]               = useState("");
  const [capacidad, setCapacidad]   = useState("");
  const [blindaje, setBlindaje]     = useState("no");
  const [potencia, setPotencia]     = useState("");
  const [obsVeh, setObsVeh]         = useState("");

  /* ── Paso 2: Vendedor ── */
  const [vNombre, setVNombre]       = useState("");
  const [vTipoDoc, setVTipoDoc]     = useState("C.C");
  const [vCedula, setVCedula]       = useState("");
  const [vDireccion, setVDireccion] = useState("");
  const [vCiudad, setVCiudad]       = useState("Cali");
  const [vTelefono, setVTelefono]   = useState("");

  /* ── Paso 3: Comprador ── */
  const [cNombre, setCNombre]       = useState("");
  const [cTipoDoc, setCTipoDoc]     = useState("C.C");
  const [cCedula, setCCedula]       = useState("");
  const [cDireccion, setCDireccion] = useState("");
  const [cCiudad, setCCiudad]       = useState("Cali");
  const [cTelefono, setCTelefono]   = useState("");

  /* ── Paso 4: Compraventa ── */
  const [cvPrecio, setCvPrecio]           = useState("");
  const [cvPrecioL, setCvPrecioL]         = useState("");
  const [cvFormaPago, setCvFormaPago]     = useState("De contado, en efectivo, al momento de la firma del presente contrato");
  const [cvPenalV, setCvPenalV]           = useState("");
  const [cvPenalL, setCvPenalL]           = useState("");
  const [cvCiudad, setCvCiudad]           = useState("Santiago de Cali");
  const [cvDia, setCvDia]                 = useState(H.dia);
  const [cvMes, setCvMes]                 = useState(H.mes);
  const [cvAnio, setCvAnio]               = useState(H.anio);

  /* ── Paso 5: Mandato ── */
  const [mandNombre, setMandNombre]       = useState("");
  const [mandCedula, setMandCedula]       = useState("");
  const [mandTramites, setMandTramites]   = useState("traspaso");
  const [mandCiudad, setMandCiudad]       = useState("Santiago de Cali");
  const [mandDia, setMandDia]             = useState(H.dia);
  const [mandMes, setMandMes]             = useState(H.mes);
  const [mandAnio, setMandAnio]           = useState(H.anio);

  /* ── Navegación condicional ── */
  const activeSteps = [0, 1, 2, 3, ...(haCompraventa ? [4] : []), ...(haMandatario ? [5] : []), 6];
  const stepIdx  = activeSteps.indexOf(step);
  const totalSt  = activeSteps.length;
  const pct      = Math.round(((stepIdx + 1) / totalSt) * 100);
  const nextStep = () => { const i = activeSteps.indexOf(step); if (i < activeSteps.length - 1) setStep(activeSteps[i + 1]); };
  const prevStep = () => { const i = activeSteps.indexOf(step); if (i > 0) setStep(activeSteps[i - 1]); };

  /* ── masterData (única fuente de verdad) ── */
  const masterData = {
    vehiculo_placa: placa.toUpperCase(), vehiculo_marca: marca, vehiculo_linea: linea,
    vehiculo_modelo: modelo, vehiculo_clase: clase, vehiculo_servicio: servicio,
    vehiculo_colores: colores, vehiculo_combustible: combustible,
    vehiculo_cilindraje: cilindraje, vehiculo_motor: motor, vehiculo_chasis: chasis,
    vehiculo_vin: vin, vehiculo_capacidad: capacidad, vehiculo_blindaje: blindaje,
    vehiculo_potencia: potencia, vehiculo_observaciones: obsVeh,
    vendedor_nombre: vNombre, vendedor_tipo_doc: vTipoDoc, vendedor_cedula: vCedula,
    vendedor_direccion: vDireccion, vendedor_ciudad: vCiudad, vendedor_telefono: vTelefono,
    comprador_nombre: cNombre, comprador_tipo_doc: cTipoDoc, comprador_cedula: cCedula,
    comprador_direccion: cDireccion, comprador_ciudad: cCiudad, comprador_telefono: cTelefono,
    cv_precio: cvPrecio, cv_precio_letras: cvPrecioL, cv_forma_pago: cvFormaPago,
    cv_penal_valor: cvPenalV, cv_penal_letras: cvPenalL,
    cv_ciudad: cvCiudad, cv_dia: cvDia, cv_mes: cvMes, cv_anio: cvAnio,
    mandatario_nombre: mandNombre, mandatario_cedula: mandCedula,
    mandato_tramites: mandTramites, mandato_ciudad: mandCiudad,
    mandato_dia: mandDia, mandato_mes: mandMes, mandato_anio: mandAnio,
  };

  const handleGenerate = () => {
    onDone({
      masterData, haTraspaso, haCompraventa, haMandatario,
      compraventa: haCompraventa ? buildCompraventa(masterData) : null,
      mandato: haMandatario ? buildMandato(masterData) : null,
    });
  };

  /* ── UI atoms ── */
  const IS = {
    width: "100%", padding: "13px 15px", border: "none", borderRadius: 12,
    fontSize: 14, outline: "none", background: "white",
    boxSizing: "border-box", color: "#1a1a1a", boxShadow: "0 1px 4px rgba(0,0,0,.07)"
  };

  const TopBar = () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", background:CVG, borderBottom:"1px solid rgba(0,0,0,.06)", position:"sticky", top:0, zIndex:50 }}>
      <button onClick={step===0?onBack:prevStep} style={{ padding:"8px 18px", background:"white", border:"none", borderRadius:50, fontWeight:700, fontSize:12, cursor:"pointer", color:"#374151", boxShadow:"0 1px 3px rgba(0,0,0,.1)" }}>{step===0?"✕ Cerrar":"← Atrás"}</button>
      <div style={{ position:"relative", width:130, height:34, borderRadius:50, overflow:"hidden", background:"#D4D4C8", flexShrink:0 }}>
        <div style={{ position:"absolute", top:0, left:0, bottom:0, width:`${pct}%`, background:CV, borderRadius:50, transition:"width .35s ease" }}/>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:12, fontWeight:900, color:"white", textShadow:"0 1px 3px rgba(0,0,0,.4)", zIndex:1 }}>{stepIdx+1} de {totalSt}</span>
        </div>
      </div>
      {step===6
        ? <button onClick={handleGenerate} style={{ padding:"8px 18px", background:CV, border:"none", borderRadius:50, fontWeight:800, fontSize:12, cursor:"pointer", color:"white" }}>✅ Generar</button>
        : <div style={{width:80}}/>
      }
    </div>
  );

  const Tabs = () => (
    <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none", borderBottom:"1.5px solid rgba(0,0,0,.07)", background:CVG, padding:"0 14px" }}>
      {activeSteps.map((s, i) => (
        <button key={s} onClick={()=>i<=stepIdx&&setStep(s)} style={{ padding:"10px 12px", background:"none", border:"none", borderBottom:`2.5px solid ${step===s?CV:"transparent"}`, fontWeight:step===s?800:500, fontSize:11, cursor:i<=stepIdx?"pointer":"default", color:step===s?"#0F172A":i<stepIdx?CV:"#94A3B8", whiteSpace:"nowrap", flexShrink:0, transition:"all .15s", marginBottom:-1.5 }}>
          {i<stepIdx?"✓ ":""}{STEP_NAMES[s]}
        </button>
      ))}
    </div>
  );

  const Nxt = ({ disabled, isLast }) => (
    <div style={{ paddingTop:20, paddingBottom:32, position:"sticky", bottom:0, background:`linear-gradient(transparent,${CVG} 40%)`, marginTop:8 }}>
      {!isLast
        ? <button onClick={nextStep} disabled={disabled} style={{ width:"100%", padding:"16px", background:disabled?"#D4D4C8":CV, color:"white", border:"none", borderRadius:50, fontWeight:900, fontSize:15, cursor:disabled?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:disabled?"none":`0 5px 20px ${CV}55` }}>siguiente <span style={{fontSize:18}}>›</span></button>
        : <button onClick={handleGenerate} disabled={!placa||!vNombre||!cNombre} style={{ width:"100%", padding:"16px", background:placa&&vNombre&&cNombre?`linear-gradient(135deg,${CV},#9a3412)`:"#D4D4C8", color:"white", border:"none", borderRadius:50, fontWeight:900, fontSize:15, cursor:"pointer", boxShadow:`0 5px 22px ${CV}55` }}>🚗 Generar Documentos del Trámite</button>
      }
    </div>
  );

  const Cd = ({ title, icon, children }) => (
    <div style={{ background:"white", borderRadius:16, padding:18, marginBottom:14, boxShadow:"0 1px 6px rgba(0,0,0,.06)" }}>
      {title && <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14, paddingBottom:9, borderBottom:`2px solid ${CV}15` }}>
        {icon && <span style={{fontSize:16}}>{icon}</span>}
        <span style={{ fontWeight:800, fontSize:12, color:CV, textTransform:"uppercase", letterSpacing:.4 }}>{title}</span>
      </div>}
      {children}
    </div>
  );

  const Fg = ({ label, req, children }) => (
    <div style={{ marginBottom:11 }}>
      <div style={{ fontSize:10.5, fontWeight:700, color:"#6b7280", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>
        {label}{req && <span style={{color:"#ef4444"}}> *</span>}
      </div>
      {children}
    </div>
  );

  const Rw = ({ children, cols }) => (
    <div style={{ display:"grid", gridTemplateColumns:cols||"1fr 1fr", gap:10 }}>{children}</div>
  );

  const In = ({ value, onChange, placeholder, type, style }) => (
    <input type={type||"text"} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...IS,...style}}/>
  );

  const Sel = ({ value, onChange, options }) => (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{...IS, cursor:"pointer"}}>
      {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  );

  const Tog = ({ options, value, onChange }) => (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      {options.map(o => (
        <button key={o.v||o} onClick={()=>onChange(o.v||o)} style={{ padding:"9px 14px", background:value===(o.v||o)?CV:"white", color:value===(o.v||o)?"white":"#374151", border:`2px solid ${value===(o.v||o)?CV:"#E2E8F0"}`, borderRadius:10, fontWeight:700, fontSize:12, cursor:"pointer", transition:"all .15s" }}>{o.l||o}</button>
      ))}
    </div>
  );

  return (
    <div style={{ background:CVG, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <TopBar /><Tabs />
      <div style={{ flex:1, padding:"18px 16px 0", maxWidth:640, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>

        {/* ─── PASO 0: TIPO DE TRÁMITE ─────────────────────────── */}
        {step===0 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>🚗 Tipo de Trámite</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Define qué documentos se generarán</p>

            <Cd title="¿Qué operación realizas?" icon="📋">
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { id:"tc", haT:true,  haC:true,  label:"🔄 Traspaso + Compraventa", desc:"Genera 3 documentos: RUNT, Contrato y Mandato (si aplica)" },
                  { id:"t",  haT:true,  haC:false, label:"📋 Solo Traspaso (RUNT)",   desc:"Formulario oficial de tránsito sin contrato de compraventa" },
                  { id:"c",  haT:false, haC:true,  label:"📄 Solo Compraventa",        desc:"Contrato de compraventa sin formulario de tránsito" },
                ].map(op => (
                  <div key={op.id} onClick={()=>{ setHaTraspaso(op.haT); setHaCompraventa(op.haC); }} style={{ border:`2px solid ${haTraspaso===op.haT&&haCompraventa===op.haC?CV:"#E2E8F0"}`, borderRadius:12, padding:"12px 16px", cursor:"pointer", background:haTraspaso===op.haT&&haCompraventa===op.haC?`${CV}08`:"white", transition:"all .15s" }}>
                    <div style={{ fontWeight:800, fontSize:13, color:"#0F172A", marginBottom:2 }}>{op.label}</div>
                    <div style={{ fontSize:11, color:"#64748B" }}>{op.desc}</div>
                  </div>
                ))}
              </div>
            </Cd>

            <Cd title="¿Hay mandatario?" icon="⚖️">
              <div style={{ fontSize:12, color:"#64748B", marginBottom:10 }}>
                Un mandatario es quien realiza el trámite en tránsito en nombre del vendedor.
              </div>
              <Tog options={[{v:false,l:"❌ No hay mandatario"},{v:true,l:"✅ Sí, hay mandatario"}]} value={haMandatario} onChange={v=>setHaMandatario(v===true||v==="true")}/>
              {haMandatario && <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:9, padding:"8px 12px", marginTop:10, fontSize:11, color:"#1D4ED8", fontWeight:600 }}>
                📌 Se generará el Contrato de Mandato según Resolución 12379 del Ministerio de Transporte
              </div>}
            </Cd>

            {/* Resumen de lo que se va a generar */}
            <div style={{ background:`${CV}08`, border:`1.5px solid ${CV}30`, borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:12, color:CV, marginBottom:10 }}>
                📁 Documentos que se generarán:
              </div>
              {[
                haTraspaso    && { icon:"📋", label:"Formulario RUNT / Tránsito",         desc:"Traspaso ante Secretaría de Movilidad" },
                haCompraventa && { icon:"📄", label:"Contrato de Compraventa",             desc:"7 cláusulas legales — texto oficial" },
                haMandatario  && { icon:"⚖️", label:"Contrato de Mandato",                 desc:"Autorización para adelantar trámites" },
              ].filter(Boolean).map((d, i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
                  <span style={{fontSize:16}}>{d.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:11, color:"#0F172A" }}>{d.label}</div>
                    <div style={{ fontSize:10, color:"#64748B" }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Nxt />
          </div>
        )}

        {/* ─── PASO 1: VEHÍCULO ────────────────────────────────── */}
        {step===1 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>🚗 Datos del Vehículo</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Estos datos se reutilizan en todos los documentos</p>

            <Cd title="Identificación" icon="🪪">
              <Fg label="Placa" req>
                <input value={placa} onChange={e=>setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))} placeholder="ABC123" maxLength={6}
                  style={{...IS, textTransform:"uppercase", letterSpacing:5, fontSize:20, fontWeight:900, textAlign:"center"}}/>
              </Fg>
              <Rw>
                <Fg label="Marca" req><In value={marca} onChange={setMarca} placeholder="CHEVROLET"/></Fg>
                <Fg label="Línea" req><In value={linea} onChange={setLinea} placeholder="SPARK GT"/></Fg>
              </Rw>
              <Rw>
                <Fg label="Modelo (año)" req><In value={modelo} onChange={setModelo} placeholder="2019"/></Fg>
                <Fg label="Clase de vehículo">
                  <Sel value={clase} onChange={setClase} options={["AUTOMÓVIL","CAMPERO","CAMIONETA","MICROBUS","BUS","BUSETA","CAMIÓN","MOTOCICLETA","MOTOCARRO","CUATRIMOTO","OTRO"]}/>
                </Fg>
              </Rw>
            </Cd>

            <Cd title="Características técnicas" icon="⚙️">
              <Fg label="Combustible">
                <Tog options={["GASOLINA","DIESEL","GAS","ELÉCTRICO","HÍBRIDO"]} value={combustible} onChange={setCombustible}/>
              </Fg>
              <Rw>
                <Fg label="Tipo de servicio"><Sel value={servicio} onChange={setServicio} options={["PARTICULAR","PÚBLICO","DIPLOMÁTICO","OFICIAL","ESPECIAL"]}/></Fg>
                <Fg label="Color(es)"><In value={colores} onChange={setColores} placeholder="BLANCO / NEGRO"/></Fg>
              </Rw>
              <Rw>
                <Fg label="Cilindraje (cc)"><In value={cilindraje} onChange={setCilindraje} placeholder="1200"/></Fg>
                <Fg label="Potencia (HP)"><In value={potencia} onChange={setPotencia} placeholder="82"/></Fg>
              </Rw>
              <Fg label="Capacidad (Kg o pasajeros)"><In value={capacidad} onChange={setCapacidad} placeholder="5 pasajeros"/></Fg>
            </Cd>

            <Cd title="Números de identificación (de la licencia de tránsito)" icon="🔢">
              <div style={{ background:"#FFF7ED", border:"1px solid #FDE68A", borderRadius:9, padding:"7px 12px", marginBottom:12, fontSize:11, color:"#92400E", fontWeight:600 }}>
                ⚠️ Deben coincidir exactamente con la licencia de tránsito
              </div>
              <Fg label="No. Motor"><In value={motor} onChange={setMotor} placeholder="Z10XE12345678"/></Fg>
              <Fg label="No. Chasis / Serial"><In value={chasis} onChange={setChasis} placeholder="LKLLZ2B16HA012345"/></Fg>
              <Fg label="No. VIN"><In value={vin} onChange={setVin} placeholder="LKLLZ2B16HA012345"/></Fg>
            </Cd>

            <Cd title="Blindaje y observaciones" icon="🛡️">
              <Fg label="¿Tiene blindaje?">
                <Tog options={[{v:"no",l:"❌ No"},{v:"si",l:"✅ Sí (blindado)"}]} value={blindaje} onChange={setBlindaje}/>
              </Fg>
              <Fg label="Observaciones (opcional)">
                <textarea value={obsVeh} onChange={e=>setObsVeh(e.target.value)} rows={2}
                  placeholder="Información adicional para el formulario de tránsito..."
                  style={{...IS, resize:"vertical"}}/>
              </Fg>
            </Cd>

            <Nxt disabled={!placa.trim()||!marca.trim()||!modelo.trim()}/>
          </div>
        )}

        {/* ─── PASO 2: VENDEDOR ────────────────────────────────── */}
        {step===2 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>👤 Vendedor / Propietario Actual</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Quien transfiere el vehículo</p>
            <Cd title="Datos del vendedor" icon="🪪">
              <Fg label="Nombre completo" req><In value={vNombre} onChange={setVNombre} placeholder="NOMBRE APELLIDO APELLIDO"/></Fg>
              <Rw>
                <Fg label="Tipo de documento"><Sel value={vTipoDoc} onChange={setVTipoDoc} options={["C.C","C.EXTRANJ.","T.IDENTI.","NIT","PASAPORTE"]}/></Fg>
                <Fg label="Número de documento" req>
                  <div style={{position:"relative"}}>
                    <In value={vCedula} onChange={setVCedula} placeholder="1149186377"/>
                    {vCedula && <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:CV,fontWeight:700,background:"white",padding:"0 3px"}}>→ {cc(vCedula)}</div>}
                  </div>
                </Fg>
              </Rw>
              <Fg label="Dirección"><In value={vDireccion} onChange={setVDireccion} placeholder="Calle 25 # 45-67"/></Fg>
              <Rw>
                <Fg label="Ciudad"><In value={vCiudad} onChange={setVCiudad} placeholder="Cali"/></Fg>
                <Fg label="Teléfono"><In value={vTelefono} onChange={setVTelefono} placeholder="311 234 5678" type="tel"/></Fg>
              </Rw>
            </Cd>
            <Nxt disabled={!vNombre.trim()||!vCedula.trim()}/>
          </div>
        )}

        {/* ─── PASO 3: COMPRADOR ───────────────────────────────── */}
        {step===3 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>🛒 Comprador / Nuevo Propietario</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Quien adquiere el vehículo</p>
            <Cd title="Datos del comprador" icon="🪪">
              <Fg label="Nombre completo" req><In value={cNombre} onChange={setCNombre} placeholder="NOMBRE APELLIDO APELLIDO"/></Fg>
              <Rw>
                <Fg label="Tipo de documento"><Sel value={cTipoDoc} onChange={setCTipoDoc} options={["C.C","C.EXTRANJ.","T.IDENTI.","NIT","PASAPORTE"]}/></Fg>
                <Fg label="Número de documento" req>
                  <div style={{position:"relative"}}>
                    <In value={cCedula} onChange={setCCedula} placeholder="1149186377"/>
                    {cCedula && <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:CV,fontWeight:700,background:"white",padding:"0 3px"}}>→ {cc(cCedula)}</div>}
                  </div>
                </Fg>
              </Rw>
              <Fg label="Dirección"><In value={cDireccion} onChange={setCDireccion} placeholder="Calle 25 # 45-67"/></Fg>
              <Rw>
                <Fg label="Ciudad"><In value={cCiudad} onChange={setCCiudad} placeholder="Cali"/></Fg>
                <Fg label="Teléfono"><In value={cTelefono} onChange={setCTelefono} placeholder="311 234 5678" type="tel"/></Fg>
              </Rw>
            </Cd>
            <Nxt disabled={!cNombre.trim()||!cCedula.trim()}/>
          </div>
        )}

        {/* ─── PASO 4: COMPRAVENTA ─────────────────────────────── */}
        {step===4 && haCompraventa && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>💰 Compraventa</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Condiciones económicas del contrato</p>

            <Cd title="Precio del vehículo" icon="💰">
              <Fg label="Precio de venta (en cifras)">
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontWeight:700,color:"#6b7280",fontSize:14}}>$</span>
                  <input value={cvPrecio} onChange={e=>setCvPrecio(fm(e.target.value))} placeholder="0" style={{...IS,paddingLeft:24}}/>
                </div>
              </Fg>
              <Fg label="Precio en letras"><In value={cvPrecioL} onChange={setCvPrecioL} placeholder="DIECIOCHO MILLONES DE PESOS M/CTE"/></Fg>
            </Cd>

            <Cd title="Forma de pago" icon="💳">
              <Fg label="Descripción de la forma de pago">
                <textarea value={cvFormaPago} onChange={e=>setCvFormaPago(e.target.value)} rows={3}
                  style={{...IS, resize:"vertical"}}/>
              </Fg>
            </Cd>

            <Cd title="Cláusula penal (opcional)" icon="⚖️">
              <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:9, padding:"7px 12px", marginBottom:12, fontSize:11, color:"#1D4ED8", fontWeight:600 }}>
                ℹ️ Dejar en blanco si no se quiere pactar sanción por incumplimiento
              </div>
              <Fg label="Valor de la sanción (en cifras)">
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontWeight:700,color:"#6b7280",fontSize:14}}>$</span>
                  <input value={cvPenalV} onChange={e=>setCvPenalV(fm(e.target.value))} placeholder="0" style={{...IS,paddingLeft:24}}/>
                </div>
              </Fg>
              <Fg label="En letras"><In value={cvPenalL} onChange={setCvPenalL} placeholder="UN MILLÓN OCHOCIENTOS MIL PESOS M/CTE"/></Fg>
            </Cd>

            <Cd title="Lugar y fecha de firma" icon="📅">
              <Fg label="Ciudad de firma"><In value={cvCiudad} onChange={setCvCiudad} placeholder="Santiago de Cali"/></Fg>
              <Rw cols="2fr 2fr 2fr">
                <Fg label="Día"><In value={cvDia} onChange={setCvDia} placeholder="15"/></Fg>
                <Fg label="Mes"><Sel value={cvMes} onChange={setCvMes} options={MOS}/></Fg>
                <Fg label="Año"><In value={cvAnio} onChange={setCvAnio} placeholder="2025"/></Fg>
              </Rw>
            </Cd>
            <Nxt/>
          </div>
        )}

        {/* ─── PASO 5: MANDATO ─────────────────────────────────── */}
        {step===5 && haMandatario && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>⚖️ Mandato</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Datos del mandatario</p>

            <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:11, color:"#1D4ED8", fontWeight:600 }}>
              📌 <strong>MANDANTE:</strong> {u(vNombre)||"el vendedor"} &nbsp;·&nbsp; <strong>MANDATARIO:</strong> quien realiza el trámite en tránsito
            </div>

            <Cd title="Datos del mandatario" icon="🪪">
              <Fg label="Nombre completo del mandatario" req><In value={mandNombre} onChange={setMandNombre} placeholder="NOMBRE APELLIDO APELLIDO"/></Fg>
              <Fg label="Cédula del mandatario" req>
                <div style={{position:"relative"}}>
                  <In value={mandCedula} onChange={setMandCedula} placeholder="1149186377"/>
                  {mandCedula && <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:CV,fontWeight:700,background:"white",padding:"0 3px"}}>→ {cc(mandCedula)}</div>}
                </div>
              </Fg>
            </Cd>

            <Cd title="Trámites autorizados" icon="📋">
              <Fg label="El mandatario queda facultado para:">
                <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
                  {[
                    { v:"traspaso", l:"Traspaso únicamente" },
                    { v:"traspaso y todos los trámites relacionados con la transferencia del vehículo", l:"Traspaso + todos los trámites relacionados" },
                    { v:"traspaso, pago de impuestos y derechos de tránsito", l:"Traspaso + pago de impuestos" },
                  ].map(op => (
                    <div key={op.v} onClick={()=>setMandTramites(op.v)} style={{ border:`2px solid ${mandTramites===op.v?CV:"#E2E8F0"}`, borderRadius:10, padding:"9px 13px", cursor:"pointer", background:mandTramites===op.v?`${CV}08`:"white", fontSize:12, fontWeight:mandTramites===op.v?700:400 }}>
                      {op.l}
                    </div>
                  ))}
                </div>
                <div style={{fontSize:10,color:"#94A3B8",marginBottom:4}}>O escribe uno personalizado:</div>
                <textarea value={mandTramites} onChange={e=>setMandTramites(e.target.value)} rows={2} style={{...IS, resize:"none", fontSize:12}}/>
              </Fg>
            </Cd>

            <Cd title="Fecha del mandato" icon="📅">
              <Fg label="Ciudad"><In value={mandCiudad} onChange={setMandCiudad} placeholder="Santiago de Cali"/></Fg>
              <Rw cols="2fr 2fr 2fr">
                <Fg label="Día"><In value={mandDia} onChange={setMandDia} placeholder="15"/></Fg>
                <Fg label="Mes"><Sel value={mandMes} onChange={setMandMes} options={MOS}/></Fg>
                <Fg label="Año"><In value={mandAnio} onChange={setMandAnio} placeholder="2025"/></Fg>
              </Rw>
            </Cd>
            <Nxt disabled={!mandNombre.trim()||!mandCedula.trim()}/>
          </div>
        )}

        {/* ─── PASO 6: REVISIÓN ────────────────────────────────── */}
        {step===6 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>✅ Revisión Final</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Verifica los datos antes de generar</p>

            {[
              { title:"🚗 Vehículo", rows:[["Placa",u(placa)||"—"],["Marca / Línea / Modelo",`${u(marca)} ${u(linea)} ${modelo}`.trim()||"—"],["Motor",motor||"—"],["Chasis",chasis||"—"],["Combustible",combustible||"—"]] },
              { title:"👤 Partes", rows:[["Vendedor",u(vNombre)||"—"],["CC Vendedor",cc(vCedula)||"—"],["Comprador",u(cNombre)||"—"],["CC Comprador",cc(cCedula)||"—"]] },
              ...(haCompraventa?[{ title:"💰 Compraventa", rows:[["Precio",cvPrecio?`$${fm(cvPrecio)}`:"—"],["Forma de pago",cvFormaPago.slice(0,40)+"..."],["Ciudad y fecha",`${cvCiudad}, ${cvDia} de ${cvMes} de ${cvAnio}`]] }]:[]),
              ...(haMandatario?[{ title:"⚖️ Mandato", rows:[["Mandatario",u(mandNombre)||"—"],["CC Mandatario",cc(mandCedula)||"—"]] }]:[]),
            ].map((sec, si) => (
              <div key={si} style={{ background:"white", borderRadius:14, padding:16, marginBottom:10, boxShadow:"0 1px 5px rgba(0,0,0,.06)" }}>
                <div style={{ fontWeight:800, fontSize:12, color:CV, marginBottom:10 }}>{sec.title}</div>
                {sec.rows.map(([k,v], i, arr) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<arr.length-1?"1px solid #F1F5F9":"none", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#6b7280" }}>{k}</span>
                    <span style={{ fontSize:11, color:"#0f172a", fontWeight:600, maxWidth:"65%", textAlign:"right" }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Docs a generar */}
            <div style={{ background:`${CV}08`, border:`1.5px solid ${CV}30`, borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:12, color:CV, marginBottom:10 }}>
                📁 Se generarán {[haTraspaso,haCompraventa,haMandatario].filter(Boolean).length} documento(s):
              </div>
              {haTraspaso    && <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}><span style={{color:"#16A34A",fontSize:14}}>✓</span><span style={{fontSize:11,fontWeight:600}}>Formulario RUNT / Tránsito</span></div>}
              {haCompraventa && <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}><span style={{color:"#16A34A",fontSize:14}}>✓</span><span style={{fontSize:11,fontWeight:600}}>Contrato de Compraventa de Vehículo Automotor</span></div>}
              {haMandatario  && <div style={{display:"flex",gap:8,marginBottom:0,alignItems:"center"}}><span style={{color:"#16A34A",fontSize:14}}>✓</span><span style={{fontSize:11,fontWeight:600}}>Contrato de Mandato (Res. 12379 Min. Transporte)</span></div>}
            </div>

            <Nxt isLast/>
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VEHICULO PREVIEW — Vista previa con tabs por documento
══════════════════════════════════════════════════════════════════════════ */
export function VehiculoPreview({ docs, onBack, onNew, notify }) {
  const { masterData, haTraspaso, haCompraventa, haMandatario, compraventa, mandato } = docs;

  const tabs = [
    ...(haTraspaso    ? [{ id:"runt",    label:"📋 RUNT / Tránsito", docId:"VHCL-RUNT"    }] : []),
    ...(haCompraventa ? [{ id:"cv",      label:"📄 Compraventa",      docId:"VHCL-CV"      }] : []),
    ...(haMandatario  ? [{ id:"mandato", label:"⚖️ Mandato",           docId:"VHCL-MANDATO" }] : []),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "runt");
  const [editCV,  setEditCV]      = useState(compraventa || "");
  const [editMnd, setEditMnd]     = useState(mandato || "");
  const [expSt, setExpSt]         = useState({});

  const curTab = tabs.find(t => t.id === activeTab) || tabs[0];

  const doExportPDF = async () => {
    const key = "pdf_"+activeTab;
    setExpSt(p=>({...p,[key]:true}));
    try {
      const fn = `${iso()}_${activeTab.toUpperCase()}_${masterData.vehiculo_placa||"VEH"}.pdf`;
      await vhExpPDF(curTab.docId, fn);
      notify && notify("📕 PDF descargado");
    } catch(e) { notify && notify("❌ "+e.message); }
    setExpSt(p=>({...p,[key]:false}));
  };

  const doExportWord = async () => {
    const text = activeTab==="cv" ? editCV : editMnd;
    if (!text) return;
    try {
      await vhExpWord(text, `${iso()}_${activeTab.toUpperCase()}_${masterData.vehiculo_placa||"VEH"}.docx`);
      notify && notify("📄 Word descargado");
    } catch(e) { notify && notify("❌ "+e.message); }
  };

  const doExportAllPDF = async () => {
    setExpSt(p=>({...p, all:true}));
    for (const tab of tabs) {
      try {
        await vhExpPDF(tab.docId, `${iso()}_${tab.id.toUpperCase()}_${masterData.vehiculo_placa||"VEH"}.pdf`);
        await new Promise(r => setTimeout(r, 600));
      } catch(e) {}
    }
    notify && notify("📕 Todos los PDFs descargados");
    setExpSt(p=>({...p, all:false}));
  };

  const doPrint = () => {
    const el = document.getElementById(curTab.docId);
    if (!el) return;
    const w = window.open("","_blank");
    w.document.write(`<html><head><style>body{margin:0}@page{margin:0;size:letter}</style></head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 900);
  };

  const Btn = ({ onClick, bg, dis, ch }) => (
    <button onClick={onClick} disabled={dis} style={{ padding:"8px 13px", background:dis?"#9CA3AF":bg, color:"white", border:"none", borderRadius:9, fontWeight:700, fontSize:11, cursor:dis?"wait":"pointer", whiteSpace:"nowrap" }}>{ch}</button>
  );

  /* Renderer de documentos de texto */
  const renderText = (text, id) => (
    <div id={id} style={{ background:"white", borderRadius:"12px 12px 0 0", border:"1px solid #E2E8F0", padding:"52px 72px", fontFamily:"Arial,sans-serif", fontSize:12, lineHeight:1.9, color:"#111" }}>
      {(text || "").split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{height:8}}/>;
        if (t === "CONTRATO DE COMPRAVENTA DE VEHÍCULO AUTOMOTOR")
          return <p key={i} style={{textAlign:"center",fontWeight:900,fontSize:14,marginTop:0,marginBottom:18,letterSpacing:.3,textDecoration:"underline",fontFamily:"Arial,sans-serif"}}>{t}</p>;
        if (/^(Primera|Segunda|Tercera|Cuarta|Quinta|Sexta|Séptima|PRIMERA:|SEGUNDA:)/.test(t)) {
          const dot = t.indexOf(".");
          return <p key={i} style={{margin:"0 0 4px",lineHeight:1.85,textAlign:"justify",fontSize:12,fontFamily:"Arial,sans-serif"}}>
            {dot>-1?<><strong>{t.slice(0,dot+1)}</strong>{t.slice(dot+1)}</>:<strong>{t}</strong>}
          </p>;
        }
        if (t==="Señores"||t==="La ciudad"||t.startsWith("Secretaría"))
          return <p key={i} style={{margin:0,lineHeight:1.5,fontFamily:"Arial,sans-serif",fontSize:12,fontWeight:600}}>{t}</p>;
        return <p key={i} style={{margin:"0 0 2px",lineHeight:1.85,textAlign:"justify",fontSize:12,fontFamily:"Arial,sans-serif"}}>{t}</p>;
      })}
    </div>
  );

  /* Bloque de firmas */
  const FirmasCV = () => (
    <div style={{ background:"white", borderRadius:"0 0 12px 12px", border:"1px solid #E2E8F0", borderTop:"none", padding:"36px 72px 44px", fontFamily:"Arial,sans-serif" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:56 }}>
        {[
          ["EL VENDEDOR", masterData.vendedor_nombre, masterData.vendedor_cedula],
          ["EL COMPRADOR", masterData.comprador_nombre, masterData.comprador_cedula],
        ].map(([rol, nom, ced], i) => (
          <div key={i}>
            <div style={{ borderTop:"1px solid #222", marginBottom:6, paddingTop:4 }}/>
            <div style={{ fontSize:10, marginBottom:2 }}>Nombre: {u(nom||"")}</div>
            <div style={{ fontSize:10, marginBottom:8 }}>C.C.: {cc(ced||"")}</div>
            <div style={{ fontWeight:700, fontSize:10 }}>{rol}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const FirmasMandato = () => (
    <div style={{ background:"white", borderRadius:"0 0 12px 12px", border:"1px solid #E2E8F0", borderTop:"none", padding:"36px 72px 44px", fontFamily:"Arial,sans-serif" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:56 }}>
        {[
          ["MANDANTE", masterData.vendedor_nombre, masterData.vendedor_cedula],
          ["MANDATARIO", masterData.mandatario_nombre, masterData.mandatario_cedula],
        ].map(([rol, nom, ced], i) => (
          <div key={i}>
            <div style={{ borderTop:"1px solid #222", marginBottom:6, paddingTop:4 }}/>
            <div style={{ fontSize:10, marginBottom:2 }}>Nombre: {u(nom||"")}</div>
            <div style={{ fontSize:10, marginBottom:8 }}>C.C.: {cc(ced||"")}</div>
            <div style={{ fontWeight:700, fontSize:10 }}>{rol}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9" }}>

      {/* Barra de acciones */}
      <div style={{ background:"white", borderBottom:"2px solid #E2E8F0", padding:"10px 16px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", position:"sticky", top:0, zIndex:50 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:CV, cursor:"pointer", fontSize:12, fontWeight:700 }}>← Editar</button>
        <div style={{ width:1, height:18, background:"#E2E8F0" }}/>
        <div style={{ background:`${CV}15`, color:CV, padding:"3px 10px", borderRadius:7, fontSize:10, fontWeight:800 }}>
          🚗 {masterData.vehiculo_placa||"—"} · {u(masterData.vehiculo_marca||"")} {masterData.vehiculo_modelo||""}
        </div>
        <div style={{flex:1}}/>
        <Btn onClick={doPrint}        bg="#0F172A" ch="🖨️ Imprimir"/>
        {activeTab!=="runt" && <Btn onClick={doExportWord} bg="#1D4ED8" ch="📄 Word"/>}
        <Btn onClick={doExportPDF}    dis={expSt["pdf_"+activeTab]} bg="#DC2626" ch={expSt["pdf_"+activeTab]?"⏳...":"📕 PDF"}/>
        {tabs.length > 1 && <Btn onClick={doExportAllPDF} dis={expSt.all} bg={CV} ch={expSt.all?"⏳...":"⬇️ Todo PDF"}/>}
        <Btn onClick={onNew}          bg="#10B981" ch="✅ Nuevo"/>
      </div>

      {/* Tabs de documentos */}
      <div style={{ background:"white", borderBottom:"2px solid #E2E8F0", padding:"0 16px", display:"flex" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:"12px 18px", background:"none", border:"none", borderBottom:`3px solid ${activeTab===tab.id?CV:"transparent"}`, fontWeight:activeTab===tab.id?800:600, fontSize:12, cursor:"pointer", color:activeTab===tab.id?CV:"#64748B", whiteSpace:"nowrap", marginBottom:-2, transition:"all .15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"20px 16px", maxWidth:900, margin:"0 auto" }}>

        {/* ─ RUNT ─ */}
        {activeTab==="runt" && haTraspaso && (
          <div>
            <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:8, padding:"8px 14px", marginBottom:12, fontSize:11, color:"#1D4ED8", fontWeight:700 }}>
              📋 Formulario RUNT — Traspaso · Imprimir en papel carta para presentar en Secretaría de Movilidad
            </div>
            <div style={{ overflowX:"auto", boxShadow:"0 4px 24px rgba(0,0,0,.07)", borderRadius:12 }}>
              <RUNTDoc data={masterData}/>
            </div>
          </div>
        )}

        {/* ─ COMPRAVENTA ─ */}
        {activeTab==="cv" && haCompraventa && (
          <div>
            {renderText(editCV, "VHCL-CV")}
            <FirmasCV/>
            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748B", marginBottom:5 }}>✏️ Editar directamente:</div>
              <textarea value={editCV} onChange={e=>setEditCV(e.target.value)} rows={14}
                style={{ width:"100%", padding:"12px 14px", border:"2px solid #E2E8F0", borderRadius:10, fontSize:12, lineHeight:1.7, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"Arial,sans-serif" }}/>
            </div>
          </div>
        )}

        {/* ─ MANDATO ─ */}
        {activeTab==="mandato" && haMandatario && (
          <div>
            {renderText(editMnd, "VHCL-MANDATO")}
            <FirmasMandato/>
            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748B", marginBottom:5 }}>✏️ Editar directamente:</div>
              <textarea value={editMnd} onChange={e=>setEditMnd(e.target.value)} rows={14}
                style={{ width:"100%", padding:"12px 14px", border:"2px solid #E2E8F0", borderRadius:10, fontSize:12, lineHeight:1.7, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"Arial,sans-serif" }}/>
            </div>
          </div>
        )}

        {/* Info archivo */}
        <div style={{ marginTop:12, background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:8, padding:"6px 14px", fontSize:10, color:"#1D4ED8", fontWeight:600 }}>
          📁 {iso()}_TRAMITE_{masterData.vehiculo_placa||"VEH"}_{activeTab.toUpperCase()}.pdf
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BANNER PARA HOME DE AutoDoc (copiar y pegar en el HOME section)

   <div style={{maxWidth:1040,margin:"0 auto 14px"}}>
     <div style={{background:`linear-gradient(135deg,#7C2D12,#9a3412)`,borderRadius:18,padding:"18px 24px",display:"flex",alignItems:"center",gap:18,boxShadow:"0 8px 32px rgba(124,45,18,.25)",cursor:"pointer"}}
       onClick={()=>{setSelCat(CATS.find(c=>c.id==="compraventa"));setView("vehiculo-wizard");}}>
       <div style={{fontSize:40}}>🚗</div>
       <div style={{flex:1}}>
         <div style={{fontWeight:900,fontSize:16,color:"white",marginBottom:2}}>Traspaso y Compraventa de Vehículo</div>
         <div style={{fontSize:11,color:"#fca5a5",marginBottom:7}}>Wizard integrado · RUNT + Contrato + Mandato · Un solo diligenciamiento</div>
         <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
           {["📋 Formulario RUNT","📄 Compraventa","⚖️ Mandato","🚗 Datos del vehículo","👤 Vendedor & Comprador"].map((t,i)=>(
             <span key={i} style={{background:"rgba(255,255,255,.18)",color:"white",padding:"3px 9px",borderRadius:50,fontSize:10,fontWeight:700}}>{t}</span>
           ))}
         </div>
       </div>
       <div style={{background:"rgba(255,255,255,.2)",color:"white",padding:"9px 18px",borderRadius:50,fontWeight:800,fontSize:12,whiteSpace:"nowrap"}}>Crear →</div>
     </div>
   </div>
══════════════════════════════════════════════════════════════════════════ */
