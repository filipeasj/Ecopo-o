const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const systemTheme = matchMedia("(prefers-color-scheme: dark)");
let chosenTheme;
try {
  chosenTheme = localStorage.getItem("ecopoco-theme");
} catch {}

function applyTheme() {
  const dark = chosenTheme === "dark" || (chosenTheme !== "light" && systemTheme.matches);
  root.dataset.theme = dark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(dark));
}

themeToggle.addEventListener("click", () => {
  chosenTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme();
  try {
    localStorage.setItem("ecopoco-theme", chosenTheme);
  } catch {}
});
systemTheme.addEventListener("change", applyTheme);
applyTheme();

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const mobileNav = matchMedia("(max-width: 980px)");

function setMenuOpen(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  navLinks.classList.toggle("is-open", open);
  navLinks.inert = mobileNav.matches && !open;
  if (open) navLinks.querySelector("a").focus({ preventScroll: true });
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") === "false");
});
navLinks.addEventListener("click", (event) => {
  if (!mobileNav.matches || !event.target.closest("a")) return;
  menuToggle.focus({ preventScroll: true });
  setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("nav")) setMenuOpen(false);
});
mobileNav.addEventListener("change", () => setMenuOpen(false));
setMenuOpen(false);

const D = {
  fauna: [
    ["Preguiça-comum", "Bradypus variegatus"],
    ["Cutia", "Dasyprocta sp."],
    ["Ouriço-cacheiro", "Coendou insidiosus"],
    ["Saruê", "Didelphis albiventris"],
    ["Sagui", "Callithrix penicillata"],
    ["Macaco-prego", "Cebus sp."],
    ["Ratinho-da-mata", "Marmosops sp."],
    ["Lavadeira-mascarada", "Fluvicola nengeta"],
    ["Cobra-coral-falsa", "Oxyrhopus trigeminus"],
  ],
  flora: [
    ["Ingá-cabeludo", "Affonsea bullata"],
    ["Angico-branco", "Anadenanthera colubrina", "Angico branco"],
    ["Copaíba", "Copaifera langsdorffii"],
    ["Tamboril", "Enterolobium contortisiliquum"],
    ["Pau-ferro", "Libidibia ferrea"],
    ["Azeitona-da-terra", "Vitex megapotamica"],
    ["Contas-de-Nossa-Senhora", "Abarema jupunba"],
    ["Olho-de-cabra", "Ormosia arborea"],
    ["Jatobá", "Hymenaea courbaril"],
  ],
};
const sp = document.getElementById("sp");
function show(category) {
  const folder = category === "fauna" ? "Fauna" : "Flora";
  sp.innerHTML = D[category]
    .map(([name, scientificName, imageName = name], index) => {
      const src = `img/${folder}/${encodeURIComponent(imageName)}.webp`;
      return `<li style="animation-delay:${index * 40}ms">
        <div class="species-photo"><img src="${src}" alt="" loading="lazy" /></div>
        <b>${name}</b><i>${scientificName}</i>
      </li>`;
    })
    .join("");
}
document.querySelectorAll(".tabs button").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll(".tabs button")
        .forEach((x) => x.setAttribute("aria-selected", x === b));
      show(b.dataset.t);
    }),
);
show("fauna");
const g = document.querySelector("#gauge i");
function updateProgress() {
  const distance = root.scrollHeight - root.clientHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, root.scrollTop / distance)) : 0;
  g.style.transform = `scaleX(${progress})`;
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
addEventListener("pageshow", updateProgress);
updateProgress();
const trk = document.getElementById("trk"),
  cn = document.getElementById("cn");
const st = () => trk.firstElementChild.getBoundingClientRect().width + 16;
const upd = () => {
  cn.textContent =
    Math.round(trk.scrollLeft / st()) + 1 + " / " + trk.children.length;
};
const go = (d) => {
  const end = trk.scrollLeft + trk.clientWidth >= trk.scrollWidth - 4;
  trk.scrollTo({
    left: d > 0 && end ? 0 : trk.scrollLeft + d * st(),
    behavior: "smooth",
  });
};
document.getElementById("nx").onclick = () => go(1);
document.getElementById("pv").onclick = () => go(-1);
trk.addEventListener("scroll", upd, { passive: true });
let hold = false;
["mouseenter", "focusin", "touchstart"].forEach((e) =>
  trk.parentNode.addEventListener(e, () => (hold = true)),
);
["mouseleave", "focusout"].forEach((e) =>
  trk.parentNode.addEventListener(e, () => (hold = false)),
);
if (!matchMedia("(prefers-reduced-motion:reduce)").matches)
  setInterval(() => {
    if (!hold) go(1);
  }, 5000);
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("on");
      e.target.querySelectorAll("[data-n]").forEach((n) => {
        const t = +n.dataset.n;
        let c = 0;
        const id = setInterval(
          () => {
            n.textContent = ++c;
            if (c >= t) clearInterval(id);
          },
          t > 9 ? 60 : 300,
        );
      });
      io.unobserve(e.target);
    }),
  { threshold: 0.2 },
);
document.querySelectorAll(".rv").forEach((e) => io.observe(e));
