(function(){
"use strict";
function ensureLoader(){
 if(document.getElementById('page-loader')) return;
 const d=document.createElement('div');
 d.id='page-loader'; d.setAttribute('aria-live','polite');
 d.innerHTML='<div class="loader-spinner" aria-hidden="true"></div><p id="loader-text">Loading, please wait…</p>';
 document.body.appendChild(d);
}
function showLoader(msg){
 ensureLoader();
 const l=document.getElementById('page-loader');
 if(msg) { const t=document.getElementById('loader-text'); if(t) t.textContent=msg; }
 l.classList.add('show');
}
function hideLoader(){ const l=document.getElementById('page-loader'); if(l) l.classList.remove('show'); }
window.SahaayaShowLoader=showLoader; window.SahaayaHideLoader=hideLoader;
function markActiveNav(){
 const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 document.querySelectorAll('.nav-link-btn').forEach(a=>{
  const href=(a.getAttribute('href')||'').toLowerCase();
  if(href.endsWith(file)) { a.classList.add('active'); a.setAttribute('aria-current','page'); }
 });
}
function setupMobileNav(){
 const nav=document.querySelector('.main-nav'); if(!nav) return;
 let btn=nav.querySelector('.nav-toggle');
 if(!btn){
  btn=document.createElement('button');
  btn.className='nav-toggle'; btn.type='button'; btn.setAttribute('aria-label','Open menu'); btn.setAttribute('aria-expanded','false');
  btn.innerHTML='☰';
  nav.prepend(btn);
 }
 let scrim=document.querySelector('.nav-scrim');
 if(!scrim){ scrim=document.createElement('div'); scrim.className='nav-scrim'; nav.after(scrim); }
 btn.onclick=()=>{ const open=nav.classList.toggle('open'); btn.setAttribute('aria-expanded',open?'true':'false'); btn.innerHTML=open?'✕':'☰'; scrim.classList.toggle('show',open); };
 scrim.onclick=()=>{ nav.classList.remove('open'); btn.innerHTML='☰'; scrim.classList.remove('show'); };
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ nav.classList.remove('open'); scrim.classList.remove('show'); btn.innerHTML='☰'; }));
}
function setupPageTransitions(){
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');
  if(!a) return;
  const href=a.getAttribute('href');
  if(!href||href.startsWith('#')||href.startsWith('javascript')||a.target==='_blank') return;
  showLoader('Loading, please wait…');
 });
 window.addEventListener('pageshow',hideLoader);
 setTimeout(hideLoader,2500);
}
function setupButtonLoading(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('.senior-btn'); if(!b) return;
  if(b.classList.contains('is-loading')) return;
  const needsLoad=b.id==='btn-login-submit'||b.id==='btn-finish-memory'||b.id==='btn-finish-attention'||b.dataset.loading==='true';
  if(needsLoad){ b.classList.add('is-loading'); setTimeout(()=>b.classList.remove('is-loading'),4000); }
 });
}
function setupReveal(){
 const els=document.querySelectorAll('.senior-card,.activity-card,.stat-tile,.ai-spotlight,.result-hero');
 els.forEach(el=>el.classList.add('reveal'));
 if(!('IntersectionObserver' in window)){ els.forEach(el=>el.classList.add('visible')); return; }
 const io=new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add('visible'); io.unobserve(x.target);} }),{threshold:.08});
 els.forEach(el=>io.observe(el));
}
function setupKeyboardCards(){
 document.querySelectorAll('.profile-choice-card').forEach(c=>{
  c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); c.click(); } });
 });
}
document.addEventListener('DOMContentLoaded',()=>{
 ensureLoader(); markActiveNav(); setupMobileNav(); setupPageTransitions(); setupButtonLoading(); setupReveal(); setupKeyboardCards(); hideLoader();
 const tb=document.getElementById('progress-history-tbody');
 if(tb && !tb.children.length && window.SAHAAYA_DEFAULT_HISTORY){
  tb.innerHTML='<tr><td colspan="6"><div class="skeleton" style="height:56px"></div></td></tr>';
  setTimeout(()=>{ if(window.SahaayaApp) window.SahaayaApp.hydrateProgressPage(); },450);
 }
});
})();
