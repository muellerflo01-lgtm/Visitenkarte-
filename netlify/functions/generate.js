exports.handler = async (event) => {
  const headers = {'Content-Type':'application/json','Cache-Control':'no-store'};
  const reply = (statusCode, obj) => ({statusCode,headers,body:JSON.stringify(obj)});
  if (event.httpMethod !== 'POST') return reply(405,{error:'Nur POST erlaubt.'});
  if (!process.env.OPENAI_API_KEY) return reply(503,{error:'KI ist noch nicht eingerichtet. Bitte OPENAI_API_KEY in Netlify hinterlegen.'});
  try {
    if ((event.body||'').length > 4000) return reply(413,{error:'Eingabe zu lang.'});
    const {job,real,figure} = JSON.parse(event.body||'{}');
    if (typeof job !== 'string'||typeof real !== 'string'||!['auto','man','woman','bear'].includes(figure)) return reply(400,{error:'Ungültige Eingabe.'});
    const safeJob=job.slice(0,75).trim(), safeReal=real.slice(0,100).trim();
    if(!safeJob||!safeReal) return reply(400,{error:'Bitte Beruf und ehrliche Tätigkeit ausfüllen.'});
    const character = {auto:'a friendly anthropomorphic character suitable for the role',man:'an adult man',woman:'an adult woman',bear:'a friendly anthropomorphic brown bear'}[figure];
    const prompt = `Create a premium, witty editorial comic illustration for a German professional social-media business-card challenge. Square composition. Main character: ${character}. Official profession: ${safeJob}. Their funny real everyday job: ${safeReal}. Depict a clever, instantly understandable humorous WORKPLACE SCENE that visualizes this contrast, with expressive body language and tasteful visual comedy. High-quality hand-drawn digital comic, stylish cinematic lighting, navy and muted teal color palette, crisp linework, warm approachable tone, suitable for professional LinkedIn. Place the character and scene primarily in the upper 70% of the image, keeping the bottom 30% visually quiet because the application will overlay a statement there. Absolutely no text, letters, watermarks, brands, logos, or speech bubbles. Do not portray any identifiable real person.`;
    const controller = new AbortController(); const timeout=setTimeout(()=>controller.abort(),55000);
    let upstream;
    try {upstream=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-1',prompt,size:'1024x1024',quality:'low',n:1}),signal:controller.signal});} finally {clearTimeout(timeout)}
    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok) { console.error('Image API error',upstream.status,JSON.stringify(data).slice(0,400));return reply(502,{error:'Die KI-Bildgenerierung ist gerade nicht verfügbar. Bitte später erneut versuchen.'}); }
    const base64=data.data?.[0]?.b64_json;
    if(!base64) return reply(502,{error:'Die KI hat kein Bild zurückgegeben.'});
    return reply(200,{image:`data:image/png;base64,${base64}`});
  } catch(err) {console.error('Generation failed',err.message);return reply(500,{error:err.name==='AbortError'?'Die Bildgenerierung hat zu lange gedauert. Bitte erneut versuchen.':'Bei der Bildgenerierung ist ein Fehler aufgetreten.'});}
};
