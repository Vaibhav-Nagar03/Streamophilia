// nav_components.js - Shared navbar & sidebar for all pages
(function(){
const page = location.pathname.split('/').pop() || 'index.html';

// === TOP NAVBAR LINKS ===
const navEl = document.getElementById('main-nav');
if(navEl){
  const links = [
    {href:'index.html', label:'Home', icon:'home'},
    {href:'streams.html', label:'Streams', icon:'live_tv'},
    {href:'tournaments.html', label:'Tournaments', icon:'emoji_events'},
    {href:'esports.html', label:'Esports', icon:'sports_esports'},
    {href:'shop.html', label:'Shop', icon:'storefront'},
  ];
  navEl.innerHTML = links.map(l => {
    const active = page === l.href;
    return `<a class="${active ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : 'text-neutral-400 hover:text-purple-400'} font-['Space_Grotesk'] transition-colors duration-300 text-sm" href="${l.href}">${l.label}</a>`;
  }).join('');
}

// === SEARCH BAR WITH FILTERS ===
const searchC = document.getElementById('search-container');
if(searchC){
  searchC.innerHTML = `
  <div class="relative group" id="search-wrapper">
    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">search</span>
    <input id="global-search" class="w-full bg-surface-container-lowest border-none py-2.5 pl-12 pr-4 rounded-lg focus:ring-1 focus:ring-secondary text-sm placeholder:text-on-surface-variant transition-all" placeholder="Search streamers, games, or tournaments" type="text" autocomplete="off"/>
    <div id="search-filters" class="hidden absolute left-0 right-0 top-full mt-2 bg-[#131316] border border-outline-variant/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-[100] p-3">
      <p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-2 px-2">Filter by</p>
      <div class="flex gap-2">
        <button class="search-filter-btn px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold" data-filter="all">All</button>
        <button class="search-filter-btn px-3 py-1.5 bg-surface-container text-on-surface-variant border border-outline-variant/20 rounded-full text-xs font-bold hover:text-on-surface" data-filter="streamers">Streamers</button>
        <button class="search-filter-btn px-3 py-1.5 bg-surface-container text-on-surface-variant border border-outline-variant/20 rounded-full text-xs font-bold hover:text-on-surface" data-filter="games">Games</button>
        <button class="search-filter-btn px-3 py-1.5 bg-surface-container text-on-surface-variant border border-outline-variant/20 rounded-full text-xs font-bold hover:text-on-surface" data-filter="tournaments">Tournaments</button>
      </div>
    </div>
  </div>`;
  const si = document.getElementById('global-search');
  const sf = document.getElementById('search-filters');
  si.addEventListener('focus', ()=> sf.classList.remove('hidden'));
  document.addEventListener('click', e => { if(!document.getElementById('search-wrapper').contains(e.target)) sf.classList.add('hidden'); });
  document.querySelectorAll('.search-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.search-filter-btn').forEach(b => { b.classList.remove('bg-primary/20','text-primary','border-primary/30'); b.classList.add('bg-surface-container','text-on-surface-variant','border-outline-variant/20'); });
      btn.classList.remove('bg-surface-container','text-on-surface-variant','border-outline-variant/20');
      btn.classList.add('bg-primary/20','text-primary','border-primary/30');
    });
  });
}

// === TOP RIGHT ACTIONS (Coins dropdown, Notifications w/ categories, Messages, Profile) ===
const actions = document.getElementById('top-actions');
if(actions){
  actions.innerHTML = `
  <!-- Coins Dropdown -->
  <div class="relative" id="coins-wrapper">
    <button id="coins-btn" class="top-dashboard-btn flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary/50 text-primary transition-colors active:scale-95" title="Your Wallet">
      <span class="material-symbols-outlined text-sm">account_balance_wallet</span>
      <span class="text-xs font-bold"><span id="wallet-balance">500</span> COINS</span>
      <span class="material-symbols-outlined text-xs">expand_more</span>
    </button>
    <div id="coins-panel" class="hidden absolute right-0 top-12 w-56 bg-[#131316] border border-outline-variant/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[100]">
      <div class="px-4 py-3 border-b border-outline-variant/10">
        <p class="text-xs text-on-surface-variant">Balance</p>
        <p class="text-lg font-headline font-bold text-primary">500 COINS</p>
      </div>
      <div class="py-1">
        <a href="shop.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-lg">redeem</span>Redeem Rewards</a>
        <a href="shop.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-lg">receipt_long</span>Transaction History</a>
      </div>
    </div>
  </div>

  <!-- Notifications with Categories -->
  <div class="relative" id="notif-wrapper">
    <button id="notif-btn" class="relative text-on-surface-variant hover:text-primary transition-colors active:scale-95">
      <span class="material-symbols-outlined">notifications</span>
      <span id="notif-badge" class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
    </button>
    <div id="notif-panel" class="hidden absolute right-0 top-12 w-96 bg-[#131316] border border-outline-variant/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[100]">
      <div class="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10">
        <h3 class="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">Notifications</h3>
        <button id="notif-clear" class="text-[10px] text-secondary font-bold uppercase tracking-wider hover:text-primary transition-colors">Mark all read</button>
      </div>
      <!-- Category Tabs -->
      <div class="flex border-b border-outline-variant/10 px-2">
        <button class="notif-cat-btn flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary border-b-2 border-secondary" data-cat="all">All</button>
        <button class="notif-cat-btn flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b-2 border-transparent hover:text-on-surface" data-cat="tournament">Tournaments</button>
        <button class="notif-cat-btn flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b-2 border-transparent hover:text-on-surface" data-cat="stream">Streams</button>
        <button class="notif-cat-btn flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b-2 border-transparent hover:text-on-surface" data-cat="earning">Earnings</button>
      </div>
      <div class="max-h-80 overflow-y-auto custom-scrollbar" id="notif-list">
        <div class="notif-item flex gap-3 px-5 py-3 border-b border-outline-variant/5 bg-primary/5 hover:bg-surface-container-high transition-colors cursor-pointer" data-type="stream">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-primary text-base">live_tv</span></div>
          <div class="flex-1 min-w-0"><p class="text-sm text-on-surface leading-snug"><span class="font-bold text-secondary">ViperScope</span> just went live</p><p class="text-[10px] text-on-surface-variant mt-0.5">2 min ago</p></div>
          <span class="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-2"></span>
        </div>
        <div class="notif-item flex gap-3 px-5 py-3 border-b border-outline-variant/5 hover:bg-surface-container-high transition-colors cursor-pointer" data-type="tournament">
          <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-secondary text-base">emoji_events</span></div>
          <div class="flex-1 min-w-0"><p class="text-sm text-on-surface leading-snug">Championship Finals in <span class="font-bold text-secondary">30 mins</span></p><p class="text-[10px] text-on-surface-variant mt-0.5">5 hours ago</p></div>
        </div>
        <div class="notif-item flex gap-3 px-5 py-3 border-b border-outline-variant/5 hover:bg-surface-container-high transition-colors cursor-pointer" data-type="earning">
          <div class="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-emerald-400 text-base">payments</span></div>
          <div class="flex-1 min-w-0"><p class="text-sm text-on-surface leading-snug">You earned <span class="font-bold text-emerald-400">50 coins</span> from watch rewards</p><p class="text-[10px] text-on-surface-variant mt-0.5">1 hour ago</p></div>
        </div>
        <div class="notif-item flex gap-3 px-5 py-3 hover:bg-surface-container-high transition-colors cursor-pointer" data-type="stream">
          <div class="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-error text-base">favorite</span></div>
          <div class="flex-1 min-w-0"><p class="text-sm text-on-surface leading-snug"><span class="font-bold text-primary">Krona_Gaming</span> started a raid</p><p class="text-[10px] text-on-surface-variant mt-0.5">15 min ago</p></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Messages -->
  <div class="relative" id="msg-wrapper">
    <button id="msg-btn" class="relative text-on-surface-variant hover:text-primary transition-colors active:scale-95"><span class="material-symbols-outlined">message</span></button>
    <div id="msg-panel" class="hidden absolute right-0 top-12 w-80 bg-[#131316] border border-outline-variant/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[100]">
      <div class="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10">
        <h3 class="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">Messages</h3>
      </div>
      <div class="max-h-60 overflow-y-auto">
        <div class="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-high cursor-pointer transition-colors border-l-2 border-secondary">
          <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-secondary">VS</div>
          <div class="flex-1 min-w-0"><p class="text-sm font-bold text-on-surface truncate">ViperScope</p><p class="text-xs text-on-surface-variant truncate">GG's on that last match! 🔥</p></div>
          <span class="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></span>
        </div>
        <div class="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-high cursor-pointer transition-colors border-l-2 border-transparent">
          <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary">LD</div>
          <div class="flex-1 min-w-0"><p class="text-sm font-bold text-on-surface truncate">Lumina_Dev</p><p class="text-xs text-on-surface-variant truncate">Check out my new overlay!</p></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Profile -->
  <div class="relative" id="profile-wrapper">
    <div id="profile-btn" class="w-9 h-9 rounded-full ring-2 ring-purple-500 ring-offset-2 ring-offset-surface overflow-hidden cursor-pointer active:scale-95 transition-transform">
      <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6qyE2BV1dCnfusfPdmXhBtNGFRnaLpKcZUN4_PHt_DhRLFed7TPdq2SXjdVyYcMq7Jf1WU5J_AVHbr97V8q49PC4IGHZ9HZzC56cf8bT1hMvlcn1zM_-O8OrWdFcEt8dbRRLK7lpCLGYldrJ4rdmyXLxHNPWaYnGkOd-mvxAPBJ12nOvitgvIJcanK1KSxDM5zu68dHQoL47n_mitgKmk8GjlLvVb5rJg_UyJY55FP2AQOmmpbpvpa6BAInqnbDT8_REYcg4cTmQ"/>
    </div>
    <div id="profile-panel" class="hidden absolute right-0 top-12 w-64 bg-[#131316] border border-outline-variant/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[100]">
      <div class="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
        <img class="w-10 h-10 rounded-full ring-2 ring-primary/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6qyE2BV1dCnfusfPdmXhBtNGFRnaLpKcZUN4_PHt_DhRLFed7TPdq2SXjdVyYcMq7Jf1WU5J_AVHbr97V8q49PC4IGHZ9HZzC56cf8bT1hMvlcn1zM_-O8OrWdFcEt8dbRRLK7lpCLGYldrJ4rdmyXLxHNPWaYnGkOd-mvxAPBJ12nOvitgvIJcanK1KSxDM5zu68dHQoL47n_mitgKmk8GjlLvVb5rJg_UyJY55FP2AQOmmpbpvpa6BAInqnbDT8_REYcg4cTmQ"/>
        <div><p class="text-sm font-bold text-on-surface font-headline">User</p><p class="text-[10px] text-secondary font-bold uppercase tracking-wider">Online</p></div>
      </div>
      <div class="py-1">
        <a href="setting.html" class="flex items-center gap-3 px-5 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-lg">settings</span>Settings</a>
        <a href="streams.html" class="flex items-center gap-3 px-5 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-lg">person</span>My Channel</a>
      </div>
      <div class="border-t border-outline-variant/10 py-1">
        <button id="logout-btn" class="flex items-center gap-3 px-5 py-2.5 text-sm text-error hover:bg-error/10 transition-colors w-full text-left"><span class="material-symbols-outlined text-lg">logout</span>Sign Out</button>
      </div>
    </div>
  </div>`;

  // Toggle logic for all dropdowns
  function setupToggle(btnId, panelId, wrapperId){
    const btn = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    if(!btn||!panel) return;
    btn.addEventListener('click', e => { e.stopPropagation(); document.querySelectorAll('#coins-panel,#notif-panel,#msg-panel,#profile-panel').forEach(p=>{if(p!==panel)p.classList.add('hidden')}); panel.classList.toggle('hidden'); });
  }
  setupToggle('coins-btn','coins-panel','coins-wrapper');
  setupToggle('notif-btn','notif-panel','notif-wrapper');
  setupToggle('msg-btn','msg-panel','msg-wrapper');
  setupToggle('profile-btn','profile-panel','profile-wrapper');

  document.addEventListener('click', e => {
    ['coins','notif','msg','profile'].forEach(id => {
      const w = document.getElementById(id+'-wrapper');
      const p = document.getElementById(id+'-panel');
      if(w && p && !w.contains(e.target)) p.classList.add('hidden');
    });
  });

  // Notif category filter
  document.querySelectorAll('.notif-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.notif-cat-btn').forEach(b => { b.classList.remove('text-secondary','border-secondary'); b.classList.add('text-on-surface-variant','border-transparent'); });
      btn.classList.remove('text-on-surface-variant','border-transparent');
      btn.classList.add('text-secondary','border-secondary');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.notif-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.type === cat) ? '' : 'none';
      });
    });
  });

  // Notif clear
  const nc = document.getElementById('notif-clear');
  if(nc) nc.addEventListener('click', () => { const b = document.getElementById('notif-badge'); if(b) b.classList.add('hidden'); });

  // Logout
  const lo = document.getElementById('logout-btn');
  if(lo) lo.addEventListener('click', () => { localStorage.removeItem('neonNocturneLoggedIn'); location.href = 'login.html'; });
}

// === SIDEBAR ===
const sidebar = document.getElementById('main-sidebar');
if(sidebar){
  sidebar.innerHTML = `
  <!-- Profile Quick Access -->
  <div class="mb-6">
    <div class="px-2 mb-4"><h3 class="font-bold text-on-surface-variant uppercase tracking-widest text-[0.65rem]">Quick Access</h3></div>
    <nav class="space-y-1">
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="setting.html">
        <span class="material-symbols-outlined text-xl">dashboard</span><span>Profile / Dashboard</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="streams.html">
        <span class="material-symbols-outlined text-xl">favorite</span><span>Following</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="streams.html">
        <span class="material-symbols-outlined text-xl">sensors</span><span>Live Now</span>
        <span class="ml-auto text-[10px] font-bold text-error bg-error/10 px-1.5 py-0.5 rounded border border-error/20">6</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="tournaments.html">
        <span class="material-symbols-outlined text-xl">emoji_events</span><span>My Tournaments</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="leaderboards.html">
        <span class="material-symbols-outlined text-xl">leaderboard</span><span>Leaderboards</span></a>
    </nav>
  </div>
  <!-- Game Filters -->
  <div class="mb-6">
    <div class="px-2 mb-4"><h3 class="font-bold text-on-surface-variant uppercase tracking-widest text-[0.65rem]">Game Filters</h3></div>
    <nav class="space-y-1">
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="categories.html">
        <span class="material-symbols-outlined text-xl">sports_esports</span><span>All Games</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="categories.html">
        <span class="material-symbols-outlined text-xl">target</span><span>FPS / Shooter</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="categories.html">
        <span class="material-symbols-outlined text-xl">strategy</span><span>Strategy / MOBA</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="categories.html">
        <span class="material-symbols-outlined text-xl">landscape</span><span>Battle Royale</span></a>
    </nav>
  </div>
  <!-- Social -->
  <div class="mb-6">
    <div class="px-2 mb-4"><h3 class="font-bold text-on-surface-variant uppercase tracking-widest text-[0.65rem]">Social</h3></div>
    <nav class="space-y-1">
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all hover:translate-x-1" href="leaderboards.html">
        <span class="material-symbols-outlined text-xl">group</span><span>Friends / Messages</span></a>
    </nav>
  </div>
  <!-- Bottom -->
  <div class="pt-4 mt-auto">
    <nav class="space-y-1 border-t border-outline-variant/10 pt-4">
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all" href="setting.html">
        <span class="material-symbols-outlined text-xl">settings</span><span>Settings</span></a>
      <a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all" href="index.html">
        <span class="material-symbols-outlined text-xl">help_outline</span><span>Help</span></a>
    </nav>
  </div>`;
}
})();
