document.addEventListener('DOMContentLoaded', () => {
    const slidePages = [
        "slide_busca_comparacao.html",
        "slide_grafo.html",
        "slide_caminho_grafos.html",
        "slide_representacao_computacional.html",
        "slide_konigsberg.html",
        "slide_grafos_ponderados.html",
        "slide_dijkstra1.html",
        "slide_dijkstra2.html",
        "slide_astar1.html",
        "slide_astar2.html",
        "slide_heuristica.html",
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
            navigateToRelativeSlide(1);
        } else if (e.key === 'ArrowLeft') {
            navigateToRelativeSlide(-1);
        }
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
            t += 0.012;

            const dpr = window.devicePixelRatio;
            const cycle = 9;
            const progress = (t % cycle) / cycle;
            const softPulse = 0.7 + 0.3 * Math.sin(t * 3.4);
            const nodes = [
                { id: "s", label: "S", x: 0.18, y: 0.52, source: true, reveal: 0 },
                { id: "a", label: "A", x: 0.34, y: 0.24, reveal: 0.08 },
                { id: "b", label: "B", x: 0.38, y: 0.72, reveal: 0.2 },
                { id: "c", label: "C", x: 0.54, y: 0.16, reveal: 0.34 },
                { id: "d", label: "D", x: 0.58, y: 0.5, reveal: 0.48 },
                { id: "e", label: "E", x: 0.56, y: 0.84, reveal: 0.6 },
                { id: "f", label: "F", x: 0.77, y: 0.3, reveal: 0.72 },
                { id: "g", label: "G", x: 0.8, y: 0.66, reveal: 0.84 }
            ].map(node => ({
                ...node,
                px: node.x * w,
                py: node.y * h
            }));

            const nodeMap = Object.fromEntries(nodes.map(node => [node.id, node]));
            const edges = [
                { from: "s", to: "a", weight: 4, tree: true, reveal: 0.08 },
                { from: "s", to: "b", weight: 2, tree: true, reveal: 0.2 },
                { from: "a", to: "c", weight: 3, tree: true, reveal: 0.34 },
                { from: "a", to: "d", weight: 6, tree: false, reveal: 0.34 },
                { from: "b", to: "d", weight: 4, tree: true, reveal: 0.48 },
                { from: "b", to: "e", weight: 7, tree: true, reveal: 0.6 },
                { from: "c", to: "f", weight: 5, tree: true, reveal: 0.72 },
                { from: "d", to: "f", weight: 2, tree: false, reveal: 0.72 },
                { from: "d", to: "g", weight: 4, tree: true, reveal: 0.84 },
                { from: "e", to: "g", weight: 3, tree: false, reveal: 0.9 },
                { from: "f", to: "g", weight: 1, tree: false, reveal: 0.94 }
            ];

            ctxA.save();
            ctxA.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctxA.fillRect(0, 0, w, h);
            ctxA.restore();

            edges.forEach(edge => {
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                const active = progress >= edge.reveal;

                ctxA.beginPath();
                ctxA.moveTo(from.px, from.py);
                ctxA.lineTo(to.px, to.py);

                if (active && edge.tree) {
                    ctxA.strokeStyle = "#10b981";
                    ctxA.lineWidth = 3 * dpr;
                    ctxA.shadowColor = `rgba(79, 70, 229, ${0.16 * softPulse})`;
                    ctxA.shadowBlur = 20 * dpr;
                } else {
                    ctxA.strokeStyle = active ? "rgba(16, 185, 129, 0.25)" : "rgba(100, 116, 139, 0.28)";
                    ctxA.lineWidth = 1.6 * dpr;
                    ctxA.shadowBlur = 0;
                }
                ctxA.stroke();
                ctxA.shadowBlur = 0;

                const mx = (from.px + to.px) / 2;
                const my = (from.py + to.py) / 2;
                const dx = to.px - from.px;
                const dy = to.py - from.py;
                const len = Math.hypot(dx, dy) || 1;
                const ox = (-dy / len) * 16 * dpr;
                const oy = (dx / len) * 16 * dpr;

                ctxA.fillStyle = "rgba(100, 116, 139, 0.95)";
                ctxA.font = `600 ${13 * dpr}px Outfit`;
                ctxA.textAlign = "center";
                ctxA.textBaseline = "middle";
                ctxA.fillText(String(edge.weight), mx + ox, my + oy);
            });

            nodes.forEach(node => {
                const active = progress >= node.reveal;
                const radius = (node.source ? 18 : 15) * dpr;

                if (node.source) {
                    ctxA.beginPath();
                    ctxA.arc(node.px, node.py, radius + 10 * dpr, 0, Math.PI * 2);
                    ctxA.fillStyle = "rgba(79, 70, 229, 0.12)";
                    ctxA.fill();
                }

                if (active && !node.source) {
                    ctxA.beginPath();
                    ctxA.arc(node.px, node.py, radius + 8 * dpr, 0, Math.PI * 2);
                    ctxA.fillStyle = `rgba(16, 185, 129, ${0.11 * softPulse})`;
                    ctxA.fill();
                }

                ctxA.beginPath();
                ctxA.arc(node.px, node.py, radius, 0, Math.PI * 2);
                ctxA.fillStyle = node.source ? "#4f46e5" : active ? "#10b981" : "#ffffff";
                ctxA.fill();
                ctxA.lineWidth = 2.5 * dpr;
                ctxA.strokeStyle = active && !node.source ? "#10b981" : node.source ? "#4f46e5" : "#94a3b8";
                ctxA.stroke();

                ctxA.fillStyle = node.source || active ? "#ffffff" : "#334155";
                ctxA.font = `700 ${14 * dpr}px Outfit`;
                ctxA.textAlign = "center";
                ctxA.textBaseline = "middle";
                ctxA.fillText(node.label, node.px, node.py + 1 * dpr);
            });

            ctxA.fillStyle = "#64748b";
            ctxA.font = `600 ${12 * dpr}px Outfit`;
            ctxA.textAlign = "left";
            ctxA.fillText("Descoberta radial com arestas ponderadas", 28 * dpr, 30 * dpr);

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
        let w, h, t = 0;

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
            t += 0.012;

            const dpr = window.devicePixelRatio;
            const cols = 10;
            const rows = 10;
            const inset = 26 * dpr;
            const cellW = (w - inset * 2) / cols;
            const cellH = (h - inset * 2) / rows;
            const pulse = 0.6 + 0.4 * Math.sin(t * 2.5);
            const reveal = 0.5 + 0.5 * Math.sin(t * 0.85);
            const startCell = { col: 1, row: 7 };
            const goalCell = { col: 8, row: 2 };
            const sampleCell = { col: 4, row: 5 };

            function cellCenter(cell) {
                return {
                    x: inset + (cell.col + 0.5) * cellW,
                    y: inset + (cell.row + 0.5) * cellH
                };
            }

            const start = cellCenter(startCell);
            const goal = cellCenter(goalCell);
            const sample = cellCenter(sampleCell);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = inset + col * cellW;
                    const y = inset + row * cellH;
                    ctxM.fillStyle = (row + col) % 2 === 0 ? "rgba(240, 244, 248, 0.92)" : "rgba(248, 250, 252, 0.98)";
                    ctxM.strokeStyle = "rgba(148, 163, 184, 0.18)";
                    ctxM.lineWidth = 1 * dpr;
                    ctxM.beginPath();
                    ctxM.roundRect(x, y, cellW - 2 * dpr, cellH - 2 * dpr, 8 * dpr);
                    ctxM.fill();
                    ctxM.stroke();
                }
            }

            ctxM.save();
            ctxM.setLineDash([8 * dpr, 8 * dpr]);
            ctxM.lineDashOffset = -t * 28;
            ctxM.strokeStyle = "#4f46e5";
            ctxM.lineWidth = 2.6 * dpr;
            ctxM.shadowColor = "rgba(79, 70, 229, 0.2)";
            ctxM.shadowBlur = 16 * dpr;
            ctxM.beginPath();
            ctxM.moveTo(start.x, start.y);
            ctxM.lineTo(start.x + (goal.x - start.x) * reveal, start.y + (goal.y - start.y) * reveal);
            ctxM.stroke();
            ctxM.restore();

            const labels = [
                { point: start, title: "Início", value: "γ(s) ≈ 8.6", kind: "start" },
                { point: sample, title: "v", value: "γ(v) ≈ 4.5", kind: "mid" },
                { point: goal, title: "Alvo", value: "γ(t) = 0", kind: "goal" }
            ];

            labels.forEach((item, index) => {
                const isGoal = item.kind === "goal";
                const isStart = item.kind === "start";
                const radius = 11 * dpr;

                ctxM.beginPath();
                ctxM.arc(item.point.x, item.point.y, radius + 8 * dpr, 0, Math.PI * 2);
                ctxM.fillStyle = isGoal ? `rgba(16, 185, 129, ${0.12 * pulse})` : isStart ? "rgba(79, 70, 229, 0.12)" : "rgba(79, 70, 229, 0.08)";
                ctxM.fill();

                ctxM.beginPath();
                ctxM.arc(item.point.x, item.point.y, radius, 0, Math.PI * 2);
                ctxM.fillStyle = isGoal ? "#10b981" : isStart ? "#4f46e5" : "#ffffff";
                ctxM.fill();
                ctxM.lineWidth = 2.5 * dpr;
                ctxM.strokeStyle = isGoal ? "#10b981" : "#4f46e5";
                ctxM.stroke();

                ctxM.fillStyle = isGoal || isStart ? "#ffffff" : "#4f46e5";
                ctxM.font = `700 ${12 * dpr}px Outfit`;
                ctxM.textAlign = "center";
                ctxM.textBaseline = "middle";
                ctxM.fillText(isStart ? "S" : isGoal ? "T" : "v", item.point.x, item.point.y + 1 * dpr);

                const boxW = 112 * dpr;
                const boxH = 42 * dpr;
                const offsetX = index === 1 ? 16 * dpr : (index === 0 ? -20 * dpr : 18 * dpr);
                const offsetY = index === 2 ? -52 * dpr : -44 * dpr;
                const bx = item.point.x + offsetX;
                const by = item.point.y + offsetY;

                ctxM.fillStyle = "rgba(255, 255, 255, 0.88)";
                ctxM.strokeStyle = "rgba(79, 70, 229, 0.14)";
                ctxM.lineWidth = 1.2 * dpr;
                ctxM.beginPath();
                ctxM.roundRect(bx, by, boxW, boxH, 12 * dpr);
                ctxM.fill();
                ctxM.stroke();

                ctxM.fillStyle = "#334155";
                ctxM.textAlign = "left";
                ctxM.textBaseline = "top";
                ctxM.font = `600 ${11 * dpr}px Outfit`;
                ctxM.fillText(item.title, bx + 10 * dpr, by + 8 * dpr);
                ctxM.fillStyle = "#4f46e5";
                ctxM.font = `700 ${12 * dpr}px Outfit`;
                ctxM.fillText(item.value, bx + 10 * dpr, by + 22 * dpr);
            });

            ctxM.fillStyle = "#64748b";
            ctxM.font = `600 ${12 * dpr}px Outfit`;
            ctxM.textAlign = "left";
            ctxM.textBaseline = "middle";
            ctxM.fillText("Distância Euclidiana em linha reta", inset, 14 * dpr);

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

    const directionCanvas = document.getElementById('search-direction-canvas');
    if (directionCanvas) {
        const ctxDir = directionCanvas.getContext('2d');
        let width = 0;
        let height = 0;

        const dijkstraParticles = Array.from({ length: 56 }, (_, index) => ({
            angle: (Math.PI * 2 * index) / 56,
            radiusOffset: (index % 7) * 10 + 8,
            speed: 0.22 + (index % 5) * 0.03
        }));

        const astarParticles = Array.from({ length: 44 }, (_, index) => ({
            tOffset: (index % 11) / 11,
            lane: ((index % 5) - 2) / 2,
            speed: 0.0035 + (index % 6) * 0.00045
        }));

        function resizeDirectionCanvas() {
            const rect = directionCanvas.parentElement.getBoundingClientRect();
            directionCanvas.width = rect.width * window.devicePixelRatio;
            directionCanvas.height = rect.height * window.devicePixelRatio;
            width = directionCanvas.width;
            height = directionCanvas.height;
        }

        function drawRingLabel(text, x, y, color) {
            ctxDir.font = `${14 * window.devicePixelRatio}px Outfit`;
            ctxDir.textAlign = 'center';
            ctxDir.fillStyle = color;
            ctxDir.fillText(text, x, y);
        }

        function drawDirectionScene() {
            if (!width || !height) resizeDirectionCanvas();

            const t = performance.now() * 0.001;
            const dpr = window.devicePixelRatio;
            ctxDir.clearRect(0, 0, width, height);

            const midX = width / 2;
            ctxDir.fillStyle = '#f8fafc';
            ctxDir.fillRect(0, 0, width, height);

            ctxDir.fillStyle = 'rgba(79, 70, 229, 0.04)';
            ctxDir.fillRect(0, 0, midX, height);
            ctxDir.fillStyle = 'rgba(16, 185, 129, 0.035)';
            ctxDir.fillRect(midX, 0, midX, height);

            ctxDir.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctxDir.lineWidth = 1.5 * dpr;
            ctxDir.beginPath();
            ctxDir.moveTo(midX, 24 * dpr);
            ctxDir.lineTo(midX, height - 24 * dpr);
            ctxDir.stroke();

            const leftCenter = { x: width * 0.24, y: height * 0.56 };
            const rightStart = { x: width * 0.64, y: height * 0.56 };
            const rightTarget = { x: width * 0.89, y: height * 0.42 };

            ctxDir.font = `700 ${22 * dpr}px Outfit`;
            ctxDir.textAlign = 'center';
            ctxDir.fillStyle = '#312e81';
            ctxDir.fillText('Busca \u00e0s Cegas', width * 0.25, height * 0.12);
            ctxDir.fillStyle = '#065f46';
            ctxDir.fillText('Busca Guiada', width * 0.75, height * 0.12);

            for (let ring = 0; ring < 4; ring++) {
                const baseRadius = (46 + ring * 28) * dpr;
                const radius = baseRadius + Math.sin(t * 2.1 - ring * 0.6) * 8 * dpr;
                ctxDir.beginPath();
                ctxDir.arc(leftCenter.x, leftCenter.y, radius, 0, Math.PI * 2);
                ctxDir.lineWidth = (2.5 - ring * 0.35) * dpr;
                ctxDir.strokeStyle = `rgba(79, 70, 229, ${0.38 - ring * 0.07})`;
                ctxDir.stroke();
            }

            dijkstraParticles.forEach((particle, index) => {
                const radius = ((t * 38 * particle.speed + particle.radiusOffset) % 126) * dpr;
                const x = leftCenter.x + Math.cos(particle.angle + t * 0.18) * radius;
                const y = leftCenter.y + Math.sin(particle.angle + t * 0.18) * radius;
                ctxDir.beginPath();
                ctxDir.arc(x, y, (3 + (index % 3)) * dpr, 0, Math.PI * 2);
                ctxDir.fillStyle = index % 2 === 0 ? 'rgba(79, 70, 229, 0.75)' : 'rgba(16, 185, 129, 0.72)';
                ctxDir.fill();
            });

            ctxDir.save();
            ctxDir.translate(rightStart.x, rightStart.y);
            const beamAngle = Math.atan2(rightTarget.y - rightStart.y, rightTarget.x - rightStart.x);
            ctxDir.rotate(beamAngle);
            ctxDir.beginPath();
            ctxDir.moveTo(0, 0);
            ctxDir.lineTo((rightTarget.x - rightStart.x) * 0.98, -62 * dpr);
            ctxDir.lineTo((rightTarget.x - rightStart.x) * 1.05, 0);
            ctxDir.lineTo((rightTarget.x - rightStart.x) * 0.98, 62 * dpr);
            ctxDir.closePath();
            const beamGradient = ctxDir.createLinearGradient(0, 0, rightTarget.x - rightStart.x, 0);
            beamGradient.addColorStop(0, 'rgba(79, 70, 229, 0.30)');
            beamGradient.addColorStop(0.55, 'rgba(16, 185, 129, 0.24)');
            beamGradient.addColorStop(1, 'rgba(16, 185, 129, 0.08)');
            ctxDir.fillStyle = beamGradient;
            ctxDir.fill();
            ctxDir.restore();

            ctxDir.beginPath();
            ctxDir.moveTo(rightStart.x, rightStart.y);
            ctxDir.lineTo(rightTarget.x, rightTarget.y);
            ctxDir.lineWidth = 5 * dpr;
            ctxDir.strokeStyle = 'rgba(16, 185, 129, 0.38)';
            ctxDir.stroke();

            astarParticles.forEach((particle, index) => {
                const travel = (t * particle.speed * 100 + particle.tOffset) % 1;
                const spread = (1 - travel) * 54 * dpr;
                const perpAngle = Math.atan2(rightTarget.y - rightStart.y, rightTarget.x - rightStart.x) + Math.PI / 2;
                const baseX = rightStart.x + (rightTarget.x - rightStart.x) * travel;
                const baseY = rightStart.y + (rightTarget.y - rightStart.y) * travel;
                const x = baseX + Math.cos(perpAngle) * particle.lane * spread;
                const y = baseY + Math.sin(perpAngle) * particle.lane * spread;
                ctxDir.beginPath();
                ctxDir.arc(x, y, (3.4 + (index % 2)) * dpr, 0, Math.PI * 2);
                ctxDir.fillStyle = index % 3 === 0 ? 'rgba(79, 70, 229, 0.78)' : 'rgba(16, 185, 129, 0.85)';
                ctxDir.fill();
            });

            ctxDir.beginPath();
            ctxDir.arc(leftCenter.x, leftCenter.y, 11 * dpr, 0, Math.PI * 2);
            ctxDir.fillStyle = '#312e81';
            ctxDir.fill();
            ctxDir.beginPath();
            ctxDir.arc(rightStart.x, rightStart.y, 11 * dpr, 0, Math.PI * 2);
            ctxDir.fillStyle = '#312e81';
            ctxDir.fill();

            ctxDir.beginPath();
            ctxDir.arc(rightTarget.x, rightTarget.y, 15 * dpr, 0, Math.PI * 2);
            ctxDir.fillStyle = '#10b981';
            ctxDir.fill();
            ctxDir.lineWidth = 4 * dpr;
            ctxDir.strokeStyle = 'rgba(255, 255, 255, 0.92)';
            ctxDir.stroke();

            drawRingLabel('Origem', leftCenter.x, leftCenter.y + 36 * dpr, 'rgba(49, 46, 129, 0.88)');
            drawRingLabel('Origem', rightStart.x, rightStart.y + 36 * dpr, 'rgba(49, 46, 129, 0.88)');
            drawRingLabel('Alvo', rightTarget.x, rightTarget.y - 26 * dpr, 'rgba(6, 95, 70, 0.88)');

            requestAnimationFrame(drawDirectionScene);
        }

        window.addEventListener('resize', resizeDirectionCanvas);
        setTimeout(() => {
            resizeDirectionCanvas();
            drawDirectionScene();
        }, 300);
    }

    const denseDijkstraCanvas = document.getElementById('canvas-redes-densas-dijkstra');
    const denseAstarCanvas = document.getElementById('canvas-redes-densas-astar');
    const denseDijkstraCount = document.getElementById('dense-dijkstra-count');
    const denseAstarCount = document.getElementById('dense-astar-count');

    if (denseDijkstraCanvas && denseAstarCanvas && denseDijkstraCount && denseAstarCount) {
        const ctxDenseD = denseDijkstraCanvas.getContext('2d');
        const ctxDenseA = denseAstarCanvas.getContext('2d');
        let width = 0;
        let height = 0;

        const baseNodes = [
            { x: 0.08, y: 0.52 }, { x: 0.16, y: 0.22 }, { x: 0.18, y: 0.46 }, { x: 0.2, y: 0.76 },
            { x: 0.3, y: 0.16 }, { x: 0.32, y: 0.36 }, { x: 0.34, y: 0.58 }, { x: 0.36, y: 0.82 },
            { x: 0.46, y: 0.12 }, { x: 0.48, y: 0.3 }, { x: 0.5, y: 0.5 }, { x: 0.52, y: 0.72 },
            { x: 0.62, y: 0.18 }, { x: 0.64, y: 0.42 }, { x: 0.66, y: 0.62 }, { x: 0.68, y: 0.82 },
            { x: 0.78, y: 0.24 }, { x: 0.8, y: 0.48 }, { x: 0.82, y: 0.68 }, { x: 0.92, y: 0.5 }
        ];

        const edges = [];
        for (let i = 0; i < baseNodes.length; i++) {
            for (let j = i + 1; j < baseNodes.length; j++) {
                const dx = baseNodes[i].x - baseNodes[j].x;
                const dy = baseNodes[i].y - baseNodes[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist < 0.34 || (Math.abs(i - j) <= 3 && dist < 0.46)) {
                    edges.push([i, j]);
                }
            }
        }

        const sourceIndex = 0;
        const targetIndex = baseNodes.length - 1;
        const astarBand = new Set(baseNodes
            .map((node, index) => ({ index, delta: Math.abs(node.y - (0.52 - 0.02 * node.x)) }))
            .filter(item => item.delta < 0.16 || item.index === sourceIndex || item.index === targetIndex)
            .map(item => item.index));

        const dijkstraOrder = baseNodes
            .map((node, index) => ({ index, score: Math.hypot(node.x - 0.22, node.y - 0.5) }))
            .sort((a, b) => a.score - b.score)
            .map(item => item.index);

        const astarOrder = baseNodes
            .map((node, index) => ({
                index,
                score: Math.abs(node.y - (0.52 - 0.02 * node.x)) * 2 + node.x
            }))
            .filter(item => astarBand.has(item.index))
            .sort((a, b) => a.score - b.score)
            .map(item => item.index);

        function resizeDenseCanvas() {
            [denseDijkstraCanvas, denseAstarCanvas].forEach((canvas) => {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * window.devicePixelRatio;
                canvas.height = rect.height * window.devicePixelRatio;
            });
            width = denseDijkstraCanvas.width;
            height = denseDijkstraCanvas.height;
        }

        function actualNodes(time) {
            return baseNodes.map((node, index) => ({
                x: node.x * width + Math.sin(time * 0.9 + index * 0.7) * 4 * window.devicePixelRatio,
                y: node.y * height + Math.cos(time * 0.75 + index * 0.5) * 4 * window.devicePixelRatio
            }));
        }

        function drawDenseGraph(ctx, positions, progress, mode) {
            const dpr = window.devicePixelRatio;
            ctx.clearRect(0, 0, width, height);

            const isDijkstra = mode === 'dijkstra';
            const order = isDijkstra ? dijkstraOrder : astarOrder;
            const activeCount = Math.max(1, Math.floor(order.length * progress));
            const activeSet = new Set(order.slice(0, activeCount));

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (!isDijkstra) {
                ctx.beginPath();
                const start = positions[sourceIndex];
                const end = positions[targetIndex];
                const bandWidth = 36 * dpr;
                const angle = Math.atan2(end.y - start.y, end.x - start.x) + Math.PI / 2;
                ctx.moveTo(start.x + Math.cos(angle) * bandWidth, start.y + Math.sin(angle) * bandWidth);
                ctx.lineTo(end.x + Math.cos(angle) * bandWidth * 0.45, end.y + Math.sin(angle) * bandWidth * 0.45);
                ctx.lineTo(end.x - Math.cos(angle) * bandWidth * 0.45, end.y - Math.sin(angle) * bandWidth * 0.45);
                ctx.lineTo(start.x - Math.cos(angle) * bandWidth, start.y - Math.sin(angle) * bandWidth);
                ctx.closePath();
                const corridor = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                corridor.addColorStop(0, 'rgba(79, 70, 229, 0.10)');
                corridor.addColorStop(1, 'rgba(16, 185, 129, 0.16)');
                ctx.fillStyle = corridor;
                ctx.fill();
            }

            edges.forEach(([a, b]) => {
                const firstActive = activeSet.has(a);
                const secondActive = activeSet.has(b);
                ctx.beginPath();
                ctx.moveTo(positions[a].x, positions[a].y);
                ctx.lineTo(positions[b].x, positions[b].y);
                ctx.lineWidth = (firstActive && secondActive ? 2.8 : 1.2) * dpr;
                ctx.strokeStyle = isDijkstra
                    ? (firstActive || secondActive ? 'rgba(148, 163, 184, 0.34)' : 'rgba(148, 163, 184, 0.12)')
                    : ((firstActive && secondActive) ? 'rgba(16, 185, 129, 0.38)' : 'rgba(148, 163, 184, 0.08)');
                ctx.stroke();
            });

            positions.forEach((position, index) => {
                const active = activeSet.has(index);
                const inBand = astarBand.has(index);
                ctx.beginPath();
                ctx.arc(position.x, position.y, (index === sourceIndex || index === targetIndex ? 8.2 : 6.2) * dpr, 0, Math.PI * 2);

                if (index === sourceIndex) {
                    ctx.fillStyle = '#312e81';
                } else if (index === targetIndex) {
                    ctx.fillStyle = '#10b981';
                } else if (isDijkstra) {
                    ctx.fillStyle = active ? 'rgba(156, 163, 175, 0.9)' : 'rgba(99, 102, 241, 0.72)';
                } else {
                    ctx.fillStyle = active ? 'rgba(16, 185, 129, 0.9)' : (inBand ? 'rgba(79, 70, 229, 0.68)' : 'rgba(203, 213, 225, 0.38)');
                }

                ctx.fill();

                if (active && (isDijkstra || inBand)) {
                    ctx.lineWidth = 2 * dpr;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.stroke();
                }
            });

            return activeCount;
        }

        function animateDenseGraphs() {
            if (!width || !height) resizeDenseCanvas();

            const time = performance.now() * 0.001;
            const cycle = (Math.sin(time * 0.75) + 1) / 2;
            const dijkstraProgress = Math.min(0.82, cycle * 0.95);
            const astarProgress = 0.12 + cycle * 0.52;
            const positions = actualNodes(time);

            const visitedD = drawDenseGraph(ctxDenseD, positions, dijkstraProgress, 'dijkstra');
            const visitedA = drawDenseGraph(ctxDenseA, positions, astarProgress, 'astar');

            denseDijkstraCount.textContent = `${visitedD}`;
            denseAstarCount.textContent = `${visitedA}`;

            requestAnimationFrame(animateDenseGraphs);
        }

        window.addEventListener('resize', resizeDenseCanvas);
        setTimeout(() => {
            resizeDenseCanvas();
            animateDenseGraphs();
        }, 300);
    }
    const pathCanvas = document.getElementById('canvas-caminho-grafo');
    if (pathCanvas) {
        const ctxPath = pathCanvas.getContext('2d');
        let pathWidth = 0;
        let pathHeight = 0;
        let pathTick = 0;

        const pathNodes = [
            { id: 'A', x: 0.14, y: 0.56 },
            { id: 'B', x: 0.34, y: 0.22 },
            { id: 'C', x: 0.35, y: 0.68 },
            { id: 'D', x: 0.57, y: 0.48 },
            { id: 'E', x: 0.76, y: 0.24 },
            { id: 'F', x: 0.84, y: 0.72 }
        ];

        const pathEdges = [
            ['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['D', 'F'], ['E', 'F']
        ];

        const highlightedPath = ['A', 'C', 'D', 'F'];

        function resizePathCanvas() {
            const rect = pathCanvas.parentElement.getBoundingClientRect();
            pathCanvas.width = rect.width * window.devicePixelRatio;
            pathCanvas.height = rect.height * window.devicePixelRatio;
            pathWidth = pathCanvas.width;
            pathHeight = pathCanvas.height;
        }

        function getPathNode(id) {
            return pathNodes.find((node) => node.id === id);
        }

        function toPathPoint(node) {
            return { x: node.x * pathWidth, y: node.y * pathHeight };
        }

        function isHighlightedPathEdge(a, b) {
            for (let i = 0; i < highlightedPath.length - 1; i += 1) {
                const start = highlightedPath[i];
                const end = highlightedPath[i + 1];
                if ((start === a && end === b) || (start === b && end === a)) return true;
            }
            return false;
        }

        function drawPathScene() {
            if (!pathWidth || !pathHeight) resizePathCanvas();

            ctxPath.clearRect(0, 0, pathWidth, pathHeight);
            pathTick += 0.012;
            const dpr = window.devicePixelRatio || 1;

            pathEdges.forEach(([from, to]) => {
                const start = toPathPoint(getPathNode(from));
                const end = toPathPoint(getPathNode(to));
                const active = isHighlightedPathEdge(from, to);

                ctxPath.beginPath();
                ctxPath.moveTo(start.x, start.y);
                ctxPath.lineTo(end.x, end.y);
                ctxPath.lineWidth = active ? 7 * dpr : 4 * dpr;
                ctxPath.strokeStyle = active ? 'rgba(16, 185, 129, 0.9)' : 'rgba(79, 70, 229, 0.22)';
                ctxPath.stroke();
            });

            const segmentCount = highlightedPath.length - 1;
            const totalProgress = (Math.sin(pathTick) + 1) / 2 * segmentCount;
            const segmentIndex = Math.min(Math.floor(totalProgress), segmentCount - 1);
            const segmentProgress = totalProgress - segmentIndex;
            const start = toPathPoint(getPathNode(highlightedPath[segmentIndex]));
            const end = toPathPoint(getPathNode(highlightedPath[segmentIndex + 1]));
            const travelerX = start.x + (end.x - start.x) * segmentProgress;
            const travelerY = start.y + (end.y - start.y) * segmentProgress;

            pathNodes.forEach((node) => {
                const point = toPathPoint(node);
                const active = highlightedPath.includes(node.id);
                const radius = (active ? 15 : 12) * dpr;

                ctxPath.save();
                if (active) {
                    ctxPath.shadowColor = 'rgba(16, 185, 129, 0.35)';
                    ctxPath.shadowBlur = 18 * dpr;
                }
                ctxPath.beginPath();
                ctxPath.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctxPath.fillStyle = active ? '#10b981' : '#818cf8';
                ctxPath.fill();
                ctxPath.restore();

                ctxPath.beginPath();
                ctxPath.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctxPath.lineWidth = 3 * dpr;
                ctxPath.strokeStyle = '#ffffff';
                ctxPath.stroke();

                ctxPath.fillStyle = '#0f172a';
                ctxPath.font = `${15 * dpr}px Outfit`;
                ctxPath.textAlign = 'center';
                ctxPath.textBaseline = 'middle';
                ctxPath.fillText(node.id, point.x, point.y);
            });

            ctxPath.save();
            ctxPath.beginPath();
            ctxPath.arc(travelerX, travelerY, 8 * dpr, 0, Math.PI * 2);
            ctxPath.fillStyle = '#0f172a';
            ctxPath.shadowColor = 'rgba(15, 23, 42, 0.2)';
            ctxPath.shadowBlur = 16 * dpr;
            ctxPath.fill();
            ctxPath.restore();

            requestAnimationFrame(drawPathScene);
        }

        window.addEventListener('resize', resizePathCanvas);
        setTimeout(() => {
            resizePathCanvas();
            drawPathScene();
        }, 300);
    }

    const adjacencyCanvas = document.getElementById('canvas-representacao-grafo');
    if (adjacencyCanvas) {
        const ctxAdj = adjacencyCanvas.getContext('2d');
        let adjWidth = 0;
        let adjHeight = 0;
        let adjPulse = 0;

        const adjacencyNodes = {
            a: { x: 0.5, y: 0.18 },
            b: { x: 0.22, y: 0.46 },
            c: { x: 0.5, y: 0.78 },
            d: { x: 0.78, y: 0.46 }
        };

        const adjacencyEdges = [
            ['a', 'b'], ['a', 'c'], ['a', 'd'], ['b', 'd']
        ];

        function resizeAdjacencyCanvas() {
            const rect = adjacencyCanvas.parentElement.getBoundingClientRect();
            adjacencyCanvas.width = rect.width * window.devicePixelRatio;
            adjacencyCanvas.height = rect.height * window.devicePixelRatio;
            adjWidth = adjacencyCanvas.width;
            adjHeight = adjacencyCanvas.height;
        }

        function drawAdjacencyScene() {
            if (!adjWidth || !adjHeight) resizeAdjacencyCanvas();

            ctxAdj.clearRect(0, 0, adjWidth, adjHeight);
            adjPulse += 0.025;
            const dpr = window.devicePixelRatio || 1;

            adjacencyEdges.forEach(([from, to]) => {
                const start = { x: adjacencyNodes[from].x * adjWidth, y: adjacencyNodes[from].y * adjHeight };
                const end = { x: adjacencyNodes[to].x * adjWidth, y: adjacencyNodes[to].y * adjHeight };

                ctxAdj.beginPath();
                ctxAdj.moveTo(start.x, start.y);
                ctxAdj.lineTo(end.x, end.y);
                ctxAdj.lineWidth = 4 * dpr;
                ctxAdj.strokeStyle = from === 'a' || to === 'a' ? 'rgba(79, 70, 229, 0.45)' : 'rgba(148, 163, 184, 0.5)';
                ctxAdj.stroke();
            });

            Object.entries(adjacencyNodes).forEach(([id, point]) => {
                const x = point.x * adjWidth;
                const y = point.y * adjHeight;
                const isHub = id === 'a';
                const radius = (isHub ? 20 : 17) * dpr;

                ctxAdj.save();
                if (isHub) {
                    ctxAdj.shadowColor = 'rgba(79, 70, 229, 0.3)';
                    ctxAdj.shadowBlur = (16 + Math.sin(adjPulse) * 4) * dpr;
                }
                ctxAdj.beginPath();
                ctxAdj.arc(x, y, radius, 0, Math.PI * 2);
                ctxAdj.fillStyle = isHub ? '#4f46e5' : '#c7d2fe';
                ctxAdj.fill();
                ctxAdj.restore();

                ctxAdj.beginPath();
                ctxAdj.arc(x, y, radius, 0, Math.PI * 2);
                ctxAdj.lineWidth = 3 * dpr;
                ctxAdj.strokeStyle = '#ffffff';
                ctxAdj.stroke();

                ctxAdj.fillStyle = isHub ? '#ffffff' : '#0f172a';
                ctxAdj.font = `${18 * dpr}px Outfit`;
                ctxAdj.textAlign = 'center';
                ctxAdj.textBaseline = 'middle';
                ctxAdj.fillText(id, x, y);
            });

            requestAnimationFrame(drawAdjacencyScene);
        }

        window.addEventListener('resize', resizeAdjacencyCanvas);
        setTimeout(() => {
            resizeAdjacencyCanvas();
            drawAdjacencyScene();
        }, 300);
    }

    const weightedCanvas = document.getElementById('canvas-grafo-ponderado');
    if (weightedCanvas) {
        const ctxWeighted = weightedCanvas.getContext('2d');
        let weightedWidth = 0;
        let weightedHeight = 0;
        let weightedStep = 0;

        const weightedNodes = {
            S: { x: 0.12, y: 0.52 },
            A: { x: 0.34, y: 0.24 },
            B: { x: 0.36, y: 0.78 },
            C: { x: 0.6, y: 0.32 },
            D: { x: 0.64, y: 0.7 },
            T: { x: 0.86, y: 0.5 }
        };

        const weightedEdges = [
            ['S', 'A', 2], ['S', 'B', 4], ['A', 'C', 3], ['A', 'D', 6],
            ['B', 'D', 2], ['C', 'T', 4], ['D', 'T', 1], ['C', 'D', 2]
        ];

        const weightedPath = ['S', 'B', 'D', 'T'];

        function resizeWeightedCanvas() {
            const rect = weightedCanvas.parentElement.getBoundingClientRect();
            weightedCanvas.width = rect.width * window.devicePixelRatio;
            weightedCanvas.height = rect.height * window.devicePixelRatio;
            weightedWidth = weightedCanvas.width;
            weightedHeight = weightedCanvas.height;
        }

        function isWeightedPathEdge(a, b) {
            for (let i = 0; i < weightedPath.length - 1; i += 1) {
                const start = weightedPath[i];
                const end = weightedPath[i + 1];
                if ((start === a && end === b) || (start === b && end === a)) return true;
            }
            return false;
        }

        function drawWeightBadge(x, y, weight, active, dpr) {
            const badgeWidth = 28 * dpr;
            const badgeHeight = 22 * dpr;

            ctxWeighted.beginPath();
            ctxWeighted.roundRect(x - badgeWidth / 2, y - badgeHeight / 2, badgeWidth, badgeHeight, 10 * dpr);
            ctxWeighted.fillStyle = active ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.92)';
            ctxWeighted.fill();
            ctxWeighted.lineWidth = 1.5 * dpr;
            ctxWeighted.strokeStyle = active ? 'rgba(16, 185, 129, 0.45)' : 'rgba(148, 163, 184, 0.35)';
            ctxWeighted.stroke();

            ctxWeighted.fillStyle = active ? '#059669' : '#334155';
            ctxWeighted.font = `${12 * dpr}px Outfit`;
            ctxWeighted.textAlign = 'center';
            ctxWeighted.textBaseline = 'middle';
            ctxWeighted.fillText(String(weight), x, y + 0.5 * dpr);
        }

        function drawWeightedScene() {
            if (!weightedWidth || !weightedHeight) resizeWeightedCanvas();

            ctxWeighted.clearRect(0, 0, weightedWidth, weightedHeight);
            weightedStep += 0.016;
            const dpr = window.devicePixelRatio || 1;

            weightedEdges.forEach(([from, to, weight]) => {
                const start = { x: weightedNodes[from].x * weightedWidth, y: weightedNodes[from].y * weightedHeight };
                const end = { x: weightedNodes[to].x * weightedWidth, y: weightedNodes[to].y * weightedHeight };
                const active = isWeightedPathEdge(from, to);

                ctxWeighted.beginPath();
                ctxWeighted.moveTo(start.x, start.y);
                ctxWeighted.lineTo(end.x, end.y);
                ctxWeighted.lineWidth = active ? 6 * dpr : 4 * dpr;
                ctxWeighted.strokeStyle = active ? 'rgba(16, 185, 129, 0.85)' : 'rgba(79, 70, 229, 0.24)';
                ctxWeighted.stroke();

                drawWeightBadge((start.x + end.x) / 2, (start.y + end.y) / 2, weight, active, dpr);
            });

            const segmentCount = weightedPath.length - 1;
            const totalProgress = (Math.sin(weightedStep) + 1) / 2 * segmentCount;
            const segmentIndex = Math.min(Math.floor(totalProgress), segmentCount - 1);
            const segmentProgress = totalProgress - segmentIndex;
            const start = { x: weightedNodes[weightedPath[segmentIndex]].x * weightedWidth, y: weightedNodes[weightedPath[segmentIndex]].y * weightedHeight };
            const end = { x: weightedNodes[weightedPath[segmentIndex + 1]].x * weightedWidth, y: weightedNodes[weightedPath[segmentIndex + 1]].y * weightedHeight };
            const travelerX = start.x + (end.x - start.x) * segmentProgress;
            const travelerY = start.y + (end.y - start.y) * segmentProgress;

            Object.entries(weightedNodes).forEach(([id, point]) => {
                const x = point.x * weightedWidth;
                const y = point.y * weightedHeight;
                const isBest = weightedPath.includes(id);
                const isEndpoint = id === 'S' || id === 'T';
                const radius = (isEndpoint ? 18 : 15) * dpr;

                ctxWeighted.save();
                if (isBest) {
                    ctxWeighted.shadowColor = 'rgba(16, 185, 129, 0.28)';
                    ctxWeighted.shadowBlur = (18 + Math.cos(weightedStep) * 4) * dpr;
                }
                ctxWeighted.beginPath();
                ctxWeighted.arc(x, y, radius, 0, Math.PI * 2);
                ctxWeighted.fillStyle = isBest ? '#10b981' : '#818cf8';
                ctxWeighted.fill();
                ctxWeighted.restore();

                ctxWeighted.beginPath();
                ctxWeighted.arc(x, y, radius, 0, Math.PI * 2);
                ctxWeighted.lineWidth = 3 * dpr;
                ctxWeighted.strokeStyle = '#ffffff';
                ctxWeighted.stroke();

                ctxWeighted.fillStyle = '#0f172a';
                ctxWeighted.font = `${15 * dpr}px Outfit`;
                ctxWeighted.textAlign = 'center';
                ctxWeighted.textBaseline = 'middle';
                ctxWeighted.fillText(id, x, y);
            });

            ctxWeighted.save();
            ctxWeighted.beginPath();
            ctxWeighted.arc(travelerX, travelerY, 7 * dpr, 0, Math.PI * 2);
            ctxWeighted.fillStyle = '#0f172a';
            ctxWeighted.shadowColor = 'rgba(15, 23, 42, 0.18)';
            ctxWeighted.shadowBlur = 14 * dpr;
            ctxWeighted.fill();
            ctxWeighted.restore();

            requestAnimationFrame(drawWeightedScene);
        }

        window.addEventListener('resize', resizeWeightedCanvas);
        setTimeout(() => {
            resizeWeightedCanvas();
            drawWeightedScene();
        }, 300);
    }
});
