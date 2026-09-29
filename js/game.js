import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const canvas=document.getElementById('gameCanvas'),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(52,1,.1,140),renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;scene.background=new THREE.Color(0x8dc6e8);scene.fog=new THREE.Fog(0x8dc6e8,42,105);
scene.add(new THREE.HemisphereLight(0xeaf8ff,0x31552f,2.4));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(-18,28,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.78});const green=mat(0x2d8b46),stripe=mat(0x35954f),white=mat(0xf4f0dc),blue=mat(0x4b86df),dark=mat(0x142b1f),black=mat(0x15171a),yellow=mat(0xffd54a),red=mat(0xd94c4c);
function cube(w,h,d,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
const W=28,L=44,G=8;
cube(W,.35,L,green,0,-.2);cube(W+.9,.25,L+.9,dark,0,-.38);
for(let z=-L/2+2.75;z<L/2;z+=5.5)cube(W,.015,2.75,stripe,0,.01,z);
cube(W,.035,.12,white,0,.03,-L/2);cube(W,.035,.12,white,0,.03,L/2);cube(.12,.035,L,white,-W/2,.03);cube(.12,.035,L,white,W/2,.03);cube(W,.035,.09,white,0,.03);

function line(w,d,x,z){cube(w,.045,d,white,x,.055,z)}
// Proper football pitch markings: halfway line, centre circle, penalty areas and goal areas.
line(W,.12,0,0);
const centerCircle=new THREE.Mesh(new THREE.RingGeometry(4,4.07,72),white);centerCircle.rotation.x=-Math.PI/2;centerCircle.position.y=.065;scene.add(centerCircle);
const centerSpot=new THREE.Mesh(new THREE.CircleGeometry(.16,24),white);centerSpot.rotation.x=-Math.PI/2;centerSpot.position.set(0,.067,0);scene.add(centerSpot);

for(const side of[-1,1]){
  const goalLine=side*L/2;
  const boxZ=goalLine-side*6.5;
  const goalBoxZ=goalLine-side*2.5;
  line(12,.11,0,boxZ);
  line(.11,6.5,-6,goalLine-side*3.25);
  line(.11,6.5,6,goalLine-side*3.25);
  line(6,.11,0,goalBoxZ);
  line(.11,2.5,-3,goalLine-side*1.25);
  line(.11,2.5,3,goalLine-side*1.25);
  const spot=new THREE.Mesh(new THREE.CircleGeometry(.16,24),white);
  spot.rotation.x=-Math.PI/2;spot.position.set(0,.067,goalLine-side*11);scene.add(spot);
  const arc=new THREE.Mesh(new THREE.RingGeometry(3.8,3.88,48,1,side<0?0:Math.PI,Math.PI),white);
  arc.rotation.x=-Math.PI/2;arc.position.set(0,.067,goalLine-side*11);scene.add(arc);
}
// Corner quarter-circles.
for(const x of[-W/2,W/2]) for(const z of[-L/2,L/2]){
  const q=new THREE.Mesh(new THREE.RingGeometry(.75,.82,24,1,0,Math.PI/2),white);
  q.rotation.x=-Math.PI/2;q.position.set(x,.067,z);scene.add(q);
}
function goal(z,color){cube(G,.18,.3,color,0,.15,z);for(const x of[-G/2,G/2])cube(.2,3,.2,white,x,1.5,z+(z<0?-.45:.45));cube(G,.15,.15,white,0,3,z+(z<0?-.45:.45));for(let x=-G/2;x<=G/2;x+=1)cube(.025,2.8,.025,white,x,1.5,z+(z<0?-.45:.45));}goal(-L/2,red);goal(L/2,blue);
for(let i=0;i<14;i++){const a=i/14*Math.PI*2;cube(.5,1.4,.5,mat(0x5a4535),Math.cos(a)*22,.7,Math.sin(a)*28)}
function sock(material){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(.78,24,16),material);body.scale.set(1.3,.72,1.7);body.position.z=.15;body.castShadow=true;g.add(body);const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.48,.62,1.3,20),material);cuff.position.y=.9;cuff.castShadow=true;g.add(cuff);const ring=new THREE.Mesh(new THREE.TorusGeometry(.5,.065,10,24),black);ring.rotation.x=Math.PI/2;ring.position.y=1.55;g.add(ring);for(const x of[-.2,.2]){const e=new THREE.Mesh(new THREE.SphereGeometry(.075,12,8),black);e.position.set(x,1.55,.35);g.add(e)}scene.add(g);return g}
function player(m,z){return{mesh:sock(m),vel:new THREE.Vector3(),speed:5.8,z,zKick:0,mood:'CONFUSED',think:0,target:new THREE.Vector3()}}
const me=player(white,15),cpu=player(blue,-15);me.mesh.position.set(0,.8,15);cpu.mesh.position.set(0,.8,-15);
const ball=new THREE.Mesh(new THREE.SphereGeometry(.48,24,18),white);ball.position.set(0,.55,0);ball.castShadow=true;scene.add(ball);const ballV=new THREE.Vector3();
const chicken=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(.68,18,14),white);body.scale.set(1.2,.8,1);chicken.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.42,18,14),white);head.position.y=.8;chicken.add(head);const beak=new THREE.ConeGeometry(.18,.45,10);const bk=new THREE.Mesh(beak,yellow);bk.rotation.z=-Math.PI/2;bk.position.set(0,.78,.42);chicken.add(bk);chicken.position.y=.7;scene.add(chicken);
const state={time:120,score:[0,0],paused:false,over:false,lastComment:0,wind:0,shake:0,combo:0,comboTimer:0,superKick:0,eventTimer:12,eventType:'',goals:0,rage:0,fouls:[0,0],cards:[0,0],tauntCooldown:0};
const power=new THREE.Group();
const powerCore=new THREE.Mesh(new THREE.IcosahedronGeometry(.62,1),yellow); powerCore.castShadow=true; power.add(powerCore);
const powerRing=new THREE.Mesh(new THREE.TorusGeometry(.9,.08,10,32),white); powerRing.rotation.x=Math.PI/2; power.add(powerRing);
power.position.set(THREE.MathUtils.randFloatSpread(18),.9,THREE.MathUtils.randFloat(-14,14)); scene.add(power);
let powerActive=true;const held=new Set();let touchSprint=false;
const toxicParts={who:['YOUR SOCK','THE BLUE SOCK','THAT LAUNDRY BAG','THE COMPUTER SOCK'],act:['HAS BEEN COOKED','HAS BEEN SENT BACK TO THE WASH','HAS LOST THE BALL AGAIN','IS DEFENDING WITH A NAPKIN','HAS COMMITTED A CRIME AGAINST FOOTBALL'],obj:['THE BALL','THE DEFENCE','THE SCOREBOARD','THEIR ENTIRE GAME PLAN'],end:['SIT DOWN, SOCK.','DELETE THE TACTICS.','THE CHICKEN SAW THAT.','THAT WAS EMBARRASSING.','BACK TO THE LAUNDRY BASKET.']};
const parts={who:['THE DIGITAL SOCK','THE COMPUTER','THE BLUE FOOT THING','OUR ELECTRONIC ATHLETE','THE MACHINE','THE OPPOSING SOCK'],act:['HAS KICKED','HAS MISSED','HAS CHASED','HAS ATTACKED','HAS TURNED AROUND','HAS PANICKED','HAS FORGOTTEN'],obj:['THE BALL','THE GOAL','THE CHICKEN','ITS OWN PLAN','THE CONCEPT OF DEFENCE','ABSOLUTELY NOTHING'],why:['BECAUSE GRAVITY LOOKED SUSPICIOUS','WHILE MATHEMATICS LEFT THE BUILDING','FOR REASONS NOT COVERED BY FOOTBALL','AS IF THIS WAS STRATEGIC','BECAUSE THE CHICKEN WAS WATCHING','AND THEN BLAMED PHYSICS'],end:['THIS WAS NOT IN THE PLAN.','THE PLAN HAS NOW BEEN CANCELLED.','NOBODY KNOWS WHY.','SCIENCE IS CURRENTLY CHECKING.','THE SOCK REMAINS CONFIDENT.']};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function comment(t,force=false){const now=performance.now();if(!force&&now-state.lastComment<900)return;document.getElementById('commentaryText').textContent=t;state.lastComment=now}
function procedural(){return pick(parts.who)+' '+pick(parts.act)+' '+pick(parts.obj)+'. '+pick(parts.why)+'. '+pick(parts.end)}
function toxic(){return pick(toxicParts.who)+' '+pick(toxicParts.act)+' '+pick(toxicParts.obj)+'. '+pick(toxicParts.end)}
function taunt(){if(state.over||state.paused||state.tauntCooldown>0)return;state.tauntCooldown=2.2;state.rage=Math.min(100,state.rage+7);comment('😈 '+toxic(),true);document.getElementById('statusText').textContent='😈 TOXIC SOCK MODE';}
function foul(a){const i=a===me?0:1;state.fouls[i]++;state.rage=Math.min(100,state.rage+12);if(state.fouls[i]%3===0){state.cards[i]++;comment('🟨 CHICKEN CARD! '+(a===me?'YOUR SOCK':'THE BLUE SOCK')+' HAS BEEN BOOKED FOR LAUNDRY VIOLATIONS.',true);document.getElementById('statusText').textContent='🟨 CARD ISSUED';}else comment('🐔 FOUL! THE CHICKEN HAS SEEN EVERYTHING. '+toxic(),true)}
function clamp(a){a.mesh.position.x=THREE.MathUtils.clamp(a.mesh.position.x,-W/2+1,W/2-1);a.mesh.position.z=THREE.MathUtils.clamp(a.mesh.position.z,-L/2+1,L/2-1)}
function kick(a,dir){if(a.zKick>0)return;a.zKick=.28;dir.y=0;
const boosted=a===me&&state.superKick>0;
const kickPower=boosted?22:(touchSprint||held.has('ShiftLeft')||held.has('ShiftRight'))?15:11;
if(boosted){state.superKick=0;comment('SUPER SOCK KICK! THE BALL HAS BEEN PROMOTED TO A PROJECTILE.',true);document.getElementById('statusText').textContent='💥 SUPER SOCK KICK!';}
if(!dir.lengthSq())dir.set(0,0,a===me?-1:1);dir.normalize();ballV.addScaledVector(dir,kickPower);state.shake=.14;if(!boosted)comment(procedural(),true)}
function movePlayer(dt){const x=(held.has('KeyD')||held.has('ArrowRight'))-(held.has('KeyA')||held.has('ArrowLeft'));const z=(held.has('KeyS')||held.has('ArrowDown'))-(held.has('KeyW')||held.has('ArrowUp'));const v=new THREE.Vector3(x,0,z);if(v.lengthSq())v.normalize();const sprint=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;v.multiplyScalar(me.speed*(sprint?1.7:1));me.vel.lerp(v,Math.min(1,dt*12));me.mesh.position.addScaledVector(me.vel,dt);clamp(me)}
function cpuAI(dt){cpu.think-=dt;const d=cpu.mesh.position.distanceTo(ball.position);if(cpu.think<=0){cpu.think=.16+Math.random()*.35;const r=Math.random();if(r<.12){cpu.target.copy(cpu.mesh.position).add(new THREE.Vector3((Math.random()-.5)*14,0,(Math.random()-.5)*10));cpu.mood='DISTRACTED'}else{cpu.target.copy(ball.position);cpu.mood=r<.35?'PANICKED':r<.68?'CONFUSED':'CONFIDENT'}}const target=d<2.3?ball.position:cpu.target;const v=target.clone().sub(cpu.mesh.position);v.y=0;if(v.lengthSq())v.normalize();v.multiplyScalar(cpu.speed*(cpu.mood==='PANICKED'?1.45:cpu.mood==='CONFUSED'?.72:1));cpu.vel.lerp(v,Math.min(1,dt*7));cpu.mesh.position.addScaledVector(cpu.vel,dt);clamp(cpu);if(d<2.15&&cpu.zKick<=0&&Math.random()<.055)kick(cpu,new THREE.Vector3(0,0,L/2+6).sub(ball.position));if(Math.random()<dt*.018)comment(procedural())}
function ballPhysics(dt){
if(powerActive && me.mesh.position.distanceTo(power.position)<1.65){state.superKick=8;powerActive=false;power.visible=false;state.combo++;state.comboTimer=5;comment('🧼 LAUNDRY POWER-UP! YOUR NEXT KICK IS ABSURDLY POWERFUL.',true);document.getElementById('statusText').textContent='🧼 SUPER KICK READY';}
ball.position.addScaledVector(ballV,dt);ballV.multiplyScalar(Math.pow(.16,dt));ball.rotation.x+=ballV.z*dt;ball.rotation.z-=ballV.x*dt;if(Math.abs(ball.position.x)>W/2-.65){ball.position.x=Math.sign(ball.position.x)*(W/2-.65);ballV.x*=-.72}if(Math.abs(ball.position.z)>L/2-.55){const playerGoal=ball.position.z<0&&Math.abs(ball.position.x)<G/2;const cpuGoal=ball.position.z>0&&Math.abs(ball.position.x)<G/2;if(playerGoal){state.score[0]++;state.goals++;state.combo++;state.comboTimer=5;document.getElementById('statusText').textContent='GOAL! YOUR SOCK SCORED';comment('GOAL! THE SOCK HAS ENTERED THE CORRECT RECTANGLE. THIS IS OFFICIALLY FOOTBALL.',true)}else if(cpuGoal){state.score[1]++;state.combo=0;state.comboTimer=0;document.getElementById('statusText').textContent='GOAL! THE COMPUTER SOCK SCORED';comment('COMPUTER SCORED! IT HAS DISCOVERED THE FORWARD DIRECTION.',true)}document.getElementById('playerScore').textContent=state.score[0];document.getElementById('computerScore').textContent=state.score[1];ball.position.set((Math.random()-.5)*3,.55,0);ballV.set(0,0,0)}for(const a of[me,cpu]){const d=a.mesh.position.clone().sub(ball.position);d.y=0;const n=d.length();if(n<1.45&&n>.01){ballV.addScaledVector(d.normalize(),(1.45-n)*5);if(n<.62&&Math.random()<dt*.75)foul(a)}}}
function chaos(dt){
state.eventTimer-=dt;
if(state.eventTimer<=0){
  state.eventTimer=14+Math.random()*12;
  const events=[
    ['BANANA INCIDENT','A BANANA HAS ENTERED THE MATCH. FOOTBALL IS NOW A FRUIT-BASED SPORT.'],
    ['CHICKEN EMERGENCY','THE CHICKEN HAS LOST THE WHISTLE. EVERYONE MUST CONTINUE PRETENDING.'],
    ['SOCK WEATHER','THE AIR IS 97% SOCK. VISIBILITY IS QUESTIONABLE.'],
    ['LAUNDRY LAW','AN INVISIBLE WASHING MACHINE HAS CHANGED THE LAWS OF PHYSICS.']
  ];
  const e=events[Math.floor(Math.random()*events.length)];
  state.eventType=e[0];comment('🚨 '+e[0]+': '+e[1],true);document.getElementById('statusText').textContent='🚨 '+e[0];
  if(e[0]==='BANANA INCIDENT'){ballV.x+=(Math.random()-.5)*10;ballV.z+=(Math.random()-.5)*10;}
}
state.wind-=dt;if(state.wind<=0&&Math.random()<dt*.12){state.wind=3+Math.random()*6;const force=(Math.random()-.5)*5;ballV.x+=force;comment('THE WIND HAS TOUCHED THE BALL. THE BALL HAS TAKEN THIS PERSONALLY.',true)}if(Math.random()<dt*.018)comment(procedural(),true)}
function chickenRun(dt){
const t=performance.now()/1000;
power.visible=powerActive;
if(powerActive){power.rotation.y+=dt*2.5;power.rotation.z+=dt;power.position.y=.9+Math.sin(t*4)*.15;}
chicken.position.x=Math.sin(t*.9)*8;chicken.position.z=Math.cos(t*.63)*18;chicken.rotation.y=t;if(Math.random()<dt*.008)comment('THE REFEREE CHICKEN IS RUNNING ACROSS THE FIELD. THIS IS PROBABLY LEGAL.',true)}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
function togglePause(){if(state.over)return;state.paused=!state.paused;document.getElementById('pauseOverlay').classList.toggle('hidden',!state.paused)}
addEventListener('keydown',e=>{if(e.code==='KeyP')togglePause();if(e.code==='Space'){e.preventDefault();if(me.mesh.position.distanceTo(ball.position)<2.45)kick(me,new THREE.Vector3((ball.position.x-me.mesh.position.x)*.35,0,-1))}held.add(e.code)});addEventListener('keyup',e=>held.delete(e.code));
document.getElementById('pauseBtn').onclick=togglePause;document.getElementById('resumeBtn').onclick=togglePause;document.getElementById('restartBtn').onclick=()=>location.reload();
document.getElementById('tauntBtn').onclick=taunt;
addEventListener('keydown',e=>{if(e.code==='KeyT')taunt();});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();held.add(k)});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>held.delete(k)))});document.getElementById('kickMobile').onpointerdown=()=>{if(me.mesh.position.distanceTo(ball.position)<2.45)kick(me,new THREE.Vector3((ball.position.x-me.mesh.position.x)*.35,0,-1))};canvas.addEventListener('pointerdown',()=>{if(me.mesh.position.distanceTo(ball.position)<2.45)kick(me,new THREE.Vector3((ball.position.x-me.mesh.position.x)*.35,0,-1))});document.getElementById('sprintMobile').onpointerdown=()=>touchSprint=true;document.getElementById('sprintMobile').onpointerup=()=>touchSprint=false;
function finish(){state.over=true;document.getElementById('statusText').textContent='FULL TIME — SOCKS HAVE SURVIVED';const a=state.score[0],b=state.score[1];document.getElementById('resultTitle').textContent=a===b?'DRAW: EVERYONE IS CONFUSED':a>b?'YOU WON THE SOCK':'THE COMPUTER WON THE SOCK';document.getElementById('resultText').textContent=a===b?'The chicken has declared the universe approximately balanced.':a>b?'You defeated a computer using the same laws of physics.':'The computer has won and will now be unbearable.';document.getElementById('resultOverlay').classList.remove('hidden')}
const clock=new THREE.Clock();function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);if(!state.paused&&!state.over){
state.time=Math.max(0,state.time-dt);state.tauntCooldown=Math.max(0,state.tauntCooldown-dt);state.rage=Math.max(0,state.rage-dt*2.2);state.comboTimer=Math.max(0,state.comboTimer-dt);if(state.comboTimer===0)state.combo=0;if(state.superKick>0)state.superKick=Math.max(0,state.superKick-dt);if(state.time===0)finish();movePlayer(dt);cpuAI(dt);ballPhysics(dt);chaos(dt);chickenRun(dt);me.zKick=Math.max(0,me.zKick-dt);cpu.zKick=Math.max(0,cpu.zKick-dt);document.getElementById('comboText').textContent=state.combo>1?'🔥 COMBO x'+state.combo:(state.superKick>0?'💥 SUPER KICK READY':'')+' '+(state.rage>35?'😈 RAGE '+Math.floor(state.rage)+'%':'');
document.getElementById('timer').textContent=Math.floor(state.time/60).toString().padStart(2,'0')+':'+Math.floor(state.time%60).toString().padStart(2,'0')}const ballFocus=new THREE.Vector3(ball.position.x,0,ball.position.z);const portrait=innerWidth<700;const landscape=innerWidth/innerHeight>1.15;const camHeight=portrait?31:landscape?26:29;const camBack=portrait?25:landscape?22:24;const followX=THREE.MathUtils.clamp(ballFocus.x*.12,-3,3);const followZ=THREE.MathUtils.clamp(ballFocus.z*.10,-3,3);camera.position.lerp(new THREE.Vector3(followX,camHeight,camBack+followZ),Math.min(1,dt*2.4));camera.lookAt(followX,0,followZ);renderer.render(scene,camera)}loop();setTimeout(()=>document.body.classList.add('ready'),900);