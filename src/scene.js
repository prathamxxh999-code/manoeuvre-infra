import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const host=document.getElementById('hero-scene');
const canvas=document.getElementById('brand-scene');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

if(host&&canvas){
  try{
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.autoClear=false;
    const scene=new THREE.Scene();
    const backgroundScene=new THREE.Scene();
    const veilScene=new THREE.Scene();
    const veilCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);veilCamera.position.z=1;
    veilScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({color:0xf4f5f5,transparent:true,opacity:.1,depthTest:false,depthWrite:false,toneMapped:false})));
    const backgroundCamera=new THREE.OrthographicCamera(-8,8,5,-5,.1,80);
    backgroundCamera.position.set(7,6,14);backgroundCamera.lookAt(0,1.6,-4);
    backgroundScene.add(new THREE.HemisphereLight(0xffffff,0xa8c2d7,2));
    const cityLight=new THREE.DirectionalLight(0xffffff,2.8);cityLight.position.set(-6,10,5);backgroundScene.add(cityLight);
    let sceneWidth=1,sceneHeight=1,logoViewport={x:0,y:0,width:1,height:1};
    // Widen the logo camera slightly for about 15% more breathing room.
    const camera=new THREE.PerspectiveCamera(39.5,1,.1,60);
    camera.position.set(4.5,3.5,8.2);
    camera.lookAt(0,2,0);
    const environment=new RoomEnvironment();
    const pmrem=new THREE.PMREMGenerator(renderer);
    const env=pmrem.fromScene(environment,.03);
    scene.environment=env.texture;
    environment.dispose();
    pmrem.dispose();
    const ambient=new THREE.HemisphereLight(0xffffff,0xb9c7d1,.8);
    scene.add(ambient);
    const key=new THREE.DirectionalLight(0xffffff,3.5);
    key.position.set(-3,8,5);key.castShadow=true;
    const shadowSize=matchMedia('(max-width:700px)').matches?1024:2048;
    key.shadow.mapSize.set(shadowSize,shadowSize);
    key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=8;key.shadow.camera.bottom=-5;
    key.shadow.normalBias=.025;key.shadow.bias=-.0001;key.shadow.radius=5;
    scene.add(key);
    const rim=new THREE.DirectionalLight(0xa6e4f3,3.2);rim.position.set(5,4,-4);scene.add(rim);
    const fill=new THREE.DirectionalLight(0xe8f2ff,2.1);fill.position.set(-5,2,-1);scene.add(fill);
    const metal=new THREE.MeshPhysicalMaterial({color:0xb7c9ce,metalness:.94,roughness:.25,clearcoat:.6,clearcoatRoughness:.16});
    const enamel=new THREE.MeshPhysicalMaterial({color:0x075d89,metalness:.8,roughness:.19,clearcoat:1,clearcoatRoughness:.1});
    const darkMetal=new THREE.MeshPhysicalMaterial({color:0x173b59,metalness:.85,roughness:.3});
    const brightMetal=new THREE.MeshPhysicalMaterial({color:0xe4eeee,metalness:.9,roughness:.2});
    const sculpture=new THREE.Group();
    scene.add(sculpture);
    // A looping construction study: floor frames assemble while a crane places slabs.
    const city=new THREE.Group();
    const blueprintMaterial=new THREE.LineBasicMaterial({color:0x397da2,transparent:true,opacity:.15,depthWrite:false});
    const guideMaterial=new THREE.LineBasicMaterial({color:0x608ca6,transparent:true,opacity:.035,depthWrite:false});
    const line=(points,material=blueprintMaterial)=>new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),material);
    const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*(3-2*p);};
    const mix=(a,b,p)=>a+(b-a)*ease(p);
    const cycleLength=43.2,deliveryTime=4.8;
    const cityTowers=[];
    const towerSpecs=[[-7.5,2.3,-3.5,1.1,1],[-3.8,4.3,-6,.85,.95],[-5.8,3.1,-4,1,.9],[2.5,3.9,-6,.85,1.05],[5.5,2.8,-3,1.1,1],[7.5,4.7,-7,1,1.2],[1.1,2.1,-7,1.1,.9],[-1.8,1.6,-2,1.2,1.1],[.4,1.2,1,1.5,1.1]];
    towerSpecs.forEach(([x,h,z,w,d],index)=>{
      const group=new THREE.Group();
      const box=new THREE.BoxGeometry(w,h,d);
      const material=blueprintMaterial.clone();
      const concrete=new THREE.MeshStandardMaterial({color:0xc3d5e3,roughness:.82,metalness:.05,transparent:true,opacity:.72});
      const glass=new THREE.MeshStandardMaterial({color:0x84b4d2,roughness:.28,metalness:.25,transparent:true,opacity:.4});
      const floorCount=index===1?8:Math.ceil(h/.45),step=h/floorCount,layers=[];
      const frameBox=new THREE.BoxGeometry(w,step,d);frameBox.translate(0,step/2,0);
      const frameGeometry=new THREE.EdgesGeometry(frameBox);frameBox.dispose();
      const slabGeometry=new THREE.BoxGeometry(w+.07,.065,d+.07);slabGeometry.translate(0,step,0);
      const columnGeometry=new THREE.BoxGeometry(.065,step,.065);columnGeometry.translate(0,step/2,0);
      const glassGeometry=new THREE.BoxGeometry(w-.12,step-.08,d-.12);glassGeometry.translate(0,step/2,0);
      for(let floor=0;floor<floorCount;floor++){
        const frame=new THREE.Group();frame.position.y=floor*step;
        frame.add(new THREE.Mesh(slabGeometry,concrete));
        for(const cx of [-1,1])for(const cz of [-1,1]){const column=new THREE.Mesh(columnGeometry,concrete);column.position.set(cx*(w/2-.04),0,cz*(d/2-.04));frame.add(column);}
        const facade=new THREE.Mesh(glassGeometry,glass);facade.visible=false;frame.add(facade);frame.userData.facade=facade;
        group.add(frame);layers.push(frame);
      }
      const foundation=new THREE.Mesh(new THREE.BoxGeometry(w+.22,.08,d+.22),concrete);foundation.position.y=-.035;group.add(foundation);
      const scanMaterial=new THREE.LineBasicMaterial({color:0x2797c2,transparent:true,opacity:.3,depthWrite:false});
      const scan=line([[-w/2,0,d/2],[w/2,0,d/2],[w/2,0,d/2],[w/2,0,-d/2],[w/2,0,-d/2],[-w/2,0,-d/2],[-w/2,0,-d/2],[-w/2,0,d/2]],scanMaterial);group.add(scan);
      group.position.set(x,0,z);group.userData={index,h,step,floorCount,layers,material,concrete,glass,scan};cityTowers.push(group);city.add(group);box.dispose();frameGeometry.dispose();
    });
    const crane=new THREE.Group();
    crane.position.set(-4.6,0,-6);
    const craneMaterial=new THREE.LineBasicMaterial({color:0x36779b,transparent:true,opacity:.27,depthWrite:false});
    const cranePoints=[[-.09,0,0],[-.09,5.6,0],[.09,0,0],[.09,5.6,0],[-.9,5.25,0],[3.3,5.25,0],[-.9,5.43,0],[3.3,5.43,0],[-.9,5.25,0],[0,5.85,0],[0,5.85,0],[3.3,5.25,0]];
    for(let y=.15;y<5.3;y+=.28)cranePoints.push([-.09,y,0],[.09,y+.25,0],[.09,y+.25,0],[-.09,y+.25,0]);
    for(let x=-.9;x<3.2;x+=.3)cranePoints.push([x,5.25,0],[x+.3,5.43,0],[x+.3,5.43,0],[x+.3,5.25,0]);
    const craneSolid=new THREE.MeshStandardMaterial({color:0x729dbb,roughness:.65,metalness:.12,transparent:true,opacity:.7});
    const beamGeometry=new THREE.CylinderGeometry(.022,.022,1,5);
    const craneBeams=new THREE.InstancedMesh(beamGeometry,craneSolid,cranePoints.length/2);
    const beamTransform=new THREE.Object3D(),axis=new THREE.Vector3(0,1,0);
    for(let i=0;i<cranePoints.length;i+=2){const a=new THREE.Vector3(...cranePoints[i]),b=new THREE.Vector3(...cranePoints[i+1]),delta=b.clone().sub(a);beamTransform.position.copy(a).add(b).multiplyScalar(.5);beamTransform.scale.set(1,delta.length(),1);beamTransform.quaternion.setFromUnitVectors(axis,delta.normalize());beamTransform.updateMatrix();craneBeams.setMatrixAt(i/2,beamTransform.matrix);}
    craneBeams.instanceMatrix.needsUpdate=true;crane.add(craneBeams);
    const trolley=new THREE.Group();trolley.position.y=5.25;crane.add(trolley);
    const trolleyBox=new THREE.BoxGeometry(.2,.12,.18);
    trolley.add(new THREE.Mesh(trolleyBox,craneSolid));
    const cableGeometry=new THREE.CylinderGeometry(.011,.011,1,5);cableGeometry.translate(0,-.5,0);
    const cable=new THREE.Mesh(cableGeometry,craneSolid);trolley.add(cable);
    const hook=line([[0,0,0],[.055,-.065,0],[.055,-.065,0],[0,-.11,0],[0,-.11,0],[-.045,-.075,0]],craneMaterial);trolley.add(hook);
    const load=new THREE.Group();
    const slabBox=new THREE.BoxGeometry(.85,.07,.95);
    load.add(new THREE.Mesh(slabBox,new THREE.MeshStandardMaterial({color:0xadc8db,roughness:.8,transparent:true,opacity:.8})));
    load.add(line([[-.3,0,.3],[0,.28,0],[.3,0,.3],[0,.28,0],[-.3,0,-.3],[0,.28,0],[.3,0,-.3],[0,.28,0]],craneMaterial));crane.add(load);
    city.add(crane);backgroundScene.add(city);
    function updateConstruction(time){
      const cycle=time%cycleLength;
      const delivery=Math.min(7,Math.floor(cycle/deliveryTime));
      const u=cycle<38.4?(cycle/deliveryTime)%1:1;
      const resetFade=1-ease((cycle-40.8)/2.4);
      cityTowers.forEach(tower=>{
        const {index,h,step,floorCount,layers,material,concrete,glass,scan}=tower.userData;
        const phase=(time+index*5.3)%32;
        const amount=reduced?floorCount:index===1?(cycle>=38.4?8:delivery+ease((u-.64)/.16)):Math.min(floorCount,phase/23*floorCount);
        const fade=reduced?1:index===1?resetFade:1-ease((phase-28)/4);
        material.opacity=.15*fade;
        concrete.opacity=.72*fade;glass.opacity=.38*fade;
        layers.forEach((frame,i)=>{const fraction=Math.max(0,Math.min(1,amount-i));frame.visible=fraction>0;frame.scale.y=Math.max(.001,fraction);frame.userData.facade.visible=reduced||amount>i+2;});
        scan.position.y=Math.min(h,amount*step);scan.material.opacity=reduced?0:.2*fade*(amount<floorCount?1:.4);
      });
      const targetHeight=(delivery+1)*(4.3/8);
      const pickup=2.65,drop=.8,travelHeight=4.65;
      let trolleyX=pickup,slabY=.12,hookY=travelHeight+.28;
      if(u<.16){hookY=mix(travelHeight+.28,.4,u/.16);}
      else if(u<.38){slabY=mix(.12,travelHeight,(u-.16)/.22);hookY=slabY+.28;}
      else if(u<.64){trolleyX=mix(pickup,drop,(u-.38)/.26);slabY=travelHeight;hookY=slabY+.28;}
      else if(u<.8){trolleyX=drop;slabY=mix(travelHeight,targetHeight,(u-.64)/.16);hookY=slabY+.28;}
      else if(u<.88){trolleyX=drop;hookY=mix(targetHeight+.28,travelHeight+.28,(u-.8)/.08);}
      else{trolleyX=mix(drop,pickup,(u-.88)/.12);}
      trolley.position.x=trolleyX;
      cable.scale.y=5.25-hookY;hook.position.y=-cable.scale.y;
      load.position.set(trolleyX,slabY,0);load.visible=!reduced&&u<.8&&cycle<38.4;
      craneMaterial.opacity=.21*(reduced?1:resetFade*ease(cycle/.5));
      craneSolid.opacity=.7*(reduced?1:resetFade*ease(cycle/.5));
      if(reduced){trolley.position.x=drop;cable.scale.y=.6;hook.position.y=-.6;}
    }
    const blueprintGrid=new THREE.GridHelper(45,60,0x6f8da7,0x8da2b5);
    blueprintGrid.material.transparent=true;blueprintGrid.material.opacity=.065;blueprintGrid.material.depthWrite=false;blueprintGrid.position.set(0,-.11,-3);backgroundScene.add(blueprintGrid);
    const shapes=[
      {points:[[-1.8,0],[-1.8,4.25],[-.85,3.45],[-.85,0]],min:-1.8,max:-.85,height:x=>4.25-(x+1.8)/.95*.8},
      {points:[[-.45,0],[-.45,2.95],[0,2.55],[.45,2.95],[.45,0]],min:-.45,max:.45,height:x=>2.55+Math.abs(x)/.45*.4},
      {points:[[.85,0],[.85,3.45],[1.8,4.25],[1.8,0]],min:.85,max:1.8,height:x=>3.45+(x-.85)/.95*.8}
    ];
    const pieces=[];
    shapes.forEach((spec,index)=>{
      const piece=new THREE.Group();
      const shape=new THREE.Shape();
      spec.points.forEach(([x,y],i)=>i===0?shape.moveTo(x,y):shape.lineTo(x,y));shape.closePath();
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:.67,bevelEnabled:true,bevelThickness:.075,bevelSize:.045,bevelSegments:4,curveSegments:8,steps:1});
      geometry.translate(0,0,-.335);
      const mesh=new THREE.Mesh(geometry,[enamel,metal]);mesh.castShadow=true;mesh.receiveShadow=true;piece.add(mesh);
      // Fine metallic ribs give the mark the material detail of an architectural model.
      const count=index===1?9:10;
      for(let i=1;i<count;i++){
        const x=spec.min+(spec.max-spec.min)*i/count;
        const h=spec.height(x)-.14;
        const rib=new THREE.Mesh(new THREE.BoxGeometry(.013,h,.045),brightMetal);
        rib.position.set(x,h/2+.045,.435);rib.castShadow=true;piece.add(rib);
        const backRib=rib.clone();backRib.position.z=-1.265;piece.add(backRib);
      }
      const rear=new THREE.Mesh(geometry,darkMetal);rear.position.z=-.83;rear.castShadow=true;piece.add(rear);
      for(const y of [.25,1.05,2.0]){
        const strut=new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.9),metal);
        strut.position.set((spec.min+spec.max)/2,y,-.47);strut.castShadow=true;piece.add(strut);
      }
      pieces.push(piece);sculpture.add(piece);
    });
    sculpture.rotation.set(0,-.4,0);
    sculpture.position.y=.34;
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.12,color:0x233e57}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
    let progress=0,smoothProgress=0,visible=true,running=false,lastFrame=0,frameInterval=1000/60;
    const clock=new THREE.Clock();
    function resize(){
      const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
      sceneWidth=width;sceneHeight=height;
      frameInterval=1000/(width<=700?30:60);
      renderer.setPixelRatio(Math.min(devicePixelRatio,width<=700?1.25:1.6));
      renderer.setSize(width,height,false);
      const frame=width<=600?{left:.08,top:.34,width:.97,height:.52}:width<=900?{left:.41,top:.18,width:.69,height:.8}:{left:.555,top:.03,width:.5,height:.9};
      logoViewport={x:width*frame.left,y:height*(1-frame.top-frame.height),width:width*frame.width,height:height*frame.height};
      camera.aspect=logoViewport.width/logoViewport.height;camera.position.set(5.2,3.8,camera.aspect<.9?11.4:10.6);camera.lookAt(0,2.15,0);camera.updateProjectionMatrix();
      const halfHeight=5.1,aspect=width/height;backgroundCamera.left=-halfHeight*aspect;backgroundCamera.right=halfHeight*aspect;backgroundCamera.top=halfHeight;backgroundCamera.bottom=-halfHeight;backgroundCamera.updateProjectionMatrix();
      if(reduced)render();
    }
    function render(){
      const t=clock.getElapsedTime();
      smoothProgress+=(progress-smoothProgress)*.045;
      sculpture.rotation.y=-.4+smoothProgress*.9+(reduced?0:t*Math.PI*2/60);
      sculpture.rotation.x=0;
      sculpture.rotation.z=0;
      sculpture.position.y=.34;
      updateConstruction(reduced?0:t);
      renderer.setScissorTest(false);renderer.setViewport(0,0,sceneWidth,sceneHeight);renderer.clear();
      renderer.render(backgroundScene,backgroundCamera);renderer.render(veilScene,veilCamera);renderer.clearDepth();
      const v=logoViewport;renderer.setViewport(v.x,v.y,v.width,v.height);renderer.setScissor(v.x,v.y,v.width,v.height);renderer.setScissorTest(true);
      renderer.render(scene,camera);
      renderer.setScissorTest(false);
    }
    function animate(now){if(!visible||document.hidden){running=false;return;}if(now-lastFrame>=frameInterval){render();lastFrame=now;}requestAnimationFrame(animate);}
    function start(){if(running||reduced)return;running=true;requestAnimationFrame(animate);}
    window.addEventListener('site:hero-progress',ev=>{progress=ev.detail;if(reduced)render();});
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();},{rootMargin:'100px'});observer.observe(host);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});
    new ResizeObserver(resize).observe(host);
    resize();render();host.classList.add('scene-ready');
    if(!reduced)start();
  }catch(error){
    host.classList.add('scene-fallback-active');
    const hint=host.querySelector('.scene-hint');if(hint)hint.hidden=true;
    console.warn('The 3D view is unavailable. The architectural image remains visible.');
  }
}
