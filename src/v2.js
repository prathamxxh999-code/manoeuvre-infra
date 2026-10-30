const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const header=document.getElementById('header');
const menu=document.querySelector('.menu-toggle');
const mobileMenu=document.getElementById('mobile-menu');
const progress=document.querySelector('.scroll-progress');
const hero=document.getElementById('hero-scroll');
const heroCopy=document.querySelector('.hero-copy');
const heroBottom=document.querySelector('.hero-bottom');
const projectScroll=document.getElementById('project-scroll');
const track=document.querySelector('.showcase-track');
const projectIndex=document.getElementById('project-index');
let frame=0,projectProgress=0;
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));

function setMenu(open){
  document.body.classList.toggle('menu-open',open);
  menu?.setAttribute('aria-expanded',String(open));
  menu?.setAttribute('aria-label',open?'Close menu':'Open menu');
  if(mobileMenu)mobileMenu.inert=!open;
  if(open)mobileMenu.querySelector('a')?.focus();
}
menu?.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.body.classList.contains('menu-open')){setMenu(false);menu.focus();}
  if(event.key==='Tab'&&document.body.classList.contains('menu-open')){
    const nodes=[menu,...mobileMenu.querySelectorAll('a')];
    if(event.shiftKey&&document.activeElement===nodes[0]){event.preventDefault();nodes.at(-1).focus();}
    else if(!event.shiftKey&&document.activeElement===nodes.at(-1)){event.preventDefault();nodes[0].focus();}
  }
});

const wordHeadings=[...document.querySelectorAll('.word-reveal')];
wordHeadings.forEach(el=>{
  const text=el.textContent.trim();
  el.setAttribute('aria-label',text);
  el.textContent='';
  text.split(/\s+/).forEach((word,i)=>{const span=document.createElement('span');span.className='word';span.setAttribute('aria-hidden','true');span.textContent=word;el.append(span,document.createTextNode(' '));});
});

function updateScroll(){
  frame=0;
  const vh=innerHeight;
  header?.classList.toggle('scrolled',scrollY>30);
  if(progress){const max=document.documentElement.scrollHeight-vh;progress.style.width=`${max>0?clamp(scrollY/max)*100:0}%`;}
  if(reduced)return;
  if(hero){
    const rect=hero.getBoundingClientRect();const p=clamp(-rect.top/(hero.offsetHeight-vh));
    heroCopy.style.transform=`translateY(${-p*80}px)`;heroCopy.style.opacity=String(1-p*.5);
    heroBottom.style.transform=`translateY(${-p*30}px)`;
    window.dispatchEvent(new CustomEvent('site:hero-progress',{detail:p}));
  }
  if(projectScroll&&track){
    const rect=projectScroll.getBoundingClientRect();
    projectProgress=clamp(-rect.top/(projectScroll.offsetHeight-vh));
    const max=Math.max(0,track.scrollWidth-innerWidth);
    track.style.transform=`translate3d(${-projectProgress*max}px,0,0)`;
    const current=Math.round(projectProgress*2);
    projectIndex.textContent=String(current+1).padStart(2,'0');
    document.querySelector('.showcase-progress i').style.width=`${(1+projectProgress*2)/3*100}%`;
    track.querySelectorAll('.showcase-project').forEach((el,i)=>el.tabIndex=i===current?0:-1);
  }
  wordHeadings.forEach(el=>{const rect=el.getBoundingClientRect();const p=clamp((vh*.92-rect.top)/(vh*.65));const words=el.querySelectorAll('.word');words.forEach((w,i)=>w.classList.toggle('lit',i<Math.ceil(p*words.length)));});
  document.querySelectorAll('[data-parallax]').forEach(el=>{
    const rect=el.getBoundingClientRect();if(rect.bottom<0||rect.top>vh)return;
    const img=el.querySelector('img');if(img)img.style.transform=`translate3d(0,${clamp((rect.top-vh*.15)*-.1,-65,65)}px,0)`;
  });
  const cross=document.querySelector('.cross-mark');if(cross){const top=cross.getBoundingClientRect().top;cross.style.transform=`rotate(${(vh-top)*.08}deg)`;}
}
function schedule(){if(!frame)frame=requestAnimationFrame(updateScroll);}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',()=>{schedule();if(innerWidth>900)setMenu(false);},{passive:true});
document.fonts?.ready.then(schedule);schedule();

if(!reduced&&'IntersectionObserver'in window){
  document.body.classList.add('js-motion');
  const obs=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');obs.unobserve(x.target);}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
  const counterObs=new IntersectionObserver(entries=>entries.forEach(x=>{if(!x.isIntersecting)return;counterObs.unobserve(x.target);const target=Number(x.target.dataset.count);const start=performance.now();function tick(now){const p=clamp((now-start)/1400);x.target.textContent=Math.round(target*(1-Math.pow(1-p,3))).toLocaleString('en-IN');if(p<1)requestAnimationFrame(tick);}requestAnimationFrame(tick);}),{threshold:.8});
  document.querySelectorAll('[data-count]').forEach(el=>counterObs.observe(el));
}else document.querySelectorAll('.reveal,.word').forEach(el=>{el.classList.add('visible','lit');});

function stepProject(direction){if(!projectScroll)return;const next=clamp(Math.round(projectProgress*2)+direction,0,2);const top=projectScroll.offsetTop+next/2*(projectScroll.offsetHeight-innerHeight);window.scrollTo({top,behavior:reduced?'auto':'smooth'});}
document.querySelector('[data-project-prev]')?.addEventListener('click',()=>stepProject(-1));
document.querySelector('[data-project-next]')?.addEventListener('click',()=>stepProject(1));

const processItems=[...document.querySelectorAll('.process-item')];
processItems.forEach(item=>item.addEventListener('toggle',()=>{if(!item.open)return;processItems.forEach(x=>{if(x!==item)x.open=false});const img=document.getElementById('process-image');if(img){img.src=`/assets/${item.dataset.processImage}`;img.alt='Architectural illustration of precise concrete construction and blue glass detailing';}}));

const cards=[...document.querySelectorAll('.portfolio-grid .project-card')];
let activeFilter='all';
function filterProjects(){const q=(document.getElementById('project-search')?.value||'').trim().toLowerCase();let count=0;cards.forEach(card=>{const show=(activeFilter==='all'||card.dataset.category===activeFilter)&&card.dataset.search.includes(q);card.hidden=!show;if(show){count++;card.classList.add('visible');}});const result=document.querySelector('.project-results');if(result)result.textContent=`Showing ${count} project${count===1?'':'s'}${q?` for “${q}”`:''}`;const empty=document.querySelector('.no-results');if(empty)empty.hidden=count!==0;schedule();}
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;document.querySelectorAll('.filter').forEach(x=>{const yes=x===btn;x.classList.toggle('active',yes);x.setAttribute('aria-pressed',String(yes));});filterProjects();}));
document.getElementById('project-search')?.addEventListener('input',filterProjects);

const lightbox=document.querySelector('.lightbox');
document.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{lightbox.querySelector('img').src=button.dataset.lightbox;lightbox.querySelector('img').alt=button.dataset.caption;lightbox.querySelector('p').textContent=button.dataset.caption;lightbox.showModal();}));
document.querySelector('.lightbox-close')?.addEventListener('click',()=>lightbox.close());
lightbox?.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});

document.querySelectorAll('[data-copy-email]').forEach(btn=>btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(btn.dataset.copyEmail);btn.textContent='Email address copied';setTimeout(()=>btn.textContent='Copy email address',2500);}catch{btn.textContent='Select the email address above to copy';}}));
document.getElementById('contact-form')?.addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const status=document.getElementById('form-status');
  const name=String(data.get('name')||'').trim(),email=String(data.get('email')||'').trim(),message=String(data.get('message')||'').trim(),phone=String(data.get('phone')||'').trim(),enquiry=String(data.get('enquiry')||'Project enquiry');
  if(!name||!email||!message){status.textContent='Please enter your name, email address and message.';form.elements[!name?'name':!email?'email':'message'].focus();return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Please enter a valid email address.';form.elements.email.focus();return;}
  const subject=encodeURIComponent(`${enquiry} from ${name}`);const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}${phone?`\nPhone: ${phone}`:''}\nEnquiry: ${enquiry}\n\n${message}`);
  status.textContent='Opening your email app. Send the prepared message there to complete your enquiry.';
  location.href=`mailto:Manoeuvreinfra258@gmail.com?subject=${subject}&body=${body}`;
});
