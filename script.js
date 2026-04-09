document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    // Configuração para navegar entre slides usando as setas do teclado
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
    }

    function prevSlide() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }
    
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

            const startX = w * 0.2, startY = h * 0.8;
            const endX = w * 0.8, endY = h * 0.2;

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
});
