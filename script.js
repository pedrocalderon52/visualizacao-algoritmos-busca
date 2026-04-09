document.addEventListener('DOMContentLoaded', () => {
    const slidePages = [
        "slide_busca_comparacao.html",
        "slide_grafo.html",
        "slide_heuristica.html",
        "slide_admissibilidade.html",
        "slide_consistencia.html",
        "slide_metricas.html",
        "slide_dinamismo.html",
        "slide_direcionamento.html",
        "slide_redes_densas.html"
    ];

    function navigateToRelativeSlide(step) {
        const path = window.location.pathname;
        const currentPage = path.substring(path.lastIndexOf('/') + 1) || "slide1.html";
        const currentIndex = slidePages.findIndex(page => currentPage === page || currentPage.includes(page));

        if (currentIndex === -1) return;

        const nextIndex = currentIndex + step;
        if (nextIndex >= 0 && nextIndex < slidePages.length) {
            window.location.href = slidePages[nextIndex];
        }
    }

    // Configuração para navegar usando teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });

    
    function showSlide(index) {
        if (index < 0) index = 0;
        if (index >= slides.length) index = slides.length - 1;
        
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Reflow rápido para reiniciar as animações CSS
        void slides[index].offsetWidth;
        
        slides[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        }
    };

    function prevSlide() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }
    // Antiga navegação removida
    // Configuração para navegar usando botões do mouse (Esquerdo = Voltar, Direito = Avançar)
    document.addEventListener('mousedown', (e) => {
        // Ignora caso o clique seja dentro de um elemento interativo
        if (e.target.tagName.toLowerCase() === 'canvas' || e.target.closest('button, a, input, select, .controls, .canvas-buttons')) return;

        if (e.button === 0) {
            navigateToRelativeSlide(-1);
        } else if (e.button === 2) {
            navigateToRelativeSlide(1);
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName.toLowerCase() === 'canvas' || e.target.closest('button, a, input, select, .controls, .canvas-buttons')) return;
        e.preventDefault();
    });
    
    // Efeito Paralaxe apenas nos objetos INTERNOS (dinâmicos), slide em si fica estático
    document.addEventListener('mousemove', (e) => {
        const slideActive = document.querySelector('.slide.active');
        if(!slideActive) return;

        const dynamicObjects = slideActive.querySelectorAll('.dynamic-object');

        // Calcula a posição do mouse relativa ao centro da tela, com peso reduzido para menos movimento
        const xAxis = (window.innerWidth / 2 - e.pageX) / 100;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 100;
        dynamicObjects.forEach(obj => {
            // Aplica translação aos objetos para parecerem reagir ao mouse
            obj.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
        });
    });
    
    // Reseta o movimento quando o mouse sai da tela
    document.addEventListener('mouseleave', () => {
        const slideActive = document.querySelector('.slide.active');
        if(slideActive) {
            const dynamicObjects = slideActive.querySelectorAll('.dynamic-object');
            dynamicObjects.forEach(obj => {
                obj.style.transform = `translate(0px, 0px)`;
            });
        }
    });

    // === Sistema do Grafo Dinâmico (Canvas) ===
    const canvas = document.getElementById('graph-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        // Resize function
        function resize() {
            // Usa as dimensões de display e multiplica pelo devicePixelRatio para não ficar embaçado
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            width = canvas.width;
            height = canvas.height;
        }

        window.addEventListener('resize', resize);
        
        // Setup initial sizes (espera até a animação do slide começar/terminar)
        setTimeout(resize, 100);

        // Dados do Grafo (posições relativas de 0.0 a 1.0)
        const nodes = [
            { id: 0, x: 0.2, y: 0.3 },
            { id: 1, x: 0.8, y: 0.25 },
            { id: 2, x: 0.5, y: 0.5 },
            { id: 3, x: 0.3, y: 0.75 },
            { id: 4, x: 0.7, y: 0.8 }
        ];

        // Conexões (arestas)
        const edges = [
            [0, 2], [1, 2], [2, 3], [2, 4], [3, 4], [0, 3]
        ];

        // Viajante (ponto dinâmico)
        const traveler = {
            currentNode: 0,
            targetNode: 2,
            progress: 0,
            speed: 0.008
        };

        // Encontra as arestas disponíveis para um nó específico
        function getNeighbors(nodeId) {
            let neighbors = [];
            edges.forEach(edge => {
                if (edge[0] === nodeId) neighbors.push(edge[1]);
                if (edge[1] === nodeId) neighbors.push(edge[0]);
            });
            return neighbors;
        }

        // Função para simular o movimento dos nós flutuando suavemente
        let time = 0;

        function animate() {
            if (width === 0 || height === 0) resize();
            ctx.clearRect(0, 0, width, height);

            // Tempo mais lento para uma movimentação quase imperceptível
            time += 0.01;

            // Calcula posições reais dos nós com uma flutuação MÍNIMA, focada na estabilidade e conforto
            const actualPositions = nodes.map((n, i) => {
                const offsetX = Math.sin(time + i * 1.5) * (width * 0.003); // Reduzido de 0.015 para 0.003
                const offsetY = Math.cos(time + i) * (height * 0.003);
                return {
                    x: n.x * width + offsetX,
                    y: n.y * height + offsetY
                };
            });

            ctx.lineJoin = "round";
            ctx.lineCap = "round";

            // 1. Desenha as Arestas
            ctx.lineWidth = 3 * window.devicePixelRatio;
            ctx.strokeStyle = "rgba(79, 70, 229, 0.25)"; // Indigo claro com transparência
            edges.forEach(edge => {
                const start = actualPositions[edge[0]];
                const end = actualPositions[edge[1]];
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            });

            // 2. Movimenta e Desenha o Viajante
            traveler.progress += traveler.speed;
            if (traveler.progress >= 1) {
                // Chegou ao nó destino, sortear o próximo vizinho
                traveler.currentNode = traveler.targetNode;
                const neighbors = getNeighbors(traveler.currentNode);
                // Evita voltar imediatamente se houver mais de uma opção (para ser dinâmico)
                let nextNode = neighbors[Math.floor(Math.random() * neighbors.length)];
                traveler.targetNode = nextNode;
                traveler.progress = 0;
            }

            const startPos = actualPositions[traveler.currentNode];
            const endPos = actualPositions[traveler.targetNode];

            // Função de interpolação suave (easeInOutSine)
            const easeProgress = -(Math.cos(Math.PI * traveler.progress) - 1) / 2;

            const travelerX = startPos.x + (endPos.x - startPos.x) * easeProgress;
            const travelerY = startPos.y + (endPos.y - startPos.y) * easeProgress;

            // Desenha um "rastro" atrás do viajante
            ctx.lineWidth = 4 * window.devicePixelRatio;
            ctx.strokeStyle = "rgba(16, 185, 129, 0.6)"; // Verde/Emerald glow
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(travelerX, travelerY);
            ctx.stroke();

            // Desenha o viajante em si
            ctx.beginPath();
            ctx.arc(travelerX, travelerY, 8 * window.devicePixelRatio, 0, Math.PI * 2);
            ctx.fillStyle = "#10b981"; // Emerald
            ctx.fill();
            ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
            ctx.shadowBlur = 15;
            ctx.fill(); // Duplo fill para o blur fixar melhor
            ctx.shadowBlur = 0; // reset shadow

            // 3. Desenha os Nós (Vértices)
            actualPositions.forEach((pos, i) => {
                // Se for o nó atual do viajante, dá um destaque
                const isActive = (i === traveler.currentNode) || (i === traveler.targetNode);
                
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, (isActive ? 12 : 10) * window.devicePixelRatio, 0, Math.PI * 2);
                ctx.fillStyle = isActive ? "#4f46e5" : "#818cf8";
                ctx.fill();

                // Borda branca para dar contorno/elegância
                ctx.lineWidth = 3 * window.devicePixelRatio;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();

                // Efeito glow/shadow suave nos nós
                if (isActive) {
                    ctx.shadowColor = "rgba(79, 70, 229, 0.5)";
                    ctx.shadowBlur = 20;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            requestAnimationFrame(animate);
        }

        // Delay para ter certeza que a seção foi montada no DOM
        setTimeout(() => {
            resize();
            animate();
        }, 300);
    }

    // ==== Slide 1: A Evolução da Busca ====
    const canvas1 = document.getElementById('canvas-slide1');
    if (canvas1) {
        const ctx1 = canvas1.getContext('2d');
        let w, h, t = 0;
        function resize1() {
            const rect = canvas1.parentElement.getBoundingClientRect();
            canvas1.width = rect.width * window.devicePixelRatio;
            canvas1.height = rect.height * window.devicePixelRatio;
            w = canvas1.width; h = canvas1.height;
        }
        window.addEventListener('resize', resize1);
        setTimeout(resize1, 100);

        function draw1() {
            if(!w) resize1();
            ctx1.clearRect(0, 0, w, h);
            t += 0.01;
            
            ctx1.lineCap = "round";
            const rows = 10, cols = 10;
            
            // Left Half: Grid
            const gridW = w * 0.35, gridH = h * 0.6;
            const leftBaseX = w * 0.05 + 20, baseY = h * 0.2;
            
            const cellLeftX = gridW / (cols - 1);
            const cellLeftY = gridH / (rows - 1);
            
            const centerR = 4, centerC = 4; // origin node center
            
            // Left Grid nodes radial expansion
            ctx1.fillStyle = "#64748b";
            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    const distDist = Math.hypot(r - centerR, c - centerC);
                    const wave = (t * 8 - distDist) % 15;
                    let alpha = 0.2;
                    if(wave > 0 && wave < 5) {
                        alpha = 0.2 + 0.8 * Math.sin((wave/5) * Math.PI);
                    }
                    const px = leftBaseX + c * cellLeftX;
                    const py = baseY + r * cellLeftY;
                    ctx1.globalAlpha = alpha;
                    ctx1.beginPath(); ctx1.arc(px, py, 4 * window.devicePixelRatio, 0, Math.PI*2); ctx1.fill();
                }
            }
            ctx1.globalAlpha = 1.0;

            // Right Half: Guided Search
            const rightBaseX = w * 0.55 + 20;
            const cellRightX = gridW / (cols - 1);
            const cellRightY = gridH / (rows - 1);

            // Right Grid Background dots
            ctx1.fillStyle = "#64748b";
            ctx1.globalAlpha = 0.15;
            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    const px = rightBaseX + c * cellRightX;
                    const py = baseY + r * cellRightY;
                    ctx1.beginPath(); ctx1.arc(px, py, 3 * window.devicePixelRatio, 0, Math.PI*2); ctx1.fill();
                }
            }
            ctx1.globalAlpha = 1.0;

            // Path / Trail
            const startR = 1, startC = 1;
            const endR = 8, endC = 8;
            const sX = rightBaseX + startC * cellRightX;
            const sY = baseY + startR * cellRightY;
            const eX = rightBaseX + endC * cellRightX;
            const eY = baseY + endR * cellRightY;

            ctx1.beginPath(); ctx1.moveTo(sX, sY); ctx1.lineTo(eX, eY);
            ctx1.strokeStyle = "rgba(16, 185, 129, 0.15)";
            ctx1.lineWidth = 4 * window.devicePixelRatio;
            ctx1.stroke();

            const p = (t * 0.3) % 1; // Agent progress
            const curX = sX + (eX - sX) * p;
            const curY = sY + (eY - sY) * p;

            // Fluid trail
            ctx1.beginPath(); ctx1.moveTo(sX, sY); ctx1.lineTo(curX, curY);
            ctx1.strokeStyle = "rgba(16, 185, 129, 0.8)";
            ctx1.stroke();

            // Goal Node (Indigo)
            ctx1.beginPath(); ctx1.arc(eX, eY, 6 * window.devicePixelRatio, 0, Math.PI*2);
            ctx1.fillStyle = "#4f46e5"; ctx1.fill();
            ctx1.shadowColor = "#4f46e5"; ctx1.shadowBlur = 10; ctx1.fill(); ctx1.shadowBlur = 0;

            // Agent (Emerald)
            ctx1.beginPath(); ctx1.arc(curX, curY, 6 * window.devicePixelRatio, 0, Math.PI*2);
            ctx1.fillStyle = "#10b981"; ctx1.shadowColor = "#10b981"; ctx1.shadowBlur = 12; ctx1.fill(); ctx1.shadowBlur = 0;

            requestAnimationFrame(draw1);
        }
        setTimeout(draw1, 300);
    }

    // ==== Slide 2: Heurística ====
    const canvasH = document.getElementById('canvas-heuristica');
    if (canvasH) {
        const ctxH = canvasH.getContext('2d');
        const tooltipH = document.getElementById('tooltip-heuristica');
        if (tooltipH) tooltipH.style.display = 'none'; // hide old html tooltip
        
        let w, h, t = 0;
        function resizeH() {
            const rect = canvasH.parentElement.getBoundingClientRect();
            canvasH.width = rect.width * window.devicePixelRatio;
            canvasH.height = rect.height * window.devicePixelRatio;
            w = canvasH.width; h = canvasH.height;
        }
        window.addEventListener('resize', resizeH);
        setTimeout(resizeH, 100);

        function drawH() {
            if(!w) resizeH();
            ctxH.clearRect(0, 0, w, h);
            t += 0.02;
            
            const nodeX = w * 0.25, nodeY = h * 0.75;
            const goalX = w * 0.75, goalY = h * 0.25;

            // Aura expanding and contracting around n
            const auraScale = 1 + 0.15 * Math.sin(t * 1.5);
            ctxH.beginPath(); ctxH.arc(nodeX, nodeY, 40 * auraScale * window.devicePixelRatio, 0, Math.PI*2);
            ctxH.fillStyle = "rgba(79, 70, 229, 0.08)"; ctxH.fill();
            
            // Arrow line
            ctxH.beginPath(); ctxH.moveTo(nodeX, nodeY); ctxH.lineTo(goalX, goalY);
            ctxH.strokeStyle = "#4f46e5"; ctxH.lineWidth = 3 * window.devicePixelRatio; ctxH.stroke();

            // Arrow head
            const angle = Math.atan2(goalY - nodeY, goalX - nodeX);
            ctxH.beginPath();
            const headLen = 16 * window.devicePixelRatio;
            ctxH.moveTo(goalX, goalY);
            ctxH.lineTo(goalX - headLen * Math.cos(angle - Math.PI/6), goalY - headLen * Math.sin(angle - Math.PI/6));
            ctxH.lineTo(goalX - headLen * Math.cos(angle + Math.PI/6), goalY - headLen * Math.sin(angle + Math.PI/6));
            ctxH.fillStyle = "#4f46e5"; ctxH.fill();

            // Pulsating h(n) on arrow
            const midX = (nodeX + goalX) / 2;
            const midY = (nodeY + goalY) / 2;
            const textGlow = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5));
            ctxH.font = `italic 600 ${24 * window.devicePixelRatio}px Outfit`;
            ctxH.textAlign = "center";
            ctxH.textBaseline = "bottom";
            
            ctxH.shadowColor = `rgba(79, 70, 229, ${textGlow})`;
            ctxH.shadowBlur = 15;
            ctxH.fillStyle = "#4f46e5";
            ctxH.fillText("h(n)", midX - 10*window.devicePixelRatio, midY - 10*window.devicePixelRatio);
            ctxH.shadowBlur = 0;

            // Goal node
            ctxH.beginPath(); ctxH.arc(goalX, goalY, 8*window.devicePixelRatio, 0, Math.PI*2);
            ctxH.fillStyle = "#64748b"; ctxH.fill();

            // Current Node 'n'
            ctxH.beginPath(); ctxH.arc(nodeX, nodeY, 20*window.devicePixelRatio, 0, Math.PI*2);
            ctxH.fillStyle = "#ffffff"; ctxH.fill();
            ctxH.lineWidth = 2 * window.devicePixelRatio; ctxH.strokeStyle = "#4f46e5"; ctxH.stroke();
            
            ctxH.fillStyle = "#334155"; ctxH.font = `400 ${20 * window.devicePixelRatio}px sans-serif`;
            ctxH.textBaseline = "middle"; ctxH.fillText("n", nodeX, nodeY + 2*window.devicePixelRatio);

            requestAnimationFrame(drawH);
        }
        setTimeout(drawH, 300);
    }

    // ==== Slide 3: Admissibilidade ====
    const canvasA = document.getElementById('canvas-admissibilidade');
    if (canvasA) {
        const ctxA = canvasA.getContext('2d');
        let w, h, t = 0;
        
        function resizeA() {
            const rect = canvasA.parentElement.getBoundingClientRect();
            canvasA.width = rect.width * window.devicePixelRatio;
            canvasA.height = rect.height * window.devicePixelRatio;
            w = canvasA.width; h = canvasA.height;
        }
        window.addEventListener('resize', resizeA);
        setTimeout(resizeA, 100);

        function drawA() {
            if(!w) resizeA();
            ctxA.clearRect(0, 0, w, h);
            t += 0.015; // Slow fluid animation
            
            const baseX = w * 0.15;
            const maxBarW = w * 0.7;
            const barH = 30 * window.devicePixelRatio;
            const topY = h * 0.4;
            const botY = h * 0.6;
            
            const realCostW = maxBarW * 0.8;
            
            // Progress from 0 to 1 with ease
            let prog = (t % 3.5) / 2.5; // cycles every 3.5 seconds, animation takes 2.5
            if (prog > 1) prog = 1;
            // EaseOut cubic
            const ease = 1 - Math.pow(1 - prog, 3);
            const estimatedW = realCostW * 0.9 * ease; // Parar exatamente antes
            
            // Top Bar: Custo Real h*(n)
            ctxA.fillStyle = "#334155";
            ctxA.fillRect(baseX, topY, realCostW, barH);
            
            ctxA.font = `500 ${16 * window.devicePixelRatio}px Outfit`;
            ctxA.textAlign = "left";
            ctxA.textBaseline = "bottom";
            ctxA.fillStyle = "#334155";
            ctxA.fillText("Custo Real h*(n)", baseX, topY - 10 * window.devicePixelRatio);
            
            // Bottom Bar: Heuristica h(n)
            ctxA.fillStyle = "#4f46e5";
            ctxA.fillRect(baseX, botY, estimatedW, barH);
            
            ctxA.fillStyle = "#4f46e5";
            ctxA.fillText("Heurística h(n)", baseX, botY - 10 * window.devicePixelRatio);

            // Checkmark Emerald when finished
            if (prog >= 1) {
                // fade in checkmark
                let alpha = (t % 3.5) - 2.5; 
                ctxA.globalAlpha = Math.max(0, Math.min(1, alpha * 2));
                
                const cx = baseX + estimatedW + 25 * window.devicePixelRatio;
                const cy = botY + barH/2;
                
                ctxA.beginPath(); ctxA.arc(cx, cy, 14*window.devicePixelRatio, 0, Math.PI*2);
                ctxA.fillStyle = "#10b981"; ctxA.fill();
                
                // Draw checkmark shape
                ctxA.beginPath();
                ctxA.moveTo(cx - 5*window.devicePixelRatio, cy);
                ctxA.lineTo(cx - 1*window.devicePixelRatio, cy + 5*window.devicePixelRatio);
                ctxA.lineTo(cx + 6*window.devicePixelRatio, cy - 4*window.devicePixelRatio);
                ctxA.strokeStyle = "#fff"; ctxA.lineWidth = 2.5*window.devicePixelRatio;
                ctxA.stroke();
                
                ctxA.globalAlpha = 1.0;
            }

            requestAnimationFrame(drawA);
        }
        setTimeout(drawA, 300);
    }

    // ==== Slide 4: Consistência ====
    const canvasC = document.getElementById('canvas-consistencia');
    if (canvasC) {
        const ctxC = canvasC.getContext('2d');
        let w, h, t = 0;
        function resizeC() {
            const rect = canvasC.parentElement.getBoundingClientRect();
            canvasC.width = rect.width * window.devicePixelRatio;
            canvasC.height = rect.height * window.devicePixelRatio;
            w = canvasC.width; h = canvasC.height;
        }
        window.addEventListener('resize', resizeC);
        setTimeout(resizeC, 100);

        function drawC() {
            if(!w) resizeC();
            ctxC.clearRect(0, 0, w, h);
            t += 0.01;
            
            const nX = w * 0.25, nY = h * 0.7; // Atual
            const npX = w * 0.5, npY = h * 0.25; // Vizinho
            const goalX = w * 0.75, goalY = h * 0.7; // Objetivo

            // Connections setup
            ctxC.lineWidth = 2 * window.devicePixelRatio;
            
            // n -> np -> goal (Solid subtle lines)
            ctxC.strokeStyle = "rgba(100, 116, 139, 0.3)"; // Slate fine
            ctxC.lineDashOffset = 0;
            ctxC.setLineDash([]);
            ctxC.beginPath(); ctxC.moveTo(nX, nY); ctxC.lineTo(npX, npY); ctxC.lineTo(goalX, goalY); ctxC.stroke();
            
            // n -> goal (Dotted indigo)
            ctxC.strokeStyle = "#4f46e5";
            ctxC.setLineDash([8 * window.devicePixelRatio, 8 * window.devicePixelRatio]);
            ctxC.lineDashOffset = -t * 20; 
            ctxC.beginPath(); ctxC.moveTo(nX, nY); ctxC.lineTo(goalX, goalY); ctxC.stroke();
            ctxC.setLineDash([]); // reset

            // Emerald Pulse
            const p = (t * 0.4) % 1; // slow constant movement
            const dist1 = Math.hypot(npX - nX, npY - nY);
            const dist2 = Math.hypot(goalX - npX, goalY - npY);
            const tDist = dist1 + dist2;
            const dp = p * tDist;
            
            let curPX, curPY;
            if (dp < dist1) {
                let pp = dp / dist1;
                curPX = nX + (npX - nX) * pp;
                curPY = nY + (npY - nY) * pp;
            } else {
                let pp = (dp - dist1) / dist2;
                curPX = npX + (goalX - npX) * pp;
                curPY = npY + (goalY - npY) * pp;
            }
            
            ctxC.beginPath(); ctxC.arc(curPX, curPY, 6 * window.devicePixelRatio, 0, Math.PI*2);
            ctxC.fillStyle = "#10b981"; ctxC.shadowColor = "#10b981"; ctxC.shadowBlur = 15;
            ctxC.fill(); ctxC.shadowBlur = 0;

            // Nodes
            const nodes = [
                [nX, nY, "Nó Atual"],
                [npX, npY, "Vizinho"],
                [goalX, goalY, "Objetivo"]
            ];
            
            nodes.forEach(nd => {
                ctxC.beginPath(); ctxC.arc(nd[0], nd[1], 10*window.devicePixelRatio, 0, Math.PI*2);
                ctxC.fillStyle = "#ffffff"; ctxC.fill();
                ctxC.lineWidth = 3*window.devicePixelRatio; ctxC.strokeStyle = "#64748b"; ctxC.stroke();
                
                ctxC.font = `600 ${16 * window.devicePixelRatio}px Outfit`;
                ctxC.fillStyle = "#334155";
                ctxC.textAlign = "center";
                ctxC.fillText(nd[2], nd[0], nd[1] + 30 * window.devicePixelRatio);
            });

            requestAnimationFrame(drawC);
        }
        setTimeout(drawC, 300);
    }

    // ==== Slide 5: Métricas de Distância ====
    const canvasM = document.getElementById('canvas-metricas');
    if (canvasM) {
        const ctxM = canvasM.getContext('2d');
        const btns = document.querySelectorAll('.metric-btn');
        let currentMetric = 'manhattan';
        let w, h, t=0;

        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                btns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentMetric = e.target.dataset.metric;
                t = 0; // reset animation
            });
        });

        function resizeM() {
            const rect = canvasM.parentElement.getBoundingClientRect();
            canvasM.width = rect.width * window.devicePixelRatio;
            canvasM.height = rect.height * window.devicePixelRatio;
            w = canvasM.width; h = canvasM.height;
        }
        window.addEventListener('resize', resizeM);
        setTimeout(resizeM, 100);

        function drawM() {
            if(!w) resizeM();
            ctxM.clearRect(0, 0, w, h);
            if(t < 1) t += 0.02;

            // Assimetria nas coordenadas garante que a métrica de Chebyshev forme uma "quina" visível,
            // não coincidindo acidentalmente com a linha reta perfeita do Euclidiano
            const startX = w * 0.15, startY = h * 0.85;
            const endX = w * 0.85, endY = h * 0.45;

            // Draw Grid
            ctxM.strokeStyle = "rgba(0,0,0,0.05)";
            ctxM.lineWidth = 1 * window.devicePixelRatio;
            const gs = w / 10;
            for(let i=0; i<w; i+=gs) { ctxM.beginPath(); ctxM.moveTo(i, 0); ctxM.lineTo(i, h); ctxM.stroke(); }
            for(let i=0; i<h; i+=gs) { ctxM.beginPath(); ctxM.moveTo(0, i); ctxM.lineTo(w, i); ctxM.stroke(); }

            // Draw path based on metric
            ctxM.strokeStyle = "#4f46e5";
            ctxM.lineWidth = 4 * window.devicePixelRatio;
            ctxM.shadowColor = "rgba(79, 70, 229, 0.4)";
            ctxM.shadowBlur = 10;
            ctxM.beginPath();
            ctxM.moveTo(startX, startY);

            if (currentMetric === 'manhattan') {
                const midX = startX;
                const midY = endY;
                ctxM.lineTo(startX, startY + (midY - startY) * Math.min(t*2, 1));
                if (t > 0.5) {
                    ctxM.lineTo(midX + (endX - midX) * Math.min((t-0.5)*2, 1), midY);
                }
                ctxM.stroke();
            } else if (currentMetric === 'euclidiana') {
                ctxM.lineTo(startX + (endX - startX) * t, startY + (endY - startY) * t);
                ctxM.stroke();
            } else if (currentMetric === 'chebyshev') {
                // Diagonal then straight
                const diffX = endX - startX;
                const diffY = endY - startY; // negative
                const minAbs = Math.min(Math.abs(diffX), Math.abs(diffY));
                
                const signX = Math.sign(diffX);
                const signY = Math.sign(diffY);
                
                const diagX = startX + minAbs * signX;
                const diagY = startY + minAbs * signY;
                
                ctxM.lineTo(startX + (diagX - startX) * Math.min(t*2, 1), startY + (diagY - startY) * Math.min(t*2, 1));
                if (t > 0.5) {
                    ctxM.lineTo(diagX + (endX - diagX) * Math.min((t-0.5)*2, 1), diagY + (endY - diagY) * Math.min((t-0.5)*2, 1));
                }
                ctxM.stroke();
            }
            ctxM.shadowBlur = 0;

            // Nodes
            ctxM.beginPath(); ctxM.arc(startX, startY, 10*window.devicePixelRatio, 0, Math.PI*2);
            ctxM.fillStyle = "#818cf8"; ctxM.fill();
            ctxM.beginPath(); ctxM.arc(endX, endY, 10*window.devicePixelRatio, 0, Math.PI*2);
            ctxM.fillStyle = "#10b981"; ctxM.fill();

            requestAnimationFrame(drawM);
        }
        setTimeout(drawM, 300);
    }

    // ==== Slide 6: Algoritmos e Dinamismo ====
    const canvasD = document.getElementById('canvas-algoritmos');
    if (canvasD) {
        const ctxD = canvasD.getContext('2d');
        let w, h;
        let obstacles = [];
        let agentX = 0.1, agentY = 0.5; // normalized 0 to 1
        const goalNX = 0.9, goalNY = 0.5;

        function resizeD() {
            const rect = canvasD.parentElement.getBoundingClientRect();
            canvasD.width = rect.width * window.devicePixelRatio;
            canvasD.height = rect.height * window.devicePixelRatio;
            w = canvasD.width; h = canvasD.height;
        }
        window.addEventListener('resize', resizeD);
        setTimeout(resizeD, 100);

        canvasD.addEventListener('click', (e) => {
            const rect = canvasD.getBoundingClientRect();
            let rawX = e.clientX - rect.left;
            let rawY = e.clientY - rect.top;
            obstacles.push({nx: rawX/rect.width, ny: rawY/rect.height, r: 0.05});
        });

        function drawD() {
            if(!w) resizeD();
            ctxD.clearRect(0, 0, w, h);

            // Logic to move agent towards goal avoiding obstacles
            let dx = goalNX - agentX;
            let dy = goalNY - agentY;
            let dist = Math.hypot(dx, dy);
            
            // repulsive forces from obstacles
            let repX = 0, repY = 0;
            obstacles.forEach(obs => {
                let ox = agentX - obs.nx;
                let oy = agentY - obs.ny;
                let odist = Math.hypot(ox, oy);
                if(odist < obs.r * 2) {
                    repX += (ox / odist) * 0.01;
                    repY += (oy / odist) * 0.01;
                }
            });

            if (dist > 0.02) {
                // Combine attractive and repulsive
                let dirX = (dx / dist) * 0.003 + repX;
                let dirY = (dy / dist) * 0.003 + repY;
                
                // normalize again if too fast
                let spd = Math.hypot(dirX, dirY);
                if (spd > 0.01) { dirX = (dirX/spd)*0.005; dirY = (dirY/spd)*0.005; }

                agentX += dirX;
                agentY += dirY;
            } else {
                // Reset to repeat
                agentX = 0.1; agentY = 0.5;
                obstacles = []; // reset obs for loop
            }

            // Draw obstacles
            ctxD.fillStyle = "#94a3b8"; // grey
            obstacles.forEach(obs => {
                ctxD.beginPath();
                ctxD.arc(obs.nx * w, obs.ny * h, obs.r * Math.min(w,h), 0, Math.PI*2);
                ctxD.fill();
            });

            // Draw goal
            ctxD.beginPath();
            ctxD.arc(goalNX * w, goalNY * h, 15*window.devicePixelRatio, 0, Math.PI*2);
            ctxD.fillStyle = "#4f46e5"; ctxD.fill();

            // Draw Agent
            ctxD.beginPath();
            ctxD.arc(agentX * w, agentY * h, 12*window.devicePixelRatio, 0, Math.PI*2);
            ctxD.fillStyle = "#10b981"; // green
            ctxD.fill();

            requestAnimationFrame(drawD);
        }
        setTimeout(drawD, 300);
    }
    const priorityCanvas = document.getElementById('priority-queue-canvas');
    if (priorityCanvas) {
        const ctx = priorityCanvas.getContext('2d');
        let width = 0;
        let height = 0;
        let time = 0;

        const queueItems = [
            { vertex: 'B', lambda: '3', active: true },
            { vertex: 'D', lambda: '5', active: false },
            { vertex: 'E', lambda: '7', active: false },
            { vertex: 'F', lambda: '9', active: false }
        ];

        function resizePriorityCanvas() {
            const rect = priorityCanvas.parentElement.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;

            priorityCanvas.width = rect.width * ratio;
            priorityCanvas.height = rect.height * ratio;

            width = rect.width;
            height = rect.height;

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function roundedRect(x, y, w, h, r) {
            const radius = Math.min(r, w / 2, h / 2);
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }

        function drawLabel(text, x, y, options = {}) {
            const {
                font = '600 14px Outfit',
                color = '#4f46e5',
                align = 'left',
                baseline = 'middle'
            } = options;

            ctx.font = font;
            ctx.fillStyle = color;
            ctx.textAlign = align;
            ctx.textBaseline = baseline;
            ctx.fillText(text, x, y);
        }

        function drawCard(x, y, w, h, item, pulse) {
            const glow = item.active ? 18 + pulse * 12 : 0;
            const fill = item.active ? 'rgba(79, 70, 229, 0.14)' : 'rgba(255, 255, 255, 0.92)';
            const border = item.active ? '#4f46e5' : 'rgba(148, 163, 184, 0.4)';

            ctx.save();
            ctx.shadowColor = item.active ? 'rgba(79, 70, 229, 0.18)' : 'transparent';
            ctx.shadowBlur = glow;
            roundedRect(x, y, w, h, 20);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.restore();

            roundedRect(x, y, w, h, 20);
            ctx.lineWidth = item.active ? 2.5 : 1.5;
            ctx.strokeStyle = border;
            ctx.stroke();

            roundedRect(x + 16, y + 16, 56, h - 32, 14);
            ctx.fillStyle = item.active ? '#4f46e5' : 'rgba(79, 70, 229, 0.08)';
            ctx.fill();

            drawLabel(item.vertex, x + 44, y + h / 2, {
                font: '700 22px Outfit',
                color: item.active ? '#ffffff' : '#4f46e5',
                align: 'center'
            });

            drawLabel('λ(v)', x + 96, y + 26, {
                font: '600 12px Outfit',
                color: '#64748b'
            });

            drawLabel(item.lambda, x + 96, y + h / 2 + 8, {
                font: '700 28px Outfit',
                color: '#0f172a'
            });

            if (item.active) {
                roundedRect(x + w - 128, y + 18, 104, 28, 14);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
                ctx.fill();
                drawLabel('menor custo', x + w - 76, y + 32, {
                    font: '700 11px Outfit',
                    color: '#059669',
                    align: 'center'
                });
            }
        }

        function animatePriorityQueue() {
            if (!width || !height) resizePriorityCanvas();
            ctx.clearRect(0, 0, width, height);

            time += 0.018;
            const pulse = (Math.sin(time) + 1) / 2;
            const floatOffset = Math.sin(time * 0.6) * 4;

            const queuePanel = {
                x: width * 0.43,
                y: height * 0.16,
                w: width * 0.47,
                h: height * 0.68
            };

            const extractPanel = {
                x: width * 0.08,
                y: height * 0.28,
                w: width * 0.24,
                h: height * 0.28
            };

            const topCardY = queuePanel.y + 54 + floatOffset;
            const cardHeight = 78;
            const gap = 18;

            ctx.save();
            const bgGradient = ctx.createLinearGradient(0, 0, width, height);
            bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
            bgGradient.addColorStop(1, 'rgba(238, 244, 255, 0.95)');
            roundedRect(18, 18, width - 36, height - 36, 24);
            ctx.fillStyle = bgGradient;
            ctx.fill();
            ctx.restore();

            roundedRect(queuePanel.x, queuePanel.y, queuePanel.w, queuePanel.h, 28);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
            ctx.stroke();

            roundedRect(extractPanel.x, extractPanel.y, extractPanel.w, extractPanel.h, 24);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
            ctx.stroke();

            roundedRect(queuePanel.x + 22, queuePanel.y + 18, 104, 28, 14);
            ctx.fillStyle = 'rgba(79, 70, 229, 0.1)';
            ctx.fill();
            drawLabel('Fila Q', queuePanel.x + 74, queuePanel.y + 32, {
                font: '700 12px Outfit',
                color: '#4f46e5',
                align: 'center'
            });

            drawLabel('ordenada por menor λ(v)', queuePanel.x + queuePanel.w - 28, queuePanel.y + 32, {
                font: '600 13px Outfit',
                color: '#64748b',
                align: 'right'
            });

            drawLabel('1º extraído', extractPanel.x + extractPanel.w / 2, extractPanel.y - 24, {
                font: '700 13px Outfit',
                color: '#059669',
                align: 'center'
            });

            queueItems.forEach((item, index) => {
                const x = queuePanel.x + 22 - (item.active ? 18 + pulse * 8 : 0);
                const y = topCardY + index * (cardHeight + gap);
                const w = queuePanel.w - 44 + (item.active ? 18 : 0);

                drawCard(x, y, w, cardHeight, item, pulse);

                drawLabel(`${index + 1}`, queuePanel.x + queuePanel.w - 18, y + cardHeight / 2, {
                    font: '700 13px Outfit',
                    color: '#94a3b8',
                    align: 'right'
                });
            });

            roundedRect(extractPanel.x + 16, extractPanel.y + 18, extractPanel.w - 32, extractPanel.h - 36, 20);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
            ctx.fill();

            ctx.save();
            ctx.shadowColor = 'rgba(16, 185, 129, 0.22)';
            ctx.shadowBlur = 22 + pulse * 12;
            roundedRect(extractPanel.x + 32, extractPanel.y + 42, extractPanel.w - 64, 94, 22);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
            ctx.fill();
            ctx.restore();

            roundedRect(extractPanel.x + 32, extractPanel.y + 42, extractPanel.w - 64, 94, 22);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#10b981';
            ctx.stroke();

            roundedRect(extractPanel.x + 48, extractPanel.y + 58, 60, 62, 16);
            ctx.fillStyle = '#10b981';
            ctx.fill();

            drawLabel(queueItems[0].vertex, extractPanel.x + 78, extractPanel.y + 90, {
                font: '700 26px Outfit',
                color: '#ffffff',
                align: 'center'
            });

            drawLabel('u', extractPanel.x + extractPanel.w - 86, extractPanel.y + 72, {
                font: '700 13px Outfit',
                color: '#059669'
            });

            drawLabel(`λ(v) = ${queueItems[0].lambda}`, extractPanel.x + extractPanel.w - 86, extractPanel.y + 102, {
                font: '700 24px Outfit',
                color: '#0f172a'
            });

            drawLabel('ExtractMin(Q)', width * 0.34, queuePanel.y + 56, {
                font: '700 13px Outfit',
                color: '#4f46e5',
                align: 'center'
            });

            const arrowStartX = extractPanel.x + extractPanel.w + 18;
            const arrowStartY = extractPanel.y + extractPanel.h / 2;
            const arrowEndX = queuePanel.x - 16;
            const arrowEndY = topCardY + cardHeight / 2;

            ctx.beginPath();
            ctx.moveTo(arrowStartX, arrowStartY);
            ctx.bezierCurveTo(
                width * 0.35,
                arrowStartY - 34,
                width * 0.38,
                arrowEndY - 14,
                arrowEndX,
                arrowEndY
            );
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
            ctx.stroke();

            const travel = pulse;
            const pointX = arrowStartX + (arrowEndX - arrowStartX) * travel;
            const pointY = arrowStartY + (arrowEndY - arrowStartY) * travel;
            ctx.beginPath();
            ctx.arc(pointX, pointY, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(arrowEndX, arrowEndY);
            ctx.lineTo(arrowEndX - 12, arrowEndY - 8);
            ctx.moveTo(arrowEndX, arrowEndY);
            ctx.lineTo(arrowEndX - 12, arrowEndY + 8);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.5)';
            ctx.stroke();

            drawLabel('frente da fila', queuePanel.x + 48, topCardY - 18, {
                font: '600 12px Outfit',
                color: '#64748b'
            });

            requestAnimationFrame(animatePriorityQueue);
        }

        window.addEventListener('resize', resizePriorityCanvas);

        setTimeout(() => {
            resizePriorityCanvas();
            animatePriorityQueue();
        }, 300);
    }
});
