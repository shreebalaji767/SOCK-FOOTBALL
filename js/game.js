import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.getElementById('gameCanvas');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x86c8e7);
scene.fog=new THREE.Fog(0x86c8e7,55,115);
const camera=new THREE.PerspectiveCamera(52,1,.1,150);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xf5fbff,0x31593b,2.1));
const sun=new THREE.DirectionalLight(0xffffff,3);
sun.position.set(-20,35,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.76});
const green=mat(0x2e8b46),green2=mat(0x358f4c),white=mat(0xf5f3e9),line=mat(0xffffff),dark=mat(0x17211b);
const net=mat(0xdce5df),home=mat(0x1768d2),homeDark=mat(0x0b367c),away=mat(0xd9363e),awayDark=mat(0x821d25),skin=mat(0xc98d68),black=mat(0x151719);

const W=32,L=50,GOAL=7.6,PENALTY=16.5;
function box(w,h,d,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
function fieldLine(w,d,x,z){return box(w,.045,d,line,x,.045,z)}
box(W,.3,L,green,0,-.18);box(W+1,.25,L+1,dark,0,-.36);
for(let z=-L/2+2.5;z<L/2;z+=5)box(W,.015,2.5,((Math.round((z+L/2)/5)%2)?green2:green),0,.01,z);
fieldLine(W,.12,0,-L/2);fieldLine(W,.12,0,L/2);fieldLine(.12,L,-W/2,0);fieldLine(.12,L,W/2,0);fieldLine(W,.09,0,0);
const circle=new THREE.Mesh(new THREE.RingGeometry(4.8,4.88,90),line);circle.rotation.x=-Math.PI/2;circle.position.y=.06;scene.add(circle);
const centerDot=new THREE.Mesh(new THREE.CircleGeometry(.14,24),line);centerDot.rotation.x=-Math.PI/2;centerDot.position.y=.065;scene.add(centerDot);
for(const side of[-1,1]){
 const end=side*L/2;
 fieldLine(13,.11,0,end-side*7);fieldLine(.11,7,-6.5,end-side*3.5);fieldLine(.11,7,6.5,end-side*3.5);
 fieldLine(7,.11,0,end-side*3);fieldLine(.11,3.5,-3.5,end-side*1.5);fieldLine(.11,3.5,3.5,end-side*1.5);
}
function goal(z){
 const back=z<0?z-.65:z+.65;
 box(GOAL,.16,.16,net,0,2.8,back);
 for(const x of[-GOAL/2,GOAL/2]){box(.18,3,.18,line,x,1.5,z);box(.04,2.8,.04,line,x,1.5,back)}
 box(GOAL,.18,.18,line,0,3,z);
 for(let x=-GOAL/2;x<=GOAL/2;x+=.8)box(.025,2.7,.025,net,x,1.5,back);
 for(let y=.3;y<=2.7;y+=.6)box(GOAL,.025,.025,net,0,y,back);
}
goal(-L/2);goal(L/2);

function createPlayer(shirt,shorts,number,keeper){
 const g=new THREE.Group();
 const torso=new THREE.Mesh(new THREE.CylinderGeometry(.55,.68,1.15,18),shirt);torso.position.y=1.7;g.add(torso);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.2,14),skin);neck.position.y=2.36;g.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.39,18,14),skin);head.position.y=2.72;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.4,18,10,0,Math.PI*2,0,Math.PI*.5),black);hair.position.y=2.84;g.add(hair);
 for(const x of[-.27,.27]){
  const thigh=new THREE.Mesh(new THREE.CylinderGeometry(.17,.2,.72,14),shorts);thigh.position.set(x,1.02,0);g.add(thigh);
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.7,14),skin);leg.position.set(x,.43,0);g.add(leg);
  const boot=new THREE.Mesh(new THREE.BoxGeometry(.3,.16,.58),black);boot.position.set(x,.08,.16);g.add(boot);
 }
 for(const x of[-.75,.75]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.85,12),shirt);arm.position.set(x,1.7,0);arm.rotation.z=x<0?.22:-.22;g.add(arm)}
 if(keeper){const gm=mat(0xf1f1e7);for(const x of[-.95,.95]){const glove=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),gm);glove.position.set(x,1.72,0);g.add(glove)}}
 const lc=document.createElement('canvas');lc.width=128;lc.height=48;const cx=lc.getContext('2d');cx.fillStyle='#fff';cx.font='bold 26px Arial';cx.textAlign='center';cx.fillText(String(number),64,31);
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(lc),transparent:true,depthTest:false}));sprite.scale.set(.8,.3,1);sprite.position.y=3.35;sprite.visible=false;g.add(sprite);
 scene.add(g);return {group:g,label:sprite};
}

const formation=[
 {x:0,z:22,role:'GK'},{x:-7,z:17,role:'LB'},{x:-2.4,z:18,role:'CB'},{x:2.4,z:18,role:'CB'},{x:7,z:17,role:'RB'},
 {x:-6,z:8,role:'LM'},{x:0,z:9,role:'CM'},{x:6,z:8,role:'RM'},
 {x:-6,z:-2,role:'LW'},{x:0,z:-1,role:'ST'},{x:6,z:-2,role:'RW'}
];
function makeTeam(isHome){
 const shirt=isHome?home:away,shorts=isHome?homeDark:awayDark;
 return formation.map((f,i)=>{
  const z=isHome?f.z:-f.z;
  const visual=createPlayer(shirt,shorts,i+1,f.role==='GK');
  return {number:i+1,role:f.role,home:isHome,base:new THREE.Vector3(f.x,0,z),mesh:visual.group,label:visual.label,vel:new THREE.Vector3(),speed:f.role==='GK'?4.5:5.4,stamina:100,cooldown:0,tackleCooldown:0,yellow:0,red:false};
 });
}
const homeTeam=makeTeam(true),awayTeam=makeTeam(false);
let activeIndex=9,me=homeTeam[activeIndex];

function setActive(i){
 activeIndex=(i+homeTeam.length)%homeTeam.length;me=homeTeam[activeIndex];
 homeTeam.forEach((p,n)=>{p.mesh.scale.setScalar(n===activeIndex?1.12:1);p.label.visible=n===activeIndex});
 document.getElementById('statusText').textContent='HOME '+me.role+' #'+me.number;
}

const ball=new THREE.Mesh(new THREE.SphereGeometry(.43,28,20),white);ball.position.set(0,.43,0);ball.castShadow=true;scene.add(ball);
const ballVel=new THREE.Vector3();
const held=new Set();
let touchSprint=false;
const clock=new THREE.Clock();

const state={
 minute:0,seconds:0,half:1,score:[0,0],paused:false,over:false,kickoff:true,restartType:'KICKOFF',restartTeam:'HOME',
 restartSpot:new THREE.Vector3(0,.43,0),lastTouch:'HOME',lastComment:0,penalty:false,penaltyShooter:null,messageTimer:0
};

function scoreUI(){document.getElementById('playerScore').textContent=state.score[0];document.getElementById('computerScore').textContent=state.score[1]}
function comment(t,force=false){const n=performance.now();if(!force&&n-state.lastComment<650)return;document.getElementById('commentaryText').textContent=t;state.lastComment=n}
function d2(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
function clampField(p){p.mesh.position.x=THREE.MathUtils.clamp(p.mesh.position.x,-W/2+.65,W/2-.65);p.mesh.position.z=THREE.MathUtils.clamp(p.mesh.position.z,-L/2+.65,L/2-.65)}
function goalZ(p){return p.home?-L/2:L/2}
function nearest(team){return team.reduce((a,b)=>d2(a.mesh.position,ball.position)<d2(b.mesh.position,ball.position)?a:b,team[0])}
function opponent(p){return (p.home?awayTeam:homeTeam).reduce((a,b)=>d2(a.mesh.position,p.mesh.position)<d2(b.mesh.position,p.mesh.position)?a:b,(p.home?awayTeam:homeTeam)[0])}
function hasBall(p){return d2(p.mesh.position,ball.position)<1.35&&ball.position.y<1.4}

function kickBall(p,dir,power,kind){
 if(p.red||p.cooldown>0||d2(p.mesh.position,ball.position)>1.8)return false;
 dir.y=0;if(dir.lengthSq()<.01)dir.set(0,0,p.home?-1:1);dir.normalize();
 ballVel.copy(dir).multiplyScalar(power);ballVel.y=kind==='shoot'?Math.min(2.2,power*.16):Math.min(1.1,power*.08);
 p.cooldown=.25;state.lastTouch=p.home?'HOME':'AWAY';
 if(kind==='shoot')comment(p.home?'Home shoots!':'Away shoots!',true);return true;
}
function shoot(p){
 if(!hasBall(p))return;
 const aim=new THREE.Vector3((Math.random()-.5)*2.2,0,goalZ(p)).sub(ball.position);kickBall(p,aim,15,'shoot');
}
function pass(p){
 if(!hasBall(p))return;
 const team=p.home?homeTeam:awayTeam;let best=null,bs=-999;
 const facing=new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));
 for(const q of team){if(q===p||q.red)continue;const v=q.mesh.position.clone().sub(p.mesh.position);v.y=0;const d=v.length();if(d<2||d>18)continue;const s=v.normalize().dot(facing)*8-d*.12;if(s>bs){bs=s;best=q}}
 if(best){kickBall(p,best.mesh.position.clone().sub(ball.position),9,'pass');comment(p.home?'Pass completed.':'Away passes.',true)}
}
function foul(v,a){
 const attackingTeam=a.home?'HOME':'AWAY';
 const inBox=a.home?a.mesh.position.z<-L/2+PENALTY:a.mesh.position.z>L/2-PENALTY;
 if(inBox){state.penalty=true;state.restartType='PENALTY';state.restartTeam=attackingTeam;state.penaltyShooter=a;comment('FOUL! Penalty kick.',true)}
 else {state.restartType='FREE KICK';state.restartTeam=attackingTeam;state.restartSpot.copy(a.mesh.position);state.restartSpot.y=.43;comment('Foul. Free kick.',true)}
 if(Math.random()<.3){v.yellow++;comment('Yellow card.',true);if(v.yellow>=2){v.red=true;v.mesh.visible=false;comment('Second yellow. Sent off.',true)}}
}
function tackle(p){
 if(p.red||p.tackleCooldown>0)return;p.tackleCooldown=.8;const o=opponent(p);if(!o||d2(p.mesh.position,o.mesh.position)>1.9)return;
 if(Math.random()<.16){foul(p,o);return}
 const v=ball.position.clone().sub(p.mesh.position);v.y=0;if(v.lengthSq()>0.01){v.normalize();ballVel.addScaledVector(v,5);state.lastTouch=p.home?'HOME':'AWAY';comment('Clean tackle.',true)}
}

function moveUser(dt){
 if(state.penalty)return;
 const x=(held.has('KeyD')||held.has('ArrowRight'))-(held.has('KeyA')||held.has('ArrowLeft'));
 const z=(held.has('KeyS')||held.has('ArrowDown'))-(held.has('KeyW')||held.has('ArrowUp'));
 const v=new THREE.Vector3(x,0,z);if(v.lengthSq())v.normalize();
 const sprint=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;
 if(v.lengthSq())me.stamina=Math.max(0,me.stamina-(sprint?10:3)*dt);else me.stamina=Math.min(100,me.stamina+7*dt);
 me.vel.lerp(v.multiplyScalar(me.speed*(sprint&&me.stamina>2?1.38:1)),Math.min(1,dt*12));me.mesh.position.addScaledVector(me.vel,dt);clampField(me);
 if(me.vel.lengthSq()>1)me.mesh.rotation.y=Math.atan2(me.vel.x,me.vel.z);
}

function aiTeam(team,dt){
 const nearestPlayer=nearest(team);
 team.forEach(p=>{
  if(p.red||p===me)return;
  let target=p.base.clone();const bd=d2(p.mesh.position,ball.position);
  if(p===nearestPlayer||(bd<7&&p.role!=='GK'))target.copy(ball.position);
  else {target.x+=THREE.MathUtils.clamp(ball.position.x*.16,-4,4);target.z+=team===homeTeam?THREE.MathUtils.clamp(-ball.position.z*.08,-3,3):THREE.MathUtils.clamp(ball.position.z*.08,-3,3)}
  if(p.role==='GK'){target.x=THREE.MathUtils.clamp(ball.position.x,-5.5,5.5);target.z=team===homeTeam?L/2-2.2:-L/2+2.2;if(bd>18)target.copy(p.base)}
  const v=target.sub(p.mesh.position);v.y=0;if(v.lengthSq()>0.2)v.normalize();
  p.vel.lerp(v.multiplyScalar(p.speed*(p===nearestPlayer?1.08:.72)),Math.min(1,dt*5));p.mesh.position.addScaledVector(p.vel,dt);clampField(p);
  if(p.vel.lengthSq()>1)p.mesh.rotation.y=Math.atan2(p.vel.x,p.vel.z);p.stamina=Math.min(100,p.stamina+5*dt);
  if(p===nearestPlayer&&bd<1.45&&!state.penalty){if(Math.abs(p.mesh.position.z-goalZ(p))<18&&Math.random()<.035)shoot(p);else if(Math.random()<.04)pass(p);else if(Math.random()<.06)kickBall(p,new THREE.Vector3((Math.random()-.5)*1.5,0,p.home?-1:1),8,'kick')}
 });
}

function switchPlayer(){
 const list=homeTeam.map((p,i)=>({p,i})).filter(x=>!x.p.red).sort((a,b)=>d2(a.p.mesh.position,ball.position)-d2(b.p.mesh.position,ball.position));
 const x=list.find(v=>v.i!==activeIndex)||list[0];setActive(x.i);comment('Player switched.',true);
}
function resetTeams(){homeTeam.forEach(p=>{if(!p.red){p.mesh.visible=true;p.mesh.position.copy(p.base);p.vel.set(0,0,0)}});awayTeam.forEach(p=>{if(!p.red){p.mesh.visible=true;p.mesh.position.copy(p.base);p.vel.set(0,0,0)}});setActive(9)}
function restartPlay(){
 if(state.restartType==='PENALTY'){
  const s=state.penaltyShooter||nearest(state.restartTeam==='HOME'?homeTeam:awayTeam);
  ball.position.set(0,.43,state.restartTeam==='HOME'?-L/2+10:L/2-10);s.mesh.position.set(0,0,state.restartTeam==='HOME'?-L/2+11:L/2-11);
  state.kickoff=false;state.penalty=false;return;
 }
 ball.position.copy(state.restartSpot);ballVel.set(0,0,0);state.kickoff=false;
}
function kickoff(){
 state.restartType='KICKOFF';state.kickoff=true;state.restartTeam=state.half===1?'HOME':'AWAY';state.restartSpot.set(0,.43,0);
 ball.position.set(0,.43,0);ballVel.set(0,0,0);resetTeams();comment('Kick-off.',true);
}
function outOfPlay(){
 const x=ball.position.x,z=ball.position.z;
 if(Math.abs(x)>W/2){state.restartType='THROW-IN';state.restartTeam=state.lastTouch==='HOME'?'AWAY':'HOME';state.restartSpot.set(THREE.MathUtils.clamp(x,-W/2+.15,W/2-.15),.43,THREE.MathUtils.clamp(z,-L/2+.2,L/2-.2));ball.position.copy(state.restartSpot);ballVel.set(0,0,0);comment('Throw-in.',true);return true}
 if(Math.abs(z)>L/2&&Math.abs(x)>GOAL/2){
  const attackingHome=state.lastTouch==='HOME';
  if((z<0&&attackingHome)||(z>0&&!attackingHome)){state.restartType='GOAL KICK';state.restartTeam=attackingHome?'AWAY':'HOME';state.restartSpot.set(0,.43,z<0?-L/2+3:L/2-3);comment('Goal kick.',true)}
  else {state.restartType='CORNER';state.restartTeam=attackingHome?'AWAY':'HOME';state.restartSpot.set(x<0?-W/2+.8:W/2-.8,z<0?-L/2+.8:L/2-.8);comment('Corner kick.',true)}
  ball.position.copy(state.restartSpot);ballVel.set(0,0,0);return true;
 }
 return false;
}

function scoreGoal(team){
 state.score[team==='HOME'?0:1]++;scoreUI();state.messageTimer=1.3;comment('GOAL! '+(team==='HOME'?'Home':'Away')+' scores.',true);
 document.getElementById('statusText').textContent='GOAL';state.restartTeam=team==='HOME'?'AWAY':'HOME';state.restartType='KICKOFF';state.kickoff=true;resetTeams();ball.position.set(0,.43,0);ballVel.set(0,0,0);
}
function ballPhysics(dt){
 ball.position.addScaledVector(ballVel,dt);ballVel.multiplyScalar(Math.pow(.16,dt));
 if(ball.position.y>.43){ball.position.y+=ballVel.y*dt;ballVel.y-=16*dt;if(ball.position.y<.43){ball.position.y=.43;ballVel.y*=-.28}}else ball.position.y=.43;
 if(Math.abs(ball.position.x)>W/2+.15||Math.abs(ball.position.z)>L/2+.15){if(outOfPlay())return}
 for(const team of[homeTeam,awayTeam])for(const p of team){
  if(p.red)continue;const d=d2(p.mesh.position,ball.position);
  if(d<1.15){const push=ball.position.clone().sub(p.mesh.position);push.y=0;if(push.lengthSq()>.01){push.normalize();ballVel.addScaledVector(push,(1.15-d)*3.2);state.lastTouch=p.home?'HOME':'AWAY'}}
  if(p.role==='GK'&&d<1.5&&Math.abs(p.mesh.position.z)>L/2-7&&ball.position.y<2.5&&p.cooldown<=0&&p!==me){ballVel.multiplyScalar(.25);kickBall(p,new THREE.Vector3(-p.mesh.position.x*.15,0,p.home?1:-1),8,'kick')}
 }
 if(ball.position.z<-L/2&&Math.abs(ball.position.x)<GOAL/2&&ball.position.y<3){scoreGoal('HOME');return}
 if(ball.position.z>L/2&&Math.abs(ball.position.x)<GOAL/2&&ball.position.y<3){scoreGoal('AWAY');return}
}

function updateClock(dt){
 const rate=15;state.seconds+=dt*rate;
 if(state.seconds>=60){state.seconds-=60;state.minute++}
 if(state.minute>=45&&state.half===1){state.half=2;state.minute=45;state.seconds=0;document.getElementById('statusText').textContent='HALF-TIME';comment('HALF-TIME. Teams change ends.',true);state.kickoff=true;state.restartType='KICKOFF';state.restartTeam='AWAY';setTimeout(()=>{if(!state.over){state.kickoff=true;resetTeams();ball.position.set(0,.43,0);ballVel.set(0,0,0)}},1400)}
 if(state.minute>=90&&state.half===2){state.over=true;finish()}
 document.getElementById('timer').textContent=String(Math.min(90,state.minute)).padStart(2,'0')+':'+String(Math.floor(state.seconds)).padStart(2,'0');
 document.getElementById('halfLabel').textContent=state.half===1?'1ST HALF':'2ND HALF';
}
function finish(){
 document.getElementById('finalHome').textContent=state.score[0];document.getElementById('finalAway').textContent=state.score[1];
 document.getElementById('resultTitle').textContent='FULL TIME';document.getElementById('resultText').textContent=state.score[0]+' - '+state.score[1]+' · 90 minutes';
 document.getElementById('resultOverlay').classList.remove('hidden');
}
function togglePause(){if(state.over)return;state.paused=!state.paused;document.getElementById('pauseOverlay').classList.toggle('hidden',!state.paused)}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

function action(code){if(code==='Space')shoot(me);if(code==='KeyE')pass(me);if(code==='KeyF')tackle(me);if(code==='KeyQ')switchPlayer();if(code==='KeyP')togglePause()}
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!held.has(e.code))action(e.code);held.add(e.code)});
addEventListener('keyup',e=>held.delete(e.code));
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();held.add(k);if(['Space','KeyE','KeyF','KeyQ'].includes(k))action(k)});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>held.delete(k)))}); 
document.getElementById('shootMobile').onpointerdown=()=>shoot(me);
document.getElementById('passMobile').onpointerdown=()=>pass(me);
document.getElementById('tackleMobile').onpointerdown=()=>tackle(me);
document.getElementById('sprintMobile').onpointerdown=()=>touchSprint=true;
document.getElementById('sprintMobile').onpointerup=()=>touchSprint=false;
canvas.addEventListener('pointerdown',()=>shoot(me));
document.getElementById('pauseBtn').onclick=togglePause;document.getElementById('resumeBtn').onclick=togglePause;document.getElementById('restartBtn').onclick=()=>location.reload();

function loop(){
 requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);
 if(!state.paused&&!state.over){
  if(state.kickoff){restartPlay()}else{
   updateClock(dt);
   homeTeam.forEach(p=>{p.cooldown=Math.max(0,p.cooldown-dt);p.tackleCooldown=Math.max(0,p.tackleCooldown-dt)});
   awayTeam.forEach(p=>{p.cooldown=Math.max(0,p.cooldown-dt);p.tackleCooldown=Math.max(0,p.tackleCooldown-dt)});
   moveUser(dt);aiTeam(homeTeam,dt);aiTeam(awayTeam,dt);ballPhysics(dt);
  }
  if(state.messageTimer>0)state.messageTimer-=dt;
  if(!state.kickoff&&state.messageTimer<=0)document.getElementById('statusText').textContent='HOME '+me.role+' #'+me.number;
 }
 const focus=ball.position,landscape=innerWidth/innerHeight>1.15,portrait=innerWidth<700;
 const camY=portrait?34:landscape?29:32,camZ=portrait?27:landscape?25:28;
 camera.position.lerp(new THREE.Vector3(focus.x*.1,camY,camZ+focus.z*.08),Math.min(1,dt*2.2));camera.lookAt(focus.x*.1,0,focus.z*.08);
 renderer.render(scene,camera);
}
setActive(activeIndex);scoreUI();state.restartSpot.set(0,.43,0);document.getElementById('statusText').textContent='KICK-OFF';
setTimeout(()=>document.body.classList.add('ready'),600);
loop();
