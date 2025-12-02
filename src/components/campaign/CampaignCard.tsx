import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description?: string;
  image_url?: string[];
  price_base?: number;
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const coverImage = campaign.image_url?.[0] || null;
  const price = Number(campaign.price_base ?? 0);

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">

      {/* IMAGEM */}
      <div className="w-full h-44 overflow-hidden relative rounded-t-2xl">
        {coverImage ? (
          <img
            src={coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-card-elevated flex items-center justify-center text-4xl font-bold text-primary">
            R
          </div>
        )}

        {/* PREÇO DENTRO DA IMAGEM */}
        <div className="absolute bottom-2 right-2">
          <span
            className="
      px-2.5 
      py-0.5 
      rounded-md 
      bg-[#ff6100] 
      text-[#131212ff] 
      text-xs 
      font-bold 
      shadow-md
    "
          >
            R$ {price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">

        {/* TÍTULO */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{campaign.title}</h3>
        </div>


        {/* DESCRIÇÃO */}
        {campaign.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.description}
          </p>
        )}

        {/* BOTÃO */}
        <Link to={`/campanha/${campaign.id}`}>
          <Button
            className="
      mt-4      
      w-full 
      text-[#ffffffff] 
      text-base 
      font-medium 
      rounded-xl 
      py-6
      bg-[#ff6100]
      hover:bg-[#ff7a1a]
      flex items-center justify-center gap-2
      combo-animated-border
      glow-primary
    "
          >
            <Flame size={26} strokeWidth={2} className="mt-[-2px]" color="#ffffffff" />
            Participar
          </Button>
        </Link>
      </div>
    </Card>
  );
}
