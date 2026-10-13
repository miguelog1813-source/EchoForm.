(() => {
  const KEY='echoform-snapshots-v1';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
  function write(items){localStorage.setItem(KEY,JSON.stringify(items))}
  function save(genome, generation){
    const items=read(); const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:'FORM-'+String(generation).padStart(4,'0'),generation,created:new Date().toISOString(),genome:{...genome}};
    items.unshift(item); write(items.slice(0,30)); return item;
  }
  function remove(id){write(read().filter(x=>x.id!==id))}
  function clear(){localStorage.removeItem(KEY)}
  window.EchoStorage={read,save,remove,clear};
})();