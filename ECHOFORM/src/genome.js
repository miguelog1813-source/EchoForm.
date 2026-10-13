(() => {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const defaults = () => ({
    fundamental: rand(75, 180),
    formantA: rand(280, 750),
    formantB: rand(900, 2200),
    air: rand(.05, .34),
    motion: rand(.15, 1.7),
    articulation: rand(.15, .8),
    vibrato: rand(.1, 1.8),
    breathRate: rand(.8, 4.2),
    roughness: rand(.02, .3),
    pulse: rand(.15, .8),
    seed: Math.random()
  });
  const mutate = (parent, rate=.24) => {
    const g = {...parent};
    const specs = {
      fundamental:[55,220], formantA:[220,900], formantB:[700,2800],
      air:[0,.55], motion:[.05,3], articulation:[0,1], vibrato:[0,3],
      breathRate:[.3,6], roughness:[0,.5], pulse:[.05,1]
    };
    for (const [key,[lo,hi]] of Object.entries(specs)) {
      if (Math.random() < rate) {
        const span = hi-lo;
        g[key] = clamp(g[key] + (Math.random()*2-1)*span*rate*.8, lo, hi);
      }
    }
    g.seed = Math.random();
    return g;
  };
  const crossover = (a,b) => {
    const child = {...a};
    for (const key of Object.keys(a)) if (Math.random()<.5) child[key]=b[key];
    return child;
  };
  const complexity = g => clamp((g.air*1.3 + g.motion/3 + g.articulation + g.roughness*1.2)/3.2,0,1);
  const variation = g => clamp((g.vibrato/3 + g.breathRate/6 + g.pulse)/3,0,1);
  window.EchoGenome = {defaults,mutate,crossover,complexity,variation,clamp};
})();