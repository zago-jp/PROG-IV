(function () {
  "use strict";

  var PLACEHOLDER_IMAGEM = "assets/imagens/geral/placeholder.png";
  var IMAGEM_TRANSPARENTE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  function criarElemento(tag, classe, texto) {
    var elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined && texto !== null) elemento.textContent = texto;
    return elemento;
  }

  function limpar(elemento) {
    while (elemento && elemento.firstChild) elemento.removeChild(elemento.firstChild);
  }

  async function carregarJson(caminho, mensagemErro) {
    try {
      var resposta = await fetch(caminho, { cache: "no-store" });
      if (!resposta.ok) throw new Error("HTTP " + resposta.status);
      return await resposta.json();
    } catch (erro) {
      throw new Error(mensagemErro || "Não foi possível carregar as informações da enciclopédia.");
    }
  }

  function textoSeguro(valor, fallback) {
    if (valor === undefined || valor === null || valor === "") return fallback || "";
    return String(valor);
  }

  function normalizarTexto(valor) {
    return textoSeguro(valor, "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function temItens(lista) {
    return Array.isArray(lista) && lista.length > 0;
  }

  function aplicarFallbackImagem(imagem, fallback) {
    if (!imagem) return;

    imagem.onerror = function () {
      var srcAtual = imagem.getAttribute("src") || "";

      if (fallback && srcAtual.indexOf(fallback) === -1) {
        imagem.src = fallback;
        return;
      }

      if (srcAtual.indexOf(PLACEHOLDER_IMAGEM) === -1) {
        imagem.src = PLACEHOLDER_IMAGEM;
        return;
      }

      imagem.onerror = null;
      imagem.classList.add("image-placeholder");
      imagem.src = IMAGEM_TRANSPARENTE;
    };
  }

  function configurarImagem(imagem, caminho, alt, fallback) {
    if (!imagem) return;
    imagem.alt = alt || "";
    imagem.loading = "lazy";
    aplicarFallbackImagem(imagem, fallback);
    imagem.src = caminho || fallback || PLACEHOLDER_IMAGEM;
  }

  function criarTags(valores) {
    var linha = criarElemento("div", "tag-row");
    (valores || []).filter(Boolean).forEach(function (valor) {
      linha.appendChild(criarElemento("span", "tag", valor));
    });
    return linha;
  }

  function criarLista(items, renderizador, mensagemVazia) {
    var lista = criarElemento("ul", "list");
    if (!items || !items.length) {
      lista.appendChild(criarElemento("li", "", mensagemVazia || "Sem registro nesta seção."));
      return lista;
    }

    items.forEach(function (item) {
      lista.appendChild(renderizador(item));
    });
    return lista;
  }

  function criarMapaPorId(lista) {
    var mapa = {};
    (lista || []).forEach(function (item) {
      if (item && item.id) mapa[item.id] = item;
    });
    return mapa;
  }

  function obterParametroUrl(nome) {
    return new URLSearchParams(window.location.search).get(nome || "id");
  }

  function criarSecao(titulo, id) {
    var secao = criarElemento("section", "detail-section");
    if (id) secao.id = id;
    secao.appendChild(criarElemento("h2", "", titulo));
    return secao;
  }

  function renderizarErro(alvo, opcoes) {
    var container = typeof alvo === "string" ? document.querySelector(alvo) : alvo;
    var config = opcoes || {};
    if (!container) return;

    limpar(container);

    var caixa = criarElemento("div", "error-box");
    caixa.appendChild(criarElemento("h1", "", config.titulo || "Conteúdo indisponível"));
    caixa.appendChild(criarElemento("p", "", config.mensagem || "Não foi possível exibir esta informação."));

    if (config.linkHref && config.linkTexto) {
      var link = criarElemento("a", "button", config.linkTexto);
      link.href = config.linkHref;
      caixa.appendChild(link);
    }

    if (config.envolverContainer) {
      var wrapper = criarElemento("div", "container");
      wrapper.appendChild(caixa);
      container.appendChild(wrapper);
      return;
    }

    container.appendChild(caixa);
  }

  function linkNav(label, href, ativo) {
    var link = criarElemento("a", "", label);
    link.href = href;
    if (ativo) link.setAttribute("aria-current", "page");
    return link;
  }

  function renderizarHeader() {
    var header = document.querySelector("#site-header");
    if (!header) return;

    var pagina = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    var home = pagina === "index.html" || pagina === "";
    var prefixo = home ? "" : "index.html";

    header.className = "site-header";
    limpar(header);

    var inner = criarElemento("div", "container header-inner");
    var brand = criarElemento("a", "brand", "Hunter x Hunter Wiki");
    brand.href = "index.html";

    var nav = criarElemento("nav", "site-nav");
    nav.setAttribute("aria-label", "Navegação principal");
    nav.appendChild(linkNav("Home", "index.html", home));
    nav.appendChild(linkNav("Personagens", prefixo + "#personagens", false));
    nav.appendChild(linkNav("Inimigos", prefixo + "#inimigos", false));
    nav.appendChild(linkNav("Arcos", prefixo + "#arcos", pagina === "arco.html"));
    nav.appendChild(linkNav("Nen", "nem.html", pagina === "nem.html"));

    inner.appendChild(brand);
    inner.appendChild(nav);
    header.appendChild(inner);
  }

  function renderizarFooter() {
    var footer = document.querySelector("#site-footer");
    if (!footer) return;

    footer.className = "site-footer";
    limpar(footer);

    var container = criarElemento("div", "container");
    container.appendChild(criarElemento("p", "", "Enciclopédia digital sobre o universo de Hunter x Hunter."));
    footer.appendChild(container);
  }

  function inicializarLayout() {
    renderizarHeader();
    renderizarFooter();
  }

  window.HXHUtils = {
    criarElemento: criarElemento,
    limpar: limpar,
    carregarJson: carregarJson,
    textoSeguro: textoSeguro,
    normalizarTexto: normalizarTexto,
    temItens: temItens,
    configurarImagem: configurarImagem,
    criarTags: criarTags,
    criarLista: criarLista,
    criarMapaPorId: criarMapaPorId,
    obterParametroUrl: obterParametroUrl,
    renderizarErro: renderizarErro,
    criarSecao: criarSecao
  };

  document.addEventListener("DOMContentLoaded", inicializarLayout);
})();
