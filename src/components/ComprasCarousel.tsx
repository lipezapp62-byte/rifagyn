import { useEffect, useRef, useState } from "react";

// ---------------------------------------
// DADOS
// ---------------------------------------
const nomes = [
    "João Silva", "Maria Ferreira", "Carlos Souza", "Ana Oliveira",
    "Pedro Martins", "Juliana Rocha", "Lucas Mendes", "Amanda Lima",
    "Gabriel Costa", "Fernanda Almeida", "Rafael Dias", "Patrícia Santos",
    "Bruno Lima", "Camila Souza", "Diego Pereira", "Larissa Nunes",
    "Mariana Alves", "Felipe Cunha", "Renata Gomes", "Thiago Rocha",
    "Beatriz Lima", "Eduardo Silva", "Isabela Fernandes", "Matheus Costa",
    "Camila Rodrigues", "Gustavo Martins", "Sofia Almeida", "Luiz Henrique",
    "Amanda Souza", "Bruno Pereira", "Cláudia Santos", "Ricardo Oliveira",
    "Aline Carvalho", "Vitor Barbosa", "Letícia Moreira", "Daniela Ramos",
    "Marcelo Teixeira", "Juliana Silva", "Henrique Gonçalves", "Paula Duarte",
    "Fábio Ribeiro", "Carla Fernandes", "André Souza", "Lorena Castro",
    "Caio Santana", "Tatiana Lopes", "Vinicius Almeida", "Bianca Costa",
    "Leonardo Nascimento", "Sabrina Moura", "Rodrigo Farias", "Larissa Melo",
    "Thiago Almeida", "Daniele Pereira", "Gustavo Silva", "Jéssica Moraes",
    "Bruno Lima", "Fernanda Ribeiro", "Carlos Henrique", "Marcela Souza",
    "Rafael Santos", "Patrícia Lima", "Renato Oliveira", "Daniela Campos",
    "Alexandre Martins", "Juliana Rocha", "Felipe Almeida", "Caroline Silva",
    "Eduardo Gomes", "Camila Santos", "Diego Oliveira", "Bruna Costa",
    "Lucas Fernandes", "Marina Ribeiro", "Felipe Souza", "Letícia Nunes",
    "Ricardo Almeida", "Natália Pereira", "Anderson Santos", "Vanessa Lima",
    "Marcelo Costa", "Tatiane Rocha", "Rodrigo Silva", "Ana Paula Santos"
];

// Valores com pesos (menores aparecem mais)
const valores = [
    { label: "R$10,00", peso: 5 },
    { label: "R$12,00", peso: 4 },
    { label: "R$15,00", peso: 3 },
    { label: "R$20,00", peso: 2 },
    { label: "R$35,00", peso: 1 },
    { label: "R$50,00", peso: 1 },
    { label: "R$78,00", peso: 1 },
    { label: "R$100,00", peso: 1 },
];

function sortearValorComPeso() {
    const pool: string[] = [];
    valores.forEach(v => Array(v.peso).fill(null).forEach(() => pool.push(v.label)));
    return pool[Math.floor(Math.random() * pool.length)];
}

function abreviarNome(nome: string) {
    const partes = nome.split(" ");
    return `${partes[0]} ${partes[1][0].toUpperCase()}.`;
}

function gerarCompra() {
    const nome = pegarNomeUnico(); // agora é SEM repetição
    return {
        nome: abreviarNome(nome),
        valor: sortearValorComPeso(),
    };
}


// ---------------------------------------
// COMPONENTE AO VIVO
// ---------------------------------------
function LiveBadge() {
    return (
        <div className="flex items-center gap-2 select-none flex-shrink-0">
            <div className="h-8 w-8 flex items-center justify-center animate-pulse-fast">

                {/* Ícone AO VIVO minimalista */}
                <svg
                    viewBox="0 0 59 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                >
                    <circle cx="39" cy="20" r="4" fill="#ff6100" />
                    <circle cx="20" cy="40" r="3" fill="#ff6100" />
                </svg>
            </div>

            <span className="text-[#ff6100] font-bold text-sm tracking-wider">
                AO VIVO
            </span>
        </div>
    );
}

// Fila embaralhada para não repetir até terminar todos
let filaNomes: string[] = [];

// Embaralha usando Fisher-Yates (100% random de verdade)
function embaralhar(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Retorna um nome SEM repetir até acabar todos
function pegarNomeUnico() {
    if (filaNomes.length === 0) {
        filaNomes = [...nomes];
        embaralhar(filaNomes);
    }
    return filaNomes.shift()!; // garante que retorne 1 único nome
}

// ---------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------
export function ComprasAoVivo() {
    const [compras, setCompras] = useState(() =>
        Array.from({ length: 10 }, () => gerarCompra())
    );

    const containerRef = useRef<HTMLDivElement>(null);

    // Adiciona compras de tempos em tempos
    useEffect(() => {
        const i = setInterval(() => {
            setCompras((prev) => {
                const nova = gerarCompra();
                const lista = [...prev, nova];
                if (lista.length > 25) lista.shift();
                return lista;
            });
        }, 3000);

        return () => clearInterval(i);
    }, []);

    // Scroll automático infinito
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let anim: number;
        const loop = () => {
            el.scrollLeft += 1.2;
            if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
                el.scrollLeft = 0;
            }
            anim = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(anim);
    }, []);

    return (
        <div
            className="
            bg-card 
            border border-border 
            rounded-xl 
            p-3 
            flex items-center gap-4 
            overflow-hidden 
            shadow-md
        "
        >
            <LiveBadge />

            <div
                ref={containerRef}
                className="flex gap-4 overflow-x-auto no-scrollbar flex-1"
                style={{ scrollBehavior: "smooth" }}
            >
                {compras.map((c, i) => (
                    <div
                        key={i}
                        className="
                        bg-[#0a0c0a]
                        border border-border 
                        rounded-lg 
                        px-4 py-3 
                        min-w-[170px] 
                        flex-shrink-0 
                        shadow-sm
                    "
                    >
                        <div className="text-[#ff6100] font-bold text-sm">{c.nome}</div>
                        <div className="text-muted-foreground text-xs">comprou</div>
                        <div className="text-white text-base font-bold mt-1">{c.valor}</div>
                    </div>
                ))}
            </div>
        </div>
    );

}
