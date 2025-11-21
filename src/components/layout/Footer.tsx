export function Footer() {
  return (
    <footer className="border-t border-border mt-12 bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold text-gradient">RifaGyn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Plataforma de rifas online segura e prática. Sua sorte começa aqui!
            </p>
          </div>
          
          {/* Links */}
          <div className="space-y-3">
            <h3 className="font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/auth/login" className="hover:text-primary transition-colors">Entrar</a></li>
              <li><a href="/auth/cadastro" className="hover:text-primary transition-colors">Criar Conta</a></li>
            </ul>
          </div>
          
          {/* Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Informações</h3>
            <p className="text-sm text-muted-foreground">
              Dúvidas? Entre em contato conosco através do nosso suporte.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} RifaGyn. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
