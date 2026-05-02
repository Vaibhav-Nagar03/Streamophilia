import os

import re

def update_file(filename):
    if not os.path.exists(filename):
        return
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Finding the exact wallet strings and replacing them. Handled via regex.
    new_content = re.sub(
        r'<button class="top-dashboard-btn[^>]+>\s*<span class="material-symbols-outlined[^>]*>account_balance_wallet</span>\s*<span[^>]*>(?:DASHBOARD|WALLET)</span>\s*</button>',
        '<button class="top-dashboard-btn flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary/50 text-primary transition-colors active:scale-95" title="Your Wallet"><span class="material-symbols-outlined text-sm">account_balance_wallet</span><span class="text-xs font-bold"><span id="wallet-balance">500</span> COINS</span></button>',
        content
    )

    if new_content != content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")

for f in ['index.html', 'esports.html', 'setting.html', 'stream.html']:
    update_file(f)
