import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { userApi, getAuthToken, clearAuthToken } from "@/lib/api";
import { toast } from "sonner";
import {
  Ticket,
  ShoppingBag,
  TrendingUp,
  Calendar,
} from "lucide-react";

const DashboardApp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/auth/login");
      return;
    }

    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [ordersRes, historyRes] = await Promise.all([
        userApi.getOrders(),
        userApi.getHistory(),
      ]);

      setUserData({
        orders: ordersRes.orders || [],
        history: historyRes.history || [],
        stats: {
          totalTickets: historyRes.total_tickets || 0,
          totalSpent: historyRes.total_spent || 0,
          activeCampaigns: historyRes.active_campaigns || 0,
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userName="Usuário" />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao RifaGyn</h1>
          <p className="text-muted-foreground">
            Gerencie suas rifas e acompanhe seus pedidos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rifas Compradas</p>
                <p className="text-3xl font-bold">
                  {userData?.stats.totalTickets || 0}
                </p>
              </div>
              <Ticket className="w-6 h-6 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
                <p className="text-3xl font-bold">
                  R$ {userData?.stats.totalSpent?.toFixed(2) || "0.00"}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Campanhas Ativas
                </p>
                <p className="text-3xl font-bold">
                  {userData?.stats.activeCampaigns || 0}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Criar Nova Rifa</h3>
              <p className="text-sm text-muted-foreground">
                Inicie sua própria campanha
              </p>

              <Link to="/admin/NewCampaign">
                <Button className="w-full">Criar Rifa</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Meus Pedidos</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe os pagamentos
              </p>

              <Link to="/app/pedidos">
                <Button className="w-full">Ver Pedidos</Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Last Orders */}
        {userData.orders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Últimos Pedidos</h2>

            {userData.orders.slice(0, 5).map((order: any) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.campaign_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} cotas • R$
                      {Number(order.amount).toFixed(2)}
                    </p>
                  </div>

                  <Link to={`/app/pedidos/${order.id}`}>
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-8 border-t border-border">
          <Button variant="destructive" onClick={handleLogout}>
            Sair da Conta
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DashboardApp;
