(() => {
  class AudioEngine {
    constructor() {
      this.ctx = null; this.master = null; this.nodes = null; this.genome = null;
      this.started = false; this.timer = null;
    }
    async start() {
      if (!this.ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) throw new Error("Este navegador não oferece Web Audio API.");
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = .0001;
        this.master.connect(this.ctx.destination);
      }
      await this.ctx.resume();
      this.started = true;
      if (!this.nodes) this.setGenome(window.EchoGenome.defaults(), .7);
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(.22, this.ctx.currentTime, .12);
    }
    makeVoice(g, destination, fade=0) {
      const c=this.ctx, now=c.currentTime, out=c.createGain();
      out.gain.setValueAtTime(.0001,now); out.gain.setTargetAtTime(.55,now+.02,.15);
      const osc=c.createOscillator(), sub=c.createOscillator(), wobble=c.createOscillator(), wobbleGain=c.createGain();
      osc.type='sawtooth'; osc.frequency.value=g.fundamental;
      sub.type='triangle'; sub.frequency.value=g.fundamental*.501;
      wobble.type='sine'; wobble.frequency.value=g.motion;
      wobbleGain.gain.value=g.fundamental*(.004+g.vibrato*.009);
      wobble.connect(wobbleGain); wobbleGain.connect(osc.frequency);
      const filter=c.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=900+g.formantB*.55; filter.Q.value=1.5+g.roughness*9;
      const f1=c.createBiquadFilter(); f1.type='peaking'; f1.frequency.value=g.formantA; f1.Q.value=2.2; f1.gain.value=7;
      const f2=c.createBiquadFilter(); f2.type='peaking'; f2.frequency.value=g.formantB; f2.Q.value=3; f2.gain.value=5;
      const airGain=c.createGain(); airGain.gain.value=g.air*.5;
      const buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate), data=buffer.getChannelData(0);
      let last=0; for(let i=0;i<data.length;i++){const white=Math.random()*2-1; last=.82*last+.18*white; data[i]=white*.65+last*.35;}
      const noise=c.createBufferSource(); noise.buffer=buffer; noise.loop=true;
      const noiseFilter=c.createBiquadFilter(); noiseFilter.type='bandpass'; noiseFilter.frequency.value=g.formantA*1.7; noiseFilter.Q.value=1.1;
      const pulse=c.createOscillator(), pulseGain=c.createGain(); pulse.type='sine'; pulse.frequency.value=g.breathRate;
      pulseGain.gain.value=.1+g.articulation*.22;
      pulse.connect(pulseGain); pulseGain.connect(out.gain);
      osc.connect(filter); sub.connect(filter); filter.connect(f1); f1.connect(f2); f2.connect(out);
      noise.connect(noiseFilter); noiseFilter.connect(airGain); airGain.connect(out);
      out.connect(destination);
      osc.start(); sub.start(); wobble.start(); noise.start(); pulse.start();
      return {out,osc,sub,wobble,wobbleGain,filter,f1,f2,airGain,noise,noiseFilter,pulse,pulseGain};
    }
    stopNodes(nodes, when=.35) {
      if(!nodes || !this.ctx) return;
      const now=this.ctx.currentTime;
      nodes.out.gain.cancelScheduledValues(now);
      nodes.out.gain.setTargetAtTime(.0001,now,when/4);
      setTimeout(()=>{Object.values(nodes).forEach(n=>{try{if(n.stop)n.stop();if(n.disconnect)n.disconnect();}catch(e){}})},when*1000+80);
    }
    setGenome(g, fade=.5) {
      this.genome={...g};
      if(!this.ctx || !this.started) return;
      const next=this.makeVoice(g,this.master);
      if(this.nodes) this.stopNodes(this.nodes,fade);
      this.nodes=next;
      const now=this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(.19,now,.15);
    }
    async stop() {
      if(!this.ctx) return;
      this.master.gain.setTargetAtTime(.0001,this.ctx.currentTime,.1);
      this.started=false;
    }
    getAnalyser() {
      if(!this.ctx) return null;
      if(!this.analyser){this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=2048;this.master.connect(this.analyser);}
      return this.analyser;
    }
  }
  window.EchoAudioEngine = AudioEngine;
})();