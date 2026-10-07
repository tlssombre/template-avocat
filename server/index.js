import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes, scryptSync, timingSafeEqual, createHash} from 'node:crypto';
import {readFile, mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve, extname, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaults} from '../src/content.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dbFile=resolve(process.env.DB_PATH||resolve(root,'server/data.sqlite'));
await mkdir(dirname(dbFile),{recursive:true});
const db=new DatabaseSync(dbFile);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), content TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY CHECK(id=1), salt TEXT NOT NULL, password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, mode TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Nouveau');`);
if(!db.prepare('SELECT id FROM settings WHERE id=1').get()) db.prepare('INSERT INTO settings(id,content) VALUES(1,?)').run(JSON.stringify(defaults));
if(process.env.ADMIN_PASSWORD){
 if(process.env.ADMIN_PASSWORD.length<12) throw Error('ADMIN_PASSWORD doit contenir au moins 12 caractères.');
 const salt=randomBytes(16).toString('hex');
 db.prepare('INSERT INTO admins(id,salt,password_hash) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET salt=excluded.salt,password_hash=excluded.password_hash').run(salt,scryptSync(process.env.ADMIN_PASSWORD,salt,64).toString('hex'));
 db.exec('DELETE FROM sessions');
}
const port=Number(process.env.PORT||3001);
const expiry=7*24*60*60*1000;
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
const cookie=(req,name)=>req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1);
const hash=x=>createHash('sha256').update(x).digest('hex');
function authed(req){const token=cookie(req,'cabinet_session');return token&&!!db.prepare('SELECT token_hash FROM sessions WHERE token_hash=? AND expires_at>?').get(hash(token),Date.now())}
function setCookie(res,value,maxAge){res.setHeader('Set-Cookie',`cabinet_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV==='production'?'; Secure':''}`)}
async function body(req){let input='';for await(const chunk of req){input+=chunk;if(input.length>100000)throw Error('Requête trop volumineuse')}return JSON.parse(input||'{}')}
function validContent(data){if(!data||typeof data!=='object'||Array.isArray(data))return false;for(const key of ['identity','services','team','articles','faq','availability'])if(!(key in data))return false;return typeof data.identity==='object'&&typeof data.availability==='object'&&['services','team','articles','faq'].every(k=>Array.isArray(data[k]))}
const attempts=new Map();
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
 if(req.method!=='GET'&&req.method!=='HEAD'){
  const origin=req.headers.origin;
  if(origin&&origin!==`http://${req.headers.host}`&&origin!==`https://${req.headers.host}`)return json(res,403,{error:'Origine refusée'});
 }
 try{
  if(url.pathname==='/api/content'&&req.method==='GET')return json(res,200,JSON.parse(db.prepare('SELECT content FROM settings WHERE id=1').get().content));
  if(url.pathname==='/api/appointments'&&req.method==='POST'){
   const ip=req.socket.remoteAddress||'unknown',now=Date.now();const recent=(attempts.get(ip)||[]).filter(t=>t>now-3600000);if(recent.length>=8)return json(res,429,{error:'Trop de demandes. Réessayez plus tard.'});
   const data=await body(req);if(data.website)return json(res,200,{ok:true});
   const {name,phone,email,subject,mode,message=''}=data;
   if(![name,phone,email,subject,mode,message].every(v=>typeof v==='string')||name.length<2||name.length>120||phone.length<6||phone.length>40||email.length>180||!/^\S+@\S+\.\S+$/.test(email)||subject.length>140||mode.length>50||message.length>3000)return json(res,400,{error:'Vérifiez les informations saisies.'});
   db.prepare('INSERT INTO requests(id,created_at,name,phone,email,subject,mode,message,status) VALUES(?,?,?,?,?,?,?,?,?)').run(randomBytes(16).toString('hex'),new Date().toISOString(),name.trim(),phone.trim(),email.trim(),subject.trim(),mode.trim(),message.trim(),'Nouveau');
   attempts.set(ip,[...recent,now]);return json(res,201,{ok:true});
  }
  if(url.pathname==='/api/admin/session'&&req.method==='GET')return json(res,200,{authenticated:Boolean(authed(req))});
  if(url.pathname==='/api/admin/login'&&req.method==='POST'){
   const ip=req.socket.remoteAddress||'unknown',now=Date.now(),key='login:'+ip;const recent=(attempts.get(key)||[]).filter(t=>t>now-900000);if(recent.length>=5)return json(res,429,{error:'Trop de tentatives. Réessayez dans 15 minutes.'});
   const {password}=await body(req);const admin=db.prepare('SELECT salt,password_hash FROM admins WHERE id=1').get();
   const candidate=typeof password==='string'&&password.length<500&&admin?scryptSync(password,admin.salt,64):null;
   if(!candidate||!timingSafeEqual(candidate,Buffer.from(admin.password_hash,'hex'))){attempts.set(key,[...recent,now]);return json(res,401,{error:'Mot de passe incorrect ou administrateur non configuré.'})}
   attempts.delete(key);const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions(token_hash,expires_at) VALUES(?,?)').run(hash(token),now+expiry);setCookie(res,token,expiry/1000);return json(res,200,{authenticated:true});
  }
  if(url.pathname.startsWith('/api/admin/')){
   if(!authed(req))return json(res,401,{error:'Connexion requise.'});
   if(url.pathname==='/api/admin/logout'&&req.method==='POST'){db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(cookie(req,'cabinet_session')));setCookie(res,'',0);return json(res,200,{ok:true})}
   if(url.pathname==='/api/admin/content'&&req.method==='PUT'){const data=await body(req);if(!validContent(data))return json(res,400,{error:'Contenu invalide.'});db.prepare('UPDATE settings SET content=? WHERE id=1').run(JSON.stringify(data));return json(res,200,{ok:true})}
   if(url.pathname==='/api/admin/requests'&&req.method==='GET'){const rows=db.prepare('SELECT id, created_at AS createdAt,name,phone,email,subject,mode,message,status FROM requests ORDER BY created_at DESC').all();return json(res,200,rows)}
   const match=url.pathname.match(/^\/api\/admin\/requests\/([a-f0-9]{32})$/);
   if(match&&req.method==='PATCH'){const {status}=await body(req);if(!['Nouveau','À rappeler','Confirmé','Clos'].includes(status))return json(res,400,{error:'Statut invalide.'});db.prepare('UPDATE requests SET status=? WHERE id=?').run(status,match[1]);return json(res,200,{ok:true})}
   if(match&&req.method==='DELETE'){db.prepare('DELETE FROM requests WHERE id=?').run(match[1]);return json(res,200,{ok:true})}
  }
  if(url.pathname.startsWith('/api/'))return json(res,404,{error:'Route introuvable.'});
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Méthode refusée.'});
  const path=resolve(root,'dist',url.pathname==='/'?'index.html':'.'+decodeURIComponent(url.pathname));const dist=resolve(root,'dist');
  if(!path.startsWith(dist+'/'))return json(res,403,{error:'Accès refusé.'});
  const asset=existsSync(path)?path:resolve(dist,'index.html');const data=await readFile(asset);
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
  res.writeHead(200,{'Content-Type':mime[extname(asset)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch(error){if(error.code==='ENOENT')return json(res,404,{error:'Fichier introuvable.'});console.error(error);json(res,error.message==='Requête trop volumineuse'?413:400,{error:'La requête n’a pas pu être traitée.'})}
});
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Cabinet juridique : http://localhost:${port}`));
