/**
 * nexia-sdk.js
 * https://nexia-api.onrender.com
 */
const API='https://nexia-api.onrender.com';
const _g=(p,k)=>fetch(`${API}${p}${p.includes('?')?'&':'?'}key=${k}`).then(r=>r.json());
const _p=(p,b)=>fetch(`${API}${p}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
const verificar=(k)=>_g('/api/verificar',k);
const getPerfil=(k)=>_g('/api/perfil-api',k);
const getRequests=(k)=>_g('/api/requests',k);
const registrarUso=(k)=>_p('/api/registrar-uso',{key:k});
const regenerarKey=(k)=>_p('/api/regenerar-key',{key:k});
const getRanking=()=>fetch(`${API}/api/ranking`).then(r=>r.json());
const getStats=()=>fetch(`${API}/api/stats`).then(r=>r.json());
const isPremium=async(k)=>{const d=await verificar(k);return d.success&&!!d.usuario.premium;};
const isAdmin=async(k)=>{const d=await verificar(k);return d.success&&!!d.usuario.adm;};
const baixarMusica=(q,k)=>_g(`/api/musica?q=${encodeURIComponent(q)}`,k);
const buscarLetra=(a,m,k)=>_g(`/api/letra?artista=${encodeURIComponent(a)}&musica=${encodeURIComponent(m)}`,k);
const baixarVideo=(url,k)=>_g(`/api/video?url=${encodeURIComponent(url)}`,k);
const gerarBanner=(p,e='dark',k)=>_g(`/api/banner?prompt=${encodeURIComponent(p)}&estilo=${e}`,k);
const urlBanner=(p,e='dark',k)=>`${API}/api/banner/url?prompt=${encodeURIComponent(p)}&estilo=${e}&key=${k}`;
const perguntarIA=(q,k,s)=>_p('/api/ia',{key:k,pergunta:q,sistema:s});
const buscarImagens=(q,n=5,k)=>_g(`/api/pinterest?q=${encodeURIComponent(q)}&qtd=${n}`,k);
module.exports={verificar,getPerfil,getRequests,registrarUso,regenerarKey,getRanking,getStats,isPremium,isAdmin,baixarMusica,buscarLetra,baixarVideo,gerarBanner,urlBanner,perguntarIA,buscarImagens};
