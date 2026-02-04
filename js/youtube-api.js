/**
 * Lógica de Integração com YouTube API v3
 * Responsável por: Busca de vídeos, Filtros e Renderização da Galeria
 */

const CONFIG = {
    API_KEY: 'AIzaSyCLUQbHibaLinVQu-MgyWzsAECb3R9OpTg', //
    CHANNEL_ID: 'UCjv4LZFX_kVigZybGhztTRw', //
    MAX_RESULTS: 12 //
};

let state = {
    nextPageToken: '',
    uploadsPlaylistId: '',
    videosCache: [],
    filtroAtual: 'all'
};

const CATEGORIAS = {
    "Todos": "all",
    "Ambientes Interativos": "Ambientes Interativos",
    "Animações": "Animações",
    "Hologramas": "Hologramas",
    "Projeção Mapeada": "Projeção Mapeada",
    "Realidade Aumentada": "Realidade Aumentada",
    "Realidade Virtual": "Realidade Virtual",
    "Robôs": "Robôs",
    "Simuladores": "Simuladores",
    "Colaborativos e Musicais": "Colaborativos e Musicais",
    "Interatividade e Interfaces": "Interatividade e Interfaces",
    "Jogos Interativos": "Jogos Interativos",
    "Produtos": "Produtos",
    "Projetos": "Projetos",
    "Videos Institucionais": "Videos Institucionais",
};

// Inicialização segura
document.addEventListener('DOMContentLoaded', async () => {
    renderizarFiltros();
    await iniciarGaleria();
});

async function iniciarGaleria() {
    try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CONFIG.CHANNEL_ID}&key=${CONFIG.API_KEY}`;
        const response = await fetch(channelUrl);
        
        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        
        const data = await response.json();
        state.uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
        
        await carregarMaisVideos();
    } catch (error) {
        console.error("Falha ao carregar galeria:", error);
        exibirErro("Não foi possível conectar ao YouTube. Verifique sua chave de API ou conexão.");
    }
}

async function carregarMaisVideos() {
    const btn = document.getElementById('btnLoadMore');
    if (btn) btn.innerText = "Carregando...";

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${state.uploadsPlaylistId}&maxResults=${CONFIG.MAX_RESULTS}&key=${CONFIG.API_KEY}${state.nextPageToken ? `&pageToken=${state.nextPageToken}` : ''}`;
        
        const res = await fetch(url);
        const dataList = await res.json();
        
        state.nextPageToken = dataList.nextPageToken || '';
        if (!state.nextPageToken && btn) btn.style.display = 'none';

        const novosVideos = dataList.items.map(item => ({
            id: item.snippet.resourceId.videoId,
            titulo: item.snippet.title,
            thumb: item.snippet.thumbnails.medium.url,
            data: new Date(item.snippet.publishedAt).toLocaleDateString('pt-BR')
        }));

        state.videosCache = [...state.videosCache, ...novosVideos];
        renderizarGaleria();
    } catch (e) {
        console.error("Erro ao carregar mais vídeos:", e);
    } finally {
        if (btn) btn.innerText = "Carregar Mais Vídeos";
    }
}

function renderizarGaleria() {
    const container = document.getElementById('gallery');
    if (!container) return;

    const filtrados = state.filtroAtual === 'all' 
        ? state.videosCache 
        : state.videosCache.filter(v => v.titulo.toLowerCase().includes(state.filtroAtual.toLowerCase()));

    container.innerHTML = filtrados.map(v => `
        <article class="video-card" onclick="abrirVideo('${v.id}')">
            <div class="thumb-wrapper">
                <img src="${v.thumb}" alt="${v.titulo}" loading="lazy">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="card-info">
                <h4>${v.titulo}</h4>
                <p>${v.data}</p>
            </div>
        </article>
    `).join('');
}

function renderizarFiltros() {
    const container = document.getElementById('filter-container');
    if (!container) return;

    container.innerHTML = Object.entries(CATEGORIAS).map(([nome, chave]) => `
        <button class="btn-filter ${chave === state.filtroAtual ? 'active' : ''}" 
                onclick="setFiltro('${chave}', this)">
            ${nome}
        </button>
    `).join('');
}

function setFiltro(chave, elemento) {
    state.filtroAtual = chave;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    elemento.classList.add('active');
    renderizarGaleria();
}

function exibirErro(msg) {
    const container = document.getElementById('gallery');
    if (container) container.innerHTML = `<div class="error-msg">${msg}</div>`;
}