"use strict";

const {
  criarElemento,
  limpar,
  carregarJson,
  textoSeguro,
  temItens,
  configurarImagem,
  criarTags,
  criarLista,
  criarMapaPorId,
  renderizarErro,
  criarSecao
} = window.HXHUtils;

const IMAGEM_FALLBACK_NEN = "assets/imagens/geral/logo-hunter-wiki.png";

function criarCardTecnica(tecnica) {
  const card = criarElemento("article", "tech-card");

  if (tecnica.imagem) {
    const img = criarElemento("img");
    configurarImagem(img, tecnica.imagem, tecnica.nome, IMAGEM_FALLBACK_NEN);
    card.appendChild(img);
  }

  card.appendChild(criarElemento("h3", "", tecnica.nome));
  card.appendChild(criarElemento("p", "", textoSeguro(tecnica.descricao_completa || tecnica.descricao_curta, "")));
  if (tecnica.funcao_principal) card.appendChild(criarTags([tecnica.funcao_principal]));
  return card;
}

function criarCardTipo(tipo) {
  const card = criarElemento("article", "type-card");
  const img = criarElemento("img");
  configurarImagem(img, tipo.imagem, tipo.nome, IMAGEM_FALLBACK_NEN);

  card.appendChild(img);
  card.appendChild(criarElemento("h3", "", tipo.nome));
  card.appendChild(criarElemento("p", "", textoSeguro(tipo.descricao_completa, tipo.descricao_curta)));
  card.appendChild(criarTags([tipo.nome_ingles, tipo.resultado_no_teste_da_agua]));
  return card;
}

function criarCardHabilidade(habilidade) {
  const card = criarElemento("article", "ability-card");
  card.appendChild(criarElemento("h3", "", habilidade.nome));
  card.appendChild(criarElemento("p", "", habilidade.descricao));
  card.appendChild(criarTags([habilidade.usuario_nome, habilidade.tipo_principal]));
  card.appendChild(criarLista([
    ["Funcionamento", habilidade.funcionamento],
    ["Condições", habilidade.condicoes],
    ["Fraquezas", (habilidade.fraquezas || []).join(" ")]
  ], function (entrada) {
    const item = criarElemento("li");
    item.appendChild(criarElemento("strong", "", entrada[0] + ": "));
    item.appendChild(document.createTextNode(textoSeguro(entrada[1], "Sem registro.")));
    return item;
  }));
  return card;
}

function renderizarHero(container, nen) {
  const hero = criarElemento("section", "hero");
  const img = criarElemento("img");
  const overlay = criarElemento("div", "hero-overlay");
  const content = criarElemento("div", "container hero-content");

  configurarImagem(img, nen.metadata && nen.metadata.imagem_principal, nen.metadata && nen.metadata.titulo, IMAGEM_FALLBACK_NEN);
  content.appendChild(criarElemento("p", "eyebrow", "Sistema de poder"));
  content.appendChild(criarElemento("h1", "", textoSeguro(nen.metadata && nen.metadata.titulo, "Nen")));
  content.appendChild(criarElemento("p", "", textoSeguro(nen.metadata && nen.metadata.subtitulo, "Aura, técnica e estratégia em Hunter x Hunter.")));

  hero.appendChild(img);
  hero.appendChild(overlay);
  hero.appendChild(content);
  container.appendChild(hero);
}

function renderizarMenu(layout, nen) {
  if (!temItens(nen.menu)) return;

  const secao = criarSecao("Índice de Nen");
  const menu = criarElemento("nav", "nen-menu");
  menu.setAttribute("aria-label", "Índice de seções de Nen");

  (nen.menu || []).forEach(function (item) {
    const link = criarElemento("a", "", item.titulo);
    link.href = "#" + item.id;
    link.title = item.descricao;
    menu.appendChild(link);
  });

  secao.appendChild(menu);
  layout.appendChild(secao);
}

function renderizarIntroducao(layout, nen) {
  const introducao = nen.introducao || {};
  const aura = introducao.aura || {};
  const secao = criarSecao(textoSeguro(introducao.titulo, "O que é Nen?"), "introducao");

  secao.appendChild(criarElemento("p", "", textoSeguro(introducao.descricao_completa || introducao.descricao, "")));
  secao.appendChild(criarElemento("h3", "", "Aura"));
  secao.appendChild(criarElemento("p", "", textoSeguro(aura.descricao, "")));
  secao.appendChild(criarElemento("h3", "", "Importância"));
  secao.appendChild(criarElemento("p", "", textoSeguro(aura.importancia, "")));
  secao.appendChild(criarElemento("h3", "", "Riscos"));
  secao.appendChild(criarElemento("p", "", textoSeguro(aura.riscos, "")));
  layout.appendChild(secao);
}

function renderizarTecnicas(layout, titulo, id, tecnicas) {
  if (!temItens(tecnicas)) return;

  const secao = criarSecao(titulo, id);
  const grid = criarElemento("div", "tech-grid");

  tecnicas.forEach(function (tecnica) {
    grid.appendChild(criarCardTecnica(tecnica));
  });

  secao.appendChild(grid);
  layout.appendChild(secao);
}

function renderizarTestes(layout, testes) {
  if (!temItens(testes)) return;

  const secao = criarSecao("Testes de afinidade", "testes");
  secao.appendChild(criarLista(testes, function (teste) {
    const item = criarElemento("li");
    item.appendChild(criarElemento("strong", "", teste.nome));
    item.appendChild(criarElemento("p", "", teste.descricao));
    item.appendChild(criarElemento("p", "", teste.como_funciona));

    if (teste.resultados_por_tipo && teste.resultados_por_tipo.length) {
      item.appendChild(criarTags(teste.resultados_por_tipo.map(function (resultado) {
        return resultado.tipo_nome + ": " + resultado.resultado;
      })));
    }

    return item;
  }));
  layout.appendChild(secao);
}

function renderizarTipos(layout, tipos) {
  if (!temItens(tipos)) return;

  const secao = criarSecao("Tipos de Nen", "tipos");
  const grid = criarElemento("div", "type-grid");

  tipos.forEach(function (tipo) {
    grid.appendChild(criarCardTipo(tipo));
  });

  secao.appendChild(grid);
  layout.appendChild(secao);
}

function renderizarHabilidades(layout, habilidades) {
  if (!temItens(habilidades)) return;

  const secao = criarSecao("Habilidades de Nen", "habilidades-de-nen");
  const grid = criarElemento("div", "ability-grid");

  habilidades.forEach(function (habilidade) {
    grid.appendChild(criarCardHabilidade(habilidade));
  });

  secao.appendChild(grid);
  layout.appendChild(secao);
}

function renderizarCondicoes(layout, condicoes) {
  const secao = criarSecao("Condições, restrições e contratos", "condicoes-e-restricoes");
  const alias = criarElemento("span", "anchor-offset");
  const dados = condicoes || {};
  alias.id = "contratos";

  secao.insertBefore(alias, secao.firstChild);
  secao.appendChild(criarElemento("p", "", textoSeguro(dados.descricao, "")));
  secao.appendChild(criarElemento("h3", "", "Princípios"));
  secao.appendChild(criarLista(dados.principios || [], function (principio) {
    return criarElemento("li", "", principio);
  }));
  secao.appendChild(criarElemento("h3", "", "Exemplos"));
  secao.appendChild(criarLista(dados.exemplos || [], function (exemplo) {
    const item = criarElemento("li");
    item.appendChild(criarElemento("strong", "", exemplo.exemplo));
    item.appendChild(criarElemento("p", "", exemplo.descricao));
    return item;
  }));
  layout.appendChild(secao);
}

function renderizarDiagrama(layout, diagrama) {
  const dados = diagrama || {};
  const secao = criarSecao("Diagrama de afinidade", "diagrama-afinidade");
  const img = criarElemento("img", "nen-image");

  configurarImagem(img, dados.imagem, "Diagrama de afinidade do Nen", IMAGEM_FALLBACK_NEN);
  secao.appendChild(img);
  secao.appendChild(criarElemento("p", "", textoSeguro(dados.descricao, "")));
  secao.appendChild(criarTags(dados.ordem_circular || []));
  secao.appendChild(criarLista(dados.regras || [], function (regra) {
    return criarElemento("li", "", regra);
  }));
  layout.appendChild(secao);
}

function renderizarExemplos(layout, exemplos, personagensPorId) {
  if (!temItens(exemplos)) return;

  const secao = criarSecao("Exemplos de usuários", "exemplos-de-usuarios");
  const grid = criarElemento("div", "mini-grid");

  exemplos.forEach(function (exemplo) {
    const personagem = personagensPorId[exemplo.personagem_id];
    const link = criarElemento("a", "mini-card");
    const img = criarElemento("img");
    const corpo = criarElemento("div");

    link.href = "personagem.html?id=" + encodeURIComponent(exemplo.personagem_id);
    link.setAttribute("aria-label", "Abrir perfil de " + exemplo.nome);
    configurarImagem(img, personagem ? personagem.imagem : "", exemplo.nome, IMAGEM_FALLBACK_NEN);
    corpo.appendChild(criarElemento("strong", "", exemplo.nome));
    corpo.appendChild(criarElemento("p", "", exemplo.tipo_nome + " - " + exemplo.habilidade_principal));
    link.appendChild(img);
    link.appendChild(corpo);
    grid.appendChild(link);
  });

  secao.appendChild(grid);
  layout.appendChild(secao);
}

function renderizarGlossario(layout, glossario, observacoes) {
  if (!temItens(glossario) && !temItens(observacoes)) return;

  const secao = criarSecao("Glossário", "glossario");
  if (temItens(glossario)) {
    secao.appendChild(criarLista(glossario, function (entrada) {
      const item = criarElemento("li");
      item.appendChild(criarElemento("strong", "", entrada.termo + ": "));
      item.appendChild(document.createTextNode(entrada.definicao));
      return item;
    }));
  }
  if (temItens(observacoes)) {
    secao.appendChild(criarElemento("h3", "", "Observações"));
    secao.appendChild(criarLista(observacoes, function (obs) {
      const item = criarElemento("li");
      item.appendChild(criarElemento("strong", "", obs.titulo + ": "));
      item.appendChild(document.createTextNode(obs.descricao));
      return item;
    }));
  }
  layout.appendChild(secao);
}

function sincronizarAncoraAtual() {
  const id = decodeURIComponent(window.location.hash.replace("#", ""));
  if (!id) return;

  const alvo = document.getElementById(id);
  if (alvo) alvo.scrollIntoView();
}

function renderizarNen(nen, personagens) {
  document.title = "Nen | Hunter x Hunter";

  const container = document.querySelector("#pagina-nen");
  limpar(container);

  const personagensPorId = criarMapaPorId(personagens);
  const wrapper = criarElemento("div", "container");
  const layout = criarElemento("div", "detail-layout");

  renderizarHero(container, nen);
  renderizarMenu(layout, nen);
  renderizarIntroducao(layout, nen);
  renderizarTecnicas(layout, "Técnicas básicas", "tecnicas-basicas", nen.tecnicas_basicas || []);
  renderizarTecnicas(layout, "Técnicas avançadas", "tecnicas-avancadas", nen.tecnicas_avancadas || []);
  renderizarTestes(layout, nen.testes || []);
  renderizarTipos(layout, nen.tipos || []);
  renderizarHabilidades(layout, nen.habilidades_nen || []);
  renderizarCondicoes(layout, nen.condicoes_e_restricoes);
  renderizarDiagrama(layout, nen.diagrama_afinidade);
  renderizarExemplos(layout, nen.personagens_exemplo || [], personagensPorId);
  renderizarGlossario(layout, nen.glossario || [], nen.observacoes || []);

  wrapper.appendChild(layout);
  container.appendChild(wrapper);
  requestAnimationFrame(sincronizarAncoraAtual);
}

function exibirErro(mensagem) {
  renderizarErro("#pagina-nen", {
    titulo: "Guia de Nen indisponível",
    mensagem: mensagem,
    envolverContainer: true
  });
}

async function iniciarNen() {
  try {
    const respostas = await Promise.all([
      carregarJson("data/nem.json", "Não foi possível carregar o guia de Nen."),
      carregarJson("data/personagens.json", "Não foi possível carregar os personagens.")
    ]);

    const dadosNen = respostas[0];
    const dadosPersonagens = respostas[1];
    const nen = dadosNen.nen;
    const personagens = dadosPersonagens.personagens || [];

    if (!nen) {
      exibirErro("As informações de Nen não foram encontradas.");
      return;
    }

    renderizarNen(nen, personagens);
  } catch (erro) {
    exibirErro(erro.message);
  }
}

document.addEventListener("DOMContentLoaded", iniciarNen);
