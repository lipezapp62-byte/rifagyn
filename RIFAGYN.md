# RifaGyn - Plataforma de Rifas Online

Plataforma moderna de rifas com design dark inspirado no Banco Inter, construída com React, TypeScript, Tailwind CSS e shadcn/ui.

## 🎨 Identidade Visual

### Cores
- **Primária**: `#ff8a00` (laranja) - botões principais, destaques
- **Fundo**: `#1a222a` - fundo principal
- **Fundo de cards**: Variações mais escuras (#111827, #0b1015)
- **Status**:
  - Pendente: Vermelho
  - Pago: Verde
  - Expirado: Cinza

### Tipografia
- **Fonte**: Montserrat (importada via Google Fonts)
- Pesos: 300, 400, 500, 600, 700, 800

## 📂 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── campaign/        # Componentes de campanha
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignProgress.tsx
│   │   ├── CombosGrid.tsx
│   │   ├── QuantitySelector.tsx
│   │   └── NumberGrid.tsx
│   ├── orders/          # Componentes de pedidos
│   │   ├── PixPaymentPanel.tsx
│   │   └── OrderStatusBadge.tsx
│   ├── admin/           # Componentes administrativos
│   │   └── DashboardKpiCard.tsx
│   └── layout/          # Componentes de layout
│       └── Header.tsx
├── pages/
│   ├── Index.tsx        # Home pública
│   ├── auth/            # Autenticação
│   │   ├── Login.tsx
│   │   └── Cadastro.tsx
│   ├── campanha/        # Páginas de campanha
│   │   └── [slug].tsx
│   ├── app/             # Dashboard do participante
│   │   └── Dashboard.tsx
│   └── admin/           # Dashboard administrativo
│       └── Dashboard.tsx
├── lib/
│   ├── api.ts          # Camada de integração com backend
│   └── utils.ts        # Utilitários
└── index.css           # Design system e variáveis CSS
```

## 🚀 Funcionalidades Implementadas

### Público (Sem Login)
- ✅ Home com campanhas em destaque
- ✅ Página de campanha (landing de venda)
- ✅ Sistema de combos (grid 2x3)
- ✅ Seletor de quantidade personalizada
- ✅ Grid visual de números

### Autenticação
- ✅ Login com telefone e senha
- ✅ Cadastro (nome, telefone, senha)
- ✅ "Lembrar login" com localStorage
- ✅ Validação de formulários

### Participante (Usuário Logado)
- ✅ Dashboard com estatísticas
- ✅ Visualização de rifas compradas
- ✅ Lista de pedidos com status
- ✅ Sistema de pagamento PIX integrado

### Checkout/Pagamento
- ✅ Painel PIX com QRCode base64
- ✅ Código PIX copia e cola
- ✅ Cronômetro regressivo de 5 minutos
- ✅ Status visual (pendente/pago/expirado)
- ✅ Feedback de ações (toasts)

### Administrativo
- ✅ Dashboard com KPIs (vendas, receita, usuários)
- ✅ Lista de campanhas
- ✅ Métricas por campanha

## 🔌 Integração com Backend

A plataforma está preparada para integrar com o backend n8n existente através da camada `src/lib/api.ts`.

### Endpoints Principais

```typescript
// Autenticação
authApi.login(phone, password)
authApi.register({ name, phone, password })

// Público
publicApi.getAppHome()
publicApi.getCampaignSummary(idOrSlug)
publicApi.getCampaignCombos(campaignId)
publicApi.getCampaignRules(campaignId)
publicApi.getCampaignFreeNumbers(campaignId)

// Usuário
userApi.getOrders()
userApi.getHistory()
userApi.createOrder({ campaign_id, quantity, combo_id })

// Admin
adminApi.getDashboard()
adminApi.getMyCampaigns()
adminApi.createCampaign(data)
adminApi.updateCampaign(campaignId, data)
```

### Configuração da API

O endpoint base está configurado em `src/lib/api.ts`:

```typescript
const API_BASE = 'https://criadordigital-n8n-webhook.tw9mqd.easypanel.host/webhook/rifagyn';
```

## 🎯 Componentes Reutilizáveis

### CampaignCard
Card de campanha usado na home e listas.
```tsx
<CampaignCard campaign={campaignData} />
```

### CombosGrid
Grid 2x3 de combos com seleção.
```tsx
<CombosGrid 
  combos={combos}
  selectedComboId={selectedId}
  onSelectCombo={handleSelect}
/>
```

### QuantitySelector
Controle de quantidade com +/-.
```tsx
<QuantitySelector
  quantity={qty}
  onQuantityChange={setQty}
  basePrice={price}
/>
```

### PixPaymentPanel
Painel completo de pagamento PIX.
```tsx
<PixPaymentPanel
  orderId={order.id}
  campaignName="Campanha X"
  amount={100}
  pixCode="00020126..."
  qrCodeBase64="iVBORw0KG..."
  status="pending"
  expiresAt="2025-01-01T10:05:00"
/>
```

## 🎨 Design System

### Tokens de Cor
Definidos em `src/index.css`:

```css
--primary: 32 100% 50%;           /* #ff8a00 */
--background: 210 20% 10%;        /* Dark bg */
--card: 210 20% 7%;               /* Card bg */
--paid: 142 71% 45%;              /* Green */
--pending: 0 72% 51%;             /* Red */
--expired: 210 10% 50%;           /* Gray */
```

### Uso no Tailwind
```tsx
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">
</div>
```

## 📱 Mobile-First

Todo o design é otimizado para mobile:
- Grids responsivos (1 col mobile → 2-3 cols desktop)
- Botões com área de toque adequada
- Inputs com máscaras (telefone)
- Cards empilhados em mobile
- Navigation adaptável

## 🔐 Autenticação

Token JWT armazenado em localStorage:
```typescript
setAuthToken(token)    // Salva token
getAuthToken()         // Recupera token
clearAuthToken()       // Remove token
```

## 🎯 Próximas Features (Não Implementadas)

- [ ] Página de minhas rifas (lista detalhada)
- [ ] Página de pedidos (lista completa)
- [ ] Página individual de pedido (/app/pedidos/[id])
- [ ] Página de conta (editar perfil)
- [ ] Página de criação de campanha
- [ ] Página de edição de campanha
- [ ] Listagem completa de campanhas (admin)
- [ ] Filtros e busca
- [ ] Notificações push
- [ ] Compartilhamento social

## 🛠️ Como Desenvolver

1. **Instalar dependências**
```bash
npm install
```

2. **Rodar em desenvolvimento**
```bash
npm run dev
```

3. **Build para produção**
```bash
npm run build
```

## 📝 Notas Importantes

- Todos os componentes usam o design system (sem cores hardcoded)
- Máscaras de telefone: `(62) 99999-9999`
- Datas formatadas com date-fns em pt-BR
- Toasts para feedback de ações (sonner)
- Loading states com skeletons
- Estados vazios com mensagens amigáveis

## 🎨 Customização

Para alterar cores, edite `src/index.css`:

```css
:root {
  --primary: 32 100% 50%;  /* Sua cor primária */
  --background: ...;        /* Cor de fundo */
}
```

Para alterar fonte, edite `index.html` e `tailwind.config.ts`:

```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=SuaFonte:wght@..." />
```

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['SuaFonte', 'sans-serif'],
}
```

## 📄 Licença

Projeto desenvolvido para RifaGyn. Todos os direitos reservados.
