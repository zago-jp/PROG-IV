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

const IMAGEM_FALLBACK_ARCO = "assets/imagens/geral/banner-home.jpg";
const IMAGEM_FALLBACK_PERSONAGEM = "assets/imagens/geral/logo-hunter-wiki.png";

function anexar(pai, filho) {
  if (filho) pai.appendChild(filho);
}

function paragrafo(texto) {
  return textoSeguro(texto, "").trim() ? criarElemento("p", "", texto) : null;
}

function listaSeHouver(items, renderizador) {
  return temItens(items) ? criarLista(items, renderizador) : null;
}

function renderizarSecao(layout, titulo, conteudos) {
  const filhos = (Array.isArray(conteudos) ? conteudos : [conteudos]).filter(Boolean);
  if (!filhos.length) return;

  const secao = criarSecao(titulo);
  filhos.forEach(function (filho) {
    secao.appendChild(filho);
  });
  layout.appendChild(secao);
}

function criarMiniCardPersonagem(personagem, papel, descricao) {
  const link = criarElemento("a", "mini-card");
  const img = criarElemento("img");
  const corpo = criarElemento("div");

  link.href = "personagem.html?id=" + encodeURIComponent(personagem.id);
  link.setAttribute("aria-label", "Abrir perfil de " + personagem.nome);
  configurarImagem(img, personagem.imagem, personagem.nome, IMAGEM_FALLBACK_PERSONAGEM);
  corpo.appendChild(criarElemento("strong", "", personagem.nome));
  corpo.appendChild(criarElemento("p", "", textoSeguro(papel, personagem.grupo)));
  anexar(corpo, paragrafo(descricao));

  link.appendChild(img);
  link.appendChild(corpo);
  return link;
}

function renderizarBanner(container, arco) {
  const banner = criarElemento("section", "detail-banner");
  const imagem = criarElemento("img");
  configurarImagem(imagem, arco.imagem, arco.nome, IMAGEM_FALLBACK_ARCO);
  banner.appendChild(imagem);
  container.appendChild(banner);
}

function renderizarIntro(container, arco) {
  const wrapper = criarElemento("div", "container");
  const intro = criarElemento("section", "detail-intro");

  intro.appendChild(criarElemento("p", "eyebrow", textoSeguro(arco.nome_original, "Arco narrativo")));
  intro.appendChild(criarElemento("h1", "", arco.nome));
  intro.appendChild(criarElemento("p", "", arco.descricao_completa));
  intro.appendChild(criarTags(["Episódios " + arco.episodios_2011, "Arco " + arco.ordem, arco.nivel_importancia]));
  wrapper.appendChild(intro);
  container.appendChild(wrapper);
}

function renderizarHistoria(layout, arco) {
  renderizarSecao(layout, "História", listaSeHouver(arco.historia_detalhada, function (bloco) {
    const item = criarElemento("li");
    item.appendChild(criarElemento("strong", "", bloco.titulo));
    anexar(item, paragrafo(bloco.texto));
    return item;
  }));
}

function renderizarTemasLocais(layout, arco) {
  const conteudos = [];

  if (temItens(arco.temas)) conteudos.push(criarElemento("h3", "", "Temas"), criarTags(arco.temas));
  if (temItens(arco.locais)) {
    conteudos.push(criarElemento("h3", "", "Locais"));
    conteudos.push(criarLista(arco.locais, function (local) {
      const item = criarElemento("li");
      item.appendChild(criarElemento("strong", "", local.nome));
      anexar(item, paragrafo(local.descricao));
      return item;
    }));
  }

  renderizarSecao(layout, "Temas e locais", conteudos);
}

function renderizarGrupoPersonagens(layout, titulo, itens, personagensPorId) {
  const grid = criarElemento("div", "mini-grid");

  (itens || []).forEach(function (entrada) {
    const personagem = personagensPorId[entrada.personagem_id];
    if (personagem) grid.appendChild(criarMiniCardPersonagem(personagem, entrada.papel, entrada.importancia_no_arco));
  });

  renderizarSecao(layout, titulo, grid.children.length ? grid : null);
}

function renderizarEventos(layout, arco, personagensPorId) {
  renderizarSecao(layout, "Eventos principais", listaSeHouver(arco.eventos_principais, function (evento) {
    const envolvidos = (evento.personagens_envolvidos || [])
      .map(function (id) {
        return personagensPorId[id] && personagensPorId[id].nome;
      })
      .filter(Boolean);
    const item = criarElemento("li");

    item.appendChild(criarElemento("strong", "", evento.titulo));
    anexar(item, paragrafo(evento.descricao));
    if (envolvidos.length) item.appendChild(criarTags(envolvidos));
    return item;
  }));
}

function renderizarConflitos(layout, arco) {
  renderizarSecao(layout, "Conflitos", listaSeHouver(arco.conflitos, function (conflito) {
    const item = criarElemento("li");
    item.appendChild(criarElemento("strong", "", conflito.titulo + " - " + conflito.tipo));
    anexar(item, paragrafo(conflito.descricao));
    return item;
  }));
}

function renderizarEvolucao(layout, arco, personagensPorId) {
  renderizarSecao(layout, "Evolução dos personagens", listaSeHouver(arco.evolucao_personagens, function (entrada) {
    const personagem = personagensPorId[entrada.personagem_id];
    const item = criarElemento("li");
    const strong = criarElemento("strong");

    if (personagem) {
      const link = criarElemento("a", "", personagem.nome);
      link.href = "personagem.html?id=" + encodeURIComponent(personagem.id);
      strong.appendChild(link);
    } else {
      strong.textContent = entrada.personagem_id;
    }

    item.appendChild(strong);
    anexar(item, paragrafo(entrada.evolucao));
    return item;
  }));
}

function renderizarImpacto(layout, arco) {
  renderizarSecao(layout, "Impacto narrativo", [
    criarElemento("h3", "", "Objetivo narrativo"),
    paragrafo(arco.objetivo_narrativo),
    criarElemento("h3", "", "Impacto na história"),
    paragrafo(arco.impacto_na_historia),
    criarElemento("h3", "", "Ligação com o próximo arco"),
    paragrafo(arco.gancho_para_proximo_arco)
  ]);
}

function renderizarArco(arco, personagens) {
  document.title = arco.nome + " | Hunter x Hunter";

  const container = document.querySelector("#detalhe-arco");
  const wrapper = criarElemento("div", "container");
  const layout = criarElemento("div", "detail-layout");
  const personagensPorId = criarMapaPorId(personagens);

  limpar(container);
  renderizarBanner(container, arco);
  renderizarIntro(container, arco);
  renderizarHistoria(layout, arco);
  renderizarTemasLocais(layout, arco);
  renderizarGrupoPersonagens(layout, "Participantes", arco.participantes, personagensPorId);
  renderizarGrupoPersonagens(layout, "Aliados", arco.aliados, personagensPorId);
  renderizarGrupoPersonagens(layout, "Inimigos", arco.inimigos, personagensPorId);
  renderizarEventos(layout, arco, personagensPorId);
  renderizarConflitos(layout, arco);
  renderizarEvolucao(layout, arco, personagensPorId);
  renderizarImpacto(layout, arco);

  wrapper.appendChild(layout);
  container.appendChild(wrapper);
}

function exibirErro(mensagem) {
  renderizarErro("#detalhe-arco", {
    titulo: "Arco não encontrado",
    mensagem: mensagem,
    linkTexto: "Voltar aos arcos",
    linkHref: "index.html#arcos",
    envolverContainer: true
  });
}

async function iniciarArco() {
  const id = obterParametroUrl("id");
  if (!id) return exibirErro("Nenhum arco foi selecionado.");

  try {
    const respostas = await Promise.all([
      carregarJson("data/arco.json", "Não foi possível carregar este arco."),
      carregarJson("data/personagens.json", "Não foi possível carregar os personagens.")
    ]);
    const arcos = respostas[0].arcos || [];
    const personagens = respostas[1].personagens || [];
    const arco = arcos.find(function (item) {
      return item.id === id;
    });

    if (!arco) return exibirErro("Este arco não existe na enciclopédia.");
    renderizarArco(arco, personagens);
  } catch (erro) {
    exibirErro(erro.message);
  }
}

document.addEventListener("DOMContentLoaded", iniciarArco);
