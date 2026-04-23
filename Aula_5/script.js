const pokedex = document.getElementById("pokedex");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

let lista = [];
let listaOriginal = [];

// carregar tipos no select
const tipos = ["fire","water","grass","electric","rock","ground","psychic"];
const select = document.getElementById("typeFilter");

tipos.forEach(t => {
    const op = document.createElement("option");
    op.value = t;
    op.textContent = t;
    select.appendChild(op);
});

// carregar pokemons
async function carregar() {
    let promessas = [];

    for (let i = 1; i <= 151; i++) {
        promessas.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(r => r.json()));
    }

    lista = await Promise.all(promessas);
    listaOriginal = [...lista];

    render(lista);
}

// renderizar cards
function render(lista) {
    pokedex.innerHTML = "";

    lista.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${p.sprites.front_default}">
            <h3>${p.name}</h3>
            ${p.types.map(t => `<span class="type">${t.type.name}</span>`).join("")}
        `;

        card.onclick = () => abrirModal(p);

        pokedex.appendChild(card);
    });
}

// buscar
async function buscarPokemon() {
    const valor = document.getElementById("search").value.toLowerCase();

    if (!valor) return render(listaOriginal);

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${valor}`);
        const data = await res.json();
        render([data]);
    } catch {
        pokedex.innerHTML = "<p>Não encontrado</p>";
    }
}

// filtro
function filtrarTipo() {
    const tipo = select.value;

    if (!tipo) return render(listaOriginal);

    const filtrados = listaOriginal.filter(p =>
        p.types.some(t => t.type.name === tipo)
    );

    render(filtrados);
}

// modal
function abrirModal(p) {
    modal.classList.remove("hidden");

    const stats = p.stats.map(s => {
        return `<p>${s.stat.name.toUpperCase()}: ${s.base_stat}</p>`;
    }).join("");

    modalBody.innerHTML = `
        <h2>${p.name}</h2>
        <img src="${p.sprites.front_default}">
        
        <p><strong>ID:</strong> ${p.id}</p>
        <p><strong>Altura:</strong> ${p.height}</p>
        <p><strong>Peso:</strong> ${p.weight}</p>

        <h3>Atributos</h3>
        ${stats}
    `;
}

function fecharModal() {
    modal.classList.add("hidden");
}

carregar();