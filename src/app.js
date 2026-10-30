const header=document.getElementById('site-header');
const progress=document.querySelector('.scroll-progress');
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');

function onScroll(){
  header?.classList.toggle('scrolled',window.scrollY>12);
  if(progress){const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=`${max>0?Math.min(100,window.scrollY/max*100):0}%`;}
}
onScroll();window.addEventListener('scroll',onScroll,{passive:true});

menu?.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open menu');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu-open')){document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');menu?.focus();}});

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}},{threshold:.1,rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

const filters=document.querySelectorAll('.filter-btn');
const cards=document.querySelectorAll('.all-projects .project-card');
filters.forEach(btn=>btn.addEventListener('click',()=>{
  const filter=btn.dataset.filter;
  filters.forEach(x=>{const active=x===btn;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});
  cards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;});
}));

document.querySelectorAll('[data-copy-email]').forEach(btn=>btn.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(btn.dataset.copyEmail);btn.textContent='Copied';setTimeout(()=>btn.textContent='Copy address',2500);}
  catch{btn.textContent='Select the address above to copy';}
}));

const form=document.getElementById('contact-form');
form?.addEventListener('submit',e=>{
  e.preventDefault();
  const status=document.getElementById('form-status');
  const data=new FormData(form);
  const name=String(data.get('name')||'').trim();
  const email=String(data.get('email')||'').trim();
  const phone=String(data.get('phone')||'').trim();
  const enquiry=String(data.get('enquiry')||'Project enquiry').trim();
  const message=String(data.get('message')||'').trim();
  if(!name||!email||!message){status.textContent='Please enter your name, email and message.';return;}
  const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!validEmail){status.textContent='Please enter a valid email address.';return;}
  const subject=encodeURIComponent(`${enquiry} from ${name}`);
  const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}${phone?`\nPhone: ${phone}`:''}\nEnquiry: ${enquiry}\n\n${message}`);
  status.textContent='Opening your email app. Please send the prepared message there.';
  window.location.href=`mailto:Manoeuvreinfra258@gmail.com?subject=${subject}&body=${body}`;
});

if(!reduced){
  document.querySelectorAll('.precision-card,.principle').forEach(card=>{
    const icon=card.querySelector('.geo-icon');if(!icon)return;
    card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;icon.style.transform=`rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-3px)`;});
    card.addEventListener('pointerleave',()=>icon.style.transform='');
  });
}
