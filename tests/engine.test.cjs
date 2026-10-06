/* Run with node tests/engine.test.cjs. Speech here is a simulation, not acoustic QC. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),DAY=86400000;
function makeApp(seed={}) {
  let now=Date.parse('2026-10-06T04:00:00Z');const storage=new Map(Object.entries(seed)),els=new Map(),handlers={},speech=[];
  const element=selector=>{
    if(!els.has(selector))els.set(selector,{id:selector.slice(1),innerHTML:'',textContent:'',value:'',checked:false,disabled:false,hidden:false,focus(){},click(){},setAttribute(){},classList:{toggle(){}}});
    return els.get(selector);
  };
  class TestDate extends Date { constructor(...args){super(...(args.length?args:[now]));}static now(){return now;} }
  class Utterance { constructor(text){this.text=text;} }
  const voice={name:'Microsoft Aria Online (Natural)',voiceURI:'aria-test',lang:'en-US'};
  const context={Date:TestDate,Math,JSON,Set,Map,Array,String,Number,Object,RegExp,Error,console,Blob,SpeechSynthesisUtterance:Utterance,crypto,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    document:{querySelector:element,querySelectorAll:()=>[],addEventListener:(name,fn)=>{handlers[name]=fn;},createElement:()=>({click(){}})},
    speechSynthesis:{getVoices:()=>[voice],cancel(){},addEventListener(){},speak(u){speech.push({text:u.text,voice:u.voice,rate:u.rate});u.onstart?.();now+=250;setImmediate(()=>u.onend?.());}},
    URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},addEventListener(){},print(){},
    setTimeout:(fn,delay)=>{if(delay<1000)setImmediate(fn);return 1;},clearTimeout(){}};
  context.window=context;vm.createContext(context);
  for(const f of ['lessons.js','prior-evidence.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
  const click=(action,data={})=>handlers.click({target:{closest:()=>({dataset:{action,...data},disabled:false})}});
  const submit=()=>handlers.submit({target:{id:'response-form'},preventDefault(){}});
  const flush=async()=>{for(let i=0;i<20;i++)await new Promise(setImmediate);};
  return {api:context.RySpeller,context,storage,els,element,click,submit,flush,speech,now:()=>now,setNow:t=>{now=t;}};
}
function addChecks(app,configs) {
  const s=app.api.getState(),l=app.context.STAR_LESSONS.find(l=>l.code==='A7');
  for(const [index,config] of configs.entries()) {
    const {at,kind='mastery',right=10,delay=null,anchor=null,assisted=false,audioValid=true,reusedTransfer=false}=config;
    const id=crypto.randomUUID(),fresh=l.transfer.slice(reusedTransfer?0:index*2,reusedTransfer?2:index*2+2),words=[...l.words,...fresh];
    const ids=[];
    words.forEach((w,i)=>{
      const aid=crypto.randomUUID(),ok=i<right;ids.push(aid);
      s.firstAttempts.push({id:aid,sessionId:id,qid:aid,wordId:w.id,word:w.word,skill:w.skill,response:ok?w.word:w.word+'z',correct:ok,at:at-100,format:'dictation',stage:kind,independent:!assisted,unfamiliar:kind==='mastery'&&i>=8,wasExposedBefore:kind==='mastery'&&i>=8?false:true,audioValid,audio:{completed:true,attested:true,voiceURI:'aria-test',rate:.92},build:'test'});
    });
    s.checks.push({id,skill:'A7',kind,at,firstAttemptIds:ids,total:10,right,rate:right*10,transferTotal:kind==='mastery'?2:0,transferRight:kind==='mastery'?Math.max(0,right-8):0,independent:!assisted,audioValid,anchor,delay,voiceQC:{voiceURI:'aria-test',rate:.92},build:'test'});
  }
  app.api.mergeProgress(s);
}
(async()=>{
  const original=fs.readFileSync(path.join(root,'tests/fixtures/governed-v2.html'),'utf8'),prior=JSON.parse(original.match(/const SEED=(.*);\s*\n/)[1]);
  const baselineApp=makeApp();
  assert.equal(JSON.stringify(baselineApp.api.getState().priorEvidence.baseline),JSON.stringify(prior.baseline),'Baseline must remain byte-for-byte equivalent as JSON.');
  assert.equal(baselineApp.api.getState().priorCompletion.masteryTransferred,false);
  assert.equal(baselineApp.api.getState().current,'A7');
  const old={version:2,baseline:prior.baseline,history:[{word:'beginning',got:'begining',ok:false}],mastery:{P2:{secure:true}}};
  const oldRaw=JSON.stringify(old),migrated=makeApp({spell_with_ry_governed_v2:oldRaw});
  assert.equal(migrated.storage.get('spell_with_ry_governed_v2'),oldRaw,'Migration must not overwrite the original key.');
  assert.equal(migrated.api.getState().legacySnapshots[0].data.history[0].got,'begining');
  assert.equal(migrated.api.mastery('A7').secure,false,'Legacy secure flag cannot award mastery.');
  assert.match(baselineApp.api.diagnose({word:'planning',skill:'A7'},'plan'),/Ending omitted/,'Base-only response must not be reduced to a doubling error.');
  assert.match(baselineApp.api.diagnose({word:'misunderstood',skill:'A10'},'missunderstood'),/Prefix boundary/);
  assert.match(baselineApp.api.diagnose({word:'choice',skill:'A8'},'choise'),/Soft c/);
  assert.match(baselineApp.api.diagnose({word:'ordinary',skill:'A16'},'ordanary'),/middle vowel/);
  console.log('PASS exact baseline, typed responses, legacy archive, and completion preserved');

  const lessons=baselineApp.context.STAR_LESSONS;
  assert.equal(lessons.length,18);
  let count=0;
  for(const l of lessons){
    assert.equal(l.words.length,8);assert.equal(l.transfer.length,16);
    assert.equal(new Set([l.check.correct,...l.check.wrong]).size,4);
    for(const w of [...l.words,...l.transfer]){
      count++;
      assert.equal(w.map.replace(/[ •]/g,''),w.word,`Map must preserve every letter: ${w.word}`);
      assert(w.sentence.toLowerCase().includes(w.word.toLowerCase()),`A contextual sentence must use its exact target: ${w.word}`);
      assert(!w.sentence.includes('_'));
    }
  }
  assert.equal(count,432);
  console.log('PASS all 18 lessons, 432 word contexts, chunk maps, and distinct answer choices');

  const app=makeApp();app.click('audio');app.click('voice-preview');await app.flush();app.click('voice-approve');
  assert(app.api.getState().audio.qc,'Voice must be explicitly approved after full playback.');
  app.click('learn',{code:'A7'});app.click('next');app.click('next');
  let q=app.api.getState().active.queue[2];app.click('choice',{index:String(q.correctPositions[0])});app.click('next');
  const firstWord=app.context.STAR_LESSONS.find(l=>l.code==='A7').words[0];
  assert(!app.element('#app').innerHTML.includes(firstWord.word),'Independent-style dictation screen must hide the target.');
  app.click('listen');await app.flush();app.element('#answer').value='planing';app.element('#heard-clear').checked=true;app.submit();
  const first=app.api.getState().firstAttempts.at(-1);assert.equal(first.correct,false);
  assert.equal(first.independent,true,'Normal pronunciation without hints preserves response independence even in a lesson.');
  app.click('cover-retry');app.element('#correction').value='planning';app.click('retry');
  assert.equal(app.api.getState().firstAttempts.find(a=>a.id===first.id).correct,false,'A correction must never change a first attempt.');
  assert.equal(app.api.getState().corrections.at(-1).correct,true);
  app.click('next');assert.equal(app.api.getState().active.queue[app.api.getState().active.index].stage,'repair','A miss must be followed by a parallel item.');
  console.log('PASS first miss remains a miss after correction; parallel reteaching follows');

  const independent=makeApp();independent.click('audio');independent.click('voice-preview');await independent.flush();independent.click('voice-approve');independent.click('mastery',{code:'A7'});
  let initialState=independent.api.getState();assert.equal(initialState.active.queue.length,10);
  assert.equal(initialState.active.queue.filter(q=>q.unfamiliar).length,2);
  let failed=false;
  for(let i=0;i<10;i++){
    let state=independent.api.getState(),q=state.active.queue[state.active.index],w=independent.context.STAR_LESSONS.flatMap(l=>[...l.words,...l.transfer]).find(w=>w.id===q.wordId);
    assert(!independent.element('#app').innerHTML.includes(w.word),'No target may be visually exposed before submission.');
    const spokenStart=independent.speech.length;
    independent.click('listen');await independent.flush();
    assert.deepEqual(independent.speech.slice(spokenStart).map(s=>s.text),[w.word+'.',w.sentence,w.word+'.'],'Dictation must say word, sentence, word.');
    if(i===0){independent.click('listen');await independent.flush();independent.click('listen');await independent.flush();}
    const miss=!q.unfamiliar&&!failed;failed ||= miss;
    independent.element('#answer').value=miss?w.word+'z':w.word;independent.element('#heard-clear').checked=true;independent.submit();
    assert(!independent.element('#feedback').innerHTML.includes(w.word),'Independent check feedback must not reveal the answer before the check ends.');
    independent.click('next');
  }
  const check=independent.api.getState().checks.at(-1);assert.equal(check.rate,90);assert.equal(check.transferRight,2);assert(independent.api.validCheck(check));assert.equal(independent.api.getState().firstAttempts[0].audio.replays,3);assert(independent.api.getState().firstAttempts[0].independent,'Normal replay keeps independence.');
  independent.click('mastery',{code:'A7'});assert.equal(independent.api.getState().active,null,'A second same-day check cannot count.');
  console.log('PASS word–sentence–word, unlimited independent replays, hidden targets, actual 90% scoring, and day spacing');

  const low=makeApp(),start=low.now();addChecks(low,[{at:start,right:8},{at:start+DAY,right:8}]);assert.equal(low.api.mastery('A7').secure,false);
  const sameDay=makeApp();addChecks(sameDay,[0,1,2,3].map(i=>({at:start+i*3600000})));assert.equal(sameDay.api.mastery('A7').secure,false);
  const supported=makeApp();addChecks(supported,[0,1,2,3].map(i=>({at:start+i*DAY,assisted:i===2})));assert.equal(supported.api.mastery('A7').secure,false);
  const reused=makeApp();addChecks(reused,[0,1,2,3].map(i=>({at:start+i*DAY,reusedTransfer:true})));assert.equal(reused.api.mastery('A7').secure,false);
  const gate=makeApp();addChecks(gate,[0,1,2,3].map(i=>({at:start+i*DAY})));let m=gate.api.mastery('A7');assert.equal(m.status,'retention');assert.equal(m.secure,false);
  const anchor=m.anchor;addChecks(gate,[{at:anchor+DAY,kind:'retention',anchor,delay:2}]);assert.equal(gate.api.mastery('A7').secure,false,'An early review cannot satisfy delay.');
  addChecks(gate,[{at:anchor+2*DAY,kind:'retention',anchor,delay:2}]);assert.equal(gate.api.mastery('A7').delay,7);
  addChecks(gate,[{at:anchor+7*DAY,kind:'retention',anchor,delay:7}]);assert.equal(gate.api.mastery('A7').secure,true);
  console.log('PASS 80%, supported evidence, same-day checks, reused transfer, and early retrieval cannot award mastery; 4 checks + 2 delays can');

  const repair=makeApp();addChecks(repair,[0,1,2,3].map(i=>({at:start+i*DAY})));let r=repair.api.mastery('A7');addChecks(repair,[{at:r.anchor+2*DAY,kind:'retention',anchor:r.anchor,delay:2,right:8}]);r=repair.api.mastery('A7');assert.equal(r.status,'repair');assert.equal(r.due,r.anchor+4*DAY);addChecks(repair,[{at:r.anchor+2*DAY+1000,kind:'retention',anchor:r.anchor,delay:2}]);assert.equal(repair.api.mastery('A7').status,'repair','Immediate retest after failure is not delayed retention.');
  console.log('PASS a failed delayed check requires repair and a fresh waiting interval');

  const saved=gate.api.getState(),n=saved.firstAttempts.length;gate.api.mergeProgress(saved);assert.equal(gate.api.getState().firstAttempts.length,n,'Reimport must not duplicate attempts.');
  const conflict=JSON.parse(JSON.stringify(saved));conflict.firstAttempts[0].response='different';gate.api.mergeProgress(conflict);assert.equal(gate.api.getState().firstAttempts[0].response,saved.firstAttempts[0].response);assert(gate.api.getState().importConflicts.length);
  gate.click('flag-audio',{attempt:gate.api.getState().firstAttempts[0].id});assert.equal(gate.api.mastery('A7').secure,false,'Later audio QC issue must revoke the affected evidence.');
  console.log('PASS append-only merge, conflict preservation, and retrospective invalid-audio exclusion');

  const unclear=makeApp();unclear.click('audio');unclear.click('voice-preview');await unclear.flush();unclear.click('voice-approve');unclear.click('mastery',{code:'A7'});unclear.click('unclear');
  assert.equal(unclear.api.getState().firstAttempts.at(-1).correct,null);assert.equal(unclear.api.getState().firstAttempts.at(-1).audioValid,false);assert.equal(unclear.api.getState().reviewQueue.length,0,'An audio issue is not a spelling miss.');
  console.log('PASS unclear audio is excluded without creating a false spelling error');

  const peek=makeApp();peek.click('audio');peek.click('voice-preview');await peek.flush();peek.click('voice-approve');peek.click('mastery',{code:'A7'});peek.click('parent');assert.equal(peek.api.getState().active.assisted,true,'An answer-bearing parent view cannot leave a check independent.');
  console.log('PASS viewing prior spellings switches an active check to supported practice');

  const placement=makeApp();placement.click('audio');placement.click('voice-preview');await placement.flush();placement.click('voice-approve');placement.click('placement');
  assert(placement.api.getState().active.queue.length<=10);
  assert(placement.api.getState().active.queue[0].placementSkill===placement.api.priorityCodes()[0]);
  for(let i=0;i<3;i++){placement.click('listen');await placement.flush();placement.element('#answer').value='wrong';placement.element('#heard-clear').checked=true;placement.submit();placement.click('next');}
  assert.equal(placement.api.getState().active,null,'Placement should stop early at an established instructional gap.');assert.equal(placement.api.getState().placementChecks.length,1);assert.equal(placement.api.getState().checks.length,0);assert.equal(placement.api.getState().current,placement.api.priorityCodes()[0]);
  console.log('PASS prior-informed adaptive placement stops after 3 items at a clear gap and never awards mastery');
  console.log('All regression checks passed. Actual voice sound and device layout need browser/listener QC.');
})().catch(error=>{console.error(error);process.exitCode=1;});
