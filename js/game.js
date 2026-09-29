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


// Match officials
const officials=[];
function createOfficial(x,z,side){
 const g=new THREE.Group();
 const shirt=mat(side==='REF'?0x222222:0xf0f0f0);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.42,.5,.9,14),shirt);body.position.y=1.55;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.3,14,10),skin);head.position.y=2.18;g.add(head);
 const legMat=mat(0x171717);
 for(const lx of[-.18,.18]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.65,10),legMat);leg.position.set(lx,.65,0);g.add(leg)}
 g.position.set(x,0,z);scene.add(g);return {group:g,side};
}
const referee=createOfficial(0,0,'REF');
officials.push(referee);
const assistantA=createOfficial(-W/2-1,0,'AR');
const assistantB=createOfficial(W/2+1,0,'AR');
officials.push(assistantA,assistantB);
function updateOfficials(dt){
 const target=ball.position.clone();
 const rv=new THREE.Vector3(
   THREE.MathUtils.clamp(target.x*.45,-W/2+2,W/2-2),
   0,
   THREE.MathUtils.clamp(target.z*.45,-L/2+3,L/2-3)
 );
 referee.group.position.lerp(rv,Math.min(1,dt*2.8));
 referee.group.rotation.y=Math.atan2(ball.position.x-referee.group.position.x,ball.position.z-referee.group.position.z);
 const az=THREE.MathUtils.clamp(ball.position.z,-L/2+1,L/2-1);
 assistantA.group.position.z=az; assistantB.group.position.z=az;
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
  return {number:i+1,role:f.role,home:isHome,base:new THREE.Vector3(f.x,0,z),mesh:visual.group,label:visual.label,vel:new THREE.Vector3(),speed:f.role==='GK'?4.5:5.4,stamina:100,cooldown:0,tackleCooldown:0,yellow:0,red:false,goals:0,assists:0,touches:0,passes:0,shots:0,tackles:0};
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
const ballSpin=new THREE.Vector3();
let controlledTouch=0,shielding=false,slideTimer=0,shotCurve=0,matchMomentum=0;
const held=new Set();
let touchSprint=false;
const clock=new THREE.Clock();

const state={
 minute:0,seconds:0,half:1,score:[0,0],paused:false,over:false,kickoff:true,kickoffDelay:1,restartType:'KICKOFF',restartTeam:'HOME',
 restartSpot:new THREE.Vector3(0,.43,0),lastTouch:'HOME',lastComment:0,penalty:false,penaltyShooter:null,messageTimer:0,stoppage:0,halfEnded:false,possession:{HOME:0,AWAY:0},touches:{HOME:0,AWAY:0}
};

function scoreUI(){document.getElementById('playerScore').textContent=state.score[0];document.getElementById('computerScore').textContent=state.score[1]}
function comment(t,force=false){const n=performance.now();if(!force&&n-state.lastComment<650)return;document.getElementById('commentaryText').textContent=t;state.lastComment=n}
function d2(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
function clampField(p){p.mesh.position.x=THREE.MathUtils.clamp(p.mesh.position.x,-W/2+.65,W/2-.65);p.mesh.position.z=THREE.MathUtils.clamp(p.mesh.position.z,-L/2+.65,L/2-.65)}
function goalZ(p){return p.home?-L/2:L/2}
function nearest(team){return team.reduce((a,b)=>d2(a.mesh.position,ball.position)<d2(b.mesh.position,ball.position)?a:b,team[0])}
function opponent(p){return (p.home?awayTeam:homeTeam).reduce((a,b)=>d2(a.mesh.position,p.mesh.position)<d2(b.mesh.position,p.mesh.position)?a:b,(p.home?awayTeam:homeTeam)[0])}
function hasBall(p){
 const reach=p.role==='GK'?1.65:1.38;
 return d2(p.mesh.position,ball.position)<reach&&ball.position.y<1.35&&ballVel.length()<8.5;
}
function claimBall(p){
 if(p.red||ball.position.y>1.35||d2(p.mesh.position,ball.position)>(p.role==='GK'?1.65:1.38))return false;
 const speed=ballVel.length();
 if(speed>9)return false;
 if(p.role==='GK'&&Math.abs(p.mesh.position.z)<L/2-7)return false;
 ballVel.multiplyScalar(.18);
 ball.position.y=.43;
 state.lastTouch=p.home?'HOME':'AWAY';p.touches++;state.touches[p.home?'HOME':'AWAY']++;
 return true;
}
function forwardFor(p){return new THREE.Vector3(0,0,p.home?-1:1)}
function nearestOpponentDistance(p){
 const opp=p.home?awayTeam:homeTeam;let best=99;
 for(const q of opp)if(!q.red)best=Math.min(best,d2(p.mesh.position,q.mesh.position));
 return best;
}
function firstTouch(p){
 if(!hasBall(p))return;
 const sprint=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;
 const pressure=tacticalPressure(p);
 const facing=new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));
 const escape=new THREE.Vector3();
 const opponents=p.home?awayTeam:homeTeam;
 let nearestOpp=null,best=99;
 for(const o of opponents){if(o.red)continue;const d=d2(p.mesh.position,o.mesh.position);if(d<best){best=d;nearestOpp=o}}
 if(nearestOpp){
  escape.copy(p.mesh.position).sub(nearestOpp.mesh.position);escape.y=0;
  if(escape.lengthSq()>0.01)escape.normalize();
 }
 const touchDir=pressure>.62?escape.lengthSq()?escape:facing:facing;
 const touchDistance=sprint?.92:(pressure>.62?.58:.72);
 ball.position.copy(p.mesh.position).addScaledVector(touchDir,touchDistance);ball.position.y=.43;
 ballVel.copy(touchDir).multiplyScalar(sprint?1.4:.65);
 controlledTouch=.22;
 state.lastTouch=p.home?'HOME':'AWAY';
}
function bodyShield(p,dt){
 if(!shielding||!hasBall(p))return;
 const o=opponent(p);if(!o)return;
 const away=p.mesh.position.clone().sub(o.mesh.position);away.y=0;
 if(away.lengthSq()<.01)return;
 away.normalize();
 p.mesh.rotation.y=Math.atan2(away.x,away.z);
 ball.position.lerp(p.mesh.position.clone().addScaledVector(away,.62).setY(.43),Math.min(1,dt*8));
 p.vel.multiplyScalar(.72);
}
function staminaRecovery(p,dt){
 if(!p)return;
 const intensity=p.vel.length();
 if(intensity<1.2)p.stamina=Math.min(100,p.stamina+8*dt);
 else if(intensity>5.5)p.stamina=Math.max(0,p.stamina-5*dt);
}
function controlBall(p,dt){
 if(!hasBall(p)){ if(!claimBall(p)) return false; }
 if(ballVel.length()>4.5&&controlledTouch<=0)firstTouch(p);
 const sprint=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;
 const moveDir=p.vel.lengthSq()>1?p.vel.clone().normalize():new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));
 const f=new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));
 const touchDir=moveDir.lengthSq()>.1?moveDir:f;
 const desired=p.mesh.position.clone().add(touchDir.multiplyScalar(sprint?1.3:.72));desired.y=.43;
 const delta=desired.sub(ball.position);delta.y=0;
 ballVel.lerp(delta.multiplyScalar(sprint?8.5:7),Math.min(1,dt*10));
 bodyShield(p,dt);
 ball.position.y=.43;
 controlledTouch=.12;
 state.lastTouch=p.home?'HOME':'AWAY';
 return true;
}

function kickBall(p,dir,power,kind){
 if(p.red||p.cooldown>0||d2(p.mesh.position,ball.position)>1.8)return false;
 dir.y=0;if(dir.lengthSq()<.01)dir.set(0,0,p.home?-1:1);dir.normalize();
 ballVel.copy(dir).multiplyScalar(power);ballVel.y=kind==='shoot'?Math.min(2.2,power*.16):Math.min(1.1,power*.08);
 p.cooldown=.25;state.lastTouch=p.home?'HOME':'AWAY';
 if(kind==='shoot'){p.shots++;comment(p.home?'Home shoots!':'Away shoots!',true)}
 if(kind==='pass')p.passes++;
 if(kind==='pass')ballSpin.set(0,(Math.random()-.5)*1.8,0);
 return true;
}
function shoot(p){
 if(!hasBall(p))return;
 const pressure=nearestOpponentDistance(p);
 const sprint=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;
 const low=sprint&&pressure>2.5;
 const goal=goalZ(p);
 const goalHalf=GOAL*.5;
 const angleToGoal=Math.abs(p.mesh.position.x)/(Math.abs(goal-p.mesh.position.z)+.01);
 const central=Math.max(0,1-angleToGoal*2.4);
 const targetX=THREE.MathUtils.clamp(-p.mesh.position.x*.12+(Math.random()-.5)*(1.8-central*.8),-goalHalf+1,goalHalf-1);
 const aim=new THREE.Vector3(targetX,0,goal).sub(ball.position);
 const power=low?15.8:(pressure<2.2?13.5:16.8);
 kickBall(p,aim,power,'shoot');
 shotCurve=THREE.MathUtils.clamp(-p.mesh.position.x*.045+(Math.random()-.5)*.025,-.22,.22);
 if(low)ballVel.y=-.05; else if(Math.abs(p.mesh.position.z-goal)>10)ballVel.y=.35;
}
function tacticalPressure(p){
 const opp=p.home?awayTeam:homeTeam;
 let pressure=0;
 for(const q of opp){
  if(q.red)continue;
  const d=d2(p.mesh.position,q.mesh.position);
  if(d<5)pressure+=Math.max(0,1-d/5);
 }
 return Math.min(1,pressure);
}
function chooseBestPass(p){
 const team=p.home?homeTeam:awayTeam;
 const facing=new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));
 let best=null,bestScore=-Infinity;
 for(const q of team){
  if(q===p||q.red)continue;
  const v=q.mesh.position.clone().sub(p.mesh.position);v.y=0;
  const d=v.length();if(d<2||d>20)continue;
  const dir=v.clone().normalize();
  const forward=dir.dot(facing);
  const space=1-Math.min(1,nearestOpponentDistance(q)/5);
  const central=1-Math.min(1,Math.abs(q.mesh.position.x)/16);
  const score=forward*2.2+space*3+central*.8-d*.035;
  if(score>bestScore){bestScore=score;best=q}
 }
 return best;
}

function pass(p){
 if(!hasBall(p))return;
 const loft=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;
 let best=chooseBestPass(p);
 if(best){
  if(passingLaneBlocked(p,best,p.home?homeTeam:awayTeam)){const alternatives=(p.home?homeTeam:awayTeam).filter(q=>q!==p&&!q.red&&q.role!=='GK').sort((a,b)=>d2(a.mesh.position,ball.position)-d2(b.mesh.position,ball.position));best=alternatives.find(q=>!passingLaneBlocked(p,q,p.home?homeTeam:awayTeam))||best}
  const defenders=(p.home?awayTeam:homeTeam).filter(q=>!q.red).sort((a,b)=>p.home?b.mesh.position.z-a.mesh.position.z:a.mesh.position.z-b.mesh.position.z);
  const second=defenders[1]||defenders[0];
  const attackingGoal=p.home?-L/2:L/2;
  const aheadOfBall=p.home?best.mesh.position.z<ball.position.z:best.mesh.position.z>ball.position.z;
  const beyondSecond=p.home?best.mesh.position.z<second.mesh.position.z:best.mesh.position.z>second.mesh.position.z;
  const movingTowardGoal=p.home?best.mesh.position.z<attackingGoal+L/2-8:best.mesh.position.z>attackingGoal-L/2+8;
  const off=aheadOfBall&&beyondSecond&&movingTowardGoal;
  if(off){state.restartType='FREE KICK';state.restartTeam=p.home?'AWAY':'HOME';state.restartSpot.copy(best.mesh.position);state.restartSpot.y=.43;state.kickoff=true;comment('Offside. Free kick to the defence.',true);return}
  const target=best.mesh.position.clone();
  if(loft){
   const lead=best.vel.clone().multiplyScalar(1.15);
   target.add(lead);
   target.y=0; kickBall(p,target.sub(ball.position),12.2,'pass'); ballVel.y=1.55; comment(p.home?'Through ball into space.':'Away plays it in behind.',true);
  }else{
   const distance=target.distanceTo(ball.position);const passPower=THREE.MathUtils.clamp(7.2+distance*.16,7.5,10.8);kickBall(p,target.sub(ball.position),passPower,'pass'); comment(p.home?'Pass completed.':'Away passes.',true);
  }
 }
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
 const v=ball.position.clone().sub(p.mesh.position);v.y=0;
 if(v.lengthSq()>0.01){
  v.normalize();
  const approach=p.vel.length()>4.5?0.08:0;const facing=new THREE.Vector3(Math.sin(p.mesh.rotation.y),0,Math.cos(p.mesh.rotation.y));const ballDir=v.clone();const angle=Math.max(0,facing.dot(ballDir));const cleanChance=THREE.MathUtils.clamp(.48+angle*.28+(pressure?0:0),.38,.82);const clean=Math.random()<cleanChance-approach;
  if(clean){
   ball.position.copy(p.mesh.position).addScaledVector(v,.72);ball.position.y=.43;
   ballVel.copy(v).multiplyScalar(1.4);state.lastTouch=p.home?'HOME':'AWAY';p.tackles++;
   controlledTouch=.22;comment('Clean tackle — possession won.',true);
  }else{
   ballVel.addScaledVector(v,5);state.lastTouch=p.home?'HOME':'AWAY';comment('Tackle gets a touch.',true);
  }
 }
}

function cross(p){
 if(!hasBall(p)||Math.abs(p.mesh.position.x)<7)return;
 const targetZ=goalZ(p);
 const team=p.home?homeTeam:awayTeam;const attackers=team.filter(q=>!q.red&&q!==p&&['ST','LW','RW','LM','RM'].includes(q.role)).sort((a,b)=>Math.abs(a.mesh.position.z-targetZ)-Math.abs(b.mesh.position.z-targetZ));
 const receiver=attackers[0];const tx=receiver?receiver.mesh.position.x:-p.mesh.position.x*.35;const tz=receiver?receiver.mesh.position.z:targetZ;
 const target=new THREE.Vector3(tx*.65,0,tz).sub(ball.position);
 kickBall(p,target,11.8,'pass');ballVel.y=3.2;comment(p.home?'Cross into the box.':'Away sends in a cross.',true);
}
function slideTackle(p){
 if(p.red||p.tackleCooldown>0)return;
 p.tackleCooldown=1.15;slideTimer=.32;
 const o=opponent(p);if(!o||d2(p.mesh.position,o.mesh.position)>2.5)return;
 const dir=p.vel.lengthSq()>1?p.vel.clone().normalize():forwardFor(p);
 p.mesh.position.addScaledVector(dir,.85);clampField(p);
 if(Math.random()<.12){foul(p,o);return}
 const v=ball.position.clone().sub(p.mesh.position);v.y=0;
 if(v.lengthSq()>.01){v.normalize();ball.position.addScaledVector(v,.65);ballVel.copy(v).multiplyScalar(6);state.lastTouch=p.home?'HOME':'AWAY';p.tackles++;comment('Sliding tackle wins the ball.',true)}
}

function moveUser(dt){
 if(state.penalty)return;
 const x=(held.has('KeyD')||held.has('ArrowRight'))-(held.has('KeyA')||held.has('ArrowLeft'));
 const z=(held.has('KeyS')||held.has('ArrowDown'))-(held.has('KeyW')||held.has('ArrowUp'));
 const v=new THREE.Vector3(x,0,z);if(v.lengthSq())v.normalize();
 const sprint=held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint;
 if(v.lengthSq())me.stamina=Math.max(0,me.stamina-(sprint?12:2.5)*dt);else me.stamina=Math.min(100,me.stamina+7*dt);
 if(hasBall(me)&&ballVel.length()>3.5&&controlledTouch<=0)firstTouch(me);
 if(me.stamina<8&&sprint)comment('Player is exhausted.',true);
 me.vel.lerp(v.multiplyScalar(me.speed*(sprint&&me.stamina>2?1.38:1)),Math.min(1,dt*12));const fatigue=me.stamina<25?.82:me.stamina<50?.93:1;
 me.mesh.position.addScaledVector(me.vel,dt*fatigue);clampField(me);
 if(me.vel.lengthSq()>1)me.mesh.rotation.y=Math.atan2(me.vel.x,me.vel.z);
}

function looseBallRace(team,dt){
 if(ballVel.length()>3||ball.position.y>.8)return;
 const candidates=team.filter(p=>!p.red&&p.role!=='GK'&&p!==me);
 let best=null,bestT=99;
 for(const p of candidates){const d=d2(p.mesh.position,ball.position);const t=d/(p.speed*Math.max(.55,p.stamina/100));if(t<bestT){bestT=t;best=p}}
 if(best&&bestT<2.8){
  const v=ball.position.clone().sub(best.mesh.position);v.y=0;
  if(v.lengthSq()>0.2){v.normalize();best.vel.lerp(v.multiplyScalar(best.speed),Math.min(1,dt*6))}
 }
}
function aiTeam(team,dt){
 const nearestPlayer=nearest(team);
 team.forEach(p=>{
  if(p.red||p===me)return;
  let target=p.base.clone();const bd=d2(p.mesh.position,ball.position);
  const defending=team===homeTeam ? ball.position.z>6 : ball.position.z<-6;
  const myScore=team===homeTeam?state.score[0]:state.score[1],oppScore=team===homeTeam?state.score[1]:state.score[0];
  const trailing=myScore<oppScore&&state.minute>70,leading=myScore>oppScore&&state.minute>70;
  if(p===nearestPlayer){target.copy(ball.position);if(bd<4){const oppOwner=nearest(team===homeTeam?awayTeam:homeTeam);if(oppOwner&&hasBall(oppOwner)){const contain=oppOwner.mesh.position.clone().sub(p.mesh.position);contain.y=0;if(contain.lengthSq()>0.1){contain.normalize();target.copy(oppOwner.mesh.position).addScaledVector(contain,-1.15)}}}}
  else if(p.role==='CB'||p.role==='LB'||p.role==='RB'){
   target.x+=THREE.MathUtils.clamp(ball.position.x*.10,-3.5,3.5);
   target.z+=team===homeTeam?THREE.MathUtils.clamp(ball.position.z*.10,-3,3):THREE.MathUtils.clamp(ball.position.z*.10,-3,3);
   if(defending)target.z+=team===homeTeam?2:-2;
  } else {
   target.x+=THREE.MathUtils.clamp(ball.position.x*.20,-5,5);
   target.z+=team===homeTeam?THREE.MathUtils.clamp(-ball.position.z*.12,-5,5):THREE.MathUtils.clamp(ball.position.z*.12,-5,5);
   if(!defending && (p.role==='LW'||p.role==='RW'||p.role==='ST')) target.z+=team===homeTeam?-3:3;
   if(trailing&&(p.role==='LW'||p.role==='RW'||p.role==='ST')) target.z+=team===homeTeam?-5:5;
   if(leading&&['CM','LM','RM'].includes(p.role)) target.z+=team===homeTeam?2:-2;
  }
  if(p.role==='GK'){target.x=THREE.MathUtils.clamp(ball.position.x,-5.5,5.5);target.z=team===homeTeam?L/2-2.2:-L/2+2.2;if(bd>18)target.copy(p.base)}
  const v=target.sub(p.mesh.position);v.y=0;if(v.lengthSq()>0.2)v.normalize();
  p.vel.lerp(v.multiplyScalar(p.speed*(p===nearestPlayer?1.08:.72)),Math.min(1,dt*5));p.mesh.position.addScaledVector(p.vel,dt);clampField(p);
  if(p.vel.lengthSq()>1)p.mesh.rotation.y=Math.atan2(p.vel.x,p.vel.z);const pressing=state.minute>75&&(state.score[team===homeTeam?0:1]<state.score[team===homeTeam?1:0]);p.stamina=Math.min(100,p.stamina+(pressing?2.5:5)*dt);staminaRecovery(p,dt);
  if(p===nearestPlayer&&bd<3)p.stamina=Math.max(0,p.stamina-2.5*dt);
  if(p===nearestPlayer&&bd<1.5&&!state.penalty){
   if(hasBall(p))controlBall(p,dt);
   const nearGoal=Math.abs(p.mesh.position.z-goalZ(p))<17;
   const pressure=nearestOpponentDistance(p);
   const pressureLevel=tacticalPressure(p);
   const wide=Math.abs(p.mesh.position.x)>7;
   const boxReady=Math.abs(p.mesh.position.z-goalZ(p))<13;
   if(boxReady&&pressureLevel<.72&&Math.random()<.13)shoot(p);
   else if(wide&&pressureLevel<.65&&Math.random()<.10)cross(p);
   else if(pressureLevel>.48&&Math.random()<.24)pass(p);
   else if(!nearGoal&&Math.random()<.045)pass(p);
  }
 });
}

function passingLaneBlocked(from,to,team){
 const a=from.mesh.position,b=to.mesh.position,ab=b.clone().sub(a);ab.y=0;
 const len=ab.length();if(len<1)return false;
 for(const o of (team===homeTeam?awayTeam:homeTeam)){
  if(o.red)continue;
  const ap=o.mesh.position.clone().sub(a);ap.y=0;
  const t=THREE.MathUtils.clamp(ap.dot(ab)/(len*len),0,1);
  const closest=a.clone().addScaledVector(ab,t);
  if(closest.distanceTo(o.mesh.position)<.75&&closest.distanceTo(a)>1.1&&closest.distanceTo(b)>1.1)return true;
 }
 return false;
}
function supportRuns(team,dt){
 const owner=nearest(team);
 if(!owner||!hasBall(owner))return;
 const attackDir=team===homeTeam?-1:1;
 team.filter(p=>!p.red&&p!==owner&&p.role!=='GK').forEach(p=>{
  const dist=d2(p.mesh.position,owner.mesh.position);
  if(dist<35&&dist>4){
   const run=new THREE.Vector3(p.mesh.position.x*.04,0,attackDir*1.4);
   p.base.addScaledVector(run,dt);
  }
 });
}
function interceptAI(team,dt){
 const opp=team===homeTeam?awayTeam:homeTeam;
 const candidates=team.filter(p=>!p.red&&p.role!=='GK');
 if(ballVel.length()<3)return;
 let best=null,bestD=999;
 candidates.forEach(p=>{
  const to=ball.position.clone().addScaledVector(ballVel,.22).sub(p.mesh.position);to.y=0;
  const d=to.length();
  if(d<bestD){bestD=d;best=p}
 });
 if(best&&bestD<5.5&&best.vel.length()<6.5){
  const target=ball.position.clone().addScaledVector(ballVel,.18);target.y=0;
  const v=target.sub(best.mesh.position);v.y=0;
  if(v.lengthSq()>0.2){v.normalize();best.vel.lerp(v.multiplyScalar(best.speed*.92),Math.min(1,dt*4))}
 }
}

function defensiveMarking(team,dt){
 const opp=team===homeTeam?awayTeam:homeTeam;
 const defenders=team.filter(p=>!p.red&&['GK','CB','LB','RB'].includes(p.role));
 const attackers=opp.filter(p=>!p.red&&['ST','LW','RW','LM','RM'].includes(p.role));
 defenders.forEach((d,i)=>{
  if(d===nearest(team)||d.role==='GK')return;
  const target=attackers[i%Math.max(1,attackers.length)];
  if(!target)return;
  const goal=goalZ(d);
  const protect=new THREE.Vector3(target.mesh.position.x*.82,0,goal+(team===homeTeam?-8:8));
  const mark=target.mesh.position.clone().lerp(protect,.28).sub(target.mesh.position.clone().sub(d.mesh.position).normalize().multiplyScalar(1.8));
  mark.y=0;
  const v=mark.sub(d.mesh.position);v.y=0;
  if(v.lengthSq()>1)v.normalize();
  d.vel.lerp(v.multiplyScalar(d.speed*.5),Math.min(1,dt*2));
 });
}

function updateMatchStats(dt){
 const nearHome=nearest(homeTeam),nearAway=nearest(awayTeam);
 const h=hasBall(nearHome),a=hasBall(nearAway);
 if(h)state.possession.HOME+=dt;
 if(a)state.possession.AWAY+=dt;
 const total=state.possession.HOME+state.possession.AWAY;
 const hp=total?Math.round(state.possession.HOME/total*100):50;
 const el=document.getElementById('commentaryText');
 if(el&&state.messageTimer<=0){
  el.title='Possession: HOME '+hp+'% · AWAY '+(100-hp)+'%';
 }
}
function matchStoppage(){
 let s=0;
 [...homeTeam,...awayTeam].forEach(p=>{if(p.red)s+=.2;if(p.yellow)s+=.08});
 return Math.min(6,Math.floor(s));
}

function ensureBench(team){
 if(team.bench)return;
 team.bench=[];
 const shirt=team===homeTeam?home:away,shorts=team===homeTeam?homeDark:awayDark;
 for(let i=0;i<5;i++){
  const visual=createPlayer(shirt,shorts,12+i,false);
  visual.group.visible=false;
  team.bench.push({number:12+i,role:'SUB',home:team===homeTeam,mesh:visual.group,label:visual.label,vel:new THREE.Vector3(),speed:5.2,stamina:100,cooldown:0,tackleCooldown:0,yellow:0,red:false,base:new THREE.Vector3()});
 }
}
function substitutions(team){
 ensureBench(team);
 const tired=team.find(p=>!p.red&&p.role!=='GK'&&p.stamina<18);
 const sub=team.bench.find(p=>!p.used);
 if(!tired||!sub)return;
 sub.used=true;tired.mesh.visible=false;
 sub.mesh.visible=true;sub.mesh.position.copy(tired.mesh.position);sub.role=tired.role;sub.base.copy(tired.base);
 const idx=team.indexOf(tired);if(idx>=0){team[idx]=sub;if(tired===me){me=sub;activeIndex=team===homeTeam?idx:activeIndex;setActive(Math.max(0,activeIndex))}}
 comment((team===homeTeam?'Home':'Away')+' substitution.',true);
}

function switchPlayer(){
 const list=homeTeam.map((p,i)=>({p,i})).filter(x=>!x.p.red).sort((a,b)=>(d2(a.p.mesh.position,ball.position)+nearestOpponentDistance(a.p)*.12)-(d2(b.p.mesh.position,ball.position)+nearestOpponentDistance(b.p)*.12));
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
 const restartTeam=state.restartTeam==='HOME'?homeTeam:awayTeam,other=state.restartTeam==='HOME'?awayTeam:homeTeam;
 const dir=state.restartTeam==='HOME'?-1:1;
 if(state.restartType==='CORNER'){restartTeam.filter(p=>!p.red&&p.role!=='GK').forEach((p,i)=>{p.mesh.position.x=THREE.MathUtils.clamp((i-5)*1.25,-6,6);p.mesh.position.z=state.restartSpot.z-dir*(3+(i%3)*1.3)});}
 if(state.restartType==='GOAL KICK'){const g=restartTeam.find(p=>p.role==='GK'&&!p.red);if(g)g.mesh.position.copy(state.restartSpot).add(new THREE.Vector3(0,0,dir*1.8));}
 if(state.restartType==='FREE KICK'){restartTeam.filter(p=>!p.red&&p.role!=='GK').slice(0,5).forEach((p,i)=>p.mesh.position.lerp(state.restartSpot.clone().add(new THREE.Vector3((i-2)*1.3,0,dir*3)),.7));}

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
function goalkeeperAI(team,dt){
 const g=team.find(p=>p.role==='GK'&&!p.red);if(!g)return;
 const danger=Math.abs(ball.position.z-goalZ(g))<9&&Math.abs(ball.position.x)<7;
 if(!danger)return;
 const goalLine=team===homeTeam?L/2:-L/2;
 const shooter=team===homeTeam?awayTeam:homeTeam;
 const dangerPlayer=nearest(shooter);
 const targetX=THREE.MathUtils.clamp(ball.position.x,-6,6);
 const shotBias=ballVel.length()>7?THREE.MathUtils.clamp(ballVel.x*.08,-1.8,1.8):0;
 g.mesh.position.x=THREE.MathUtils.lerp(g.mesh.position.x,targetX+shotBias,Math.min(1,dt*7));
 g.mesh.position.z=THREE.MathUtils.lerp(g.mesh.position.z,goalLine+(team===homeTeam?-1.8:1.8),Math.min(1,dt*6));
 if(d2(g.mesh.position,ball.position)<3.5&&ballVel.length()>10){
  g.vel.x=(ballVel.x>0?1:-1)*5;
 }
 if(d2(g.mesh.position,ball.position)<2.8&&ball.position.y<3.2&&g.cooldown<=0){
   g.cooldown=.55;
   const reach=Math.abs(ball.position.x-g.mesh.position.x);const dive=reach>1.0||ball.position.y>1.5;
   const catchBall=!dive&&ball.position.y<1.15 && ballVel.length()<11 && Math.random()<.58;
   if(catchBall){
    ball.position.copy(g.mesh.position);ball.position.y=1.15;ballVel.set(0,0,0);
    state.lastTouch=team===homeTeam?'HOME':'AWAY';
    comment(team===homeTeam?'Goalkeeper catches it.':'Keeper gathers the ball.',true);
   }else{
    const clear=new THREE.Vector3((ball.position.x-g.mesh.position.x)*1.2,ball.position.y>1.5?2.2:0,team===homeTeam?-1:1);
    ballVel.copy(clear.normalize().multiplyScalar(dive?11.5:9.5));
    state.lastTouch=team===homeTeam?'HOME':'AWAY';
    comment(team===homeTeam?'Goalkeeper parries it away!':'Goalkeeper makes the save!',true);
   }
 }
}

function goalkeeperReaction(team){
 const g=team.find(p=>p.role==='GK'&&!p.red);if(!g)return;
 if(d2(g.mesh.position,ball.position)<1.55&&ball.position.y<2.8&&ballVel.length()>6){
  const toward=ballVel.clone();toward.y=0;
  const side=new THREE.Vector3(-toward.z,0,toward.x).normalize();
  const parry=side.multiplyScalar((Math.random()-.5)*5).add(toward.normalize().multiplyScalar(-3));
  ballVel.lerp(parry,.65);ball.position.y=Math.max(.5,ball.position.y);
 }
}

function aerialContact(){
 const all=[...homeTeam,...awayTeam].filter(p=>!p.red);
 if(ball.position.y<1.05||ballVel.length()<2)return;
 for(const p of all){
  if(d2(p.mesh.position,ball.position)<1.15){
   const towardGoal=forwardFor(p);
   const target=goalZ(p);
   const aim=new THREE.Vector3((Math.random()-.5)*2.2,0,target).sub(ball.position);
   aim.y=0;
   if(ball.position.y>1.25){
    ballVel.copy(aim.normalize().multiplyScalar(Math.min(10,Math.max(5,ballVel.length()+2))));
    ballVel.y=Math.min(2.8,Math.max(.8,ballVel.y*.25));
    state.lastTouch=p.home?'HOME':'AWAY';
    comment(p.home?'Header!':'Away wins the aerial ball.');
    return;
   }
  }
 }
}

function playerCollisions(){
 const all=[...homeTeam,...awayTeam].filter(p=>!p.red);
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const a=all[i],b=all[j],dx=a.mesh.position.x-b.mesh.position.x,dz=a.mesh.position.z-b.mesh.position.z,d=Math.hypot(dx,dz);
  if(d>0&&d<1.0){const push=(1-d)/2; a.mesh.position.x+=dx/d*push;a.mesh.position.z+=dz/d*push;b.mesh.position.x-=dx/d*push;b.mesh.position.z-=dz/d*push;clampField(a);clampField(b)}
 }
}

function animatePlayers(dt){
 const all=[...homeTeam,...awayTeam];
 for(const p of all){
  const moving=p.vel.length();
  const phase=performance.now()*.012 + p.number*.7;
  const stride=Math.sin(phase)*Math.min(.18,moving*.025);
  if(p.mesh.children.length>=10){
   p.mesh.children[4].rotation.x=stride; p.mesh.children[5].rotation.x=-stride;
   p.mesh.children[8].rotation.x=-stride; p.mesh.children[9].rotation.x=stride;
  }
  p.mesh.position.y=Math.max(0,Math.sin(phase*2)*Math.min(.035,moving*.006));
 }
}

function ballPhysics(dt){
 ball.position.addScaledVector(ballVel,dt);
 ballVel.multiplyScalar(Math.pow(ball.position.y>.55?.72:.34,dt));
 if(Math.abs(shotCurve)>0.01){const curveAxis=new THREE.Vector3(-ballVel.z,0,ballVel.x);if(curveAxis.lengthSq()>0.01)ballVel.addScaledVector(curveAxis.normalize(),shotCurve*dt);shotCurve*=Math.pow(.18,dt);}
 if(controlledTouch>0)controlledTouch-=dt;
 if(Math.abs(ballVel.x)+Math.abs(ballVel.z)<.15)ballVel.multiplyScalar(.5);
 ball.rotation.x+=ballVel.z*dt;ball.rotation.z-=ballVel.x*dt;
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

let subTimer=0;
function updateClock(dt){
 const rate=15;state.seconds+=dt*rate;subTimer+=dt;
 if(state.seconds>=60){state.seconds-=60;state.minute++}
 if(subTimer>8){subTimer=0;substitutions(homeTeam);substitutions(awayTeam)}
 if(state.minute>=45&&state.half===1){state.half=2;state.minute=45;state.seconds=0;document.getElementById('statusText').textContent='HALF-TIME';comment('HALF-TIME. Teams change ends.',true);state.kickoff=true;state.kickoffDelay=2.5;state.restartType='KICKOFF';state.restartTeam='AWAY';homeTeam.forEach(p=>{p.base.z*=-1});awayTeam.forEach(p=>{p.base.z*=-1});resetTeams();}
 if(state.minute>=90&&state.half===2&&!state.halfEnded){state.halfEnded=true;state.stoppage=matchStoppage();comment('90 minutes. Stoppage time: +'+state.stoppage+'.',true)}
 if(state.half===2&&state.minute>=90+state.stoppage){state.over=true;finish()}
 const shownMinute=state.half===2?state.minute:Math.min(45,state.minute);document.getElementById('timer').textContent=String(shownMinute).padStart(2,'0')+':'+String(Math.floor(state.seconds)).padStart(2,'0');
 document.getElementById('halfLabel').textContent=state.half===1?'1ST HALF':'2ND HALF';
}
function finish(){
 document.getElementById('finalHome').textContent=state.score[0];document.getElementById('finalAway').textContent=state.score[1];
 document.getElementById('resultTitle').textContent='FULL TIME';const total=state.possession.HOME+state.possession.AWAY;const hp=total?Math.round(state.possession.HOME/total*100):50;
 document.getElementById('resultText').textContent=state.score[0]+' - '+state.score[1]+' · '+(90+state.stoppage)+' minutes · Possession '+hp+'% - '+(100-hp)+'%';
 document.getElementById('resultOverlay').classList.remove('hidden');
}
function togglePause(){if(state.over)return;state.paused=!state.paused;document.getElementById('pauseOverlay').classList.toggle('hidden',!state.paused)}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

function action(code){if(code==='Space')shoot(me);if(code==='KeyE')pass(me);if(code==='KeyC')cross(me);if(code==='KeyF'){if(held.has('ShiftLeft')||held.has('ShiftRight')||touchSprint)slideTackle(me);else tackle(me)}if(code==='KeyQ')switchPlayer();if(code==='KeyP')togglePause();if(code==='KeyR')shielding=!shielding;}
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!held.has(e.code))action(e.code);held.add(e.code)});
addEventListener('keyup',e=>held.delete(e.code));
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();held.add(k);if(['Space','KeyE','KeyF','KeyQ'].includes(k))action(k)});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>held.delete(k)))}); 
document.getElementById('shootMobile').onpointerdown=()=>shoot(me);
document.getElementById('passMobile').onpointerdown=()=>pass(me);
document.getElementById('tackleMobile').onpointerdown=()=>tackle(me);
document.getElementById('sprintMobile').onpointerdown=()=>touchSprint=true;
document.getElementById('sprintMobile').onpointerup=()=>touchSprint=false;
const crossMobile=document.getElementById('crossMobile');if(crossMobile)crossMobile.onpointerdown=()=>cross(me);
const shieldMobile=document.getElementById('shieldMobile');if(shieldMobile){shieldMobile.onpointerdown=()=>shielding=true;shieldMobile.onpointerup=()=>shielding=false;shieldMobile.onpointercancel=()=>shielding=false;}
canvas.addEventListener('pointerdown',e=>{if(e.target===canvas)shoot(me);});
document.getElementById('pauseBtn').onclick=togglePause;document.getElementById('resumeBtn').onclick=togglePause;document.getElementById('restartBtn').onclick=()=>location.reload();

function drawRadar(){
 const r=document.getElementById('radar');if(!r)return;
 const ctx=r.getContext('2d'),w=r.width,h=r.height;ctx.clearRect(0,0,w,h);
 ctx.fillStyle='rgba(5,25,14,.82)';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;ctx.strokeRect(8,8,w-16,h-16);
 ctx.beginPath();ctx.moveTo(w/2,8);ctx.lineTo(w/2,h-8);ctx.stroke();ctx.beginPath();ctx.arc(w/2,h/2,18,0,Math.PI*2);ctx.stroke();
 const px=x=>8+(THREE.MathUtils.clamp(x,-W/2,W/2)+W/2)/(W)*(w-16);
 const pz=z=>8+(THREE.MathUtils.clamp(z,-L/2,L/2)+L/2)/(L)*(h-16);
 const dot=(x,z,fill,r)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.arc(px(x),pz(z),r,0,Math.PI*2);ctx.fill()};
 homeTeam.filter(p=>!p.red).forEach(p=>dot(p.mesh.position.x,p.mesh.position.z,p===me?'#ffffff':'#37a9ff',p===me?4:2.8));
 awayTeam.filter(p=>!p.red).forEach(p=>dot(p.mesh.position.x,p.mesh.position.z,'#ff4b55',2.8));
 dot(ball.position.x,ball.position.z,'#ffd84d',3.2);
}

function loop(){
 requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);
 if(!state.paused&&!state.over){
  if(state.kickoff){state.kickoffDelay=Math.max(0,state.kickoffDelay-dt);if(state.kickoffDelay===0){restartPlay()}}else{
   updateClock(dt);
   homeTeam.forEach(p=>{p.cooldown=Math.max(0,p.cooldown-dt);p.tackleCooldown=Math.max(0,p.tackleCooldown-dt)});
   awayTeam.forEach(p=>{p.cooldown=Math.max(0,p.cooldown-dt);p.tackleCooldown=Math.max(0,p.tackleCooldown-dt)});
   moveUser(dt);
   aiTeam(homeTeam,dt);aiTeam(awayTeam,dt);looseBallRace(homeTeam,dt);looseBallRace(awayTeam,dt);
   defensiveMarking(homeTeam,dt);defensiveMarking(awayTeam,dt);supportRuns(homeTeam,dt);supportRuns(awayTeam,dt);interceptAI(homeTeam,dt);interceptAI(awayTeam,dt);
   goalkeeperAI(homeTeam,dt);goalkeeperAI(awayTeam,dt);goalkeeperReaction(homeTeam);goalkeeperReaction(awayTeam);
   playerCollisions();
   aerialContact();
   animatePlayers(dt);
   updateOfficials(dt);
   ballPhysics(dt);
  }
  if(state.messageTimer>0)state.messageTimer-=dt;
  updateMatchStats(dt);
  drawRadar();
  if(!state.kickoff&&state.messageTimer<=0)document.getElementById('statusText').textContent='HOME '+me.role+' #'+me.number;
 }
 const activePos=me.mesh.position.clone();activePos.y=0;
 const focus=ball.position.clone().lerp(activePos,.22),landscape=innerWidth/innerHeight>1.15,portrait=innerWidth<700;
 const attacking=Math.abs(ball.position.z)>14,fast=ballVel.length()>10;
 const camY=portrait?34:landscape?(attacking?27:29):32,camZ=portrait?27:landscape?(fast?23:25):28;
 camera.position.lerp(new THREE.Vector3(focus.x*.1,camY,camZ+focus.z*.08),Math.min(1,dt*2.2));camera.lookAt(focus.x*.1,0,focus.z*.08);
 renderer.render(scene,camera);
}
setActive(activeIndex);scoreUI();state.restartSpot.set(0,.43,0);document.getElementById('statusText').textContent='KICK-OFF';
setTimeout(()=>document.body.classList.add('ready'),600);
loop();
