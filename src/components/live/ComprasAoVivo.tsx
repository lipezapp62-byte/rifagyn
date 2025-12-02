import { useEffect, useRef, useState } from "react";
import { LiveBadge } from "./LiveBadge";


// ---------------------------------------
// DADOS BASE (nomes + valores)
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

// ---------------------------------------
// HELPERS (sorteio + abreviação)
// ---------------------------------------
function sortearValorComPeso() {
    const pool: string[] = [];
    valores.forEach(v => {
        Array(v.peso).fill(null).forEach(() => pool.push(v.label));
    });
    return pool[Math.floor(Math.random() * pool.length)];
}

function mascararNome(nome: string) {
    const partes = nome.split(" ");

    if (partes.length < 2) return nome; // não quebra nomes com 1 parte

    const primeiroNome = partes[0];

    // encontra o primeiro sobrenome “real”
    // ignora partículas como "da", "de", "do", "das", "dos"
    const ignorar = ["da", "de", "do", "das", "dos"];
    let indexSobrenome = 1;

    while (indexSobrenome < partes.length && ignorar.includes(partes[indexSobrenome].toLowerCase())) {
        indexSobrenome++;
    }

    const sobrenome = partes[indexSobrenome] || "";

    // pega as duas primeiras letras do sobrenome real
    const primeiras = sobrenome.slice(0, 2);

    // quantas letras sobram pra mascarar?
    const maskCount = Math.max(sobrenome.length - 2, 3); // mínimo 3 estrelas

    const masked = primeiras + "*".repeat(maskCount);

    // monta o nome final (preservando partículas)
    const prefixos = partes.slice(1, indexSobrenome).join(" ");

    const final =
        prefixos.length > 0
            ? `${primeiroNome} ${prefixos} ${masked}`
            : `${primeiroNome} ${masked}`;

    return final;
}

function gerarCompra() {
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    return {
        nome: mascararNome(nome),
        valor: sortearValorComPeso()
    };
}


// ---------------------------------------
// COMPONENTE PRINCIPAL — ComprasAoVivo
// ---------------------------------------
export function ComprasAoVivo() {
    // Lista base gerada só uma vez (não muda no meio da animação)
    const [compras] = useState(() =>
        Array.from({ length: 12 }, () => gerarCompra())
    );

    // Duplicamos a lista para permitir loop infinito
    const itens = [...compras, ...compras];

    // Track é a faixa que será movida com translateX
    const trackRef = useRef<HTMLDivElement>(null);

    // ---------------------------------------
    // AUTO-SCROLL PULANDO CARD POR CARD
    // ---------------------------------------
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        // pegamos a largura real do primeiro card
        const primeiroCard = track.querySelector<HTMLDivElement>("[data-card]");
        if (!primeiroCard) return;

        const gapPx = 16; // gap-4 (4 * 4px)
        const cardWidth = primeiroCard.getBoundingClientRect().width + gapPx;

        let index = 0;
        const totalBase = compras.length; // só a metade "real"

        const tick = () => {
            index += 1;

            // anima o pulo
            track.style.transition = "transform 0.5s ease-out";
            track.style.transform = `translateX(-${index * cardWidth}px)`;

            // quando percorreu a lista base inteira, reseta invisível
            if (index >= totalBase) {
                setTimeout(() => {
                    track.style.transition = "none";
                    track.style.transform = "translateX(0px)";
                    index = 0;
                }, 520); // um pouco mais que o tempo da transition
            }
        };

        const timer = setInterval(tick, 1700); // tempo entre pulos
        return () => clearInterval(timer);
    }, [compras.length]);

    return (
        <div
            className="
            bg-card 
            rounded-xl 
            pl-2 pr-3 py-3   /* AO VIVO mais perto da borda */
            flex items-center 
            gap-2            /* mais espaço para os cards */
            overflow-hidden 
            shadow-md
        "
        >
            {/* INDICADOR AO VIVO */}
            <LiveBadge />

            {/* WRAPPER DO CARROSSEL */}
            <div className="flex-1 overflow-hidden">
                {/* TRACK ANIMADO */}
                <div
                    ref={trackRef}
                    className="flex gap-4"
                    style={{ willChange: "transform" }}
                >
                    {itens.map((c, i) => (
                        // CARD DE COMPRA (slot)
                        <div
                            key={`${c.nome}-${i}`}
                            data-card
                            className="
                            bg-card
                            border border-border 
                            rounded-md
                            px-3 py-2
                            min-w-[130px]
                            flex-shrink-0
                            shadow-sm
                        "
                        >
                            <div className="text-[#ff6100] font-bold text-[11px]">
                                {c.nome}
                            </div>

                            <div className="text-muted-foreground text-[10px] -mt-[2px]">
                                comprou
                            </div>

                            <div className="text-white text-[13px] font-bold mt-[2px]">
                                {c.valor}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

}
