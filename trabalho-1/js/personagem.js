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
  obterParametroUrl,
  renderizarErro,
  criarSecao
} = window.HXHUtils;

const IMAGEM_FALLBACK_PERSONAGEM = "assets/imagens/geral/logo-hunter-wiki.png";

function temTexto(valor) {
  return textoSeguro(valor, "").trim() !== "";
}

function anexarSeExistir(pai, filho) {
  if (filho) pai.appendChild(filho);
}

function criarParagrafo(texto) {
  return temTexto(texto) ? criarElemento("p", "", texto) : null;
}

function renderizarSecao(layout, titulo, conteudos) {
  const itens = (Array.isArray(conteudos) ? conteudos : [conteudos]).filter(Boolean);
  if (!itens.length) return;

  const secao = criarSecao(titulo);
  itens.forEach(function (item) {
    secao.appendChild(item);
  });
  layout.appendChild(secao);
}

function criarInfoGrid(objeto) {
  const chaves = Object.keys(objeto || {}).filter(function (chave) {
    return temTexto(objeto[chave]);
  });
  if (!chaves.length) return null;

  const grid = criarElemento("div", "info-grid");
  chaves.forEach(function (chave) {
    const item = criarElemento("div", "info-item");
    item.appendChild(criarElemento("span", "", chave.replace(/_/g, " ")));
    item.appendChild(document.createTextNode(textoSeguro(objeto[chave], "-")));
    grid.appendChild(item);
  });
  return grid;
}

function criarListaSeHouver(items, renderizador) {
  return temItens(items) ? criarLista(items, renderizador) : null;
}

function criarMiniCardPersonagem(personagem, subtitulo) {
  const link = criarElemento("a", "mini-card");
  const img = criarElemento("img");
  const corpo = criarElemento("div");

  link.href = "personagem.html?id=" + encodeURIComponent(personagem.id);
  link.setAttribute("aria-label", "Abrir perfil de " + personagem.nome);
  configurarImagem(img, personagem.imagem, personagem.nome, IMAGEM_FALLBACK_PERSONAGEM);
  corpo.appendChild(criarElemento("strong", "", personagem.nome));
  corpo.appendChild(criarElemento("p", "", subtitulo || personagem.grupo));

  link.appendChild(img);
  link.appendChild(corpo);
  return link;
}

function renderizarHero(container, personagem) {
  const hero = criarElemento("section", "detail-hero");
  const retrato = criarElemento("div", "detail-portrait");
  const imagem = criarElemento("img");
  const intro = criarElemento("div", "detail-intro");

  configurarImagem(imagem, personagem.imagem, personagem.nome, IMAGEM_FALLBACK_PERSONAGEM);
  retrato.appendChild(imagem);

  intro.appendChild(criarElemento("p", "eyebrow", personagem.grupo));
  intro.appendChild(criarElemento("h1", "", personagem.nome));
  intro.appendChild(criarElemento("p", "", personagem.descricao_curta));
  intro.appendChild(criarTags([
    personagem.subgrupo,
    personagem.atributos && personagem.atributos.estado,
    personagem.atributos && personagem.atributos.tipo_nen
  ]));

  hero.appendChild(retrato);
  hero.appendChild(intro);
  container.appendChild(hero);
}

function renderizarDescricao(layout, personagem) {
  renderizarSecao(layout, "Descrição", [
    criarParagrafo(personagem.descricao_completa),
    personagem.importancia_narrativa ? criarElemento("h3", "", "Importância narrativa") : null,
    criarParagrafo(personagem.importancia_narrativa)
  ]);
}

function renderizarAparencia(layout, personagem) {
  const aparencia = personagem.aparencia || {};
  renderizarSecao(layout, "Aparência", [
    criarParagrafo(aparencia.descricao),
    criarListaSeHouver(aparencia.caracteristicas_visuais, function (valor) {
      return criarElemento("li", "", valor);
    })
  ]);
}

function renderizarPersonalidade(layout, personagem) {
  const personalidade = personagem.personalidade || {};
  const colunas = criarElemento("div", "text-columns");

  [
    ["Traços", "tracos"],
    ["Pontos fortes", "pontos_fortes"],
    ["Fragilidades", "fragilidades"]
  ].forEach(function (grupo) {
    const lista = criarListaSeHouver(personalidade[grupo[1]], function (valor) {
      return criarElemento("li", "", valor);
    });
    if (!lista) return;

    const bloco = criarElemento("div");
    bloco.appendChild(criarElemento("h3", "", grupo[0]));
    bloco.appendChild(lista);
    colunas.appendChild(bloco);
  });

  renderizarSecao(layout, "Personalidade", [
    criarParagrafo(personalidade.descricao),
    colunas.children.length ? colunas : null
  ]);
}

function renderizarHistoria(layout, personagem) {
  const historia = personagem.historia || {};
  const conteudos = [];

  [
    ["Origem", "origem"],
    ["Motivação", "motivacao"],
    ["Desenvolvimento", "desenvolvimento"],
    ["Momento mais importante", "momento_mais_importante"]
  ].forEach(function (entrada) {
    if (!temTexto(historia[entrada[1]])) return;
    conteudos.push(criarElemento("h3", "", entrada[0]), criarParagrafo(historia[entrada[1]]));
  });

  renderizarSecao(layout, "História", conteudos);
}

function renderizarNen(layout, personagem) {
  const nen = personagem.nen || {};
  renderizarSecao(layout, "Nen", [
    criarInfoGrid({
      tipo: nen.tipo_nome || nen.tipo,
      nivel: nen.nivel,
      observações: nen.observacoes
    }),
    criarParagrafo(nen.descricao)
  ]);
}

function textoTecnica(tecnica) {
  return tecnica.descricao || tecnica.uso_em_combate || tecnica.tipo || "Sem descrição.";
}

function renderizarTecnicas(layout, personagem) {
  const colunas = criarElemento("div", "text-columns");

  [
    ["Técnicas básicas", personagem.tecnicas_basicas],
    ["Técnicas avançadas", personagem.tecnicas_avancadas],
    ["Habilidades únicas", personagem.habilidades_unicas]
  ].forEach(function (grupo) {
    const lista = criarListaSeHouver(grupo[1], function (tecnica) {
      const item = criarElemento("li");
      item.appendChild(criarElemento("strong", "", textoSeguro(tecnica.nome, "Técnica") + ": "));
      item.appendChild(document.createTextNode(textoTecnica(tecnica)));
      return item;
    });
    if (!lista) return;

    const bloco = criarElemento("div");
    bloco.appendChild(criarElemento("h3", "", grupo[0]));
    bloco.appendChild(lista);
    colunas.appendChild(bloco);
  });

  renderizarSecao(layout, "Técnicas e habilidades", colunas.children.length ? colunas : null);
}

function renderizarArcos(layout, personagem, arcosPorId) {
  renderizarSecao(layout, "Arcos", criarListaSeHouver(personagem.arcos, function (entrada) {
    const arco = arcosPorId[entrada.arco_id];
    const item = criarElemento("li");
    const strong = criarElemento("strong");
    const link = criarElemento("a", "", arco ? arco.nome : entrada.arco_id);

    link.href = "arco.html?id=" + encodeURIComponent(entrada.arco_id);
    strong.appendChild(link);
    item.appendChild(strong);
    item.appendChild(document.createTextNode(" - " + textoSeguro(entrada.papel, "Participação")));
    anexarSeExistir(item, criarParagrafo(entrada.importancia));
    return item;
  }));
}

function renderizarRelacoes(layout, personagem, personagensPorId) {
  const grid = criarElemento("div", "mini-grid");

  (personagem.relacoes || []).forEach(function (relacao) {
    const alvo = personagensPorId[relacao.personagem_id];
    if (!alvo) return;
    grid.appendChild(criarMiniCardPersonagem(alvo, textoSeguro(relacao.tipo, alvo.grupo) + " - " + textoSeguro(relacao.descricao, "")));
  });

  renderizarSecao(layout, "Relações", grid.children.length ? grid : null);
}

function renderizarConflitos(layout, personagem) {
  renderizarSecao(layout, "Conflitos", criarListaSeHouver(personagem.conflitos, function (conflito) {
    const item = criarElemento("li");
    item.appendChild(criarElemento("strong", "", textoSeguro(conflito.contra, "Conflito") + " - " + textoSeguro(conflito.tipo, "tipo")));
    anexarSeExistir(item, criarParagrafo(conflito.descricao));
    return item;
  }));
}

function renderizarPersonagem(personagem, personagens, arcos) {
  document.title = personagem.nome + " | Hunter x Hunter";

  const container = document.querySelector("#detalhe-personagem");
  const layout = criarElemento("div", "detail-layout");
  const personagensPorId = criarMapaPorId(personagens);
  const arcosPorId = criarMapaPorId(arcos);

  limpar(container);
  renderizarHero(container, personagem);
  renderizarDescricao(layout, personagem);
  renderizarAparencia(layout, personagem);
  renderizarPersonalidade(layout, personagem);
  renderizarHistoria(layout, personagem);
  renderizarSecao(layout, "Atributos", criarInfoGrid(personagem.atributos));
  renderizarNen(layout, personagem);
  renderizarTecnicas(layout, personagem);
  renderizarArcos(layout, personagem, arcosPorId);
  renderizarRelacoes(layout, personagem, personagensPorId);
  renderizarConflitos(layout, personagem);
  renderizarSecao(layout, "Status", criarInfoGrid(personagem.status));
  container.appendChild(layout);
}

function exibirErro(mensagem) {
  renderizarErro("#detalhe-personagem", {
    titulo: "Personagem não encontrado",
    mensagem: mensagem,
    linkTexto: "Voltar ao elenco",
    linkHref: "index.html#personagens"
  });
}

async function iniciarPersonagem() {
  const id = obterParametroUrl("id");
  if (!id) return exibirErro("Nenhum personagem foi selecionado.");

  try {
    const respostas = await Promise.all([
      carregarJson("data/personagens.json", "Não foi possível carregar este perfil."),
      carregarJson("data/arco.json", "Não foi possível carregar os arcos.")
    ]);
    const personagens = respostas[0].personagens || [];
    const arcos = respostas[1].arcos || [];
    const personagem = personagens.find(function (item) {
      return item.id === id;
    });

    if (!personagem) return exibirErro("Este perfil não existe na enciclopédia.");
    renderizarPersonagem(personagem, personagens, arcos);
  } catch (erro) {
    exibirErro(erro.message);
  }
}

document.addEventListener("DOMContentLoaded", iniciarPersonagem);
