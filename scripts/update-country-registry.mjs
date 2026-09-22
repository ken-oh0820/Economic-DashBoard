import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {validateRegistry} from '../assets/country-registry.mjs';

const REGIONS={LCN:'중남미·카리브',NAC:'북미',ECS:'유럽·중앙아시아',EAS:'동아시아·태평양',SAS:'남아시아',MEA:'중동·북아프리카·아프가니스탄·파키스탄',SSF:'사하라 이남 아프리카'};
const NAMES={KR:'대한민국',KP:'북한',HK:'홍콩',MO:'마카오',JG:'채널 제도',CD:'콩고민주공화국',CG:'콩고공화국',PS:'팔레스타인'};
export function buildRegistry(rows,mappings,now=new Date()) {
  const names=new Intl.DisplayNames(['ko'],{type:'region'}), countries={};
  for(const row of rows) {
    if(row.region?.id==='NA')continue;
    if(!row.region?.id||!/^[A-Z]{2}$/.test(row.iso2Code)||!/^[A-Z]{3}$/.test(row.id))throw new Error('Unrecognized World Bank identity');
    const code=row.iso2Code,mapping=mappings[code];
    // Never infer a boundary from a similar name; statistical areas without ISO IDs stay separate.
    const id=mapping?._numeric||`WB-${row.id}`;
    if(countries[id])throw new Error('Duplicate map identity');
    const position=row.longitude!==''&&row.latitude!==''&&row.longitude!=null&&row.latitude!=null?[Number(row.longitude),Number(row.latitude)]:null;
    countries[id]={code,wbId:row.id,name:NAMES[code]||names.of(code)||row.name,englishName:row.name,
      flag:code==='JG'?'':String.fromCodePoint(...[...code].map(c=>0x1f1e6+c.charCodeAt(0)-65)),
      region:REGIONS[row.region.id]||row.region.value,regionId:row.region.id,position};
  }
  return validateRegistry({schemaVersion:1,fetchedAt:now.toISOString(),source:'https://api.worldbank.org/v2/country?format=json&per_page=400',
    codeSource:'https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-core/supplemental/codeMappings.json',
    note:'World Bank non-aggregate economies; statistical coverage, not a sovereignty classification. Coordinates are provider reference locations, not boundaries.',countries});
}
export async function buildFromSources() {
  const payload=JSON.parse(await readFile(new URL('../data/country-registry-source.json',import.meta.url),'utf8'));
  if(payload[0]?.pages!==1||payload[0]?.total!==payload[1]?.length)throw new Error('Incomplete country list');
  const mappings=JSON.parse(await readFile(new URL('../data/country-code-mappings.json',import.meta.url),'utf8')).supplemental.codeMappings;
  const result=buildRegistry(payload[1],mappings);
  await writeFile(new URL('../data/country-registry.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(`${Object.keys(result.countries).length} countries/areas`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await buildFromSources();
