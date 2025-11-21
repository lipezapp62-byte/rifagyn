import { useState } from "react";
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

const NewCampaign = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        image_url: "",
        price_base: "",
        total_quotas: "",
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [generatedName, setGeneratedName] = useState<string | null>(null);

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const merged = [...imageFiles, ...files].slice(0, 3);

        if (imageFiles.length + files.length > 3) {
            toast.error("Você pode enviar no máximo 3 imagens.");
        }

        setImageFiles(merged);
        setImagePreviews(merged.map((file) => URL.createObjectURL(file)));
    };

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleSubmit = () => {
        if (!form.title || !form.price_base || !form.total_quotas) {
            return toast.error("Preencha todos os campos obrigatórios.");
        }

        if (showDrawDate && !drawDate) {
            return toast.error("Defina a data do sorteio ou desative a exibição da data.");
        }

        setIsSubmitting(true);

        const numericPrice = parseFloat(form.price_base.replace(",", "."));
        const numericQuotas = parseInt(form.total_quotas, 10) || 0;

        const payload = {
            ...form,
            price_base: numericPrice,
            total_quotas: numericQuotas,
            show_sold: showSold,
            show_draw_date: showDrawDate,
            draw_date: showDrawDate ? drawDate : null,
            // aqui depois você envia metadados das imagens para o n8n
            images_count: imageFiles.length,
        };

        console.log("🔥 ENVIAR PARA N8N:", payload);
        console.log("🖼️ ARQUIVOS DE IMAGEM:", imageFiles);

        const baseUrl =
            typeof window !== "undefined" ? window.location.origin : "https://rifagyn.com";
        const slugBase =
            form.slug.trim() || slugify(form.title) || "minha-nova-campanha";
        const url = `${baseUrl}/campanha/${slugBase}`;

        setGeneratedUrl(url);
        setGeneratedName(form.title || "Nova campanha");

        toast.success("Campanha criada com sucesso!");
        setIsSubmitting(false);
    };

    const handleCopyUrl = async () => {
        if (!generatedUrl) return;
        try {
            await navigator.clipboard.writeText(generatedUrl);
            toast.success("Link da campanha copiado!");
        } catch (err) {
            toast.error("Não foi possível copiar o link.");
        }
    };

    const previewImage =
        imagePreviews[0] || form.image_url || "https://via.placeholder.com/1080x650?text=Preview+da+Campanha";

    const pricePreview = form.price_base
        ? parseFloat(form.price_base.replace(",", "."))
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
                        Configure todos os detalhes da sua campanha e visualize em tempo real como ela ficará para os participantes.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8 items-start">
                    {/* FORMULÁRIO PRINCIPAL */}
                    <Card className="p-6 space-y-6">
                        {/* Sessão: Informações básicas */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold">Informações da campanha</h2>
                            <p className="text-xs text-muted-foreground">
                                Nome, descrição, imagens e regras que serão exibidos na página da rifa.
                            </p>
                        </div>

                        {/* Título */}
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

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                placeholder="Descreva a campanha..."
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                        </div>

                        {/* Imagens */}
                        <div className="space-y-3">
                            <Label>Imagens da campanha (máx. 3)</Label>
                            <p className="text-xs text-muted-foreground">
                                Essas imagens serão usadas no banner da rifa. Você pode enviar até 3 arquivos.
                            </p>

                            <div className="flex flex-col gap-3">
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
                                                className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1"
                                            >
                                                <div className="w-8 h-8 rounded-md overflow-hidden bg-muted">
                                                    {imagePreviews[idx] && (
                                                        <img
                                                            src={imagePreviews[idx]}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                                                    {file.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Imagem da rifa (URL) – opcional</Label>
                                <Input
                                    placeholder="https://imgur.com/seu-banner.png"
                                    value={form.image_url}
                                    onChange={(e) => handleChange("image_url", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Se você informar uma URL, ela será usada como imagem principal. Caso contrário, será usada a primeira imagem enviada.
                                </p>
                            </div>
                        </div>

                        {/* Aparência */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cor de destaque */}
                            <div className="space-y-2">
                                <Label>Cor de destaque</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="color"
                                        value={form.cover_color}
                                        onChange={(e) => handleChange("cover_color", e.target.value)}
                                        className="w-16 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={form.cover_color}
                                        onChange={(e) => handleChange("cover_color", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <Label>Slug (opcional)</Label>
                                <Input
                                    placeholder="campanha-premio-5k"
                                    value={form.slug}
                                    onChange={(e) => handleChange("slug", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Usado para o link amigável da campanha. Se não preencher, será gerado automaticamente.
                                </p>
                            </div>
                        </div>

                        {/* Sessão: Preço e cotas */}
                        <div className="pt-4 border-t border-border/60 space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">Preço e cotas</h2>
                                <p className="text-xs text-muted-foreground">
                                    Defina os valores e a quantidade total de cotas da campanha.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Preço base */}
                                <div className="space-y-2">
                                    <Label>
                                        Preço base por cota (R$) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Ex: 0.10"
                                        value={form.price_base}
                                        onChange={(e) => handleChange("price_base", e.target.value)}
                                    />
                                </div>

                                {/* Total de cotas */}
                                <div className="space-y-2">
                                    <Label>
                                        Total de cotas <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 5000"
                                        value={form.total_quotas}
                                        onChange={(e) => handleChange("total_quotas", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sessão: Exibição e regras */}
                        <div className="pt-4 border-t border-border/60 space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">Exibição e regras</h2>
                                <p className="text-xs text-muted-foreground">
                                    Configure o que será exibido na página pública da rifa.
                                </p>
                            </div>

                            {/* Mostrar cotas vendidas */}
                            <div className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                    <Label>Exibir cotas vendidas?</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Quando ativado, o participante vê o progresso da campanha.
                                    </p>
                                </div>
                                <Switch checked={showSold} onCheckedChange={setShowSold} />
                            </div>

                            {/* Mostrar data do sorteio + input sempre visível */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Exibir data do sorteio?</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Quando desativado, a data não aparece na página da campanha.
                                        </p>
                                    </div>
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
                                        className={cn(
                                            "w-full",
                                            !showDrawDate &&
                                            "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                        )}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Este campo fica fixo na criação. Se a opção acima estiver desligada, ele ficará visualmente desativado.
                                    </p>
                                </div>
                            </div>

                            {/* Regras */}
                            <div className="space-y-2">
                                <Label>Regras da campanha</Label>
                                <Textarea
                                    placeholder="Pagamento em até 24h. Prêmio entregue no endereço do ganhador..."
                                    value={form.rules}
                                    onChange={(e) => handleChange("rules", e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {/* Visibilidade */}
                            <div className="space-y-2">
                                <Label>Visibilidade</Label>
                                <select
                                    className="w-full bg-card border border-border rounded-md p-2 text-sm"
                                    value={form.visibility}
                                    onChange={(e) => handleChange("visibility", e.target.value)}
                                >
                                    <option value="public">Pública</option>
                                    <option value="private">Privada</option>
                                </select>
                            </div>
                        </div>

                        {/* Botão final */}
                        <Button
                            className="w-full mt-4"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Criando campanha..." : "Criar campanha"}
                        </Button>

                        {/* Link gerado */}
                        {generatedUrl && (
                            <Card
                                className="mt-4 p-4 cursor-pointer hover:border-primary/70 transition-colors"
                                onClick={handleCopyUrl}
                            >
                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                    Link da campanha
                                </p>
                                <p className="text-sm font-medium">
                                    {generatedName || "Campanha"}
                                </p>
                                <p className="text-xs text-primary underline break-all">
                                    {generatedUrl}
                                </p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Clique para copiar o link.
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

                        <Card className="relative p-4 bg-card-elevated border border-border/80 rounded-2xl overflow-hidden">
                            {/* Overlay branco leve para destacar que é preview */}
                            <div className="pointer-events-none absolute inset-0 bg-white/55" />

                            <div className="relative space-y-4">
                                {/* Banner 1080x650 em escala, responsivo */}
                                <div className="w-full max-w-[520px] mx-auto">
                                    <div className="w-full aspect-[1080/650] rounded-xl overflow-hidden border border-border bg-muted/60">
                                        <img
                                            src={previewImage}
                                            alt={form.title || "Preview da campanha"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Infos da campanha */}
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">Pública</Badge>
                                        <Badge className="bg-paid text-white">Ativa</Badge>
                                        {form.visibility === "private" && (
                                            <Badge variant="outline" className="text-xs">
                                                Acesso restrito
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold">
                                            {form.title || "Título da campanha"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {form.description ||
                                                "A descrição da sua rifa aparecerá aqui para os participantes."}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
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
                                                    {new Date(drawDate).toLocaleString("pt-BR", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
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
                            </div>

                            {/* Etiqueta de preview */}
                            <div className="pointer-events-none absolute top-3 right-3">
                                <div className="px-2 py-1 rounded-full bg-white/70 border border-border text-[10px] font-semibold uppercase tracking-wide">
                                    Preview
                                </div>
                            </div>
                        </Card>

                        <p className="text-[11px] text-muted-foreground">
                            Este preview é apenas ilustrativo e não representa exatamente todos os detalhes da página final, mas segue o padrão visual do RifaGyn.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NewCampaign;
