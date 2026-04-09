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
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar') {
            e.preventDefault();
            navigateToRelativeSlide(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            navigateToRelativeSlide(-1);
        }
    });

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
        if (!slideActive) return;

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
        if (slideActive) {
            const dynamicObjects = slideActive.querySelectorAll('.dynamic-object');
            dynamicObjects.forEach(obj => {
                obj.style.transform = 'translate(0px, 0px)';
            });
        }
    });

    // === Sistema do Grafo Dinâmico (Canvas) ===
    const canvas = document.getElementById('graph-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            width = canvas.width;
            height = canvas.height;
        }

        window.addEventListener('resize', resize);
        setTimeout(resize, 100);

        const nodes = [
            { id: 0, x: 0.2, y: 0.3 },
            { id: 1, x: 0.8, y: 0.25 },
            { id: 2, x: 0.5, y: 0.5 },
            { id: 3, x: 0.3, y: 0.75 },
            { id: 4, x: 0.7, y: 0.8 }
        ];

        const edges = [
            [0, 2], [1, 2], [2, 3], [2, 4], [3, 4], [0, 3]
        ];

        const traveler = {
            currentNode: 0,
            targetNode: 2,
            progress: 0,
            speed: 0.008
        };

        function getNeighbors(nodeId) {
            const neighbors = [];
            edges.forEach(edge => {
                if (edge[0] === nodeId) neighbors.push(edge[1]);
                if (edge[1] === nodeId) neighbors.push(edge[0]);
            });
            return neighbors;
        }

        let time = 0;

        function animate() {
            if (width === 0 || height === 0) resize();
            ctx.clearRect(0, 0, width, height);

            time += 0.01;

            const actualPositions = nodes.map((n, i) => {
                const offsetX = Math.sin(time + i * 1.5) * (width * 0.003);
                const offsetY = Math.cos(time + i) * (height * 0.003);
                return {
                    x: n.x * width + offsetX,
                    y: n.y * height + offsetY
                };
            });

            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            ctx.lineWidth = 3 * window.devicePixelRatio;
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.25)';
            edges.forEach(edge => {
                const start = actualPositions[edge[0]];
                const end = actualPositions[edge[1]];
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            });

            traveler.progress += traveler.speed;
            if (traveler.progress >= 1) {
                traveler.currentNode = traveler.targetNode;
                const neighbors = getNeighbors(traveler.currentNode);
                traveler.targetNode = neighbors[Math.floor(Math.random() * neighbors.length)];
                traveler.progress = 0;
            }

            const startPos = actualPositions[traveler.currentNode];
            const endPos = actualPositions[traveler.targetNode];
            const easeProgress = -(Math.cos(Math.PI * traveler.progress) - 1) / 2;

            const travelerX = startPos.x + (endPos.x - startPos.x) * easeProgress;
            const travelerY = startPos.y + (endPos.y - startPos.y) * easeProgress;

            ctx.lineWidth = 4 * window.devicePixelRatio;
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(travelerX, travelerY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(travelerX, travelerY, 8 * window.devicePixelRatio, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();
            ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            actualPositions.forEach((pos, i) => {
                const isActive = (i === traveler.currentNode) || (i === traveler.targetNode);

                ctx.beginPath();
                ctx.arc(pos.x, pos.y, (isActive ? 12 : 10) * window.devicePixelRatio, 0, Math.PI * 2);
                ctx.fillStyle = isActive ? '#4f46e5' : '#818cf8';
                ctx.fill();

                ctx.lineWidth = 3 * window.devicePixelRatio;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                if (isActive) {
                    ctx.shadowColor = 'rgba(79, 70, 229, 0.5)';
                    ctx.shadowBlur = 20;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            requestAnimationFrame(animate);
        }

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

        function drawQueueCard(x, y, w, h, item, pulse) {
            const activeOffset = item.active ? Math.sin(time) * 2 : 0;

            ctx.save();
            ctx.shadowColor = item.active ? 'rgba(79, 70, 229, 0.16)' : 'transparent';
            ctx.shadowBlur = item.active ? 16 + pulse * 8 : 0;
            roundedRect(x, y + activeOffset, w, h, 18);
            ctx.fillStyle = item.active ? 'rgba(79, 70, 229, 0.08)' : '#ffffff';
            ctx.fill();
            ctx.restore();

            roundedRect(x, y + activeOffset, w, h, 18);
            ctx.lineWidth = item.active ? 2.2 : 1.4;
            ctx.strokeStyle = item.active ? '#4f46e5' : 'rgba(148, 163, 184, 0.35)';
            ctx.stroke();

            roundedRect(x + 16, y + 14 + activeOffset, 48, h - 28, 13);
            ctx.fillStyle = item.active ? '#4f46e5' : 'rgba(79, 70, 229, 0.08)';
            ctx.fill();

            drawLabel(item.vertex, x + 40, y + h / 2 + activeOffset, {
                font: '700 20px Outfit',
                color: item.active ? '#ffffff' : '#4f46e5',
                align: 'center'
            });

            drawLabel('\u03bb(v)', x + 84, y + 24 + activeOffset, {
                font: '600 12px Outfit',
                color: '#64748b'
            });

            drawLabel(item.lambda, x + 84, y + h / 2 + 8 + activeOffset, {
                font: '700 26px Outfit',
                color: '#0f172a'
            });

            if (item.active) {
                roundedRect(x + w - 116, y + 18 + activeOffset, 92, 24, 12);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
                ctx.fill();
                drawLabel('menor custo', x + w - 70, y + 30 + activeOffset, {
                    font: '700 10px Outfit',
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

            const outerPad = 22;
            const leftPanel = {
                x: 34,
                y: height * 0.27,
                w: width * 0.22,
                h: height * 0.30
            };
            const queuePanel = {
                x: width * 0.40,
                y: height * 0.16,
                w: width * 0.46,
                h: height * 0.68
            };
            const cardX = queuePanel.x + 18;
            const cardW = queuePanel.w - 36;
            const cardH = 72;
            const cardGap = 16;
            const firstCardY = queuePanel.y + 54;
            const linkStartX = leftPanel.x + leftPanel.w + 16;
            const linkStartY = leftPanel.y + leftPanel.h / 2;
            const linkEndX = queuePanel.x - 16;
            const linkEndY = firstCardY + cardH / 2;

            const bgGradient = ctx.createLinearGradient(0, 0, width, height);
            bgGradient.addColorStop(0, '#fbfdff');
            bgGradient.addColorStop(1, '#eef4ff');
            roundedRect(outerPad, outerPad, width - outerPad * 2, height - outerPad * 2, 26);
            ctx.fillStyle = bgGradient;
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
            ctx.stroke();

            roundedRect(leftPanel.x, leftPanel.y, leftPanel.w, leftPanel.h, 22);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fill();
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
            ctx.stroke();

            drawLabel('1\u00ba extra\u00eddo', leftPanel.x, leftPanel.y - 20, {
                font: '700 13px Outfit',
                color: '#059669'
            });

            roundedRect(leftPanel.x + 24, leftPanel.y + 38, leftPanel.w - 48, leftPanel.h - 72, 18);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
            ctx.fill();

            roundedRect(leftPanel.x + 40, leftPanel.y + 62, 68, 88, 18);
            ctx.fillStyle = '#10b981';
            ctx.fill();

            drawLabel(queueItems[0].vertex, leftPanel.x + 74, leftPanel.y + 106, {
                font: '700 34px Outfit',
                color: '#ffffff',
                align: 'center'
            });

            drawLabel(`\u03bb(v) = ${queueItems[0].lambda}`, leftPanel.x + leftPanel.w / 2, leftPanel.y + leftPanel.h - 46, {
                font: '700 22px Outfit',
                color: '#0f172a',
                align: 'center'
            });

            roundedRect(queuePanel.x, queuePanel.y, queuePanel.w, queuePanel.h, 24);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
            ctx.fill();
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
            ctx.stroke();

            drawLabel('Fila Q', queuePanel.x + 20, queuePanel.y + 26, {
                font: '700 13px Outfit',
                color: '#4f46e5'
            });

            drawLabel('ordenada por menor \u03bb(v)', queuePanel.x + 20, queuePanel.y + 46, {
                font: '600 12px Outfit',
                color: '#64748b'
            });

            queueItems.forEach((item, index) => {
                const y = firstCardY + index * (cardH + cardGap);
                drawQueueCard(cardX, y, cardW, cardH, item, pulse);
            });

            ctx.beginPath();
            ctx.moveTo(linkStartX, linkStartY);
            ctx.bezierCurveTo(
                width * 0.33,
                linkStartY,
                width * 0.35,
                linkEndY,
                linkEndX,
                linkEndY
            );
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.35)';
            ctx.stroke();

            const dotT = 0.35 + pulse * 0.3;
            const dotX = linkStartX + (linkEndX - linkStartX) * dotT;
            const dotY = linkStartY + (linkEndY - linkStartY) * dotT;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(linkEndX, linkEndY);
            ctx.lineTo(linkEndX - 10, linkEndY - 7);
            ctx.moveTo(linkEndX, linkEndY);
            ctx.lineTo(linkEndX - 10, linkEndY + 7);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.45)';
            ctx.stroke();

            drawLabel('ExtractMin(Q)', width * 0.30, linkStartY - 28, {
                font: '700 12px Outfit',
                color: '#4f46e5',
                align: 'center'
            });

            requestAnimationFrame(animatePriorityQueue);
        }

        window.addEventListener('resize', resizePriorityCanvas);

        setTimeout(() => {
            resizePriorityCanvas();
            animatePriorityQueue();
        }, 300);
    }

    function mountCanvasScene(canvasId, drawFrame) {
        const sceneCanvas = document.getElementById(canvasId);
        if (!sceneCanvas) return;

        const ctx = sceneCanvas.getContext('2d');
        let width = 0;
        let height = 0;

        function resizeScene() {
            const rect = sceneCanvas.parentElement.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;

            sceneCanvas.width = rect.width * ratio;
            sceneCanvas.height = rect.height * ratio;
            width = rect.width;
            height = rect.height;

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function animateScene(timestamp) {
            if (!width || !height) resizeScene();
            ctx.clearRect(0, 0, width, height);

            drawFrame({
                ctx,
                width,
                height,
                time: timestamp * 0.001,
                pulse: (Math.sin(timestamp * 0.002) + 1) / 2
            });

            requestAnimationFrame(animateScene);
        }

        window.addEventListener('resize', resizeScene);

        setTimeout(() => {
            resizeScene();
            requestAnimationFrame(animateScene);
        }, 300);
    }

    function roundRectPath(ctx, x, y, w, h, r) {
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

    function fillRoundRect(ctx, x, y, w, h, r, fillStyle, shadowColor = null, shadowBlur = 0) {
        ctx.save();
        if (shadowColor) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
        }
        roundRectPath(ctx, x, y, w, h, r);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.restore();
    }

    function strokeRoundRect(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1.5) {
        ctx.save();
        roundRectPath(ctx, x, y, w, h, r);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
        ctx.restore();
    }

    function drawCanvasText(ctx, text, x, y, options = {}) {
        const {
            font = '600 14px Outfit',
            color = '#4f46e5',
            align = 'left',
            baseline = 'middle'
        } = options;

        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function drawCanvasCircle(ctx, x, y, radius, fillStyle, strokeStyle = '#ffffff', lineWidth = 2) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        if (strokeStyle) {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        }
        ctx.restore();
    }

    function lerp(start, end, t) {
        return start + (end - start) * t;
    }

    function samplePath(points, t) {
        if (points.length === 1) return points[0];

        const scaled = Math.max(0, Math.min(0.999, t)) * (points.length - 1);
        const index = Math.floor(scaled);
        const localT = scaled - index;
        const start = points[index];
        const end = points[Math.min(index + 1, points.length - 1)];

        return {
            x: lerp(start.x, end.x, localT),
            y: lerp(start.y, end.y, localT)
        };
    }

    const dijkstraQueueItems = [
        { vertex: 'B', lambda: '3', active: true },
        { vertex: 'D', lambda: '5', active: false },
        { vertex: 'E', lambda: '7', active: false },
        { vertex: 'F', lambda: '9', active: false }
    ];

    function drawDijkstraQueueCard(ctx, x, y, w, h, item, pulse) {
        const offset = item.active ? (pulse - 0.5) * 4 : 0;
        const shadowBlur = item.active ? 14 + pulse * 8 : 0;

        fillRoundRect(
            ctx,
            x,
            y + offset,
            w,
            h,
            16,
            item.active ? 'rgba(79, 70, 229, 0.08)' : '#ffffff',
            item.active ? 'rgba(79, 70, 229, 0.16)' : null,
            shadowBlur
        );

        strokeRoundRect(
            ctx,
            x,
            y + offset,
            w,
            h,
            16,
            item.active ? '#4f46e5' : 'rgba(148, 163, 184, 0.35)',
            item.active ? 2 : 1.4
        );

        fillRoundRect(
            ctx,
            x + 14,
            y + 12 + offset,
            46,
            h - 24,
            12,
            item.active ? '#4f46e5' : 'rgba(79, 70, 229, 0.08)'
        );

        drawCanvasText(ctx, item.vertex, x + 37, y + h / 2 + offset, {
            font: '700 18px Outfit',
            color: item.active ? '#ffffff' : '#4f46e5',
            align: 'center'
        });

        drawCanvasText(ctx, '\u03bb(v)', x + 78, y + 20 + offset, {
            font: '600 11px Outfit',
            color: '#64748b'
        });

        drawCanvasText(ctx, item.lambda, x + 78, y + h / 2 + 6 + offset, {
            font: '700 24px Outfit',
            color: '#0f172a'
        });
    }

    mountCanvasScene('dijkstra-priority-canvas', ({ ctx, width, height, pulse }) => {
        const background = ctx.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#fbfdff');
        background.addColorStop(1, '#eef4ff');

        fillRoundRect(ctx, 18, 18, width - 36, height - 36, 24, background);
        strokeRoundRect(ctx, 18, 18, width - 36, height - 36, 24, 'rgba(148, 163, 184, 0.18)', 1.2);

        const extractBox = {
            x: 34,
            y: height * 0.24,
            w: width * 0.22,
            h: height * 0.22
        };

        const queueBox = {
            x: width * 0.40,
            y: height * 0.12,
            w: width * 0.47,
            h: height * 0.72
        };

        fillRoundRect(ctx, extractBox.x, extractBox.y, extractBox.w, extractBox.h, 22, 'rgba(255, 255, 255, 0.9)');
        strokeRoundRect(ctx, extractBox.x, extractBox.y, extractBox.w, extractBox.h, 22, 'rgba(16, 185, 129, 0.28)', 1.4);

        drawCanvasText(ctx, 'u = ExtractMin(Q)', extractBox.x, extractBox.y - 18, {
            font: '700 12px Outfit',
            color: '#059669'
        });

        fillRoundRect(ctx, extractBox.x + 24, extractBox.y + 26, extractBox.w - 48, extractBox.h - 52, 18, 'rgba(16, 185, 129, 0.08)');

        const extractedNode = {
            x: extractBox.x + 38,
            y: extractBox.y + 46,
            w: Math.min(72, extractBox.w - 58),
            h: Math.min(80, extractBox.h - 64)
        };

        fillRoundRect(ctx, extractedNode.x, extractedNode.y, extractedNode.w, extractedNode.h, 18, '#10b981');

        drawCanvasText(ctx, 'B', extractedNode.x + extractedNode.w / 2, extractedNode.y + extractedNode.h / 2, {
            font: '700 32px Outfit',
            color: '#ffffff',
            align: 'center'
        });

        drawCanvasText(ctx, '\u03bb(v) = 3', extractBox.x + extractBox.w / 2, extractBox.y + extractBox.h - 34, {
            font: '700 20px Outfit',
            color: '#0f172a',
            align: 'center'
        });

        fillRoundRect(ctx, queueBox.x, queueBox.y, queueBox.w, queueBox.h, 24, 'rgba(255, 255, 255, 0.84)');
        strokeRoundRect(ctx, queueBox.x, queueBox.y, queueBox.w, queueBox.h, 24, 'rgba(148, 163, 184, 0.22)', 1.4);

        drawCanvasText(ctx, 'Fila Q', queueBox.x + 18, queueBox.y + 24, {
            font: '700 13px Outfit',
            color: '#4f46e5'
        });

        drawCanvasText(ctx, 'ordenada por menor \u03bb(v)', queueBox.x + 18, queueBox.y + 42, {
            font: '600 12px Outfit',
            color: '#64748b'
        });

        const cardX = queueBox.x + 18;
        const cardY = queueBox.y + 56;
        const cardW = queueBox.w - 36;
        const cardH = 50;
        const cardGap = 10;

        dijkstraQueueItems.forEach((item, index) => {
            drawDijkstraQueueCard(ctx, cardX, cardY + index * (cardH + cardGap), cardW, cardH, item, pulse);
        });

        drawCanvasText(ctx, 'relaxa vizinhos', extractBox.x, extractBox.y + extractBox.h + 26, {
            font: '700 12px Outfit',
            color: '#64748b'
        });

        const chipY = extractBox.y + extractBox.h + 42;
        [
            { label: 'C', cost: '6', x: extractBox.x },
            { label: 'E', cost: '8', x: extractBox.x + 82 }
        ].forEach((chip, index) => {
            const glow = 8 + pulse * 6 + index * 2;
            fillRoundRect(
                ctx,
                chip.x,
                chipY,
                72,
                44,
                14,
                'rgba(255, 255, 255, 0.92)',
                'rgba(16, 185, 129, 0.10)',
                glow
            );
            strokeRoundRect(ctx, chip.x, chipY, 72, 44, 14, 'rgba(16, 185, 129, 0.22)', 1.2);
            drawCanvasText(ctx, chip.label, chip.x + 20, chipY + 22, {
                font: '700 16px Outfit',
                color: '#10b981',
                align: 'center'
            });
            drawCanvasText(ctx, chip.cost, chip.x + 48, chipY + 22, {
                font: '700 18px Outfit',
                color: '#0f172a',
                align: 'center'
            });
        });

        const linkStart = {
            x: queueBox.x - 14,
            y: cardY + cardH / 2
        };

        const linkEnd = {
            x: extractBox.x + extractBox.w + 8,
            y: extractBox.y + extractBox.h / 2
        };

        ctx.beginPath();
        ctx.moveTo(linkStart.x, linkStart.y);
        ctx.bezierCurveTo(width * 0.32, linkStart.y, width * 0.30, linkEnd.y, linkEnd.x, linkEnd.y);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.36)';
        ctx.stroke();

        const travel = 0.18 + pulse * 0.64;
        const dotX = lerp(linkStart.x, linkEnd.x, travel);
        const dotY = lerp(linkStart.y, linkEnd.y, travel);
        drawCanvasCircle(ctx, dotX, dotY, 5, '#10b981', null, 0);
    });

    mountCanvasScene('astar-heuristic-canvas', ({ ctx, width, height, pulse }) => {
        const background = ctx.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#fbfdff');
        background.addColorStop(1, '#eef4ff');

        fillRoundRect(ctx, 18, 18, width - 36, height - 36, 24, background);
        strokeRoundRect(ctx, 18, 18, width - 36, height - 36, 24, 'rgba(148, 163, 184, 0.18)', 1.2);

        drawCanvasText(ctx, 'heur\u00edstica em linha reta', 34, 34, {
            font: '700 12px Outfit',
            color: '#4f46e5'
        });

        const gridSize = Math.min(width * 0.62, height * 0.72);
        const gridX = (width - gridSize) / 2;
        const gridY = height * 0.17;
        const cellSize = gridSize / 7;

        const obstacles = new Set(['1,1', '2,1', '2,2', '4,3', '4,4', '5,5']);
        const visited = new Set(['0,5', '1,5', '1,4', '2,4', '3,4', '3,3']);
        const frontier = new Set(['2,3', '3,2', '4,2']);
        const current = { col: 3, row: 3 };
        const start = { col: 0, row: 5 };
        const goal = { col: 6, row: 1 };

        fillRoundRect(ctx, gridX - 18, gridY - 18, gridSize + 36, gridSize + 36, 24, 'rgba(255, 255, 255, 0.84)');
        strokeRoundRect(ctx, gridX - 18, gridY - 18, gridSize + 36, gridSize + 36, 24, 'rgba(148, 163, 184, 0.22)', 1.2);

        for (let row = 0; row < 7; row += 1) {
            for (let col = 0; col < 7; col += 1) {
                const x = gridX + col * cellSize;
                const y = gridY + row * cellSize;
                const key = `${col},${row}`;
                let fill = 'rgba(255, 255, 255, 0.78)';

                if (obstacles.has(key)) fill = 'rgba(148, 163, 184, 0.24)';
                if (visited.has(key)) fill = 'rgba(79, 70, 229, 0.12)';
                if (frontier.has(key)) fill = 'rgba(16, 185, 129, 0.10)';

                fillRoundRect(ctx, x + 2, y + 2, cellSize - 4, cellSize - 4, 10, fill);
                strokeRoundRect(ctx, x + 2, y + 2, cellSize - 4, cellSize - 4, 10, 'rgba(148, 163, 184, 0.12)', 1);
            }
        }

        const routePoints = [
            start,
            { col: 1, row: 5 },
            { col: 1, row: 4 },
            { col: 2, row: 4 },
            { col: 3, row: 4 },
            current
        ].map(point => ({
            x: gridX + point.col * cellSize + cellSize / 2,
            y: gridY + point.row * cellSize + cellSize / 2
        }));

        ctx.beginPath();
        ctx.moveTo(routePoints[0].x, routePoints[0].y);
        routePoints.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
        ctx.stroke();

        const currentCenter = {
            x: gridX + current.col * cellSize + cellSize / 2,
            y: gridY + current.row * cellSize + cellSize / 2
        };

        const goalCenter = {
            x: gridX + goal.col * cellSize + cellSize / 2,
            y: gridY + goal.row * cellSize + cellSize / 2
        };

        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(currentCenter.x, currentCenter.y);
        ctx.lineTo(goalCenter.x, goalCenter.y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.45)';
        ctx.stroke();
        ctx.restore();

        const heuristicDot = {
            x: lerp(currentCenter.x, goalCenter.x, 0.18 + pulse * 0.64),
            y: lerp(currentCenter.y, goalCenter.y, 0.18 + pulse * 0.64)
        };

        drawCanvasCircle(ctx, gridX + start.col * cellSize + cellSize / 2, gridY + start.row * cellSize + cellSize / 2, 14, '#4f46e5');
        drawCanvasCircle(ctx, goalCenter.x, goalCenter.y, 16, '#10b981');
        drawCanvasCircle(ctx, currentCenter.x, currentCenter.y, 12, '#ffffff', '#4f46e5', 3);
        drawCanvasCircle(ctx, heuristicDot.x, heuristicDot.y, 5, '#4f46e5', null, 0);

        drawCanvasText(ctx, 'S', gridX + start.col * cellSize + cellSize / 2, gridY + start.row * cellSize + cellSize / 2, {
            font: '700 14px Outfit',
            color: '#ffffff',
            align: 'center'
        });

        drawCanvasText(ctx, 'G', goalCenter.x, goalCenter.y, {
            font: '700 14px Outfit',
            color: '#ffffff',
            align: 'center'
        });

        drawCanvasText(ctx, 'v', currentCenter.x, currentCenter.y, {
            font: '700 13px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        drawCanvasText(ctx, '\u03b3(v)', (currentCenter.x + goalCenter.x) / 2, (currentCenter.y + goalCenter.y) / 2 - 18, {
            font: '700 12px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        drawCanvasText(ctx, 'origem', gridX - 8, gridY + gridSize + 22, {
            font: '600 12px Outfit',
            color: '#64748b'
        });

        drawCanvasText(ctx, 'alvo', gridX + gridSize - 4, gridY - 22, {
            font: '600 12px Outfit',
            color: '#059669',
            align: 'right'
        });
    });

    mountCanvasScene('astar-formula-canvas', ({ ctx, width, height, pulse }) => {
        const background = ctx.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#fbfdff');
        background.addColorStop(1, '#eef4ff');

        fillRoundRect(ctx, 18, 18, width - 36, height - 36, 24, background);
        strokeRoundRect(ctx, 18, 18, width - 36, height - 36, 24, 'rgba(148, 163, 184, 0.18)', 1.2);

        const chipY = 72;
        const alphaBox = { x: width * 0.08, y: chipY, w: width * 0.18, h: 54 };
        const lambdaBox = { x: width * 0.37, y: chipY, w: width * 0.23, h: 54 };
        const gammaBox = { x: width * 0.68, y: chipY, w: width * 0.23, h: 54 };

        fillRoundRect(ctx, alphaBox.x, alphaBox.y, alphaBox.w, alphaBox.h, 18, 'rgba(79, 70, 229, 0.08)');
        strokeRoundRect(ctx, alphaBox.x, alphaBox.y, alphaBox.w, alphaBox.h, 18, '#4f46e5', 1.8);
        drawCanvasText(ctx, '\u03b1(v)', alphaBox.x + alphaBox.w / 2, alphaBox.y + alphaBox.h / 2, {
            font: '700 28px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        fillRoundRect(ctx, lambdaBox.x, lambdaBox.y, lambdaBox.w, lambdaBox.h, 18, 'rgba(16, 185, 129, 0.08)');
        strokeRoundRect(ctx, lambdaBox.x, lambdaBox.y, lambdaBox.w, lambdaBox.h, 18, 'rgba(16, 185, 129, 0.28)', 1.6);
        drawCanvasText(ctx, '\u03bb(v)', lambdaBox.x + lambdaBox.w / 2, lambdaBox.y + lambdaBox.h / 2, {
            font: '700 26px Outfit',
            color: '#059669',
            align: 'center'
        });

        fillRoundRect(ctx, gammaBox.x, gammaBox.y, gammaBox.w, gammaBox.h, 18, 'rgba(79, 70, 229, 0.06)');
        strokeRoundRect(ctx, gammaBox.x, gammaBox.y, gammaBox.w, gammaBox.h, 18, 'rgba(79, 70, 229, 0.24)', 1.6);
        drawCanvasText(ctx, '\u03b3(v)', gammaBox.x + gammaBox.w / 2, gammaBox.y + gammaBox.h / 2, {
            font: '700 26px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        drawCanvasText(ctx, '=', width * 0.31, chipY + 27, {
            font: '700 28px Outfit',
            color: '#64748b',
            align: 'center'
        });

        drawCanvasText(ctx, '+', width * 0.64, chipY + 27, {
            font: '700 28px Outfit',
            color: '#64748b',
            align: 'center'
        });

        const routeY = height * 0.62;
        const origin = { x: width * 0.15, y: routeY };
        const current = { x: width * 0.49, y: routeY };
        const goal = { x: width * 0.82, y: routeY };

        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(current.x, current.y);
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
        ctx.stroke();

        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(goal.x, goal.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.45)';
        ctx.stroke();
        ctx.restore();

        drawCanvasCircle(ctx, origin.x, origin.y, 12, '#4f46e5');
        drawCanvasCircle(ctx, current.x, current.y, 13, '#ffffff', '#4f46e5', 3);
        drawCanvasCircle(ctx, goal.x, goal.y, 14, '#10b981');

        drawCanvasText(ctx, 'origem', origin.x, routeY + 28, {
            font: '600 12px Outfit',
            color: '#64748b',
            align: 'center'
        });

        drawCanvasText(ctx, 'v', current.x, current.y, {
            font: '700 13px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        drawCanvasText(ctx, 'destino', goal.x, routeY + 28, {
            font: '600 12px Outfit',
            color: '#64748b',
            align: 'center'
        });

        drawCanvasText(ctx, 'custo real', (origin.x + current.x) / 2, routeY - 22, {
            font: '700 12px Outfit',
            color: '#059669',
            align: 'center'
        });

        drawCanvasText(ctx, 'estimativa', (current.x + goal.x) / 2, routeY - 22, {
            font: '700 12px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        ctx.beginPath();
        ctx.moveTo(lambdaBox.x + lambdaBox.w / 2, lambdaBox.y + lambdaBox.h + 10);
        ctx.lineTo((origin.x + current.x) / 2, routeY - 34);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(gammaBox.x + gammaBox.w / 2, gammaBox.y + gammaBox.h + 10);
        ctx.lineTo((current.x + goal.x) / 2, routeY - 34);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.3)';
        ctx.stroke();

        const lambdaDot = {
            x: lerp(origin.x, current.x, 0.18 + pulse * 0.62),
            y: routeY
        };

        const gammaDot = {
            x: lerp(current.x, goal.x, 0.14 + pulse * 0.68),
            y: routeY
        };

        drawCanvasCircle(ctx, lambdaDot.x, lambdaDot.y, 5, '#10b981', null, 0);
        drawCanvasCircle(ctx, gammaDot.x, gammaDot.y, 5, '#4f46e5', null, 0);
    });

    mountCanvasScene('search-direction-canvas', ({ ctx, width, height, pulse, time }) => {
        const background = ctx.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#fbfdff');
        background.addColorStop(1, '#eef4ff');

        fillRoundRect(ctx, 18, 18, width - 36, height - 36, 24, background);
        strokeRoundRect(ctx, 18, 18, width - 36, height - 36, 24, 'rgba(148, 163, 184, 0.18)', 1.2);

        ctx.beginPath();
        ctx.moveTo(width / 2, 44);
        ctx.lineTo(width / 2, height - 44);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.stroke();

        fillRoundRect(ctx, 36, 34, 96, 28, 14, 'rgba(79, 70, 229, 0.08)');
        drawCanvasText(ctx, 'Dijkstra', 84, 48, {
            font: '700 12px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        fillRoundRect(ctx, width / 2 + 24, 34, 74, 28, 14, 'rgba(16, 185, 129, 0.10)');
        drawCanvasText(ctx, 'A*', width / 2 + 61, 48, {
            font: '700 12px Outfit',
            color: '#059669',
            align: 'center'
        });

        const leftCenter = { x: width * 0.24, y: height * 0.58 };
        const targetLeft = { x: width * 0.42, y: height * 0.24 };
        const radii = [38, 72, 104];

        radii.forEach((radius, ringIndex) => {
            ctx.beginPath();
            ctx.arc(leftCenter.x, leftCenter.y, radius + ringIndex * pulse * 2, 0, Math.PI * 2);
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = `rgba(79, 70, 229, ${0.10 + ringIndex * 0.06})`;
            ctx.stroke();

            const steps = 8 + ringIndex * 2;
            for (let i = 0; i < steps; i += 1) {
                const angle = (Math.PI * 2 * i) / steps + ringIndex * 0.18;
                const x = leftCenter.x + Math.cos(angle) * radius;
                const y = leftCenter.y + Math.sin(angle) * radius;
                drawCanvasCircle(ctx, x, y, 5, 'rgba(79, 70, 229, 0.20)', null, 0);
            }
        });

        drawCanvasCircle(ctx, leftCenter.x, leftCenter.y, 14, '#4f46e5');
        drawCanvasCircle(ctx, targetLeft.x, targetLeft.y, 12, '#ffffff', '#94a3b8', 2);

        drawCanvasText(ctx, 'expans\u00e3o radial', leftCenter.x, height - 42, {
            font: '700 12px Outfit',
            color: '#64748b',
            align: 'center'
        });

        const rightPath = [
            { x: width * 0.62, y: height * 0.72 },
            { x: width * 0.68, y: height * 0.62 },
            { x: width * 0.73, y: height * 0.54 },
            { x: width * 0.78, y: height * 0.42 },
            { x: width * 0.84, y: height * 0.26 }
        ];

        ctx.beginPath();
        ctx.moveTo(rightPath[0].x, rightPath[0].y);
        rightPath.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.stroke();

        const sideOffsets = [
            { x: -20, y: 18 },
            { x: 18, y: -10 },
            { x: -18, y: -14 },
            { x: 16, y: 12 }
        ];

        rightPath.forEach((point, index) => {
            drawCanvasCircle(ctx, point.x, point.y, index === rightPath.length - 1 ? 13 : 9, index === rightPath.length - 1 ? '#10b981' : 'rgba(79, 70, 229, 0.14)');
            if (index < sideOffsets.length) {
                drawCanvasCircle(
                    ctx,
                    point.x + sideOffsets[index].x,
                    point.y + sideOffsets[index].y,
                    5,
                    'rgba(79, 70, 229, 0.14)',
                    null,
                    0
                );
            }
        });

        const movingPoint = samplePath(rightPath, 0.16 + pulse * 0.72);
        drawCanvasCircle(ctx, movingPoint.x, movingPoint.y, 6, '#10b981', null, 0);

        drawCanvasText(ctx, 'expans\u00e3o guiada', width * 0.75, height - 42, {
            font: '700 12px Outfit',
            color: '#64748b',
            align: 'center'
        });

        const drift = Math.sin(time * 2.2) * 2;
        drawCanvasCircle(ctx, rightPath[0].x, rightPath[0].y + drift, 10, '#4f46e5');
    });

    mountCanvasScene('dense-network-canvas', ({ ctx, width, height, pulse }) => {
        const background = ctx.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#fbfdff');
        background.addColorStop(1, '#eef4ff');

        fillRoundRect(ctx, 18, 18, width - 36, height - 36, 24, background);
        strokeRoundRect(ctx, 18, 18, width - 36, height - 36, 24, 'rgba(148, 163, 184, 0.18)', 1.2);

        ctx.beginPath();
        ctx.moveTo(width / 2, 44);
        ctx.lineTo(width / 2, height - 44);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.stroke();

        fillRoundRect(ctx, 34, 34, 96, 28, 14, 'rgba(79, 70, 229, 0.08)');
        drawCanvasText(ctx, 'Dijkstra', 82, 48, {
            font: '700 12px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        fillRoundRect(ctx, width / 2 + 24, 34, 74, 28, 14, 'rgba(16, 185, 129, 0.10)');
        drawCanvasText(ctx, 'A*', width / 2 + 61, 48, {
            font: '700 12px Outfit',
            color: '#059669',
            align: 'center'
        });

        fillRoundRect(ctx, 34, 74, 104, 28, 14, 'rgba(79, 70, 229, 0.08)');
        drawCanvasText(ctx, '43 visitados', 86, 88, {
            font: '700 12px Outfit',
            color: '#4f46e5',
            align: 'center'
        });

        fillRoundRect(ctx, width / 2 + 24, 74, 88, 28, 14, 'rgba(16, 185, 129, 0.10)');
        drawCanvasText(ctx, '11 \u00fateis', width / 2 + 68, 88, {
            font: '700 12px Outfit',
            color: '#059669',
            align: 'center'
        });

        const leftGrid = {
            x: 44,
            y: 122,
            w: width * 0.34,
            h: height * 0.62
        };

        const rightGrid = {
            x: width / 2 + 24,
            y: 122,
            w: width * 0.34,
            h: height * 0.62
        };

        const leftHighlights = new Set([
            '0,0', '1,0', '2,0', '3,0', '4,0',
            '0,1', '1,1', '2,1', '3,1', '4,1', '5,1',
            '0,2', '1,2', '2,2', '3,2', '4,2', '5,2',
            '1,3', '2,3', '3,3', '4,3', '5,3',
            '2,4', '3,4', '4,4',
            '3,5'
        ]);

        const rightPathCells = [
            [0, 5], [1, 5], [2, 4], [3, 4], [4, 3], [5, 2], [6, 2], [7, 1]
        ];

        function drawDotMatrix(area, highlights, colorMode) {
            const cols = 8;
            const rows = 6;
            const stepX = area.w / (cols - 1);
            const stepY = area.h / (rows - 1);

            for (let row = 0; row < rows; row += 1) {
                for (let col = 0; col < cols; col += 1) {
                    const x = area.x + col * stepX;
                    const y = area.y + row * stepY;
                    const key = `${col},${row}`;
                    const isHighlight = highlights.has(key);

                    if (colorMode === 'dense') {
                        const opacity = isHighlight ? 0.18 + ((col + row) % 3) * 0.06 + pulse * 0.08 : 0.08;
                        drawCanvasCircle(ctx, x, y, isHighlight ? 6 : 4.5, `rgba(79, 70, 229, ${opacity})`, null, 0);
                    } else {
                        drawCanvasCircle(ctx, x, y, isHighlight ? 6 : 4.5, isHighlight ? 'rgba(16, 185, 129, 0.65)' : 'rgba(79, 70, 229, 0.08)', null, 0);
                    }
                }
            }
        }

        drawDotMatrix(leftGrid, leftHighlights, 'dense');

        const rightHighlights = new Set(rightPathCells.map(cell => `${cell[0]},${cell[1]}`));
        drawDotMatrix(rightGrid, rightHighlights, 'guided');

        const rightPathPoints = rightPathCells.map(([col, row]) => ({
            x: rightGrid.x + (rightGrid.w / 7) * col,
            y: rightGrid.y + (rightGrid.h / 5) * row
        }));

        ctx.beginPath();
        ctx.moveTo(rightPathPoints[0].x, rightPathPoints[0].y);
        rightPathPoints.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
        ctx.stroke();

        const rightPulsePoint = samplePath(rightPathPoints, 0.10 + pulse * 0.78);
        drawCanvasCircle(ctx, rightPulsePoint.x, rightPulsePoint.y, 6, '#10b981', null, 0);

        drawCanvasText(ctx, 'muitos n\u00f3s processados', leftGrid.x + leftGrid.w / 2, height - 30, {
            font: '700 12px Outfit',
            color: '#64748b',
            align: 'center'
        });

        drawCanvasText(ctx, 'poucos n\u00f3s relevantes', rightGrid.x + rightGrid.w / 2, height - 30, {
            font: '700 12px Outfit',
            color: '#64748b',
            align: 'center'
        });
    });
});
