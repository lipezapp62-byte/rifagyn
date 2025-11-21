import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Campaign {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  logo_url?: string;
  base_price: number;
  total_quotas: number;
  quotas_sold: number;
  quotas_available: number;
  status: string;
}

interface HomeData {
  highlight?: Campaign;
  campaigns: Campaign[];
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<HomeData | null>(null);

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

      <main className="container mx-auto px-4 py-8 space-y-12">

        {homeData?.highlight && (
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card-elevated via-card to-card-elevated border border-border p-8 md:p-12">
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm font-semibold text-primary">
                    🔥 Campanha em Destaque
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {homeData.highlight.title}
                </h1>

                {homeData.highlight.description && (
                  <p className="text-lg text-muted-foreground">
                    {homeData.highlight.description}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">A partir de</p>
                    <p className="text-3xl font-bold text-primary">
                      R$ {(homeData.highlight.base_price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <Link to={`/campanha/${homeData.highlight.id}`}>
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Participar agora
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex justify-center">
                {homeData.highlight.logo_url ? (
                  <img
                    src={homeData.highlight.logo_url}
                    alt={homeData.highlight.title}
                    className="w-full max-w-md rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="w-full max-w-md aspect-square rounded-xl bg-card-elevated border-2 border-primary/20 flex items-center justify-center">
                    <span className="text-8xl font-bold text-primary">R</span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-0" />
          </section>
        )}

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Campanhas em Destaque</h2>

          {homeData?.campaigns && homeData.campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeData.campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
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
      </main>

      <Footer />
    </div>
  );
};

export default Index;
