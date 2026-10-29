const express=require('express'),cors=require('cors'),rateLimit=require('express-rate-limit');
const CLIENT_ID=process.env.DERIV_CLIENT_ID||'34NUD2BxWgggQlv957IJD';
const list=(v,d)=>(v||d).split(',').map(x=>x.trim()).filter(Boolean);
const REDIRECTS=list(process.env.REDIRECT_URIS,'https://primevestbinary.com/callback,https://www.primevestbinary.com/callback,http://localhost:3000/callback');
const ORIGINS=list(process.env.CLIENT_ORIGINS,'https://primevestbinary.com,https://www.primevestbinary.com,http://localhost:3000');
const DERIV='https://api.derivws.com';
const app=express();app.set('trust proxy',1);
app.use(cors({origin:ORIGINS,methods:['GET','POST'],allowedHeaders:['Content-Type','Authorization']}),express.json({limit:'10kb'}),rateLimit({windowMs:60000,limit:120,standardHeaders:true,legacyHeaders:false}));
const bearer=req=>{const a=req.headers.authorization||'';return a.startsWith('Bearer ')?a:null};
const err=(res,status,message)=>res.status(status).json({errors:[{status,message}]});
app.get('/health',(_q,res)=>res.json({ok:true}));
// Exchange the OAuth code for an access token (must be done server-side).
app.post('/api/token',async(req,res)=>{
  const {code,code_verifier,redirect_uri}=req.body||{};
  if(!code||!code_verifier||!REDIRECTS.includes(redirect_uri))return res.status(400).json({error:'Bad request'});
  try{
    const r=await fetch('https://auth.deriv.com/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({grant_type:'authorization_code',client_id:CLIENT_ID,code,code_verifier,redirect_uri})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||!j.access_token)return res.status(400).json({error:j.error||'Token exchange failed',error_description:j.error_description});
    res.json({access_token:j.access_token,expires_in:j.expires_in});
  }catch(e){res.status(502).json({error:'Could not reach Deriv'})}
});
// The signed-in user's Options accounts.
app.get('/api/deriv',async(req,res)=>{
  const a=bearer(req);if(!a)return err(res,401,'Not signed in');
  try{const r=await fetch(DERIV+'/trading/v1/options/accounts',{headers:{Authorization:a}});res.status(r.status).json(await r.json().catch(()=>({})))}
  catch(e){err(res,502,'Could not reach Deriv')}
});
// One-time WebSocket address for one account.
app.post('/api/otp',async(req,res)=>{
  const a=bearer(req),id=(req.body||{}).account_id;
  if(!a)return err(res,401,'Not signed in');
  if(!/^[A-Za-z0-9_-]{2,40}$/.test(id||''))return err(res,400,'Bad account id');
  try{const r=await fetch(DERIV+'/trading/v1/options/accounts/'+encodeURIComponent(id)+'/otp',{method:'POST',headers:{Authorization:a,'Content-Type':'application/json'}});res.status(r.status).json(await r.json().catch(()=>({})))}
  catch(e){err(res,502,'Could not reach Deriv')}
});
app.use((_q,res)=>err(res,404,'Not found'));
app.listen(process.env.PORT||4000,()=>console.log('Primevest API listening'));
