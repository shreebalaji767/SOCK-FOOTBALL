import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86c8e7);
scene.fog = new THREE.Fog(0x86c8e7, 55, 120);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 180);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xf7fbff, 0x2d5b36, 2.0));
const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(-25, 38, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
scene.add(sun);

const M = c => new THREE.MeshStandardMaterial({color:c, roughness:.78});
const green=M(0x2f8b48), green2=M(0x368f4c), white=M(0xf5f5ee), dark=M(0x172018);
const home=M(0x1768d2), homeShort=M(0x0b367c), away=M(0xd9363e), awayShort=M(0x821d25);
const skin=M(0xc98d68), black=M(0x17191b), keeper=M(0xf0d52d), refMat=M(0x222222);

const FIELD_W=32, FIELD_L=50, GOAL_W=7.32, GOAL_D=2.0, BOX_W=13.2, BOX_D=5.5, PEN_D=16.5;
const HALF=FIELD_L/2;

function addBox(w,h,d,mat,x=0,y=0,z=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); return m;
}
function line(w,d,x,z){ return addBox(w,.035,d,white,x,.04,z); }

addBox(FIELD_W,.3,FIELD_L,green,0,-.18,0);
addBox(FIELD_W+1,.25,FIELD_L+1,dark,0,-.36,0);
for(let z=-HALF+2.5;z<HALF;z+=5) addBox(FIELD_W,.015,2.5,(Math.round((z+HALF)/5)%2)?green2:green,0,.01,z);
line(FIELD_W,.12,0,-HALF); line(FIELD_W,.12,0,HALF); line(.12,FIELD_L,-FIELD_W/2,0); line(.12,FIELD_L,FIELD_W/2,0); line(FIELD_W,.09,0,0);
const centerCircle=new THREE.Mesh(new THREE.RingGeometry(4.9,4.98,96),white); centerCircle.rotation.x=-Math.PI/2; centerCircle.position.y=.06; scene.add(centerCircle);
const centerDot=new THREE.Mesh(new THREE.CircleGeometry(.14,24),white); centerDot.rotation.x=-Math.PI/2; centerDot.position.y=.065; scene.add(centerDot);

for(const side of [-1,1]){
  const end=side*HALF;
  line(13.2,.1,0,end-side*5.5); line(.1,5.5,-6.6,end-side*2.75); line(.1,5.5,6.6,end-side*2.75);
  line(5.5,.1,0,end-side*2.0); line(.1,2,-2.75,end-side); line(.1,2,2.75,end-side);
  const arc=new THREE.Mesh(new THREE.RingGeometry(9.15,9.23,60,1,side<0?0.2:Math.PI+0.2,Math.PI-0.4),white);
  arc.rotation.x=-Math.PI/2; arc.position.set(0,.055,end-side*16.5); scene.add(arc);
}

function makeGoal(z){
  const back=z+(z<0?-GOAL_D:GOAL_D);
  for(const x of [-GOAL_W/2,GOAL_W/2]){ addBox(.18,3,.18,white,x,1.5,z); addBox(.04,2.8,.04,white,x,1.5,back); }
  addBox(GOAL_W,.18,.18,white,0,3,z); addBox(GOAL_W,.12,.12,white,0,2.8,back);
  for(let x=-GOAL_W/2;x<=GOAL_W/2;x+=.75) addBox(.025,2.7,.025,M(0xdde6df),x,1.5,back);
  for(let y=.3;y<=2.7;y+=.6) addBox(GOAL_W,.025,.025,M(0xdde6df),0,y,back);
}
makeGoal(-HALF); makeGoal(HALF);

function playerVisual(shirt,shorts,num,isGK){
  const g=new THREE.Group();
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.55,.67,1.15,18),shirt); torso.position.y=1.65; g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.38,18,14),skin); head.position.y=2.65; g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.39,18,10,0,Math.PI*2,0,Math.PI*.5),black); hair.position.y=2.77; g.add(hair);
  for(const x of [-.27,.27]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.14,.17,.72,12),skin); leg.position.set(x,.42,0); g.add(leg);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.3,.16,.58),black); boot.position.set(x,.08,.16); g.add(boot);
  }
  for(const x of [-.72,.72]){
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.8,12),shirt); arm.position.set(x,1.65,0); arm.rotation.z=x<0?.22:-.22; g.add(arm);
  }
  if(isGK){ const gloveMat=M(0xe8e8e8); for(const x of [-.9,.9]){const gl=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),gloveMat); gl.position.set(x,1.7,0); g.add(gl);} }
  const lc=document.createElement('canvas'); lc.width=160; lc.height=54;
  const ctx=lc.getContext('2d'); ctx.fillStyle='#fff'; ctx.font='bold 28px Arial'; ctx.textAlign='center'; ctx.fillText(String(num),80,35);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(lc),transparent:true,depthTest:false}));
  sprite.scale.set(.8,.27,1); sprite.position.y=3.25; sprite.visible=false; g.add(sprite);
  scene.add(g); return {group:g,label:sprite};
}

const formation=[
  [0,22,'GK'],[-7,17,'LB'],[-2.4,18,'CB'],[2.4,18,'CB'],[7,17,'RB'],
  [-5.8,8,'LM'],[0,9,'CM'],[5.8,8,'RM'],
  [-6,-1,'LW'],[0,-1,'ST'],[6,-1,'RW']
];

function makeTeam(isHome){
  const shirt=isHome?home:away, shorts=isHome?homeShort:awayShort;
  return formation.map((f,i)=>{
    const base=new THREE.Vector3(f[0],0,isHome?f[1]:-f[1]);
    const v=playerVisual(shirt,shorts,i+1,f[2]==='GK');
    const names=isHome
      ?['R. Mehta','A. Khan','V. Singh','K. Yadav','M. Verma','S. Malik','A. Sharma','N. Gill','R. Kumar','A. Hooda','D. Saini']
      :['J. Carter','L. Brown','M. Wilson','D. Evans','T. Moore','R. Hall','C. Adams','P. King','S. Young','J. Taylor','C. Lewis'];
    const attrs=playerAttributes(f[2]);
    const rating=Math.round((attrs.pace+attrs.passing+attrs.shooting+attrs.control+attrs.strength)/5);
    return {id:i+1,name:names[i],rating,role:f[2],home:isHome,base,mesh:v.group,label:v.label,vel:new THREE.Vector3(),
      speed:f[2]==='GK'?4.5:5.4,stamina:100,cool:0,tackleCool:0,yellow:0,red:false,attributes:attrs,
      shots:0,passes:0,tackles:0,touches:0,goals:0,fouls:0};
  });
}
const homeTeam=makeTeam(true), awayTeam=makeTeam(false);
let activeIndex=9, me=homeTeam[activeIndex];

function updatePlayerCard(){
  const p=me;
  if(!p)return;
  const card=document.getElementById('playerCard');
  if(!card)return;
  card.innerHTML='<b>'+p.name+'</b><span>'+p.role+' · OVR '+p.rating+'</span><small>PACE '+p.attributes.pace+' · PASS '+p.attributes.passing+' · SHOOT '+p.attributes.shooting+' · CTRL '+p.attributes.control+'<br>STAMINA '+Math.round(p.stamina)+'%</small>';
}
function setActive(i){
  const available=homeTeam.map((p,n)=>({p,n})).filter(x=>!x.p.red);
  if(!available.length)return;
  activeIndex=(i+homeTeam.length)%homeTeam.length;
  if(homeTeam[activeIndex].red) activeIndex=available[0].n;
  me=homeTeam[activeIndex];
  homeTeam.forEach((p,n)=>{p.mesh.scale.setScalar(n===activeIndex?1.12:1);p.label.visible=n===activeIndex});
  document.getElementById('statusText').textContent='HOME '+me.role+' #'+me.id;
  updatePlayerCard();
}

const ball=new THREE.Mesh(new THREE.SphereGeometry(.43,28,20),white);
ball.position.set(0,.43,0); ball.castShadow=true; scene.add(ball);
const ballVel=new THREE.Vector3();
const ballSpin=new THREE.Vector3();
let ballOwner=null;
let touchGrace=0;

// --- MATCH ENGINE UPGRADE: player attributes + ball curve + first-touch quality ---
function playerAttributes(role){
  const map={
    GK:{pace:72,passing:58,shooting:35,control:62,strength:82},
    LB:{pace:80,passing:72,shooting:42,control:70,strength:68},
    CB:{pace:68,passing:66,shooting:30,control:58,strength:86},
    RB:{pace:80,passing:72,shooting:42,control:70,strength:68},
    LM:{pace:82,passing:78,shooting:58,control:82,strength:62},
    CM:{pace:74,passing:86,shooting:62,control:88,strength:70},
    RM:{pace:82,passing:78,shooting:58,control:82,strength:62},
    LW:{pace:90,passing:76,shooting:78,control:90,strength:55},
    ST:{pace:84,passing:68,shooting:91,control:86,strength:80},
    RW:{pace:90,passing:76,shooting:78,control:90,strength:55}
  };
  return {...map[role]};
}
function firstTouch(p){
  const a=p.attributes;
  const pressure=nearestOppDistance(p);
  const quality=THREE.MathUtils.clamp((a.control/100)*(.65+.35*Math.min(1,pressure/3))*(p.stamina<30?.86:1),.28,.98);
  if(Math.random()>quality){
    releaseBall();
    const loose=new THREE.Vector3((Math.random()-.5)*2,0,(Math.random()-.5)*2).normalize();
    ball.position.addScaledVector(loose,.35);
    ballVel.copy(loose).multiplyScalar(1.4);
    comment('Heavy touch!',true);
    return false;
  }
  return true;
}

const state={
  half:1, minute:0, seconds:0, score:[0,0], paused:false, over:false,
  phase:'PLAY', restartTeam:'HOME', restartType:'KICKOFF', restartSpot:new THREE.Vector3(0,.43,0), restartTimer:0,
  lastTouch:'HOME', stoppage:0, halfStoppage:0, addedShown:false, penaltyShooter:null,
  halftimeTimer:0,
  possession:{HOME:0,AWAY:0}, lastComment:0, messageTimer:0,
  stats:{HOME:{shots:0,shotsOn:0,passes:0,tackles:0,fouls:0,corners:0,offsides:0,yellows:0},
         AWAY:{shots:0,shotsOn:0,passes:0,tackles:0,fouls:0,corners:0,offsides:0,yellows:0}}
};

const held=new Set(); let mobileSprint=false, shielding=false;

// --- REALISM UPGRADE: fatigue, tactical shape, ball control and goalkeeper intelligence ---
const tactics={
  HOME:{name:'BALANCED',width:1,depth:1,press:1},
  AWAY:{name:'BALANCED',width:1,depth:1,press:1}
};
let tacticalMode=0;

// Formation presets. The same 11 players are repositioned instantly; this keeps the
// browser-only game lightweight while making the tactical structure visibly change.
const formationModes=[
  {name:'4-3-3', positions:{
    GK:[0,22],LB:[-7,17],CB:[-2.4,18],CB2:[2.4,18],RB:[7,17],
    LM:[-5.8,8],CM:[0,9],RM:[5.8,8],LW:[-6,-1],ST:[0,-1],RW:[6,-1]
  }},
  {name:'4-4-2', positions:{
    GK:[0,22],LB:[-7,17],CB:[-2.4,18],CB2:[2.4,18],RB:[7,17],
    LM:[-6,7],CM:[-2,7],RM:[6,7],LW:[2,7],ST:[-3,-1],RW:[3,-1]
  }},
  {name:'3-5-2', positions:{
    GK:[0,22],LB:[-6,17],CB:[0,18],CB2:[6,17],RB:[-7,7],
    LM:[-6,7],CM:[-2.2,8],RM:[6,7],LW:[2.2,8],ST:[-3,-1],RW:[3,-1]
  }}
];
let formationMode=0;
function applyFormation(index,announce=true){
  formationMode=(index+formationModes.length)%formationModes.length;
  const preset=formationModes[formationMode].positions;
  const roleSlots={
    GK:[0],LB:[1],CB:[2],CB2:[3],RB:[4],LM:[5],CM:[6],RM:[7],
    LW:[8],ST:[9],RW:[10]
  };
  homeTeam.forEach((p,i)=>{
    let key=p.role;
    if(p.role==='CB') key=i===3?'CB2':'CB';
    const pos=preset[key];
    if(pos){
      p.base.set(pos[0],0,pos[1]);
      if(state?.phase==='RESTART'||state?.minute<1)p.mesh.position.copy(p.base);
    }
  });
  if(announce)comment('Formation changed: '+formationModes[formationMode].name,true);
}
const tacticalModes=[
  {name:'BALANCED',width:1,depth:1,press:1},
  {name:'ATTACKING',width:1.18,depth:1.22,press:1.18},
  {name:'DEFENSIVE',width:.82,depth:.76,press:.82}
];
function currentTactic(p){return p.home?tactics.HOME:tactics.AWAY}
function effectiveSpeed(p){
  const fatigue=p.stamina<15?.72:p.stamina<30?.84:p.stamina<50?.93:1;
  return p.speed*fatigue;
}
function fatigueUpdate(p,dt){
  const moving=p.vel.length()>2;
  const sprinting=p===me&&((held.has('ShiftLeft')||held.has('ShiftRight')||mobileSprint));
  if(moving) p.stamina=Math.max(0,p.stamina-(sprinting?11:2.2)*dt);
  else p.stamina=Math.min(100,p.stamina+5.5*dt);
}
function setTactic(mode){
  tacticalMode=(mode+tacticalModes.length)%tacticalModes.length;
  const t=tacticalModes[tacticalMode];
  tactics.HOME=t; tactics.AWAY={...t};
  comment('HOME tactic: '+t.name,true);
}
function applyTacticalShape(p,target){
  const t=currentTactic(p);
  if(p.role==='GK')return target;
  const attacking=p.home?-1:1;
  const possession=ballOwner&&ballOwner.home===p.home;
  if(!possession){
    target.z += attacking*(1-t.depth)*4.5;
    target.x *= t.width;
  }else{
    target.z += attacking*(t.depth-1)*2.5;
    target.x *= t.width;
  }
  return target;
}

const clock=new THREE.Clock();

function comment(t,force=false){
  const now=performance.now();
  if(!force&&now-state.lastComment<700)return;
  state.lastComment=now; document.getElementById('commentaryText').textContent=t;
}
function d2(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
function teamOf(p){return p.home?homeTeam:awayTeam}
function oppTeam(p){return p.home?awayTeam:homeTeam}
function attackDir(p){return p.home?-1:1}
function goalZ(p){return p.home?-HALF:HALF}
function clampPlayer(p){
  p.mesh.position.x=THREE.MathUtils.clamp(p.mesh.position.x,-FIELD_W/2+.55,FIELD_W/2-.55);
  p.mesh.position.z=THREE.MathUtils.clamp(p.mesh.position.z,-HALF+.55,HALF-.55);
}
function nearest(team,excludeGK=false){
  return team.filter(p=>!p.red&&(!excludeGK||p.role!=='GK')).reduce((a,b)=>d2(a.mesh.position,ball.position)<d2(b.mesh.position,ball.position)?a:b,team.find(p=>!p.red));
}
function nearestOppDistance(p){
  return oppTeam(p).filter(q=>!q.red).reduce((m,q)=>Math.min(m,d2(p.mesh.position,q.mesh.position)),99);
}
function hasControl(p){
  return !p.red && d2(p.mesh.position,ball.position)<(p.role==='GK'?1.55:1.28) && ball.position.y<1.25 && ballVel.length()<8;
}
function giveControl(p){
  if(!hasControl(p))return false;
  ballOwner=p; ballVel.multiplyScalar(.15); ball.position.y=.43;
  state.lastTouch=p.home?'HOME':'AWAY'; p.touches++;
  return true;
}
function releaseBall(){ballOwner=null; touchGrace=.2}

function dribble(p,dt){
  if(!giveControl(p)&&ballOwner!==p)return;
  const f=new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));
  const pressure=nearestOppDistance(p);
  const sprint=(held.has('ShiftLeft')||held.has('ShiftRight')||mobileSprint)&&p.stamina>3;
  let dir=p.vel.length()>1?p.vel.clone().normalize():f;
  if(shielding&&pressure<2.2){const nearestOpponent=oppTeam(p).filter(q=>!q.red).sort((a,b)=>d2(a.mesh.position,p.mesh.position)-d2(b.mesh.position,p.mesh.position))[0]; dir.copy(p.mesh.position).sub(nearestOpponent?.mesh.position||p.mesh.position);dir.y=0;if(dir.lengthSq()>0)dir.normalize();}
  const offset=sprint?1.0:.68;
  ball.position.copy(p.mesh.position).addScaledVector(dir,offset); ball.position.y=.43;
  ballVel.lerp(dir.multiplyScalar(sprint?1.2:.55),Math.min(1,dt*10));
  state.lastTouch=p.home?'HOME':'AWAY'; touchGrace=.14;
}

function kick(p,target,power,loft=0){
  if(p.red||p.cool>0||d2(p.mesh.position,ball.position)>1.8)return false;
  const dir=target.clone().sub(ball.position); dir.y=0;
  if(dir.lengthSq()<.01)dir.set(0,0,attackDir(p));
  dir.normalize();
  const technique=THREE.MathUtils.clamp(p.attributes.passing/85,.62,1.08);
  ballOwner=null;
  ballVel.copy(dir).multiplyScalar(power*technique);
  ballVel.y=loft;
  ballSpin.set((p.mesh.position.x-ball.position.x)*.025,0,(Math.random()-.5)*.12);
  p.cool=.22; state.lastTouch=p.home?'HOME':'AWAY'; touchGrace=.2; return true;
}

function shoot(p){
  if(!hasControl(p))return;
  if(p.attributes.shooting<45){comment('Weak shooting ability.',true);return;}
  if(p.stamina<8){comment('Too tired to strike cleanly.',true);return;}
  const fatigueError=p.stamina<30?1.9:p.stamina<55?1.45:1.2;
  const targetX=THREE.MathUtils.clamp(-p.mesh.position.x*.08+(Math.random()-.5)*fatigueError,-GOAL_W/2+.5,GOAL_W/2-.5);
  const target=new THREE.Vector3(targetX,0,goalZ(p));
  const dist=Math.abs(p.mesh.position.z-goalZ(p));
  const accuracy=p.attributes.shooting/90;
  const power=(dist>22?17:dist>14?15.5:13.5)*(p.stamina<25?.9:p.stamina<45?.96:1)*(.88+.12*accuracy);
  if(kick(p,target,power,dist>18?1.0:.35)){p.shots++;state.stats[p.home?'HOME':'AWAY'].shots++;if(dist<18)state.stats[p.home?'HOME':'AWAY'].shotsOn++;comment(p.home?'SHOT!':'Away shoots!',true)}
}
function pass(p,through=false){
  if(!hasControl(p))return;
  const team=teamOf(p);
  const candidates=team.filter(q=>q!==p&&!q.red);
  let best=null,bestScore=-999;
  for(const q of candidates){
    const v=q.mesh.position.clone().sub(p.mesh.position);v.y=0; const dist=v.length();
    if(dist<3||dist>22)continue;
    const dir=v.clone().normalize(), forward=dir.z*attackDir(p);
    const space=Math.min(1,nearestOppDistance(q)/6);
    const central=1-Math.min(1,Math.abs(q.mesh.position.x)/16);
    const score=forward*2.2+space*2.8+central*.4-dist*.025;
    if(score>bestScore){bestScore=score;best=q}
  }
  if(!best)return;
  if(isOffsidePosition(best)){
    state.stats[p.home?'HOME':'AWAY'].offsides++;
    comment('Offside — indirect free kick to the defence.',true);
    awardFreeKick(p.home?'AWAY':'HOME',best.mesh.position.clone(),'INDIRECT');
    return;
  }
  const target=best.mesh.position.clone();
  if(through)target.add(best.vel.clone().multiplyScalar(.8));
  const power=THREE.MathUtils.clamp(7+target.distanceTo(p.mesh.position)*.18,7.5,11.5)*(p.stamina<25?.9:1)*(p.attributes.passing/85);
  if(kick(p,target,power,through?1.0:0)){p.passes++;state.stats[p.home?'HOME':'AWAY'].passes++;comment(through?'Through ball.':'Pass.',true)}
}
function cross(p){
  if(!hasControl(p)||Math.abs(p.mesh.position.x)<6)return;
  const target=teamOf(p).filter(q=>q!==p&&!q.red&&['ST','LW','RW'].includes(q.role)).sort((a,b)=>Math.abs(a.mesh.position.z-goalZ(p))-Math.abs(b.mesh.position.z-goalZ(p)))[0];
  const t=target?target.mesh.position.clone():new THREE.Vector3(-p.mesh.position.x*.35,0,goalZ(p));
  if(kick(p,t,11.8,3.2))comment('Cross into the box.',true);
}

function isInPenaltyArea(pos,homeSide){
  const z0=homeSide?-HALF:HALF;
  return Math.abs(pos.x)<=BOX_W/2 && (homeSide?pos.z<=-HALF+PEN_D:pos.z>=HALF-PEN_D);
}
function isOffsidePosition(p){
  if(p.role==='GK')return false;
  const defenders=oppTeam(p).filter(q=>!q.red).sort((a,b)=>Math.abs(b.mesh.position.z-goalZ(p))-Math.abs(a.mesh.position.z-goalZ(p)));
  if(defenders.length<2)return false;
  const secondLast=defenders[1];
  const beyondSecond=p.home?p.mesh.position.z<secondLast.mesh.position.z:p.mesh.position.z>secondLast.mesh.position.z;
  const beyondBall=p.home?p.mesh.position.z<ball.position.z:p.mesh.position.z>ball.position.z;
  const inOppHalf=p.home?p.mesh.position.z<0:p.mesh.position.z>0;
  return beyondSecond&&beyondBall&&inOppHalf;
}

function foulFor(tackler,target,kind='tackle'){
  if(tackler.red)return;
  const inBox=isInPenaltyArea(target.mesh.position,tackler.home);
  if(inBox){
    state.stats[tackler.home?'HOME':'AWAY'].fouls++;
    tackler.fouls++;
    state.restartType='PENALTY'; state.restartTeam=tackler.home?'HOME':'AWAY'; state.penaltyShooter=nearest(teamOf(tackler)); state.phase='RESTART';
    state.restartSpot.set(0,.43,tackler.home?-HALF+11:HALF-11);
    comment('FOUL! PENALTY KICK.',true);
  }else awardFreeKick(tackler.home?'HOME':'AWAY',target.mesh.position.clone(),kind==='handball'?'DIRECT':'DIRECT');
  const chance=kind==='slide'?.18:.10;
  if(Math.random()<chance){tackler.yellow++;state.stats[tackler.home?'HOME':'AWAY'].yellows++;comment(tackler.yellow>1?'SECOND YELLOW — SENT OFF.':'YELLOW CARD.',true);if(tackler.yellow>1){tackler.red=true;tackler.mesh.visible=false}}}
function awardFreeKick(team,spot,type='DIRECT'){
  state.restartType=type==='INDIRECT'?'INDIRECT FREE KICK':'FREE KICK';
  state.restartTeam=team; state.restartSpot.set(THREE.MathUtils.clamp(spot.x,-FIELD_W/2+1,FIELD_W/2-1),.43,THREE.MathUtils.clamp(spot.z,-HALF+1,HALF-1));
  state.phase='RESTART';
}
function tackle(p,slide=false){
  if(p.red||p.tackleCool>0)return; p.tackleCool=slide?1.0:.7;
  const opp=oppTeam(p).filter(q=>!q.red).sort((a,b)=>d2(a.mesh.position,p.mesh.position)-d2(b.mesh.position,p.mesh.position))[0];
  if(!opp||d2(opp.mesh.position,p.mesh.position)>2.0)return;
  const facing=new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));
  const toBall=ball.position.clone().sub(p.mesh.position);toBall.y=0;if(toBall.lengthSq()<.01)return;toBall.normalize();
  const quality=facing.dot(toBall);
  if(slide)p.mesh.position.addScaledVector(facing,.75);
  if(Math.random()< (slide?.13:.07)){foulFor(p,opp,slide?'slide':'tackle');return}
  if(ballOwner===opp||d2(ball.position,p.mesh.position)<1.7){
    releaseBall(); ball.position.copy(p.mesh.position).addScaledVector(toBall,.72); ball.position.y=.43;
    ballVel.copy(toBall).multiplyScalar(slide?5:2.2); state.lastTouch=p.home?'HOME':'AWAY'; p.tackles++; state.stats[p.home?'HOME':'AWAY'].tackles++;
    comment('Clean tackle — possession won.',true);
  }else if(quality<.1&&Math.random()<.2){foulFor(p,opp); }
}
function moveUser(dt){
  const x=(held.has('KeyD')||held.has('ArrowRight'))-(held.has('KeyA')||held.has('ArrowLeft'));
  const z=(held.has('KeyS')||held.has('ArrowDown'))-(held.has('KeyW')||held.has('ArrowUp'));
  const dir=new THREE.Vector3(x,0,z); if(dir.lengthSq())dir.normalize();
  const sprint=(held.has('ShiftLeft')||held.has('ShiftRight')||mobileSprint)&&me.stamina>3;
  const mult=(sprint?1.38:1)*(me.stamina<15?.72:me.stamina<30?.84:me.stamina<50?.93:1);
  me.vel.lerp(dir.multiplyScalar(me.speed*mult),Math.min(1,dt*11));
  me.mesh.position.addScaledVector(me.vel,dt); clampPlayer(me);
  if(me.vel.lengthSq()>1)me.mesh.rotation.y=Math.atan2(me.vel.x,me.vel.z);
  fatigueUpdate(me,dt);
  if(ballOwner===me||hasControl(me))dribble(me,dt);
}

function teamAI(team,dt){
  const isHome=team===homeTeam, dir=isHome?-1:1;
  const chaser=nearest(team,true);
  const opponentOwner=ballOwner&&ballOwner.home!==isHome?ballOwner:null;
  for(const p of team){
    if(p.red||p===me)continue;
    p.cool=Math.max(0,p.cool-dt);p.tackleCool=Math.max(0,p.tackleCool-dt);
    let target=p.base.clone();
    const ballNear=d2(p.mesh.position,ball.position);
    if(p===chaser && (ballOwner===null||ballOwner.home!==isHome)) target.copy(ball.position);
    else if(ballOwner && ballOwner.home===isHome && d2(p.mesh.position,ballOwner.mesh.position)<22){
      if(p.role==='ST'||p.role==='LW'||p.role==='RW'){target.z+=dir*3.2;target.x+=Math.sin(performance.now()*.001+p.id)*.8}
      else target.z+=dir*1.0;
    }else if(opponentOwner && ['CB','LB','RB','CM','LM','RM'].includes(p.role)){
      const owner=opponentOwner;
      const danger=Math.max(0,1-d2(p.mesh.position,owner.mesh.position)/18);
      target.lerp(owner.mesh.position,.18+danger*.28);
      if(p.role==='CB') target.x*=.55;
    }
    target=applyTacticalShape(p,target);
    if(p.role==='GK'){
      const line=isHome?HALF-1.8:-HALF+1.8;
      target.set(THREE.MathUtils.clamp(ball.position.x,-5.8,5.8),0,line);
      if(d2(p.mesh.position,ball.position)<3.0&&ball.position.y<2.6)keeperAction(p);
    }
    const v=target.sub(p.mesh.position);v.y=0;
    if(v.lengthSq()>0.5){v.normalize();p.vel.lerp(v.multiplyScalar(effectiveSpeed(p)),Math.min(1,dt*3.5));p.mesh.rotation.y=Math.atan2(p.vel.x,p.vel.z)}
    else p.vel.multiplyScalar(.75);
    p.mesh.position.addScaledVector(p.vel,dt);clampPlayer(p);
    fatigueUpdate(p,dt);
    if(ballOwner===p)aiWithBall(p,dt);
    if(ballOwner&&ballOwner.home!==isHome&&d2(p.mesh.position,ballOwner.mesh.position)<1.65&&p.role!=='GK'&&p.tackleCool<=0){
      if(Math.random()<dt*.9)tackle(p,false);
    }
  }
}
function aiWithBall(p,dt){
  const dGoal=Math.abs(p.mesh.position.z-goalZ(p));
  const pressure=nearestOppDistance(p);
  if(p.role==='GK'&&dGoal<6){kick(p,new THREE.Vector3((Math.random()-.5)*12,0,attackDir(p)*20),12,1.3);return}
  if(dGoal<20&&Math.abs(p.mesh.position.x)<10&&Math.random()<dt*.75){shoot(p);return}
  if(pressure<2.0&&Math.random()<dt*2.2){pass(p,Math.random()<.28);return}
  if(p.role==='CM'&&dGoal>18&&Math.random()<dt*.45){pass(p,Math.random()<.18);return}
  if((p.role==='LW'||p.role==='RW')&&Math.abs(p.mesh.position.x)>8&&Math.random()<dt*.7){cross(p);return}
  dribble(p,dt);
}

function keeperAction(g){
  if(g.cool>0)return;
  // Keeper anticipates the shot line and shifts laterally before committing.
  const incoming=ballVel.clone(); incoming.y=0;
  if(incoming.length()>3){
    const look=ball.position.clone().add(incoming.multiplyScalar(.18));
    g.mesh.position.x=THREE.MathUtils.clamp(look.x,-GOAL_W/2+0.35,GOAL_W/2-.35);
  }
  if(ball.position.y>1.1||ballVel.length()>7){
    g.cool=.5; const clear=new THREE.Vector3((ball.position.x-g.mesh.position.x)*1.2,0,attackDir(g)); clear.normalize();
    ballOwner=null; ballVel.copy(clear.multiplyScalar(10)); state.lastTouch=g.home?'HOME':'AWAY'; comment(g.home?'Keeper saves!':'Away keeper saves!',true);
  }else if(d2(g.mesh.position,ball.position)<1.7){
    ballOwner=g; ball.position.copy(g.mesh.position).add(new THREE.Vector3(0,0,attackDir(g)*.6));ball.position.y=1.0;ballVel.set(0,0,0);state.lastTouch=g.home?'HOME':'AWAY';g.touches++;
  }
}

function refereeAdvantageCheck(){
  // Lightweight advantage rule: if a fouled side keeps clear possession, play continues.
  if(state.phase!=='PLAY'||!ballOwner)return;
  if(state.lastTouch==='HOME'&&ballOwner.home&&state.messageTimer<0)state.messageTimer=0;
  if(state.lastTouch==='AWAY'&&!ballOwner.home&&state.messageTimer<0)state.messageTimer=0;
}
function playerContacts(){
  const all=[...homeTeam,...awayTeam].filter(p=>!p.red);
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
    const a=all[i],b=all[j],dx=a.mesh.position.x-b.mesh.position.x,dz=a.mesh.position.z-b.mesh.position.z,d=Math.hypot(dx,dz);
    if(d>0&&d<.82){const push=(.82-d)/2;a.mesh.position.x+=dx/d*push;a.mesh.position.z+=dz/d*push;b.mesh.position.x-=dx/d*push;b.mesh.position.z-=dz/d*push;clampPlayer(a);clampPlayer(b)}
  }
}

function ballPhysics(dt){
  if(ballOwner){
    if(ballOwner.red){releaseBall()}else if(ballOwner.role==='GK'){ball.position.y=1.0}else{dribble(ballOwner,dt)}
  }else{
    ball.position.addScaledVector(ballVel,dt);
    ballVel.multiplyScalar(Math.pow(ball.position.y>.55?.78:.36,dt));
    if(ballVel.length()>0.1){
      const curve=new THREE.Vector3(-ballVel.z,0,ballVel.x).normalize().multiplyScalar(ballSpin.y*.7*dt);
      ballVel.add(curve);
      ballSpin.multiplyScalar(.985);
    }
    if(ball.position.y>.43){ball.position.y+=ballVel.y*dt;ballVel.y-=16*dt;if(ball.position.y<.43){ball.position.y=.43;ballVel.y*=-.28}}
    else ball.position.y=.43;
  }
  if(touchGrace>0)touchGrace-=dt;
  ball.rotation.x+=ballVel.z*dt;ball.rotation.z-=ballVel.x*dt;

  if(!ballOwner&&ball.position.y<1.0){
    for(const p of [...homeTeam,...awayTeam]){
      if(p.red)continue;
      const reach=p.role==='GK'?1.45:1.18;
      if(d2(p.mesh.position,ball.position)<reach&&ballVel.length()<8){
        if(p.role==='GK'&&Math.abs(p.mesh.position.z)<HALF-7)continue;
        ballOwner=p;state.lastTouch=p.home?'HOME':'AWAY';p.touches++;firstTouch(p);break;
      }
    }
  }
  if(ball.position.z<-HALF&&Math.abs(ball.position.x)<GOAL_W/2&&ball.position.y<3){goal('HOME');return}
  if(ball.position.z>HALF&&Math.abs(ball.position.x)<GOAL_W/2&&ball.position.y<3){goal('AWAY');return}
  if(Math.abs(ball.position.x)>FIELD_W/2+.1||Math.abs(ball.position.z)>HALF+.1)handleOut();
}

function goal(team){
  state.score[team==='HOME'?0:1]++; document.getElementById('playerScore').textContent=state.score[0];document.getElementById('computerScore').textContent=state.score[1];
  comment('GOAL! '+team+' score.',true); state.messageTimer=1.4;
  state.restartType='KICKOFF';state.restartTeam=team==='HOME'?'AWAY':'HOME';state.restartSpot.set(0,.43,0);state.phase='RESTART';
  resetPositions();
}

function resetPositions(){
  ballOwner=null;ball.position.set(0,.43,0);ballVel.set(0,0,0);ballSpin.set(0,0,0);
  homeTeam.forEach(p=>{if(!p.red){p.mesh.visible=true;p.mesh.position.copy(p.base);p.vel.set(0,0,0)}});
  awayTeam.forEach(p=>{if(!p.red){p.mesh.visible=true;p.mesh.position.copy(p.base);p.vel.set(0,0,0)}});
  setActive(activeIndex);
}

function handleOut(){
  const x=ball.position.x,z=ball.position.z;
  if(Math.abs(x)>FIELD_W/2){
    const team=state.lastTouch==='HOME'?'AWAY':'HOME';
    state.restartType='THROW-IN';state.restartTeam=team;state.restartSpot.set(THREE.MathUtils.clamp(x,-FIELD_W/2+.1,FIELD_W/2-.1),.43,THREE.MathUtils.clamp(z,-HALF+.1,HALF-.1));
    state.phase='RESTART';state.restartTimer=.55;comment('Throw-in.',true);return;
  }
  if(Math.abs(z)>HALF){
    const crossedGoalLine=(Math.abs(x)<=GOAL_W/2);
    if(crossedGoalLine)return;
    const attackingHome=state.lastTouch==='HOME';
    const ballAtHomeEnd=z<0;
    const attacking=attackingHome===ballAtHomeEnd;
    if(attacking){state.restartType='GOAL KICK';state.restartTeam=attackingHome?'HOME':'AWAY';state.restartSpot.set(0,.43,ballAtHomeEnd?-HALF+5:HALF-5);comment('Goal kick.',true)}
    else{state.restartType='CORNER';state.restartTeam=attackingHome?'HOME':'AWAY';state.stats[attackingHome?'HOME':'AWAY'].corners++;state.restartSpot.set(x<0?-FIELD_W/2+.35:FIELD_W/2-.35, .43, ballAtHomeEnd?-HALF+.35:HALF-.35);comment('Corner kick.',true)}
    state.phase='RESTART';state.restartTimer=.55;
  }
}

function restart(){
  if(state.restartTimer>0)return;
  const team=state.restartTeam==='HOME'?homeTeam:awayTeam;
  const rolePriority=state.restartType==='GOAL KICK'?['GK']:state.restartType==='CORNER'?['LM','RM','LW','RW']:state.restartType==='PENALTY'?['ST','LW','RW']:['CM','LM','RM','LB','RB','CB','ST'];
  const taker=state.restartType==='PENALTY'?state.penaltyShooter:(team.filter(p=>!p.red&&rolePriority.includes(p.role)).sort((a,b)=>b.attributes.passing-a.attributes.passing)[0]||nearest(team));
  if(!taker)return;
  ballOwner=null;ball.position.copy(state.restartSpot);ball.position.y=.43;ballVel.set(0,0,0);ballSpin.set(0,0,0);
  if(state.restartType==='KICKOFF'){taker.mesh.position.set(0,0,state.restartTeam==='HOME'?1.0:-1.0);kick(taker,new THREE.Vector3(0,0,attackDir(taker)*20),6.8,0);state.phase='PLAY';state.restartTimer=0;comment('Kick-off. Match on!',true);return}
  if(state.restartType==='THROW-IN'){taker.mesh.position.copy(state.restartSpot);const target=team.filter(p=>p!==taker&&!p.red).sort((a,b)=>d2(a.mesh.position,ball.position)-d2(b.mesh.position,ball.position))[0];if(target){ballOwner=null;ballVel.copy(target.mesh.position.clone().sub(ball.position).setY(0).normalize().multiplyScalar(7));ballVel.y=2.2}state.phase='PLAY';state.restartTimer=0;return}
  if(state.restartType==='GOAL KICK'){taker.mesh.position.copy(state.restartSpot);kick(taker,new THREE.Vector3((Math.random()-.5)*10,0,attackDir(taker)*22),12,1.8);state.phase='PLAY';state.restartTimer=0;return}
  if(state.restartType==='CORNER'){taker.mesh.position.copy(state.restartSpot);const target=team.find(p=>p.role==='ST')||team.find(p=>p.role==='CB');if(target)kick(taker,target.mesh.position.clone().add(new THREE.Vector3(0,0,attackDir(taker)*1)),10.5,3.4);state.phase='PLAY';state.restartTimer=0;return}
  if(state.restartType==='PENALTY'){
    const shooter=state.penaltyShooter||taker; shooter.mesh.position.set(0,0,state.restartTeam==='HOME'?-HALF+11:HALF-11);
    const target=new THREE.Vector3((Math.random()-.5)*4.5,0,goalZ(shooter));ball.position.set(0,.43,shooter.mesh.position.z+attackDir(shooter)*1);
    kick(shooter,target,16,.5);state.phase='PLAY';state.restartTimer=0;state.penaltyShooter=null;return;
  }
  const direct=state.restartType==='FREE KICK';taker.mesh.position.copy(state.restartSpot);
  const target=new THREE.Vector3(0,0,goalZ(taker));kick(taker,target,direct?12:8, direct?1.2:0);state.phase='PLAY';state.restartTimer=0;
}

function switchPlayer(){
  const candidates=homeTeam.map((p,i)=>({p,i})).filter(x=>!x.p.red&&x.p!==me);
  candidates.sort((a,b)=>d2(a.p.mesh.position,ball.position)-d2(b.p.mesh.position,ball.position));
  if(candidates[0])setActive(candidates[0].i);
  comment('Player switched.',true);
}

function refereeAndLinesman(){
  // visual officials: referee follows the play; assistants stay on touchlines
}
const referee=(()=>{const v=playerVisual(refMat,black,0,false);v.group.scale.set(.75,.85,.75);v.group.position.set(0,0,0);return v.group})();
function updateReferee(dt){
  const target=new THREE.Vector3(ball.position.x*.45,0,ball.position.z*.45);
  referee.position.lerp(target,Math.min(1,dt*2.5));
  referee.rotation.y=Math.atan2(ball.position.x-referee.position.x,ball.position.z-referee.position.z);
}

function updateClock(dt){
  // Six match seconds pass per real second, keeping a full 90-minute match playable in about 15 minutes.
  state.seconds+=dt*6;
  if(state.seconds>=60){state.seconds-=60;state.minute++}
  if(state.minute===45&&state.half===1&&state.phase!=='HALFTIME'){
    state.halfStoppage=Math.min(6,Math.ceil(state.messageTimer+.5));
    state.phase='HALFTIME';
    state.halftimeTimer=5;
    comment('HALF-TIME — tactical break.',true);
  }
  if(state.phase==='HALFTIME'){
    state.halftimeTimer-=dt;
    if(state.halftimeTimer<=0){
      resetPositions();
      state.half=2;state.minute=45;state.seconds=0;
      homeTeam.forEach(p=>p.base.z*=-1);awayTeam.forEach(p=>p.base.z*=-1);
      state.phase='RESTART';state.restartType='KICKOFF';state.restartTeam='AWAY';state.restartSpot.set(0,.43,0);
      comment('SECOND HALF — KICK-OFF.',true);
    }
  }
  if(state.half===2&&state.minute===90&&!state.addedShown){
    state.addedShown=true;state.stoppage=2;comment('90 minutes. +2 added minutes.',true);
  }
  if(state.half===2&&state.minute>=90+state.stoppage){state.over=true;finish()}
  const shown=Math.min(90,state.minute);
  document.getElementById('timer').textContent=String(shown).padStart(2,'0')+':'+String(Math.floor(state.seconds)).padStart(2,'0');
  document.getElementById('halfLabel').textContent=state.half===1?'1ST HALF':'2ND HALF';
}

function finish(){
  document.getElementById('finalHome').textContent=state.score[0];document.getElementById('finalAway').textContent=state.score[1];
  document.getElementById('resultTitle').textContent='FULL TIME';
  document.getElementById('resultText').textContent=state.score[0]+' - '+state.score[1]+' · 90+ minutes';
  document.getElementById('resultOverlay').classList.remove('hidden');
}

function action(code){
  if(code==='Space')shoot(me);
  if(code==='KeyE')pass(me,held.has('ShiftLeft')||held.has('ShiftRight'));
  if(code==='KeyC')cross(me);
  if(code==='KeyF')tackle(me,held.has('ShiftLeft')||held.has('ShiftRight'));
  if(code==='KeyQ')switchPlayer();
  if(code==='KeyP')togglePause();
  if(code==='KeyR')shielding=!shielding;
  if(code==='Digit1')setTactic(0);
  if(code==='Digit2')setTactic(1);
  if(code==='Digit3')setTactic(2);
  if(code==='Digit4')applyFormation(0);
  if(code==='Digit5')applyFormation(1);
  if(code==='Digit6')applyFormation(2);
}
function togglePause(){if(state.over)return;state.paused=!state.paused;document.getElementById('pauseOverlay').classList.toggle('hidden',!state.paused)}

addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!held.has(e.code))action(e.code);held.add(e.code)});
addEventListener('keyup',e=>held.delete(e.code));
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();held.add(k)});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>held.delete(k)))}); 
document.getElementById('shootMobile').onpointerdown=()=>shoot(me);
document.getElementById('passMobile').onpointerdown=()=>pass(me,false);
document.getElementById('tackleMobile').onpointerdown=()=>tackle(me,false);
document.getElementById('crossMobile').onpointerdown=()=>cross(me);
document.getElementById('shieldMobile').onpointerdown=()=>shielding=true;
document.getElementById('shieldMobile').onpointerup=()=>shielding=false;
document.getElementById('shieldMobile').onpointercancel=()=>shielding=false;
document.getElementById('sprintMobile').onpointerdown=()=>mobileSprint=true;
document.getElementById('sprintMobile').onpointerup=()=>mobileSprint=false;
document.getElementById('pauseBtn').onclick=togglePause;
document.getElementById('resumeBtn').onclick=togglePause;
document.getElementById('restartBtn').onclick=()=>location.reload();
canvas.addEventListener('pointerdown',e=>{if(e.target===canvas)shoot(me)});

function drawRadar(){
  const r=document.getElementById('radar');if(!r)return;
  const c=r.getContext('2d'),w=r.width,h=r.height;c.clearRect(0,0,w,h);
  c.fillStyle='rgba(5,25,14,.82)';c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.4)';c.strokeRect(8,8,w-16,h-16);
  c.beginPath();c.moveTo(w/2,8);c.lineTo(w/2,h-8);c.stroke();
  const px=x=>8+(THREE.MathUtils.clamp(x,-FIELD_W/2,FIELD_W/2)+FIELD_W/2)/FIELD_W*(w-16);
  const pz=z=>8+(THREE.MathUtils.clamp(z,-HALF,HALF)+HALF)/FIELD_L*(h-16);
  const dot=(x,z,col,r)=>{c.fillStyle=col;c.beginPath();c.arc(px(x),pz(z),r,0,Math.PI*2);c.fill()};
  homeTeam.filter(p=>!p.red).forEach(p=>dot(p.mesh.position.x,p.mesh.position.z,p===me?'#fff':'#36a9ff',p===me?4:2.7));
  awayTeam.filter(p=>!p.red).forEach(p=>dot(p.mesh.position.x,p.mesh.position.z,'#ff4b55',2.7)); dot(ball.position.x,ball.position.z,'#ffd84d',3.2);
}

function animatePlayers(){
  const t=performance.now()*.012;
  for(const p of [...homeTeam,...awayTeam]){
    if(!p.mesh.visible)continue;
    const stride=Math.sin(t+p.id*.6)*Math.min(.16,p.vel.length()*.025);
    const ch=p.mesh.children;
    if(ch[1])ch[1].rotation.x=stride;if(ch[2])ch[2].rotation.x=-stride;
  }
}

function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();setActive(activeIndex);

function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),.05);
  if(!state.paused&&!state.over){
    if(state.phase==='HALFTIME'){
      updateClock(dt);
      drawRadar();animatePlayers();updateAnalytics();
    }else if(state.phase==='PLAY'){
      updateClock(dt);
      moveUser(dt);
      teamAI(homeTeam,dt);teamAI(awayTeam,dt);
      playerContacts();
      refereeAdvantageCheck();
      ballPhysics(dt);
      updateReferee(dt);
      if(ballOwner){const t=ballOwner.home?'HOME':'AWAY';state.possession[t]+=dt}
      if(state.messageTimer>0)state.messageTimer-=dt;
    }else if(state.phase==='RESTART'){
      state.messageTimer=Math.max(0,state.messageTimer-dt);
      state.restartTimer=Math.max(0,state.restartTimer-dt);
      if(state.restartType==='PENALTY')restart(); else restart();
    }
    drawRadar();animatePlayers();updateAnalytics();
  }
  const focus=ball.position.clone().lerp(me.mesh.position, .25);
  const portrait=innerWidth<700, landscape=innerWidth/innerHeight>1.15;
  const camY=portrait?34:landscape?29:32, camZ=portrait?28:landscape?25:28;
  camera.position.lerp(new THREE.Vector3(focus.x*.08,camY,camZ+focus.z*.08),Math.min(1,dt*2.2));
  camera.lookAt(focus.x*.08,0,focus.z*.08);
  renderer.render(scene,camera);
}

// Live match analytics panel (created without changing the HTML layout)
const analytics=document.createElement('div');
analytics.id='analyticsPanel';
analytics.style.cssText='position:fixed;right:14px;bottom:14px;z-index:20;padding:10px 12px;border:1px solid rgba(255,255,255,.22);border-radius:10px;background:rgba(0,0,0,.58);color:#fff;font:600 12px Arial;line-height:1.5;backdrop-filter:blur(5px);pointer-events:none';
document.body.appendChild(analytics);
function updateAnalytics(){
  const h=homeTeam.reduce((a,p)=>a+p.touches,0), aw=awayTeam.reduce((a,p)=>a+p.touches,0);
  const hs=homeTeam.reduce((a,p)=>a+p.shots,0), as=awayTeam.reduce((a,p)=>a+p.shots,0);
  const hp=state.possession.HOME+state.possession.AWAY>0?Math.round(state.possession.HOME/(state.possession.HOME+state.possession.AWAY)*100):50;
  analytics.innerHTML='MATCH DATA<br>POSSESSION '+hp+'% — '+(100-hp)+'%<br>SHOTS '+hs+' — '+as+'<br>TOUCHES '+h+' — '+aw+'<br>TACTIC '+tacticalModes[tacticalMode].name;
}

const playerCard=document.createElement('div');
playerCard.id='playerCard';
playerCard.style.cssText='position:fixed;left:14px;bottom:14px;z-index:20;padding:10px 12px;min-width:220px;border:1px solid rgba(255,255,255,.22);border-radius:10px;background:rgba(0,0,0,.58);color:#fff;font:600 12px Arial;line-height:1.5;backdrop-filter:blur(5px);pointer-events:none';
document.body.appendChild(playerCard);
document.getElementById('statusText').textContent='KICK-OFF';
applyFormation(0,false);
setTimeout(()=>comment('Tactics: 1 Balanced · 2 Attacking · 3 Defensive · 4/5/6 Formation',true),900);
setTimeout(()=>document.body.classList.add('ready'),500);
loop();
