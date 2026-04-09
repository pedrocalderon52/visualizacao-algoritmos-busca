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
        
        // Calcula a posição do mouse relativa ao centro da tela
        const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
        
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
});
