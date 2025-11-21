import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CampaignProgress } from "@/components/campaign/CampaignProgress";
import { CombosGrid } from "@/components/campaign/CombosGrid";
import { QuantitySelector } from "@/components/campaign/QuantitySelector";
import { NumberGrid } from "@/components/campaign/NumberGrid";
import { PixPaymentPanel } from "@/components/orders/PixPaymentPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi, userApi } from "@/lib/api";
import { toast } from "sonner";
import { Calendar, ChevronDown, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CampaignPage = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [combos, setCombos] = useState<any[]>([]);
  const [rules, setRules] = useState("");
  const [numbers, setNumbers] = useState<any[]>([]);
  const [selectedComboId, setSelectedComboId] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [showRules, setShowRules] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    if (id) loadCampaignData();
  }, [id]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);

      const [summaryRes, combosRes, rulesRes, numbersRes] = await Promise.all([
        publicApi.getCampaignSummary(id!),
        publicApi.getCampaignCombos(id!),
        publicApi.getCampaignRules(id!),
        publicApi.getCampaignFreeNumbers(id!).catch(() => ({ free_numbers: [] })),
      ]);

      const raw =
        summaryRes?.campaign ||
        (Array.isArray(summaryRes) ? summaryRes[0] : summaryRes);

      const normalized = {
        id: raw.id,
        title: raw.title,
        description: raw.description || "",
        logo_url: raw.image_url || null,
        base_price: raw.price_base || 0,
        total_quotas: raw.total_quotas || 0,
        quotas_sold: raw.quotas_sold || 0,
        quotas_available: raw.quotas_available || 0,
        draw_date: raw.draw_date || null,
      };

      setCampaign(normalized);

      const normalizedCombos = (combosRes.combos || []).map((c: any, index: number) => ({
        id: `${index}`,
        quantity: c.qty,
        price: c.price,
        discount: c.discount,
        popular: c.popular || false,
      }));

      setCombos(normalizedCombos);
      setRules(rulesRes.rules || "");

      if (numbersRes.free_numbers) {
        setNumbers(
          numbersRes.free_numbers.map((n: number) => ({
            number: n,
            status: "available",
          }))
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar campanha");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCombo = (combo: any) => {
    setSelectedComboId(combo.id);
    setQuantity(combo.quantity);
  };

  const calculateTotal = () => {
    const combo = combos.find((c) => c.id === selectedComboId);
    if (combo) return combo.price;

    return campaign ? quantity * campaign.base_price : 0;
  };

  const handleCreateOrder = async () => {
    if (!campaign) return;

    try {
      setCreatingOrder(true);
      const response = await userApi.createOrder({
        campaign_id: campaign.id,
        quantity,
        combo_id: selectedComboId,
      });

      setOrderData(response.order);
      toast.success("Pedido criado! Complete o pagamento PIX");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pedido");
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Campanha não encontrada</h2>
            <p className="text-muted-foreground">
              Esta campanha não existe ou foi removida.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">

        {/* ==================== */}
        {/*   COVER / BANNER     */}
        {/* ==================== */}
        <div className="w-full max-w-4xl mx-auto">
          <div
            className="relative w-full rounded-2xl overflow-hidden bg-card-elevated border border-border"
            style={{ aspectRatio: "1080 / 650" }}
          >
            {campaign.logo_url ? (
              <img
                src={campaign.logo_url}
                alt={campaign.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-primary text-5xl font-bold bg-card">
                R
              </div>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Pública</Badge>
            <Badge className="bg-paid">Ativa</Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">{campaign.title}</h1>

          {campaign.description && (
            <p className="text-lg text-muted-foreground">
              {campaign.description}
            </p>
          )}

          {campaign.draw_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span>
                Sorteio em{" "}
                {format(
                  new Date(campaign.draw_date),
                  "dd/MM/yyyy 'às' HH:mm'h'",
                  { locale: ptBR }
                )}
              </span>
            </div>
          )}
        </div>

        {/* PROGRESS */}
        <CampaignProgress
          totalQuotas={campaign.total_quotas}
          quotasSold={campaign.quotas_sold}
          quotasAvailable={campaign.quotas_available}
        />

        {/* PAYMENT */}
        {orderData && (
          <PixPaymentPanel
            orderId={orderData.id}
            campaignName={campaign.title}
            amount={orderData.amount}
            pixCode={orderData.pix_code}
            qrCodeBase64={orderData.qr_code}
            status={orderData.status}
            expiresAt={orderData.expires_at}
          />
        )}

        {/* PARTICIPATION / COMBOS */}
        {!orderData && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Escolha sua participação</h2>
              <p className="text-muted-foreground">
                Selecione um dos combos ou escolha a quantidade desejada
              </p>
            </div>

            <CombosGrid
              combos={combos}
              selectedComboId={selectedComboId}
              onSelectCombo={handleSelectCombo}
            />

            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              min={1}
              max={campaign.quotas_available}
              basePrice={campaign.base_price}
            />

            <Card className="p-6 bg-card-elevated border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Você está comprando</p>
                  <p className="text-2xl font-bold">
                    {quantity} {quantity === 1 ? "cota" : "cotas"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold text-primary">
                    R$ {calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCreateOrder}
                disabled={creatingOrder || quantity < 1}
              >
                <ShoppingCart className="w-5 h-5" />
                {creatingOrder ? "Processando..." : "Prosseguir para pagamento"}
              </Button>
            </Card>
          </div>
        )}

        {/* FREE NUMBERS */}
        {numbers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Números da campanha</h2>
            <NumberGrid numbers={numbers} />
          </div>
        )}

        {/* RULES */}
        {rules && (
          <Card className="p-6">
            <button
              onClick={() => setShowRules(!showRules)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-xl font-bold">Regras da campanha</h3>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showRules ? "rotate-180" : ""
                  }`}
              />
            </button>

            {showRules && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-muted-foreground whitespace-pre-line">{rules}</p>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default CampaignPage;
