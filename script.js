/* ===== Language Toggle ===== */
function setLang(lang){
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-th][data-en]').forEach(el=>{
    const text = el.getAttribute('data-'+lang);
    if(el.tagName === 'INPUT' && el.placeholder){
      el.placeholder = text;
    } else {
      el.innerHTML = text;
    }
  });
  const btnTh = document.getElementById('btnTh');
  const btnEn = document.getElementById('btnEn');
  if(btnTh) btnTh.classList.toggle('active', lang==='th');
  if(btnEn) btnEn.classList.toggle('active', lang==='en');
  try { localStorage.setItem('harmony_lang', lang); } catch(e){}
}

/* ===== Nav scroll effect ===== */
window.addEventListener('scroll', ()=>{
  const nav = document.getElementById('nav');
  if(nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ===== Hamburger + Reveal + Gallery Lightbox + Form ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if(hamburger && navMenu){
    hamburger.addEventListener('click', ()=> navMenu.classList.toggle('open'));
    navMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=> navMenu.classList.remove('open'));
    });
  }

  /* Gallery Lightbox */
  document.querySelectorAll('.gallery-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      const full = item.getAttribute('data-full');
      const lb = document.getElementById('lightbox');
      const img = document.getElementById('lightboxImg');
      if(lb && img){
        img.src = full;
        lb.classList.add('active');
      }
    });
  });

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, {threshold: .15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* Min date for booking */
  const dateInput = document.querySelector('input[name="date"]');
  if(dateInput){
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  /* Pre-select booking type from URL ?type=hotel|massage|restaurant */
  const typeSelect = document.querySelector('select[name="type"]');
  if(typeSelect){
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if(type && ['hotel','massage','restaurant'].includes(type)){
      typeSelect.value = type;
    }
  }

  /* Restore language preference */
  try{
    const saved = localStorage.getItem('harmony_lang');
    if(saved && (saved === 'th' || saved === 'en')) setLang(saved);
  }catch(e){}
});

function closeLightbox(){
  const lb = document.getElementById('lightbox');
  if(lb) lb.classList.remove('active');
}

/* ===== Booking form ===== */
function handleBooking(e){
  e.preventDefault();
  const lang = document.documentElement.lang;
  const msg = lang === 'en'
    ? '✓ Reservation received! We will contact you within 24 hours.'
    : '✓ รับการจองแล้ว! ทีมงานจะติดต่อกลับภายใน 24 ชม.';
  showToast(msg);
  e.target.reset();
}
function showToast(text){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = text;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 4000);
}
