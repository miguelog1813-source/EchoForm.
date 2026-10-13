(() => {
  const $=id=>document.getElementById(id);
  const engine=new window.EchoAudioEngine();
  let genome=window.EchoGenome.defaults(), generation=1, autoTimer=null, specimen=1;
  const canvas=$('visualizer'), ctx=canvas.getContext('2d');
  let analyser=null, phase=0;
  const fmt=(n,d=0)=>Number(n).toFixed(d);
  function paintGenome(){
    $('specimenName').textContent='FORM-'+String(specimen).padStart(4,'0');
    $('generation').textContent=String(generation).padStart(3,'0');
    $('complexity').textContent=fmt(EchoGenome.complexity(genome),2);
    $('variation').textContent=fmt(EchoGenome.variation(genome),2);
    const traits=[
      ['fundamental',genome.fundamental+' Hz',genome.fundamental/220*100],
      ['formantA',Math.round(genome.formantA)+' Hz',genome.formantA/900*100],
      ['formantB',Math.round(genome.formantB)+' Hz',genome.formantB/2800*100],
      ['air',Math.round(genome.air*100)+'%',genome.air/.55*100],
      ['motion',fmt(genome.motion,1)+' Hz',genome.motion/3*100],
      ['articulation',fmt(genome.articulation,2),genome.articulation*100]
    ];
    traits.forEach(([id,val,p])=>{$(id).textContent=val;$(id+'Bar').style.width=Math.max(2,Math.min(100,p))+'%'});
    $('freqReadout').textContent=Math.round(genome.fundamental)+' Hz';
  }
  async function start(){
    try{await engine.start();analyser=engine.getAnalyser();$('statusDot').parentElement.classList.add('active');$('statusText').textContent='AUDIO ONLINE';$('livePill').textContent='SYNTH ACTIVE';$('livePill').classList.add('active');$('startBtn').innerHTML='<span class="play-icon">Ⅱ</span> Audio active';}
    catch(e){alert(e.message||'Não foi possível iniciar o áudio.');}
  }
  function evolve(){
    const rate=Number($('mutation').value)/100;
    genome=EchoGenome.mutate(genome,rate); generation++; specimen++;
    paintGenome(); engine.setGenome(genome,.4);
  }
  function randomize(){genome=EchoGenome.defaults();generation=1;specimen++;paintGenome();engine.setGenome(genome,.3)}
  function draw(){
    const w=canvas.clientWidth,h=canvas.clientHeight,dpr=window.devicePixelRatio||1;
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='#1c2330';ctx.lineWidth=1;
    for(let y=22;y<h;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    let arr=null;
    if(analyser){arr=new Uint8Array(analyser.frequencyBinCount);analyser.getByteTimeDomainData(arr)}
    ctx.beginPath();ctx.lineWidth=1.7;ctx.strokeStyle='#c5fa72';
    for(let x=0;x<w;x++){
      let y;
      if(arr){const i=Math.floor(x/w*arr.length);y=(arr[i]/255)*h*.68+h*.13}
      else y=h/2+Math.sin(x*.045+phase)*Math.sin(x*.011+phase*.5)*h*.19;
      if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();phase+=.025;requestAnimationFrame(draw);
  }
  function renderArchive(){
    const items=EchoStorage.read(), root=$('archive');root.innerHTML='';
    if(!items.length){root.innerHTML='<div class="empty-state">No snapshots yet. Save a sound you want to keep.</div>';return}
    items.forEach(item=>{
      const card=document.createElement('div');card.className='archive-card';
      const name=document.createElement('strong');name.textContent=item.name;
      const meta=document.createElement('small');meta.textContent='GEN '+String(item.generation).padStart(3,'0')+' · '+new Date(item.created).toLocaleDateString();
      const actions=document.createElement('div');actions.className='archive-actions';
      const load=document.createElement('button');load.textContent='LOAD';load.onclick=()=>{genome={...item.genome};generation=item.generation;specimen++;paintGenome();engine.setGenome(genome,.5)};
      const del=document.createElement('button');del.textContent='DELETE';del.onclick=()=>{EchoStorage.remove(item.id);renderArchive()};
      actions.append(load,del);card.append(name,meta,actions);root.append(card);
    });
  }
  $('startBtn').addEventListener('click',start);
  $('evolveBtn').addEventListener('click',()=>{if(!engine.started)start().then(evolve);else evolve()});
  $('randomBtn').addEventListener('click',randomize);
  $('mutation').addEventListener('input',e=>$('mutationValue').textContent=e.target.value+'%');
  $('evolveSpeed').addEventListener('input',e=>$('speedValue').textContent=e.target.value+' sec');
  $('autoBtn').addEventListener('click',async()=>{
    if(autoTimer){clearInterval(autoTimer);autoTimer=null;$('autoBtn').textContent='ENABLE AUTO';return}
    await start();autoTimer=setInterval(evolve,Number($('evolveSpeed').value)*1000);$('autoBtn').textContent='DISABLE AUTO';
  });
  $('saveBtn').addEventListener('click',()=>{EchoStorage.save(genome,generation);renderArchive();$('saveBtn').textContent='✓ Saved';setTimeout(()=>$('saveBtn').textContent='＋ Save snapshot',1000)});
  $('exportBtn').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({project:'ECHOFORM',version:1,generation,genome},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='echoform-genome.json';a.click();URL.revokeObjectURL(url);
  });
  $('clearBtn').addEventListener('click',()=>{if(confirm('Apagar todos os snapshots salvos neste navegador?')){EchoStorage.clear();renderArchive()}});
  window.addEventListener('resize',()=>{canvas.width=0});
  paintGenome();renderArchive();draw();
})();