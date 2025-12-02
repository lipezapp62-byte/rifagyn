// PARTE 1/3

import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { NumberGrid } from "@/components/campaign/NumberGrid";
import { PixPaymentPanel } from "@/components/orders/PixPaymentPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";
import { Calendar, ChevronDown, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { saveLastCampaign } from "@/lib/lastCampaign";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignProgress } from "@/components/campaign/CampaignProgress";

interface Campaign {
  id: string;
  title: string;
  description?: string;
  image_url?: string | string[] | null;
  base_price: number;
  total_quotas: number;
  quotas_sold: number;
  quotas_available: number;
  draw_date?: string | null;
  min_quotas: number;
  show_sold: boolean;
  show_draw_date: boolean;
  slug: string;
}

interface UiCombo {
  id: string;
  label: string;
  bonusQuotas: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  popular?: boolean;
  timesSelected: number;
}

const CampaignPage = () => {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [rules, setRules] = useState("");
  const [numbers, setNumbers] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const [bonusCombos, setBonusCombos] = useState<UiCombo[]>([]);
  const [isManualNumbers, setIsManualNumbers] = useState(false);
  const [showChangeNumbersDialog, setShowChangeNumbersDialog] =
    useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderLoaded, setSliderLoaded] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");

  const [showPixModal, setShowPixModal] = useState(false);

  const autoplayPlugin = (slider: any) => {
    let timeout: number;
    let mouseOver = false;

    function clearNextTimeout() {
      window.clearTimeout(timeout);
    }

    function nextTimeout() {
      clearNextTimeout();
      if (mouseOver) return;
      timeout = window.setTimeout(() => slider.next(), 3000);
    }

    slider.on("created", () => {
      slider.container.addEventListener("mouseover", () => {
        mouseOver = true;
        clearNextTimeout();
      });

      slider.container.addEventListener("mouseout", () => {
        mouseOver = false;
        nextTimeout();
      });

      nextTimeout();
    });

    slider.on("dragStarted", clearNextTimeout);
    slider.on("animationEnded", nextTimeout);
    slider.on("updated", nextTimeout);
  };

  const formatWhatsapp = (value: string) => {
    // remove tudo que não for número
    let digits = value.replace(/\D/g, "");

    // força começar com 55 (Brasil), se quiser remover isso, apague esse bloco
    // if (!digits.startsWith("55")) digits = "55" + digits;

    // limita a 11 dígitos (DDD + 9 + número)
    digits = digits.slice(0, 11);

    // aplica máscara: (DD) 9XXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;

    return digits;
  };

  const [sliderRef, sliderInstanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setSliderLoaded(true);
      },
    },
    [autoplayPlugin]
  );

  useEffect(() => {
    if (slug) loadCampaignData();
  }, [slug]);

  useEffect(() => {
    if (slug) {
      loadCampaignData();

      // salva o link atual da campanha
      saveLastCampaign(window.location.pathname + window.location.search);
    }
  }, [slug]);

  useEffect(() => {
    if (sliderInstanceRef.current && images.length > 0) {
      sliderInstanceRef.current.update();
    }
  }, [images, sliderInstanceRef]);


  const loadCampaignData = async () => {
    try {
      setLoading(true);

      const [summaryRes, combosRes, rulesRes, numbersRes] =
        await Promise.all([
          publicApi.getCampaignSummary(slug!),
          publicApi.getCampaignCombos(slug!),
          publicApi.getCampaignRules(slug!),
          publicApi
            .getCampaignFreeNumbers(slug!)
            .catch(() => ({ free_numbers: [] })),
        ]);

      const raw = summaryRes.campaign;
      const rawImage = raw.image_url ?? raw.images ?? null;

      let parsedImages: string[] = [];

      if (Array.isArray(rawImage)) {
        parsedImages = rawImage;
      } else if (typeof rawImage === "string") {
        if (rawImage.trim().startsWith("[")) {
          try {
            parsedImages = JSON.parse(rawImage);
          } catch {
            parsedImages = [rawImage];
          }
        } else if (rawImage.trim()) {
          parsedImages = [rawImage];
        }
      }

      setImages(parsedImages);

      const normalizedCampaign: Campaign = {
        id: raw.id,
        slug: raw.slug,
        title: raw.title,
        description: raw.description || "",
        image_url: rawImage,
        base_price: raw.price_base || 0,
        total_quotas: raw.total_quotas || 0,
        quotas_sold: raw.quotas_sold || 0,
        quotas_available: raw.quotas_available || 0,
        draw_date: raw.draw_date || null,
        min_quotas: raw.min_quotas || 0,

        // 🔥 DESATIVADO COMPLETAMENTE
        show_sold: false,

        show_draw_date: raw.show_draw_date ?? !!raw.draw_date,
      };

      setCampaign(normalizedCampaign);

      const uiCombos: UiCombo[] = (combosRes.combos || []).map(
        (c: any, index: number) => {
          const bonusQuotas = c.qty || 0;
          const discountedPrice = c.price || 0;
          const originalPrice = normalizedCampaign.base_price * bonusQuotas;

          const discountPercent =
            originalPrice > 0
              ? Math.round((1 - discountedPrice / originalPrice) * 100)
              : 0;

          return {
            id: `${index}`,
            label: `+${bonusQuotas} cotas`,
            bonusQuotas,
            originalPrice,
            discountedPrice,
            discountPercent,
            popular: !!c.popular,
            timesSelected: 0,
          };
        }
      );

      setBonusCombos(uiCombos);

      setRules(rulesRes.rules || "");

      if (numbersRes.free_numbers) {
        setNumbers(
          numbersRes.free_numbers.map((n: number) => ({
            number: n,
            status: "available",
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar campanha:", error);
      toast.error("Erro ao carregar campanha");
    } finally {
      setLoading(false);
    }
  };

  const {
    minQuotas,
    bonusQuotasTotal,
    totalQuotas,
    baseAmount,
    bonusAmount,
    totalAmount,
  } = useMemo(() => {
    if (!campaign) {
      return {
        minQuotas: 0,
        bonusQuotasTotal: 0,
        totalQuotas: 0,
        baseAmount: 0,
        bonusAmount: 0,
        totalAmount: 0,
      };
    }

    const min = campaign.min_quotas || 0;

    const bonusTotal = bonusCombos.reduce(
      (sum, combo) => sum + combo.bonusQuotas * combo.timesSelected,
      0
    );

    const baseValue = min * campaign.base_price;

    const bonusValue = bonusCombos.reduce(
      (sum, combo) => sum + combo.discountedPrice * combo.timesSelected,
      0
    );

    return {
      minQuotas: min,
      bonusQuotasTotal: bonusTotal,
      totalQuotas: min + bonusTotal,
      baseAmount: baseValue,
      bonusAmount: bonusValue,
      totalAmount: baseValue + bonusValue,
    };
  }, [campaign, bonusCombos]);

  const handleConfirmChangeNumbers = () => {
    setBonusCombos((prev) => prev.map((c) => ({ ...c, timesSelected: 0 })));
    setIsManualNumbers(true);
    setShowChangeNumbersDialog(false);
    toast.success("Agora você pode escolher seus números manualmente.");
  };

  const handleCreateOrder = async () => {
    if (!campaign) return;

    if (!buyerName.trim()) {
      toast.error("Informe seu nome.");
      return;
    }

    if (!buyerWhatsapp.trim()) {
      toast.error("Informe seu WhatsApp.");
      return;
    }

    try {
      setCreatingOrder(true);

      let finalQuantity = totalQuotas;
      if (finalQuantity < minQuotas) finalQuantity = minQuotas;

      if (finalQuantity <= 0) {
        toast.error("Defina uma quantidade de cotas para participar.");
        return;
      }

      const payload = {
        campaign_id: campaign.id,
        buyer_name: buyerName.trim(),
        buyer_whatsapp: buyerWhatsapp.replace(/\D/g, ""),
        qty: finalQuantity,
      };

      const res = await fetch(
        "https://criadordigital-n8n-webhook.tw9mqd.easypanel.host/webhook/rifagyn/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        console.error("Erro checkout:", data);
        toast.error("Erro ao criar pedido de pagamento.");
        return;
      }

      const order = (data as any).order ?? data;

      setOrderData(order);
      setShowPixModal(true);

      toast.success("Pedido criado! Complete o pagamento PIX.");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar pedido");
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
        {/* CARROSSEL (NÃO ALTERAR) */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative w-full aspect-[1080/650] rounded-2xl overflow-hidden bg-card-elevated border border-border">
            {images.length > 0 ? (
              <div ref={sliderRef} className="keen-slider h-full">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="keen-slider__slide"
                    onClick={() => setZoomImage(src)}
                  >
                    <img
                      src={src}
                      alt={`Imagem ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onError={(e) => {
                        console.error("Erro ao carregar imagem:", src);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-primary text-5xl font-bold bg-card">
                R
              </div>
            )}
          </div>

          {sliderLoaded && images.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => sliderInstanceRef.current?.moveToIdx(idx)}
                  className={`h-2 w-2 rounded-full transition-colors ${idx === currentSlide ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                />
              ))}
            </div>
          )}
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

          {/* DATA DO SORTEIO */}
          {campaign.draw_date && (campaign.show_draw_date ?? true) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span>
                Sorteio em{" "}
                {format(new Date(campaign.draw_date), "dd/MM/yyyy 'às' HH:mm'h'", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>

        {/* PROGRESSO — DESATIVADO POR COMPLETO */}
        {/* (Não apagar o código, apenas completamente desativado) */}
        {false && campaign.show_sold && (
          <CampaignProgress
            totalQuotas={campaign.total_quotas}
            quotasSold={campaign.quotas_sold}
            quotasAvailable={campaign.quotas_available}
          />
        )}

        {/* COMBOS + TOTAL — SOMENTE SE NÃO FEZ O PEDIDO */}
        {!orderData && (
          <div className="space-y-8">
            {bonusCombos.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">Ofertas Bônus🔥</h2>
                  <p className="text-sm text-muted-foreground">
                    Aumente suas chances com as promoções!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bonusCombos.map((combo) => (
                    <Card
                      key={combo.id}
                      className={`relative p-4 flex flex-col justify-between transition-all overflow-hidden
              ${combo.bonusQuotas === 200
                          ? "border-0 shadow-lg scale-[1.02] combo-animated-border"
                          : combo.popular
                            ? "border border-border shadow-md"
                            : "border border-border"
                        }
              ${isManualNumbers
                          ? "opacity-60 pointer-events-none"
                          : "hover:scale-[1.01]"
                        }`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-semibold ${combo.bonusQuotas === 200
                                ? "text-orange-500 tracking-wide"
                                : ""
                                }`}
                            >
                              {combo.label}
                            </span>

                            {combo.discountPercent > 0 && (
                              <Badge
                                variant="outline"
                                className="text-[11px] border-green-500/60 text-green-600"
                              >
                                -{combo.discountPercent}%
                              </Badge>
                            )}
                          </div>

                          {combo.bonusQuotas === 200 && (
                            <p className="text-[13px] text-orange-500 font-bold flex items-center gap-1">
                              🔥 Maior vantagem
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            de R$ {combo.originalPrice.toFixed(2)}
                          </p>

                          <p
                            className={`text-lg font-bold ${combo.bonusQuotas === 200
                              ? "text-orange-500"
                              : "text-primary"
                              }`}
                          >
                            por R$ {combo.discountedPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>Selecionado:</span>
                          <span className="font-semibold text-foreground">
                            {combo.timesSelected}x
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              if (combo.timesSelected > 0) {
                                setBonusCombos((prev) =>
                                  prev.map((c) =>
                                    c.id === combo.id
                                      ? {
                                        ...c,
                                        timesSelected: c.timesSelected - 1,
                                      }
                                      : c
                                  )
                                );
                              }
                            }}
                          >
                            -
                          </Button>

                          <Button
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setBonusCombos((prev) =>
                                prev.map((c) =>
                                  c.id === combo.id
                                    ? {
                                      ...c,
                                      timesSelected: c.timesSelected + 1,
                                    }
                                    : c
                                )
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* TOTAL + DADOS DO COMPRADOR */}
            <Card className="p-6 bg-card-elevated border-2 border-primary/20">

              {/* Mensagem destacada */}
              <div className="mb-4 text-center">
                <p className="text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg py-2 px-3">
                  Você não precisará preencher essas informações novamente!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <Label>Seu nome</Label>
                  <Input
                    placeholder="Digite seu nome"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>WhatsApp</Label>
                  <Input
                    placeholder="(62) 9XXXX-XXXX"
                    value={buyerWhatsapp}
                    onChange={(e) => setBuyerWhatsapp(formatWhatsapp(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Você está comprando</p>

                  <p className="text-2xl font-bold">
                    {totalQuotas} {totalQuotas === 1 ? "cota" : "cotas"}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    {minQuotas} mínima(s) + {bonusQuotasTotal} bônus
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>

                  <p className="text-3xl font-bold text-primary">
                    R$ {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCreateOrder}
                disabled={creatingOrder || totalQuotas <= 0}
              >
                <ShoppingCart className="w-5 h-5" />
                {creatingOrder ? "Processando..." : "Prosseguir"}
              </Button>
            </Card>
          </div>
        )}

        {/* NÚMEROS DA CAMPANHA */}
        {numbers.length > 0 && (
          <div className="space-y-4 pb-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">Números da campanha</h2>

              <Button
                variant={isManualNumbers ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  if (!isManualNumbers) setShowChangeNumbersDialog(true);
                }}
              >
                {isManualNumbers
                  ? "Escolha manual ativada"
                  : "Escolher números manualmente"}
              </Button>
            </div>

            <NumberGrid numbers={numbers} />
          </div>
        )}

        {/* REGRAS */}
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

      {/* POPUP PIX — AGORA MENOR */}
      {orderData && showPixModal && (
        <PixPaymentPanel
          orderId={orderData.order_id ?? orderData.id}
          amount={Number(orderData.amount ?? orderData.total ?? orderData.value ?? 0)}
          pixCode={orderData.qr_code ?? orderData.pixCopiaCola ?? orderData.pix ?? ""}
          qrCodeBase64={orderData.pix_qrcode_base64 ?? orderData.qrCodeBase64 ?? ""}
          status={orderData.status ?? "pending"}
          expiresAt={
            orderData.expires_at ??
            orderData.expiration ??
            new Date(Date.now() + 15 * 60 * 1000).toISOString()
          }
          onStatusChange={(newStatus) => {
            setOrderData((prev) =>
              prev ? { ...prev, status: newStatus } : prev
            );
          }}
          onClose={() => {
            setShowPixModal(false);  // fecha o modal
            setOrderData(null);      // volta a rifa completa
          }}
        />
      )}

      {/* ZOOM IMG */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoom"
            className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
          />
        </div>
      )}

      {/* CONFIRMAR ALTERAÇÃO DE NÚMEROS */}
      <AlertDialog
        open={showChangeNumbersDialog}
        onOpenChange={setShowChangeNumbersDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar os números da sua rifa?</AlertDialogTitle>

            <AlertDialogDescription>
              Alterar os números fará você perder os descontos dos combos.
              Deseja mesmo continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row justify-end gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline">Manter descontos</Button>
            </AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button
                variant="ghost"
                className="border border-border bg-muted"
                onClick={handleConfirmChangeNumbers}
              >
                Sim. Vou perder as vantagens!
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignPage;
