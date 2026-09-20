const base=process.env.TRUSTPAY_PREVIEW_URL;
if(!base) throw new Error('TRUSTPAY_PREVIEW_URL is required');
const routes=[{path:'/',expect:['TrustPay']},{path:'/demo',expect:['DEMO']}];

async function fetchWithRetry(url){
  let last;
  for(let attempt=1;attempt<=10;attempt++){
    try{
      const res=await fetch(url,{redirect:'follow',headers:{'user-agent':'TrustPay-R1-Preview-Smoke/1.0'}});
      const body=await res.text();
      if(res.ok) return {res,body};
      last=new Error(`HTTP ${res.status} for ${url}`);
    }catch(error){ last=error; }
    await new Promise(resolve=>setTimeout(resolve,3000));
  }
  throw last;
}

for(const route of routes){
  const url=new URL(route.path,base).toString();
  const {res,body}=await fetchWithRetry(url);
  for(const token of route.expect){
    if(!body.includes(token)) throw new Error(`Expected "${token}" in ${url}`);
  }
  console.log(`Preview smoke PASS: ${url} -> ${res.status}`);
}
