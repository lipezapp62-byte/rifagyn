import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  showAuth?: boolean;
  userName?: string;
}

export function Header({ showAuth = true, userName }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-white">R</span>
            </div>
            <span className="text-xl font-bold text-gradient">RifaGyn</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">

            {/* 🔒 Quando NÃO estiver logado */}
            {!isAuthenticated && showAuth && (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>

                <Link to="/auth/cadastro">
                  <Button size="sm">
                    Criar conta
                  </Button>
                </Link>
              </>
            )}

            {/* 🔓 Quando estiver LOGADO */}
            {isAuthenticated && (
              <>
                <Link to="/app/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {userName ?? "Minha Conta"}
                    </span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={logout}
                >
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
