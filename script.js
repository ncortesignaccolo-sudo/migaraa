/* ==========================================
   CONFIGURACIÓN DE DESBLOQUEO
   ========================================== */
// Día en que se desbloqueó el capítulo 5 (formato AAAA-MM-DD).
const START_DATE = "2026-10-28";
// Capítulos disponibles desde el principio (del 1 al 5).
const FREE_UNTIL = 5;
// Cada cuántos días se abre un capítulo nuevo.
const DAYS_PER_CHAPTER = 3;

/* ==========================================
   LÓGICA
   ========================================== */
const MS_DAY = 24 * 60 * 60 * 1000;
const start = new Date(START_DATE + "T00:00:00");

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalNumber = document.getElementById("modalNumber");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

function unlockDate(n) {
  if (n <= FREE_UNTIL) return start;
  return new Date(start.getTime() + (n - FREE_UNTIL) * DAYS_PER_CHAPTER * MS_DAY);
}

function isUnlocked(n) {
  return new Date() >= unlockDate(n);
}

function formatDate(d) {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

function openChapter(ch) {
  modalNumber.textContent = "Capítulo " + ch.chapter;
  modalTitle.textContent = ch.title;
  modalText.innerHTML = "";
  ch.text.split(/\n\s*\n/).forEach(block => {
    const p = document.createElement("p");
    p.textContent = block.trim();
    modalText.appendChild(p);
  });
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  modal.querySelector(".modal-card").scrollTop = 0;
}

function closeChapter() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function render() {
  grid.innerHTML = "";
  let unlocked = 0;

  chaptersData.forEach(ch => {
    const open = isUnlocked(ch.chapter);
    if (open) unlocked++;

    const card = document.createElement("div");
    card.className = "card " + (open ? "open" : "locked");

    const num = document.createElement("span");
    num.className = "card-num";
    num.textContent = "Cap. " + ch.chapter;

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = open ? ch.title : "Capítulo secreto";

    const note = document.createElement("p");
    note.className = "card-note";
    note.textContent = open ? "Listo para leer" : "Se abre el " + formatDate(unlockDate(ch.chapter));

    const btn = document.createElement("button");
    btn.type = "button";

    if (open) {
      btn.className = "btn btn-open";
      btn.textContent = "Abrir carta";
      btn.addEventListener("click", () => openChapter(ch));
    } else {
      btn.className = "btn btn-locked";
      btn.textContent = "🔒 Bloqueado";
      btn.disabled = true;
    }

    card.append(num, title, note, btn);
    grid.appendChild(card);
  });

  const total = chaptersData.length;
  const percent = Math.round((unlocked / total) * 100);
  document.getElementById("unlockedCount").textContent = unlocked;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("progressPercent").textContent = percent + "%";
  requestAnimationFrame(() => {
    document.getElementById("progressFill").style.width = percent + "%";
  });
}

/* Cerrar el lector */
modal.addEventListener("click", e => {
  if (e.target.hasAttribute("data-close")) closeChapter();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeChapter();
});

/* Música */
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const musicLabel = document.getElementById("musicLabel");

musicBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().then(() => {
      musicBtn.classList.add("playing");
      musicBtn.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Pausar música instrumental";
    }).catch(() => {
      musicLabel.textContent = "No se encontró musica.mp3";
    });
  } else {
    music.pause();
    musicBtn.classList.remove("playing");
    musicBtn.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Reproducir música instrumental";
  }
});

render();
// Si dejan la página abierta, se actualiza cada hora.
setInterval(render, 60 * 60 * 1000);
