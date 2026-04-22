const yami = document.getElementById("yami");
const pontosSpan = document.getElementById("pontos");
const areaJogo = document.getElementById("area-jogo");
const botaoStart = document.getElementById("botao-start");

const cursorEspada = document.getElementById("cursor-espada");
const cursorGlow = document.getElementById("cursor-glow");

let pontos = 0;
let jogoAtivo = false;
let intervaloJogo = null;

/* =========================
   CURSOR FALSO + EFEITO
========================= */

document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    cursorEspada.style.left = `${x}px`;
    cursorEspada.style.top = `${y}px`;

    cursorGlow.style.left = `${x}px`;
    cursorGlow.style.top = `${y}px`;

    const trail = document.createElement("div");
    trail.classList.add("trail");
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;

    document.body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 450);
});

/* =========================
   YAMI
========================= */

function moverYami() {
    const larguraArea = areaJogo.clientWidth;
    const alturaArea = areaJogo.clientHeight;

    const larguraYami = 135;
    const alturaYami = 135;

    const maxX = larguraArea - larguraYami;
    const maxY = alturaArea - alturaYami;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    yami.style.left = `${x}px`;
    yami.style.top = `${y}px`;
    yami.style.display = "block";
}

function atualizarPontos() {
    pontosSpan.textContent = pontos;
}

function iniciarJogo() {
    jogoAtivo = true;
    pontos = 0;
    atualizarPontos();

    moverYami();

    intervaloJogo = setInterval(() => {
        moverYami();
    }, 2000);

    botaoStart.textContent = "Parar";
}

function pararJogo() {
    jogoAtivo = false;
    clearInterval(intervaloJogo);
    intervaloJogo = null;

    yami.style.display = "none";
    botaoStart.textContent = "Reiniciar";
}

botaoStart.addEventListener("click", () => {
    if (!jogoAtivo && botaoStart.textContent === "Start") {
        iniciarJogo();
    } else if (jogoAtivo) {
        pararJogo();
    } else {
        iniciarJogo();
    }
});

yami.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!jogoAtivo) {
        return;
    }

    pontos++;
    atualizarPontos();
    moverYami();
});