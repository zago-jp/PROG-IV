const pokedex = document.getElementById('pokedex');
let listaPokemons = [];

async function carregarPokemons() {
    for (let i = 1; i <= 100; i++) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const data = await res.json();
        listaPokemons.push(data);
    }
    renderizar(listaPokemons);
}

function renderizar(lista) {
    pokedex.innerHTML = '';

    lista.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
            <img src="${p.sprites.front_default}">
            <h3>${p.name}</h3>
        `;

        pokedex.appendChild(card);
    });
}

async function buscarPokemon() {
    const termo = document.getElementById('search').value;

    if (!termo) return renderizar(listaPokemons);

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${termo}`);
    const data = await res.json();

    renderizar([data]);
}

function filtrarTipo() {
    const tipo = document.getElementById('typeFilter').value;

    if (!tipo) return renderizar(listaPokemons);

    const filtrados = listaPokemons.filter(p =>
        p.types.some(t => t.type.name === tipo)
    );

    renderizar(filtrados);
}

carregarPokemons();