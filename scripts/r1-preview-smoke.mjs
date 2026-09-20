const base=process.env.TRUSTPAY_PREVIEW_URL;
if(!base) throw new Error('TRUSTPAY_PREVIEW_URL is required');

const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const oidc=process.env.VERCEL_TRUSTED_OIDC_IDP_TOKEN;
const headers={'user-agent':'TrustPay-R1-Preview-Smoke/1.1'};
if(bypass){
  headers['x-vercel-protection-bypass']=bypass;
  headers['x-vercel-set-bypass-cookie']='true';
}else if(oidc){
  headers['x-vercel-trusted-oidc-idp-token']=oidc;
}

const routes=[{path:'/',expect:['TrustPay Nigeria MSME','home-title']},{path:'/demo',expect:['TrustPay Nigeria MSME','DEMO CONTROL ROOM']}];

async function fetchWithRetry(url){
  let last;
  for(let attempt=1;attempt<=10;attempt++){
    try{
      const res=await fetch(url,{redirect:'follow',headers});
      const body=await res.text();
      if(res.ok && !res.url.includes('vercel.com/login')) return {res,body};
      if(res.url.includes('vercel.com/login')){
        const mode=bypass?'Protection Bypass secret supplied':oidc?'Trusted Sources OIDC token supplied':'No Vercel deployment-protection credential supplied';
        throw new Error(`Vercel preview is protected and redirected to Vercel login. ${mode}. Configure a Vercel Deployment Protection Exception, Protection Bypass for Automation secret, or Trusted Sources for GitHub Actions before rerunning R1.`);
      }
      last=new Error(`HTTP ${res.status} for ${url}`);
    }catch(error){ last=error; }
    if(attempt<10) await new Promise(resolve=>setTimeout(resolve,3000));
  }
  throw last;
}

for(const route of routes){
  const url=new URL(route.path,base).toString();
  const {res,body}=await fetchWithRetry(url);
  console.log(`Preview response: ${url} -> ${res.status} ${res.url}`);
  console.log(`Preview body prefix: ${body.slice(0,1500).replace(/\\s+/g,' ').trim()}`);
  for(const token of route.expect){
    if(!body.includes(token)) throw new Error(`Expected "${token}" in ${url}`);
  }
  console.log(`Preview smoke PASS: ${url} -> ${res.status}`);
}
