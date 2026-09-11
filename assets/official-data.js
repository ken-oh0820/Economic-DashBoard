(function(root){
  let snapshot={series:{}},pending=null,checked=0,failed=false;
  const allowed=new Set(['CPIAUCSL','CPILFESL','PPIFIS','WPSFD49116','UNRATE','PAYEMS','CES0500000003','GDP','GDPC1','PCEPI','GDPDEF','FEDFUNDS','DGS3MO','DGS1','DGS2','DGS5','DGS10','DGS20','DGS30','T10Y3M']);
  async function load(){
    if(pending)return pending;
    if(Date.now()-checked<300000)return snapshot;
    pending=(async()=>{
      try{
        const response=await fetch('data/official-data.json?v='+Math.floor(Date.now()/300000),{signal:AbortSignal.timeout(12000)});
        if(!response.ok)throw Error('snapshot unavailable');
        const data=await response.json();
        if(data.schemaVersion!==1||!data.series||!Number.isFinite(Date.parse(data.updatedAt)))throw Error('invalid snapshot');
        const series={};
        for(const [id,item] of Object.entries(data.series)){
          if(!allowed.has(id)||!Array.isArray(item.points)||item.rights!=='Public Domain: Citation Requested')continue;
          const points=item.points.filter(p=>/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&Number.isFinite(p.value)).sort((a,b)=>a.date.localeCompare(b.date));
          if(points.length>1)series[id]={...item,points};
        }
        snapshot={...data,series};failed=false;
      }catch{failed=true;}
      checked=Date.now();return snapshot;
    })().finally(()=>{pending=null;});
    return pending;
  }
  function get(cfg){return snapshot.series[cfg?.fallbackFred||cfg?.series]||null;}
  function source(item){
    const stale=failed||item.status!=='ok'||Date.now()-Date.parse(item.fetchedAt)>86400000;
    return item.source+(stale?' · 갱신 지연':'');
  }
  function monthBefore(date,months){
    const d=new Date(date+'T00:00:00Z'),day=d.getUTCDate();
    d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-months);
    const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
    d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);
  }
  function periodPoint(points,date,months){const target=monthBefore(date,months);return points.find(p=>p.date===target);}
  function bondChanges(points){
    const last=points.at(-1),prev=points.at(-2),target=monthBefore(last.date,1);
    const month=points.filter(p=>p.date<=target).at(-1);
    const validMonth=month&&Date.parse(target)-Date.parse(month.date)<=7*86400000;
    return {last,prev,month:validMonth?month:null,day:prev?last.value-prev.value:null,monthly:validMonth?last.value-month.value:null};
  }
  function chart(cfg,range){
    const item=get(cfg);if(!item)return null;
    const all=item.points.map(p=>{
      let value=p.value;
      if(cfg.transform){
        const prev=periodPoint(item.points,p.date,cfg.transform==='yoy'?12:cfg.transform==='change'?1:3);
        value=cfg.transform==='change'?(prev?value-prev.value:NaN):prev&&prev.value!==0?(cfg.transform==='yoy'?(value/prev.value-1)*100:(Math.pow(value/prev.value,4)-1)*100):NaN;
      }
      return {t:Date.parse(p.date),v:value*(cfg.scale??1)};
    }).filter(p=>Number.isFinite(p.v));
    const last=all.at(-1);if(!last)return null;
    const months=range==='1y'?12:range==='3mo'?3:1;
    // Monthly/quarterly data need several observations even in short-range views.
    const minimum=item.frequency==='quarterly'?12:item.frequency==='monthly'?3:months;
    const cutoff=Date.parse(monthBefore(new Date(last.t).toISOString().slice(0,10),Math.max(months,minimum)));
    return {points:all.filter(p=>p.t>=cutoff),source:source(item)+' · 기준 '+new Date(last.t).toISOString().slice(0,10),rangeLabel:Math.max(months,minimum)+'개월 (최근 관측 기준)'};
  }
  root.OfficialData={load,get,source,monthBefore,periodPoint,bondChanges,chart};
})(globalThis);
