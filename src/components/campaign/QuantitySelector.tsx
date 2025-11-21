import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  basePrice: number;
}

export function QuantitySelector({ 
  quantity, 
  onQuantityChange, 
  min = 1, 
  max = 1000,
  basePrice 
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };
  
  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    const clampedValue = Math.min(Math.max(value, min), max);
    onQuantityChange(clampedValue);
  };
  
  const totalPrice = quantity * basePrice;
  
  return (
    <div className="bg-card-elevated border border-border rounded-lg p-4 space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Quantidade personalizada</p>
        <p className="text-xs text-muted-foreground">Escolha quantas cotas deseja</p>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={quantity <= min}
          className="h-12 w-12 rounded-full"
        >
          <Minus className="h-5 w-5" />
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          className="w-24 text-center text-2xl font-bold h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={min}
          max={max}
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={quantity >= max}
          className="h-12 w-12 rounded-full"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="text-center pt-3 border-t border-border">
        <p className="text-sm text-muted-foreground mb-1">Total</p>
        <p className="text-3xl font-bold text-primary">
          R$ {totalPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
