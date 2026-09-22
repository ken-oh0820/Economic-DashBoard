export function validateRegistry(registry) {
  if(registry?.schemaVersion!==1 || !registry.countries || !Number.isFinite(Date.parse(registry.fetchedAt))) throw new Error('Invalid country registry');
  const seen=new Set();
  for(const [id,c] of Object.entries(registry.countries)) {
    if(!/^(\d{3}|WB-[A-Z]{3})$/.test(id)||!c||!c.name||!c.region||!c.englishName||!c.regionId||c.regionId==='NA'||!/^[A-Z]{2}$/.test(c.code)||seen.has(c.code)) throw new Error('Invalid country identity');
    if(c.position!==null&&(!Array.isArray(c.position)||c.position.length!==2||!c.position.every(Number.isFinite)||Math.abs(c.position[0])>180||Math.abs(c.position[1])>90)) throw new Error('Invalid country location');
    seen.add(c.code);
  }
  if(!seen.size) throw new Error('Empty country registry');
  return registry;
}

export function registryCountries(registry) {
  validateRegistry(registry);
  return Object.fromEntries(Object.entries(registry.countries).map(([id,c])=>[id,{...c,gdp:null,trade:null,unemployment:null,inflation:null}]));
}
