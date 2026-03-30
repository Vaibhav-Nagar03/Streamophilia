import re

with open('stream.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Replace Video Player area
text = re.sub(
    r'<!-- Video Player Area -->.*?<!-- Stream Metadata -->',
    '''<!-- Video Player Area -->
            <div class="relative aspect-video bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)] group">
                <iframe class="w-full h-full" src="https://www.youtube.com/embed/lihYUxBZ_BE?autoplay=1&mute=0&rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <div class="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                    <span class="bg-error text-on-error px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,110,132,0.8)] animate-pulse">LIVE STREAM</span>
                </div>
            </div>
            <!-- Stream Metadata -->''',
    text, flags=re.DOTALL
)

# 2. Update Metadata
text = text.replace('GRAND FINALS: NEON\n                            OVERDRIVE INVITATIONAL', 'VALORANT CHAMPIONS SERIES: Sentinels vs Fnatic')
text = text.replace('ViperZero', 'VCT Official')
text = text.replace('Cyber Siege 2', 'VALORANT')

# 3. Update Bets
text = text.replace('LIVE PREDICTION', 'BET ON WINNER')
text = text.replace('Will ViperZero clear the final objective under 5\n                                mins?', 'Which team will win this Grand Final matchup?')
text = text.replace("YES, HE'S GOING TO CRUSH IT", 'SENTINELS (SEN)')
text = text.replace('NO, THE ODDS ARE TOO HIGH', 'FNATIC (FNC)')
text = text.replace('BET OPTION A', 'BET ON SEN')
text = text.replace('BET OPTION B', 'BET ON FNC')

# 4. Superchats Leaderboard
text = text.replace('DONATION LEADERS', 'TOP SUPERCHATS')
text = text.replace('Master\n                                    Contributor', 'Highest Superchat')
text = text.replace('GhostGlitch', 'GhostGlitch (2nd)')
text = text.replace('VoidRacer', 'VoidRacer (3rd)')

text = text.replace('DONATE', 'SUPERCHAT')
text = text.replace('New Donation!', 'New Superchat!')
text = text.replace('NeonShadow_</span> donated', 'NeonShadow_</span> sent a Superchat')

with open('stream.html', 'w', encoding='utf-8') as f:
    f.write(text)
