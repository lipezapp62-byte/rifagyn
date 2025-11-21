import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CampaignProgressProps {
  totalQuotas: number;
  quotasSold: number;
  quotasAvailable: number;
  showDetails?: boolean;
}

export function CampaignProgress({ 
  totalQuotas, 
  quotasSold, 
  quotasAvailable,
  showDetails = true 
}: CampaignProgressProps) {
  const progress = (quotasSold / totalQuotas) * 100;
  
  return (
    <div className="space-y-3">
      <Progress value={progress} className="h-3" />
      
      {showDetails && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm">
            <span className="font-semibold text-foreground">{quotasSold}</span>
            <span className="text-muted-foreground"> de </span>
            <span className="font-semibold text-foreground">{totalQuotas}</span>
            <span className="text-muted-foreground"> cotas vendidas</span>
          </div>
          
          <Badge variant="secondary" className="font-semibold">
            {quotasAvailable} disponíveis
          </Badge>
        </div>
      )}
    </div>
  );
}
