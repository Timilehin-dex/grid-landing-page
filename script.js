/* ---------- Navigation menu ---------- */
(() => {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("siteMenu");
    const page = document.getElementById("pageContent");
    const iconMenu = document.getElementById("iconMenu");
    const iconClose = document.getElementById("iconClose");
    if (!toggle || !menu) return;

    const links = () => [...menu.querySelectorAll("a[href]")];
    const isOpen = () => menu.dataset.open === "true";

    function setOpen(open) {
        menu.dataset.open = String(open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        iconMenu.classList.toggle("hidden", open);
        iconClose.classList.toggle("hidden", !open);
        document.body.classList.toggle("overflow-hidden", open);

        // Keep keyboard and screen-reader users out of the page behind the menu
        page.toggleAttribute("inert", open);
        menu.toggleAttribute("inert", !open);
    }

    // Closed by default (inert also removes the links from the tab order)
    setOpen(false);

    toggle.addEventListener("click", () => {
        setOpen(!isOpen());
        if (isOpen()) links()[0]?.focus();
    });

    menu.addEventListener("click", (e) => {
        if (e.target.closest("[data-menu-close]") || e.target.closest("a")) {
            setOpen(false);
            toggle.focus();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;

        if (e.key === "Escape") {
            setOpen(false);
            toggle.focus();
            return;
        }

        // Focus trap: Tab cycles between the toggle button and the menu links
        if (e.key === "Tab") {
            const items = [toggle, ...links()];
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // If the viewport is resized while open, keep things consistent
    window.matchMedia("(min-width: 1024px)").addEventListener("change", () => {
        if (isOpen()) setOpen(false);
    });
})();

/* ---------- Service worker (PWA) ---------- */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .catch((error) => console.error("Service Worker registration failed:", error));
    });
}
