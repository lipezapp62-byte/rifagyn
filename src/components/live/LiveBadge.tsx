export function LiveBadge() {
    return (
        <div className="flex items-start select-none leading-tight">

            {/* AO + VIVO */}
            <div className="flex flex-col mr-[4px] tracking-tight">

                {/* AO — light, mesma fonte do VIVO */}
                <span className="text-[12px] font-light text-[#c4c5c7] leading-[1]">
                    AO
                </span>

                {/* VIVO — bold, mesma fonte do AO */}
                <span className="text-[12px] font-bold text-[#ff6100] -mt-[2px] ml-[1px] leading-[1]">
                    VIVO
                </span>
            </div>

            {/* PONTO PULSANTE — versão 100% em pixels */}
            <span
                className="relative flex"
                style={{
                    height: "10px",     // equivalente ao h-2.5
                    width: "10px",      // equivalente ao w-2.5
                    marginTop: "2px",   // você ajusta como quiser ➜ ↑↓
                    marginLeft: "-13px"   // você ajusta como quiser ➜ ←→
                }}
            >

                {/* efeito ping */}
                <span
                    className="animate-ping absolute inline-flex rounded-full opacity-70"
                    style={{
                        height: "10px",
                        width: "10px",
                        backgroundColor: "#ff6100"
                    }}
                ></span>

                {/* ponto sólido */}
                <span
                    className="relative inline-flex rounded-full"
                    style={{
                        height: "7px",
                        width: "7px",
                        backgroundColor: "#ff6100"
                    }}
                ></span>
            </span>
        </div>
    );
}
