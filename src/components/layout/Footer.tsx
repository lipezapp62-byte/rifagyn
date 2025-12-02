export function Footer() {
  return (
    <footer className="border-t border-border mt-12 bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand / Logo */}
          <div className="space-y-3">
            <div className="flex items-center -ml-24">
              <div className="h-12 w-[320px] flex items-center">
                <img
                  src="https://i.imgur.com/zPRYpQE.png"
                  alt="Logo Rifa Gyn"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Plataforma de rifas online segura e prática. Sua sorte começa aqui!
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://wa.me/5562993875003?text=Quero%20criar%20uma%20rifa%20com%20a%20RifaBnf." className="hover:text-primary transition-colors">Contato</a></li>
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
          <p>© {new Date().getFullYear()} RifaBnf. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
