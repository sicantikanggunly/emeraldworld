
const products = [
  {id:1, name:"Es Krim Vanilla Pint", price:38000, image:"../assets/svg/icecream.svg".replace("../",""), bestseller:true},
  {id:2, name:"Snowflake Nugget 500g", price:45000, image:"../assets/svg/nuggets.svg".replace("../",""), bestseller:true},
  {id:3, name:"Ikan Fillet Beku 1kg", price:89000, image:"../assets/svg/fish.svg".replace("../",""), bestseller:true},
  {id:4, name:"Dumpling Ayam 20pcs", price:52000, image:"../assets/svg/dumpling.svg".replace("../",""), bestseller:false},
  {id:5, name:"Ice Pack Premium", price:15000, image:"../assets/svg/snowflake.svg".replace("../",""), bestseller:false},
  // Tambahan dummy agar slider bisa sampai 10 jika diinginkan
  {id:6, name:"Roti Paratha 5 lembar", price:28000, image:"../assets/svg/dumpling.svg".replace("../",""), bestseller:true},
  {id:7, name:"Sosis Sapi 500g", price:49000, image:"../assets/svg/nuggets.svg".replace("../",""), bestseller:true},
  {id:8, name:"Sayur Beku Mix 500g", price:27000, image:"../assets/svg/snowflake.svg".replace("../",""), bestseller:false},
  {id:9, name:"Udang Kupas 500g", price:78000, image:"../assets/svg/fish.svg".replace("../",""), bestseller:true},
  {id:10, name:"Kentang Shoestring 1kg", price:55000, image:"../assets/svg/icecream.svg".replace("../",""), bestseller:true},
];

const rupiah = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(n);
const el = sel => document.querySelector(sel);
const grid = el('#productGrid');
const slidesEl = el('#slides');
const cartCount = el('#cartCount');
const yearEl = el('#year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// LocalStorage keys
const CART_KEY = 'ew-cart';
const TESTI_KEY = 'ew-testimonials';
const FEEDBACK_KEY = 'ew-feedback';

const read = (key, fallback=[]) => {
  try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function renderProducts(){
  if(!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}"/>
      <div class="title">${p.name}</div>
      <div class="price">${rupiah(p.price)}</div>
      <div class="actions">
        <button class="btn add" data-id="${p.id}">+ Tambah</button>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.add').forEach(btn => btn.addEventListener('click', onAdd));
}

function onAdd(e){
  const id = Number(e.currentTarget.dataset.id);
  const cart = read(CART_KEY, []);
  const existing = cart.find(x=>x.id===id);
  if(existing){ existing.qty += 1; } else { cart.push({id, qty:1}); }
  write(CART_KEY, cart);
  updateCartCount();
}

function updateCartCount(){
  if(!cartCount) return;
  const cart = read(CART_KEY, []);
  const count = cart.reduce((a,b)=>a+b.qty,0);
  cartCount.textContent = count;
}

function renderSlider(){
  if(!slidesEl) return;
  const best = products.filter(p=>p.bestseller).slice(0,10);
  slidesEl.innerHTML = best.map(p => `
    <div class="slide">
      <img src="${p.image}" alt="${p.name}"/>
      <div class="info">
        <h3>${p.name}</h3>
        <div class="price">${rupiah(p.price)}</div>
        <div class="actions">
          <button class="btn add" data-id="${p.id}">+ Keranjang</button>
          <a class="btn secondary" href="pages/checkout.html">Checkout</a>
        </div>
      </div>
    </div>
  `).join('');
  let idx = 0;
  const update = () => slidesEl.style.transform = `translateX(${-idx*100}%)`;
  const prev = el('#prevSlide'), next = el('#nextSlide');
  prev?.addEventListener('click', ()=>{ idx = (idx-1+best.length)%best.length; update(); });
  next?.addEventListener('click', ()=>{ idx = (idx+1)%best.length; update(); });
  slidesEl.querySelectorAll('.add').forEach(btn => btn.addEventListener('click', onAdd));
}

function renderTestimonials(){
  const container = el('#testimonialList');
  if(!container) return;
  const seed = [
    {nama:"Dina", ulasan:"Packing rapi, barang cepat sampai. Nuggetnya enak!"},
    {nama:"Rudi", ulasan:"Ikan fillet fresh banget dan tanpa bau amis."},
    {nama:"Anita", ulasan:"Harga bersahabat, pilihan lengkap. Recommended!"},
  ];
  const user = read(TESTI_KEY, []);
  const list = [...seed, ...user];
  container.innerHTML = list.map(t => `
    <div class="card">
      <div class="title">${t.nama}</div>
      <p>${t.ulasan}</p>
    </div>
  `).join('');
}

function wireForms(){
  const testiForm = el('#testimonialForm');
  testiForm?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(testiForm);
    const item = {nama: fd.get('nama'), ulasan: fd.get('ulasan')};
    const now = read(TESTI_KEY, []); now.push(item); write(TESTI_KEY, now);
    testiForm.reset();
    renderTestimonials();
    alert('Terima kasih untuk testimoninya!');
  });

  const fbForm = el('#feedbackForm');
  fbForm?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(fbForm);
    const item = {email: fd.get('email')||null, pesan: fd.get('pesan'), at: new Date().toISOString()};
    const now = read(FEEDBACK_KEY, []); now.push(item); write(FEEDBACK_KEY, now);
    fbForm.reset();
    alert('Masukan terkirim. Terima kasih!');
  });
}

function renderCheckout(){
  const container = el('#cartItems');
  if(!container) return;
  const cart = read(CART_KEY, []);
  if(cart.length===0){
    container.innerHTML = '<p>Keranjang kosong.</p>';
  }else{
    container.innerHTML = cart.map(row => {
      const p = products.find(x=>x.id===row.id);
      return `<div class="card">
        <img src="${p.image}" alt="${p.name}"/>
        <div class="title">${p.name}</div>
        <div>Qty: ${row.qty}</div>
        <div class="price">${rupiah(p.price*row.qty)}</div>
      </div>`;
    }).join('');
  }
  const total = cart.reduce((a,b)=>{
    const p = products.find(x=>x.id===b.id);
    return a + (p?.price || 0)*b.qty;
  },0);
  const totalEl = el('#cartTotal'); if(totalEl) totalEl.textContent = `Total: ${rupiah(total)}`;
  const btn = el('#placeOrder');
  btn?.addEventListener('click', ()=>{
    write(CART_KEY, []);
    updateCartCount();
    renderCheckout();
    alert('Pesanan diterima! (Demo)');
  });
}

// Open cart button navigates to checkout
const openCartBtn = el('#openCart');
openCartBtn?.addEventListener('click', ()=> location.href = 'pages/checkout.html');

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderSlider();
  renderTestimonials();
  wireForms();
  renderCheckout();
  updateCartCount();
});
