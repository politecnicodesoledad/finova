// @ts-nocheck
/**
 * "El Mercadito de la Alcancía" — game engine.
 *
 * This is a line-by-line port of the original prototype's engine (DOM + Web
 * Animations API + Web Audio), kept imperative on purpose so the game looks,
 * sounds and behaves exactly like the HTML version. React only mounts the
 * shell (see MarketTab) and calls mountMarket(); the engine owns everything
 * inside #mkt. Type-checking is disabled for this file only because it keeps
 * the original compact code verbatim.
 */
export interface MarketDeps {
  /** Global sound switch (header button). */
  soundEnabled: () => boolean;
  /** Plays left this month for the active student (max 2). */
  playsLeft: () => number;
  /** Active month (highest month unlocked by the teacher). */
  month: () => number;
  /** Counts one play (each game start counts as an attempt). */
  registerPlay: () => boolean;
  /** Grants coins/XP for a finished game; returns {c: coins, x: xp}. */
  reward: (stars: number, correct: number, score: number) => { c: number; x: number };
  /** Leave the game (back to the monthly panel). */
  exit: () => void;
  formatCOP: (n: number) => string;
  /** Official FINOVA hexagon for the title badge. */
  logoUrl: string;
}

let sharedAC: AudioContext | null = null;

/** Mounts the game inside the #mkt element. Returns a cleanup function. */
export function mountMarket(root: HTMLElement, deps: MarketDeps): () => void {
const R=()=>root,$=(s)=>root.querySelector(s),fmt=(n)=>'$'+n.toLocaleString('es-CO');

/* ---------- audio ---------- */
let AC=sharedAC,play=false,stp=0;
const ctx=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();sharedAC=AC;AC.state=='suspended'&&AC.resume()}catch(x){AC=null}return AC};
function tn(f,d=.15,t='sine',v=.12,dl=0,s){if(!deps.soundEnabled()||!AC)return;const c=AC,n=c.currentTime+dl,o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.setValueAtTime(f,n);s&&o.frequency.exponentialRampToValueAtTime(s,n+d);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v,n+.015);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(c.destination);o.start(n);o.stop(n+d+.05)}
const S={ok:()=>{tn(988,.1,'sine',.16);tn(1319,.3,'triangle',.16,.07)},no:()=>{tn(240,.3,'sawtooth',.08,0,110)},whoosh:()=>tn(260,.18,'sine',.06,0,900),tick:()=>tn(900,.05,'square',.04),
 combo:()=>[523,659,784,1047].forEach((f,i)=>tn(f,.16,'triangle',.12,i*.06)),pop:()=>tn(500,.1,'sine',.1,0,1000),
 win:()=>[523,659,784,1047,784,1047,1319].forEach((f,i)=>tn(f,.28,'triangle',.15,i*.13))};
const mus=setInterval(()=>{if(!root.isConnected){clearInterval(mus);return}if(!deps.soundEnabled()||!play||!AC)return;const N=[262,294,330,392,440,523];tn(N[[0,2,4,2,3,5,4,1][stp%8]],.32,'triangle',.035);stp%4==0&&tn(131,.6,'sine',.05);stp++},300);
/* ---------- arte ---------- */
const piggy=s=>`<svg viewBox="0 0 150 120" width="${s}"><ellipse cx="75" cy="113" rx="48" ry="6" fill="#0002"/><path d="M20 66c-13-8-2-24 9-15" fill="none" stroke="#f08ba5" stroke-width="6" stroke-linecap="round"/><rect x="42" y="90" width="21" height="22" rx="9" fill="#f27d9b"/><rect x="92" y="90" width="21" height="22" rx="9" fill="#f27d9b"/><ellipse cx="74" cy="68" rx="52" ry="40" fill="#f9a8bd"/><ellipse cx="62" cy="52" rx="26" ry="14" fill="#fff" opacity=".28"/><path d="M52 40 56 12 82 32z" fill="#f58fa8"/><path d="M58 35 60 21 72 32z" fill="#ffc2d1"/><rect x="62" y="29" width="30" height="6" rx="3" fill="#a8456a"/><ellipse cx="126" cy="72" rx="16" ry="12" fill="#f58fa8"/><ellipse cx="126" cy="72" rx="12" ry="9" fill="#ffb5c8"/><circle cx="121" cy="72" r="2.6" fill="#a8456a"/><circle cx="132" cy="72" r="2.6" fill="#a8456a"/><path d="M99 60q6-8 12 0M108 55l4-3M103 54l1-4" stroke="#5b2338" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M106 84q9 9 18 0z" fill="#c2415f"/><circle cx="98" cy="76" r="8" fill="#ff7f9f" opacity=".55"/><circle cx="54" cy="72" r="14" fill="#fbbf24" stroke="#d98a0b" stroke-width="2.5"/><text x="54" y="78" text-anchor="middle" font-size="17" font-weight="900" fill="#b45309">F</text></svg>`;
const bikeB=`<svg viewBox="0 0 150 100"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="68" r="24" stroke="#5a4a44" stroke-width="5"/><circle cx="120" cy="68" r="24" stroke="#5a4a44" stroke-width="5"/><path d="M30 68V46M30 68 12 55M30 68 48 55M30 68 20 88M30 68 40 88M120 68V46M120 68 102 55M120 68 138 55M120 68 110 88M120 68 130 88" stroke="#eadfcf" stroke-width="2"/><path d="M30 68 56 38h40l24 30M56 38l16 30h48M96 38l-6-12" stroke="#8fd9a8" stroke-width="6"/><path d="M48 30h22M84 24h20" stroke="#a78bda" stroke-width="7"/></g><path d="M86 6h26l-3 16H89z" fill="#e8b96a"/></svg>`;
const sprout=`<svg viewBox="0 0 70 70"><path d="M35 68V38" stroke="#2f9a4b" stroke-width="4" stroke-linecap="round"/><path d="M35 44C18 46 8 34 8 22c16-2 28 6 27 22z" fill="#4cc364"/><path d="M35 38c0-16 10-26 28-26 2 14-8 26-28 26z" fill="#6fd17f"/><path d="M12 68q23-8 46 0" stroke="#3f9d58" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
const ART3=[`<svg viewBox="0 0 100 86"><ellipse cx="30" cy="30" rx="12" ry="20" transform="rotate(-25 30 30)" fill="#f2b45a"/><rect x="42" y="8" width="22" height="34" rx="6" fill="#f4f7fb" stroke="#cfd8e3"/><rect x="46" y="2" width="14" height="8" rx="3" fill="#5ea3d8"/><path d="M66 30q8-14 22-6 4 14-8 20z" fill="#6cc46a"/><circle cx="58" cy="42" r="12" fill="#ef4a4a"/><path d="M58 32q2-6 7-6" stroke="#2f8f3a" stroke-width="3" fill="none"/><path d="M12 44h76l-8 36H20z" fill="#5fc374"/><path d="M12 44h76" stroke="#3f9d58" stroke-width="5"/><path d="M30 52v22M44 52v22M58 52v22M72 52v22" stroke="#3f9d58" stroke-width="4" stroke-linecap="round"/></svg>`,
`<svg viewBox="0 0 100 86"><path d="M18 56V42a32 32 0 0 1 64 0v14" fill="none" stroke="#f6b73c" stroke-width="9" stroke-linecap="round"/><rect x="10" y="48" width="24" height="34" rx="12" fill="#e9884a"/><rect x="66" y="48" width="24" height="34" rx="12" fill="#f6b73c"/><circle cx="78" cy="65" r="8" fill="#ffd76a"/><path d="M78 59l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5z" fill="#f08a24"/><rect x="16" y="54" width="12" height="22" rx="6" fill="#d9703a"/></svg>`,
`<svg viewBox="0 0 100 86"><rect x="26" y="4" width="48" height="12" rx="5" fill="#e8b23a"/><rect x="20" y="14" width="60" height="68" rx="16" fill="#e4f3fc" stroke="#9bcbe8" stroke-width="3"/><g fill="#f6b73c" stroke="#d98a0b" stroke-width="2"><ellipse cx="38" cy="74" rx="14" ry="5"/><ellipse cx="62" cy="74" rx="14" ry="5"/><ellipse cx="50" cy="67" rx="14" ry="5"/><ellipse cx="38" cy="60" rx="14" ry="5"/><ellipse cx="62" cy="60" rx="14" ry="5"/></g><rect x="30" y="30" width="40" height="24" rx="4" fill="#fff6dd" stroke="#e8d7a8"/><g fill="none" stroke="#1f8a5b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="39" cy="46" r="4.5"/><circle cx="61" cy="46" r="4.5"/><path d="M39 46l6-10h8l8 10M45 36l5 10h11"/></g></svg>`];
const stall=c=>`<svg viewBox="0 0 130 110"><rect x="12" y="34" width="6" height="74" fill="#a8672a"/><rect x="112" y="34" width="6" height="74" fill="#a8672a"/><rect x="10" y="78" width="110" height="30" rx="3" fill="#c98138"/><path d="M4 34l12-26h98l12 26z" fill="${c}"/><path d="M28 8l-6 26M52 8l-3 26M76 8l3 26M100 8l6 26" stroke="#fff6e0" stroke-width="9"/><circle cx="40" cy="72" r="7" fill="#ef4a4a"/><circle cx="54" cy="72" r="7" fill="#ef4a4a"/><circle cx="88" cy="72" r="8" fill="#f6c23a"/></svg>`;
const TRIO=[['Necesidades','Lo que necesitas','#86d9a8','#dcf5e6'],['Deseos','Puede esperar','#ffd36b','#fdf0cc'],['Ahorro','Para tu meta','#7cc4f5','#dcefff']];
const IC={book:'<rect x="14" y="10" width="38" height="46" rx="4" fill="#34d399"/><rect x="14" y="10" width="9" height="46" rx="3" fill="#059669"/><rect x="29" y="20" width="17" height="4" rx="2" fill="#fff"/><rect x="29" y="29" width="13" height="4" rx="2" fill="#fff"/>',
apple:'<circle cx="32" cy="38" r="18" fill="#ef4444"/><path d="M32 22q2-12 12-12 0 10-12 12z" fill="#16a34a"/><circle cx="26" cy="32" r="4" fill="#fff" opacity=".5"/>',
shoe:'<path d="M8 40q0-14 10-14l8 6 22 4q12 2 12 10v4H8z" fill="#34d399"/><rect x="8" y="48" width="56" height="7" rx="3" fill="#065f46"/><path d="M26 32l4-5M33 34l4-5" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
cross:'<rect x="10" y="14" width="44" height="36" rx="9" fill="#34d399"/><path d="M28 21h8v7h7v8h-7v7h-8v-7h-7v-8h7z" fill="#fff"/>',
cone:'<path d="M20 30h24L32 60z" fill="#d97706"/><circle cx="32" cy="24" r="13" fill="#f9a8d4"/><circle cx="24" cy="28" r="7" fill="#fde68a"/><circle cx="32" cy="12" r="4" fill="#ef4444"/>',
toy:'<rect x="5" y="19" width="54" height="30" rx="15" fill="#a78bfa"/><rect x="15" y="31" width="13" height="5" fill="#fff"/><rect x="19" y="27" width="5" height="13" fill="#fff"/><circle cx="43" cy="30" r="3.5" fill="#fde68a"/><circle cx="50" cy="38" r="3.5" fill="#fb7185"/>',
candy:'<circle cx="32" cy="32" r="13" fill="#fb7185"/><path d="M19 32 6 23v18zM45 32l13-9v18z" fill="#fda4af"/><path d="M25 26q7 7 14 0" stroke="#fff" fill="none" stroke-width="3" stroke-linecap="round"/>',
coin:'<circle cx="32" cy="32" r="24" fill="#f59e0b"/><circle cx="32" cy="32" r="17" fill="#fbbf24" stroke="#d97706" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="24" font-weight="900" fill="#b45309">$</text>'};
const ic=k=>k=='piggy'?piggy(60):`<svg viewBox="0 0 64 64" width="52">${IC[k]}</svg>`;
const heart=c=>`<svg viewBox="0 0 24 22" width="22"><path d="M12 21C4 14 1 10 1 6a5.5 5.5 0 0 1 11-1 5.5 5.5 0 0 1 11 1c0 4-3 8-11 15z" fill="${c}"/></svg>`;
const bike=`<svg viewBox="0 0 48 32" width="42"><circle cx="10" cy="22" r="8" fill="none" stroke="#0f172a" stroke-width="3"/><circle cx="38" cy="22" r="8" fill="none" stroke="#0f172a" stroke-width="3"/><path d="M10 22 18 8h10l10 14M18 8l8 14h12M14 5h8" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const star=(f,i)=>`<svg viewBox="0 0 24 24" width="74" class="st" style="opacity:0"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.5 5.8 21l1.4-7L2 9.3l7-.8z" fill="${f?'#fbbf24':'#cbd5e1'}" stroke="#b45309" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const CATS=[{n:'Necesidad',c:'#059669',d:'Es algo que necesitas para vivir, estudiar o cuidar tu salud.'},{n:'Deseo',c:'#f59e0b',d:'Te gusta, pero puedes vivir sin eso. Puede esperar.'},{n:'Ahorro',c:'#2563eb',d:'Es dinero que guardas hoy para lograr tu meta mañana.'}];
const jar=(c,i)=>`<svg viewBox="0 0 100 120"><rect x="24" y="3" width="52" height="17" rx="6" fill="${c}"/><rect x="12" y="18" width="76" height="98" rx="24" fill="#fff" fill-opacity=".6"/><clipPath id="cp${i}"><rect x="12" y="18" width="76" height="98" rx="24"/></clipPath><rect class="fl" clip-path="url(#cp${i})" x="12" y="18" width="76" height="98" fill="${c}" style="transform:scaleY(0);transform-box:fill-box;transform-origin:50% 100%;transition:transform .7s cubic-bezier(.3,1.5,.5,1)"/><rect x="12" y="18" width="76" height="98" rx="24" fill="none" stroke="#0f172a" stroke-width="4"/><path d="M26 34v34" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>`;
/* plaza */
(()=>{let p='<defs><pattern id="s1" width="48" height="10" patternUnits="userSpaceOnUse"><rect width="24" height="10" fill="#059669"/><rect x="24" width="24" height="10" fill="#fff"/></pattern><pattern id="s2" width="48" height="10" patternUnits="userSpaceOnUse"><rect width="24" height="10" fill="#f59e0b"/><rect x="24" width="24" height="10" fill="#fff"/></pattern></defs>';
for(let i=0;i<24;i++)p+=`<path d="M${i*52} ${44+Math.sin(i/2)*9}l26 0-13 26z" fill="${['#ef4444','#fbbf24','#059669','#2563eb'][i%4]}"/>`;
p+='<rect y="236" width="1200" height="64" fill="#fcd79a"/><rect y="236" width="1200" height="7" fill="#f59e0b" opacity=".5"/>';
[[300,170,'#16a34a'],[690,160,'#22c55e'],[1130,175,'#16a34a']].forEach(([x,y,c])=>p+=`<rect x="${x-6}" y="${y+40}" width="12" height="76" fill="#92400e"/><circle cx="${x}" cy="${y}" r="46" fill="${c}"/><circle cx="${x-20}" cy="${y+14}" r="30" fill="${c}"/>`);
[[20,'s1'],[400,'s2'],[800,'s1']].forEach(([x,f])=>p+=`<rect x="${x+16}" y="120" width="8" height="116" fill="#92400e"/><rect x="${x+296}" y="120" width="8" height="116" fill="#92400e"/><rect x="${x+16}" y="196" width="288" height="40" rx="5" fill="#b45309"/><rect x="${x+40}" y="176" width="40" height="20" rx="8" fill="#ef4444"/><circle cx="${x+120}" cy="184" r="12" fill="#fbbf24"/><circle cx="${x+160}" cy="184" r="12" fill="#fb923c"/><path d="M${x} 112h320l-26 52h-268z" fill="url(#${f})"/>`);
$('#plaza').innerHTML=p;$('#lg').innerHTML=`<img src="${deps.logoUrl}" width="30" height="30" alt="FINOVA" style="display:block;width:30px;height:30px;object-fit:contain">`;$('#hills').innerHTML='<path d="M0 120C60 70 120 90 190 100S330 60 400 90V200H0z" fill="#dcefe0"/><path d="M0 150C80 110 160 140 240 125S350 110 400 130V200H0z" fill="#cfe8c4"/>';$('#sl').innerHTML=stall('#37b36b');$('#sr').innerHTML=stall('#f6b73c');$('#tr').innerHTML=`<div id="hero"><div class="plant">${sprout}</div><div class="pigw"><div class="fcoin">F</div>${piggy(Math.min(210,innerWidth*.34))}</div><div class="bikew">${bikeB}</div></div><div class="trio">${TRIO.map((t,i)=>`<div class="tc" style="--c:${t[2]}">${ART3[i]}<b>${t[0]}</b><i style="background:${t[3]}">${t[1]}</i></div>`).join('')}</div>`;
$('#mc').innerHTML=piggy(84);$('#bk').innerHTML=bike;
$('#jars').innerHTML=CATS.map((c,i)=>`<button class="jar" data-c="${i}" aria-label="${c.n}">${jar(c.c,i)}<b>${c.n}</b><kbd>tecla ${i+1}</kbd></button>`).join('')})();
/* ---------- datos ---------- */
const GOAL=36000,SEM=4,TW=6;
const ITEMS=[['Cuaderno para la clase de matemáticas',4500,0,'book'],['Almuerzo con fruta para toda la semana',9000,0,'apple'],['Zapatos nuevos: los míos se rompieron',38000,0,'shoe'],['Medicina que recetó el doctor',12000,0,'cross'],['Lápices y colores para el colegio',6000,0,'book'],['Jabón y crema dental',5000,0,'cross'],['Uniforme de educación física',25000,0,'shoe'],['Pasaje para llegar al colegio',2800,0,'coin'],
['Helado todos los días al salir del colegio',3000,1,'cone'],['Juguete de moda que viste en un anuncio',25000,1,'toy'],['Stickers brillantes de colección',5000,1,'candy'],['Skin nueva para el videojuego',12000,1,'toy'],['Paquete de papitas por antojo',2500,1,'candy'],['Cuarto peluche igual a los que ya tienes',18000,1,'toy'],['Gaseosa grande en cada recreo',2000,1,'cone'],['Pulsera de moda solo por hoy',9000,1,'candy'],
['Guardar la mitad de la mesada en la alcancía',5000,2,'piggy'],['Meter las monedas sueltas en el frasco',2000,2,'coin'],['Depositar el dinero de tu cumpleaños',8000,2,'piggy'],['Apartar el 20% antes de gastar',3000,2,'coin'],['Guardar el vuelto de la tienda',1500,2,'coin'],['Vender limonada y guardar la ganancia',6000,2,'piggy'],['Ahorrar la mitad de lo que te dio la abuela',4000,2,'piggy'],['Anotar y guardar tu mesada del domingo',5000,2,'coin'],['Cartuchera nueva porque la mía se rompió',9000,0,'book'],['Transporte de toda la semana',14000,0,'coin'],['Desayuno nutritivo antes de clases',4500,0,'apple'],['Gafas que pidió el oftalmólogo',60000,0,'cross'],['Chaqueta para los días de lluvia',32000,0,'shoe'],['Vitaminas que mandó el médico',11000,0,'cross'],['Libro de lectura que pidió la profesora',16000,0,'book'],['Botella de agua para el colegio',8000,0,'apple'],['Lonchera nueva con personajes de moda',22000,1,'toy'],['Combo de comida rápida con las amigas',16000,1,'cone'],['Esmalte de uñas con brillos',7000,1,'candy'],['Pase para más vidas en un juego',10000,1,'toy'],['Gorra de edición limitada',28000,1,'shoe'],['Bolsa de golosinas para compartir',6000,1,'candy'],['Cine con palomitas y gaseosa',18000,1,'cone'],['Llavero coleccionable de la tienda',6500,1,'toy'],['Dejar la mitad del vuelto en el frasco',3500,2,'coin'],['Guardar un billete de la propina',5000,2,'piggy'],['Vender manillas y guardar la ganancia',7000,2,'piggy'],['Depositar lo que sobró de la lonchera',2500,2,'coin'],['Apartar el 10% de cada regalo',4000,2,'coin'],['Llevar lonchera de casa y guardar lo ahorrado',4500,2,'piggy'],['Anotar la meta y guardar la primera cuota',6000,2,'piggy'],['Reciclar y guardar lo que paguen',3000,2,'coin']];
const EV=[['Una amiga te invita a comprar helados con el dinero de tu alcancía.',['Decir "hoy no, estoy ahorrando para mi bicicleta"',2000,'Decir que no a un antojo es una forma de cuidar tu meta.'],['Aceptar y gastar lo ahorrado',-4000,'Los gastos hormiga se comen el ahorro sin que lo notes.']],
['Un anuncio dice: "Último juguete, solo por hoy". Te lo quieres llevar.',['Aplicar la regla de las 24 horas y pensarlo',2000,'Esperar un día te ayuda a saber si de verdad lo necesitas.'],['Comprarlo ya, antes de que se acabe',-5000,'La prisa por comprar casi siempre termina en dinero perdido.']],
['Se daña tu mochila y necesitas arreglarla ya. Es un imprevisto.',['Usar el fondo de emergencia que apartaste',-1500,'Para eso sirve un fondo de emergencia: te protege sin tocar tu meta.'],['Sacar de la meta sin anotarlo',-5000,'Si tomas dinero sin anotarlo, pierdes el control de tus cuentas.']],
['Tu tía te regala dinero por tus buenas notas.',['Guardar la mitad y gastar la otra con gusto',4000,'Dividir el dinero te deja disfrutar y avanzar a tu meta.'],['Gastarlo todo apenas lo recibes',0,'Pagarte a ti misma primero asegura que tu meta crezca.']],['Una amiga te presta dinero pero quiere que le devuelvas el doble.',['Decir que no y pedir un trato justo',1500,'Un préstamo con cobros injustos te hace perder dinero.'],['Aceptar sin pensarlo',-4500,'Antes de aceptar un trato, calcula cuánto terminarás pagando.']],['Ves el mismo juguete más barato en otra tienda.',['Comparar precios y comprar donde cuesta menos',3000,'Comparar te ayuda a pagar menos por lo mismo.'],['Comprarlo en la primera tienda sin mirar',-3000,'Sin comparar, puedes pagar de más.']],['Tu familia hace una venta de garaje y te invita.',['Vender lo que no usas y guardar la ganancia',5000,'Vender lo que no usas es una forma de generar ingresos.'],['Regalar todo sin pensar en tu meta',0,'Compartir es bueno; también puedes guardar una parte.']],['Se te cae una moneda de la alcancía mal cerrada.',['Anotar lo ocurrido y revisar la alcancía cada semana',500,'Llevar cuentas te ayuda a cuidar lo que ahorras.'],['Olvidarte del tema',-2500,'Lo que no se anota se pierde de vista.']]];
const shuffle=a=>{for(let i=a.length;i>1;){const j=Math.random()*i--|0;[a[i],a[j]]=[a[j],a[i]]}return a};
/* ---------- juego ---------- */
let G,drag;
const show=id=>['title','game'].forEach(x=>$('#'+x).classList.toggle('on',x==id));
$('#go').onclick=()=>{ctx();play=true;S.pop();start()};R().querySelectorAll('.xb').forEach(b=>b.onclick=()=>{mkStop();deps.exit()});const mkLeft=()=>deps.playsLeft();{const l=mkLeft();$('#pl').textContent=l>0?`Te quedan ${l} de 2 partidas este mes`:'Ya usaste tus 2 partidas de este mes. ¡Vuelve el próximo mes!';if(l<=0){$('#go').disabled=true;$('#go').style.cssText='filter:grayscale(1);opacity:.55;cursor:not-allowed'}}
const seeded=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const shufR=(a,r)=>{a=a.slice();for(let i=a.length;i>1;){const j=r()*i--|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function start(){const M=deps.month();if(deps.playsLeft()<=0){show('title');return}const pn=3-deps.playsLeft();deps.registerPlay();const rn=seeded(M*7+pn),by=[0,1,2].map(c=>shufR(ITEMS.filter(i=>i[2]==c),rn));
 G={m:M,w:0,i:0,goal:0,lives:3,score:0,combo:0,best:0,st:[[0,0],[0,0],[0,0]],q:[],lock:true,nf:[0,0,0]};
 for(let w=0;w<SEM;w++)G.q.push(shuffle([by[0].pop(),by[0].pop(),by[1].pop(),by[1].pop(),by[2].pop(),by[2].pop()]));
 R().querySelectorAll('.fl').forEach(f=>f.style.transform='scaleY(0)');
 show('game');hud();week()}
function week(){const b=$('#bn');b.innerHTML=`Semana ${G.w+1} de ${SEM}<small>Mesada: $15.000. ¡Úsala con cabeza!</small>`;b.style.display='block';S.win&&tn(784,.2,'triangle',.12);tn(1047,.3,'triangle',.12,.15);
 b.animate([{transform:'scale(.3)',opacity:0},{transform:'scale(1.08)',opacity:1,offset:.3},{transform:'scale(1)',opacity:1,offset:.8},{transform:'scale(1.4)',opacity:0}],{duration:1900});
 setTimeout(()=>{b.style.display='none';next()},1800)}
function hud(){$('#wk').innerHTML=`Semana ${G.w+1} de ${SEM}<small>Tarjeta ${Math.min(G.i+1,TW)} de ${TW}</small>`;
 const p=Math.min(100,G.goal/GOAL*100);$('#gb i').style.width=p+'%';$('#gt').textContent=fmt(G.goal)+' / '+fmt(GOAL);
 $('#hs').innerHTML=Array.from({length:3},(_,i)=>heart(i<G.lives?'#ef4444':'#cbd5e1')).join('');$('#sc').textContent=G.score}
function say(t){const b=$('#bub');b.textContent=t}
function next(){const it=G.q[G.w][G.i];G.it=it;G.lock=false;G.dx=G.dy=0;hud();
 const c=$('#card');c.getAnimations().forEach(a=>a.cancel());c.style.transition='none';c.style.opacity='';c.style.transform='';void c.offsetWidth;c.className='in';c.innerHTML=`<div class="ic">${ic(it[3])}</div><p>${it[0]}</p><b class="pr">${fmt(it[1])}</b>`;
 S.whoosh();G.T=Math.max(6,11-G.w);G.t0=performance.now();G.last=9;clearInterval(G.iv);
 G.iv=setInterval(()=>{const l=G.T-(performance.now()-G.t0)/1000;G.left=Math.max(0,l);$('#tm i').style.width=G.left/G.T*100+'%';if(l<=3&&Math.ceil(l)!=G.last){G.last=Math.ceil(l);S.tick()}if(l<=0)ans(-1)},100)}
const jEl=k=>R().querySelector(`.jar[data-c="${k}"]`);
function coins(x,y,n,tx,ty){for(let i=0;i<n;i++){const e=document.createElement('i');e.className='mkcoin';e.style.left=x+'px';e.style.top=y+'px';document.body.appendChild(e);
 const a=Math.random()*6.28,r=40+Math.random()*70,bx=Math.cos(a)*r,by=Math.sin(a)*r-40;
 const k=tx==null?[{transform:'translate(0,0) scale(.5)'},{transform:`translate(${bx}px,${by}px) scale(1.1)`,offset:.5},{transform:`translate(${bx*1.2}px,${by+180}px) scale(.6)`,opacity:0}]:[{transform:'translate(0,0) scale(.6)'},{transform:`translate(${bx}px,${by}px) scale(1)`,offset:.35},{transform:`translate(${tx-x}px,${ty-y}px) scale(.5)`,opacity:.9}];
 e.animate(k,{duration:tx==null?900:1200,delay:i*50,easing:'ease-in',fill:'forwards'}).onfinish=()=>e.remove();if(tx!=null)setTimeout(()=>S.pop(),i*50+1000)}}
function pop(t,x,y,c){const e=document.createElement('b');e.textContent=t;e.style.cssText=`position:fixed;left:${x}px;top:${y}px;z-index:25;font:900 26px Nunito;color:${c};text-shadow:0 2px 0 #fff,0 0 8px #fff;pointer-events:none;translate:-50% 0`;document.body.appendChild(e);e.animate([{transform:'translateY(0) scale(.5)',opacity:0},{transform:'translateY(-30px) scale(1.3)',opacity:1,offset:.3},{transform:'translateY(-80px) scale(1)',opacity:0}],{duration:1100}).onfinish=()=>e.remove()}
function vg(c){$('#vg').animate([{boxShadow:`inset 0 0 110px ${c}`},{boxShadow:'inset 0 0 0 transparent'}],{duration:650})}
function ans(c){if(G.lock)return;G.lock=true;clearInterval(G.iv);
 const it=G.it,k=it[2],ok=c==k,cd=$('#card'),cr=cd.getBoundingClientRect(),jr=jEl(k).getBoundingClientRect(),mc=$('#mc');
 G.st[k][1]++;R().querySelectorAll('.jar').forEach(j=>j.classList.remove('ov'));
 if(ok){G.st[k][0]++;G.combo++;G.best=Math.max(G.best,G.combo);const pts=100+G.combo*25+Math.round(G.left*10);G.score+=pts;
  const dx=jr.left+jr.width/2-(cr.left+cr.width/2),dy=jr.top+jr.height/2-(cr.top+cr.height/2);
  cd.animate([{transform:cd.style.transform||'none'},{transform:`translate(${dx}px,${dy}px) scale(.2) rotate(20deg)`,opacity:0}],{duration:450,easing:'ease-in',fill:'forwards'});
  setTimeout(()=>{S.ok();G.combo>=3&&S.combo();pop('+'+pts,jr.left+jr.width/2,jr.top-10,'#059669');vg('#22c55e');const f=jEl(k).querySelector('.fl');G.nf[k]++;f.style.transform=`scaleY(${Math.min(.96,.14+G.nf[k]*.14)})`;
   jEl(k).animate([{transform:'scale(1)'},{transform:'scale(1.25,.85)'},{transform:'scale(.9,1.15)'},{transform:'scale(1)'}],{duration:450});
   coins(jr.left+jr.width/2,jr.top+30,k==2?6:8);
   if(k==2){G.goal=Math.min(GOAL,G.goal+it[1]);const g=$('#gb').getBoundingClientRect();coins(jr.left+jr.width/2,jr.top+30,5,g.left+g.width*G.goal/GOAL,g.top+10);setTimeout(()=>{hud();$('#goal').animate([{scale:1},{scale:1.08},{scale:1}],{duration:400})},1000)}
   hud()},430);
  mc.animate([{transform:'translateY(0)'},{transform:'translateY(-26px) rotate(-8deg)'},{transform:'translateY(0)'}],{duration:500});
  say((G.combo>=3?`¡Racha de ${G.combo}! `:'¡Muy bien! ')+CATS[k].n+': '+CATS[k].d)}
 else{G.lives--;G.combo=0;S.no();vg('#ef4444');cd.animate([{transform:cd.style.transform||'none'},{transform:'translateX(-14px)'},{transform:'translateX(14px)'},{transform:'translateX(-10px)'},{transform:'translateX(0)'}],{duration:400});
  R().animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:260});
  mc.animate([{transform:'rotate(0)'},{transform:'rotate(-10deg)'},{transform:'rotate(10deg)'},{transform:'rotate(0)'}],{duration:500});
  cd.style.transition='transform .5s';cd.style.transform='';
  jEl(k).classList.add('hint');setTimeout(()=>jEl(k).classList.remove('hint'),1600);
  say((c<0?'Se acabó el tiempo. ':'Casi. ')+`Esto era ${CATS[k].n}. ${CATS[k].d}`);
  setTimeout(()=>{cd.animate([{opacity:1},{opacity:0,transform:'scale(.8)'}],{duration:350,fill:'forwards'})},1900)}
 hud();
 setTimeout(()=>{G.i++;if(G.lives<=0)return end();G.i>=TW?event():next()},ok?1300:2500)}
function mod(h){$('#mb').innerHTML=h;show('modal');$('#modal').classList.add('on');$('#game').classList.add('on')}
function event(){const e=EV[(G.w+G.m)%EV.length],o=shuffle([e[1],e[2]]);
 mod(`<div style="display:flex;justify-content:center">${piggy(90)}</div><h2>Imprevisto de la semana</h2><p>${e[0]}</p>${o.map((x,i)=>`<button class="opt" data-i="${i}">${x[0]}</button>`).join('')}`);
 R().querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const x=o[b.dataset.i],d=x[1];S.pop();G.goal=Math.max(0,Math.min(GOAL,G.goal+d));d>0?S.ok():d<0?S.no():0;
  mod(`<h2>${d>0?'¡Buena decisión!':d<0?'Uy, eso costó':'Se pudo mejor'}</h2><span class="chip" style="background:${d>0?'#bbf7d0':d<0?'#fecaca':'#e2e8f0'}">${d>0?'+':d<0?'-':''}${fmt(Math.abs(d))}</span><p>${x[2]}</p><button class="btn" id="nx" style="margin-top:8px">Seguir a la semana ${G.w+2<=SEM?G.w+2:'final'}</button>`);
  if(d>0){const r=$('#mb').getBoundingClientRect();coins(r.left+r.width/2,r.top+60,10)}hud();
  $('#nx').onclick=()=>{S.pop();G.w++;G.i=0;$('#modal').classList.remove('on');$('#mb').innerHTML='';if(G.w>=SEM)end();else{hud();week()}}})}
function end(){clearInterval(G.iv);const p=G.goal/GOAL,dead=G.lives<=0,n=dead?0:p>=1?3:p>=.7?2:p>=.4?1:0;
 const msg=dead?'Te quedaste sin corazones. Repasa las diferencias entre necesidad, deseo y ahorro e inténtalo otra vez.':n==3?'¡Meta cumplida! Ya puedes comprar tu bicicleta con dinero que ahorraste tú misma.':n==2?'¡Casi llegas! Con un poco más de ahorro la bicicleta es tuya.':n==1?'Vas bien. Cada moneda guardada te acerca a tu meta.':'Hoy ahorraste poco. Evita los gastos hormiga y prueba de nuevo.';
 const tot=G.st.reduce((a,b)=>a+b[1],0),oks=G.st.reduce((a,b)=>a+b[0],0),rw=deps.reward(n,oks,G.score);
 mod(`<div style="display:flex;justify-content:center">${piggy(100)}</div><h2>${n==3?'¡Ahorradora experta!':n>0?'¡Buen trabajo!':'¡Sigue practicando!'}</h2><div style="display:flex;justify-content:center">${[0,1,2].map(i=>star(i<n)).join('')}</div><p>${msg}</p><p><b>${fmt(G.goal)}</b> de ${fmt(GOAL)} ahorrados · <b>${G.score}</b> puntos · mejor racha <b>${G.best}</b></p>
 <div class="bars">${CATS.map((c,i)=>`<div><span>${c.n}</span><em><i data-w="${G.st[i][1]?G.st[i][0]/G.st[i][1]*100:0}" style="background:${c.c}"></i></em>${G.st[i][0]}/${G.st[i][1]}</div>`).join('')}</div>
 <p style="font-size:13px">Aciertos totales: ${oks} de ${tot}</p><span class="chip" style="background:#fef3c7">Premio: +${deps.formatCOP(rw.c)} y +${rw.x} XP</span><br><button class="btn alt" id="rp">${mkLeft()>0?`Jugar otra vez (${mkLeft()} restante${mkLeft()>1?'s':''})`:'Ir a mi panel'}</button>`);
 $('#rp').onclick=()=>{S.pop();$('#modal').classList.remove('on');if(mkLeft()<=0){mkStop();deps.exit();return}start()};
 setTimeout(()=>R().querySelectorAll('.bars i').forEach(i=>i.style.width=i.dataset.w+'%'),50);
 R().querySelectorAll('.st').forEach((s,i)=>s.animate([{opacity:0,transform:'scale(0) rotate(-90deg)'},{opacity:1,transform:'scale(1.3) rotate(10deg)',offset:.7},{opacity:1,transform:'scale(1)'}],{duration:600,delay:500+i*350,fill:'forwards'}).onfinish=()=>{i<n&&S.ok()});
 if(n>0){setTimeout(S.win,300);for(let i=0;i<70;i++){const e=document.createElement('i');e.className='mkcf';e.style.left=Math.random()*100+'vw';e.style.background=['#ef4444','#fbbf24','#10b981','#2563eb','#ec4899'][i%5];document.body.appendChild(e);
  e.animate([{transform:'translateY(-20px) rotate(0)'},{transform:`translate(${Math.random()*120-60}px,${innerHeight+30}px) rotate(${Math.random()*900}deg)`}],{duration:2200+Math.random()*1800,delay:Math.random()*900,fill:'forwards'}).onfinish=()=>e.remove()}}}
/* ---------- controles ---------- */
R().querySelectorAll('.jar').forEach(j=>j.onclick=()=>ans(+j.dataset.c));
const onKey=e=>{if(root.isConnected&&G&&'123'.includes(e.key)&&e.key)ans(+e.key-1)};document.addEventListener('keydown',onKey);function mkStop(){try{clearInterval(G&&G.iv)}catch(x){}play=false}
const cd=$('#card'),jAt=(x,y)=>document.elementsFromPoint(x,y).map(e=>e.closest&&e.closest('.jar')).find(Boolean);
cd.onpointerdown=e=>{if(!G||G.lock)return;drag=[e.clientX,e.clientY];cd.setPointerCapture(e.pointerId);cd.classList.add('drag');cd.style.transition='none'};
cd.onpointermove=e=>{if(!drag)return;G.dx=e.clientX-drag[0];G.dy=e.clientY-drag[1];cd.style.transform=`translate(${G.dx}px,${G.dy}px) rotate(${G.dx/25}deg)`;const j=jAt(e.clientX,e.clientY);R().querySelectorAll('.jar').forEach(x=>x.classList.toggle('ov',x==j))};
cd.onpointerup=e=>{if(!drag)return;drag=null;cd.classList.remove('drag');const j=jAt(e.clientX,e.clientY);
 if(j)ans(+j.dataset.c);else{cd.style.transition='transform .35s cubic-bezier(.2,1.5,.4,1)';cd.style.transform='';G.dx=G.dy=0;R().querySelectorAll('.jar').forEach(x=>x.classList.remove('ov'))}};

  return () => {
    mkStop();
    clearInterval(mus);
    document.removeEventListener('keydown', onKey);
    document.querySelectorAll('.mkcoin,.mkcf').forEach((e) => e.remove());
  };
}
