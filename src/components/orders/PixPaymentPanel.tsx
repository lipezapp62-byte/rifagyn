import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PixPaymentPanelProps {
  orderId: string;
  campaignName: string;
  amount: number;
  pixCode: string;
  qrCodeBase64: string;
  status: 'pending' | 'paid' | 'expired';
  expiresAt: string;
  onStatusChange?: (newStatus: 'pending' | 'paid' | 'expired') => void;
}

export function PixPaymentPanel({
  orderId,
  campaignName,
  amount,
  pixCode,
  qrCodeBase64,
  status: initialStatus,
  expiresAt,
  onStatusChange,
}: PixPaymentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [status, setStatus] = useState(initialStatus);
  
  // Countdown timer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const difference = expiryTime - now;
      
      if (difference <= 0) {
        setTimeRemaining('00:00');
        if (status === 'pending') {
          setStatus('expired');
          onStatusChange?.('expired');
        }
        return;
      }
      
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [expiresAt, status, onStatusChange]);
  
  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código PIX');
    }
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-paid text-white">Pago</Badge>;
      case 'expired':
        return <Badge className="bg-expired text-white">Expirado</Badge>;
      default:
        return <Badge className="bg-pending text-white">Pendente</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      {/* Header */}
      <div className="bg-card-elevated border-b border-border p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Pagamento PIX</h3>
            <p className="text-sm text-muted-foreground">{campaignName}</p>
          </div>
          {getStatusBadge()}
        </div>
        
        {status === 'pending' && (
          <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <Clock className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-warning">
                Seu PIX expira em {timeRemaining}
              </p>
              <p className="text-xs text-muted-foreground">
                Realize o pagamento antes que o tempo expire
              </p>
            </div>
          </div>
        )}
        
        {status === 'expired' && (
          <div className="flex items-center gap-3 p-3 bg-expired/10 border border-expired/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-expired flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-expired">
                Este pedido expirou
              </p>
              <p className="text-xs text-muted-foreground">
                Faça um novo pedido para participar da campanha
              </p>
            </div>
          </div>
        )}
        
        {status === 'paid' && (
          <div className="flex items-center gap-3 p-3 bg-paid/10 border border-paid/20 rounded-lg">
            <Check className="w-5 h-5 text-paid flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-paid">
                Pagamento confirmado!
              </p>
              <p className="text-xs text-muted-foreground">
                Seus números já estão reservados
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Amount */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
          <p className="text-4xl font-bold text-primary">
            R$ {(amount || 0).toFixed(2)}
          </p>
        </div>
        
        {status === 'pending' && (
          <>
            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg flex justify-center">
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-64 h-64 object-contain"
              />
            </div>
            
            {/* PIX Code */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-center">
                Ou copie o código PIX
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={pixCode}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  onClick={handleCopyPix}
                  size="icon"
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Como pagar:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar via PIX</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
