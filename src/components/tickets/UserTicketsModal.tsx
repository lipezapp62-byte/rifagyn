import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CampaignTickets {
    campaign_id: string;
    campaign_name: string;
    numbers: number[];
}

interface UserTicketsModalProps {
    open: boolean;
    onClose: () => void;
    tickets: CampaignTickets[];
}

export function UserTicketsModal({ open, onClose, tickets }: UserTicketsModalProps) {
    const campaigns = tickets || [];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] bg-background border-none">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-white flex items-center justify-center gap-2">
                        <img
                            src="https://i.imgur.com/4qVQZkF.png"
                            alt="icon"
                            className="w-6 h-6 translate-y-[-2px]"
                        />
                        Meus números
                    </DialogTitle>
                </DialogHeader>

                {campaigns.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-6">
                        Nenhum número encontrado.
                    </div>
                )}

                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                    {campaigns.map((campaign) => (
                        <div key={campaign.campaign_id} className="border border-border rounded-md p-4">
                            <p className="font-semibold text-white mb-2 flex items-center gap-2">
                                <img
                                    src="https://i.imgur.com/4qVQZkF.png"
                                    alt="icon"
                                    className="w-4 h-4"
                                />
                                {campaign.campaign_name}
                            </p>

                            <div className="text-white text-sm leading-relaxed break-words">
                                {campaign.numbers.join(" - ")}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 text-center">
                    <Button
                        className="bg-[#ff6100] text-black hover:bg-[#ff761f]"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
