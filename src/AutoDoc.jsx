/* eslint-disable */
// AutoDoc.jsx — Diseño Premium · Morado · Cyan · Azul

import { useState, useEffect, useCallback } from "react";
import { HVChooser, HVWizard, HVPreview }       from "./CVModule";
import { PromesaWizard, PromesaPreview }         from "./PromesaModule";
import { VehiculoWizard, VehiculoPreview }       from "./VehiculoModule";
import {
  MO, UC, fCC, iso,
  stG, stS,
  expWord, expFromEl,
  callAI, SYS_DOC, SYS_SUGG,
  WAModal, HistModal, EjemploModal,
  Toast, useNotify,
} from "./SharedComponents";

const P = {
  purple:  "#7C3AED",
  blue:    "#2563EB",
  cyan:    "#06B6D4",
  grad:    "linear-gradient(135deg,#7C3AED 0%,#2563EB 60%,#06B6D4 100%)",
  gradSoft:"linear-gradient(145deg,#F0EEFF 0%,#F5F6FA 50%,#E8F7FF 100%)",
  surface: "#FFFFFF",
  bg:      "#F5F6FA",
  border:  "#E8EAF0",
  text:    "#0D0F1A",
  text2:   "#3D4060",
  text3:   "#6B7094",
  text4:   "#A0A4BC",
};

const CATS = [
  { id:"hojasvida",     label:"Hojas de Vida",           icon:"🧑", color:P.purple, tipos:["Cronológica","Funcional","Mixta","ATS Limpia","Sidebar Timeline"] },
  { id:"referencias",   label:"Referencias",             icon:"📋", color:P.blue,   tipos:["Personal","Laboral","Comercial","Bancaria","Académica"] },
  { id:"poderes",       label:"Poderes",                 icon:"⚖️", color:"#5B21B6", tipos:["Poder general","Poder especial","Poder judicial","Poder notarial","Poder administrativo","Poder de representación"] },
  { id:"autorizaciones",label:"Autorizaciones",          icon:"✅", color:P.cyan,   tipos:["Autorización de viaje menor","Autorización uso de datos","Autorización médica","Autorización de cobro","Autorización de entrega","Autorización de representación","Autorización laboral"] },
  { id:"cuentas",       label:"Cuentas de Cobro",        icon:"💰", color:"#0284C7", tipos:["Servicios profesionales","Honorarios","Arrendamiento","Comisión de ventas","Asesoría"] },
  { id:"cotizaciones",  label:"Cotizaciones",            icon:"📊", color:"#0E7490", tipos:["Servicios","Productos","Mantenimiento","Construcción","Tecnología"] },
  { id:"desistimientos",label:"Desistimientos",          icon:"🚫", color:"#6D28D9", tipos:["Accidente de tránsito","Proceso civil","Proceso penal","Contrato","Reclamación","Queja"] },
  { id:"contratos",     label:"Contratos Arrend.",       icon:"🏠", color:P.blue,   tipos:["Vivienda urbana","Local comercial","Bodega","Parqueadero","Habitación"] },
  { id:"compraventa",   label:"Compraventa",             icon:"🤝", color:"#1D4ED8", tipos:["Promesa compraventa vivienda","Compraventa vehículo","Mandato para venta vehículo"] },
  { id:"acuerdos",      label:"Acuerdos de Pago",        icon:"📝", color:P.purple, tipos:["Deuda personal","Deuda comercial","Cuotas financiera","Refinanciación","Mora arrendamiento"] },
  { id:"renuncias",     label:"Renuncias",               icon:"🚪", color:"#4338CA", tipos:["Voluntaria","Con prestaciones","Sin justa causa","Retiro mutuo acuerdo","Cargo específico"] },
  { id:"permisos",      label:"Permisos Laborales",      icon:"📅", color:P.cyan,   tipos:["Cita médica","Asunto personal","Estudio","Calamidad doméstica","Licencia no remunerada","Lactancia"] },
  { id:"memorandos",    label:"Memorandos",              icon:"📌", color:"#7C3AED", tipos:["Llamado de atención","Instrucciones","Información interna","Circular","Reconocimiento"] },
  { id:"pagares",       label:"Pagarés",                 icon:"💳", color:"#0369A1", tipos:["A la vista","A plazo fijo","En cuotas","Solidario","Con intereses"] },
  { id:"certificados",  label:"Certificados",            icon:"🎖", color:P.cyan,   tipos:["Residencia","Ingresos","Trabajo","Estudio","Soltería"] },
  { id:"solicitudes",   label:"Solicitudes",             icon:"📮", color:P.blue,   tipos:["Empleo","Certificación","Información","Recurso","Revisión de cuenta"] },
  { id:"peticiones",    label:"Peticiones Derechos",     icon:"🏛️", color:"#3730A3", tipos:["Derecho de petición","Tutela (borrador)","Queja entidad","Recurso de reposición","Apelación","PQR"] },
];

export default function AutoDoc() {
  const [view,    setView]    = useState("home");
  const [selCat,  setSelCat]  = useState(null);
  const [selTipo, setSelTipo] = useState(null);
  const [docText,  setDocText]  = useState("");
  const [docField, setDocField] = useState({ nombre:"", cedula:"", destino:"", concepto:"", extra:"" });
  const [loading,  setLoading]  = useState(false);
  const [hvTemplate, setHvTemplate] = useState(null);
  const [hvResult,   setHvResult]   = useState(null);
  const [promesaDoc, setPromesaDoc] = useState("");
  const [hist,       setHist]       = useState([]);
  const [showHist,   setShowHist]   = useState(false);
  const [showEjemplo,setShowEjemplo]= useState(false);
  const [showWA,     setShowWA]     = useState(false);
  const { toast, notify }           = useNotify();
  const [exInput,   setExInput]   = useState("");
  const [exLoading, setExLoad]    = useState(false);
  const [pdfLoad,   setPdfLoad]   = useState(false);
  const [wrdLoad,   setWrdLoad]   = useState(false);
  const [stats,     setStats]     = useState({ total:0 });

  useEffect(() => {
    stG("ad:hist:v1",[]).then(setHist);
    stG("ad:stats:v1",{total:0}).then(setStats);
  }, []);

  const today = new Date();
  const dia = String(today.getDate()).padStart(2,"0");
  const mes = MO[today.getMonth()];
  const anio = today.getFullYear();

  const saveHist = async (label, nombre, icon, extra={}) => {
    const e = { label, nombre, icon, ts:Date.now(), ...extra };
    const newH = [e,...hist].slice(0,80);
    const newS = { total:(stats.total||0)+1 };
    setHist(newH); setStats(newS);
    await stS("ad:hist:v1",newH);
    await stS("ad:stats:v1",newS);
  };

  const resetAll = () => {
    setView("home"); setSelCat(null); setSelTipo(null);
    setDocText(""); setDocField({nombre:"",cedula:"",destino:"",concepto:"",extra:""});
    setHvTemplate(null); setHvResult(null); setPromesaDoc("");
  };

  const handleHvBack     = useCallback(() => setView("hv-choose"), []);
  const handleHvGenerate = useCallback(async r => {
    setHvResult(r);
    setView("hv-preview");
    await saveHist("Hoja de Vida · " + (hvTemplate?.label||""), r.cvData?.nombre||"—", "🧑");
    notify("✅ Hoja de vida generada");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hvTemplate]);

  if (view==="hv-choose") return <HVChooser onBack={()=>setView(selCat?"cat":"home")} onSelect={t=>{setHvTemplate(t);setView("hv-wizard");}}/>;
  if (view==="hv-wizard"&&hvTemplate) return <HVWizard template={hvTemplate} onBack={handleHvBack} onGenerate={handleHvGenerate}/>;
  if (view==="hv-preview"&&hvResult) return <HVPreview {...hvResult} onBack={()=>setView("hv-wizard")} onNew={resetAll}/>;
  if (view==="promesa-wizard") return <PromesaWizard onBack={()=>setView(selCat?"cat":"home")} onDone={async t=>{setPromesaDoc(t);setView("promesa-preview");await saveHist("Promesa Compraventa",t.split("\n")[2]?.trim()||"—","🏠");notify("✅ Promesa generada");}}/>;
  if (view==="promesa-preview") return <PromesaPreview docText={promesaDoc} onBack={()=>setView("promesa-wizard")} onNew={resetAll} notify={notify}/>;
  if (view==="vehiculo-wizard") return <VehiculoWizard onBack={()=>setView(selCat?"cat":"home")} onDone={async r=>{setView("vehiculo-preview");await saveHist("Compraventa Vehículo",r.vD?.vN||"—","🚗",{vehiculoResult:r});notify("✅ Documento generado");}}/>;
  if (view==="vehiculo-preview") return <VehiculoPreview onBack={()=>setView("vehiculo-wizard")} onNew={resetAll}/>;

  const handleGenerate = async () => {
    if (!docField.nombre.trim()) return;
    setLoading(true);
    try {
      const p = `Tipo de documento: ${selTipo}\nCategoría: ${selCat?.label}\nCiudad: Cali · Fecha: ${dia} de ${mes} de ${anio}\nNombre: ${UC(docField.nombre)}\nCédula: ${fCC(docField.cedula)}\nDestinatario: ${docField.destino||"A QUIEN INTERESE"}\nConcepto: ${docField.concepto}\nDetalles: ${docField.extra}`;
      const txt = await callAI(SYS_DOC, p, 1500);
      setDocText(txt);
      await saveHist(`${selCat?.label} · ${selTipo}`, UC(docField.nombre), selCat?.icon||"📄");
      setView("preview");
      notify("✅ Documento generado");
    } catch(e) { notify("❌ "+e.message); }
    setLoading(false);
  };

  const hdr = (back, label) => (
    <div style={{background:"rgba(255,255,255,0.95)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",padding:"14px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(124,58,237,.08)",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 12px rgba(0,0,0,.05)"}}>
      <button onClick={back}
        style={{background:"#F5F6FA",border:"1.5px solid #E8EAF0",borderRadius:20,padding:"7px 16px",color:P.text3,cursor:"pointer",fontSize:12,fontWeight:700,transition:"all .18s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="#EDE9FE";e.currentTarget.style.color=P.purple;e.currentTarget.style.borderColor="#A78BFA";}}
        onMouseLeave={e=>{e.currentTarget.style.background="#F5F6FA";e.currentTarget.style.color=P.text3;e.currentTarget.style.borderColor="#E8EAF0";}}>
        ← {label}
      </button>
      {selCat&&<div style={{width:36,height:36,borderRadius:10,background:`${selCat.color}14`,border:`1.5px solid ${selCat.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{selCat.icon}</div>}
      {selCat&&<div>
        <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,fontSize:14,color:P.text}}>{selTipo||selCat.label}</div>
        <div style={{fontSize:10,color:P.text4}}>{selCat.label}</div>
      </div>}
    </div>
  );

  /* HOME */
  if (view==="home") return (
    <div style={{minHeight:"100vh",background:P.gradSoft}}>
      <Toast msg={toast}/>
      {showHist&&<HistModal onClose={()=>setShowHist(false)} onReopen={h=>notify("📄 "+h.label)}/>}

      <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid rgba(124,58,237,.10)",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 20px rgba(37,99,235,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:12,background:P.grad,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(124,58,237,.30)",fontSize:20}}>📄</div>
          <div>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,fontSize:19,background:P.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>AutoDoc</div>
            <div style={{fontSize:10,color:P.text4,fontWeight:500}}>Documentos Colombia · Cali</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{background:P.grad,color:"white",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:800,boxShadow:"0 2px 10px rgba(124,58,237,.28)"}}>📄 {stats.total||0} docs</div>
          <button onClick={()=>setShowHist(true)}
            style={{background:"white",border:"1.5px solid #E8EAF0",borderRadius:20,padding:"6px 16px",color:P.text3,fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#A78BFA";e.currentTarget.style.color=P.purple;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#E8EAF0";e.currentTarget.style.color=P.text3;}}>
            📋 Historial
          </button>
        </div>
      </div>

      <div style={{padding:"22px 20px 0"}}>
        <div style={{background:"white",borderRadius:20,padding:"20px 22px",border:"1.5px solid rgba(124,58,237,.12)",boxShadow:"0 4px 24px rgba(124,58,237,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#92400E"}}>⚡ Modo Express — IA</span>
          </div>
          <div style={{display:"flex",gap:10}}>
            <input value={exInput} onChange={e=>setExInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&exInput.trim()&&handleExpress()}
              placeholder="Ej: Referencia laboral para LUIS PÉREZ cc 1234567"
              style={{flex:1,padding:"13px 16px",background:"#F5F6FA",border:"1.5px solid #E8EAF0",borderRadius:14,color:P.text,fontSize:13,outline:"none",transition:"all .18s"}}
              onFocus={e=>{e.target.style.borderColor="#A78BFA";e.target.style.boxShadow="0 0 0 3px rgba(124,58,237,.10)";}}
              onBlur={e=>{e.target.style.borderColor="#E8EAF0";e.target.style.boxShadow="none";}}/>
            <button onClick={handleExpress} disabled={!exInput.trim()||exLoading}
              style={{padding:"13px 20px",background:exInput.trim()?P.grad:"#E8EAF0",color:exInput.trim()?"white":"#A0A4BC",border:"none",borderRadius:14,fontWeight:800,fontSize:14,cursor:exInput.trim()?"pointer":"default",transition:"all .18s",boxShadow:exInput.trim()?"0 4px 14px rgba(124,58,237,.35)":"none"}}>
              {exLoading?"⏳":"→"}
            </button>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 14px 100px"}}>
        <div style={{fontSize:10,fontWeight:800,color:P.text4,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Categorías</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {CATS.map(cat=>(
            <button key={cat.id}
              onClick={()=>{setSelCat(cat);if(cat.id==="hojasvida"){setView("hv-choose");return;}setView("cat");}}
              style={{
                background:`linear-gradient(145deg, ${cat.color}0D, white)`,
                border:`1.5px solid ${cat.color}25`,
                borderRadius:16,
                padding:"12px 8px 10px",
                textAlign:"left",
                cursor:"pointer",
                display:"flex",
                flexDirection:"column",
                alignItems:"flex-start",
                gap:8,
                transition:"all .2s",
                boxShadow:`0 2px 8px ${cat.color}10`,
                color:P.text,
                position:"relative",
                overflow:"hidden",
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=cat.color+"60";e.currentTarget.style.boxShadow=`0 8px 24px ${cat.color}28`;e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.background=`linear-gradient(145deg, ${cat.color}18, white)`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${cat.color}25`;e.currentTarget.style.boxShadow=`0 2px 8px ${cat.color}10`;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.background=`linear-gradient(145deg, ${cat.color}0D, white)`;}}>
              <div style={{width:34,height:34,borderRadius:10,background:cat.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:`0 3px 10px ${cat.color}40`}}>{cat.icon}</div>
              <div style={{minWidth:0,width:"100%"}}>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:10.5,color:P.text,lineHeight:1.3}}>{cat.label}</div>
                <div style={{fontSize:9,color:cat.color,marginTop:3,fontWeight:700}}>{cat.tipos.length} tipos →</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* CATEGORÍA */
  if (view==="cat"&&selCat) return (
    <div style={{minHeight:"100vh",background:P.gradSoft}}>
      <Toast msg={toast}/>
      {showEjemplo&&<EjemploModal cat={selCat} tipo={selTipo} onClose={()=>setShowEjemplo(false)}/>}
      {hdr(()=>setView("home"),"Inicio")}
      <div style={{padding:"14px 16px 80px"}}>
        {selCat.tipos.map((tipo,i)=>(
          <div key={i}
            style={{background:"white",borderRadius:14,padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,border:"1.5px solid #F0F1F8",boxShadow:"0 1px 4px rgba(0,0,0,.04)",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=`${selCat.color}30`;e.currentTarget.style.boxShadow=`0 3px 16px ${selCat.color}12`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#F0F1F8";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.04)";}}>
            <div style={{width:34,height:34,borderRadius:9,background:`${selCat.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{selCat.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,color:P.text}}>{tipo}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setSelTipo(tipo);setShowEjemplo(true);}}
                style={{padding:"7px 12px",background:"#F5F6FA",color:P.text3,border:"1.5px solid #E8EAF0",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#EDE9FE";e.currentTarget.style.color=P.purple;}}
                onMouseLeave={e=>{e.currentTarget.style.background="#F5F6FA";e.currentTarget.style.color=P.text3;}}>
                👁 Ver
              </button>
              <button
                onClick={()=>{setSelTipo(tipo);if(selCat.id==="compraventa"){if(tipo.toLowerCase().includes("promesa")){setView("promesa-wizard");return;}if(tipo.toLowerCase().includes("veh")||tipo.toLowerCase().includes("mandato")){setView("vehiculo-wizard");return;}}setView("wizard");}}
                style={{padding:"7px 18px",background:selCat.color,color:"white",border:"none",borderRadius:20,fontWeight:800,fontSize:12,cursor:"pointer",boxShadow:`0 3px 12px ${selCat.color}35`,transition:"all .18s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 6px 18px ${selCat.color}45`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 3px 12px ${selCat.color}35`;}}>
                Crear →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* WIZARD */
  if (view==="wizard") return (
    <div style={{minHeight:"100vh",background:P.gradSoft}}>
      <Toast msg={toast}/>
      {hdr(()=>setView("cat"),"Volver")}
      <div style={{padding:"20px 16px 100px",maxWidth:560,margin:"0 auto"}}>
        <div style={{background:"white",borderRadius:18,padding:22,boxShadow:"0 2px 16px rgba(124,58,237,.07)",marginBottom:14,border:"1.5px solid #F0F1F8"}}>
          <div style={{fontSize:10,fontWeight:800,color:P.text4,marginBottom:16,textTransform:"uppercase",letterSpacing:.8}}>Datos del documento</div>
          {[
            ["Nombre completo","nombre","PEDRO LUIS GARCÍA LÓPEZ",false],
            ["Cédula","cedula","1.234.567.890",false],
            ["Dirigido a","destino","A QUIEN INTERESE · EMPRESA S.A.",false],
            ["Concepto / Motivo","concepto","Motivo o asunto del documento",true],
            ["Detalles adicionales","extra","Cargo · Fechas · Valores · Etc.",true],
          ].map(([label,key,ph,multi])=>(
            <div key={key} style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:P.text4,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>
                {label}{key==="nombre"&&<span style={{color:"#EF4444"}}> *</span>}
              </div>
              {multi
                ?<textarea value={docField[key]} onChange={e=>setDocField(p=>({...p,[key]:e.target.value}))} placeholder={ph} rows={3}
                   style={{width:"100%",padding:"12px 14px",border:"1.5px solid #E8EAF0",borderRadius:12,fontSize:13,outline:"none",background:"#F8F9FF",resize:"vertical",boxSizing:"border-box",color:P.text,lineHeight:1.6,transition:"all .18s"}}
                   onFocus={e=>{e.target.style.borderColor="#A78BFA";e.target.style.boxShadow="0 0 0 3px rgba(124,58,237,.10)";}}
                   onBlur={e=>{e.target.style.borderColor="#E8EAF0";e.target.style.boxShadow="none";}}/>
                :<input value={docField[key]} onChange={e=>setDocField(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                   style={{width:"100%",padding:"13px 14px",border:"1.5px solid #E8EAF0",borderRadius:12,fontSize:13,outline:"none",background:"#F8F9FF",boxSizing:"border-box",color:P.text,transition:"all .18s"}}
                   onFocus={e=>{e.target.style.borderColor="#A78BFA";e.target.style.boxShadow="0 0 0 3px rgba(124,58,237,.10)";}}
                   onBlur={e=>{e.target.style.borderColor="#E8EAF0";e.target.style.boxShadow="none";}}/>
              }
              {key==="cedula"&&docField.cedula&&<div style={{fontSize:10,color:P.purple,fontWeight:700,marginTop:3}}>→ {fCC(docField.cedula)}</div>}
            </div>
          ))}
        </div>
        <div style={{position:"sticky",bottom:0,paddingBottom:24,paddingTop:10,background:`linear-gradient(transparent,${P.bg} 35%)`}}>
          <button onClick={handleGenerate} disabled={!docField.nombre.trim()||loading}
            style={{width:"100%",padding:"16px",background:docField.nombre.trim()?P.grad:"#E8EAF0",color:docField.nombre.trim()?"white":"#A0A4BC",border:"none",borderRadius:50,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,fontSize:15,cursor:docField.nombre.trim()?"pointer":"default",boxShadow:docField.nombre.trim()?"0 6px 24px rgba(124,58,237,.40)":"none",transition:"all .2s"}}>
            {loading?"⏳ Generando con IA...":`${selCat?.icon} Generar ${selTipo}`}
          </button>
        </div>
      </div>
    </div>
  );

  /* PREVIEW */
  if (view==="preview") return (
    <div style={{minHeight:"100vh",background:"#F1F5F9"}}>
      <Toast msg={toast}/>
      {showWA&&<WAModal text={docText} onClose={()=>setShowWA(false)}/>}
      <div style={{background:"rgba(255,255,255,0.96)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid #E8EAF0",padding:"10px 16px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 10px rgba(0,0,0,.05)"}}>
        <button onClick={()=>setView("wizard")} style={{background:"#F5F6FA",border:"1.5px solid #E8EAF0",borderRadius:20,padding:"6px 12px",color:P.text3,cursor:"pointer",fontSize:11,fontWeight:700,transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.color=P.purple;}}
          onMouseLeave={e=>{e.currentTarget.style.color=P.text3;}}>← Editar</button>
        <div style={{background:`${selCat?.color}12`,color:selCat?.color,padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:800,border:`1px solid ${selCat?.color}25`,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selCat?.icon} {selTipo}</div>
        <div style={{flex:1}}/>
        {/* Grupo de botones compactos */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <BtnAcc onClick={()=>window.print()} bg="#0D0F1A" ch="🖨️" title="Imprimir" iconOnly/>
          <BtnAcc onClick={doWordGen} dis={wrdLoad} bg={P.blue}  ch={wrdLoad?"⏳":"📄 Word"} title="Word"/>
          <BtnAcc onClick={doPdfGen}  dis={pdfLoad} bg="#DC2626" ch={pdfLoad?"⏳":"📒 PDF"} title="PDF"/>
          <BtnAcc onClick={()=>setShowWA(true)} bg="#16A34A" ch="💬" title="WhatsApp" iconOnly/>
          <BtnAcc onClick={resetAll} bg={P.purple} ch="✅ Nuevo" title="Nuevo"/>
        </div>
      </div>
      <div style={{padding:"24px 16px",maxWidth:860,margin:"0 auto"}}>
        <div id="DOC" style={{background:"white",borderRadius:14,border:"1px solid #E8EAF0",padding:"56px 72px",boxShadow:"0 4px 24px rgba(0,0,0,.06)",marginBottom:16}}>
          {docText.split("\n").map((line,i)=>{
            const t=line.trim();
            if(!t) return <div key={i} style={{height:9}}/>;
            const isTit=t===t.toUpperCase()&&t.length>3&&t.length<60&&!t.includes("_")&&!/^\d/.test(t);
            return <p key={i} style={{textAlign:isTit?"center":"justify",fontWeight:isTit?800:400,fontSize:isTit?13:12,fontFamily:"Arial,sans-serif",lineHeight:1.85,margin:"0 0 2px",color:"#111"}}>{t}</p>;
          })}
          <div style={{marginTop:48,fontFamily:"Arial,sans-serif"}}>
            <div style={{width:200,borderTop:"1px solid #222",marginTop:52,paddingTop:6}}>
              <div style={{fontSize:11,color:"#111"}}>Nombre:</div>
              <div style={{fontSize:11,marginTop:4,color:"#111"}}>C.C.:</div>
            </div>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:P.text3,marginBottom:5}}>✏️ Ajusta si necesitas:</div>
          <textarea value={docText} onChange={e=>setDocText(e.target.value)} rows={12}
            style={{width:"100%",padding:"12px 14px",border:"1.5px solid #E8EAF0",borderRadius:12,fontSize:12,lineHeight:1.7,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"Arial,sans-serif"}}/>
        </div>
      </div>
    </div>
  );

  return null;

  async function doWordGen(){setWrdLoad(true);const fn=`${iso()}_${(selTipo||"DOC").replace(/\s+/g,"_").toUpperCase()}.docx`;try{await expWord(docText,fn);notify("📄 Word descargado");}catch(e){notify("❌ "+e.message);}setWrdLoad(false);}
  async function doPdfGen(){setPdfLoad(true);const fn=`${iso()}_${(selTipo||"DOC").replace(/\s+/g,"_").toUpperCase()}.pdf`;try{await expFromEl("DOC",fn,"pdf");notify("📒 PDF descargado");}catch(e){notify("❌ "+e.message);}setPdfLoad(false);}
  async function handleExpress(){if(!exInput.trim())return;setExLoad(true);try{const s=await callAI(SYS_SUGG,exInput,300);const j=JSON.parse(s.replace(/```json|```/g,"").trim());const cat=CATS.find(c=>c.id===j.cat);if(cat){setSelCat(cat);setSelTipo(j.tipo||cat.tipos[0]);setDocField({nombre:j.campos?.nombre||"",cedula:j.campos?.cedula||"",destino:j.campos?.destino||"",concepto:j.campos?.concepto||exInput,extra:""});setView("wizard");setExInput("");}}catch{notify("❌ No entendí. Intenta ser más específico.");}setExLoad(false);}
}

function BtnAcc({onClick,bg,dis,ch,title,iconOnly}){
  return(
    <button onClick={onClick} disabled={dis} title={title||""}
      style={{
        padding:iconOnly?"8px":"6px 12px",
        minWidth:iconOnly?34:"auto",
        background:dis?"#E8EAF0":bg,
        color:dis?"#A0A4BC":"white",
        border:"none",
        borderRadius:10,
        fontFamily:"'Plus Jakarta Sans',sans-serif",
        fontWeight:700,
        fontSize:iconOnly?16:11,
        cursor:dis?"wait":"pointer",
        whiteSpace:"nowrap",
        transition:"all .15s",
        boxShadow:dis?"none":`0 2px 8px ${bg}40`,
        display:"flex",alignItems:"center",justifyContent:"center",
      }}
      onMouseEnter={e=>{if(!dis){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.filter="brightness(1.12)";}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.filter="none";}}>
      {ch}
    </button>
  );
}
