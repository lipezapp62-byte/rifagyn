import { cn } from "@/lib/utils";

interface NumberGridProps {
  numbers: Array<{
    number: number;
    status: 'available' | 'selected' | 'sold';
  }>;
  onNumberClick?: (number: number) => void;
}

export function NumberGrid({ numbers, onNumberClick }: NumberGridProps) {
  return (
    <div className="bg-card-elevated border border-border rounded-lg p-4">
      <div className="mb-4 flex gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card border-2 border-border" />
          <span className="text-muted-foreground">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary border-2 border-primary" />
          <span className="text-muted-foreground">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border-2 border-muted opacity-50" />
          <span className="text-muted-foreground">Vendido</span>
        </div>
      </div>
      
      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
        {numbers.map((item) => (
          <button
            key={item.number}
            onClick={() => onNumberClick?.(item.number)}
            disabled={item.status === 'sold'}
            className={cn(
              "aspect-square rounded text-xs font-semibold transition-all duration-200",
              "flex items-center justify-center",
              item.status === 'available' && "bg-card border-2 border-border hover:border-primary hover:scale-105",
              item.status === 'selected' && "bg-primary border-2 border-primary text-white scale-105",
              item.status === 'sold' && "bg-muted border-2 border-muted opacity-50 cursor-not-allowed"
            )}
          >
            {item.number.toString().padStart(4, '0')}
          </button>
        ))}
      </div>
    </div>
  );
}
