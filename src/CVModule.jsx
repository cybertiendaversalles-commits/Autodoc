/* eslint-disable */
// ══════════════════════════════════════════════════════════════════════════
//  CVModule.jsx  —  Módulo: HOJAS DE VIDA
//  AutoDoc · Colombia · Cali
//
//  CONTIENE:
//  ✅ 5 plantillas visuales (CVCronologica, CVSidebarTimeline, CVAtsLimpia,
//                            CVMixta, CVFuncional)
//  ✅ CV_TMPLS — registro de plantillas con metadata
//  ✅ TemplatePreviewCard — miniatura visual de cada plantilla
//  ✅ HVChooser — pantalla de selección de plantilla
//  ✅ HVWizard — wizard paso a paso (7 pasos)
//  ✅ HVPreview — vista previa con exportación PDF/Word/Imagen
//
//  INTEGRACIÓN EN AutoDoc_v16.jsx:
//  1) Importa:
//     import { HVChooser, HVWizard, HVPreview } from "./CVModule";
//
//  2) Añade states:
//     const [hvTemplate, setHvTemplate] = useState(null);
//     const [hvResult,   setHvResult]   = useState(null);
//
//  3) Añade rutas ANTES del return principal:
//
//     if (view === "hv-choose")
//       return <HVChooser
//         onBack={() => setView(selCat ? "cat" : "home")}
//         onSelect={tmpl => { setHvTemplate(tmpl); setView("hv-wizard"); }}
//       />;
//
//     if (view === "hv-wizard" && hvTemplate)
//       return <HVWizard
//         template={hvTemplate}
//         onBack={() => setView("hv-choose")}
//         onGenerate={async result => {
//           setHvResult(result);
//           setView("hv-preview");
//           // guardar historial...
//           notify("✅ Hoja de vida generada");
//         }}
//       />;
//
//     if (view === "hv-preview" && hvResult)
//       return <HVPreview
//         {...hvResult}
//         onBack={() => setView("hv-wizard")}
//         onNew={resetAll}
//       />;
//
//  4) En la sección HOME, el banner de HV llama:
//     onClick={() => { setSelCat(CATS.find(c=>c.id==="hojasvida")); setView("hv-choose"); }}
//
//  5) En la sección CATEGORÍA, el botón "Crear →" de hojasvida llama:
//     onClick={() => { setSelTipo(tipo); setView("hv-choose"); }}
// ══════════════════════════════════════════════════════════════════════════

import { useState, useRef, memo } from "react";
import { UC, iso, callAI, SYS_CV_JSON, expFromEl, expWord, WAModal } from "./SharedComponents";

/* ══════════════════════════════════════════════════════════════════════════
   5 PLANTILLAS VISUALES
══════════════════════════════════════════════════════════════════════════ */

/* ── 1. CRONOLÓGICA INVERSA ──────────────────────────────────────────── */
export function CVCronologica({ cv, photo }) {
  const a = "#1A56DB";
  const Sec = ({ t, ch }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:13, fontWeight:900, color:"#111", letterSpacing:.2, textTransform:"uppercase" }}>{t}</span>
      </div>
      <div style={{ height:2, background:`linear-gradient(90deg,${a},#93c5fd)`, marginBottom:12, borderRadius:1 }}/>
      {ch}
    </div>
  );

  return (
    <div id="CV-RENDER" style={{ width:794, minHeight:1122, background:"white", fontFamily:"Arial,sans-serif", fontSize:11, color:"#1a1a1a", padding:"36px 44px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:30, fontWeight:900, color:"#0f172a", letterSpacing:"-.5px", marginBottom:4, lineHeight:1 }}>{cv.nombre || "NOMBRE COMPLETO"}</div>
          <div style={{ fontSize:13, color:a, fontWeight:700, marginBottom:10 }}>{cv.cargo_aspirado}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 18px" }}>
            {[cv.email && `@ ${cv.email}`, cv.telefono && `✆ ${cv.telefono}`, cv.ciudad && `⊙ ${cv.ciudad}`].filter(Boolean).map((v, i) => (
              <span key={i} style={{ fontSize:10, color:"#374151" }}>{v}</span>
            ))}
          </div>
        </div>
        {photo && <img src={photo} alt="" style={{ width:88, height:88, objectFit:"cover", borderRadius:"50%", border:`3px solid ${a}`, marginLeft:20, flexShrink:0 }}/>}
      </div>
      <div style={{ height:1, background:"#e2e8f0", margin:"16px 0 18px" }}/>

      {cv.perfil && <Sec t="RESUMEN" ch={<p style={{ lineHeight:1.75, color:"#374151", margin:0, fontSize:11, textAlign:"justify" }}>{cv.perfil}</p>}/>}

      {cv.experiencia?.length > 0 && <Sec t="EXPERIENCIA" ch={cv.experiencia.map((e, i) => (
        <div key={i} style={{ marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:12, color:"#0f172a" }}>{e.cargo}</div>
          <div style={{ color:a, fontSize:11, fontWeight:700, marginBottom:2 }}>{e.empresa}</div>
          <div style={{ fontSize:9.5, color:"#6b7280", marginBottom:6, display:"flex", gap:12 }}>
            <span>🗓 {e.desde} - {e.hasta || "Presente"}</span>{e.ciudad && <span>⊙ {e.ciudad}</span>}
          </div>
          {e.funciones?.map((f, j) => (
            <div key={j} style={{ fontSize:10.5, color:"#374151", marginBottom:3, display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ color:a, flexShrink:0, marginTop:1 }}>•</span>{f}
            </div>
          ))}
        </div>
      ))}/>}

      {cv.formacion?.length > 0 && <Sec t="EDUCACIÓN" ch={cv.formacion.map((f, i) => (
        <div key={i} style={{ marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:11, color:"#0f172a" }}>{f.titulo}</div>
          <div style={{ color:a, fontSize:11, fontWeight:600 }}>{f.institucion}</div>
          <div style={{ fontSize:9.5, color:"#6b7280" }}>{f.año}{f.ciudad ? ` ⊙ ${f.ciudad}` : ""}</div>
        </div>
      ))}/>}

      {cv.habilidades?.length > 0 && <Sec t="HABILIDADES" ch={
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {cv.habilidades.map((h, i) => <span key={i} style={{ background:"#eff6ff", color:a, border:`1px solid ${a}40`, padding:"3px 10px", borderRadius:4, fontSize:10, fontWeight:600 }}>{h}</span>)}
        </div>
      }/>}

      {cv.logros?.length > 0 && <Sec t="LOGROS" ch={
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {cv.logros.map((l, i) => (
            <div key={i} style={{ background:"#eff6ff", borderRadius:8, padding:"10px 12px", display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ color:a, fontSize:14, flexShrink:0 }}>◈</span>
              <span style={{ fontSize:10, color:"#1e3a5f", lineHeight:1.5 }}>{l}</span>
            </div>
          ))}
        </div>
      }/>}

      {cv.referencias?.length > 0 && <Sec t="REFERENCIAS" ch={
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {cv.referencias.map((r, i) => (
            <div key={i} style={{ fontSize:10.5 }}>
              <div style={{ fontWeight:700, color:"#0f172a" }}>{r.nombre}</div>
              <div style={{ color:a }}>{r.cargo}{r.empresa ? ` · ${r.empresa}` : ""}</div>
              {r.telefono && <div style={{ color:"#6b7280" }}>{r.telefono}</div>}
            </div>
          ))}
        </div>
      }/>}
    </div>
  );
}

/* ── 2. SIDEBAR + TIMELINE ───────────────────────────────────────────── */
export function CVSidebarTimeline({ cv, photo }) {
  const sb = "#3d4852"; const light = "#cbd5e1";
  const stars = n => "★".repeat(Math.min(5, n || 5)) + "☆".repeat(Math.max(0, 5 - (n || 5)));

  const SS = ({ t, ch }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:8.5, fontWeight:800, color:light, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>{t}</div>
      {ch}
    </div>
  );
  const MS = ({ t, ch }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:28, height:28, background:"#1e293b", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <div style={{ width:10, height:10, border:"2px solid #64748b", borderRadius:"50%" }}/>
        </div>
        <span style={{ fontSize:12, fontWeight:900, color:"#0f172a", textTransform:"uppercase", letterSpacing:.5 }}>{t}</span>
      </div>
      <div style={{ height:1, background:"#e2e8f0", marginBottom:12 }}/>
      {ch}
    </div>
  );

  return (
    <div id="CV-RENDER" style={{ width:794, minHeight:1122, background:"white", display:"flex", fontFamily:"Arial,sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width:230, background:sb, padding:"32px 20px", flexShrink:0, display:"flex", flexDirection:"column" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          {photo
            ? <img src={photo} alt="" style={{ width:110, height:110, objectFit:"cover", borderRadius:"50%", border:"4px solid #94a3b8", display:"block", margin:"0 auto 14px" }}/>
            : <div style={{ width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,.08)", border:"3px solid rgba(255,255,255,.2)", margin:"0 auto 14px", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:36, opacity:.4 }}>👤</span></div>
          }
          <div style={{ fontSize:15, fontWeight:900, color:"white", lineHeight:1.3, marginBottom:5 }}>{cv.nombre}</div>
          <div style={{ fontSize:10, color:light, fontWeight:500, lineHeight:1.4 }}>{cv.cargo_aspirado}</div>
        </div>

        <SS t="Datos Personales" ch={
          <div>
            {[["Nombre", cv.nombre], cv.direccion && ["Dirección", cv.direccion], cv.barrio && ["Barrio", cv.barrio],
              cv.telefono && ["Teléfono", cv.telefono], cv.email && ["Correo", cv.email],
              cv.fecha_nacimiento && ["F. Nacimiento", cv.fecha_nacimiento], cv.cedula && ["C.C.", cv.cedula]
            ].filter(Boolean).map(([k, v], i) => (
              <div key={i} style={{ marginBottom:9 }}>
                <div style={{ fontSize:8.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:.5 }}>{k}</div>
                <div style={{ fontSize:9.5, color:"#e2e8f0", marginTop:1 }}>{v}</div>
              </div>
            ))}
          </div>
        }/>

        {cv.habilidades?.length > 0 && <SS t="Habilidades" ch={
          <div>
            {cv.habilidades.map((h, i) => (
              <div key={i} style={{ marginBottom:7 }}>
                <div style={{ fontSize:9.5, color:"#e2e8f0", marginBottom:3 }}>{h}</div>
                <div style={{ color:"#f59e0b", fontSize:11, letterSpacing:1 }}>{stars(5)}</div>
              </div>
            ))}
          </div>
        }/>}

        {cv.idiomas?.length > 0 && <SS t="Idiomas" ch={cv.idiomas.map((id, i) => (
          <div key={i} style={{ marginBottom:7 }}>
            <div style={{ fontSize:9.5, color:"#e2e8f0", marginBottom:2 }}>{id.idioma}</div>
            <div style={{ color:"#f59e0b", fontSize:10, letterSpacing:1 }}>{stars(id.nivel === "Nativo" ? 5 : id.nivel === "Avanzado" ? 4 : id.nivel === "Intermedio" ? 3 : 2)}</div>
          </div>
        ))}/>}
      </div>

      {/* Contenido principal */}
      <div style={{ flex:1, padding:"32px 28px", overflow:"hidden" }}>
        {cv.nombre && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:22, fontWeight:900, color:"#0f172a", letterSpacing:"-.5px" }}>{cv.nombre}</div>
            {cv.perfil && <p style={{ fontSize:10.5, lineHeight:1.7, color:"#374151", margin:"8px 0 0", textAlign:"justify" }}>{cv.perfil}</p>}
            <div style={{ height:1, background:"#e2e8f0", marginTop:16 }}/>
          </div>
        )}

        {cv.experiencia?.length > 0 && <MS t="Experiencia Laboral" ch={
          <div style={{ position:"relative", paddingLeft:20 }}>
            <div style={{ position:"absolute", left:6, top:0, bottom:0, width:2, background:"#e2e8f0" }}/>
            {cv.experiencia.map((e, i) => (
              <div key={i} style={{ marginBottom:16, position:"relative" }}>
                <div style={{ position:"absolute", left:-20, top:3, width:10, height:10, borderRadius:"50%", background:"white", border:"2px solid #64748b", zIndex:1 }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:2 }}>
                  <div style={{ fontWeight:800, fontSize:11.5, color:"#0f172a" }}>{e.cargo}</div>
                  <div style={{ fontSize:9, color:"#94a3b8", whiteSpace:"nowrap", marginLeft:8 }}>{e.desde} - {e.hasta || "Presente"}</div>
                </div>
                <div style={{ fontSize:10.5, color:"#374151", fontWeight:600, marginBottom:4 }}>{e.empresa}{e.ciudad ? ` · ${e.ciudad}` : ""}</div>
                {e.funciones?.map((f, j) => <div key={j} style={{ fontSize:10, color:"#4b5563", marginBottom:2, paddingLeft:10, position:"relative" }}><span style={{ position:"absolute", left:0 }}>•</span>{f}</div>)}
              </div>
            ))}
          </div>
        }/>}

        {cv.formacion?.length > 0 && <MS t="Educación" ch={
          <div style={{ position:"relative", paddingLeft:20 }}>
            <div style={{ position:"absolute", left:6, top:0, bottom:0, width:2, background:"#e2e8f0" }}/>
            {cv.formacion.map((f, i) => (
              <div key={i} style={{ marginBottom:12, position:"relative" }}>
                <div style={{ position:"absolute", left:-20, top:3, width:10, height:10, borderRadius:"50%", background:"white", border:"2px solid #64748b" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ fontWeight:700, fontSize:11 }}>{f.titulo}</div>
                  <div style={{ fontSize:9, color:"#94a3b8", whiteSpace:"nowrap", marginLeft:8 }}>{f.año}</div>
                </div>
                <div style={{ fontSize:10, color:"#374151" }}>{f.institucion}{f.ciudad ? ` · ${f.ciudad}` : ""}</div>
              </div>
            ))}
          </div>
        }/>}

        {cv.referencias?.length > 0 && <MS t="Referencias" ch={cv.referencias.map((r, i) => (
          <div key={i} style={{ marginBottom:10 }}>
            <div style={{ fontWeight:700, fontSize:11 }}>{r.nombre}</div>
            <div style={{ fontSize:10, color:"#374151" }}>{r.cargo}{r.empresa ? ` · ${r.empresa}` : ""}</div>
            {r.telefono && <div style={{ fontSize:10, color:"#64748b" }}>{r.telefono}</div>}
          </div>
        ))}/>}
      </div>
    </div>
  );
}

/* ── 3. ATS LIMPIA ───────────────────────────────────────────────────── */
export function CVAtsLimpia({ cv, photo }) {
  const Sec = ({ t, ch }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontWeight:900, fontSize:12, color:"#000", letterSpacing:.5, textTransform:"uppercase" }}>{t}</div>
      <div style={{ height:1.5, background:"#000", marginBottom:10, marginTop:3 }}/>
      {ch}
    </div>
  );

  return (
    <div id="CV-RENDER" style={{ width:794, minHeight:1122, background:"white", fontFamily:"Arial,sans-serif", fontSize:11, color:"#111", padding:"40px 52px" }}>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        {photo && <img src={photo} alt="" style={{ width:80, height:80, objectFit:"cover", borderRadius:"50%", border:"2px solid #ccc", display:"block", margin:"0 auto 12px" }}/>}
        <div style={{ fontSize:26, fontWeight:900, color:"#000", letterSpacing:.5, marginBottom:5 }}>{cv.nombre || "NOMBRE COMPLETO"}</div>
        <div style={{ fontSize:11, color:"#222", marginBottom:4 }}>{cv.cargo_aspirado}</div>
        <div style={{ fontSize:10.5, color:"#333" }}>{[cv.telefono, cv.email, cv.cedula && `C.C. ${cv.cedula}`, cv.ciudad].filter(Boolean).join(" - ")}</div>
      </div>

      {cv.perfil && <div style={{ marginBottom:18 }}><p style={{ lineHeight:1.8, color:"#222", margin:0, textAlign:"justify", fontSize:11 }}>{cv.perfil}</p></div>}

      {cv.experiencia?.length > 0 && <Sec t="Experiencia Laboral" ch={cv.experiencia.map((e, i) => (
        <div key={i} style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ fontWeight:700, fontSize:11.5, color:"#000" }}>{e.cargo}</div>
            <div style={{ fontSize:10, color:"#333", whiteSpace:"nowrap", marginLeft:8 }}>{e.desde} - {e.hasta || "Presente"}</div>
          </div>
          <div style={{ fontSize:11, color:"#333", fontStyle:"italic", marginBottom:5 }}>{e.empresa}{e.ciudad ? `, ${e.ciudad}` : ""}</div>
          {e.funciones?.map((f, j) => <div key={j} style={{ fontSize:10.5, color:"#222", marginBottom:3, paddingLeft:12 }}>• {f}</div>)}
        </div>
      ))}/>}

      {cv.formacion?.length > 0 && <Sec t="Educación" ch={cv.formacion.map((f, i) => (
        <div key={i} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <div style={{ fontWeight:700, fontSize:11 }}>{f.institucion}</div>
            <div style={{ fontSize:10, color:"#333" }}>{f.año}</div>
          </div>
          <div style={{ fontSize:11, color:"#333", fontStyle:"italic" }}>{f.titulo}</div>
        </div>
      ))}/>}

      {(cv.habilidades?.length > 0 || cv.idiomas?.length > 0) && <Sec t="Habilidades y Competencias" ch={
        <div>
          {cv.habilidades?.length > 0 && <div style={{ fontSize:10.5, marginBottom:4, color:"#222", paddingLeft:12 }}>• Competencias: {cv.habilidades.join(", ")}</div>}
          {cv.idiomas?.length > 0 && <div style={{ fontSize:10.5, marginBottom:4, color:"#222", paddingLeft:12 }}>• Idiomas: {cv.idiomas.map(id => `${id.idioma} (${id.nivel})`).join(", ")}</div>}
        </div>
      }/>}

      {cv.referencias?.length > 0 && <Sec t="Referencias" ch={cv.referencias.map((r, i) => (
        <div key={i} style={{ marginBottom:8, paddingLeft:12 }}>
          <div style={{ fontWeight:700, fontSize:10.5 }}>{r.nombre}</div>
          <div style={{ fontSize:10, color:"#333" }}>{r.cargo}{r.empresa ? ` · ${r.empresa}` : ""}</div>
          {r.telefono && <div style={{ fontSize:10, color:"#555" }}>Tel: {r.telefono}</div>}
        </div>
      ))}/>}
    </div>
  );
}

/* ── 4. MIXTA ELEGANTE ───────────────────────────────────────────────── */
export function CVMixta({ cv, photo }) {
  const Sec = ({ t, ch }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ textAlign:"center", marginBottom:6 }}>
        <span style={{ fontSize:11, fontWeight:700, color:"#374151", letterSpacing:1, textTransform:"uppercase" }}>{t}</span>
      </div>
      <div style={{ height:1, background:"#d1d5db", marginBottom:12 }}/>
      {ch}
    </div>
  );

  return (
    <div id="CV-RENDER" style={{ width:794, minHeight:1122, background:"white", fontFamily:"Arial,sans-serif", fontSize:11, color:"#1a1a1a", padding:"36px 52px" }}>
      <div style={{ textAlign:"center", marginBottom:6 }}>
        {photo && <img src={photo} alt="" style={{ width:80, height:80, objectFit:"cover", borderRadius:"50%", border:"3px solid #d1d5db", display:"block", margin:"0 auto 12px" }}/>}
        <div style={{ fontSize:22, fontWeight:900, color:"#111", letterSpacing:.5, marginBottom:4 }}>{cv.nombre || "NOMBRE COMPLETO"}</div>
        <div style={{ fontSize:11, color:"#374151", marginBottom:8 }}>{cv.cargo_aspirado}</div>
        <div style={{ fontSize:10, color:"#374151", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:"0 14px" }}>
          {[cv.email, cv.telefono, cv.ciudad].filter(Boolean).map((v, i) => <span key={i}>• {v}</span>)}
        </div>
      </div>
      <div style={{ height:2, background:"#111", margin:"14px 0 18px" }}/>

      {cv.perfil && <Sec t="Perfil profesional" ch={<p style={{ lineHeight:1.8, color:"#374151", margin:0, textAlign:"justify", fontSize:11 }}>{cv.perfil}</p>}/>}
      {cv.habilidades?.length > 0 && <Sec t="Habilidades clave" ch={<div style={{ fontSize:10.5, color:"#374151", textAlign:"center", lineHeight:1.8 }}>{cv.habilidades.join(", ")}</div>}/>}

      {cv.experiencia?.length > 0 && <Sec t="Experiencia" ch={cv.experiencia.map((e, i) => (
        <div key={i} style={{ marginBottom:16, paddingBottom:14, borderBottom: i < cv.experiencia.length - 1 ? "1px dashed #e5e7eb" : "none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:1 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:12, color:"#111" }}>{e.empresa}</div>
              <div style={{ fontSize:11, color:"#374151", fontStyle:"italic" }}>{e.cargo}</div>
            </div>
            <div style={{ fontSize:9.5, color:"#6b7280", textAlign:"right", whiteSpace:"nowrap", marginLeft:8 }}>{e.ciudad || ""}<br/>{e.desde} - {e.hasta || "Presente"}</div>
          </div>
          {e.funciones?.map((f, j) => <div key={j} style={{ fontSize:10.5, color:"#374151", marginBottom:3, paddingLeft:10 }}>• {f}</div>)}
        </div>
      ))}/>}

      {cv.formacion?.length > 0 && <Sec t="Educación" ch={cv.formacion.map((f, i) => (
        <div key={i} style={{ marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:11 }}>{f.institucion}</div>
            <div style={{ fontSize:10.5, color:"#374151", fontStyle:"italic" }}>{f.titulo}</div>
          </div>
          <div style={{ fontSize:9.5, color:"#6b7280", whiteSpace:"nowrap", marginLeft:8, textAlign:"right" }}>{f.año}</div>
        </div>
      ))}/>}

      {cv.referencias?.length > 0 && <Sec t="Referencias" ch={
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {cv.referencias.map((r, i) => (
            <div key={i} style={{ fontSize:10.5 }}>
              <div style={{ fontWeight:700 }}>{r.nombre}</div>
              <div style={{ color:"#374151" }}>{r.cargo}</div>
              <div style={{ color:"#374151", fontStyle:"italic" }}>{r.empresa}</div>
              {r.telefono && <div style={{ color:"#6b7280" }}>{r.telefono}</div>}
            </div>
          ))}
        </div>
      }/>}
    </div>
  );
}

/* ── 5. FUNCIONAL ────────────────────────────────────────────────────── */
export function CVFuncional({ cv, photo }) {
  const a = "#0f766e"; const lt = "#f0fdf4";
  const Sec = ({ t, ic, ch }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <div style={{ width:30, height:30, background:a, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14 }}>{ic || "▶"}</div>
        <span style={{ fontSize:12, fontWeight:800, color:"#0f172a", textTransform:"uppercase", letterSpacing:.5 }}>{t}</span>
      </div>
      <div style={{ height:2, background:`linear-gradient(90deg,${a}60,transparent)`, marginBottom:12 }}/>
      {ch}
    </div>
  );

  return (
    <div id="CV-RENDER" style={{ width:794, minHeight:1122, background:"white", fontFamily:"Arial,sans-serif", fontSize:11, color:"#1a1a1a" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#0f766e,#0d9488)`, padding:"28px 40px", display:"flex", gap:20, alignItems:"center" }}>
        {photo
          ? <img src={photo} alt="" style={{ width:90, height:90, objectFit:"cover", borderRadius:"50%", border:"4px solid rgba(255,255,255,.4)", flexShrink:0 }}/>
          : <div style={{ width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,.1)", border:"3px dashed rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ fontSize:28, opacity:.5 }}>👤</span></div>
        }
        <div style={{ flex:1 }}>
          <div style={{ fontSize:24, fontWeight:900, color:"white", marginBottom:3, letterSpacing:"-.3px" }}>{cv.nombre || "NOMBRE COMPLETO"}</div>
          <div style={{ fontSize:12, color:"#99f6e4", fontWeight:600, marginBottom:10 }}>{cv.cargo_aspirado}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 14px" }}>
            {[cv.telefono && `📞 ${cv.telefono}`, cv.email && `✉ ${cv.email}`, cv.ciudad && `📍 ${cv.ciudad}`, cv.cedula && `C.C. ${cv.cedula}`].filter(Boolean).map((v, i) => (
              <span key={i} style={{ fontSize:9.5, color:"#ccfbf1" }}>{v}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ padding:"24px 40px" }}>
        {cv.perfil && <div style={{ background:lt, borderRadius:10, padding:"14px 16px", marginBottom:20, borderLeft:`4px solid ${a}` }}>
          <p style={{ lineHeight:1.75, color:"#065f46", margin:0, fontSize:11 }}>{cv.perfil}</p>
        </div>}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:24 }}>
          <div>
            {cv.habilidades?.length > 0 && <Sec t="Habilidades Clave" ic="⚡" ch={
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {cv.habilidades.map((h, i) => (
                  <div key={i} style={{ background:lt, border:`1px solid ${a}30`, borderRadius:7, padding:"7px 10px", display:"flex", alignItems:"center", gap:6, fontSize:10.5 }}>
                    <span style={{ color:a, fontWeight:900 }}>✓</span>
                    <span style={{ color:"#065f46", fontWeight:600 }}>{h}</span>
                  </div>
                ))}
              </div>
            }/>}

            {cv.experiencia?.length > 0 && <Sec t="Experiencia" ic="💼" ch={cv.experiencia.map((e, i) => (
              <div key={i} style={{ marginBottom:14, paddingBottom:12, borderBottom: i < cv.experiencia.length - 1 ? "1px dashed #d1fae5" : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <div style={{ fontWeight:800, fontSize:11.5, color:"#0f172a" }}>{e.cargo}</div>
                  <div style={{ fontSize:9, color:"#94a3b8", whiteSpace:"nowrap", marginLeft:8 }}>{e.desde}–{e.hasta || "Actual"}</div>
                </div>
                <div style={{ fontSize:10.5, color:a, fontWeight:600, marginBottom:4 }}>{e.empresa}</div>
                {e.funciones?.map((f, j) => <div key={j} style={{ fontSize:10, color:"#374151", marginBottom:2, paddingLeft:10 }}>• {f}</div>)}
              </div>
            ))}/>}
          </div>

          {/* Columna lateral */}
          <div>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:10, fontWeight:800, color:"#0f172a", textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>Datos Personales</div>
              <div style={{ height:2, background:`${a}60`, marginBottom:10 }}/>
              {[cv.fecha_nacimiento && ["Nacimiento", cv.fecha_nacimiento], cv.edad && ["Edad", cv.edad],
                cv.estado_civil && ["Estado", cv.estado_civil], cv.barrio && ["Barrio", cv.barrio], cv.cedula && ["C.C.", cv.cedula]
              ].filter(Boolean).map(([k, v], i) => (
                <div key={i} style={{ marginBottom:6 }}>
                  <div style={{ fontSize:8, color:"#6b7280", textTransform:"uppercase", letterSpacing:.5, fontWeight:700 }}>{k}</div>
                  <div style={{ fontSize:10.5, color:"#0f172a" }}>{v}</div>
                </div>
              ))}
            </div>

            {cv.formacion?.length > 0 && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#0f172a", textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>Formación</div>
                <div style={{ height:2, background:`${a}60`, marginBottom:10 }}/>
                {cv.formacion.map((f, i) => (
                  <div key={i} style={{ marginBottom:10 }}>
                    <div style={{ fontWeight:700, fontSize:10.5 }}>{f.titulo}</div>
                    <div style={{ fontSize:9.5, color:a }}>{f.institucion}</div>
                    <div style={{ fontSize:9, color:"#6b7280" }}>{f.año}</div>
                  </div>
                ))}
              </div>
            )}

            {cv.referencias?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:800, color:"#0f172a", textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>Referencias</div>
                <div style={{ height:2, background:`${a}60`, marginBottom:10 }}/>
                {cv.referencias.map((r, i) => (
                  <div key={i} style={{ marginBottom:10, fontSize:10 }}>
                    <div style={{ fontWeight:700 }}>{r.nombre}</div>
                    <div style={{ color:"#6b7280" }}>{r.cargo}</div>
                    {r.telefono && <div style={{ color:a }}>{r.telefono}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REGISTRO DE PLANTILLAS
══════════════════════════════════════════════════════════════════════════ */
export const CV_TMPLS = [
  {
    id: "cronologica", label: "Cronológica Inversa", sub: "La más ganadora · ATS · Reclutadores",
    tag: "MÁS USADA", Component: CVCronologica,
    color: "#1A56DB", tagColor: "#1A56DB", previewBg: "#1A56DB",
    ideal: "Experiencia continua · Admin · Legal · Técnico · Comercial",
    gana: ["Más aceptada por reclutadores colombianos", "100% compatible con ATS", "Muestra crecimiento profesional claro"],
    tip: "El perfil profesional decide si te leen o no.",
    rank: "🥇 #1 MÁS GANADORA",
  },
  {
    id: "sidebar", label: "Sidebar + Timeline", sub: "Sidebar gris · Timeline · Foto redonda",
    tag: "PROFESIONAL", Component: CVSidebarTimeline,
    color: "#3d4852", tagColor: "#374151", previewBg: "#3d4852",
    ideal: "Experiencia media-alta · Cargos medios y directivos",
    gana: ["Diseño visual atractivo y diferenciador", "Sidebar con foto y datos personales", "Timeline muestra trayectoria clara"],
    tip: "Ideal cuando quieres destacar visualmente ante muchos candidatos.",
    rank: "🏅 MUY PROFESIONAL",
  },
  {
    id: "ats", label: "ATS Limpia", sub: "Sin columnas · Pasa filtros digitales",
    tag: "PLATAFORMAS", Component: CVAtsLimpia,
    color: "#111111", tagColor: "#374151", previewBg: "#374151",
    ideal: "Computrabajo · LinkedIn · Indeed · Empresas grandes",
    gana: ["Pasa filtros automáticos 100%", "Usa palabras clave del cargo", "Sin tablas ni columnas: lectura perfecta"],
    tip: "Sin íconos, sin columnas, sin gráficos. Solo texto limpio.",
    rank: "🤖 ATS PLATAFORMAS",
  },
  {
    id: "mixta", label: "Mixta Elegante", sub: "La más estratégica · Habilidades + Exp",
    tag: "ESTRATÉGICA", Component: CVMixta,
    color: "#374151", tagColor: "#1f2937", previewBg: "#374151",
    ideal: "Habilidades fuertes + Experiencia · Tecnología · Ventas · Admin",
    gana: ["Combina habilidades + experiencia de forma persuasiva", "Muy eficaz para cargos medios y altos", "Excelente para destacar logros concretos"],
    tip: "Perfecta para destacar frente a otros candidatos con igual experiencia.",
    rank: "🔥 #2 ESTRATÉGICA",
  },
  {
    id: "funcional", label: "Funcional", sub: "Verde · Primer empleo o cambio carrera",
    tag: "PRIMER EMPLEO", Component: CVFuncional,
    color: "#0f766e", tagColor: "#0f766e", previewBg: "#0f766e",
    ideal: "Poca experiencia · Vacíos laborales · Recién graduados",
    gana: ["Resalta lo que sabes hacer, no el tiempo", "Oculta vacíos laborales naturalmente", "Muy útil para primer empleo o cambio de carrera"],
    tip: "No es favorita de empresas muy formales, pero gana entrevistas si está bien hecha.",
    rank: "🎯 PRIMER EMPLEO",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE PREVIEW CARD — miniatura visual
══════════════════════════════════════════════════════════════════════════ */
function TemplatePreviewCard({ tmpl, selected, onClick }) {
  const isSelected = selected === tmpl.id;
  const { previewBg, id } = tmpl;

  const renderPreview = () => {
    if (id === "sidebar") return (
      <div style={{ display:"flex", height:"100%" }}>
        <div style={{ width:"36%", background:previewBg, padding:"10px 8px" }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,.25)", margin:"0 auto 10px" }}/>
          {[75,55,65,50,60].map((w,i) => <div key={i} style={{ width:`${w}%`, height:2.5, background:"rgba(255,255,255,.3)", borderRadius:1, marginBottom:5 }}/>)}
        </div>
        <div style={{ flex:1, padding:"8px 7px" }}>
          <div style={{ width:"80%", height:7, background:"#0f172a", borderRadius:1, marginBottom:4 }}/>
          <div style={{ height:1, background:"#e2e8f0", margin:"6px 0" }}/>
          {[70,90,55,80,65,75,50,85].map((w,i) => <div key={i} style={{ width:`${w}%`, height:2.5, background: i%4===0?"#64748b":"#e2e8f0", borderRadius:1, marginBottom:3.5, marginLeft: i%4===0?0:8 }}/>)}
        </div>
      </div>
    );
    if (id === "ats") return (
      <div style={{ padding:"14% 10%" }}>
        <div style={{ width:"65%", height:9, background:"#111", borderRadius:1, margin:"0 auto 5px" }}/>
        <div style={{ width:"45%", height:4, background:"#555", borderRadius:1, margin:"0 auto 14px" }}/>
        <div style={{ height:1.5, background:"#111", marginBottom:10 }}/>
        {["80%","100%","60%","90%","75%","85%","55%","95%"].map((w,i) => <div key={i} style={{ width:w, height:2.5, background: i%5===0?"#333":"#ccc", borderRadius:1, marginBottom:4 }}/>)}
      </div>
    );
    if (id === "mixta") return (
      <div style={{ padding:"10% 10%" }}>
        <div style={{ width:22, height:22, borderRadius:"50%", background:"#d1d5db", margin:"0 auto 8px" }}/>
        <div style={{ width:"60%", height:8, background:"#111", borderRadius:1, margin:"0 auto 4px" }}/>
        <div style={{ height:2, background:"#111", margin:"8px 0 10px" }}/>
        {["75%","95%","65%","80%","70%","88%"].map((w,i) => <div key={i} style={{ width:w, height:2.5, background: i%3===0?"#374151":"#e2e8f0", borderRadius:1, marginBottom:4, margin:"0 auto 4px" }}/>)}
      </div>
    );
    return (
      <div>
        <div style={{ background:previewBg, padding:"10% 10% 8%", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <div style={{ width:"72%", height:9, background:"rgba(255,255,255,.9)", borderRadius:2, marginBottom:5 }}/>
            <div style={{ width:"48%", height:4, background:"rgba(255,255,255,.55)", borderRadius:2, marginBottom:5 }}/>
            <div style={{ width:"60%", height:3, background:"rgba(255,255,255,.3)", borderRadius:2 }}/>
          </div>
          <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(255,255,255,.25)", flexShrink:0, marginLeft:8 }}/>
        </div>
        <div style={{ padding:"7% 10%" }}>
          <div style={{ height:1.5, background:`${previewBg}70`, marginBottom:8 }}/>
          {[72,92,58,84,66,78,52,88].map((w,i) => <div key={i} style={{ width:`${w}%`, height:2.5, background: i%4===0?`${previewBg}60`:"#e2e8f0", borderRadius:2, marginBottom:3.5 }}/>)}
        </div>
      </div>
    );
  };

  return (
    <div onClick={onClick} style={{ cursor:"pointer", flexShrink:0, width:200 }}>
      <div style={{ borderRadius:16, overflow:"hidden", border:`3px solid ${isSelected ? tmpl.color : "#E2E8F0"}`, boxShadow: isSelected ? `0 12px 36px ${tmpl.color}40,0 2px 8px rgba(0,0,0,.08)` : "0 2px 8px rgba(0,0,0,.06)", transform: isSelected ? "scale(1.03)" : "scale(1)", transition:"all .2s", background:"white", position:"relative", paddingTop:"133%" }}>
        <div style={{ position:"absolute", inset:0 }}>{renderPreview()}</div>
        {tmpl.tag && <div style={{ position:"absolute", top:10, left:10, background: isSelected ? tmpl.color : "#1C1C1C", color:"white", fontSize:8, fontWeight:900, padding:"3px 8px", borderRadius:4, letterSpacing:.5 }}>{tmpl.tag}</div>}
        {isSelected && <div style={{ position:"absolute", bottom:10, right:10, width:22, height:22, borderRadius:"50%", background:tmpl.color, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"white", fontSize:11, fontWeight:900 }}>✓</span></div>}
      </div>
      <div style={{ textAlign:"center", marginTop:10, padding:"0 4px" }}>
        <div style={{ fontWeight:800, fontSize:13, color: isSelected ? "#0F172A" : "#374151" }}>
          {isSelected && <span style={{ color:tmpl.color }}>✓ </span>}{tmpl.label}
        </div>
        <div style={{ fontSize:10, color:"#94A3B8", marginTop:2, lineHeight:1.4 }}>{tmpl.sub}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HV CHOOSER — pantalla de selección de plantilla
══════════════════════════════════════════════════════════════════════════ */
export function HVChooser({ onBack, onSelect }) {
  const [sel, setSel] = useState("cronologica");
  const selTmpl = CV_TMPLS.find(t => t.id === sel) || CV_TMPLS[0];
  const BG = "#ECECE8";

  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column" }}>
      {/* Top bar */}
      <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:BG }}>
        <button onClick={onBack} style={{ padding:"8px 18px", background:"white", border:"none", borderRadius:50, fontWeight:700, fontSize:13, cursor:"pointer", color:"#374151", boxShadow:"0 1px 4px rgba(0,0,0,.1)" }}>← Volver</button>
        <div style={{ fontWeight:900, fontSize:17, color:"#0F172A" }}>Elige una plantilla</div>
        <button onClick={() => onSelect(selTmpl)} style={{ padding:"8px 22px", background:"#1C1C1C", border:"none", borderRadius:50, fontWeight:800, fontSize:13, cursor:"pointer", color:"white" }}>Crear ✏</button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"10px 20px 120px" }}>
        {/* Cards horizontales */}
        <div style={{ display:"flex", gap:18, overflowX:"auto", paddingBottom:16, scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch", scrollbarWidth:"none" }}>
          {CV_TMPLS.map(t => (
            <div key={t.id} style={{ scrollSnapAlign:"center", flexShrink:0 }}>
              <TemplatePreviewCard tmpl={t} selected={sel} onClick={() => setSel(t.id)} />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:6, marginBottom:20 }}>
          {CV_TMPLS.map(t => (
            <div key={t.id} onClick={() => setSel(t.id)} style={{ width: sel===t.id ? 22 : 7, height:7, borderRadius:4, background: sel===t.id ? "#1C1C1C" : "#CBD5E1", cursor:"pointer", transition:"width .2s" }}/>
          ))}
        </div>

        {/* Info card */}
        <div className="step-in" style={{ background:"white", borderRadius:20, padding:20, border:`2px solid ${selTmpl.color}30`, boxShadow:`0 6px 24px ${selTmpl.color}18` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:selTmpl.color }}/>
            <div style={{ fontWeight:900, fontSize:16, color:"#0F172A", flex:1 }}>{selTmpl.label}</div>
            <div style={{ background:selTmpl.color, color:"white", padding:"3px 12px", borderRadius:50, fontSize:10, fontWeight:800, whiteSpace:"nowrap" }}>{selTmpl.rank}</div>
          </div>
          <div style={{ background:"#F8FAFF", borderRadius:10, padding:"10px 14px", marginBottom:12, borderLeft:`3px solid ${selTmpl.color}` }}>
            <span style={{ fontWeight:700, color:selTmpl.color, fontSize:11 }}>✔ Ideal para: </span>
            <span style={{ fontSize:11, color:"#374151" }}>{selTmpl.ideal}</span>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#374151", marginBottom:7, textTransform:"uppercase", letterSpacing:.5 }}>🔑 Por qué gana puestos:</div>
            {selTmpl.gana.map((g, i) => (
              <div key={i} style={{ fontSize:11, color:"#374151", marginBottom:5, display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ color:selTmpl.color, flexShrink:0, marginTop:1 }}>✓</span>{g}
              </div>
            ))}
          </div>
          <div style={{ background:`${selTmpl.color}12`, border:`1px solid ${selTmpl.color}30`, borderRadius:9, padding:"10px 14px", fontSize:11, color:selTmpl.color, fontWeight:600 }}>
            📌 {selTmpl.tip}
          </div>
        </div>

        {/* Thumbnails */}
        <div style={{ display:"flex", gap:8, marginTop:18, justifyContent:"center", flexWrap:"wrap" }}>
          {CV_TMPLS.map(t => (
            <div key={t.id} onClick={() => setSel(t.id)} style={{ width:62, height:76, borderRadius:10, overflow:"hidden", cursor:"pointer", border:`2.5px solid ${sel===t.id ? t.color : "#E2E8F0"}`, transition:"all .15s", position:"relative", transform: sel===t.id ? "translateY(-3px)" : "none", boxShadow: sel===t.id ? `0 5px 14px ${t.color}45` : "none" }}>
              <div style={{ background:t.previewBg, height:"38%" }}/>
              <div style={{ background:"white", padding:"4px 5px" }}>
                {[60,80,45].map((w,i) => <div key={i} style={{ width:`${w}%`, height:2, background:"#e2e8f0", borderRadius:1, marginBottom:2.5 }}/>)}
              </div>
              {sel===t.id && <div style={{ position:"absolute", inset:0, background:`${t.color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ width:18, height:18, borderRadius:"50%", background:t.color, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"white", fontSize:9, fontWeight:900 }}>✓</span></div></div>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA fijo abajo */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"16px 20px 28px", background:`linear-gradient(transparent,${BG} 35%)`, zIndex:10 }}>
        <button onClick={() => onSelect(selTmpl)} style={{ width:"100%", padding:"17px", background:"#1C1C1C", color:"white", border:"none", borderRadius:50, fontWeight:900, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 5px 22px rgba(0,0,0,.28)" }}>
          ✏ Crear con {selTmpl.label}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HV WIZARD — 7 pasos
══════════════════════════════════════════════════════════════════════════ */
const STEPS = ["Perfil","Contacto","Educación","Experiencia","Habilidades","Resumen","Añadir sección"];
const GREEN = "#5a8a3e"; const BG = "#ECECE8";

const HVWizardInner = function HVWizard({ template, onBack, onGenerate }) {
  const [step, setStep] = useState(0);
  const [gen, setGen]   = useState(false);
  const photoRef        = useRef();

  const [photo,       setPhoto]       = useState(null);
  const [nombre,      setNombre]      = useState("");
  const [cargo,       setCargo]       = useState("");
  const [fechaNac,    setFechaNac]    = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cedula,      setCedula]      = useState("");
  const [telefono,    setTelefono]    = useState("");
  const [email,       setEmail]       = useState("");
  const [direccion,   setDireccion]   = useState("");
  const [ciudad,      setCiudad]      = useState("Cali, Valle");
  const [barrio,      setBarrio]      = useState("");
  const [edu,         setEdu]         = useState([{ titulo:"", institucion:"", ciudad:"", año:"", tipo:"" }]);
  const [exp,         setExp]         = useState([{ cargo:"", empresa:"", ciudad:"", desde:"", hasta:"", funciones:"" }]);
  const [skills,      setSkills]      = useState([]);
  const [skillInput,  setSkillInput]  = useState("");
  const [resumen,     setResumen]     = useState("");
  const [aiRes,       setAiRes]       = useState(false);
  const [idiomas,     setIdiomas]     = useState([{ idioma:"Español", nivel:"Nativo" }]);
  const [logros,      setLogros]      = useState([""]);
  const [refs,        setRefs]        = useState([{ nombre:"", cargo:"", empresa:"", telefono:"" }]);

  const handlePhoto = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setPhoto(ev.target.result); r.readAsDataURL(f); };
  const addSkill    = () => { const v = skillInput.trim(); if (v && !skills.includes(v)) { setSkills(p => [...p, v]); setSkillInput(""); } };

  const fillResumen = async () => {
    setAiRes(true);
    const t = await callAI(
      "Perfil profesional hoja de vida colombiana, 3-4 oraciones, tercera persona. Solo el texto.",
      `Nombre: ${nombre}. Cargo: ${cargo}. Experiencia: ${exp.map(e => e.cargo + " en " + e.empresa).filter(v => v.trim() !== "en").join(", ") || "no especificada"}. Formación: ${edu.map(f => f.titulo).filter(Boolean).join(", ") || "no especificada"}.`,
      280
    );
    setResumen(t.trim()); setAiRes(false);
  };

  const handleGenerate = async () => {
    setGen(true);
    const base = {
      nombre: UC(nombre), cargo_aspirado: cargo, cedula,
      fecha_nacimiento: fechaNac, lugar_nacimiento: "", edad: "",
      estado_civil: estadoCivil, direccion, barrio, ciudad, telefono, email,
      perfil: resumen,
      formacion:   edu.filter(e => e.titulo).map(e => ({ titulo: UC(e.titulo), institucion: e.institucion, ciudad: e.ciudad, año: e.año, tipo: e.tipo })),
      experiencia: exp.filter(e => e.cargo).map(e => ({ cargo: UC(e.cargo), empresa: UC(e.empresa), ciudad: e.ciudad, desde: e.desde, hasta: e.hasta || "Actual", funciones: e.funciones.split(/[;\n]/).map(f => f.trim()).filter(Boolean) })),
      habilidades: skills,
      idiomas:     idiomas.filter(i => i.idioma),
      logros:      logros.filter(Boolean),
      referencias: refs.filter(r => r.nombre).map(r => ({ nombre: UC(r.nombre), cargo: r.cargo, empresa: r.empresa, telefono: r.telefono })),
    };
    const prompt = `NOMBRE: ${base.nombre} | CARGO: ${base.cargo_aspirado}
CONTACTO: ${base.telefono} · ${base.email} · ${base.direccion} · ${base.barrio} · ${base.ciudad}
CÉDULA: ${base.cedula} | FECHA NAC: ${base.fecha_nacimiento} | ESTADO: ${base.estado_civil}
FORMACIÓN: ${base.formacion.map(f => `${f.titulo} en ${f.institucion} (${f.año})`).join(" | ") || "no especificada"}
EXPERIENCIA: ${base.experiencia.map(e => `${e.cargo} en ${e.empresa} de ${e.desde} a ${e.hasta}: ${e.funciones.join(", ")}`).join(" | ") || "no especificada"}
HABILIDADES: ${base.habilidades.join(", ") || "no especificadas"}
IDIOMAS: ${base.idiomas.map(i => `${i.idioma}-${i.nivel}`).join(", ")}
PERFIL: ${base.perfil || "generar perfil profesional coherente"}
LOGROS: ${base.logros.join(", ") || "ninguno"}
REFERENCIAS: ${base.referencias.map(r => `${r.nombre} (${r.cargo} ${r.empresa}) ${r.telefono}`).join(" | ") || "no especificadas"}
Completa datos faltantes de forma coherente. Genera JSON completo.`;
    try {
      const raw    = await callAI(SYS_CV_JSON, prompt, 1800);
      const cvData = JSON.parse(raw.replace(/```json|```/g, "").trim());
      onGenerate({ cvData, photo, template });
    } catch (e) { alert("Error generando: " + e.message); }
    setGen(false);
  };

  const total = STEPS.length;
  const pct   = Math.round(((step + 1) / total) * 100);

  /* ── Estilos compartidos dentro del wizard ── */
  const inputS = { width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" };
  const Card   = ({ children, style }) => <div style={{ background:"white", borderRadius:16, padding:20, marginBottom:14, boxShadow:"0 1px 5px rgba(0,0,0,.06)", ...style }}>{children}</div>;
  const SL     = ({ t }) => <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", marginBottom:8, textTransform:"uppercase", letterSpacing:.5 }}>{t}</div>;
  const FI     = ({ label, placeholder, value, onChange, type="text", multi=false }) => (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:11, fontWeight:600, color:"#94A3B8", marginBottom:5 }}>{label}</div>}
      {multi
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputS, resize:"vertical" }}/>
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputS}/>
      }
    </div>
  );
  const AddB = ({ label, onClick, color=GREEN }) => (
    <button onClick={onClick} style={{ width:"100%", padding:"14px", background:color, color:"white", border:"none", borderRadius:13, fontWeight:800, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:14 }}>
      <span style={{ fontSize:16, fontWeight:300 }}>⊕</span> {label}
    </button>
  );

  const TopBar = () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", background:BG, borderBottom:"1px solid rgba(0,0,0,.05)", position:"sticky", top:0, zIndex:50 }}>
      <button onClick={step===0 ? onBack : () => setStep(s => s-1)} style={{ padding:"8px 18px", background:"white", border:"none", borderRadius:50, fontWeight:700, fontSize:12, cursor:"pointer", color:"#374151", boxShadow:"0 1px 3px rgba(0,0,0,.1)", whiteSpace:"nowrap" }}>{step===0 ? "Cerrar" : "← Atrás"}</button>
      <div style={{ position:"relative", width:110, height:34, borderRadius:50, overflow:"hidden", background:"#D4D4C8", flexShrink:0 }}>
        <div style={{ position:"absolute", top:0, left:0, bottom:0, width:`${pct}%`, background:GREEN, borderRadius:50, transition:"width .35s ease" }}/>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:13, fontWeight:900, color:"white", textShadow:"0 1px 3px rgba(0,0,0,.35)", zIndex:1 }}>{step+1} of {total}</span>
        </div>
      </div>
      <button onClick={() => nombre.trim() && handleGenerate()} style={{ padding:"8px 18px", background:"#1C1C1C", border:"none", borderRadius:50, fontWeight:800, fontSize:12, cursor:"pointer", color:"white", whiteSpace:"nowrap" }}>Preview</button>
    </div>
  );

  const StepTabs = () => (
    <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none", borderBottom:"1.5px solid rgba(0,0,0,.07)", background:BG, padding:"0 16px", gap:0 }}>
      {STEPS.map((s, i) => (
        <button key={i} onClick={() => setStep(i)} style={{ padding:"11px 14px", background:"none", border:"none", borderBottom:`2.5px solid ${step===i ? "#1C1C1C" : "transparent"}`, fontWeight: step===i ? 800 : 500, fontSize:12, cursor:"pointer", color: step===i ? "#0F172A" : "#94A3B8", whiteSpace:"nowrap", flexShrink:0, transition:"all .15s", marginBottom:-1.5 }}>{s}</button>
      ))}
    </div>
  );

  const NextBtn = ({ disabled, isLast }) => (
    <div style={{ paddingTop:24, paddingBottom:32, position:"sticky", bottom:0, background:`linear-gradient(transparent,${BG} 35%)`, marginTop:12 }}>
      {!isLast
        ? <button onClick={() => setStep(s => s+1)} disabled={disabled} style={{ width:"100%", padding:"17px", background: disabled ? "#C4C8BF" : "#1C1C1C", color:"white", border:"none", borderRadius:50, fontWeight:900, fontSize:15, cursor: disabled ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            siguiente <span style={{ fontSize:18, fontWeight:400 }}>›</span>
          </button>
        : <button onClick={handleGenerate} disabled={gen || !nombre.trim()} style={{ width:"100%", padding:"17px", background: nombre.trim() ? `linear-gradient(135deg,${GREEN},#4a7a2e)` : "#C4C8BF", color:"white", border:"none", borderRadius:50, fontWeight:900, fontSize:15, cursor: nombre.trim() ? "pointer" : "default", boxShadow: nombre.trim() ? "0 5px 18px rgba(90,138,62,.45)" : "none" }}>
            {gen ? "⏳ Generando con IA..." : "✅ Generar Hoja de Vida"}
          </button>
      }
    </div>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <TopBar/><StepTabs/>
      <div style={{ flex:1, padding:"20px 16px 0", maxWidth:640, width:"100%", margin:"0 auto" }}>

        {/* PASO 0: PERFIL */}
        {step===0 && (
          <div className="step-in">
            <h1 style={{ fontSize:32, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:24, marginTop:8 }}>Perfil</h1>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ position:"relative", display:"inline-block" }}>
                {photo ? (
                  <>
                    <img src={photo} alt="" style={{ width:140, height:140, objectFit:"cover", borderRadius:"50%", border:"3px solid "+GREEN, display:"block" }}/>
                    <button onClick={() => setPhoto(null)} style={{ position:"absolute", top:4, right:4, background:"#DC2626", color:"white", border:"none", borderRadius:"50%", width:26, height:26, fontWeight:900, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                  </>
                ) : (
                  <div onClick={() => photoRef.current?.click()} style={{ width:140, height:140, borderRadius:"50%", background:"#E8E8E2", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"3px dashed #A0A096" }}>
                    <span style={{ fontSize:36, color:"#9CA3AF", marginBottom:4 }}>👤</span>
                  </div>
                )}
              </div>
              <div>
                <button onClick={() => photoRef.current?.click()} style={{ marginTop:14, padding:"10px 24px", background:GREEN, color:"white", border:"none", borderRadius:50, fontWeight:700, fontSize:13, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 }}>
                  Edit image <span style={{ fontSize:14 }}>✏</span>
                </button>
              </div>
              <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
            </div>
            <Card>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Full name" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
              <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Job title" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
              <input type="text" value={fechaNac} onChange={e => setFechaNac(e.target.value)} placeholder="Date of birth" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
              <input type="text" value={estadoCivil} onChange={e => setEstadoCivil(e.target.value)} placeholder="Estado civil" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
              <input type="text" value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula de ciudadanía" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
            </Card>
            <NextBtn disabled={!nombre.trim()}/>
          </div>
        )}

        {/* PASO 1: CONTACTO */}
        {step===1 && (
          <div className="step-in">
            <h1 style={{ fontSize:32, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:24, marginTop:8 }}>Contact</h1>
            <Card><SL t="Phone & Email"/><input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Phone" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/><input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Address" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/></Card>
            <Card><SL t="City & Neighborhood"/><input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ciudad (Ej: Cali, Valle)" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/><input type="text" value={barrio} onChange={e => setBarrio(e.target.value)} placeholder="Barrio" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/></Card>
            <NextBtn/>
          </div>
        )}

        {/* PASO 2: EDUCACIÓN */}
        {step===2 && (
          <div className="step-in">
            <h1 style={{ fontSize:32, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:24, marginTop:8 }}>Education</h1>
            {edu.map((e, i) => (
              <Card key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#1D4ED8" }}>Título #{i+1}</div>
                  {edu.length>1 && <button onClick={() => setEdu(p => p.filter((_,j) => j!==i))} style={{ background:"none", border:"none", color:"#DC2626", fontWeight:700, cursor:"pointer", fontSize:13 }}>✕ Quitar</button>}
                </div>
                <input type="text" value={e.titulo} onChange={e => (v => setEdu(p => { const n=[...p]; n[i].titulo=v; return n;)(e.target.value)} placeholder="Nombre del título obtenido" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                <input type="text" value={e.institucion} onChange={e => (v => setEdu(p => { const n=[...p]; n[i].institucion=v; return n;)(e.target.value)} placeholder="Institución educativa" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
                  <input type="text" value={e.ciudad} onChange={e => (v => setEdu(p => { const n=[...p]; n[i].ciudad=v; return n;)(e.target.value)} placeholder="Ciudad" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                  <input type="text" value={e.año} onChange={e => (v => setEdu(p => { const n=[...p]; n[i].año=v; return n;)(e.target.value)} placeholder="Año" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                </div>
                <input type="text" value={e.tipo} onChange={e => (v => setEdu(p => { const n=[...p]; n[i].tipo=v; return n;)(e.target.value)} placeholder="Tipo (Bachiller / Técnico / Tecnólogo / Profesional...)" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
              </Card>
            ))}
            <AddB label="Add Education" onClick={() => setEdu(p => [...p, { titulo:"", institucion:"", ciudad:"", año:"", tipo:"" }])}/>
            <NextBtn/>
          </div>
        )}

        {/* PASO 3: EXPERIENCIA */}
        {step===3 && (
          <div className="step-in">
            <h1 style={{ fontSize:32, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:24, marginTop:8 }}>Experience</h1>
            {exp.map((e, i) => (
              <Card key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#B45309" }}>Empleo #{i+1}</div>
                  {exp.length>1 && <button onClick={() => setExp(p => p.filter((_,j) => j!==i))} style={{ background:"none", border:"none", color:"#DC2626", fontWeight:700, cursor:"pointer", fontSize:13 }}>✕ Quitar</button>}
                </div>
                <input type="text" value={e.cargo} onChange={e => (v => setExp(p => { const n=[...p]; n[i].cargo=v; return n;)(e.target.value)} placeholder="Cargo desempeñado" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                <input type="text" value={e.empresa} onChange={e => (v => setExp(p => { const n=[...p]; n[i].empresa=v; return n;)(e.target.value)} placeholder="Nombre de la empresa" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                <input type="text" value={e.ciudad} onChange={e => (v => setExp(p => { const n=[...p]; n[i].ciudad=v; return n;)(e.target.value)} placeholder="Ciudad" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <input type="text" value={e.desde} onChange={e => (v => setExp(p => { const n=[...p]; n[i].desde=v; return n;)(e.target.value)} placeholder="Desde (MM/AAAA)" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                  <input type="text" value={e.hasta} onChange={e => (v => setExp(p => { const n=[...p]; n[i].hasta=v; return n;)(e.target.value)} placeholder="Hasta o Actual" style={{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}/>
                </div>
                <textarea value={e.funciones} onChange={e => (v => setExp(p => { const n=[...p]; n[i].funciones=v; return n;)(e.target.value)} placeholder="Funciones (separa por ; o salto de línea)" rows={3} style={{ ...{{ width:"100%", padding:"15px 16px", border:"none", borderRadius:13, fontSize:14, outline:"none", background:"white", boxSizing:"border-box", color:"#1a1a1a", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}, resize:"vertical" }}/>
              </Card>
            ))}
            <AddB label="Add Experience" onClick={() => setExp(p => [...p, { cargo:"", empresa:"", ciudad:"", desde:"", hasta:"", funciones:"" }])}/>
            <NextBtn/>
          </div>
        )}

        {/* PASO 4: HABILIDADES */}
        {step===4 && (
          <div className="step-in">
            <h1 style={{ fontSize:32, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:24, marginTop:8 }}>Skills</h1>
            <Card>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => (e.key==="Enter"||e.key===",") && addSkill()} placeholder="Escribe una habilidad y presiona Enter" style={{ flex:1, padding:"14px 16px", border:"none", borderRadius:12, fontSize:14, outline:"none", background:"#F5F5F0", boxShadow:"inset 0 1px 3px rgba(0,0,0,.06)" }}/>
                <button onClick={addSkill} style={{ padding:"14px 18px", background:GREEN, color:"white", border:"none", borderRadius:12, fontWeight:900, fontSize:16, cursor:"pointer" }}>+</button>
              </div>
              {skills.length > 0
                ? <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {skills.map((s, i) => (
                      <div key={i} style={{ background:"#F0FDF4", border:`1.5px solid ${GREEN}50`, borderRadius:50, padding:"7px 14px", display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:700, color:"#1a4731" }}>
                        {s}
                        <button onClick={() => setSkills(p => p.filter((_,j) => j!==i))} style={{ background:"none", border:"none", color:"#DC2626", cursor:"pointer", fontSize:15, padding:0, lineHeight:1, marginTop:-1 }}>×</button>
                      </div>
                    ))}
                  </div>
                : <div style={{ textAlign:"center", padding:"20px 0", color:"#94A3B8", fontSize:13 }}>Agrega tus habilidades arriba</div>
              }
            </Card>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#6b7280", fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:.5 }}>Sugerencias rápidas</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {["Trabajo en equipo","Atención al cliente","Manejo de caja","Excel básico","Word","Servicio al cliente","Ventas","Comunicación efectiva","Responsabilidad","Puntualidad","Liderazgo","Manejo de inventarios","AutoCAD","Contabilidad"].filter(s => !skills.includes(s)).map((s, i) => (
                  <button key={i} onClick={() => setSkills(p => [...p, s])} style={{ padding:"7px 14px", background:"#F0FDF4", color:GREEN, border:`1.5px solid ${GREEN}50`, borderRadius:50, fontSize:11, fontWeight:700, cursor:"pointer" }}>{s}</button>
                ))}
              </div>
            </div>
            <NextBtn/>
          </div>
        )}

        {/* PASO 5: RESUMEN */}
        {step===5 && (
          <div className="step-in">
            <h1 style={{ fontSize:32, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:24, marginTop:8 }}>Summary</h1>
            <Card>
              <SL t="Professional Summary"/>
              <textarea value={resumen} onChange={e => setResumen(e.target.value)} rows={6} placeholder="Describe tu perfil profesional en 3-4 oraciones..." style={{ width:"100%", padding:"14px 16px", border:"none", borderRadius:12, fontSize:13, outline:"none", background:"#F5F5F0", resize:"vertical", boxSizing:"border-box", lineHeight:1.7, boxShadow:"inset 0 1px 3px rgba(0,0,0,.05)" }}/>
              <button onClick={fillResumen} disabled={aiRes} style={{ marginTop:12, width:"100%", padding:"13px", background:"#FFF7ED", border:"1.5px solid #FDE68A", color:"#D97706", borderRadius:12, fontWeight:800, fontSize:13, cursor:"pointer" }}>
                {aiRes ? "⏳ Generando..." : "✨ Auto-generar perfil con IA"}
              </button>
            </Card>
            <NextBtn/>
          </div>
        )}

        {/* PASO 6: EXTRAS */}
        {step===6 && (
          <div className="step-in">
            <h1 style={{ fontSize:32, fontWeight:900, color:"#0F172A", textAlign:"center", marginBottom:24, marginTop:8 }}>Add section</h1>

            {/* Idiomas */}
            <Card>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"#6366F1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🌐</div>
                <div style={{ fontWeight:800, fontSize:15, color:"#0F172A" }}>Languages</div>
                <button onClick={() => setIdiomas(p => [...p, { idioma:"", nivel:"Básico" }])} style={{ marginLeft:"auto", width:28, height:28, borderRadius:"50%", background:"#0F172A", color:"white", border:"none", fontWeight:900, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
              </div>
              {idiomas.map((id, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, marginBottom:10, alignItems:"center" }}>
                  <input value={id.idioma} onChange={e => setIdiomas(p => { const n=[...p]; n[i].idioma=e.target.value; return n; })} placeholder="Idioma" style={{ padding:"12px 14px", border:"none", borderRadius:11, fontSize:13, background:"#F5F5F0", outline:"none" }}/>
                  <select value={id.nivel} onChange={e => setIdiomas(p => { const n=[...p]; n[i].nivel=e.target.value; return n; })} style={{ padding:"12px 14px", border:"none", borderRadius:11, fontSize:13, background:"#F5F5F0", outline:"none" }}>
                    {["Nativo","Básico","Intermedio","Avanzado","Bilingüe"].map(v => <option key={v}>{v}</option>)}
                  </select>
                  {idiomas.length>1 && <button onClick={() => setIdiomas(p => p.filter((_,j) => j!==i))} style={{ background:"none", border:"none", color:"#DC2626", fontSize:20, cursor:"pointer", padding:"0 4px" }}>×</button>}
                </div>
              ))}
            </Card>

            {/* Logros */}
            <Card>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"#F59E0B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏆</div>
                <div style={{ fontWeight:800, fontSize:15, color:"#0F172A" }}>Achievements</div>
                <button onClick={() => setLogros(p => [...p, ""])} style={{ marginLeft:"auto", width:28, height:28, borderRadius:"50%", background:"#0F172A", color:"white", border:"none", fontWeight:900, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
              </div>
              {logros.map((l, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:8, marginBottom:8 }}>
                  <input value={l} onChange={e => setLogros(p => { const n=[...p]; n[i]=e.target.value; return n; })} placeholder={`Logro o certificado ${i+1}...`} style={{ padding:"12px 14px", border:"none", borderRadius:11, fontSize:13, background:"#FFFBEB", outline:"none" }}/>
                  {logros.length>1 && <button onClick={() => setLogros(p => p.filter((_,j) => j!==i))} style={{ background:"none", border:"none", color:"#DC2626", fontSize:20, cursor:"pointer" }}>×</button>}
                </div>
              ))}
            </Card>

            {/* Referencias */}
            <Card>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"#10B981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📋</div>
                <div style={{ fontWeight:800, fontSize:15, color:"#0F172A" }}>Referencias</div>
                <button onClick={() => setRefs(p => [...p, { nombre:"", cargo:"", empresa:"", telefono:"" }])} style={{ marginLeft:"auto", width:28, height:28, borderRadius:"50%", background:"#0F172A", color:"white", border:"none", fontWeight:900, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
              </div>
              {refs.map((r, i) => (
                <div key={i} style={{ background:"#F0FDF4", borderRadius:12, padding:14, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ fontWeight:700, fontSize:12, color:"#065F46" }}>Referencia #{i+1}</div>
                    {refs.length>1 && <button onClick={() => setRefs(p => p.filter((_,j) => j!==i))} style={{ background:"none", border:"none", color:"#DC2626", fontSize:13, cursor:"pointer", fontWeight:700 }}>✕</button>}
                  </div>
                  {[["nombre","Nombre completo"],["cargo","Cargo"],["empresa","Empresa"],["telefono","Teléfono"]].map(([k,ph]) => (
                    <input key={k} value={r[k]} onChange={e => setRefs(p => { const n=[...p]; n[i]={...n[i],[k]:e.target.value}; return n; })} placeholder={ph} style={{ width:"100%", padding:"10px 12px", border:"none", borderRadius:9, fontSize:13, background:"white", outline:"none", marginBottom:7, boxSizing:"border-box" }}/>
                  ))}
                </div>
              ))}
            </Card>

            <NextBtn isLast disabled={!nombre.trim()}/>
          </div>
        )}

      </div>
    </div>
  );
}

export const HVWizard = memo(HVWizardInner);

/* ══════════════════════════════════════════════════════════════════════════
   HV PREVIEW — vista previa con exportación
══════════════════════════════════════════════════════════════════════════ */
export function HVPreview({ cvData, photo, template, onBack, onNew }) {
  const [expState, setExpState] = useState({ p:false, i:false });
  const [showWA,   setShowWA]   = useState(false);
  const { Component } = template;

  const fn = ext => `${iso()}_HV_${(cvData.nombre || "CV").replace(/\s+/g,"_").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z0-9_]/g,"")}.${ext}`;

  const doP = async () => {
    setExpState(p => ({ ...p, p:true }));
    try { await expFromEl("CV-RENDER", fn("pdf"), "pdf"); } catch (e) { alert(e.message); }
    setExpState(p => ({ ...p, p:false }));
  };
  const doI = async () => {
    setExpState(p => ({ ...p, i:true }));
    try { await expFromEl("CV-RENDER", fn("png"), "png"); } catch (e) { alert(e.message); }
    setExpState(p => ({ ...p, i:false }));
  };
  const doPrint = () => {
    const el = document.getElementById("CV-RENDER");
    if (!el) return;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><style>body{margin:0}@page{margin:0;size:letter}</style></head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 900);
  };

  const waText = `HOJA DE VIDA\n\n${cvData.nombre}\n${cvData.cargo_aspirado || ""}\n\n📞 ${cvData.telefono || ""}\n✉ ${cvData.email || ""}\nC.C. ${cvData.cedula || ""}\n\n${cvData.perfil || ""}`;

  const Btn = ({ onClick, bg, dis, ch }) => (
    <button onClick={onClick} disabled={dis} style={{ padding:"8px 14px", background: dis ? "#93C5FD" : bg, color:"white", border:"none", borderRadius:9, fontWeight:700, fontSize:11, cursor: dis ? "wait" : "pointer", whiteSpace:"nowrap" }}>{ch}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      {showWA && <WAModal text={waText} onClose={() => setShowWA(false)}/>}

      {/* Barra de acciones */}
      <div style={{ background:"white", borderBottom:"2px solid #E2E8F0", padding:"10px 16px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", position:"sticky", top:0, zIndex:50 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#2563EB", cursor:"pointer", fontSize:12, fontWeight:700 }}>← Editar</button>
        <div style={{ width:1, height:18, background:"#E2E8F0" }}/>
        <div style={{ background:"#F0FDF4", color:"#0F766E", padding:"4px 10px", borderRadius:7, fontSize:10, fontWeight:800 }}>👤 {template.label}</div>
        <div style={{ flex:1 }}/>
        <Btn onClick={doPrint}          bg="#0F172A"               ch="🖨️ Imprimir"/>
        <Btn onClick={doP}  dis={expState.p} bg="#DC2626"          ch={expState.p ? "⏳..." : "📕 PDF"}/>
        <Btn onClick={doI}  dis={expState.i} bg="#7C3AED"          ch={expState.i ? "⏳..." : "🖼 Imagen"}/>
        <Btn onClick={() => setShowWA(true)} bg="#16A34A"          ch="📲 WhatsApp"/>
        <Btn onClick={onNew}            bg="#10B981"               ch="✅ Nuevo"/>
      </div>

      {/* Vista previa escalada */}
      <div style={{ padding:"16px", overflowX:"auto" }}>
        <div style={{ transform:"scale(0.78)", transformOrigin:"top center", minWidth:794, marginBottom:-170 }}>
          <Component cv={cvData} photo={photo}/>
        </div>
      </div>

      {/* Nombre de archivo */}
      <div style={{ padding:"0 16px 20px" }}>
        <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:8, padding:"7px 14px", fontSize:10, color:"#1D4ED8", fontWeight:600 }}>
          📁 {fn("pdf")}
        </div>
      </div>
    </div>
  );
}
