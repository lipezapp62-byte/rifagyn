import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, setAuthToken } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    // Máscara correta (xx) x xxxx-xxxx
    const formatPhone = (value: string) => {
        const n = value.replace(/\D/g, "");

        if (n.length <= 2) return `(${n}`;
        if (n.length <= 3) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
        if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3)}`;
        if (n.length <= 11)
            return `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3, 7)}-${n.slice(7)}`;

        return value;
    };

    const handleSubmit = async () => {
        if (!phone || !password) {
            toast.error("Preencha todos os campos");
            return;
        }

        if (password.length < 6) {
            toast.error("Senha mínima: 6 caracteres");
            return;
        }

        try {
            setLoading(true);

            const response = await authApi.login(phone, password);
            const normal = Array.isArray(response) ? response[0] : response;

            if (normal?.success === false) {
                toast.error(normal.message || "Erro ao autenticar");
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

            setAuthToken(token.toString().replace(/^=+/, ""));
            login();

            toast.success("Login realizado!");
            navigate("/");
        } catch (err: any) {
            toast.error(err.message || "Erro de autenticação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center py-10 px-4">
            <div className="relative bg-card p-5 rounded-xl w-full max-w-sm space-y-4 border border-border shadow-xl">

                {/* BOTÃO DE FECHAR */}
                <button
                    onClick={() => navigate("/")}
                    className="
      absolute right-3 top-3 
      text-muted-foreground 
      hover:text-white 
      transition-colors 
      p-1
    "
                >
                    ✕
                </button>

                {/* Logo */}
                <div className="flex justify-center">
                    <img
                        src="https://i.imgur.com/zPRYpQE.png"
                        className="w-36 h-34 object-contain -mb-1"
                    />
                </div>

                {/* Título */}
                <h2 className="text-center text-white text-lg font-semibold">
                    Acessar conta
                </h2>

                {/* Caixa laranja */}
                <div className="text-center text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg py-2 px-3 leading-tight">
                    Após acessar sua conta você poderá visualizar os seus números!
                </div>

                {/* Campos */}
                <div className="space-y-3">
                    <div>
                        <Label>Telefone</Label>
                        <Input
                            placeholder="(xx) x xxxx-xxxx"
                            maxLength={16}
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                        />
                    </div>

                    <div>
                        <Label>Senha</Label>
                        <Input
                            type="password"
                            placeholder="no mínimo 6 dígitos"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* Botão */}
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
                    ) : (
                        "Entrar"
                    )}
                </Button>

                {/* Link para cadastro */}
                <div className="text-center text-xs text-muted-foreground">
                    Não tem conta?{" "}
                    <Link to="/auth/cadastro" className="text-[#ff6100] font-semibold">
                        Criar conta
                    </Link>
                </div>
            </div>
        </div>
    );
}
