import re
import os

with open('tournaments.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update nav highlighting in esports.html (which starts as copy of tournaments.html)
content = content.replace(
    '''<a class="text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1 font-['Space_Grotesk'] transition-colors duration-300"
                    href="tournaments.html">Tournaments</a>''',
    '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="tournaments.html">Tournaments</a>'''
)

content = content.replace(
    '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="#">Esports</a>''',
    '''<a class="text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1 font-['Space_Grotesk'] transition-colors duration-300"
                    href="esports.html">Esports</a>'''
)

# Sidebar highlighting for Esports
content = content.replace(
    '''<a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all"
                        href="#">
                        <span class="material-symbols-outlined text-xl">sports_esports</span>
                        <span>Esports</span>
                    </a>''',
    '''<a class="flex items-center gap-3 p-2 bg-neutral-800/80 text-cyan-400 rounded-md transition-all border-l-2 border-cyan-400"
                        href="esports.html">
                        <span class="material-symbols-outlined text-xl">sports_esports</span>
                        <span>Esports</span>
                    </a>'''
)

esports_main = '''<main class="flex-1 lg:ml-64 p-8 min-h-screen pt-24">
    <div class="flex justify-between items-center mb-10">
        <div>
            <h1 class="text-4xl font-headline font-bold text-on-surface mb-2 flex items-center gap-3">
                <span class="material-symbols-outlined text-primary text-5xl">sports_esports</span> Esports Hub
            </h1>
            <p class="text-on-surface-variant font-body mb-6">Watch live professional matches, follow your favorite teams, and catch up on VODs.</p>
        </div>
        <div class="flex gap-3 h-fit">
            <button class="bg-surface-container border border-outline-variant/30 text-on-surface px-6 py-2.5 rounded-lg font-bold hover:bg-surface-container-high transition-colors">Schedule</button>
            <button class="bg-gradient-to-br from-primary-dim to-primary text-on-primary-fixed px-6 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(207,150,255,0.3)] hover:shadow-[0_0_25px_rgba(207,150,255,0.5)] transition-all active:scale-95">Standings</button>
        </div>
    </div>

    <!-- Live Matches Featured -->
    <h2 class="text-2xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_10px_rgba(255,110,132,0.8)] animate-pulse"></span> Live Matches
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <!-- Match 1 -->
        <div class="glass-panel p-6 rounded-2xl border border-outline-variant/10 relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer">
            <div class="absolute right-0 top-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
            <div class="flex justify-between items-center mb-6 relative z-10">
                <span class="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded shadow-[0_0_10px_rgba(207,150,255,0.2)]">VCT Masters</span>
                <span class="text-[10px] font-bold text-error bg-error/10 px-2.5 py-1 rounded border border-error/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,110,132,0.2)]">
                    <span class="w-1.5 h-1.5 bg-error rounded-full animate-pulse"></span> LIVE
                </span>
            </div>
            <div class="flex justify-between items-center relative z-10">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(207,150,255,0.2)] transition-all">
                        <span class="text-xl font-bold font-headline">SEN</span>
                    </div>
                    <span class="font-bold text-sm tracking-wide">Sentinels</span>
                </div>
                <div class="flex flex-col items-center justify-center">
                    <span class="text-4xl font-headline font-black text-on-surface bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">1 - 0</span>
                    <span class="text-xs font-bold text-on-surface-variant mt-2 tracking-widest uppercase">Map 2: Ascent</span>
                </div>
                <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 group-hover:border-secondary/50 group-hover:shadow-[0_0_15px_rgba(0,217,255,0.2)] transition-all">
                        <span class="text-xl font-bold font-headline">FNC</span>
                    </div>
                    <span class="font-bold text-sm tracking-wide">Fnatic</span>
                </div>
            </div>
            <button class="w-full mt-8 bg-surface-container hover:bg-primary/20 hover:border-primary/50 text-on-surface hover:text-primary py-3 rounded-lg font-bold text-sm transition-all border border-outline-variant/10 relative z-10 active:scale-95 shadow-md">
                Watch Stream
            </button>
        </div>

        <!-- Match 2 -->
        <div class="glass-panel p-6 rounded-2xl border border-outline-variant/10 relative overflow-hidden group hover:border-secondary/30 transition-all cursor-pointer">
            <div class="absolute right-0 top-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full"></div>
            <div class="flex justify-between items-center mb-6 relative z-10">
                <span class="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded shadow-[0_0_10px_rgba(0,217,255,0.2)]">CDL Major 3</span>
                <span class="text-[10px] font-bold text-error bg-error/10 px-2.5 py-1 rounded border border-error/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,110,132,0.2)]">
                    <span class="w-1.5 h-1.5 bg-error rounded-full animate-pulse"></span> LIVE
                </span>
            </div>
            <div class="flex justify-between items-center relative z-10">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 group-hover:border-[#00ff00]/50 transition-all">
                        <span class="text-xl font-bold font-headline">OG</span>
                    </div>
                    <span class="font-bold text-sm tracking-wide">OpTic Texas</span>
                </div>
                <div class="flex flex-col items-center justify-center">
                    <span class="text-4xl font-headline font-black text-on-surface bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">2 - 2</span>
                    <span class="text-xs font-bold text-on-surface-variant mt-2 tracking-widest uppercase">Map 5: SND</span>
                </div>
                <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 group-hover:border-error/50 transition-all">
                        <span class="text-xl font-bold font-headline">FAZE</span>
                    </div>
                    <span class="font-bold text-sm tracking-wide">ATL FaZe</span>
                </div>
            </div>
            <button class="w-full mt-8 bg-surface-container hover:bg-secondary/20 hover:border-secondary/50 text-on-surface hover:text-secondary py-3 rounded-lg font-bold text-sm transition-all border border-outline-variant/10 relative z-10 active:scale-95 shadow-md">
                Watch Stream
            </button>
        </div>
    </div>

    <!-- Teams and Standings -->
    <h2 class="text-2xl font-headline font-bold text-on-surface mb-6 mt-10">Popular Teams</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <!-- Team cards -->
        <div class="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high hover:border-outline-variant/30 hover:-translate-y-1 transition-all cursor-pointer shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-surface-container-lowest to-surface-container-highest rounded-full flex items-center justify-center font-black font-headline text-2xl border border-outline-variant/5 shadow-inner text-error">T1</div>
            <span class="text-sm font-bold tracking-wide">T1</span>
        </div>
        <div class="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high hover:border-outline-variant/30 hover:-translate-y-1 transition-all cursor-pointer shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-surface-container-lowest to-surface-container-highest rounded-full flex items-center justify-center font-black font-headline text-2xl border border-outline-variant/5 shadow-inner text-on-surface">G2</div>
            <span class="text-sm font-bold tracking-wide">G2 Esports</span>
        </div>
        <div class="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high hover:border-outline-variant/30 hover:-translate-y-1 transition-all cursor-pointer shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-surface-container-lowest to-surface-container-highest rounded-full flex items-center justify-center font-black font-headline text-2xl border border-outline-variant/5 shadow-inner text-[#002f6c]">TL</div>
            <span class="text-sm font-bold tracking-wide">Team Liquid</span>
        </div>
        <div class="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high hover:border-outline-variant/30 hover:-translate-y-1 transition-all cursor-pointer shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-surface-container-lowest to-surface-container-highest rounded-full flex items-center justify-center font-black font-headline text-2xl border border-outline-variant/5 shadow-inner text-primary">PRX</div>
            <span class="text-sm font-bold tracking-wide">Paper Rex</span>
        </div>
        <div class="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high hover:border-outline-variant/30 hover:-translate-y-1 transition-all cursor-pointer shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-surface-container-lowest to-surface-container-highest rounded-full flex items-center justify-center font-black font-headline text-2xl border border-outline-variant/5 shadow-inner text-secondary">C9</div>
            <span class="text-sm font-bold tracking-wide">Cloud9</span>
        </div>
    </div>
</main>'''

content = re.sub(r'<main class="flex-1 lg:ml-64 p-8 min-h-screen pt-24">.*?</main>', esports_main, content, flags=re.DOTALL)

with open('esports.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Update index.html top nav and sidebar link
with open('index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

idx_content = idx_content.replace(
    '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="#">Esports</a>''',
    '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="esports.html">Esports</a>'''
)

idx_content = idx_content.replace(
    '''<a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all"
                        href="#">
                        <span class="material-symbols-outlined text-xl">sports_esports</span>
                        <span>Esports</span>
                    </a>''',
    '''<a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all"
                        href="esports.html">
                        <span class="material-symbols-outlined text-xl">sports_esports</span>
                        <span>Esports</span>
                    </a>'''
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx_content)

# Update tournaments.html top nav and sidebar link
with open('tournaments.html', 'r', encoding='utf-8') as f:
    t_content = f.read()

t_content = t_content.replace(
    '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="#">Esports</a>''',
    '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="esports.html">Esports</a>'''
)

t_content = t_content.replace(
    '''<a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all"
                        href="#">
                        <span class="material-symbols-outlined text-xl">sports_esports</span>
                        <span>Esports</span>
                    </a>''',
    '''<a class="flex items-center gap-3 p-2 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200 rounded-md transition-all"
                        href="esports.html">
                        <span class="material-symbols-outlined text-xl">sports_esports</span>
                        <span>Esports</span>
                    </a>'''
)
with open('tournaments.html', 'w', encoding='utf-8') as f:
    f.write(t_content)
