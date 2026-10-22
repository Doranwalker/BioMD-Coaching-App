'use strict';
const SCENARIOS = {
  workload: {
    title: 'Workload concerns', avatar: 'S', colleague: 'Sam',
    opening: "I'm exhausted. Every week there's another expectation, and I don't think leadership understands what we're carrying. Everyone's just supposed to make it work.",
    guided: [
      "I appreciate you saying that, but the requests keep coming and we're already stretched. What's actually going to change?",
      "We raised this at the last meeting. I haven't heard what happened with any of those concerns.",
      "I could help identify the biggest bottlenecks, but I need to know someone will follow through."
    ]
  },
  change: {
    title: 'Resistance to change', avatar: 'J', colleague: 'Jordan',
    opening: "We weren't even consulted before this new workflow was announced. I've been doing this for 15 years, and I don't see how it's going to work with our staffing.",
    guided: [
      "That's part of the problem. It seems like the decision was made before anyone asked us how work actually happens.",
      "There are two handoffs we're already struggling with. This change adds another one unless we adjust the process.",
      "I'd be willing to test it, but I don't want feedback collected and ignored again."
    ]
  },
  accountability: {
    title: 'Accountability', avatar: 'M', colleague: 'Morgan',
    opening: "I know those deadlines were missed, but I've had competing priorities all month. It feels unfair that this is being brought up without considering everything else I've done.",
    guided: [
      "I'm not saying the deadlines don't matter. I'm saying nobody helped me prioritize when everything became urgent.",
      "I can take responsibility for communicating earlier. I also need a clear decision about what comes first.",
      "If we agree on the priorities and a check-in, I can give you a realistic completion date."
    ]
  },
  conflict: {
    title: 'Team conflict', avatar: 'A', colleague: 'Alex',
    opening: "I keep being blamed when things fall through, but nobody has agreed on who's responsible for what. I've tried to raise this and now everyone's annoyed with me.",
    guided: [
      "The handoff is unclear. Sometimes they think I've done it, and I think they're doing it. Then I get blamed.",
      "I'd be comfortable sitting down together, but I don't want this to become a meeting where everyone's pointing fingers.",
      "If we write down ownership and what to do when something gets missed, that would help."
    ]
  }
};
const DIMENSION_META = [
  { key:'listening', label:'Listening' },
  { key:'clarity', label:'Clarity' },
  { key:'empathy', label:'Empathy' },
  { key:'accountability', label:'Accountability' },
  { key:'action_orientation', label:'Action orientation' },
  { key:'emotional_steadiness', label:'Emotional steadiness' }
];
const BRAND = {
  navy:'#10293b', deep:'#091f32', teal:'#3ea694', lime:'#c8f36b', coral:'#ffb78d', blue:'#92d2f2', cream:'#f7f7f0', text:'#163241', muted:'#68807a', white:'#ffffff', soft:'#eef7f2'
};
const $ = id => document.getElementById(id);
const state = { scenario: 'workload', difficulty:'realistic', live:false, sessionLive:false, turns:0, messages:[], busy:false, feedback:null };
let toastTimer;

function toast(message){const el=$('toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),4200)}
function toggleDisplay(section){ for(const id of ['intro','choose','session','feedback']) { if(id==='intro'||id==='choose'){ $(id).classList.toggle('hidden',section!=='choose') } else {$(id).classList.toggle('hidden', id!==section)} } if(section==='choose'){$('choose').scrollIntoView({behavior:'smooth',block:'start'})} else {$(section).scrollIntoView({behavior:'smooth',block:'start'});$(section).focus({preventScroll:true})}}
function chooseScenario(id){if(!SCENARIOS[id])return;state.scenario=id;document.querySelectorAll('[data-scenario]').forEach(el=>{const selected=el.dataset.scenario===id;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected))})}
function chooseDifficulty(d){if(!['supportive','realistic','challenging'].includes(d))return;state.difficulty=d;document.querySelectorAll('[data-difficulty]').forEach(el=>{const selected=el.dataset.difficulty===d;el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected))})}
function scrollChat(){const c=$('chatMessages'); c.scrollTop=c.scrollHeight}
function appendMessage(role,text,loading=false){const messages=$('chatMessages');const wrapper=document.createElement('div');wrapper.className='message '+(role==='leader'?'me':'colleague');const avatar=document.createElement('div');avatar.className='message-avatar';avatar.textContent=role==='leader'?'YOU':SCENARIOS[state.scenario].avatar;const body=document.createElement('div');body.className='message-body';const label=document.createElement('small');label.textContent=role==='leader'?'YOU':SCENARIOS[state.scenario].colleague.toUpperCase();const p=document.createElement('p');p.textContent=text;if(loading) p.classList.add('loading-dots');body.append(label,p);wrapper.append(avatar,body);messages.append(wrapper);scrollChat();return wrapper}
function setBusy(value){state.busy=value;$('sendButton').disabled=value;$('userMessage').disabled=value;$('finishEarlyButton').disabled=value||state.turns<2;$('beginButton').disabled=value;$('sendButton').textContent=value?'···':'➤'}
function updateProgress(){$('turnCounter').textContent=`${state.turns} of 4 responses`;$('finishEarlyButton').disabled=state.turns<2||state.busy}
function beginSession(){state.sessionLive=state.live;state.turns=0;state.messages=[];state.feedback=null;setBusy(false);$('chatMessages').replaceChildren();$('userMessage').value='';const s=SCENARIOS[state.scenario];$('scenarioLabel').textContent=s.title;$('difficultyLabel').textContent=state.difficulty[0].toUpperCase()+state.difficulty.slice(1);$('modeLabel').textContent=state.sessionLive?'Live AI role-play':'Guided demonstration';$('modelStatus').textContent=state.sessionLive?'AI powered':'Guided demo';$('privacyReminder').textContent=state.sessionLive?'Fictional details only. Your chat is processed by an external AI service.':'Guided demo. Do not enter real employee or patient details.';appendMessage('employee',s.opening);state.messages.push({role:'employee',text:s.opening});updateProgress();toggleDisplay('session');$('userMessage').focus({preventScroll:true})}
async function sendToCoach(mode){const resp=await fetch('/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:state.scenario,difficulty:state.difficulty,mode,messages:state.messages})});let payload={};try{payload=await resp.json()}catch{}if(!resp.ok)throw new Error(payload.error||'The coaching service is unavailable. Please try again.');return payload}
function guidedReply(){const script=SCENARIOS[state.scenario].guided;let line=script[Math.min(state.turns-1,script.length-1)];const last=state.messages[state.messages.length-1]?.text||'';if(state.turns===1&&/\b(sorry|understand|hear|difficult|frustrat)/i.test(last)) line="Thanks for recognizing that. I still need to understand what might actually change, because our previous concerns haven't led to much.";else if(state.turns===1&&/\b(your job|just do|policy|no choice|stop)/i.test(last))line="I'm trying to be honest with you, but that makes it sound like I shouldn't have raised the concern.";return line}
function inferStyleLabel({acknowledged,asked,next,steady}){if(acknowledged&&asked&&next&&steady)return 'Calm, collaborative, action-oriented';if(acknowledged&&asked)return 'Curious and relationship-oriented';if(next&&steady)return 'Direct and action-focused';return 'Solution-first under pressure'}
function guidedFeedback(){const leader=state.messages.filter(x=>x.role==='leader').map(x=>x.text);const all=leader.join(' ');const acknowledged=/\b(hear|understand|appreciate|thank|frustrat|difficult|concern|sorry|stress|challeng|feel|overwhelm)/i.test(all);const asked=leader.some(x=>x.includes('?'));const next=/\b(next|follow\s?up|meet|check\s?in|by (monday|tuesday|wednesday|thursday|friday)|let's|agree|plan|schedule|review)/i.test(all);const steady=!/\b(always|never|obviously|just|simply)\b/i.test(all);const direct=/\b(expect|need|deadline|priority|must|responsib)/i.test(all);const overall=56 + (acknowledged?10:0) + (asked?8:0) + (next?9:0) + (steady?6:0) + (direct?5:0);
const dimension_scores={
  listening: acknowledged ? 78 : 56,
  clarity: direct ? 76 : 62,
  empathy: acknowledged ? 75 : 50,
  accountability: direct ? 74 : 58,
  action_orientation: next ? 80 : 57,
  emotional_steadiness: steady ? 77 : 61
};
let strength=asked?'You invited the colleague to explain their perspective.':'You stayed in the conversation and practised responding instead of avoiding it.';
let suggestion=acknowledged?'Make sure the colleague’s concern leads to a concrete action, rather than reassurance alone.':'Try naming the concern you heard before moving to a solution.';
if(!asked)suggestion='Ask one open question to understand the employee’s experience before offering a solution.';
if(!next&&asked&&acknowledged)suggestion='End with an agreed next step, owner, and follow-up time.';
const phrase=state.scenario==='accountability'?"I understand you’ve had competing priorities. Can we review what got in the way and agree on the next deadline and when you’ll flag a risk?":state.scenario==='change'?"I can hear that the rollout felt disconnected from your day-to-day work. Which part of the new process worries you most, and what should we test before expanding it?":state.scenario==='conflict'?"I want to understand where ownership is unclear. Can we map the handoff together and agree how the team should handle exceptions?":"I hear that the workload feels unsustainable. Which demand is causing the most difficulty right now, and what can we realistically adjust this week?";
const firstLine=leader[0]||'';
const lastLine=leader.at(-1)||'';
return {
  summary:'You completed a fictional practice conversation. This reflection uses simple pattern checks to show how your approach may have landed in the conversation.',
  overall_score: Math.min(92, overall),
  style_label: inferStyleLabel({acknowledged,asked,next,steady}),
  main_theme: acknowledged ? (next ? 'Good empathy with an opportunity to sharpen follow-through.' : 'You recognised the concern. The next coaching edge is turning that into a concrete plan.') : 'The main opportunity is to slow down, acknowledge the concern, and explore before solving.',
  dimension_scores,
  strengths:[strength,acknowledged?'You used language that recognised the colleague’s concern.':'You gave yourself space to practise a challenging leadership situation.',next?'You pointed toward next steps instead of leaving the issue vague.':'You stayed engaged rather than shutting down the conversation.'],
  improvements:[suggestion,next?'Follow up on the commitments you make, including who owns each action.':'Agree on who will do what and when you will reconnect.',steady?'Push a little further into the other person’s perspective before moving to a solution.':'Watch for language that may sound minimizing or abrupt under pressure.'],
  moment_analysis:[
    {quote:firstLine.slice(0,110),effect:asked?'Opened some room for dialogue.':'Moved quickly into your position without much exploration.',coaching:asked?'Keep pairing curiosity with acknowledgment so the colleague feels heard.':'Start by naming the concern you heard, then ask one open question.'},
    {quote:lastLine.slice(0,110),effect:next?'Helped the conversation move toward action.':'Left the conversation without a clear commitment or follow-up.',coaching:next?'Make the next step specific: who, what, and by when.':'End with one clear next step and a check-in point.'}
  ],
  retry_phrase:phrase,
  next_step:'Run the same scenario once more and try a stronger opening that combines acknowledgment, one open question, and a clearer next step.',
  demo:true
};}
async function submitMessage(e){e.preventDefault();if(state.busy||state.turns>=4)return;const field=$('userMessage');const input=field.value.trim();if(input.length<5){toast('Write a little more so the colleague has something to respond to.');return}if(input.length>1100){toast('Keep your response under 1,100 characters.');return}field.value='';appendMessage('leader',input);state.messages.push({role:'leader',text:input});state.turns++;updateProgress();setBusy(true);
try{if(state.turns>=4){await finishSession();return}let reply;if(state.sessionLive){const result=await sendToCoach('reply');reply=result.reply;if(typeof reply!=='string'||!reply.trim())throw new Error('No response returned. Please retry.')}else{await new Promise(r=>setTimeout(r,320));reply=guidedReply()}appendMessage('employee',reply);state.messages.push({role:'employee',text:reply});}
catch(error){state.messages.pop();state.turns--;const last=$('chatMessages').lastElementChild;if(last&&last.classList.contains('me'))last.remove();field.value=input;updateProgress();toast(error.message||'Something went wrong. Please try again.')}finally{setBusy(false);updateProgress();field.focus({preventScroll:true})}}
async function finishSession(){if(state.turns<2){toast('Respond at least twice before getting feedback.');setBusy(false);return}setBusy(true);try{const result=state.sessionLive?await sendToCoach('debrief'):guidedFeedback();state.feedback=result.feedback||result;if(!state.feedback||typeof state.feedback.summary!=='string')throw new Error('The debrief could not be generated.');renderFeedback();toggleDisplay('feedback')}catch(error){toast(error.message||'Could not finish your practice. Please retry.')}finally{setBusy(false)}}
function makeText(tag,text,klass){const el=document.createElement(tag);el.textContent=text;if(klass)el.className=klass;return el}
function feedbackCard(title,subtitle,items,highlight=false){const c=document.createElement('article');c.className='feedback-card'+(highlight?' highlight':'');c.append(makeText('div',subtitle,'mini-cap'),makeText('h3',title));if(Array.isArray(items)){const list=document.createElement('ul');items.forEach(item=>list.append(makeText('li',String(item))));c.append(list)}else c.append(makeText('p',items));return c}
function renderScoreBars(scores){const card=document.createElement('article');card.className='feedback-card';card.append(makeText('div','COACHING DIMENSIONS','mini-cap'),makeText('h3','Your conversation dashboard'));
  const wrap=document.createElement('div');wrap.className='score-bars';
  DIMENSION_META.forEach(({key,label})=>{const row=document.createElement('div');row.className='score-row';const top=document.createElement('div');top.className='score-row-top';top.append(makeText('span',label),makeText('strong',String(Math.round(scores[key]||0))));const track=document.createElement('div');track.className='score-track';const fill=document.createElement('div');fill.className='score-fill';fill.style.width=`${Math.max(0,Math.min(100,Math.round(scores[key]||0)))}%`;track.append(fill);row.append(top,track);wrap.append(row);});
  card.append(wrap);return card;
}
function renderMoments(items){const card=document.createElement('article');card.className='feedback-card';card.append(makeText('div','MOMENT ANALYSIS','mini-cap'),makeText('h3','What specific moments signalled'));
  const list=document.createElement('div');list.className='moments-list';
  (items||[]).slice(0,3).forEach(item=>{const box=document.createElement('div');box.className='moment-item';box.append(makeText('p',`“${item.quote}”`,'moment-quote'));const meta=document.createElement('p');meta.innerHTML=`<strong>Effect:</strong> ${escapeHtml(item.effect)}`;const coach=document.createElement('p');coach.innerHTML=`<strong>Coach:</strong> ${escapeHtml(item.coaching)}`;box.append(meta,coach);list.append(box);});
  card.append(list);return card;
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderFeedback(){const d=state.feedback;const region=$('feedbackContent');region.replaceChildren();const summary=feedbackCard(d.demo?'Practice reflection ready':'Your leadership reflection',d.demo?'GUIDED DEMO — ILLUSTRATIVE FEEDBACK':'AI-GENERATED COACHING DASHBOARD',d.summary);const heroStats=document.createElement('div');heroStats.className='hero-stats';const pill=document.createElement('div');pill.className='score-pill';pill.innerHTML=`<span>Overall</span><strong>${Math.round(d.overall_score||0)}</strong>`;const meta=document.createElement('div');meta.className='hero-meta';meta.append(makeText('p',d.style_label,'hero-style'),makeText('p',d.main_theme,'hero-theme'));heroStats.append(pill,meta);summary.append(heroStats);region.append(summary,renderScoreBars(d.dimension_scores||{}));region.append(feedbackCard('What worked','STRENGTHS',Array.isArray(d.strengths)?d.strengths:[]));region.append(feedbackCard('What to refine','WATCH-OUTS',Array.isArray(d.improvements)?d.improvements:[]));region.append(renderMoments(d.moment_analysis||[]));region.append(feedbackCard('A phrase worth trying','TRY THIS NEXT',d.retry_phrase||'',true));region.append(feedbackCard('Recommended next move','PUT IT INTO PRACTICE',d.next_step||''));}
function wrapText(ctx,text,maxWidth){const words=String(text).split(/\s+/);const lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width<=maxWidth)line=test;else{if(line)lines.push(line);line=word;}}if(line)lines.push(line);return lines;}
function drawWrappedText(ctx,text,x,y,maxWidth,lineHeight,maxLines,color=BRAND.text,font){if(font)ctx.font=font;ctx.fillStyle=color;const lines=wrapText(ctx,text,maxWidth).slice(0,maxLines);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;}
function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
async function downloadDashboardJpg(){
  if(!state.feedback){toast('Finish a practice conversation first.');return}
  const d=state.feedback; const scenario=SCENARIOS[state.scenario];
  const canvas=document.createElement('canvas'); canvas.width=1080; canvas.height=1350; const ctx=canvas.getContext('2d');
  const g=ctx.createLinearGradient(0,0,1080,1350); g.addColorStop(0,'#0d2a3b'); g.addColorStop(.45,'#184d63'); g.addColorStop(1,'#3ea694'); ctx.fillStyle=g; ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.beginPath(); ctx.arc(950,120,220,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(120,1240,260,0,Math.PI*2); ctx.fill();
  const cardX=54, cardY=48, cardW=972, cardH=1254; roundRect(ctx,cardX,cardY,cardW,cardH,36,'#f7f7f0');
  ctx.fillStyle=BRAND.navy; ctx.font='700 26px Arial'; ctx.fillText('BioMD LEADERSHIP CONVERSATION COACH',92,108);
  ctx.fillStyle='#5f7d74'; ctx.font='600 20px Arial'; ctx.fillText(`${scenario.title}  ·  ${state.difficulty[0].toUpperCase()+state.difficulty.slice(1)}  ·  ${d.demo?'Guided demo':'AI role-play'}`,92,144);
  // score block
  roundRect(ctx,92,178,250,170,28,BRAND.navy); ctx.fillStyle='#d7fc86'; ctx.font='700 22px Arial'; ctx.fillText('OVERALL EFFECTIVENESS',118,224); ctx.fillStyle='#ffffff'; ctx.font='700 76px Arial'; ctx.fillText(String(Math.round(d.overall_score||0)),118,304); ctx.font='600 18px Arial'; ctx.fillText('/ 100',235,304);
  roundRect(ctx,364,178,600,170,28,'#ecf7f2'); ctx.fillStyle=BRAND.navy; ctx.font='700 24px Arial'; ctx.fillText(d.style_label||'Leadership reflection',392,226); ctx.fillStyle='#42615b'; ctx.font='500 24px Arial'; drawWrappedText(ctx,d.main_theme||'',392,266,540,32,3,'#42615b','500 24px Arial');
  // dimension card
  roundRect(ctx,92,372,420,362,26,'#ffffff','#d9e9e2'); ctx.fillStyle=BRAND.navy; ctx.font='700 24px Arial'; ctx.fillText('CONVERSATION DASHBOARD',118,414);
  let rowY=450; DIMENSION_META.forEach(({key,label})=>{const score=Math.max(0,Math.min(100,Math.round((d.dimension_scores||{})[key]||0))); ctx.fillStyle='#5d7c73'; ctx.font='600 18px Arial'; ctx.fillText(label,118,rowY); ctx.fillStyle=BRAND.navy; ctx.font='700 18px Arial'; ctx.fillText(String(score),428,rowY); roundRect(ctx,118,rowY+16,320,13,8,'#e8efec'); roundRect(ctx,118,rowY+16,Math.max(16,320*score/100),13,8,score>=80?BRAND.teal:score>=65?BRAND.blue:BRAND.coral); rowY+=48;});
  // strengths & watchouts
  roundRect(ctx,532,372,432,174,26,'#ffffff','#d9e9e2'); ctx.fillStyle=BRAND.navy; ctx.font='700 22px Arial'; ctx.fillText('WHAT WORKED',558,412); let y=444; ctx.font='500 18px Arial'; ctx.fillStyle='#34524f'; (d.strengths||[]).slice(0,3).forEach(item=>{ctx.fillStyle=BRAND.teal; ctx.beginPath(); ctx.arc(565,y-6,4,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#34524f'; y=drawWrappedText(ctx,item,580,y,352,24,3,'#34524f','500 18px Arial')+12;});
  roundRect(ctx,532,560,432,174,26,'#ffffff','#d9e9e2'); ctx.fillStyle=BRAND.navy; ctx.font='700 22px Arial'; ctx.fillText('WHAT TO REFINE',558,600); y=632; ctx.font='500 18px Arial'; (d.improvements||[]).slice(0,3).forEach(item=>{ctx.fillStyle=BRAND.coral; ctx.beginPath(); ctx.arc(565,y-6,4,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#34524f'; y=drawWrappedText(ctx,item,580,y,352,24,3,'#34524f','500 18px Arial')+12;});
  // moments
  roundRect(ctx,92,760,872,258,26,'#ffffff','#d9e9e2'); ctx.fillStyle=BRAND.navy; ctx.font='700 22px Arial'; ctx.fillText('MOMENT ANALYSIS',118,800); let boxY=828; (d.moment_analysis||[]).slice(0,2).forEach((m,idx)=>{roundRect(ctx,118 + idx*420, boxY, 394, 162, 20,'#f5fbf8'); ctx.fillStyle=BRAND.navy; ctx.font='700 16px Arial'; drawWrappedText(ctx,`“${m.quote}”`,138+idx*420,858,350,22,3,BRAND.navy,'700 16px Arial'); ctx.fillStyle='#5b7a74'; ctx.font='600 14px Arial'; ctx.fillText('Effect',138+idx*420,920); ctx.font='500 14px Arial'; drawWrappedText(ctx,m.effect,138+idx*420,940,350,19,2,'#405b58','500 14px Arial'); ctx.fillStyle='#5b7a74'; ctx.font='600 14px Arial'; ctx.fillText('Coach',138+idx*420,980); ctx.font='500 14px Arial'; drawWrappedText(ctx,m.coaching,138+idx*420,1000,350,19,2,'#405b58','500 14px Arial');});
  // retry phrase
  roundRect(ctx,92,1040,872,178,26,BRAND.navy); ctx.fillStyle='#d7fc86'; ctx.font='700 20px Arial'; ctx.fillText('TRY THIS PHRASE NEXT TIME',118,1082); ctx.fillStyle='#ffffff'; drawWrappedText(ctx,d.retry_phrase||'',118,1124,820,30,4,'#ffffff','600 24px Arial');
  ctx.fillStyle='#5a736c'; ctx.font='600 14px Arial'; ctx.fillText('AI-generated coaching reflection for practice and learning only — not a formal assessment.',92,1255); ctx.fillStyle=BRAND.navy; ctx.font='700 14px Arial'; ctx.fillText('biomdconsulting.com',856,1255);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.92)); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`BioMD-Leadership-Dashboard-${scenario.title.replace(/[^a-z0-9]+/ig,'-')}.jpg`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
async function detectMode(){try{const resp=await fetch('/api/status',{cache:'no-store',signal:AbortSignal.timeout(4500)});if(resp.ok){const value=await resp.json();state.live=Boolean(value.aiReady)}}catch{} $('privacyStatus').textContent='Avoid real names and private details'}
function init(){ $('year').textContent=new Date().getFullYear();document.querySelectorAll('[data-scenario]').forEach(el=>el.addEventListener('click',()=>chooseScenario(el.dataset.scenario)));document.querySelectorAll('[data-difficulty]').forEach(el=>el.addEventListener('click',()=>chooseDifficulty(el.dataset.difficulty)));$('beginButton').addEventListener('click',beginSession);$('changeScenarioButton').addEventListener('click',()=>toggleDisplay('choose'));$('messageForm').addEventListener('submit',submitMessage);$('userMessage').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('messageForm').requestSubmit()}});$('finishEarlyButton').addEventListener('click',finishSession);$('retryButton').addEventListener('click',beginSession);$('anotherButton').addEventListener('click',()=>toggleDisplay('choose'));$('downloadButton').addEventListener('click',downloadDashboardJpg);detectMode()}
document.addEventListener('DOMContentLoaded',init);
