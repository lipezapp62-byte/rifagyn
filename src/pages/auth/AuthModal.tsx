import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, setAuthToken } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  onSuccess: () => void;
}

export function AuthModal({ onSuccess }: AuthModalProps) {
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [animate, setAnimate] = useState(false);

  // Ativa animação de entrada
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(t);
  }, []);

  // === MÁSCARA CORRETA ===
  const formatPhone = (value: string) => {
    const n = value.replace(/\D/g, "");

    if (n.length <= 2) return `(${n}`;
    if (n.length <= 3) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3)}`;
    if (n.length <= 11)
      return `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3, 7)}-${n.slice(7, 11)}`;

    return value;
  };

  const handleSubmit = async () => {
    if (!formData.phone || !formData.password || (mode === "register" && !formData.name)) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Senha mínima: 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      let response =
        mode === "login"
          ? await authApi.login(formData.phone, formData.password)
          : await authApi.register(formData);

      const normal = Array.isArray(response) ? response[0] : response;

      if (normal?.success === false) {
        toast.error(normal.message || "Erro ao autenticar");
        return;
      }

      if (normal?.error === "USER_ALREADY_EXISTS") {
        toast.error("Este usuário já existe!");
        return;
      }

      const token =
        normal?.refresh_token ||
        normal?.data?.refresh_token ||
        normal?.token;

      if (!token) {
        toast.error("Token não retornado");
        return;
      }

      const sanitized = token.toString().replace(/^=+/, "");

      setAuthToken(sanitized);
      login();

      toast.success(mode === "login" ? "Login realizado!" : "Conta criada!");

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    // === BACKDROP COM FADE E BLUR ===
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center 
        bg-black/70 backdrop-blur-sm
        transition-opacity duration-300
        ${animate ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* === CARD COM SCALE + FADE === */}
      <div
        className={`
          bg-card p-5 rounded-xl w-full max-w-sm space-y-4 border border-border
          shadow-2xl 
          transition-all duration-300 ease-out
          ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        {/* LOGO MAIOR */}
        <div className="flex justify-center">
          <img
            src="https://i.imgur.com/zPRYpQE.png"
            className="w-36 h-36 object-contain -mb-1"
          />
        </div>

        {/* TEXTO BRANCO FORA DA CAIXA */}
        <h2 className="text-center text-white text-lg font-semibold">
          Acesse uma conta para prosseguir!
        </h2>

        {/* BLOCO LARANJA */}
        <div className="text-center text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg py-2 px-3 leading-tight">
          Essa é a última tela<br />antes do pagamento!
        </div>

        {/* FORMULÁRIO */}
        <div className="space-y-3">

          {/* Nome — só no modo cadastro */}
          {mode === "register" && (
            <div>
              <Label>Nome</Label>
              <Input
                placeholder="seu nome aqui"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          )}

          {/* Telefone */}
          <div>
            <Label>Telefone</Label>
            <Input
              placeholder="(xx) x xxxx-xxxx"
              value={formData.phone}
              maxLength={16}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: formatPhone(e.target.value),
                })
              }
            />
          </div>

          {/* Senha */}
          <div>
            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="no mínimo 6 dígitos"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
        </div>

        {/* BOTÃO PRINCIPAL */}
        <Button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-[#ff6100] text-black font-bold h-11"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : mode === "login" ? (
            "Entrar"
          ) : (
            "Criar conta"
          )}
        </Button>

        {/* ALTERNADOR LOGIN / REGISTRO */}
        <div className="text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-[#ff6100] font-semibold"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-[#ff6100] font-semibold"
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
