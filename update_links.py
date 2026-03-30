import os

files = ['setting.html', 'two.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()

        content = content.replace(
            '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="#">Esports</a>''',
            '''<a class="text-neutral-400 hover:text-purple-400 font-['Space_Grotesk'] transition-colors duration-300"
                    href="esports.html">Esports</a>'''
        )

        content = content.replace(
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

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)
