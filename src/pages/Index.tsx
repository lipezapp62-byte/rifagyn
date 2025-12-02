import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/SearchBar";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ComprasAoVivo } from "@/components/live/ComprasAoVivo";


interface BackendCampaign {
  price_base: number;
  id: string;
  slug?: string;
  title: string;
  description?: string;
  image_url?: string[];
  logo_url?: string;
  base_price: number;
  total_quotas: number;
  quotas_sold: number;
  quotas_available: number;
  status: string;
}

interface HomeData {
  highlight?: BackendCampaign;
  campaigns: BackendCampaign[];
}

// 🔥 Converter backend -> formato que o CampaignCard espera
function normalizeCampaign(c: BackendCampaign) {
  return {
    id: c.id,
    title: c.title,
    description: c.description ?? "",
    image_url: Array.isArray(c.image_url)
      ? c.image_url
      : c.logo_url
        ? [c.logo_url]
        : [],
    price_base: c.price_base ?? 0, // ✅ CORRETO
    total_quotas: c.total_quotas ?? 0,
    quotas_sold: c.quotas_sold ?? 0,
  };
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const data = await publicApi.getAppHome();
      setHomeData(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-12">
            <Skeleton className="h-96 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg space-y-12">

          {/* ============================
            🔥 Destaque estilo RaspaGreen
        ============================ */}

          {/* AO VIVO */}
          <div className="w-full">
            <ComprasAoVivo />
          </div>

          {/* BARRA DE PESQUISA */}
          <div className="w-full mt-4">
            <SearchBar
              campaigns={homeData?.campaigns || []}
              onSelect={(item) => navigate(`/campanha/${item.id}`)}
            />
          </div>

          {homeData?.highlight && (
            <section className="relative rounded-2xl overflow-hidden border border-border bg-card">

              {/* IMAGEM PRINCIPAL */}
              <div className="relative w-full h-56 md:h-72 overflow-hidden">
                <img
                  src={
                    homeData.highlight.image_url?.[0] ||
                    homeData.highlight.logo_url
                  }
                  alt={homeData.highlight.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>

              <div className="p-5 space-y-4">

                <h1 className="text-2xl font-bold text-white">
                  {homeData.highlight.title}
                </h1>

                {homeData.highlight.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {homeData.highlight.description}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">A partir de</p>
                  <p className="text-2xl font-extrabold text-[#ff6100]">
                    R$ {(homeData.highlight.base_price || 0).toFixed(2)}
                  </p>
                </div>

                <Link to={`/campanha/${homeData.highlight.id}`}>
                  <Button className="w-full bg-[#ff6100] text-white hover:bg-[#ff7a1a] text-lg py-6 rounded-xl">
                    Participar agora
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {/* ============================
            ✨ LISTA DE CAMPANHAS
        ============================ */}
          <section className="space-y-6">
            {homeData?.campaigns && homeData.campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeData.campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={normalizeCampaign(campaign)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma campanha disponível no momento.
                </p>
              </div>
            )}
          </section>
        </div>
      </main >


      <Footer />
    </div >
  );
};

export default Index;
