import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.getElementById('gameCanvas');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(52,1,.1,150);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.background=new THREE.Color(0x8cc9ea);
scene.fog=new THREE.Fog(0x8cc9ea,48,110);

scene.add(new THREE.HemisphereLight(0xf4fbff,0x36583a,2.1));
const sun=new THREE.DirectionalLight(0xffffff,3.1);
sun.position.set(-20,32,16);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.75});
const green=material(0x2d8a43),green2=material(0x338f48),white=material(0xf4f2e9),line=material(0xffffff),dark=material(0x18221c);
const home=material(0x1d61c9),homeDark=material(0x0c357b),away=material(0xd52f35),awayDark=material(0x841d22),skin=material(0xc98e68),black=material(0x151719),net=material(0xdfe6e1);

const W=30,L=46,G=8;
function box(w,h,d,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
function groundLine(w,d,x,z){return box(w,.045,d,line,x,.045,z)}
box(W,.3,L,green,0,-.18);box(W+1,.25,L+1,dark,0,-.36);
for(let z=-L/2+2.5;z<L/2;z+=5)box(W,.015,2.5,(Math.round((z+L/2)/5)%2?green2:green),0,.01,z);
groundLine(W,.12,0,-L/2);groundLine(W,.12,0,L/2);groundLine(.12,L,-W/2,0);groundLine(.12,L,W/2,0);groundLine(W,.09,0,0);

const circle=new THREE.Mesh(new THREE.RingGeometry(4.8,4.87,80),line);circle.rotation.x=-Math.PI/2;circle.position.y=.06;scene.add(circle);
const centerDot=new THREE.Mesh(new THREE.CircleGeometry(.14,24),line);centerDot.rotation.x=-Math.PI/2;centerDot.position.y=.065;scene.add(centerDot);

for(const side of[-1,1]){
 const end=side*L/2;
 groundLine(13,.11,0,end-side*7);
 groundLine(.11,7,-6.5,end-side*3.5);groundLine(.11,7,6.5,end-side*3.5);
 groundLine(7,.11,0,end-side*3);
 groundLine(.11,3.5,-3.5,end-side*1.5);groundLine(.11,3.5,3.5,end-side*1.5);
 const spot=new THREE.Mesh(new THREE.CircleGeometry(.14,20),line);spot.rotation.x=-Math.PI/2;spot.position.set(0,.065,end-side*11);scene.add(spot);
}
function goal(z){const back=z<0?z-.5:z+.5;box(G,.16,.16,net,0,2.8,back);for(const x of[-G/2,G/2]){box(.18,3,.18,line,x,1.5,z);box(.04,2.8,.04,line,x,1.5,back)}box(G,.18,.18,line,0,3,z);for(let x=-G/2;x<=G/2;x+=1)box(.025,2.7,.025,net,x,1.5,back);for(let y=.3;y<=2.7;y+=.6)box(G,.025,.025,net,0,y,back)}
goal(-L/2);goal(L/2);

for(const x of[-18,18])for(const z of[-25,-12,12,25]){box(.45,5,.45,dark,x,2.5,z);box(1.5,.15,1.5,dark,x,5,z)}
for(const side of[-1,1]){const stand=box(2.5,1,50,material(0x46514a),side*17,0,0);stand.receiveShadow=true}

function createPlayer(shirt,shorts){
 const g=new THREE.Group();
 const torso=new THREE.Mesh(new THREE.CylinderGeometry(.55,.68,1.15,18),shirt);torso.position.y=1.7;torso.castShadow=true;g.add(torso);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.2,14),skin);neck.position.y=2.36;g.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.39,18,14),skin);head.position.y=2.72;head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.4,18,10,0,Math.PI*2,0,Math.PI*.5),black);hair.position.y=2.84;g.add(hair);
 for(const x of[-.27,.27]){const thigh=new THREE.Mesh(new THREE.CylinderGeometry(.17,.2,.72,14),shorts);thigh.position.set(x,1.02,0);thigh.castShadow=true;g.add(thigh);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.7,14),skin);leg.position.set(x,.43,0);leg.castShadow=true;g.add(leg);const boot=new THREE.Mesh(new THREE.BoxGeometry(.3,.16,.58),black);boot.position.set(x,.08,.16);boot.castShadow=true;g.add(boot)}
 for(const x of[-.75,.75]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.85,12),shirt);arm.position.set(x,1.7,0);arm.rotation.z=x<0?.22:-.22;arm.castShadow=true;g.add(arm)}
 scene.add(g);return g;
}
const homeSpots=[[-7,15],[0,15],[7,15],[-10,7],[-3,7],[3,7],[10,7],[-9,-2],[-3,-2],[3,-2],[9,-2],[-6,-9],[0,-9],[6,-9]];
const awaySpots=homeSpots.map(([x,z])=>[x,-z]);
const homeTeam=homeSpots.map((p,i)=>({mesh:createPlayer(home,homeDark),vel:new THREE.Vector3(),speed:5,kickCooldown:0,base:new THREE.Vector3(p[0],0,p[1])}));
const awayTeam=awaySpots.map((p,i)=>({mesh:createPlayer(away,awayDark),vel:new THREE.Vector3(),speed:4.8,kickCooldown:0,base:new THREE.Vector3(p[0],0,p[1])}));
homeTeam.forEach(p=>p.mesh.position.copy(p.base));awayTeam.forEach(p=>p.mesh.position.copy(p.base));
let activeIndex=9;let me=homeTeam[activeIndex];
function setActive(i){activeIndex=(i+homeTeam.length)%homeTeam.length;me=homeTeam[activeIndex];homeTeam.forEach((p,n)=>p.mesh.scale.setScalar(n===activeIndex?1.14:1));document.getElementById('statusText').textContent='HOME PLAYER '+(activeIndex+1)}
const ball=new THREE.Mesh(new THREE.SphereGeometry(.48,28,20),white);ball.position.set(0,.5,0);ball.castShadow=true;scene.add(ball);
const ballVelocity=new THREE.Vector3();
const state={time:180,score:[0,0],paused:false,over:false,kickoffTimer:1.2,goalFlash:0,lastComment:0};
function comment(text,force=false){const now=performance.now();if(!force&&now-state.lastComment<800)return;document.getElementById('commentaryText').textContent=text;state.lastComment=now}
function clampPlayer(p){p.mesh.position.x=THREE.MathUtils.clamp(p.mesh.position.x,-W/2+1,W/2-1);p.mesh.position.z=THREE.MathUtils.clamp(p.mesh.position.z,-L/2+1,L/2-1)}
function kick(player,dir,power=11){if(player.kickCooldown>0)return;if(player.mesh.position.distanceTo(ball.position)>2.2)return;player.kickCooldown=.3;dir.y=0;if(dir.lengthSq()===0)dir.set(0,0,player===me?-1:1);dir.normalize();ballVelocity.addScaledVector(dir,power);comment(player===me?'Shot!':'Away team plays forward.',true)}
function playerMovement(dt){const x=(held.has('KeyD')||held.has('ArrowRight'))-(held.has('KeyA')||held.has('ArrowLeft'));const z=(held.has('KeyS')||held.has('ArrowDown'))-(held.has('KeyW')||held.has('ArrowUp'));const v=new THREE.Vector3(x,0,z);if(v.lengthSq())v.normalize();const sprint=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;v.multiplyScalar(me.speed*(sprint?1.55:1));me.vel.lerp(v,Math.min(1,dt*11));me.mesh.position.addScaledVector(me.vel,dt);clampPlayer(me);if(me.vel.lengthSq()>1)me.mesh.rotation.y=Math.atan2(me.vel.x,me.vel.z)}
function teamAI(team,dt,isHome){team.forEach((p,i)=>{if(isHome&&i===activeIndex)return;const d=p.mesh.position.distanceTo(ball.position);let target=p.base.clone();const nearest=team.reduce((a,b)=>a.mesh.position.distanceTo(ball.position)<b.mesh.position.distanceTo(ball.position)?a:b);if(p===nearest&&d<15)target.copy(ball.position);else if(d<7)target.lerp(ball.position,.22);const v=target.sub(p.mesh.position);v.y=0;if(v.lengthSq())v.normalize();v.multiplyScalar(p.speed*(p===nearest?1.2:.75));p.vel.lerp(v,Math.min(1,dt*5));p.mesh.position.addScaledVector(p.vel,dt);clampPlayer(p);if(p.vel.lengthSq()>1)p.mesh.rotation.y=Math.atan2(p.vel.x,p.vel.z);if(p===nearest&&d<2.15&&p.kickCooldown<=0){const goalZ=isHome?-L/2:L/2;kick(p,new THREE.Vector3((Math.random()-.5)*4,0,goalZ).sub(ball.position),11)}})}
function switchPlayer(){let best=0,dist=Infinity;homeTeam.forEach((p,i)=>{const d=p.mesh.position.distanceTo(ball.position);if(d<dist){dist=d;best=i}});setActive(best);comment('Switched to Home Player '+(best+1),true)}
function resetAfterGoal(){
 ball.position.set((Math.random()-.5)*2,.5,0);ballVelocity.set(0,0,0);
 homeTeam.forEach(p=>p.mesh.position.copy(p.base));awayTeam.forEach(p=>p.mesh.position.copy(p.base));setActive(9);state.kickoffTimer=1.2;
}
function ballPhysics(dt){
 ball.position.addScaledVector(ballVelocity,dt);
 ballVelocity.multiplyScalar(Math.pow(.17,dt));
 ball.rotation.x+=ballVelocity.z*dt;ball.rotation.z-=ballVelocity.x*dt;
 if(Math.abs(ball.position.x)>W/2-.55){ball.position.x=Math.sign(ball.position.x)*(W/2-.55);ballVelocity.x*=-.72}
 if(ball.position.z<-L/2+.25){
   if(Math.abs(ball.position.x)<G/2){state.score[0]++;goalScored('HOME');return}
   ball.position.z=-L/2+.25;ballVelocity.z=Math.abs(ballVelocity.z)*.55;
 }
 if(ball.position.z>L/2-.25){
   if(Math.abs(ball.position.x)<G/2){state.score[1]++;goalScored('AWAY');return}
   ball.position.z=L/2-.25;ballVelocity.z=-Math.abs(ballVelocity.z)*.55;
 }
 for(const p of[me,cpu]){
   const offset=p.mesh.position.clone().sub(ball.position);offset.y=0;const d=offset.length();
   if(d<1.25&&d>.01){ballVelocity.addScaledVector(offset.normalize(),(1.25-d)*4.5)}
 }
}
function goalScored(team){
 document.getElementById('playerScore').textContent=state.score[0];document.getElementById('computerScore').textContent=state.score[1];
 state.goalFlash=.8;comment(team==='HOME'?'GOAL! Home takes the lead.':'GOAL! Away finds the net.',true);
 document.getElementById('statusText').textContent='GOAL';
 resetAfterGoal();
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

const held=new Set();let touchSprint=false;
addEventListener('keydown',e=>{if(e.code==='KeyP'){togglePause();return}if(e.code==='KeyQ'){switchPlayer();return}if(e.code==='Space'){e.preventDefault();kick(me,new THREE.Vector3((ball.position.x-me.mesh.position.x)*.5,0,-1),held.has('ShiftLeft')||held.has('ShiftRight')?14:11)}held.add(e.code)});
addEventListener('keyup',e=>held.delete(e.code));
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();held.add(k)});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>held.delete(k)))});
document.getElementById('shootMobile').onpointerdown=()=>kick(me,new THREE.Vector3((ball.position.x-me.mesh.position.x)*.5,0,-1),touchSprint?14:11);
document.getElementById('sprintMobile').onpointerdown=()=>touchSprint=true;document.getElementById('sprintMobile').onpointerup=()=>touchSprint=false;
canvas.addEventListener('pointerdown',()=>kick(me,new THREE.Vector3((ball.position.x-me.mesh.position.x)*.5,0,-1),11));
function togglePause(){if(state.over)return;state.paused=!state.paused;document.getElementById('pauseOverlay').classList.toggle('hidden',!state.paused)}
document.getElementById('pauseBtn').onclick=togglePause;document.getElementById('resumeBtn').onclick=togglePause;document.getElementById('restartBtn').onclick=()=>location.reload();

function finish(){
 state.over=true;const a=state.score[0],b=state.score[1];
 document.getElementById('finalHome').textContent=a;document.getElementById('finalAway').textContent=b;
 document.getElementById('resultTitle').textContent='FULL TIME';
 document.getElementById('resultText').textContent=a===b?'The match ends level.':a>b?'Home wins the match.':'Away wins the match.';
 document.getElementById('resultOverlay').classList.remove('hidden');
}
const clock=new THREE.Clock();
function loop(){
 requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);
 if(!state.paused&&!state.over){
   if(state.kickoffTimer>0)state.kickoffTimer-=dt;
   else{state.time=Math.max(0,state.time-dt);playerMovement(dt);teamAI(homeTeam,dt,true);teamAI(awayTeam,dt,false);ballPhysics(dt)}
   homeTeam.forEach(p=>p.kickCooldown=Math.max(0,p.kickCooldown));awayTeam.forEach(p=>p.kickCooldown=Math.max(0,p.kickCooldown));
   if(state.time===0)finish();
   document.getElementById('timer').textContent=Math.floor(state.time/60).toString().padStart(2,'0')+':'+Math.floor(state.time%60).toString().padStart(2,'0');
   if(state.kickoffTimer>0)document.getElementById('statusText').textContent='KICK-OFF';
   else if(state.goalFlash<=0)document.getElementById('statusText').textContent='MATCH LIVE';
   state.goalFlash=Math.max(0,state.goalFlash-dt);
 }
 const focus=new THREE.Vector3(ball.position.x,0,ball.position.z);
 const portrait=innerWidth<700;const landscape=innerWidth/innerHeight>1.15;
 const camY=portrait?32:landscape?27:30;const camZ=portrait?25:landscape?23:25;
 const fx=THREE.MathUtils.clamp(focus.x*.1,-3,3);const fz=THREE.MathUtils.clamp(focus.z*.08,-3,3);
 camera.position.lerp(new THREE.Vector3(fx,camY,camZ+fz),Math.min(1,dt*2.4));camera.lookAt(fx,0,fz);
 renderer.render(scene,camera);
}
loop();
setTimeout(()=>document.body.classList.add('ready'),700);
