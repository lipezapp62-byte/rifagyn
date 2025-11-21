import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface CampaignCardProps {
  campaign: {
    id: string;
    slug?: string;
    title: string;
    description?: string;
    logo_url?: string;
    base_price: number;
    total_quotas: number;
    quotas_sold: number;
    quotas_available: number;
    status: string;
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = ((campaign.quotas_sold || 0) / (campaign.total_quotas || 1)) * 100;
  const link = `/campanha/${campaign.id}`;
  const basePrice = campaign.base_price || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-card-elevated flex items-center justify-center flex-shrink-0 overflow-hidden">
            {campaign.logo_url ? (
              <img
                src={campaign.logo_url}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">R</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1 truncate">
              {campaign.title}
            </h3>
            {campaign.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">A partir de</span>
          <span className="text-xl font-bold text-primary">
            R$ {basePrice.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {campaign.quotas_sold || 0} de {campaign.total_quotas || 0} cotas vendidas
            </span>
            <Badge variant="secondary" className="text-xs">
              {campaign.quotas_available || 0} disponíveis
            </Badge>
          </div>
        </div>

        <Link to={link}>
          <Button className="w-full font-semibold" size="lg">
            Ver Campanha
          </Button>
        </Link>
      </div>
    </Card>
  );
}
