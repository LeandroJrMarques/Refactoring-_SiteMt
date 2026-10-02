/* ============================================================
   PLAYER.JS — Lógica exclusiva do Player de Música Mediateam
   ============================================================ */

(function () {
    /* -----------------------------------------------------------------
       PARAMETROS DE AJUSTE DO PLAYER (JavaScript)
       ----------------------------------------------------------------- */

    // Volume inicial da musica (0.0 = mudo, 1.0 = maximo).
    // AUMENTE se a musica estiver baixa demais ao abrir o site.
    // DIMINUA se a musica estiver incomodando quem entra no site.
    var VOLUME = 0.55;

    // Tempo em segundos que a musica leva para subir do zero ate o VOLUME.
    // AUMENTE para uma entrada mais suave e discreta.
    // DIMINUA (ou use 0) para a musica ja comecar no volume cheio.
    var FADE_SEGUNDOS = 3;

    // Quantidade de barras desenhadas no espectro de audio.
    // AUMENTE para um espectro mais detalhado e fino.
    // DIMINUA para barras mais grossas e visiveis de longe.
    var BARRAS = 26;

    // Suavizacao do movimento das barras (0 = nervoso, 0.95 = muito lento).
    // AUMENTE se o espectro estiver tremendo demais.
    // DIMINUA se o espectro estiver preguicoso e sem reagir a musica.
    var SUAVIZACAO = 0.8;

    // Altura minima das barras quando a musica esta parada (em pixels).
    // AUMENTE para o espectro nao sumir por completo com a musica parada.
    // DIMINUA para deixar o espectro totalmente liso quando parado.
    var BARRA_MINIMA = 2;

    // Espaco em pixels entre a base da logo e o topo do player.
    // AUMENTE se o player estiver encostando na logo.
    // DIMINUA se o player estiver distante demais da logo.
    var DISTANCIA_LOGO = 28;

    /* ----------------------------------------------------------------- */

    var player   = document.getElementById('mt-player');
    var audio    = document.getElementById('mt-audio');
    var btnPlay  = document.getElementById('mt-btn-play');
    var icone    = document.getElementById('mt-icone-play');
    var canvas   = document.getElementById('mt-espectro');
    var btnLetra = document.getElementById('mt-btn-letra');
    var modal    = document.getElementById('mt-modal-letra');
    var fechar   = document.getElementById('mt-fechar-letra');
    var ctx      = canvas.getContext('2d');

    var audioCtx = null, analisador = null, dados = null;
    var alturas = new Array(BARRAS).fill(0);
    var tocando = false;

    /* ---------- POSICIONA O PLAYER LOGO ABAIXO DA LOGO ---------- */
    function posicionarPlayer() {
        var cabecalho = document.getElementById('site-header');
        var logo = cabecalho ? cabecalho.querySelector('.logo') : null;
        if (!logo) return;

        var r = logo.getBoundingClientRect();
        var fixo = cabecalho && getComputedStyle(cabecalho).position === 'fixed';

        // Se o cabecalho for fixo, a posicao na tela ja e a definitiva.
        // Se nao for, soma-se a rolagem atual para achar a posicao com a pagina no topo.
        var topo = fixo ? r.bottom : (r.bottom + window.scrollY);
        var esq  = fixo ? r.left   : (r.left   + window.scrollX);

        player.style.top  = (topo + DISTANCIA_LOGO) + 'px';
        player.style.left = esq + 'px';
    }

    /* ---------- ESPECTRO DE AUDIO ---------- */
    function prepararAudio() {
        if (audioCtx) return;
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AC();
            var fonte = audioCtx.createMediaElementSource(audio);
            analisador = audioCtx.createAnalyser();
            analisador.fftSize = 128;
            fonte.connect(analisador);
            analisador.connect(audioCtx.destination);
            dados = new Uint8Array(analisador.frequencyBinCount);
        } catch (e) {
            // Se o navegador bloquear a analise, o player continua tocando
            // normalmente, apenas sem o espectro animado.
            analisador = null;
        }
    }

    function ajustarCanvas() {
        var r = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        canvas.width  = Math.max(1, Math.round(r.width  * dpr));
        canvas.height = Math.max(1, Math.round(r.height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function desenhar() {
        requestAnimationFrame(desenhar);

        var largura = canvas.clientWidth;
        var altura  = canvas.clientHeight;
        if (!largura || !altura) return;

        ctx.clearRect(0, 0, largura, altura);

        if (analisador && tocando) { analisador.getByteFrequencyData(dados); }

        var cor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--mt-cor').trim() || '#F97316';
        var largBarra = largura / BARRAS;

        for (var i = 0; i < BARRAS; i++) {
            var alvo = BARRA_MINIMA;
            if (analisador && tocando && dados) {
                // Usa apenas a faixa util do espectro (graves ate medios/agudos)
                var idx = Math.floor(i * (dados.length * 0.7) / BARRAS);
                alvo = BARRA_MINIMA + (dados[idx] / 255) * (altura - BARRA_MINIMA);
            }
            alturas[i] = alturas[i] * SUAVIZACAO + alvo * (1 - SUAVIZACAO);

            ctx.fillStyle = cor;
            ctx.globalAlpha = tocando ? 0.95 : 0.35;
            ctx.fillRect(
                i * largBarra + 1,
                altura - alturas[i],
                Math.max(1, largBarra - 2),
                alturas[i]
            );
        }
        ctx.globalAlpha = 1;
    }

    /* ---------- CONTROLE DE TOCAR / PARAR ---------- */
    function marcarTocando(estado) {
        tocando = estado;
        icone.className = estado ? 'fas fa-stop' : 'fas fa-play';
        btnPlay.classList.remove('mt-pulsando');
    }

    function subirVolume() {
        if (FADE_SEGUNDOS <= 0) { audio.volume = VOLUME; return; }
        audio.volume = 0;
        var passos = FADE_SEGUNDOS * 20;
        var n = 0;
        var t = setInterval(function () {
            n++;
            audio.volume = Math.min(VOLUME, (n / passos) * VOLUME);
            if (n >= passos) clearInterval(t);
        }, 50);
    }

    function tocar(comFade) {
        prepararAudio();
        if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }
        var p = audio.play();
        if (p && p.then) {
            p.then(function () {
                marcarTocando(true);
                if (comFade) subirVolume(); else audio.volume = VOLUME;
            }).catch(function () {
                // Navegador bloqueou o autoplay: o play fica pulsando
                marcarTocando(false);
                btnPlay.classList.add('mt-pulsando');
            });
        }
    }

    function parar() {
        audio.pause();
        audio.currentTime = 0;
        marcarTocando(false);
    }

    btnPlay.addEventListener('click', function () {
        if (tocando) parar(); else tocar(false);
    });

    audio.addEventListener('play',  function () { marcarTocando(true);  });
    audio.addEventListener('pause', function () { marcarTocando(false); });

    /* ---------- MODAL DA LETRA ---------- */
    function abrirLetra()  { modal.classList.add('mt-aberto');    }
    function fecharLetra() { modal.classList.remove('mt-aberto'); }

    btnLetra.addEventListener('click', abrirLetra);
    fechar.addEventListener('click', fecharLetra);
    modal.querySelector('.mt-modal-fundo').addEventListener('click', fecharLetra);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fecharLetra();
    });

    /* ---------- INICIALIZACAO ---------- */
    function iniciar() {
        posicionarPlayer();
        ajustarCanvas();
        desenhar();
        player.classList.add('mt-visivel');

        audio.volume = 0;
        tocar(true);

        // Se o navegador bloquear o autoplay, a musica comeca no primeiro
        // toque/clique/rolagem do visitante (exigencia dos navegadores atuais).
        var destravar = function () {
            if (!tocando && audio.paused) { tocar(true); }
            if (!audio.paused) {
                ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'].forEach(function (ev) {
                    window.removeEventListener(ev, destravar);
                });
            }
        };
        ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'].forEach(function (ev) {
            window.addEventListener(ev, destravar, { passive: true });
        });
    }

    window.addEventListener('resize', function () {
        posicionarPlayer();
        ajustarCanvas();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

    window.addEventListener('load', posicionarPlayer);
})();
