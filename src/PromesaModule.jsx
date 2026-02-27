// ══════════════════════════════════════════════════════════════════════════
//  PromesaModule.jsx  —  Módulo: PROMESA DE COMPRAVENTA DE BIEN INMUEBLE
//  AutoDoc · Colombia · Cali
//
//  CONTIENE:
//  ✅ PromesaWizard  — wizard paso a paso (7 pasos)
//  ✅ PromesaPreview — vista previa con exportación PDF/Word/Imagen/WA
//  ✅ buildPromesa   — constructor del texto legal (exportable si se necesita)
//
//  INTEGRACIÓN EN AutoDoc_v16.jsx:
//  1) Importa:
//     import { PromesaWizard, PromesaPreview } from "./PromesaModule";
//
//  2) Añade state:
//     const [promesaDoc, setPromesaDoc] = useState("");
//
//  3) Añade rutas ANTES del return principal:
//
//     if (view === "promesa-wizard")
//       return <PromesaWizard
//         onBack={() => setView(selCat ? "cat" : "home")}
//         onDone={async txt => {
//           setPromesaDoc(txt);
//           setView("promesa-preview");
//           // guardar historial...
//           notify("✅ Promesa generada");
//         }}
//       />;
//
//     if (view === "promesa-preview")
//       return <PromesaPreview
//         docText={promesaDoc}
//         onBack={() => setView("promesa-wizard")}
//         onNew={resetAll}
//         notify={notify}
//       />;
//
//  4) En HOME, el banner llama:
//     onClick={() => setView("promesa-wizard")}
//
//  5) En CATEGORÍA compraventa, el tipo "Promesa compraventa vivienda" llama:
//     onClick={() => { setSelTipo(tipo); setView("promesa-wizard"); }}
// ══════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  MO, UC, fCC, fMoney, iso,
  expWord, expFromEl,
  WAModal,
} from "./SharedComponents";

/* ─── COLORES ────────────────────────────────────────────────────────────── */
const aC  = "#7C2D12";
const PBG = "#ECECE8";

/* ─── PASOS DEL WIZARD ───────────────────────────────────────────────────── */
const PSTEPS = ["Vendedor","Comprador","Inmueble","Tradición","Precio & Arras","Notaría","Resumen"];

/* ══════════════════════════════════════════════════════════════════════════
   CONSTRUCTOR DEL DOCUMENTO LEGAL
══════════════════════════════════════════════════════════════════════════ */
export function buildPromesa(d) {
  const vStr = d.vAct === "propio"
    ? "nombre propio"
    : `nombre y representación de ${UC(d.vRN)}, persona jurídica identificada con Nit ${d.vRNit} y con domicilio social principal en la ciudad de ${UC(d.vRC)}`;

  const cStr = d.cAct === "propio"
    ? "nombre propio"
    : `nombre y representación de ${UC(d.cRN)}, persona jurídica identificada con Nit ${d.cRNit} y con domicilio social principal en la ciudad de ${UC(d.cRC)}`;

  return `PROMESA DE COMPRAVENTA DE BIEN INMUEBLE

Entre los suscritos, a saber: ${UC(d.vN) || "________________"}, mayor de edad, domiciliado y residente en la ciudad de ${UC(d.vCity) || "__________"}, identificado con cédula de ciudadanía número ${fCC(d.vCC) || "________"} de ${UC(d.vExp) || "______"}, actuando a ${vStr}, quien para los efectos del presente contrato se denominará EL PROMETIENTE VENDEDOR, de una parte; y de la otra, ${UC(d.cN) || "__________________"}, mayor de edad, domiciliado y residente en la ciudad de ${UC(d.cCity) || "__________"}, identificado con cédula de ciudadanía número ${fCC(d.cCC) || "________"} de ${UC(d.cExp) || "______"}, actuando a ${cStr}, quien en adelante se denominará EL PROMETIENTE COMPRADOR, se ha celebrado el presente contrato de promesa de compraventa que se rige con las siguientes cláusulas:

Primera. OBJETO.— EL PROMETIENTE VENDEDOR se obliga a vender al PROMETIENTE COMPRADOR, quien a su vez se obliga a comprar el bien inmueble que se describe a continuación: Bien inmueble ubicado en la calle ${d.iCalle || "__________"} número ${d.iNum || "________"} de la urbanización o barrio ${UC(d.iBrr) || "___________"} de la ciudad de ${UC(d.iCiu) || "_________"}, el cual cuenta con ${d.iMt || "______"} metros cuadrados y alinderado de manera general así: por el norte, con ${d.iNorte || "_______"}; por el sur, con ${d.iSur || "_________"}; por el oriente, con ${d.iOriente || "___________"}; por el occidente, con ${d.iOcc || "___"}. Dicho inmueble se identifica con la cédula catastral No. ${d.iCat || "_________"}.

Segunda: TRADICIÓN.— El Inmueble que por este contrato se promete vender por una parte, y comprar por la otra, lo adquirió el prometiente vendedor por compra hecha a ${UC(d.tCA) || "________"}, según consta en la escritura pública número ${d.tEsc || "________"} de fecha ${d.tFEsc || "___________"}, expedida por la Notaría No. ${d.tNot || "____"} del círculo de ${UC(d.tCir) || "________"} la cual fue registrada en fecha ${d.tFReg || "__________"} en el folio de matrícula inmobiliaria No. ${d.tFol || "_______"} de la Oficina de Registro de Instrumentos Públicos ${UC(d.tOfi) || "________"} (principal o seccional) del Círculo de ${UC(d.tCircReg) || "________"}.

Tercera: OTRAS OBLIGACIONES.— El PROMETIENTE VENDEDOR se obliga a transferir el dominio del inmueble objeto del presente contrato libre de hipotecas, demandas civiles, embargos, condiciones resolutorias, pleito pendiente, censos, anticresis y en general, de todo gravamen o limitación del dominio y saldrá al saneamiento en los casos de la ley. También se obliga el PROMETIENTE VENDEDOR al pago de paz y salvo de impuestos, tasas y contribuciones causadas hasta la fecha de la escritura pública de compraventa.

Cuarta: PRECIO.— El precio del inmueble prometido en venta es de ${d.pTotL || "________________"} ($${fMoney(d.pTot) || "___________"}) moneda corriente, suma que el PROMETIENTE COMPRADOR pagará al PROMETIENTE VENDEDOR así: a) ${d.pC1L || "________________"} ($${fMoney(d.pC1) || "______"}) a la fecha de la firma del presente contrato; dicha suma será cancelada en ${d.pC1F}; b) el saldo, es decir, la suma de ${d.pSalL || "_________"} ($${fMoney(d.pSal) || "_________"}) al momento del otorgamiento de la escritura pública correspondiente.

Quinta: ARRAS.— La cantidad de ${d.pArrL || "_________"} ($${fMoney(d.pArr) || "___________"}) que el PROMETIENTE VENDEDOR declara recibido del PROMETIENTE COMPRADOR a satisfacción, se entrega a título de arras confirmatorias del acuerdo prometido y serán abonadas al precio total al momento de perfeccionarse el objeto de esta promesa.

Sexta: CLÁUSULA PENAL.— Los prometientes establecemos, para el caso de incumplimiento, una multa de valor igual a la entregada como arras si el incumplimiento es de parte del PROMETIENTE COMPRADOR quien entonces perderá el valor dado; y si el incumplimiento es por parte del PROMETIENTE VENDEDOR éste devolverá al PROMETIENTE COMPRADOR el doble del valor indicado.

Séptima: OTORGAMIENTO.— La escritura pública que deberá hacerse con el fin de perfeccionar la venta prometida del inmueble alinderado en la cláusula primera se otorgará en la Notaría ${d.nNot || "______"} del círculo de ${UC(d.nCir) || "______"} el día ${d.nDia || "_______"} a las ${d.nHr || "______"}.

Octava: PRÓRROGA.— Sólo se podrá prorrogar el término para el cumplimiento de las obligaciones que por este contrato se contraen, cuando así lo acuerden las partes por escrito, mediante cláusula que se agregue al presente instrumento, firmada por ambas partes por lo menos con dos (2) días hábiles de anticipación al término inicial señalado para el otorgamiento de la escritura pública.

Novena: ENTREGA.— En la fecha del otorgamiento de la escritura pública el PROMETIENTE VENDEDOR hará la entrega material del inmueble al PROMETIENTE COMPRADOR, con sus mejoras, anexidades, usos y servidumbres y elaborarán un acta para constancia de la diligencia.

Décima: GASTOS.— Los Gastos que ocasione la firma de este contrato, los que demande el otorgamiento de la escritura pública de compraventa, así como la autorización y registro de la escritura pública de compraventa serán de cargo de las dos partes por mitades.

Los contratantes, leído el presente documento, dan su asentimiento expresamente a lo estipulado y firman como aparece, ante testigos que los suscriben, en la ciudad de ${UC(d.fCiu) || "________"} a los ${d.fDia} días del mes de ${d.fMes} de ${d.fAnio}, en dos ejemplares, uno para cada prometiente.`;
}

/* ══════════════════════════════════════════════════════════════════════════
   PROMESA WIZARD — 7 pasos
══════════════════════════════════════════════════════════════════════════ */
export function PromesaWizard({ onBack, onDone }) {
  const [step, setStep] = useState(0);

  /* ── Paso 0: Vendedor ── */
  const [vN,    setVN]    = useState("");
  const [vCity, setVCity] = useState("");
  const [vCC,   setVCC]   = useState("");
  const [vExp,  setVExp]  = useState("");
  const [vAct,  setVAct]  = useState("propio");
  const [vRN,   setVRN]   = useState("");
  const [vRNit, setVRNit] = useState("");
  const [vRC,   setVRC]   = useState("");

  /* ── Paso 1: Comprador ── */
  const [cN,    setCN]    = useState("");
  const [cCity, setCCity] = useState("");
  const [cCC,   setCCC]   = useState("");
  const [cExp,  setCExp]  = useState("");
  const [cAct,  setCAct]  = useState("propio");
  const [cRN,   setCRN]   = useState("");
  const [cRNit, setCRNit] = useState("");
  const [cRC,   setCRC]   = useState("");

  /* ── Paso 2: Inmueble ── */
  const [iCalle,   setICalle]   = useState("");
  const [iNum,     setINum]     = useState("");
  const [iBrr,     setIBrr]     = useState("");
  const [iCiu,     setICiu]     = useState("");
  const [iMt,      setIMt]      = useState("");
  const [iNorte,   setINorte]   = useState("");
  const [iSur,     setISur]     = useState("");
  const [iOriente, setIOriente] = useState("");
  const [iOcc,     setIOcc]     = useState("");
  const [iCat,     setICat]     = useState("");

  /* ── Paso 3: Tradición ── */
  const [tCA,      setTCA]      = useState("");
  const [tEsc,     setTEsc]     = useState("");
  const [tFEsc,    setTFEsc]    = useState("");
  const [tNot,     setTNot]     = useState("");
  const [tCir,     setTCir]     = useState("");
  const [tFReg,    setTFReg]    = useState("");
  const [tFol,     setTFol]     = useState("");
  const [tOfi,     setTOfi]     = useState("");
  const [tCircReg, setTCircReg] = useState("");

  /* ── Paso 4: Precio & Arras ── */
  const [pTot,  setPTot]  = useState("");
  const [pTotL, setPTotL] = useState("");
  const [pC1,   setPC1]   = useState("");
  const [pC1L,  setPC1L]  = useState("");
  const [pC1F,  setPC1F]  = useState("efectivo");
  const [pSal,  setPSal]  = useState("");
  const [pSalL, setPSalL] = useState("");
  const [pArr,  setPArr]  = useState("");
  const [pArrL, setPArrL] = useState("");

  /* ── Paso 5: Notaría ── */
  const [nNot,  setNNot]  = useState("");
  const [nCir,  setNCir]  = useState("");
  const [nDia,  setNDia]  = useState("");
  const [nHr,   setNHr]   = useState("");
  const [fCiu,  setFCiu]  = useState("");
  const [fDia,  setFDia]  = useState(String(new Date().getDate()));
  const [fMes,  setFMes]  = useState(MO[new Date().getMonth()]);
  const [fAnio, setFAnio] = useState(String(new Date().getFullYear()));

  const total = PSTEPS.length;
  const pct   = Math.round(((step + 1) / total) * 100);

  const handleDone = () => onDone(buildPromesa({
    vN, vCity, vCC, vExp, vAct, vRN, vRNit, vRC,
    cN, cCity, cCC, cExp, cAct, cRN, cRNit, cRC,
    iCalle, iNum, iBrr, iCiu, iMt, iNorte, iSur, iOriente, iOcc, iCat,
    tCA, tEsc, tFEsc, tNot, tCir, tFReg, tFol, tOfi, tCircReg,
    pTot, pTotL, pC1, pC1L, pC1F, pSal, pSalL, pArr, pArrL,
    nNot, nCir, nDia, nHr, fCiu, fDia, fMes, fAnio,
  }));

  /* ── Estilos compartidos ── */
  const IS2 = { width:"100%", padding:"13px 15px", border:"none", borderRadius:12, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 4px rgba(0,0,0,.07)", display:"block" };

  /* ── Sub-componentes internos ── */
  const TopBar = () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", background:PBG, borderBottom:"1px solid rgba(0,0,0,.06)", position:"sticky", top:0, zIndex:50 }}>
      <button onClick={step===0 ? onBack : () => setStep(s => s-1)}
        style={{ padding:"8px 18px", background:"white", border:"none", borderRadius:50, fontWeight:700, fontSize:12, cursor:"pointer", color:"#374151", boxShadow:"0 1px 3px rgba(0,0,0,.1)" }}>
        {step===0 ? "✕ Cerrar" : "← Atrás"}
      </button>
      <div style={{ position:"relative", width:130, height:34, borderRadius:50, overflow:"hidden", background:"#D4D4C8", flexShrink:0 }}>
        <div style={{ position:"absolute", top:0, left:0, bottom:0, width:`${pct}%`, background:aC, borderRadius:50, transition:"width .35s ease" }}/>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:12, fontWeight:900, color:"white", textShadow:"0 1px 3px rgba(0,0,0,.4)", zIndex:1 }}>{step+1} de {total}</span>
        </div>
      </div>
      {step===total-1
        ? <button onClick={handleDone} style={{ padding:"8px 18px", background:aC, border:"none", borderRadius:50, fontWeight:800, fontSize:12, cursor:"pointer", color:"white" }}>✅ Generar</button>
        : <div style={{ width:80 }}/>
      }
    </div>
  );

  const Tabs = () => (
    <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none", borderBottom:"1.5px solid rgba(0,0,0,.07)", background:PBG, padding:"0 14px" }}>
      {PSTEPS.map((s, i) => (
        <button key={i} onClick={() => i <= step && setStep(i)}
          style={{ padding:"10px 11px", background:"none", border:"none", borderBottom:`2.5px solid ${step===i ? aC : "transparent"}`, fontWeight: step===i ? 800 : 500, fontSize:11, cursor: i<=step ? "pointer" : "default", color: step===i ? "#0F172A" : i<step ? aC : "#94A3B8", whiteSpace:"nowrap", flexShrink:0, transition:"all .15s", marginBottom:-1.5 }}>
          {i < step ? "✓ " : ""}{s}
        </button>
      ))}
    </div>
  );

  const Nxt = () => (
    <div style={{ paddingTop:20, paddingBottom:32, position:"sticky", bottom:0, background:`linear-gradient(transparent,${PBG} 40%)`, marginTop:8 }}>
      {step < total-1
        ? <button onClick={() => setStep(s => s+1)}
            style={{ width:"100%", padding:"16px", background:aC, color:"white", border:"none", borderRadius:50, fontWeight:900, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:`0 5px 20px ${aC}55` }}>
            siguiente <span style={{ fontSize:18 }}>›</span>
          </button>
        : <button onClick={handleDone}
            style={{ width:"100%", padding:"16px", background:`linear-gradient(135deg,${aC},#9a3412)`, color:"white", border:"none", borderRadius:50, fontWeight:900, fontSize:15, cursor:"pointer", boxShadow:`0 5px 20px ${aC}55` }}>
            🏠 Generar Promesa de Compraventa
          </button>
      }
    </div>
  );

  const Cd = ({ title, icon, children }) => (
    <div style={{ background:"white", borderRadius:16, padding:18, marginBottom:14, boxShadow:"0 1px 6px rgba(0,0,0,.06)" }}>
      {title && (
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14, paddingBottom:9, borderBottom:`2px solid ${aC}15` }}>
          {icon && <span style={{ fontSize:16 }}>{icon}</span>}
          <span style={{ fontWeight:800, fontSize:12, color:aC, textTransform:"uppercase", letterSpacing:.4 }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  );

  const Fg = ({ label, req, children }) => (
    <div style={{ marginBottom:11 }}>
      <div style={{ fontSize:10.5, fontWeight:700, color:"#6b7280", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>
        {label}{req && <span style={{ color:"#ef4444" }}> *</span>}
      </div>
      {children}
    </div>
  );

  const Rw = ({ children }) => <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>{children}</div>;

  const In = ({ value, onChange, placeholder }) => (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS2}/>
  );

  const MoneyIn = ({ label, value, onChange, req }) => (
    <Fg label={label} req={req}>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontWeight:700, color:"#6b7280", fontSize:13 }}>$</span>
        <input value={value} onChange={e => onChange(fMoney(e.target.value))} placeholder="0" style={{ ...IS2, paddingLeft:24 }}/>
      </div>
    </Fg>
  );

  /* ── Sección reutilizable de datos de parte (vendedor / comprador) ── */
  const Parte = ({ title, n, setN, city, setCity, cc, setCC, exp, setExp, act, setAct, rn, setRn, rnit, setRnit, rc, setRc }) => (
    <>
      <Cd title={title} icon="🪪">
        <Fg label="Nombre completo" req><In value={n} onChange={setN} placeholder="NOMBRE APELLIDO APELLIDO"/></Fg>
        <Rw>
          <Fg label="Ciudad domicilio"><In value={city} onChange={setCity} placeholder="Cali"/></Fg>
          <Fg label="Cédula" req>
            <div>
              <In value={cc} onChange={setCC} placeholder="1234567890"/>
              {cc && <div style={{ fontSize:10, color:aC, fontWeight:700, marginTop:3 }}>→ {fCC(cc)}</div>}
            </div>
          </Fg>
        </Rw>
        <Fg label="Expedida en"><In value={exp} onChange={setExp} placeholder="Cali"/></Fg>
      </Cd>

      <Cd title="Actúa a nombre de" icon="⚖️">
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          {[["propio","👤 Nombre propio"],["representacion","🏢 Representación legal"]].map(([val, lab]) => (
            <button key={val} onClick={() => setAct(val)}
              style={{ flex:1, padding:"11px 8px", background: act===val ? aC : "white", color: act===val ? "white" : "#374151", border:`2px solid ${act===val ? aC : "#E2E8F0"}`, borderRadius:11, fontWeight:700, fontSize:11, cursor:"pointer", transition:"all .15s" }}>
              {lab}
            </button>
          ))}
        </div>
        {act === "representacion" && (
          <>
            <Fg label="Nombre persona jurídica"><In value={rn}   onChange={setRn}   placeholder="EMPRESA S.A.S."/></Fg>
            <Rw>
              <Fg label="NIT"><In value={rnit} onChange={setRnit} placeholder="900.123.456-7"/></Fg>
              <Fg label="Ciudad empresa"><In value={rc} onChange={setRc} placeholder="Cali"/></Fg>
            </Rw>
          </>
        )}
      </Cd>
    </>
  );

  /* ────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ background:PBG, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <TopBar/><Tabs/>
      <div style={{ flex:1, padding:"18px 16px 0", maxWidth:640, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>

        {/* ─── PASO 0: VENDEDOR ─── */}
        {step===0 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>Prometiente Vendedor</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Quien vende el inmueble</p>
            <Parte title="Datos del Vendedor" n={vN} setN={setVN} city={vCity} setCity={setVCity} cc={vCC} setCC={setVCC} exp={vExp} setExp={setVExp} act={vAct} setAct={setVAct} rn={vRN} setRn={setVRN} rnit={vRNit} setRnit={setVRNit} rc={vRC} setRc={setVRC}/>
            <Nxt/>
          </div>
        )}

        {/* ─── PASO 1: COMPRADOR ─── */}
        {step===1 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>Prometiente Comprador</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Quien compra el inmueble</p>
            <Parte title="Datos del Comprador" n={cN} setN={setCN} city={cCity} setCity={setCCity} cc={cCC} setCC={setCCC} exp={cExp} setExp={setCExp} act={cAct} setAct={setCAct} rn={cRN} setRn={setCRN} rnit={cRNit} setRnit={setCRNit} rc={cRC} setRc={setCRC}/>
            <Nxt/>
          </div>
        )}

        {/* ─── PASO 2: INMUEBLE ─── */}
        {step===2 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>El Inmueble</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Cláusula Primera — Objeto</p>

            <Cd title="Ubicación" icon="📍">
              <Rw>
                <Fg label="Calle / Carrera" req><In value={iCalle} onChange={setICalle} placeholder="Calle 25"/></Fg>
                <Fg label="Número"><In value={iNum} onChange={setINum} placeholder="# 34-56 Apto 301"/></Fg>
              </Rw>
              <Fg label="Urbanización / Barrio"><In value={iBrr} onChange={setIBrr} placeholder="Ciudad Jardín"/></Fg>
              <Rw>
                <Fg label="Ciudad"><In value={iCiu} onChange={setICiu} placeholder="Cali"/></Fg>
                <Fg label="Metros cuadrados"><In value={iMt} onChange={setIMt} placeholder="72"/></Fg>
              </Rw>
              <Fg label="Cédula catastral"><In value={iCat} onChange={setICat} placeholder="000-000000-000"/></Fg>
            </Cd>

            <Cd title="Linderos" icon="🧭">
              <div style={{ background:"#FEF3C7", borderRadius:9, padding:"7px 12px", marginBottom:12, fontSize:11, color:"#92400E", fontWeight:600 }}>
                📌 Describe con qué limita el predio en cada punto cardinal
              </div>
              <Fg label="Por el Norte"><In value={iNorte}   onChange={setINorte}   placeholder="con predio de Juan García"/></Fg>
              <Fg label="Por el Sur"><In value={iSur}       onChange={setISur}     placeholder="con Calle 25"/></Fg>
              <Fg label="Por el Oriente"><In value={iOriente} onChange={setIOriente} placeholder="con predio de María López"/></Fg>
              <Fg label="Por el Occidente"><In value={iOcc}  onChange={setIOcc}    placeholder="con Carrera 34"/></Fg>
            </Cd>
            <Nxt/>
          </div>
        )}

        {/* ─── PASO 3: TRADICIÓN ─── */}
        {step===3 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>Tradición</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Cláusula Segunda — Cómo adquirió el vendedor</p>

            <Cd title="Escritura de adquisición" icon="📜">
              <Fg label="Comprado a (anterior propietario)"><In value={tCA} onChange={setTCA} placeholder="PEDRO LUIS MARTÍNEZ CANO"/></Fg>
              <Rw>
                <Fg label="N° Escritura pública"><In value={tEsc}  onChange={setTEsc}  placeholder="2345"/></Fg>
                <Fg label="Fecha de la escritura"><In value={tFEsc} onChange={setTFEsc} placeholder="15 de marzo de 2018"/></Fg>
              </Rw>
              <Rw>
                <Fg label="Notaría N°"><In value={tNot} onChange={setTNot} placeholder="5"/></Fg>
                <Fg label="Círculo notarial"><In value={tCir} onChange={setTCir} placeholder="Cali"/></Fg>
              </Rw>
            </Cd>

            <Cd title="Registro inmobiliario" icon="🏛️">
              <Rw>
                <Fg label="Fecha de registro"><In value={tFReg} onChange={setTFReg} placeholder="20 de abril de 2018"/></Fg>
                <Fg label="N° Folio matrícula"><In value={tFol}  onChange={setTFol}  placeholder="370-123456"/></Fg>
              </Rw>
              <Fg label="Oficina de Registro (principal o seccional)"><In value={tOfi} onChange={setTOfi} placeholder="Principal"/></Fg>
              <Fg label="Círculo registral"><In value={tCircReg} onChange={setTCircReg} placeholder="Cali"/></Fg>
            </Cd>
            <Nxt/>
          </div>
        )}

        {/* ─── PASO 4: PRECIO & ARRAS ─── */}
        {step===4 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>Precio & Arras</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Cláusulas Cuarta y Quinta</p>

            <Cd title="Precio total del inmueble" icon="💰">
              <MoneyIn label="Precio total" value={pTot} onChange={setPTot} req/>
              <Fg label="En letras"><In value={pTotL} onChange={setPTotL} placeholder="CIENTO OCHENTA MILLONES DE PESOS M/CTE"/></Fg>
            </Cd>

            <Cd title="Cuota inicial — a la firma de la promesa" icon="💳">
              <MoneyIn label="Valor cuota inicial" value={pC1} onChange={setPC1}/>
              <Fg label="En letras"><In value={pC1L} onChange={setPC1L} placeholder="DIEZ MILLONES DE PESOS M/CTE"/></Fg>
              <Fg label="Forma de pago">
                <select value={pC1F} onChange={e => setPC1F(e.target.value)} style={{ ...IS2, cursor:"pointer" }}>
                  {["efectivo","cheque de gerencia","transferencia bancaria","cheque","consignación bancaria"].map(v => <option key={v}>{v}</option>)}
                </select>
              </Fg>
            </Cd>

            <Cd title="Saldo — al otorgamiento de la escritura pública" icon="🏦">
              <MoneyIn label="Valor del saldo" value={pSal} onChange={setPSal}/>
              <Fg label="En letras"><In value={pSalL} onChange={setPSalL} placeholder="CIENTO SETENTA MILLONES DE PESOS M/CTE"/></Fg>
            </Cd>

            <Cd title="Arras confirmatorias" icon="🤝">
              <div style={{ background:"#EFF6FF", borderRadius:9, padding:"7px 12px", marginBottom:11, fontSize:11, color:"#1D4ED8", fontWeight:600 }}>
                ℹ️ Si el comprador incumple las pierde · Si incumple el vendedor devuelve el doble
              </div>
              <MoneyIn label="Valor de las arras" value={pArr} onChange={setPArr}/>
              <Fg label="En letras"><In value={pArrL} onChange={setPArrL} placeholder="DIEZ MILLONES DE PESOS M/CTE"/></Fg>
            </Cd>
            <Nxt/>
          </div>
        )}

        {/* ─── PASO 5: NOTARÍA & FIRMA ─── */}
        {step===5 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>Notaría & Firma</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Cláusula Séptima — Escritura y fecha de firma</p>

            <Cd title="Notaría para la escritura definitiva" icon="⚖️">
              <Rw>
                <Fg label="Notaría N°"><In value={nNot} onChange={setNNot} placeholder="5"/></Fg>
                <Fg label="Círculo"><In value={nCir} onChange={setNCir} placeholder="Cali"/></Fg>
              </Rw>
              <Rw>
                <Fg label="Día / fecha de escritura"><In value={nDia} onChange={setNDia} placeholder="15 de agosto de 2025"/></Fg>
                <Fg label="Hora"><In value={nHr} onChange={setNHr} placeholder="10:00 a.m."/></Fg>
              </Rw>
            </Cd>

            <Cd title="Firma de esta promesa" icon="✍️">
              <Rw>
                <Fg label="Ciudad" req><In value={fCiu} onChange={setFCiu} placeholder="Cali"/></Fg>
                <Fg label="Día" req><In value={fDia} onChange={setFDia} placeholder="15"/></Fg>
              </Rw>
              <Rw>
                <Fg label="Mes" req>
                  <select value={fMes} onChange={e => setFMes(e.target.value)} style={{ ...IS2, cursor:"pointer" }}>
                    {MO.map(m => <option key={m}>{m}</option>)}
                  </select>
                </Fg>
                <Fg label="Año" req><In value={fAnio} onChange={setFAnio} placeholder="2025"/></Fg>
              </Rw>
            </Cd>
            <Nxt/>
          </div>
        )}

        {/* ─── PASO 6: RESUMEN ─── */}
        {step===6 && (
          <div className="step-in">
            <h1 style={{ fontSize:26, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:4, marginTop:6 }}>Resumen</h1>
            <p style={{ textAlign:"center", color:"#64748B", fontSize:12, marginBottom:18 }}>Revisa antes de generar</p>

            <Cd title="Datos del contrato" icon="📋">
              {[
                ["🏠 Vendedor",            UC(vN) || "—"],
                ["🛒 Comprador",           UC(cN) || "—"],
                ["📍 Inmueble",            [iCalle, iNum, UC(iBrr), UC(iCiu)].filter(Boolean).join(", ") || "—"],
                ["📐 Área",                iMt ? `${iMt} m²` : "—"],
                ["💰 Precio total",        pTot ? `$${fMoney(pTot)}` : "—"],
                ["💳 Cuota inicial",       pC1  ? `$${fMoney(pC1)} — ${pC1F}` : "—"],
                ["🏦 Saldo al escriturar", pSal ? `$${fMoney(pSal)}` : "—"],
                ["🤝 Arras",              pArr ? `$${fMoney(pArr)}` : "—"],
                ["✍️ Firma promesa",       fCiu ? `${UC(fCiu)}, ${fDia} de ${fMes} de ${fAnio}` : "—"],
                ["⚖️ Escritura",           nNot ? `Notaría ${nNot} de ${UC(nCir)}, ${nDia} a las ${nHr}` : "—"],
              ].map(([k, v], i, arr) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom: i < arr.length-1 ? "1px solid #F1F5F9" : "none", gap:10, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#6b7280", whiteSpace:"nowrap" }}>{k}</span>
                  <span style={{ fontSize:11, color:"#0f172a", textAlign:"right", fontWeight:600, maxWidth:"60%" }}>{v}</span>
                </div>
              ))}
            </Cd>
            <Nxt/>
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PROMESA PREVIEW — vista previa con exportación
══════════════════════════════════════════════════════════════════════════ */
export function PromesaPreview({ docText, onBack, onNew, notify }) {
  const [expSt,     setExpSt]    = useState({ w:false, p:false, i:false });
  const [showWA,    setShowWA]   = useState(false);
  const [editText,  setEditText] = useState(docText);

  const fn = ext => `${iso()}_PROMESA_COMPRAVENTA_INMUEBLE.${ext}`;

  const doW = async () => {
    setExpSt(p => ({ ...p, w:true }));
    try { await expWord(editText, fn("docx")); notify && notify("📄 Word descargado"); }
    catch (e) { alert(e.message); }
    setExpSt(p => ({ ...p, w:false }));
  };
  const doP = async () => {
    setExpSt(p => ({ ...p, p:true }));
    try { await expFromEl("PROM-DOC", fn("pdf"), "pdf"); notify && notify("📕 PDF descargado"); }
    catch (e) { alert(e.message); }
    setExpSt(p => ({ ...p, p:false }));
  };
  const doI = async () => {
    setExpSt(p => ({ ...p, i:true }));
    try { await expFromEl("PROM-DOC", fn("png"), "png"); notify && notify("🖼 Imagen descargada"); }
    catch (e) { alert(e.message); }
    setExpSt(p => ({ ...p, i:false }));
  };
  const doPrint = () => {
    const s = document.createElement("style");
    s.textContent = `@media print{body *{visibility:hidden!important}#PROM-DOC,#PROM-DOC *{visibility:visible!important}#PROM-DOC{position:fixed!important;top:0!important;left:0!important;width:100%!important;padding:2cm 2.5cm!important}@page{size:letter;margin:2cm 2.5cm}}`;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const Btn = ({ onClick, bg, dis, ch }) => (
    <button onClick={onClick} disabled={dis}
      style={{ padding:"8px 13px", background: dis ? "#9CA3AF" : bg, color:"white", border:"none", borderRadius:9, fontWeight:700, fontSize:11, cursor: dis ? "wait" : "pointer", whiteSpace:"nowrap" }}>
      {ch}
    </button>
  );

  /* Renderiza el texto del documento con formato */
  const renderDoc = () => editText.split("\n").map((line, i) => {
    const t = line.trim();
    if (t === "PROMESA DE COMPRAVENTA DE BIEN INMUEBLE")
      return <p key={i} style={{ textAlign:"center", fontWeight:900, fontSize:14, marginTop:0, marginBottom:18, letterSpacing:.3, textDecoration:"underline", fontFamily:"Arial,sans-serif" }}>{t}</p>;
    if (!t)
      return <div key={i} style={{ height:9 }}/>;
    if (/^(Primera|Segunda|Tercera|Cuarta|Quinta|Sexta|Séptima|Octava|Novena|Décima)[.:—]/.test(t)) {
      const dash = t.indexOf("—");
      return (
        <p key={i} style={{ margin:"0 0 2px", lineHeight:1.85, textAlign:"justify", fontSize:12, fontFamily:"Arial,sans-serif" }}>
          {dash > -1 ? <><strong>{t.slice(0, dash+1)}</strong>{t.slice(dash+1)}</> : <strong>{t}</strong>}
        </p>
      );
    }
    return <p key={i} style={{ margin:"0 0 2px", lineHeight:1.85, textAlign:"justify", fontSize:12, fontFamily:"Arial,sans-serif" }}>{t}</p>;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9" }}>
      {showWA && <WAModal text={editText} onClose={() => setShowWA(false)}/>}

      {/* Barra de acciones */}
      <div style={{ background:"white", borderBottom:"2px solid #E2E8F0", padding:"10px 16px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", position:"sticky", top:0, zIndex:50 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:aC, cursor:"pointer", fontSize:12, fontWeight:700 }}>← Editar</button>
        <div style={{ width:1, height:18, background:"#E2E8F0" }}/>
        <div style={{ background:"#FEF3C7", color:"#92400E", padding:"3px 10px", borderRadius:7, fontSize:10, fontWeight:800 }}>🏠 Promesa Compraventa Inmueble</div>
        <div style={{ flex:1 }}/>
        <Btn onClick={doPrint}              bg="#0F172A"  ch="🖨️"/>
        <Btn onClick={doW}  dis={expSt.w}  bg="#1D4ED8"  ch={expSt.w ? "⏳" : "📄 Word"}/>
        <Btn onClick={doP}  dis={expSt.p}  bg="#DC2626"  ch={expSt.p ? "⏳" : "📕 PDF"}/>
        <Btn onClick={doI}  dis={expSt.i}  bg="#7C3AED"  ch={expSt.i ? "⏳" : "🖼"}/>
        <Btn onClick={() => setShowWA(true)} bg="#16A34A" ch="📲 WA"/>
        <Btn onClick={onNew}               bg="#10B981"  ch="✅ Nuevo"/>
      </div>

      {/* Documento */}
      <div style={{ padding:"24px 16px", maxWidth:860, margin:"0 auto" }}>
        <div id="PROM-DOC" style={{ background:"white", borderRadius:12, border:"1px solid #E2E8F0", padding:"56px 72px", boxShadow:"0 4px 24px rgba(0,0,0,.06)", marginBottom:16 }}>
          {renderDoc()}

          {/* Firmas */}
          <div style={{ marginTop:48, fontFamily:"Arial,sans-serif" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, marginBottom:52 }}>
              {["PROMETIENTE VENDEDOR","PROMETIENTE COMPRADOR"].map((rol, i) => (
                <div key={i}>
                  <div style={{ borderTop:"1px solid #222", marginBottom:6, paddingTop:4 }}/>
                  <div style={{ fontSize:11, marginBottom:2 }}>Nombre:</div>
                  <div style={{ fontSize:11, marginBottom:8 }}>cc.:</div>
                  <div style={{ fontWeight:700, fontSize:11 }}>{rol}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48 }}>
              {["Testigo","Testigo"].map((rol, i) => (
                <div key={i}>
                  <div style={{ borderTop:"1px solid #222", marginBottom:6, paddingTop:4 }}/>
                  <div style={{ fontSize:11, marginBottom:2 }}>Nombre:</div>
                  <div style={{ fontSize:11, marginBottom:8 }}>cc.:</div>
                  <div style={{ fontWeight:700, fontSize:11 }}>{rol}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#64748B", marginBottom:5 }}>✏️ Ajusta si necesitas cambiar algo:</div>
          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={14}
            style={{ width:"100%", padding:"12px 14px", border:"2px solid #E2E8F0", borderRadius:10, fontSize:12, lineHeight:1.7, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"Arial,sans-serif" }}/>
        </div>

        {/* Info */}
        <div style={{ background:"#FEF3C7", border:"1px solid #FDE68A", borderRadius:8, padding:"7px 14px", fontSize:10, color:"#92400E", fontWeight:600 }}>
          📁 {fn("docx")} · Para firma lleva el documento impreso, cédulas de ambas partes y dos testigos.
        </div>
      </div>
    </div>
  );
}
