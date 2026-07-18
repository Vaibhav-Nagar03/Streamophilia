/* ============================================================
   STREAMOPHILIA — SHARED THEME ENGINE
   ============================================================
   This is the single source of truth for dark/light mode across
   every page. It works by defining every brand color as a CSS
   custom property (variable). Each page's Tailwind config points
   its color tokens (e.g. "surface") at these variables instead of
   hardcoded hex values, so toggling the .light class on <html>
   instantly re-colors every "bg-surface", "text-on-surface", etc.
   utility class already on the page — no re-render needed.

   Include this script as EARLY as possible in <head>, before the
   Tailwind CDN <script> tag, so the variables and the saved theme
   class are both in place before first paint (no flash).
   ============================================================ */

(function () {
    // --- 1. Inject the CSS variables for both themes ---
    const style = document.createElement('style');
    style.id = 'theme-vars';
    style.textContent = `
        :root, html.dark {
            --color-surface: #0e0e11;
            --color-surface-container: #19191d;
            --color-surface-container-high: #1f1f23;
            --color-surface-container-highest: #25252a;
            --color-surface-container-low: #131316;
            --color-surface-container-lowest: #000000;
            --color-surface-variant: #25252a;
            --color-on-surface: #fbf8fc;
            --color-on-surface-variant: #acaaae;
            --color-outline: #767578;
            --color-outline-variant: #48474b;
            --color-primary: #cf96ff;
            --color-primary-dim: #a533ff;
            --color-primary-container: #c683ff;
            --color-on-primary: #480079;
            --color-on-primary-fixed: #000000;
            --color-secondary: #00d9ff;
            --color-secondary-dim: #00caed;
            --color-on-secondary: #004755;
            --color-error: #ff6e84;
            --color-on-error: #490013;
            --color-tertiary: #ff959d;
        }
        html.light {
            --color-surface: #f6f4f9;
            --color-surface-container: #ffffff;
            --color-surface-container-high: #efebf3;
            --color-surface-container-highest: #e6e0eb;
            --color-surface-container-low: #fbfafd;
            --color-surface-container-lowest: #ffffff;
            --color-surface-variant: #e6e0eb;
            --color-on-surface: #1a1a1f;
            --color-on-surface-variant: #5c5a63;
            --color-outline: #8f8d95;
            --color-outline-variant: #d6d2db;
            --color-primary: #a533ff;
            --color-primary-dim: #8a1fe0;
            --color-primary-container: #f0dcff;
            --color-on-primary: #ffffff;
            --color-on-primary-fixed: #ffffff;
            --color-secondary: #0086a3;
            --color-secondary-dim: #006d85;
            --color-on-secondary: #ffffff;
            --color-error: #d6294a;
            --color-on-error: #ffffff;
            --color-tertiary: #d6444f;
        }
    `;
    document.head.appendChild(style);

    // --- 2. Apply the saved preference immediately (before paint) ---
    const saved = localStorage.getItem('streamophiliaTheme'); // 'dark' | 'light'
    const html = document.documentElement;
    if (saved === 'light') {
        html.classList.remove('dark');
        html.classList.add('light');
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
    }

    // --- 3. Shared toggle function, callable from any page ---
    window.NeonTheme = {
        current: () => (html.classList.contains('light') ? 'light' : 'dark'),
        set: function (mode) {
            if (mode === 'light') {
                html.classList.remove('dark');
                html.classList.add('light');
            } else {
                html.classList.remove('light');
                html.classList.add('dark');
            }
            localStorage.setItem('streamophiliaTheme', mode);
            document.dispatchEvent(new CustomEvent('neon-theme-change', { detail: { mode } }));
        },
        toggle: function () {
            const next = this.current() === 'light' ? 'dark' : 'light';
            this.set(next);
            return next;
        }
    };
})();
