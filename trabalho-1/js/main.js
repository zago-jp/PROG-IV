"use strict";

const {
  criarElemento,
  limpar,
  carregarJson,
  textoSeguro,
  normalizarTexto,
  configurarImagem,
  criarTags,
  criarLista,
  renderizarErro
} = window.HXHUtils;

const HOME_STATE = {
  personagens: [],
  arcos: [],
  nen: null,
  filtroGrupo: "Todos",
  busca: ""
};

const IMAGEM_FALLBACK = "assets/imagens/geral/logo-hunter-wiki.png";
const BANNER_HOME = "assets/imagens/geral/banner-home.jpg";
const BANNER_FALLBACK = "assets/imagens/arcos/hunter-exam.jpg";
const GRUPOS_ANTAGONISTAS = ["Brigada Fantasma", "Formigas Quimera", "Greed Island"];

function limitarTexto(texto, limite) {
  const valor = textoSeguro(texto, "");
  if (valor.length <= limite) return valor;
  return valor.slice(0, limite - 1).trim() + "...";
}

function obterGruposPersonagens() {
  const gruposPorChave = new Map();

  HOME_STATE.personagens.forEach(function (personagem) {
    const grupo = textoSeguro(personagem.grupo, "").trim();
    const grupoNormalizado = normalizarTexto(grupo);

    if (grupo && !gruposPorChave.has(grupoNormalizado)) gruposPorChave.set(grupoNormalizado, grupo);
  });

  return Array.from(gruposPorChave.values()).sort(function (a, b) {
    return a.localeCompare(b, "pt-BR");
  });
}

function configurarBannerHome() {
  const banner = document.querySelector("#banner-home");
  if (!banner) return;
  configurarImagem(banner, BANNER_HOME, "Hunter x Hunter 2011", BANNER_FALLBACK);
}

function criarCardPersonagem(personagem) {
  const article = criarElemento("article", "card");
  const link = criarElemento("a");
  link.href = "personagem.html?id=" + encodeURIComponent(personagem.id);
  link.setAttribute("aria-label", "Abrir perfil de " + personagem.nome);

  const imagem = criarElemento("img", "card-img-personagem");
  configurarImagem(imagem, personagem.imagem, personagem.nome, IMAGEM_FALLBACK);

  const corpo = criarElemento("div", "card-body");
  corpo.appendChild(criarElemento("h3", "", personagem.nome));
  corpo.appendChild(criarElemento("p", "", limitarTexto(personagem.descricao_curta, 145)));
  corpo.appendChild(criarTags([personagem.grupo]));

  link.appendChild(imagem);
  link.appendChild(corpo);
  article.appendChild(link);
  return article;
}

function criarCardArco(arco) {
  const article = criarElemento("article", "card");
  const link = criarElemento("a");
  link.href = "arco.html?id=" + encodeURIComponent(arco.id);
  link.setAttribute("aria-label", "Abrir arco " + arco.nome);

  const imagem = criarElemento("img", "card-img-arco");
  configurarImagem(imagem, arco.imagem, arco.nome, BANNER_FALLBACK);

  const corpo = criarElemento("div", "card-body");
  corpo.appendChild(criarElemento("h3", "", arco.nome));
  corpo.appendChild(criarElemento("p", "", limitarTexto(arco.descricao_curta, 165)));
  corpo.appendChild(criarTags(["Arco " + arco.ordem, "Episódios " + arco.episodios_2011]));

  link.appendChild(imagem);
  link.appendChild(corpo);
  article.appendChild(link);
  return article;
}

function renderizarFiltros() {
  const container = document.querySelector("#filtros-personagens");
  if (!container) return;

  limpar(container);
  ["Todos"].concat(obterGruposPersonagens()).forEach(function (grupo) {
    const ativo = normalizarTexto(grupo) === normalizarTexto(HOME_STATE.filtroGrupo);
    const botao = criarElemento("button", ativo ? "is-active" : "", grupo);
    botao.type = "button";
    botao.addEventListener("click", function () {
      HOME_STATE.filtroGrupo = grupo;
      renderizarFiltros();
      renderizarPersonagensPrincipais();
    });
    container.appendChild(botao);
  });
}

function renderizarPersonagensPrincipais() {
  const container = document.querySelector("#lista-personagens");
  if (!container) return;
  limpar(container);

  const busca = normalizarTexto(HOME_STATE.busca.trim());
  const grupoSelecionado = normalizarTexto(HOME_STATE.filtroGrupo);
  const personagens = HOME_STATE.personagens.filter(function (personagem) {
    const grupoPersonagem = normalizarTexto(personagem.grupo);
    const filtroValido = grupoSelecionado === "todos" || grupoPersonagem === grupoSelecionado;
    const buscaValida = !busca ||
      normalizarTexto(personagem.id).indexOf(busca) !== -1 ||
      normalizarTexto(personagem.nome).indexOf(busca) !== -1 ||
      normalizarTexto(personagem.grupo).indexOf(busca) !== -1 ||
      normalizarTexto(personagem.descricao_curta).indexOf(busca) !== -1;

    return filtroValido && buscaValida;
  });

  if (!personagens.length) {
    container.appendChild(criarElemento("p", "empty-state", "Nenhum personagem encontrado."));
    return;
  }

  personagens.forEach(function (personagem) {
    container.appendChild(criarCardPersonagem(personagem));
  });
}

function ehGrupoAntagonista(personagem) {
  const grupoPersonagem = normalizarTexto(personagem.grupo);
  return GRUPOS_ANTAGONISTAS.some(function (grupo) {
    return normalizarTexto(grupo) === grupoPersonagem;
  });
}

function renderizarInimigos() {
  const container = document.querySelector("#lista-inimigos");
  if (!container) return;
  limpar(container);

  HOME_STATE.personagens
    .filter(ehGrupoAntagonista)
    .forEach(function (personagem) {
      container.appendChild(criarCardPersonagem(personagem));
    });
}

function renderizarArcos() {
  const container = document.querySelector("#lista-arcos");
  if (!container) return;
  limpar(container);

  HOME_STATE.arcos
    .slice()
    .sort(function (a, b) {
      return a.ordem - b.ordem;
    })
    .forEach(function (arco) {
      container.appendChild(criarCardArco(arco));
    });
}

function renderizarResumoNen() {
  const card = document.querySelector("#nen-resumo-card");
  const contratos = document.querySelector("#contratos-nen");
  if (!HOME_STATE.nen) return;

  if (card) {
    limpar(card);
    card.appendChild(criarElemento("p", "eyebrow", "Sistema de Nen"));
    card.appendChild(criarElemento("h2", "", textoSeguro(HOME_STATE.nen.metadata && HOME_STATE.nen.metadata.titulo, "Nen")));
    card.appendChild(criarElemento("p", "", textoSeguro(HOME_STATE.nen.metadata && HOME_STATE.nen.metadata.descricao_curta, "Aura, técnica e personalidade em equilíbrio.")));

    const botao = criarElemento("a", "button", "Conhecer Nen");
    botao.href = "nem.html";
    card.appendChild(botao);
  }

  if (contratos && HOME_STATE.nen.condicoes_e_restricoes) {
    limpar(contratos);
    const bloco = HOME_STATE.nen.condicoes_e_restricoes;
    contratos.appendChild(criarElemento("p", "", textoSeguro(bloco.descricao, "Restrições e juramentos moldam habilidades de aura por meio de riscos claros.")));
    contratos.appendChild(criarLista((bloco.exemplos || []).slice(0, 3), function (exemplo) {
      const item = criarElemento("li");
      item.appendChild(criarElemento("strong", "", exemplo.exemplo + ": "));
      item.appendChild(document.createTextNode(textoSeguro(exemplo.descricao, "")));
      return item;
    }));
  }
}

function configurarBusca() {
  const input = document.querySelector("#busca-personagens");
  if (!input) return;

  input.addEventListener("input", function () {
    HOME_STATE.busca = input.value;
    renderizarPersonagensPrincipais();
  });
}

function renderizarHome() {
  renderizarFiltros();
  renderizarPersonagensPrincipais();
  renderizarInimigos();
  renderizarArcos();
  renderizarResumoNen();
}

async function iniciarHome() {
  configurarBannerHome();
  configurarBusca();

  try {
    const respostas = await Promise.all([
      carregarJson("data/personagens.json", "Não foi possível carregar os personagens."),
      carregarJson("data/arco.json", "Não foi possível carregar os arcos."),
      carregarJson("data/nem.json", "Não foi possível carregar o guia de Nen.")
    ]);

    const dadosPersonagens = respostas[0];
    const dadosArcos = respostas[1];
    const dadosNen = respostas[2];

    HOME_STATE.personagens = dadosPersonagens.personagens || [];
    HOME_STATE.arcos = dadosArcos.arcos || [];
    HOME_STATE.nen = dadosNen.nen || null;

    renderizarHome();
  } catch (erro) {
    renderizarErro(document.querySelector("main"), {
      titulo: "Enciclopédia indisponível",
      mensagem: erro.message,
      envolverContainer: true
    });
  }
}

document.addEventListener("DOMContentLoaded", iniciarHome);
