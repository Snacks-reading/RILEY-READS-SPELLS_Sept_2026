'use strict';
(() => {
  const VERSION = '2026.10.05.3', KEY = 'ry_star_speller_v3', DAY = 86400000;
  const LESSONS = window.STAR_LESSONS, PRIOR = window.RY_PRIOR_EVIDENCE;
  const ALL = LESSONS.flatMap(l => [...l.words, ...l.transfer]);
  const $ = s => document.querySelector(s);
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy = x => JSON.parse(JSON.stringify(x));
  const uid = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const lesson = code => LESSONS.find(l => l.code === code);
  const item = id => ALL.find(w => w.id === id);
  const wordKey = w => w.toLowerCase().replace(/[’‘]/g, "'");
  const normalized = w => String(w ?? '').trim().replace(/[’‘]/g, "'");
  const correct = (got, expected) => /^[A-Z]/.test(expected) ? normalized(got) === expected : normalized(got).toLowerCase() === expected;
  const percent = (right, total) => total ? Math.round(right / total * 100) : 0;
  const date = t => new Date(t).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'});
  const clock = t => new Date(t).toLocaleString('en-US');
  function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function initial() {
    const snapshots = ['spell_with_ry_governed_v2', 'rrs_single_v1'].map(key => ({key, data:read(key)})).filter(x => x.data);
    const recovered = snapshots.find(x => x.data.baseline?.done)?.data.baseline || PRIOR.baseline;
    return { version:3, build:VERSION, createdAt:Date.now(), priorEvidence:{source:'Spell-With-Ry_Governed-Rebuild.html', recoveredAt:Date.now(), baseline:copy(recovered), sourceDiagnosticLabels:copy(PRIOR.diagnosticMisses)}, legacySnapshots:copy(snapshots), priorCompletion:{codes:['A1','A1.5','A2','A3','A4','A5','A6'], source:'Parent report: A1–A6 previously completed', masteryTransferred:false}, current:'A7', exposed:[...new Set((recovered.answers || []).map(x => wordKey(x.word)))], firstAttempts:[], corrections:[], checks:[], placementChecks:[], writtenResponses:[], practiceRuns:[], answerAudit:[], audioFlags:[], reviewQueue:[], completedLessons:[], placedOut:[], importConflicts:[], audio:{voiceURI:'',rate:.92,qc:null}, active:null };
  }
  let S = read(KEY);
  if (!S || S.version !== 3) S = initial();
  S.audioFlags = S.audioFlags || [];
  let page = 1, lastView = 'home', voices = [], audioToken = 0, speechFinished = false, audioReturn = null, audioBusy = false;
  function save() {
    S.build = VERSION;
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch { $('#notice').textContent = 'Progress could not be saved. Use Parent / Tutor → Export progress before closing.'; }
  }
  function expose(w) { const k = wordKey(w); if (!S.exposed.includes(k)) S.exposed.push(k); }
  function training(l) { return [...l.words, ...l.transfer.filter(w => S.exposed.includes(wordKey(w.word)))]; }
  function choose(a, n, exclude = []) { return shuffle(a.filter(w => !exclude.includes(wordKey(w.word)))).slice(0,n); }
  function shuffle(a) { a = [...a]; for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function unseen(l, n, exclude = []) { return choose(l.transfer.filter(w => !S.exposed.includes(wordKey(w.word))), n, exclude); }
  function stopAudio() { audioToken++; audioBusy=false; try { window.speechSynthesis?.cancel(); } catch {} }
  function render(html, view) {
    stopAudio(); lastView = view || lastView;
    $('#app').innerHTML = `<div class="screen">${html}</div>`;
    $('#app').focus({preventScroll:true});
    if ($('#answer')) $('#answer').focus({preventScroll:true});
  }
  function skillFor(word, domain = '', got = '') {
    const g=normalized(got).toLowerCase();
    if(word==='choice' && g==='choise')return 'A8';
    if(word==='ordinary' && g==='ordanary')return 'A16';
    if(word==='principal' && g && g!=='principal' && g!=='principle')return 'A17';
    if(word==='stationary' && g==='stationy')return 'A17';
    const maps = {
      A7:['planning','beginning','preferred'], A11:['safely','happier','studied'],
      A12:['families','countries','heroes',"teacher's"], A13:['their','principal','stationary','affect','complement'],
      A14:['Wednesday','February','Tennessee','because','necessary'], A16:['receive'],
      A4:['purpose','ordinary'], A5:['choice','avoid'], A8:['exciting'], A1:['kitchen'], A10:['misunderstood']
    };
    for (const [code, words] of Object.entries(maps)) if (words.includes(word)) return code;
    if (/Syllable|construction/i.test(domain)) return 'A17';
    if (/ending/i.test(domain)) return 'A11';
    if (/Meaning/i.test(domain)) return 'A13';
    if (/vowel teams/i.test(domain)) return 'A16';
    if (/controlled/i.test(domain)) return 'A4';
    if (/consonant/i.test(domain)) return 'A1';
    return 'A17';
  }
  function priorMisses() { return (S.priorEvidence.baseline.answers || []).filter(a => a.correct === false); }
  function priorityCodes() {
    const counts = {};
    for (const a of priorMisses()) { const c=skillFor(a.word,a.domain,a.got); counts[c]=(counts[c]||0)+1; }
    return Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
  }
  function diagnose(w, got) {
    const g=normalized(got), lower=g.toLowerCase(), expected=w.word.toLowerCase();
    if (g.toLowerCase()===w.word.toLowerCase() && g!==w.word) return 'Capitalization';
    if (lower.replace(/'/g,'')===expected.replace(/'/g,'')) return 'Possessive or contraction mark';
    if(expected.startsWith(lower) && expected.length-lower.length>=3)return 'Ending omitted; confirm the whole target and task';
    if(w.word==='misunderstood' && lower==='missunderstood')return 'Prefix boundary: mis has one s';
    if(w.word==='choice' && lower==='choise')return 'Soft c in the final ce chunk';
    if(w.word==='ordinary' && lower==='ordanary')return 'Quiet middle vowel: keep di, not da';
    if(w.word==='stationary' && lower==='stationy')return 'Omitted ar spelling chunk';
    if(w.word==='principal' && lower==='priceapal')return 'Multisyllabic spelling: keep prin, ci, and pal';
    if(w.word==='receive' && lower==='recive')return 'Vowel-team sequence: keep cei';
    if(w.word==='kitchen' && lower==='kcichin')return 'Consonant and vowel mapping: check tch and en';
    if (w.skill==='A13') return 'Meaning choice or exact word spelling; check the sentence';
    if (w.skill==='A12') return /'/.test(w.word) ? 'Owner versus plural ending' : 'Plural ending or base spelling';
    if (w.skill==='A7' && /([bcdfghjklmnpqrstvwxyz])\1/.test(expected)) {
      const pair=expected.match(/([bcdfghjklmnpqrstvwxyz])\1/)[0];
      if (!lower.includes(pair)) return 'Possible missing doubled consonant';
    }
    if (['A11','A10','A15'].includes(w.skill)) return 'Base, affix, or root boundary';
    if (expected.length-lower.length>=2) return 'Possible omitted spelling chunk';
    if (w.skill==='A8') return 'Hard or soft consonant spelling';
    if (w.skill==='A4') return 'R-controlled spelling or a quiet vowel in the remaining chunk';
    if (w.skill==='A14') return 'Unexpected letter sequence or exact word memory';
    if (['A16','A17','A6'].includes(w.skill)) return 'Quiet vowel, spelling chunk, or word boundary';
    return 'Vowel or consonant mapping; compare the exact letters';
  }
  function records(sessionId) { return S.firstAttempts.filter(a => a.sessionId===sessionId); }
  function checkEvidence(c) {
    const ids=c.firstAttemptIds || [], rs=ids.map(id=>S.firstAttempts.find(a=>a.id===id));
    if(ids.length!==10 || new Set(ids).size!==10 || rs.some(a=>!a) || new Set(rs.map(a=>a.wordId)).size!==10)return null;
    if(rs.some(a=>a.sessionId!==c.id || a.skill!==c.skill || (a.purpose && a.purpose!==c.kind) || a.format!=='dictation' || !a.independent || !a.audioValid || !a.audio?.completed || !a.audio?.attested || typeof a.correct!=='boolean' || correct(a.response,a.word)!==a.correct || S.audioFlags.some(f=>f.attemptId===a.id)))return null;
    if(!c.voiceQC || rs.some(a=>a.audio.voiceURI!==c.voiceQC.voiceURI || a.audio.rate!==c.voiceQC.rate))return null;
    const transfers=rs.filter(a=>a.unfamiliar && a.wasExposedBefore===false), right=rs.filter(a=>a.correct).length;
    return {rs,total:10,right,rate:percent(right,10),transferTotal:transfers.length,transferRight:transfers.filter(a=>a.correct).length};
  }
  function validCheck(c) {
    const e=checkEvidence(c);
    return !!e && c.kind==='mastery' && c.independent && c.audioValid && e.transferTotal>=2 && c.total===e.total && c.rate===e.rate && c.transferTotal===e.transferTotal && c.transferRight===e.transferRight;
  }
  function mastery(code, now=Date.now()) {
    const eligible=S.checks.filter(c=>c.skill===code && validCheck(c)).sort((a,b)=>a.at-b.at);
    const spaced=[];
    for(const c of eligible) if (!spaced.length || c.at-spaced.at(-1).at>=DAY) spaced.push(c);
    const last=spaced.slice(-4), transferWords=last.flatMap(c=>checkEvidence(c).rs.filter(a=>a.unfamiliar && a.wasExposedBefore===false).map(a=>wordKey(a.word)));
    const evidenceReady=last.length===4 && last.every(c=>c.rate>=90 && c.transferRight===c.transferTotal) && new Set(transferWords).size===transferWords.length;
    if(!evidenceReady) return {status:'learning',checks:last.filter(c=>c.rate>=90 && c.transferRight===c.transferTotal).length,secure:false,eligible:spaced};
    const anchor=last.at(-1).at;
    const reviews=S.checks.filter(c=>c.skill===code && c.kind==='retention' && c.anchor===anchor && c.independent && c.audioValid && checkEvidence(c)?.rate===c.rate).sort((a,b)=>a.at-b.at);
    let r48=null, r7=null, due48=anchor+2*DAY, due7=anchor+7*DAY;
    for(const c of reviews) {
      if(c.delay===2 && c.at>=due48){r48=c;if(c.rate<90)due48=c.at+2*DAY;else due7=Math.max(due7,c.at+DAY);}
      if(c.delay===7 && r48?.rate>=90 && c.at>=due7){r7=c;if(c.rate<90)due7=c.at+7*DAY;}
    }
    if((r48 && r48.rate<90) || (r7 && r7.rate<90)) return {status:'repair',checks:4,secure:false,anchor,delay:r48?.rate>=90?7:2,due:r48?.rate>=90?due7:due48,eligible:spaced};
    if(r48?.rate>=90 && r7?.rate>=90) return {status:'secure',checks:4,secure:true,anchor,eligible:spaced};
    const delay=r48?.rate>=90?7:2;
    return {status:'retention',checks:4,secure:false,anchor,delay,due:delay===2?due48:due7,eligible:spaced};
  }
  function status(code) {
    const m=mastery(code);
    if(m.secure)return 'Secure';
    if(m.status==='repair')return 'Needs review';
    if(m.status==='retention')return `Retention · ${date(m.due)}`;
    if(m.eligible.length)return `${m.checks}/4 checks`;
    if(S.placedOut.includes(code))return 'Placed ahead · review';
    if(S.priorCompletion.codes.includes(code))return 'Previously completed';
    if(S.completedLessons.includes(code))return 'Practiced';
    return code===S.current?'Next lesson':'Ready to learn';
  }
  function qualifiedPlacement() { return S.placementChecks.some(c=>c.audioValid && c.independent); }
  function home() {
    const l=lesson(S.current)||lesson('A7'), needPlacement=!qualifiedPlacement(), due=LESSONS.filter(l=>{const m=mastery(l.code);return m.due && m.due<=Date.now();}).length;
    render(`<section class="hero"><div class="hero-copy"><div class="eyebrow">Welcome back, Ry</div><h1>Make the spelling<br>make sense.</h1><p class="muted">${needPlacement?'A short check will find the best place to begin. Your earlier work is saved.':`${esc(l.title)} is next. Learn the pattern, try it, then use it in a new word.`}</p><div class="row"><button class="primary" data-action="${S.active?'resume':needPlacement?'placement':'learn'}" ${!needPlacement&&!S.active?`data-code="${l.code}"`:''}>${S.active?'Continue where I stopped':needPlacement?'Start a short check':'Start my lesson'}</button>${needPlacement?'<button class="quiet" data-action="learn" data-code="A7">Go to lessons</button>':''}</div><p class="small muted">About 15–20 minutes. One step at a time.</p></div><div class="orb" aria-hidden="true"><span>✧</span></div></section><div class="card compact review-card"><div><div class="eyebrow">Keep it with you</div><h3>${due?`${due} retention ${due===1?'check is':'checks are'} ready`:'A little review goes a long way'}</h3></div><div class="row"><button data-action="review">Review</button><button data-action="book">Open spellbook</button></div></div>`, 'home');
  }
  function book(p=page) {
    page=Math.max(0,Math.min(2,p));
    const list=LESSONS.slice(page*6,page*6+6);
    render(`<div class="lesson-title"><div class="eyebrow">Your spellbook</div><h1>Star Speller</h1><p class="muted small">Choose a lesson or return to your next step.</p></div><div class="tiles">${list.map(l=>`<button class="tile" data-action="learn" data-code="${l.code}"><span class="code">${l.code}</span><h3>${esc(l.title)}</h3><small>${esc(status(l.code))}</small></button>`).join('')}</div><div class="bottom-actions"><button data-action="book-page" data-page="${page-1}" ${page===0?'disabled':''}>Previous</button><span class="tag">${page+1} / 3</span><button data-action="book-page" data-page="${page+1}" ${page===2?'disabled':''}>Next</button><button class="quiet" data-action="home">Home</button></div>`, 'book');
  }
  function refreshVoices() {
    try { voices=window.speechSynthesis?.getVoices().filter(v=>/^en[-_]/i.test(v.lang)) || []; } catch { voices=[]; }
    if(!S.audio.voiceURI && voices.length) {
      const preferences=[/Aria.*Natural/i,/Jenny.*Natural/i,/Ava.*Natural/i,/Emma.*Natural/i,/Samantha.*(Enhanced|Premium)/i,/Samantha/i,/Google US English/i];
      let best=null;for(const p of preferences){best=voices.find(v=>p.test(v.name));if(best)break;}
      if(best){S.audio.voiceURI=best.voiceURI;save();}
    }
  }
  function selectedVoice() { return voices.find(v=>v.voiceURI===S.audio.voiceURI); }
  function audioQualified() { return !!selectedVoice() && S.audio.qc?.voiceURI===S.audio.voiceURI && S.audio.qc?.rate===S.audio.rate; }
  function audioSettings(message='') {
    refreshVoices(); speechFinished=false;
    render(`<div class="lesson-title"><div class="eyebrow">Listen clearly</div><h1>A voice that works for you.</h1><p class="muted">Choose a clear, natural-sounding voice. Test it before spelling checks.</p></div><div class="task"><div class="card"><div class="setting"><label for="voice">English voice</label><select id="voice"><option value="">Choose a voice</option>${voices.map(v=>`<option value="${esc(v.voiceURI)}" ${v.voiceURI===S.audio.voiceURI?'selected':''}>${esc(v.name)}</option>`).join('')}</select>${!voices.length?'<p class="bad small">No English voice is available yet. Enable an English voice on this device, then reopen this page.</p>':''}</div><div class="setting"><label for="pace">Pace</label><select id="pace"><option value="0.92" ${S.audio.rate===.92?'selected':''}>Slightly slower</option><option value="0.86" ${S.audio.rate===.86?'selected':''}>Slower</option></select></div><p class="small muted">Listen for a complete word, a clear sentence, and the repeated word. Use a comfortable volume.</p><div class="row"><button data-action="voice-preview">Test this voice</button><button class="primary" id="approve-voice" data-action="voice-approve" disabled>This voice is clear and natural</button></div><div id="voice-feedback" class="small muted" role="status">${esc(message || (audioQualified()?'Your previous voice check is saved.':'Listen to the whole sample before approving it.'))}</div></div></div><div class="bottom-actions"><button class="quiet" data-action="home">Home</button></div>`, 'audio');
  }
  async function speakSequence(parts, done, failure) {
    stopAudio(); const token=audioToken, voice=selectedVoice();
    if(!voice || !window.speechSynthesis || !window.SpeechSynthesisUtterance) { failure?.('No selected English voice is available.'); return; }
    audioBusy=true;
    for(let i=0;i<parts.length;i++) {
      if(token!==audioToken)return;
      const result=await new Promise(resolve=>{
        const u=new SpeechSynthesisUtterance(parts[i]);u.voice=voice;u.lang=voice.lang;u.rate=S.audio.rate;u.pitch=1;u.volume=1;
        let started=0, settled=false;
        const settle=r=>{if(settled)return;settled=true;clearTimeout(timer);resolve(r);};
        u.onstart=()=>{started=Date.now();};
        u.onend=()=>settle(started && Date.now()-started>=120?'ok':'clipped');
        u.onerror=()=>settle('error');
        const timer=setTimeout(()=>settle('timeout'),Math.max(12000,parts[i].length*350));
        try { window.speechSynthesis.speak(u); } catch { settle('error'); }
      });
      if(token!==audioToken)return;
      if(result!=='ok'){stopAudio();failure?.('Audio did not finish clearly. Replay or choose another voice.');return;}
      if(i<parts.length-1)await new Promise(resolve=>setTimeout(resolve,350));
    }
    if(token===audioToken){audioBusy=false;done?.();}
  }
  function previewVoice() {
    speechFinished=false;$('#approve-voice').disabled=true;
    expose('necessary');expose('principal');save();
    $('#voice-feedback').textContent='Listening…';
    speakSequence(['Necessary.','A ruler is necessary for accurate measurements.','Necessary.','Principal.','The principal welcomed the new students.','Principal.'],()=>{speechFinished=true;$('#approve-voice').disabled=false;$('#voice-feedback').textContent='Were the words natural, complete, and easy to understand? If so, approve this voice.';},msg=>{$('#voice-feedback').textContent=msg;});
  }
  function approveVoice() {
    if(!speechFinished)return;
    S.audio.qc={voiceURI:S.audio.voiceURI,voiceName:selectedVoice()?.name,rate:S.audio.rate,at:Date.now(),method:'Listener-confirmed naturalness, pronunciation, pace, completion, and audibility'};save();
    const action=audioReturn;audioReturn=null; if(action)action();else home();
  }
  function requireAudio(action) { refreshVoices();if(audioQualified())action();else{audioReturn=action;audioSettings('Independent checks need a clear, natural voice approved on this device.');} }
  function startSession(kind, code, queue, extra={}) {
    S.active={id:uid(),kind,skill:code,queue,index:0,startedAt:Date.now(),assisted:false,audioInvalid:false,...extra};save();renderTask();
  }
  const dictation=(w,stage='practice',extra={})=>({id:uid(),type:'dictation',wordId:w.id,stage,...extra});
  function startLesson(code) {
    const l=lesson(code);if(!l)return;S.current=code;
    const w=l.words;
    const old=choose(LESSONS.filter(x=>S.priorCompletion.codes.includes(x.code)&&x.code!==code).flatMap(x=>x.words),2,w.map(x=>wordKey(x.word)));
    const queue=[{id:uid(),type:'teach',step:0,stage:'teach'},{id:uid(),type:'teach',step:1,stage:'teach'},{id:uid(),type:'concept',stage:'check'},dictation(w[0],'retrieve'),dictation(w[2],'practice'),{id:uid(),type:'recognition',wordId:w[3].id,stage:'practice'},{id:uid(),type:'select',wordIds:[w[4].id,w[5].id],stage:'practice'},dictation(w[6],'apply'),{id:uid(),type:'writing',wordId:w[6].id,stage:'apply'},dictation(w[7],'transfer'),...old.map(x=>dictation(x,'review'))];
    startSession('lesson',code,queue);
  }
  function placementGroups() {
    return priorityCodes().slice(0,5).map(code=>{
      const l=lesson(code), old=priorMisses().find(a=>skillFor(a.word,a.domain,a.got)===code && l.words.some(w=>w.word===a.word));
      const repair=l.words.find(w=>w.word===old?.word)||l.words[0], fresh=unseen(l,1)[0];
      return {code,items:[dictation(repair,'placement',{placementSkill:code}),...(fresh?[dictation(fresh,'placement',{placementSkill:code,unfamiliar:true})]:[])]};
    });
  }
  function startPlacement() {
    requireAudio(()=>{const groups=placementGroups();startSession('placement','placement',groups.flatMap(g=>g.items),{groups:groups.map(g=>g.code),maxItems:12});});
  }
  function independentItems(l, retention=false) {
    const learned=training(l), known=choose(learned,retention?10:8);
    if(retention && known.length<10) {
      const priorItems=ALL.filter(w=>w.skill===l.code && S.exposed.includes(wordKey(w.word)));
      known.push(...choose(priorItems,10-known.length,known.map(w=>wordKey(w.word))));
    }
    const fresh=retention?[]:unseen(l,2,known.map(w=>wordKey(w.word)));
    if(known.length+(fresh.length)<10 || (!retention && fresh.length!==2))return null;
    return shuffle([...known.map(w=>dictation(w,retention?'retention':'mastery')),...fresh.map(w=>dictation(w,'transfer',{unfamiliar:true}))]);
  }
  function checkIntro(code) {
    const l=lesson(code), m=mastery(code), latest=m.eligible.at(-1), available=!latest || Date.now()-latest.at>=DAY;
    render(`<div class="task"><div class="eyebrow">${code} · ${esc(l.title)}</div><h1>Try it independently.</h1><div class="card"><p>Ten words in sentences. Listen, replay whenever you need, then spell without hints.</p><p class="small muted">${m.status==='retention'||m.status==='repair'?`A retention check is ${m.due<=Date.now()?'ready':`scheduled for ${date(m.due)}`}.`:available?'A new independent check is ready.':`Your next evidence check is available after ${clock(latest.at+DAY)}. Keep practicing today.`}</p><div class="row"><button class="primary" data-action="mastery" data-code="${code}" ${!available || m.secure || m.status==='retention' || m.status==='repair'?'disabled':''}>Start check</button><button data-action="learn" data-code="${code}">Practice this rule</button><button data-action="review">Retention review</button></div></div></div>`, 'check');
  }
  function startCheck(code) {
    const l=lesson(code), m=mastery(code), latest=m.eligible.at(-1);
    if(m.secure || m.status==='retention' || m.status==='repair' || (latest && Date.now()-latest.at<DAY)){checkIntro(code);return;}
    requireAudio(()=>{
      const queue=independentItems(l);
      if(!queue){render(`<div class="task"><h1>Keep practicing the rule.</h1><p class="muted">This lesson needs more unused transfer words for another independent check. Your evidence is saved.</p><div class="row"><button class="primary" data-action="learn" data-code="${code}">Practice</button><button data-action="book">Another lesson</button></div></div>`,'check');return;}
      startSession('mastery',code,queue,{voiceQC:copy(S.audio.qc)});
    });
  }
  function review() {
    const due=LESSONS.map(l=>({l,m:mastery(l.code)})).filter(x=>x.m.due).sort((a,b)=>a.m.due-b.m.due);
    render(`<div class="lesson-title"><div class="eyebrow">Bring it back</div><h1>Review and remember.</h1><p class="muted">Older patterns return alongside the new ones.</p></div><div class="scroll">${due.map(({l,m})=>`<div class="card compact review-card"><div><h3>${l.code} · ${esc(l.title)}</h3><p class="small muted">${m.delay===2?'48-hour':'7-day'} retention · ${date(m.due)}</p></div><button data-action="retention" data-code="${l.code}" ${m.due>Date.now()?'disabled':''}>${m.due>Date.now()?'Scheduled':'Start review'}</button></div>`).join('')||'<div class="card"><p>There are no scheduled retention checks yet. A mixed review is ready.</p></div>'}</div><div class="bottom-actions"><button class="primary" data-action="mix">Start mixed review</button><button data-action="home">Home</button></div>`, 'review');
  }
  function startRetention(code) {
    const l=lesson(code),m=mastery(code);if(!m.due || m.due>Date.now() || m.secure){review();return;}
    requireAudio(()=>{const queue=independentItems(l,true);if(!queue){startLesson(code);return;}startSession('retention',code,queue,{anchor:m.anchor,delay:m.delay,voiceQC:copy(S.audio.qc)});});
  }
  function startMix() {
    const due=S.reviewQueue.filter(w=>w.due<=Date.now()).map(r=>item(r.wordId)).filter(Boolean);
    const current=training(lesson(S.current)||lesson('A7'));
    const old=LESSONS.filter(l=>S.priorCompletion.codes.includes(l.code)||S.completedLessons.includes(l.code)).flatMap(l=>training(l));
    const picked=choose(due,4);picked.push(...choose(current,4,picked.map(w=>wordKey(w.word))));picked.push(...choose(old,10-picked.length,picked.map(w=>wordKey(w.word))));
    startSession('mix',S.current,picked.map(w=>dictation(w,'review')));
  }
  function balancedOptions(correctText, distractors, q) {
    if(q.options)return q.options;
    const counts=[0,1,2,3].map(i=>S.answerAudit.slice(-24).filter(a=>a.position===i).length),min=Math.min(...counts);
    const positions=shuffle([0,1,2,3].filter(i=>counts[i]===min)),position=positions[0],others=shuffle([...new Set(distractors)].filter(x=>x!==correctText)).slice(0,3);
    if(others.length!==3)throw new Error('A question needs three distinct distractors.');
    q.options=Array.from({length:4},(_,i)=>i===position?correctText:others.shift());q.correctPositions=[position];
    S.answerAudit.push({id:uid(),qid:q.id,position,at:Date.now()});save();return q.options;
  }
  function wrongSpellings(word) {
    const candidates=[word.slice(0,-1),word+'e',word[0]+word,word.replace(/[aeiou]/i,'a'),word.slice(0,Math.max(1,Math.floor(word.length/2)))+word.slice(Math.max(1,Math.floor(word.length/2))+1)];
    const result=[...new Set(candidates)].filter(w=>w!==word && w.length>0);
    while(result.length<3)result.push(word+String.fromCharCode(97+result.length));return result.slice(0,3);
  }
  function optionsHTML(q, multi=false) { return `<p class="small muted">${multi?'Select exactly 2.':'Choose 1 answer.'}</p><div class="choices">${q.options.map((x,i)=>`<button class="choice ${q.selected?.includes(i)?'selected':''}" data-action="${multi?'select':'choice'}" data-index="${i}" ${multi?`aria-pressed="${q.selected?.includes(i)?'true':'false'}"`:''}><span class="choice-label">${'ABCD'[i]}</span><span>${esc(x)}</span></button>`).join('')}</div>${multi?'<button class="primary" data-action="submit-select">Check both choices</button>':''}`; }
  function independentMode() { return ['placement','mastery','retention'].includes(S.active?.kind) && !S.active.assisted; }
  function currentQ() { return S.active?.queue[S.active.index]; }
  function renderTask() {
    if(!S.active){home();return;}
    const q=currentQ();if(!q){finishSession();return;}
    if(['dictation','recognition','select'].includes(q.type) && !q.responseId){refreshVoices();if(!audioQualified()){audioReturn=renderTask;audioSettings('Before spelling, choose and test a clear, natural voice.');return;}}
    const l=lesson(q.placementSkill || item(q.wordId)?.skill || S.active.skill) || lesson('A7');
    const stageNames={teach:'Learn the pattern',check:'Check the idea',retrieve:'Spell from memory',practice:'Practice',apply:'Use the pattern',transfer:'Try another word',review:'Bring it back',placement:'Find your starting point',mastery:'Independent check',retention:'Retention check',repair:'Repair the pattern'};
    const head=`<div class="spread"><div class="eyebrow">${esc(stageNames[q.stage]||'Practice')}</div><span class="tag">${S.active.index+1} / ${S.active.queue.length}</span></div><div class="progress"><div style="width:${S.active.index/S.active.queue.length*100}%"></div></div>`;
    let body='';
    if(q.type==='teach') {
      const w=l.words[q.step];expose(w.word);
      body=`<div class="eyebrow">${l.code} · ${esc(l.title)}</div><h1>${q.step?'Notice the difference.':'Here’s how it works.'}</h1><div class="card"><p class="rule">${esc(q.step?l.contrast:l.rule)}</p><div class="example">${esc(w.word)}</div><div class="map">${esc(w.map)}</div><p>${esc(w.hook || l.hook)}</p></div><div class="row"><button data-action="hear-teach">Hear the lesson</button><button class="primary" data-action="next">Got it · continue</button></div>`;
    } else if(q.type==='concept') {
      balancedOptions(l.check.correct,l.check.wrong,q);
      body=`<h2>${esc(l.check.prompt)}</h2>${optionsHTML(q)}<div id="feedback" role="status"></div>`;
    } else if(q.type==='recognition') {
      const w=item(q.wordId);expose(w.word);balancedOptions(w.word,wrongSpellings(w.word),q);
      body=`<h2>Which spelling matches the recorded word?</h2><button data-action="listen">Listen / Replay</button>${optionsHTML(q)}<div id="feedback" role="status"></div>`;
    } else if(q.type==='select') {
      const words=q.wordIds.map(item);words.forEach(w=>expose(w.word));
      if(!q.options){q.options=shuffle([words[0].word,words[1].word,wrongSpellings(words[0].word)[0],wrongSpellings(words[1].word)[0]]);q.correctPositions=q.options.map((x,i)=>words.some(w=>w.word===x)?i:-1).filter(i=>i!==-1);q.selected=[];}
      body=`<h2>Select the 2 spellings that match the recording.</h2><button data-action="listen">Listen / Replay</button>${optionsHTML(q,true)}<div id="feedback" role="status"></div>`;
    } else if(q.type==='writing') {
      const w=item(q.wordId);expose(w.word);
      body=`<h2>Make the word yours.</h2><p>Write a new sentence using <b>${esc(w.word)}</b>. You could write about a design, a discovery, or a character.</p><form id="response-form"><textarea class="answer" id="answer" aria-label="Your new sentence" spellcheck="false" autocomplete="off" placeholder="Your sentence"></textarea><div class="bottom-actions"><button class="primary" type="submit">Save my sentence</button></div></form><div id="feedback" role="status"></div>`;
    } else {
      const independent=independentMode();
      body=`<h1>Listen. Think. Spell.</h1><p class="muted">Hear the word in a sentence, then type the word.</p><div class="row"><button id="replay" class="primary" data-action="listen">${q.audio?.completed?'Replay':'Listen'}</button><button class="quiet" data-action="unclear">Audio unclear</button></div><div id="audio-state" class="small muted" role="status">${q.audio?.completed?'The complete recording played. Replay as often as you need.':'The word stays hidden. Listen to the complete recording.'}</div><form id="response-form"><input class="answer" id="answer" type="text" aria-label="Spell the word" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" placeholder="Type the word"><label class="small muted" style="margin-top:12px"><input type="checkbox" id="heard-clear" ${q.audio?.attested?'checked':''}> I heard and understood the word clearly.</label><div class="bottom-actions"><button class="primary" id="submit-answer" type="submit">${independent?'Save answer':'Check'}</button>${independent?'<button class="quiet" type="button" data-action="support">Switch to coached practice</button>':'<button class="quiet" type="button" data-action="hint">Show a clue</button>'}</div></form><div id="feedback" role="status"></div>`;
    }
    render(`${head}<div class="task">${body}</div>`, 'task');save();
    if(q.responseId && q.type!=='teach')restoreFeedback(q,l);
  }
  function playCurrent() {
    const q=currentQ();if(!q)return;
    const words=q.type==='select'?q.wordIds.map(item):[item(q.wordId)].filter(Boolean);
    if(!words.length)return;
    q.audio={replays:0,completed:false,attested:false,...(q.audio||{})};
    if(q.unfamiliar && q.audio.replays===0)q.wasExposedBefore=S.exposed.includes(wordKey(words[0].word));
    q.audio.replays++;q.audio.completed=false;q.audio.attested=false;
    if($('#heard-clear'))$('#heard-clear').checked=false;
    if($('#audio-state'))$('#audio-state').textContent='Listening…';
    words.forEach(w=>expose(w.word));save();
    speakSequence(words.flatMap(w=>[w.word+'.',w.sentence,w.word+'.']),()=>{
      if(currentQ()?.id!==q.id)return;
      q.audio.completed=true;q.audio.voiceURI=S.audio.voiceURI;q.audio.rate=S.audio.rate;q.audio.finishedAt=Date.now();save();
      if($('#audio-state'))$('#audio-state').textContent='The whole recording played. Replay as often as you need.';
      if($('#replay'))$('#replay').textContent='Replay';
    },message=>{
      if(currentQ()?.id!==q.id)return;
      q.audio.completed=false;q.audio.error=message;save();
      if($('#audio-state'))$('#audio-state').textContent=message;
    });
  }
  function recordResponse(q,w,got,ok,extra={}) {
    const a={id:uid(),sessionId:S.active.id,qid:q.id,wordId:w?.id||null,word:w?.word||null,skill:w?.skill||S.active.skill,response:got,correct:ok,at:Date.now(),format:q.type,stage:q.stage,purpose:S.active.kind,independent:q.type==='dictation'&&!S.active.assisted&&!q.hinted&&q.stage!=='repair',unfamiliar:!!q.unfamiliar,wasExposedBefore:q.unfamiliar?q.wasExposedBefore!==false:true,audioValid:q.type==='dictation'?!!q.audio?.completed&&!!q.audio?.attested&&audioQualified():false,audio:copy(q.audio||{}),diagnosis:ok?'':w?diagnose(w,got):'Rule reasoning',build:VERSION,...extra};
    S.firstAttempts.push(a);q.responseId=a.id;q.responseCorrect=ok;
    if(w) { expose(w.word);const r=S.reviewQueue.find(r=>r.wordId===w.id);if(a.correct===false){if(r){r.due=Date.now()+DAY;r.lastMiss=a.id;}else S.reviewQueue.push({wordId:w.id,skill:w.skill,due:Date.now()+DAY,lastMiss:a.id});}else if(a.correct===true && r){r.due=Date.now()+3*DAY;} }
    save();return a;
  }
  function submitTyped() {
    const q=currentQ();if(!q || q.responseId)return;
    const raw=$('#answer')?.value||'';if(!raw.trim()){showMessage('Type your response first.');return;}
    const w=item(q.wordId);
    if(q.type==='writing') {
      if(raw.trim().split(/\s+/).length<5){showMessage('Write a complete sentence with at least five words.');return;}
      const used=raw.split(/\s+/).some(t=>correct(t.replace(/^["“(]+|[.,!?;:)"”]+$/g,''),w.word));
      const record={id:uid(),promptId:`${w.id}-sentence`,sessionId:S.active.id,subject:'ELA · Spelling',prompt:`Write a new sentence using ${w.word}.`,word:w.word,skill:w.skill,response:raw,at:Date.now(),build:VERSION,targetSpellingPresent:used,reviewStatus:'Meaning and sentence quality awaiting ChatGPT review'};
      S.writtenResponses.push(record);q.responseId=record.id;q.responseCorrect=used;save();
      $('#response-form').hidden=true;
      $('#feedback').innerHTML=`<div class="feedback"><p>${used?'Your sentence is saved.':'Your sentence is saved. Check the spelling of the target word.'}</p>${!used?`<p class="map">${esc(w.word)} · ${esc(w.map)}</p>`:''}<button class="primary" data-action="next">Continue</button></div>`;return;
    }
    if(!q.audio?.completed){showMessage('Listen to the whole word–sentence–word recording first.');return;}
    if(!$('#heard-clear')?.checked){showMessage('If the audio was unclear, use Audio unclear. Otherwise confirm that you heard it clearly.');return;}
    q.audio.attested=true;
    const ok=correct(raw,w.word);recordResponse(q,w,raw,ok);
    $('#response-form').hidden=true;
    if(independentMode()) {
      $('#feedback').innerHTML='<div class="feedback"><p>Answer saved.</p><button class="primary" data-action="next">Next word</button></div>';
    } else renderPracticeFeedback(q,w,ok);
  }
  function showMessage(message) { $('#feedback').innerHTML=`<p class="bad small" role="alert">${esc(message)}</p>`; }
  function renderPracticeFeedback(q,w,ok) {
    if(ok) {$('#feedback').innerHTML='<div class="feedback"><p class="good">You kept the spelling together.</p><button class="primary" data-action="next">Continue</button></div>';return;}
    const a=S.firstAttempts.find(a=>a.id===q.responseId);
    $('#feedback').innerHTML=`<div class="feedback"><p class="bad">Let’s repair the pattern.</p><p class="small muted">${esc(a?.diagnosis||'Compare the spelling chunks.')}</p><div class="example">${esc(w.word)}</div><div class="map">${esc(w.map)}</div><p>${esc(w.hook||lesson(w.skill).hook)}</p><button class="primary" data-action="cover-retry">Cover it · try again</button></div>`;
  }
  function restoreFeedback(q,l) {
    if($('#response-form'))$('#response-form').hidden=true;
    if(q.type==='dictation') {
      if(independentMode())$('#feedback').innerHTML='<div class="feedback"><p>Answer saved.</p><button class="primary" data-action="next">Next word</button></div>';
      else renderPracticeFeedback(q,item(q.wordId),q.responseCorrect);
    } else $('#feedback').innerHTML=`<div class="feedback"><p>${q.responseCorrect?'Saved.':esc(l.check.correct)}</p><button class="primary" data-action="next">Continue</button></div>`;
  }
  function coverRetry() {
    const q=currentQ(),w=item(q.wordId);q.retry=true;save();
    $('#feedback').innerHTML=`<div class="feedback"><p>Use the pattern from memory.</p><input class="answer" id="correction" aria-label="Corrected spelling" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off"><button class="primary" data-action="retry">Check correction</button><div id="correction-feedback" role="status"></div></div>`;$('#correction').focus();
  }
  function submitCorrection() {
    const q=currentQ(),w=item(q.wordId),raw=$('#correction')?.value||'';if(!raw.trim())return;
    const ok=correct(raw,w.word);S.corrections.push({id:uid(),firstAttemptId:q.responseId,sessionId:S.active.id,word:w.word,response:raw,correct:ok,at:Date.now(),supported:true,build:VERSION});save();
    if(!ok){$('#correction-feedback').innerHTML=`<p class="bad">Compare the full map: ${esc(w.map)}</p><p>${esc(w.word)}</p>`;return;}
    if(!q.parallelAdded){
      const candidates=training(lesson(w.skill)),used=S.active.queue.map(q=>item(q.wordId)?.word).filter(Boolean).map(wordKey),parallel=choose(candidates,1,used)[0];
      if(parallel)S.active.queue.splice(S.active.index+1,0,dictation(parallel,'repair'));
      q.parallelAdded=true;
    }
    save();$('#feedback').innerHTML='<div class="feedback"><p class="good">Repaired. Now carry the pattern into the next word.</p><button class="primary" data-action="next">Continue</button></div>';
  }
  function submitChoice(i) {
    const q=currentQ();if(!q||q.responseId)return;
    const w=item(q.wordId),ok=q.correctPositions.includes(i);recordResponse(q,w,q.options[i],ok,{independent:false,audioValid:false});
    document.querySelectorAll('.choice').forEach(b=>b.disabled=true);
    const l=lesson(S.active.skill);
    $('#feedback').innerHTML=`<div class="feedback"><p class="${ok?'good':'bad'}">${ok?'That fits the pattern.':'Check the pattern once more.'}</p>${!ok?`<p>${esc(q.type==='concept'?l.check.correct:w.word)}</p><p class="small">${esc(q.type==='concept'?l.rule:w.hook||lesson(w.skill).hook)}</p>`:''}<button class="primary" data-action="next">Continue</button></div>`;
  }
  function toggleSelect(i) {
    const q=currentQ();if(!q||q.responseId)return;
    q.selected=q.selected||[];
    if(q.selected.includes(i))q.selected=q.selected.filter(j=>j!==i);else if(q.selected.length<2)q.selected.push(i);
    else{showMessage('Select exactly 2. Tap a selected choice to change it.');return;}
    save();document.querySelectorAll('.choice').forEach((b,j)=>{b.classList.toggle('selected',q.selected.includes(j));b.setAttribute('aria-pressed',String(q.selected.includes(j)));});
  }
  function submitSelect() {
    const q=currentQ();if(!q||q.responseId)return;
    if(q.selected.length!==2){showMessage('Select exactly 2 spellings.');return;}
    const ok=q.selected.length===q.correctPositions.length && q.selected.every(i=>q.correctPositions.includes(i));
    recordResponse(q,null,q.selected.map(i=>q.options[i]),ok,{independent:false,audioValid:false});
    document.querySelectorAll('.choice').forEach(b=>b.disabled=true);
    $('#feedback').innerHTML=`<div class="feedback"><p class="${ok?'good':'bad'}">${ok?'Both spellings match.':'Both spellings are needed.'}</p>${!ok?`<p>${q.correctPositions.map(i=>esc(q.options[i])).join(' · ')}</p>`:''}<button class="primary" data-action="next">Continue</button></div>`;
  }
  function hint() {
    const q=currentQ(),w=item(q.wordId);if(!w)return;
    q.hinted=true;save();$('#feedback').innerHTML=`<div class="feedback"><p class="map">${esc(w.map)}</p><p>${esc(w.hook||lesson(w.skill).hook)}</p></div>`;
  }
  function support() { if(!S.active)return;S.active.assisted=true;save();hint();if($('#submit-answer'))$('#submit-answer').textContent='Check'; }
  function flagAudio(attemptId) {
    if(!S.firstAttempts.some(a=>a.id===attemptId))return;
    if(!S.audioFlags.some(f=>f.attemptId===attemptId))S.audioFlags.push({id:uid(),attemptId,at:Date.now(),reason:'Listener reported unclear pronunciation, pace, clipping, volume, or voice quality'});
    S.audio.qc=null;save();
  }
  function unclearAudio() {
    const q=currentQ();if(!q)return;
    const w=item(q.wordId);if(!w)return;
    if(q.responseId)flagAudio(q.responseId);
    else recordResponse(q,w,null,false,{audioValid:false,independent:false,invalidReason:'Learner reported unclear audio',diagnosis:'Audio issue; no spelling inference',correct:null});
    S.active.audioInvalid=true;S.audio.qc=null;save();stopAudio();
    if($('#response-form'))$('#response-form').hidden=true;
    $('#feedback').innerHTML='<div class="feedback"><p>The audio issue is saved. This word will not count against your spelling or toward mastery.</p><button class="primary" data-action="next">Continue</button><button data-action="fix-voice">Check the voice</button></div>';
  }
  function next() {
    const q=currentQ();if(!q)return;
    if(q.type!=='teach'&&!q.responseId)return;
    if(S.active.kind==='placement')adaptPlacement(q);
    S.active.index++;save();renderTask();
  }
  function adaptPlacement(q) {
    const a=S.active,code=q.placementSkill;
    const relevant=records(a.id).filter(r=>r.skill===code && r.audioValid && r.independent);
    const upcoming=a.queue[a.index+1];
    if(upcoming?.placementSkill===code)return;
    if(relevant.length<2)return;
    const right=relevant.filter(r=>r.correct).length;
    if(right===relevant.length && relevant.some(r=>r.unfamiliar && r.wasExposedBefore===false)){a.placedOut=a.placedOut||[];if(!a.placedOut.includes(code))a.placedOut.push(code);return;}
    if(relevant.length===2 && a.queue.length<12){
      const used=a.queue.map(q=>item(q.wordId)?.word).filter(Boolean).map(wordKey),parallel=choose(training(lesson(code)),1,used)[0];
      if(parallel){a.queue.splice(a.index+1,0,dictation(parallel,'placement',{placementSkill:code,confirmGap:right===0}));return;}
    }
    if(right/relevant.length<.9){a.queue=a.queue.slice(0,a.index+1);a.recommended=code;}
  }
  function advanceCurrent(code) {
    const i=LESSONS.findIndex(l=>l.code===code);
    const later=LESSONS.slice(i+1).find(l=>!S.priorCompletion.codes.includes(l.code)&&!S.completedLessons.includes(l.code)&&!S.placedOut.includes(l.code));
    S.current=later?.code || priorityCodes().find(c=>!mastery(c).secure) || 'A17';
  }
  function finishSession() {
    const a=S.active;if(!a)return;stopAudio();
    const rs=records(a.id), evidence=rs.filter(r=>r.type!=='writing' && r.correct!==null), valid=rs.filter(r=>r.audioValid&&r.independent&&r.correct!==null);
    const skillRs=valid.filter(r=>r.skill===a.skill),right=skillRs.filter(r=>r.correct).length;
    const transfer=skillRs.filter(r=>r.unfamiliar && r.wasExposedBefore===false), missed=rs.filter(r=>r.correct===false&&r.word);
    let title='You put the pattern to work.',message='Your responses are saved. Keep the rule in mind as you use new words.',actions='';
    if(a.kind==='placement') {
      const tested={};for(const r of valid){tested[r.skill]=tested[r.skill]||{right:0,total:0,transferRight:0,transferTotal:0};tested[r.skill].total++;tested[r.skill].right+=r.correct?1:0;if(r.unfamiliar){tested[r.skill].transferTotal++;tested[r.skill].transferRight+=r.correct?1:0;}}
      const recommended=a.recommended || Object.keys(tested).find(c=>tested[c].right/tested[c].total<.9) || 'A7';
      const audioValid=!a.audioInvalid && rs.length===valid.length && !a.assisted;
      S.placementChecks.push({id:a.id,at:Date.now(),independent:!a.assisted,audioValid,tested,recommended,build:VERSION});
      if(audioValid){S.current=recommended;S.placedOut=[...new Set([...S.placedOut,...(a.placedOut||[])])];}
      title=audioValid?'Your starting point is ready.':'Let’s make the audio clear first.';
      message=audioValid?`${lesson(recommended).title} is a useful place to begin. This check guides your lessons; it does not mark a skill secure.`:'This placement check is saved, but unclear or supported items will not decide your placement.';
      actions=audioValid?`<button class="primary" data-action="learn" data-code="${S.current}">Start ${esc(lesson(S.current).title)}</button>`:'<button class="primary" data-action="audio">Check the voice</button><button data-action="placement">Try placement again</button>';
    } else if(a.kind==='mastery'||a.kind==='retention') {
      const audioValid=!a.audioInvalid && valid.length===a.queue.length && !!a.voiceQC && a.voiceQC.voiceURI===S.audio.voiceURI && a.voiceQC.rate===S.audio.rate;
      const c={id:a.id,skill:a.skill,kind:a.kind,at:Date.now(),firstAttemptIds:rs.map(r=>r.id),total:skillRs.length,right,rate:percent(right,skillRs.length),transferTotal:transfer.length,transferRight:transfer.filter(r=>r.correct).length,independent:!a.assisted,audioValid,anchor:a.anchor||null,delay:a.delay||null,voiceQC:a.voiceQC||null,build:VERSION};
      S.checks.push(c);
      const m=mastery(a.skill);
      title=audioValid&&!a.assisted?`${c.rate}% on independent first attempts`:'Saved as supported or invalid-audio practice';
      message=audioValid&&!a.assisted?(m.secure?'This skill is secure after independent checks, transfer, and delayed retrieval. It will still return in review.':m.status==='retention'?`Four checks are complete. The next retention check is ${date(m.due)}.`:m.status==='repair'?'Retention needs repair. Review the missed pattern, then try a new delayed check.':`This is evidence for the next step. ${m.checks}/4 qualifying checks; new-word transfer and later retention are required.`):'Corrections, hints, or unclear audio cannot count as independent mastery evidence.';
      actions=`${missed.length?`<button class="primary" data-action="repair-session" data-session="${a.id}">Repair the missed patterns</button>`:`<button class="primary" data-action="learn" data-code="${S.current}">Continue learning</button>`}<button data-action="review">Review schedule</button>`;
    } else {
      S.practiceRuns.push({id:a.id,at:Date.now(),kind:a.kind,skill:a.skill,firstAttemptIds:rs.map(r=>r.id),right:evidence.filter(r=>r.correct).length,total:evidence.length,build:VERSION});
      if(a.kind==='lesson'){if(!S.completedLessons.includes(a.skill))S.completedLessons.push(a.skill);advanceCurrent(a.skill);}
      actions=`<button class="primary" data-action="check-intro" data-code="${a.skill}">Try an independent check</button><button data-action="learn" data-code="${S.current}">Next lesson</button>`;
    }
    S.active=null;save();
    render(`<div class="task"><div class="eyebrow">${a.kind==='placement'?'A useful starting point':'One step stronger'}</div><h1>${esc(title)}</h1><div class="card"><p>${esc(message)}</p>${missed.length?`<p class="small muted">Patterns to revisit</p><div class="miss-list">${[...new Set(missed.map(r=>r.word))].map(w=>`<span>${esc(w)}</span>`).join('')}</div>`:''}</div><div class="row">${actions}<button class="quiet" data-action="home">Home</button></div></div>`, 'summary');
  }
  function repairSession(sessionId) {
    const missed=S.firstAttempts.filter(r=>r.sessionId===sessionId&&r.correct===false&&r.wordId).map(r=>item(r.wordId));
    const unique=[...new Map(missed.map(w=>[w.id,w])).values()];if(!unique.length){home();return;}
    const queue=[];
    for(const w of unique.slice(0,4)) {
      queue.push({id:uid(),type:'teach',step:0,stage:'teach',placementSkill:w.skill});
      queue.push(dictation(w,'repair'));
      const parallel=choose(training(lesson(w.skill)),1,unique.map(w=>wordKey(w.word)))[0];if(parallel)queue.push(dictation(parallel,'repair'));
    }
    startSession('repair',unique[0].skill,queue);
  }
  function evidenceRows() {
    return (S.priorEvidence.baseline.answers||[]).map(a=>{
      const code=skillFor(a.word,a.domain,a.got),hypothesis=a.correct?'Previously correct; confirm retention.':diagnose({word:a.word,skill:code},a.got||'');
      return `<tr><td>${esc(a.word)}</td><td>${esc(a.got??'')}</td><td>${a.correct?'Correct':'Missed'}</td><td>${esc(hypothesis)}<br><span class="muted small">${code} · starting hypothesis</span></td></tr>`;
    }).join('');
  }
  function parent() {
    if(independentMode()){S.active.assisted=true;save();}
    const secure=LESSONS.filter(l=>mastery(l.code).secure).length;
    render(`<div class="lesson-title"><div class="eyebrow">Parent / Tutor</div><h1>See the pattern behind the spelling.</h1></div><div class="metrics"><div><b>${S.priorEvidence.baseline.answers?.length||0}</b>prior responses</div><div><b>${S.firstAttempts.length}</b>new first attempts</div><div><b>${secure} / 18</b>secure skills</div></div><div class="scroll">${S.active?.assisted?'<p class="small muted">The current check is now supported practice because this view can show answer spellings. Original first attempts remain saved.</p>':''}<details open><summary>Prior Diagnostic Evidence</summary><p class="small muted">Source: ${esc(S.priorEvidence.source)}. Riley’s actual responses are preserved below. New labels are starting hypotheses, not diagnoses or current mastery. Prior completion of A1–A6 remains recorded; the old mastery judgments do not transfer.</p><div style="overflow:auto"><table><thead><tr><th>Target</th><th>Riley actually typed</th><th>Prior result</th><th>Instructional hypothesis</th></tr></thead><tbody>${evidenceRows()}</tbody></table></div></details><details><summary>Current placement</summary>${S.placementChecks.map(c=>`<p class="small">${clock(c.at)} · ${c.audioValid&&c.independent?'Valid placement':'Supported / audio review needed'} · suggested ${esc(c.recommended)}</p><table><thead><tr><th>Skill</th><th>First attempts</th><th>New-word transfer</th></tr></thead><tbody>${Object.entries(c.tested).map(([code,t])=>`<tr><td>${code}</td><td>${t.right}/${t.total}</td><td>${t.transferRight}/${t.transferTotal}</td></tr>`).join('')}</tbody></table>`).join('')||'<p class="small">A short, prior-informed placement check is ready.</p>'}</details><details><summary>Skill progress and retention</summary><table><thead><tr><th>Skill</th><th>Current evidence</th><th>Next step</th></tr></thead><tbody>${LESSONS.map(l=>{const m=mastery(l.code);return `<tr><td>${l.code} · ${esc(l.title)}</td><td>${esc(status(l.code))}</td><td>${m.due?`${m.delay===2?'48-hour':'7-day'} check ${date(m.due)}`:m.secure?'Mixed review':`Independent checks: ${m.checks}/4`}</td></tr>`;}).join('')}</tbody></table></details><details><summary>Recent exact responses and repairs</summary><table><thead><tr><th>Target</th><th>Typed response</th><th>Evidence</th><th>Instructional signal</th></tr></thead><tbody>${S.firstAttempts.slice(-80).reverse().map(a=>`<tr><td>${esc(a.word||'Rule check')}</td><td>${esc(Array.isArray(a.response)?a.response.join(' · '):a.response??'No response; audio flagged')}</td><td>${a.correct===null||S.audioFlags.some(f=>f.attemptId===a.id)?'Excluded: audio':a.independent&&a.audioValid?'Independent first attempt':'Supported / recognition'}<br>${clock(a.at)}${a.format==='dictation'&&a.audioValid&&!S.audioFlags.some(f=>f.attemptId===a.id)?`<br><button class="small no-print" data-action="flag-audio" data-attempt="${a.id}">Flag audio issue</button>`:''}</td><td>${esc(a.diagnosis|| (a.correct?'Correct':'Review the pattern'))}</td></tr>`).join('')||'<tr><td colspan="4">No new responses yet.</td></tr>'}</tbody></table><p class="small muted">${S.corrections.length} corrected attempts are retained separately. They never replace first attempts.</p></details><details><summary>Written Response Review</summary>${S.writtenResponses.map(r=>`<div class="card compact"><p class="small muted">${r.skill} · ${clock(r.at)}</p><p><b>${esc(r.prompt)}</b></p><p>${esc(r.response)}</p><p class="small muted">${esc(r.reviewStatus)}. Target spelling ${r.targetSpellingPresent?'present':'needs review'}.</p></div>`).join('')||'<p class="small">New sentences will be preserved here with their prompts and dates.</p>'}</details><details><summary>Tutor handoff</summary><p>Use the exact attempts above to ask Riley how she chose her spelling. Confirm the likely pattern, then practice it in a handwritten sentence, a new reading passage, or a related word family. Tutor work adds human observation and meaning review; the app supplies retrieval and retention practice.</p><p class="small muted">Priority hypotheses from the prior diagnostic: ${priorityCodes().slice(0,5).map(c=>`${c} ${lesson(c).title}`).join(' · ')}.</p><button data-action="print">Print this view</button></details><details><summary>Mastery and audio quality rules</summary><p class="small">A skill needs four independent ten-word checks on separate days, each at ≥90% on first attempts and with both previously unexposed transfer words correct. Then it needs ≥90% on checks at least 48 hours and 7 days after the fourth check; the delayed checks must also be on different days. Placement, recognition, assisted corrections, and lesson completion do not award mastery.</p><p class="small">Unlimited normal replays keep independence. A clue or coached mode is supported practice. Only complete word–sentence–word playback with listener-confirmed clarity and an approved voice counts as audio-valid evidence. Any reported pronunciation, speed, clipping, volume, or naturalness problem excludes the item. Voice quality still needs listening QC on Riley’s actual device.</p><p class="small muted">Current voice: ${esc(S.audio.qc?.voiceName||'Not approved on this device')} · ${S.audio.qc?clock(S.audio.qc.at):'Check required'}.</p></details><details><summary>Sources and alignment</summary><p class="small">Lesson names follow the original Star Speller registry in Pasted text.txt (April 9, 2026). Prior responses come from the exact recovered governed file. The new examples, sentence contexts, memory cues, and placement items were authored for this rebuild; they are not presented as teacher-assigned spelling lists.</p><p class="small"><a href="https://www.tn.gov/content/dam/tn/stateboardofeducation/documents/standards/ela-standards-2024-25/2-8-19%20IV%20C%20English%20Language%20Arts%20Standards%20Attachment%20Clean%20Copy.pdf" target="_blank" rel="noopener">Tennessee ELA standards</a>: 6.L.CSE.2 (spelling conventions), 6.L.VAU.4 (context, morphology, and etymology), and 6.L.VAU.6 (academic vocabulary). <a href="https://www.readingrockets.org/topics/early-literacy-development/articles/how-spelling-supports-reading" target="_blank" rel="noopener">Louisa Moats: How Spelling Supports Reading</a> and <a href="https://www.readingrockets.org/topics/spelling-and-word-study/articles/six-syllable-types" target="_blank" rel="noopener">Six Syllable Types</a> informed the pattern instruction.</p></details>${S.importConflicts.length?'<p class="bad small">An imported record conflicted with an existing record. Both versions are preserved; review the exported conflict archive.</p>':''}</div><div class="bottom-actions"><button class="primary" data-action="export">Export progress</button><button data-action="import">Import progress</button><button data-action="home">Ry home</button></div>`, 'parent');
  }
  function exportProgress() {
    const data={format:'ry-star-speller-v3',exportedAt:Date.now(),state:copy(S)};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Ry-Star-Speller-Progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function mergeProgress(incoming) {
    if(incoming?.version!==3 || !incoming.priorEvidence?.baseline)throw new Error('This is not a Star Speller progress file.');
    const arrays=['firstAttempts','corrections','checks','placementChecks','writtenResponses','practiceRuns','answerAudit','audioFlags'];
    for(const key of arrays) {
      const map=new Map(S[key].map(r=>[r.id,r]));
      for(const r of incoming[key]||[]) {
        if(!r.id)continue;
        if(!map.has(r.id)){S[key].push(copy(r));map.set(r.id,r);}
        else if(JSON.stringify(map.get(r.id))!==JSON.stringify(r))S.importConflicts.push({id:uid(),collection:key,existing:copy(map.get(r.id)),imported:copy(r),at:Date.now()});
      }
    }
    S.exposed=[...new Set([...S.exposed,...(incoming.exposed||[])])];
    S.completedLessons=[...new Set([...S.completedLessons,...(incoming.completedLessons||[])])];S.placedOut=[...new Set([...S.placedOut,...(incoming.placedOut||[])])];
    if(JSON.stringify(incoming.priorEvidence.baseline)!==JSON.stringify(S.priorEvidence.baseline) && !S.legacySnapshots.some(x=>JSON.stringify(x.data?.priorEvidence?.baseline)===JSON.stringify(incoming.priorEvidence.baseline)))S.legacySnapshots.push({key:'Imported prior evidence',at:Date.now(),data:{priorEvidence:copy(incoming.priorEvidence)}});
    for(const r of incoming.reviewQueue||[])if(!S.reviewQueue.some(x=>x.wordId===r.wordId))S.reviewQueue.push(copy(r));
    save();return true;
  }
  async function importFile(file) {
    try { const data=JSON.parse(await file.text());mergeProgress(data.state||data);parent();$('#notice').textContent='Progress merged. Existing responses and prior evidence were preserved.'; }
    catch(error){$('#notice').textContent=`Import could not be used: ${error.message}`;}
  }
  document.addEventListener('submit',event=>{if(event.target.id==='response-form'){event.preventDefault();submitTyped();}});
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='correction'){event.preventDefault();submitCorrection();}});
  document.addEventListener('change',event=>{
    if(event.target.id==='voice'){stopAudio();S.audio.voiceURI=event.target.value;S.audio.qc=null;speechFinished=false;save();$('#approve-voice').disabled=true;$('#voice-feedback').textContent='Test this voice before approving it.';}
    if(event.target.id==='pace'){stopAudio();S.audio.rate=Number(event.target.value);S.audio.qc=null;speechFinished=false;save();$('#approve-voice').disabled=true;$('#voice-feedback').textContent='Test the new pace before approving it.';}
    if(event.target.id==='heard-clear'){const q=currentQ();if(q){q.audio=q.audio||{};q.audio.attested=event.target.checked;save();}}
    if(event.target.id==='import-file'&&event.target.files[0]){importFile(event.target.files[0]);event.target.value='';}
  });
  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-action]');if(!b||b.disabled)return;
    const action=b.dataset.action,code=b.dataset.code;
    const actions={home,book:()=>book(),audio:()=>audioSettings(),parent,placement:startPlacement,learn:()=>startLesson(code),resume:renderTask,'book-page':()=>book(Number(b.dataset.page)),listen:playCurrent,'hear-teach':()=>{const q=currentQ(),l=lesson(q.placementSkill||S.active.skill),w=l.words[q.step];speakSequence([q.step?l.contrast:l.rule,w.sentence,w.hook||l.hook],()=>{},msg=>{$('#notice').textContent=msg;});},next,choice:()=>submitChoice(Number(b.dataset.index)),select:()=>toggleSelect(Number(b.dataset.index)),'submit-select':submitSelect,'cover-retry':coverRetry,retry:submitCorrection,hint,support,unclear:unclearAudio,'flag-audio':()=>{flagAudio(b.dataset.attempt);parent();},'fix-voice':()=>{audioReturn=()=>{const q=currentQ();if(q?.responseId)next();else renderTask();};audioSettings();},'voice-preview':previewVoice,'voice-approve':approveVoice,'check-intro':()=>checkIntro(code),mastery:()=>startCheck(code),review,retention:()=>startRetention(code),mix:startMix,'repair-session':()=>repairSession(b.dataset.session),export:exportProgress,import:()=>$('#import-file').click(),print:()=>{document.querySelectorAll('details').forEach(d=>d.open=true);window.print();}};
    actions[action]?.();
  });
  if(window.speechSynthesis)window.speechSynthesis.addEventListener('voiceschanged',()=>{refreshVoices();if(lastView==='audio'&&!speechFinished&&!audioBusy)audioSettings();});
  window.addEventListener('beforeunload',save);
  window.RySpeller={version:VERSION,getState:()=>copy(S),mastery,diagnose,priorityCodes,mergeProgress,correct,unseen,independentItems,validCheck};
  refreshVoices();save();home();
})();
