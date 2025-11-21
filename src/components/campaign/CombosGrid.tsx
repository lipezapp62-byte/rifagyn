import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Combo {
  id: string;
  quantity: number;
  price: number;
  discount?: number;
  popular?: boolean;
}

interface CombosGridProps {
  combos: Combo[];
  selectedComboId?: string;
  onSelectCombo: (combo: Combo) => void;
}

export function CombosGrid({ combos, selectedComboId, onSelectCombo }: CombosGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {combos.slice(0, 6).map((combo) => {
        const isSelected = selectedComboId === combo.id;
        
        return (
          <Card
            key={combo.id}
            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
              isSelected 
                ? 'border-primary border-2 bg-primary/5 shadow-lg shadow-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onSelectCombo(combo)}
          >
            <div className="p-4 space-y-2">
              {/* Popular badge */}
              {combo.popular && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                  Mais popular
                </Badge>
              )}
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div className="text-center pt-2">
                <div className="text-3xl font-bold text-foreground">
                  {combo.quantity}
                </div>
                <div className="text-sm text-muted-foreground">
                  {combo.quantity === 1 ? 'cota' : 'cotas'}
                </div>
              </div>
              
              {/* Price */}
              <div className="text-center pt-2 border-t border-border">
                <div className="text-xl font-bold text-primary">
                  R$ {(combo.price || 0).toFixed(2)}
                </div>
                
                {/* Discount badge */}
                {combo.discount && combo.discount > 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    -{combo.discount}%
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
