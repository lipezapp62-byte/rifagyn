import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getLastCampaign } from "@/lib/lastCampaign";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  showAuth?: boolean;
  userName?: string;
}

export function Header({ showAuth = true, userName }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    const last = getLastCampaign();
    if (last) {
      navigate(last);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center -ml-4"
          >
            <div
              className={`
                flex items-center cursor-pointer
                ${isMobile ? "h-10 w-40" : "h-12 w-[320px]"}
              `}
            >
              <img
                src="https://i.imgur.com/3mKZJvB.png"
                alt="Logo Rifa BNF"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* AÇÕES */}
          <div className="flex items-center gap-2">

            {/* NÃO LOGADO */}
            {!isAuthenticated && showAuth && (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>

                <Link to="/auth/cadastro">
                  <Button
                    size="sm"
                    className={isMobile ? "px-3 text-xs" : ""}
                  >
                    Criar conta
                  </Button>
                </Link>
              </>
            )}

            {/* LOGADO */}
            {isAuthenticated && (
              <Link to="/app/home">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />

                  {!isMobile && (
                    <span>
                      {userName ?? "Minha Conta"}
                    </span>
                  )}
                </Button>
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
