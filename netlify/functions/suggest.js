const reply=(statusCode,obj)=>({statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(obj)});
exports.handler=async(event)=>{
 if(event.httpMethod!=='POST')return reply(405,{error:'Nur POST erlaubt.'});
 if(!process.env.OPENAI_API_KEY)return reply(503,{error:'KI ist noch nicht eingerichtet. OPENAI_API_KEY in Netlify hinterlegen.'});
 if((event.body||'').length>1500)return reply(413,{error:'Eingabe zu lang.'});
 let job;try{({job}=JSON.parse(event.body||'{}'))}catch{return reply(400,{error:'Ungültige Anfrage.'})}
 if(typeof job!=='string'||!job.trim()||job.length>75)return reply(400,{error:'Bitte eine Berufsbezeichnung eingeben (maximal 75 Zeichen).'});
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
 try{
  const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_TEXT_MODEL||'gpt-4.1-mini',temperature:1,max_tokens:100,messages:[{role:'system',content:'Du schreibst auf Deutsch einen überraschend witzigen, ehrlichen, etwas frech zugespitzten alternativen Jobtitel für eine LinkedIn-Visitenkarte. Antworte NUR mit einer einzigen kurzen Berufsbezeichnung (2 bis 7 Wörter, maximal 75 Zeichen), keine Anführungszeichen, keine Erklärungen, keine Emojis. Beobachtbar und liebevoll satirisch, nicht beleidigend, keine geschützten Eigenschaften oder Diskriminierung. Wiederhole nicht einfach den offiziellen Jobtitel. Wechsle die Idee bei wiederholten Anfragen.'},{role:'user',content:`Offizieller Job: ${job.trim()}\nErfinde eine pointierte, humorvolle tatsächliche Tätigkeit. Zufallsimpuls: ${Math.floor(Math.random()*100000)}`}]}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));if(!response.ok){console.error('Text API',response.status,JSON.stringify(data).slice(0,250));return reply(502,{error:'Der KI-Vorschlag ist gerade nicht verfügbar.'})}
  let suggestion=(data.choices?.[0]?.message?.content||'').trim().replace(/^['"„“]+|['"„“]+$/g,'').replace(/[\r\n]+/g,' ').slice(0,100);
  if(!suggestion)return reply(502,{error:'Die KI hat keinen Vorschlag geliefert.'});
  return reply(200,{suggestion});
 }catch(e){console.error('Suggest failed',e.message);return reply(500,{error:e.name==='AbortError'?'Die KI braucht zu lange. Bitte erneut versuchen.':'KI-Vorschlag momentan nicht verfügbar.'})}finally{clearTimeout(timeout)}
};
