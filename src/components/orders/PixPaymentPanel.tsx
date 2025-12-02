import { Button } from "@/components/ui/button";
import { Copy, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PixPaymentPanelProps {
  orderId: string;
  amount: number;
  pixCode: string;
  qrCodeBase64: string;
  status: "pending" | "paid" | "expired";
  expiresAt: string;
  onStatusChange?: (newStatus: "pending" | "paid" | "expired") => void;
  onClose: () => void; // 👈 ADICIONADO
}

export function PixPaymentPanel({
  orderId,
  amount,
  pixCode,
  qrCodeBase64,
  status: initialStatus,
  expiresAt,
  onStatusChange,
  onClose,
}: PixPaymentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("05:00");
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(true);
  const [progress, setProgress] = useState(100);

  const [showNotice, setShowNotice] = useState(false);
  const [checking, setChecking] = useState(false);
  const [numbers, setNumbers] = useState<number[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotice(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const TOTAL_TIME = 5 * 60 * 1000;

  useEffect(() => {
    const expiry = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const diff = expiry - Date.now();

      if (diff <= 0) {
        setTimeRemaining("00:00");
        setProgress(0);

        if (status === "pending") {
          setStatus("expired");
          onStatusChange?.("expired");
        }
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

      const percent = (diff / TOTAL_TIME) * 100;
      setProgress(Math.max(0, percent));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status, onStatusChange]);

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const [showAllNumbers, setShowAllNumbers] = useState(false);

  const handleCheckPayment = async () => {
    setChecking(true);

    try {
      const res = await fetch(
        "https://criadordigital-n8n-webhook.tw9mqd.easypanel.host/webhook/rifagyn/orders/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: orderId }),
        }
      );

      const data = await res.json();

      if (data.status === "paid") {
        setNumbers(data.numbers);
        setStatus("paid");
        onStatusChange?.("paid");
      } else {
        toast.error("Pagamento ainda não confirmado");
      }
    } catch {
      toast.error("Erro ao verificar pagamento");
    }

    setChecking(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        // 🔥 AQUI LIMPA A RIFA QUANDO FECHA
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[360px] p-0 overflow-y-auto max-h-[90vh] bg-background border-none [&>button]:hidden">
        <DialogHeader className="text-center py-3 border-b border-border relative">
          <DialogTitle className="text-foreground text-lg font-semibold">
            Depositar
          </DialogTitle>

          <p className="text-xs text-muted-foreground mt-1 px-3">
            Escaneie o QR Code abaixo usando o app<br />
            do seu banco para realizar o pagamento
          </p>

          <button
            onClick={() => {
              setOpen(false);
              onClose(); // 👈 garante reset total
            }}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        <div className="px-3 py-4 space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-xl">
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                className="w-56 h-56"
              />
            </div>
          </div>

          {/* CAIXA DO PIX */}
          <div className="border border-dashed border-border rounded-md p-4 space-y-3">
            <p className="text-center text-4xl font-extrabold text-primary tracking-wide">
              R$ {amount.toFixed(2).replace(".", ",")}
            </p>

            {/* CAIXA CODIGO PIX SEM PRETO CHAPADO */}
            <div className="bg-card rounded-md py-2 px-3 text-center">
              <p className="truncate text-sm text-muted-foreground font-mono">
                {pixCode.slice(0, 32)}...
              </p>
            </div>

            <Button
              onClick={handleCopyPix}
              className="w-full py-3 rounded-md border border-primary 
              bg-primary/10 text-primary 
              hover:bg-primary/20 font-semibold"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  Código Copiado
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copiar Código
                </>
              )}
            </Button>
          </div>

          {/* BOTÃO JÁ PAGUEI */}
          <div className="flex justify-center pt-1">
            <button
              onClick={handleCheckPayment}
              disabled={checking}
              className={`
                transition-all duration-500 overflow-hidden flex items-center justify-center
                ${checking ? "w-14 h-14 rounded-full" : "w-full h-12 rounded-md"}
                bg-[#ff6100] hover:bg-[#ff6100] active:bg-[#ff6100] focus:bg-[#ff6100]
              `}
            >
              {!checking ? (
                <span className="font-semibold text-black text-sm">
                  Já paguei
                </span>
              ) : (
                <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </div>

          {/* RESULTADO DOS NÚMEROS */}
          {numbers && numbers.length > 0 && (
            <div className="mt-6 text-center space-y-2">
              <p className="text-white text-sm">Seus números:</p>

              <div className="bg-card p-3 rounded-md text-sm text-foreground break-words">
                {(showAllNumbers ? numbers : numbers.slice(0, 50)).join(" - ")}
              </div>

              {/* BOTÃO VER MAIS */}
              {numbers.length > 50 && (
                <div>
                  {!showAllNumbers ? (
                    <button
                      onClick={() => setShowAllNumbers(true)}
                      className="text-xs text-[#ff6100] hover:underline"
                    >
                      ver todos ({numbers.length})
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAllNumbers(false)}
                      className="text-xs text-[#ff6100] hover:underline"
                    >
                      mostrar menos
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
