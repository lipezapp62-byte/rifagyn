import React, { useState, useEffect, type ChangeEvent } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabaseClient";

const BONUS_QUANTITIES = [50, 100, 200, 500, 700, 1000];

// --------------------------------------
// UPLOAD SUPABASE
// --------------------------------------
async function uploadImageToSupabase(file: File) {
    const ext = file.name.split(".").pop();
    const name = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
        .from("rifagyn-campaigns")
        .upload(name, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("rifagyn-campaigns")
        .getPublicUrl(name);

    return data.publicUrl;
}

const NewCampaign = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        image_url: "",
        price_base: "",
        total_quotas: "",
        min_quotas: "",
        rules: "",
        cover_color: "#3080f2",
        slug: "",
        visibility: "public",
    });

    const [showSold, setShowSold] = useState(true);
    const [showDrawDate, setShowDrawDate] = useState(false);
    const [drawDate, setDrawDate] = useState("");

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [generatedName, setGeneratedName] = useState<string | null>(null);

    const [bonusCombos, setBonusCombos] = useState(
        BONUS_QUANTITIES.map((qty) => ({
            quantity: qty,
            discount: "",
            featured: qty === 200,
        }))
    );

    // Crop states
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
    const [cropPosition, setCropPosition] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
        null
    );
    const [imageStartPos, setImageStartPos] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [isSubmittingCrop, setIsSubmittingCrop] = useState(false);

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // --------------------------------------
    // SLUG AUTOMÁTICO A PARTIR DO TÍTULO
    // --------------------------------------
    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            slug: slugify(prev.title || ""),
        }));
    }, [form.title]);

    // --------------------------------------
    // UPLOAD & LIMITAÇÃO DE 3 IMAGENS (SÓ PREVIEW AQUI)
    // --------------------------------------
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const total = imageFiles.length + files.length;
        if (total > 3) toast.error("Máximo de 3 imagens.");

        const merged = [...imageFiles, ...files].slice(0, 3);
        setImageFiles(merged);
        setImagePreviews(merged.map((f) => URL.createObjectURL(f)));
    };

    const parseNumber = (value: string) => {
        if (!value) return NaN;
        return parseFloat(value.replace(",", "."));
    };

    const handleBonusDiscountChange = (qty: number, value: string) => {
        setBonusCombos((prev) =>
            prev.map((combo) =>
                combo.quantity === qty ? { ...combo, discount: value } : combo
            )
        );
    };

    // --------------------------------------
    // PREÇO DOS COMBOS: base * qty * (1 - desconto%)
    // --------------------------------------
    const getBonusPrices = (qty: number, discountStr: string) => {
        const base = parseNumber(form.price_base);
        if (isNaN(base) || base <= 0) {
            return { original: 0, final: 0 };
        }

        const d = parseNumber(discountStr);
        const safeD = isNaN(d) ? 0 : d;

        const original = base * qty;
        const final = original * (1 - safeD / 100);

        return { original, final: final < 0 ? 0 : final };
    };

    // --------------------------------------
    // CROP / REPOSICIONAR IMAGEM (POPUP 1080x650)
    // --------------------------------------
    const openCropForIndex = (index: number) => {
        const preview = imagePreviews[index];
        if (!preview) {
            toast.error("Envie uma imagem para recortar.");
            return;
        }
        setCropImage(preview);
        setCropImageIndex(index);
        setCropPosition({ x: 0, y: 0, scale: 1 });
        setIsCropOpen(true);
    };

    const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setImageStartPos({ ...cropPosition });
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !dragStart) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        setCropPosition((prev) => ({
            ...prev,
            x: imageStartPos.x + dx,
            y: imageStartPos.y + dy,
        }));
    };

    const handleCropMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    const handleSaveCrop = async () => {
        if (!cropImage || cropImageIndex === null) return;

        setIsSubmittingCrop(true);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = cropImage;

        img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = 1080;
            canvas.height = 650;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                setIsSubmittingCrop(false);
                toast.error("Erro ao recortar imagem.");
                return;
            }

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();

            const iw = img.naturalWidth;
            const ih = img.naturalHeight;

            ctx.translate(
                canvas.width / 2 + cropPosition.x,
                canvas.height / 2 + cropPosition.y
            );
            ctx.scale(cropPosition.scale, cropPosition.scale);

            ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);

            ctx.restore();

            canvas.toBlob(
                async (blob) => {
                    if (!blob) {
                        setIsSubmittingCrop(false);
                        toast.error("Erro ao gerar imagem recortada.");
                        return;
                    }

                    const file = new File([blob], `crop-${Date.now()}.jpg`, {
                        type: "image/jpeg",
                    });

                    const dataUrl = canvas.toDataURL("image/jpeg");

                    setImageFiles((prev) => {
                        const copy = [...prev];
                        copy[cropImageIndex] = file;
                        return copy;
                    });

                    setImagePreviews((prev) => {
                        const copy = [...prev];
                        copy[cropImageIndex] = dataUrl;
                        return copy;
                    });

                    toast.success("Imagem recortada com sucesso!");
                    setIsCropOpen(false);
                    setIsSubmittingCrop(false);
                },
                "image/jpeg",
                0.9
            );
        };

        img.onerror = () => {
            setIsSubmittingCrop(false);
            toast.error("Erro ao carregar imagem para recorte.");
        };
    };

    // --------------------------------------
    // SUBMIT FINAL PARA N8N + UPLOAD SÓ AQUI
    // --------------------------------------
    const handleSubmit = async () => {
        if (!form.title || !form.price_base || !form.total_quotas)
            return toast.error("Preencha todos os campos obrigatórios.");

        if (!form.min_quotas) return toast.error("Informe o mínimo de cotas.");

        const basePrice = parseNumber(form.price_base);
        if (isNaN(basePrice) || basePrice <= 0)
            return toast.error("Preço inválido.");

        const numericQuotas = parseInt(form.total_quotas, 10) || 0;
        const minQuotas = parseInt(form.min_quotas, 10) || 0;

        if (isNaN(minQuotas) || minQuotas <= 0)
            return toast.error("Mínimo de cotas inválido.");

        if (minQuotas > numericQuotas)
            return toast.error(
                "Mínimo de cotas não pode ser maior que o total de cotas."
            );

        if (showDrawDate && !drawDate)
            return toast.error("Informe a data do sorteio.");

        const invalidBonus = bonusCombos.some((c) => {
            const d = parseNumber(c.discount);
            return c.discount === "" || isNaN(d);
        });

        if (invalidBonus) return toast.error("Descontos inválidos.");

        setIsSubmitting(true);

        try {
            const numericPrice = basePrice;

            const combosPayload = bonusCombos.map((combo) => {
                const d = parseNumber(combo.discount) || 0;
                const original = numericPrice * combo.quantity;
                const final = original * (1 - d / 100);

                return {
                    qty: combo.quantity,
                    price: Number(final.toFixed(2)),
                    discount_percentage: Number(d.toFixed(2)),
                    popular: combo.featured,
                };
            });

            const featuredCombo =
                combosPayload.find((c) => c.popular) || combosPayload[0];

            // Upload das imagens SÓ AGORA
            let finalImageUrls: string[] = [];

            if (imageFiles.length > 0) {
                try {
                    const uploaded = await Promise.all(
                        imageFiles.map((f) => uploadImageToSupabase(f))
                    );
                    setUploadedUrls(uploaded);
                    finalImageUrls = uploaded;
                } catch (err) {
                    console.error("Erro ao enviar imagens:", err);
                    toast.error("Erro ao enviar imagens.");
                    setIsSubmitting(false);
                    return;
                }
            } else if (form.image_url) {
                finalImageUrls = [form.image_url];
            }

            const payload = {
                ...form,
                images: finalImageUrls,
                price_base: numericPrice,
                total_quotas: numericQuotas,
                min_quotas: minQuotas,
                show_sold: showSold,
                show_draw_date: showDrawDate,
                draw_date: showDrawDate ? drawDate : null,
                images_count: finalImageUrls.length,
                combos: combosPayload,
                featured_combo: featuredCombo,
            };

            console.log("🔥 ENVIAR PARA N8N:", payload);

            const token = localStorage.getItem("rifagyn_token");

            const res = await fetch(
                "https://criadordigital-n8n-webhook.tw9mqd.easypanel.host/webhook/rifagyn/campaigns/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json().catch(() => ({}));
            console.log("🔌 Resposta do backend:", data);

            if (!res.ok) {
                toast.error("Você não tem autorização para criar uma nova campanha. Entre em contato para desbloquear a função!");
                setIsSubmitting(false);
                return;
            }

            const baseUrl =
                typeof window !== "undefined"
                    ? window.location.origin
                    : "https://rifagyn.com";

            // ✅ ALTERAÇÃO AQUI: usa o campaign_id do backend
            const campaignIdRaw = data?.campaign_id;

            if (!campaignIdRaw) {
                toast.error("Campanha criada, mas o ID não foi retornado.");
                setIsSubmitting(false);
                return;
            }

            // Limpa qualquer lixo (caso o backend mande com = ou {{ }})
            const campaignId = String(campaignIdRaw)
                .replace(/^=/, "")
                .replace(/{{|}}/g, "")
                .trim();

            const url = `${baseUrl}/campanha/${campaignId}`;

            setGeneratedUrl(url);
            setGeneratedName(form.title || "Nova campanha");

            toast.success("Campanha criada com sucesso!");
        } catch (err) {
            console.error("❌ Erro ao conectar ao backend:", err);
            toast.error("Erro interno! O servidor não respondeu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyUrl = async () => {
        if (!generatedUrl) return;
        await navigator.clipboard.writeText(generatedUrl);
        toast.success("Link copiado!");
    };

    const previewImage =
        imagePreviews[0] ||
        form.image_url ||
        "https://via.placeholder.com/1080x650?text=Preview+da+Campanha";

    const pricePreview = form.price_base
        ? parseNumber(form.price_base) || 0
        : 0;

    const totalQuotasPreview = form.total_quotas
        ? parseInt(form.total_quotas, 10)
        : 0;

    return (
        <div className="min-h-screen bg-background">
            <Header userName="Admin" />

            <main className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Criar Nova Rifa</h1>
                    <p className="text-sm text-muted-foreground">
                        Configure todos os detalhes da sua campanha.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8 items-start">
                    {/* FORM */}
                    <Card className="p-6 space-y-6">
                        {/* TÍTULO */}
                        <div className="space-y-2">
                            <Label>
                                Título da campanha <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                placeholder="Ex: Rifa de 5 mil reais"
                                value={form.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                            />
                        </div>

                        {/* DESCRIÇÃO */}
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                placeholder="Descreva a campanha..."
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                        </div>

                        {/* IMAGENS */}
                        <div className="space-y-3">
                            <Label>Imagens da campanha (máx. 3)</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                            />

                            {imageFiles.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {imageFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 rounded-md border bg-card px-2 py-1 relative"
                                        >
                                            <div
                                                className="w-20 h-20 rounded-md overflow-hidden bg-muted cursor-move"
                                                onClick={() => openCropForIndex(idx)}
                                            >
                                                {imagePreviews[idx] && (
                                                    <img
                                                        src={imagePreviews[idx]}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                {file.name}
                                            </span>

                                            {/* BOTÃO DE REMOVER IMAGEM */}
                                            <button
                                                type="button"
                                                className="absolute top-1 right-1 text-[10px] px-1 py-0.5 rounded bg-destructive/10 text-red-500"
                                                onClick={() => {
                                                    const newFiles = [...imageFiles];
                                                    const newPrev = [...imagePreviews];
                                                    const newUrls = [...uploadedUrls];

                                                    newFiles.splice(idx, 1);
                                                    newPrev.splice(idx, 1);
                                                    newUrls.splice(idx, 1);

                                                    setImageFiles(newFiles);
                                                    setImagePreviews(newPrev);
                                                    setUploadedUrls(newUrls);
                                                }}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* APARÊNCIA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cor de destaque OCULTA (mantida só no estado) */}
                            {/*
              <div className="space-y-2">
                <Label>Cor de destaque</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={form.cover_color}
                    onChange={(e) =>
                      handleChange("cover_color", e.target.value)
                    }
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={form.cover_color}
                    onChange={(e) =>
                      handleChange("cover_color", e.target.value)
                    }
                  />
                </div>
              </div>
              */}

                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input
                                    placeholder="campanha-premio-5k"
                                    value={form.slug}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* PREÇO + COTAS */}
                        <div className="pt-4 border-t space-y-4">
                            <h2 className="text-lg font-semibold">Preço e cotas</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Preço base*</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.10"
                                        value={form.price_base}
                                        onChange={(e) =>
                                            handleChange("price_base", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Total de cotas*</Label>
                                    <Input
                                        type="number"
                                        placeholder="5000"
                                        value={form.total_quotas}
                                        onChange={(e) =>
                                            handleChange("total_quotas", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Mínimo de cotas*</Label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 10"
                                        value={form.min_quotas}
                                        onChange={(e) =>
                                            handleChange("min_quotas", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COMBOS */}
                        <div className="pt-4 border-t space-y-4">
                            <h2 className="text-lg font-semibold">Cotas bônus</h2>

                            <div className="space-y-3">
                                {bonusCombos.map((combo) => {
                                    const { original, final } = getBonusPrices(
                                        combo.quantity,
                                        combo.discount
                                    );

                                    return (
                                        <div
                                            key={combo.quantity}
                                            className={cn(
                                                "grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.2fr] gap-3 items-center rounded-lg border px-3 py-3 bg-card",
                                                combo.featured && "border-primary/80 shadow-sm"
                                            )}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-sm">
                                                        +{combo.quantity} cotas
                                                    </p>
                                                    {combo.featured && (
                                                        <Badge className="text-[10px] uppercase tracking-wide">
                                                            Mais popular
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs">Desconto (%)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min={0}
                                                    placeholder="15"
                                                    value={combo.discount}
                                                    onChange={(e) =>
                                                        handleBonusDiscountChange(
                                                            combo.quantity,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                {original > 0 ? (
                                                    <p className="font-semibold">
                                                        <span className="line-through text-xs text-muted-foreground mr-1">
                                                            R$ {original.toFixed(2)}
                                                        </span>
                                                        <span className="text-primary">
                                                            R$ {final.toFixed(2)}
                                                        </span>
                                                    </p>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">
                                                        Informe o preço base.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* EXIBIÇÃO */}
                        <div className="pt-4 border-t space-y-4">
                            <h2 className="text-lg font-semibold">Exibição e regras</h2>

                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <Label>Exibir cotas vendidas?</Label>
                                </div>
                                <Switch checked={showSold} onCheckedChange={setShowSold} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir data do sorteio?</Label>
                                    <Switch
                                        checked={showDrawDate}
                                        onCheckedChange={setShowDrawDate}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label>Data do sorteio</Label>
                                    <Input
                                        type="datetime-local"
                                        value={drawDate}
                                        onChange={(e) => setDrawDate(e.target.value)}
                                        disabled={!showDrawDate}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Regras da campanha</Label>
                                <Textarea
                                    placeholder="Pagamento em 24h..."
                                    value={form.rules}
                                    onChange={(e) => handleChange("rules", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Visibilidade</Label>
                                <select
                                    className="w-full bg-card border rounded-md p-2 text-sm"
                                    value={form.visibility}
                                    onChange={(e) =>
                                        handleChange("visibility", e.target.value)
                                    }
                                >
                                    <option value="public">Pública</option>
                                    <option value="private">Privada</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-4"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Criando campanha..." : "Criar campanha"}
                        </Button>

                        {generatedUrl && (
                            <Card
                                className="mt-4 p-4 cursor-pointer"
                                onClick={handleCopyUrl}
                            >
                                <p className="text-xs text-muted-foreground mb-1">
                                    Link da campanha
                                </p>
                                <p className="text-sm font-medium">{generatedName}</p>
                                <p className="text-xs text-primary underline break-all">
                                    {generatedUrl}
                                </p>
                            </Card>
                        )}
                    </Card>

                    {/* PREVIEW */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Preview da rifa</h2>
                            <Badge variant="outline" className="text-xs">
                                Visualização
                            </Badge>
                        </div>

                        <Card className="relative p-4 bg-card-elevated">
                            <div className="space-y-4">
                                <div className="w-full aspect-[1080/650] rounded-xl overflow-hidden bg-muted/60">
                                    <img
                                        src={previewImage}
                                        alt={form.title || "Preview"}
                                        className={cn(
                                            "w-full h-full object-cover",
                                            imagePreviews[0] && "cursor-move"
                                        )}
                                        onClick={() => {
                                            if (imagePreviews[0]) openCropForIndex(0);
                                        }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">
                                        {form.title || "Título da campanha"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {form.description || "A descrição aparecerá aqui."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">A partir de</p>
                                        <p className="text-2xl font-bold text-primary">
                                            R$ {pricePreview.toFixed(2)}
                                        </p>
                                    </div>

                                    {showDrawDate && drawDate && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Sorteio em{" "}
                                                {new Date(drawDate).toLocaleString("pt-BR")}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {showSold && totalQuotasPreview > 0 && (
                                    <div className="space-y-1">
                                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full w-1/12 bg-primary" />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            0 de {totalQuotasPreview} cotas vendidas
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* MODAL DE CROP */}
            {isCropOpen && cropImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-card rounded-lg p-4 w-full max-w-3xl space-y-4">
                        <h3 className="text-lg font-semibold">Ajustar posição da imagem</h3>

                        <div
                            className="relative mx-auto w-full max-w-3xl aspect-[1080/650] bg-muted overflow-hidden rounded-md cursor-move"
                            onMouseDown={handleCropMouseDown}
                            onMouseMove={handleCropMouseMove}
                            onMouseUp={handleCropMouseUp}
                            onMouseLeave={handleCropMouseUp}
                        >
                            <img
                                src={cropImage}
                                alt="Recorte"
                                className="absolute"
                                style={{
                                    left: "50%",
                                    top: "50%",
                                    transform: `translate(-50%, -50%) translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropPosition.scale})`,
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Label className="text-xs">Zoom</Label>
                            <input
                                type="range"
                                min={0.5}
                                max={2}
                                step={0.01}
                                value={cropPosition.scale}
                                onChange={(e) =>
                                    setCropPosition((prev) => ({
                                        ...prev,
                                        scale: parseFloat(e.target.value) || 1,
                                    }))
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCropOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveCrop}
                                disabled={isSubmittingCrop}
                            >
                                {isSubmittingCrop ? "Salvando..." : "Salvar recorte"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewCampaign;