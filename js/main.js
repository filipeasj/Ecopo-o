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
const menuClose = document.getElementById("menu-close");
const navPanel = document.getElementById("nav-panel");
const navLinks = document.getElementById("nav-links");
const mobileNav = matchMedia("(max-width: 980px)");
const pageContent = document.querySelectorAll("body > :is(header, main, section, footer)");
const brand = document.querySelector("nav .brand");
const navActions = menuToggle.parentElement;

function setMenuOpen(open) {
  const wasOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  navPanel.classList.toggle("is-open", open);
  root.classList.toggle("menu-open", open);
  brand.inert = navActions.inert = open;
  pageContent.forEach((element) => { element.inert = open; });

  if (open) {
    navPanel.inert = false;
    navPanel.scrollTop = 0;
    menuClose.focus({ preventScroll: true });
  } else if (wasOpen) {
    const focusTarget = mobileNav.matches ? menuToggle : brand;
    focusTarget.focus({ preventScroll: true });
  }

  navPanel.inert = mobileNav.matches && !open;
}

menuToggle.addEventListener("click", () => setMenuOpen(true));
menuClose.addEventListener("click", () => setMenuOpen(false));
navLinks.addEventListener("click", (event) => {
  if (mobileNav.matches && event.target.closest("a")) setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
  }
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
const timeline = document.querySelector(".history-timeline");
const milestones = [...timeline.children];
const sectionLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
const linkedSections = sectionLinks.map((link) => document.getElementById(link.hash.slice(1)));
const pageNav = navLinks.closest("nav");
let currentSection = -1;
let previousMilestone = -1;
let progressFrame = null;

function updateProgress() {
  progressFrame = null;
  const distance = root.scrollHeight - root.clientHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, root.scrollTop / distance)) : 0;
  const sectionLine = pageNav.getBoundingClientRect().bottom + 24;
  const sectionIndex = progress === 1
    ? linkedSections.length - 1
    : Math.max(0, linkedSections.findLastIndex(
      (section) => section.getBoundingClientRect().top <= sectionLine));
  const navBounds = navLinks.getBoundingClientRect();
  const activeLink = sectionLinks[sectionIndex];
  const linkBounds = activeLink.getBoundingClientRect();
  const positions = milestones.map((milestone) => milestone.getBoundingClientRect().top);
  const markerOffset = parseFloat(getComputedStyle(timeline).fontSize) * 0.55 + 4.5;
  const readingLine = root.clientHeight * 0.62 - markerOffset;
  const timelineLength = positions[positions.length - 1] - positions[0];
  const timelineProgress = timelineLength > 0
    ? Math.min(1, Math.max(0, (readingLine - positions[0]) / timelineLength))
    : 0;
  const currentMilestone = positions.filter((position) => position <= readingLine).length - 1;

  g.style.transform = `scaleX(${progress})`;
  if (sectionIndex !== currentSection) {
    sectionLinks[currentSection]?.removeAttribute("aria-current");
    activeLink.setAttribute("aria-current", "location");
    currentSection = sectionIndex;
  }
  navLinks.style.setProperty("--active-x", `${linkBounds.left - navBounds.left}px`);
  navLinks.style.setProperty("--active-y", `${linkBounds.top - navBounds.top}px`);
  navLinks.style.setProperty("--active-width", `${linkBounds.width}px`);
  navLinks.style.setProperty("--active-height", `${linkBounds.height}px`);
  navLinks.style.setProperty("--indicator-opacity", "1");
  timeline.style.setProperty("--timeline-length", `${timelineLength}px`);
  timeline.style.setProperty("--timeline-unread", `${(1 - timelineProgress) * 100}%`);
  timeline.dataset.tracking = "";

  milestones.forEach((milestone, index) => {
    const colorProgress = timelineLength > 0 ? (positions[index] - positions[0]) / timelineLength : 0;
    milestone.style.setProperty("--marker-color",
      `color-mix(in srgb, var(--history-accent), var(--history-progress-accent) ${colorProgress * 100}%)`);
    if (currentMilestone === previousMilestone) return;
    milestone.classList.toggle("is-reached", index <= currentMilestone);
    if (index === currentMilestone) milestone.setAttribute("aria-current", "step");
    else milestone.removeAttribute("aria-current");
  });
  previousMilestone = currentMilestone;
}

function scheduleProgressUpdate() {
  if (progressFrame === null) progressFrame = requestAnimationFrame(updateProgress);
}

addEventListener("scroll", scheduleProgressUpdate, { passive: true });
addEventListener("resize", scheduleProgressUpdate);
addEventListener("pageshow", scheduleProgressUpdate);
const progressObserver = new ResizeObserver(scheduleProgressUpdate);
progressObserver.observe(document.body);
progressObserver.observe(timeline);
progressObserver.observe(navLinks);
document.fonts.ready.then(scheduleProgressUpdate);
updateProgress();
const galleryTrack = document.getElementById("trk");
const gallery = galleryTrack.closest(".gallery-layout");
const slides = [...galleryTrack.children];
const galleryCount = document.getElementById("cn");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let rotating = !reducedMotion.matches;
let galleryHovered = false;
let galleryVisible = false;
let displayedSlide = 0;

function nearestSlide() {
  return slides.reduce((closest, slide, index) =>
    Math.abs(slide.offsetLeft - galleryTrack.scrollLeft) <
    Math.abs(slides[closest].offsetLeft - galleryTrack.scrollLeft) ? index : closest, 0);
}

function goToAdjacentSlide(direction) {
  const nextSlide = nearestSlide() + direction;
  const index = (nextSlide + slides.length) % slides.length;
  galleryTrack.scrollTo({
    left: slides[index].offsetLeft,
    behavior: reducedMotion.matches || index !== nextSlide ? "instant" : "smooth",
  });
}

function stopGalleryRotation() {
  rotating = false;
  galleryCount.setAttribute("aria-live", "polite");
}

function updateGalleryCount() {
  const index = nearestSlide();
  if (index === displayedSlide) return;
  displayedSlide = index;
  galleryCount.textContent = `${index + 1} / ${slides.length}`;
}

document.getElementById("pv").addEventListener("click", () => {
  stopGalleryRotation();
  goToAdjacentSlide(-1);
});
document.getElementById("nx").addEventListener("click", () => {
  stopGalleryRotation();
  goToAdjacentSlide(1);
});
galleryTrack.addEventListener("pointerdown", stopGalleryRotation);
galleryTrack.addEventListener("scroll", updateGalleryCount, { passive: true });
gallery.addEventListener("focusin", stopGalleryRotation);
gallery.addEventListener("pointerenter", (event) => {
  galleryHovered = event.pointerType === "mouse";
});
gallery.addEventListener("pointerleave", () => { galleryHovered = false; });
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) stopGalleryRotation();
});

const galleryObserver = new IntersectionObserver(([entry]) => {
  galleryVisible = entry.intersectionRatio >= 0.25;
}, { threshold: 0.25 });
galleryObserver.observe(galleryTrack);

galleryCount.textContent = `1 / ${slides.length}`;
if (!rotating) stopGalleryRotation();
setInterval(() => {
  if (rotating && galleryVisible && !galleryHovered && !document.hidden) goToAdjacentSlide(1);
}, 5000);
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("on");
      io.unobserve(e.target);
    }),
  { threshold: 0.2 },
);
document.querySelectorAll(".rv").forEach((e) => io.observe(e));
