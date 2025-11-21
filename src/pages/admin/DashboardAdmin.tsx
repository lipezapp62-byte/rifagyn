import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { DashboardKpiCard } from "@/components/admin/DashboardKpiCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import { DollarSign, Users, Ticket, TrendingUp, Plus } from "lucide-react";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/auth/login");
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, campaignsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getMyCampaigns(),
      ]);

      setDashboardData({
        ...dashRes,
        campaigns: campaignsRes.campaigns || [],
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userName="Admin" />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">
              Visão geral das suas campanhas
            </p>
          </div>

          {/* 🔥 Rota correta */}
          <Link to="/admin/NewCampaign">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Campanha
            </Button>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardKpiCard
            title="Total Vendido"
            value={dashboardData?.total_sold || 0}
            icon={Ticket}
          />

          <DashboardKpiCard
            title="Valor Arrecadado"
            value={`R$ ${dashboardData?.total_revenue?.toFixed(2) || "0.00"}`}
            icon={DollarSign}
          />

          <DashboardKpiCard
            title="Total de Usuários"
            value={dashboardData?.total_users || 0}
            icon={Users}
          />

          <DashboardKpiCard
            title="Total de Campanhas"
            value={dashboardData?.total_campaigns || 0}
            icon={TrendingUp}
          />
        </div>

        {/* Recent Campaigns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Suas Campanhas</h2>

            <Link to="/admin/NewCampaign">
              <Button variant="outline">Criar Nova</Button>
            </Link>
          </div>

          {dashboardData?.campaigns?.length > 0 ? (
            <div className="grid gap-4">
              {dashboardData.campaigns.slice(0, 5).map((campaign: any) => (
                <Card key={campaign.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">
                        {campaign.title}
                      </h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>
                          {campaign.quotas_sold || 0} /{" "}
                          {campaign.total_quotas || 0} cotas vendidas
                        </span>
                        <span>•</span>
                        <span>
                          R${" "}
                          {(
                            (campaign.quotas_sold || 0) *
                            (campaign.base_price || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/admin/campanhas/${campaign.id}/editar`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>

                      <Link to={`/campanha/${campaign.slug || campaign.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Você ainda não criou nenhuma campanha
              </p>
              <Link to="/admin/NewCampaign">
                <Button>Criar Primeira Campanha</Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
