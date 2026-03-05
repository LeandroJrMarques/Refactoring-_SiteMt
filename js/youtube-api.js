/**
 * Lógica de Integração com YouTube API v3 
 */

const CONFIG = {
    API_KEY: 'AIzaSyCLUQbHibaLinVQu-MgyWzsAECb3R9OpTg',
    CHANNEL_ID: 'UCjv4LZFX_kVigZybGhztTRw',
    MAX_RESULTS: 50
};

let state = {
    nextPageToken: '',
    uploadsPlaylistId: '',
    videosCache: [],
    filtroAtual: 'all',
    limiteExibicao: 8 
};

const CATEGORIAS = {
    "Todos": "all",
    "Ambientes Interativos": "ambientesinterativos",
    "Animações": "animações",
    "Hologramas": "hologramas",
    "Projeção Mapeada": "projeçãomapeada",
    "Realidade Aumentada": "realidadeaumentada",
    "Realidade Virtual": "realidadevirtual",
    "Robôs": "robôs",
    "Colaborativos e Musicais": "colaborativosemusicais",
    "Interatividade e Interfaces": "interatividadeinterfaces",
    "Jogos Interativos": "jogosinterativos",
    "Produtos": "produtos",
    "Projetos": "projetos",
    "Vídeos Institucionais": "videosinstitucionais",
    "Na Mídia": "namidia"
};

document.addEventListener('DOMContentLoaded', async () => {
    renderizarFiltros();
    await iniciarGaleria();
    configurarFecharModal(); 
});

async function iniciarGaleria() {
    try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CONFIG.CHANNEL_ID}&key=${CONFIG.API_KEY}`;
        const response = await fetch(channelUrl);
        
        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        
        const data = await response.json();
        state.uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
        
        await carregarTodoOCanal();
    } catch (error) {
        console.error("Falha ao carregar galeria:", error);
        exibirErro("Não foi possível conectar ao YouTube.");
    }
}

async function carregarTodoOCanal() {
    const galleryContainer = document.getElementById('gallery');
    if (galleryContainer) galleryContainer.innerHTML = "Carregando acervo completo...";

    try {
        while (true) {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${state.uploadsPlaylistId}&maxResults=${CONFIG.MAX_RESULTS}&key=${CONFIG.API_KEY}${state.nextPageToken ? `&pageToken=${state.nextPageToken}` : ''}`;
            
            const res = await fetch(url);
            const dataList = await res.json();
            
            const novosVideos = dataList.items.map(item => ({
                id: item.snippet.resourceId.videoId,
                titulo: item.snippet.title,
                descricao: item.snippet.description || "",
                thumb: item.snippet.thumbnails.medium.url,
                data: new Date(item.snippet.publishedAt).toLocaleDateString('pt-BR')
            }));

            state.videosCache = [...state.videosCache, ...novosVideos];
            state.nextPageToken = dataList.nextPageToken || null;

            if (!state.nextPageToken) break;
        }
        const btn = document.getElementById('btnLoadMore');
        if (btn) btn.style.display = 'none';

        renderizarGaleria();
    } catch (e) {
        console.error("Erro ao baixar vídeos:", e);
    }
}

function renderizarGaleria() {
    const container = document.getElementById('gallery');
    if (!container) return;

    const tagNaMidia = "#namidia";

    const todosFiltrados = state.videosCache.filter(v => {
        const desc = v.descricao.toLowerCase();
        const tit = v.titulo.toLowerCase();
        const filtro = state.filtroAtual.toLowerCase();

        if (state.filtroAtual === 'all') {
            return !desc.includes(tagNaMidia) && !tit.includes(tagNaMidia);
        }
        if (filtro === tagNaMidia) {
            return desc.includes(tagNaMidia) || tit.includes(tagNaMidia);
        }
        return tit.includes(filtro) || desc.includes(filtro);
    });

    const visiveis = todosFiltrados.slice(0, state.limiteExibicao);

    const btn = document.getElementById('btnLoadMore');
    if (btn) {
        btn.style.display = todosFiltrados.length > state.limiteExibicao ? 'block' : 'none';
    }

    if (visiveis.length === 0) {
        container.innerHTML = `<div class="info-msg">Nenhum vídeo encontrado.</div>`;
        return;
    }

    container.innerHTML = visiveis.map(v => `
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

function carregarMaisVideos() {
    state.limiteExibicao += 8;
    renderizarGaleria();
}
// --- FUNÇÕES DE INTERAÇÃO (MODAL) ---

function abrirVideo(videoId) {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-iframe');
    
    if (modal && iframe) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.style.display = 'block'; 
        modal.classList.add('active');
    }
}

function fecharModal() {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-iframe');
    
    if (modal && iframe) {
        iframe.src = ""; 
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function configurarFecharModal() {
    const closeBtn = document.querySelector('.modal-close');
    const overlay = document.querySelector('.modal-overlay');

    closeBtn?.addEventListener('click', fecharModal);
    overlay?.addEventListener('click', fecharModal);
}

// --- FILTROS E UTILITÁRIOS ---

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

async function setFiltro(chave, elemento) {
    state.filtroAtual = chave;
    state.filtroAtual = chave;
    state.limiteExibicao = 8;
    
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    elemento.classList.add('active');

    renderizarGaleria();

    const filtrados = state.videosCache.filter(v => {
        const termo = state.filtroAtual.toLowerCase();
        return v.titulo.toLowerCase().includes(termo) || (v.descricao && v.descricao.toLowerCase().includes(termo));
    });

    if (filtrados.length === 0 && state.nextPageToken && chave !== 'all') {
        console.log("Buscando vídeos compatíveis no YouTube...");
        await carregarMaisVideos();
        setFiltro(chave, elemento);
    }
}

function exibirErro(msg) {
    const container = document.getElementById('gallery');
    if (container) container.innerHTML = `<div class="error-msg">${msg}</div>`;
}

document.getElementById('btnLoadMore')?.addEventListener('click', carregarMaisVideos);