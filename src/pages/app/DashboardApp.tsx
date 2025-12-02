import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { UserTicketsModal } from "@/components/tickets/UserTicketsModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext"; // adiciona isso
import { userApi, getAuthToken, clearAuthToken, getMyTickets } from "@/lib/api";
import { toast } from "sonner";
import {
  Ticket,
  ShoppingBag,
  TrendingUp,
  Calendar,
} from "lucide-react";

console.log("🔥 DashboardApp carregou");
console.log("TOKEN:", getAuthToken());

const DashboardApp = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // 🔥 Modal de números
  const [ticketsModalOpen, setTicketsModalOpen] = useState(false);
  const [userTickets, setUserTickets] = useState<any>([]);


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
      toast.error(error.message || "Erro ao carregar dados", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // ✅ CONECTADO NO SEU ENDPOINT
  const handleViewNumbers = async () => {
    try {
      const res = await getMyTickets();

      console.log("🎟️ NÚMEROS DO USUÁRIO:", res.tickets);
      setUserTickets(res.tickets || []);
      setTicketsModalOpen(true);
    } catch (err: any) {
      console.error("ERRO:", err);
      toast.error("Erro ao buscar seus números", { duration: 3000 });
    }
  };

  const { logout } = useAuth(); // puxa o logout do contexto

  const handleLogout = () => {
    logout(); // ✅ avisa o contexto
    toast.success("Logout realizado com sucesso", { duration: 3000 });
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
          <h1 className="text-3xl font-bold mb-2">Painel de controle</h1>
          <p className="text-muted-foreground">
            Gerencie, crie rifas e acompanhe seus pedidos em tempo real
          </p>
        </div>

        {/* Last Orders */}
        {userData?.orders?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ver meus números</h2>

            {userData.orders.slice(0, 5).map((order: any) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {order.campaign_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} cotas • R${" "}
                      {Number(order.amount).toFixed(2)}
                    </p>
                  </div>

                  {/* 🔥 BOTÃO DIRETO NO ENDPOINT */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewNumbers}
                  >
                    Meus Números
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ✅ CRIAR RIFA — INTACTO */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Criar Nova Rifa</h3>
              <p className="text-sm text-muted-foreground">
                Inicie sua própria campanha
              </p>

              <Link to="/admin/NewCampaign">
                <Button className="w-full mt-2">Criar Rifa</Button>
              </Link>
            </div>
          </Card>

          {/* ✅ MINHAS RIFAS — INTACTO */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Minhas Rifas</h3>
              <p className="text-sm text-muted-foreground">
                Acesse suas campanhas ativas
              </p>

              <Link to="/app/pedidos">
                <Button className="w-full mt-2">Ver Rifas</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="pt-8 border-t border-border">
          <Button variant="destructive" onClick={handleLogout}>
            Sair da Conta
          </Button>
        </div>
      </main>

      {/* ✅ MODAL GLOBAL DOS NÚMEROS */}
      <UserTicketsModal
        open={ticketsModalOpen}
        onClose={() => setTicketsModalOpen(false)}
        tickets={userTickets}
      />
    </div>
  );
};

export default DashboardApp;
