# AgroFlow Frontend

Sistema de gestão agrícola — frontend em Next.js 14 + TypeScript + Tailwind CSS.

## Configuração

1. Instalar dependências:
```bash
npm install
```

2. Configurar variável de ambiente:
```
NEXT_PUBLIC_API_URL=https://agroflow-backend-production-38be.up.railway.app
```

3. Rodar em desenvolvimento:
```bash
npm run dev
```

## Deploy na Vercel

1. Faça push para o GitHub
2. Importe o repositório na Vercel
3. Configure a variável `NEXT_PUBLIC_API_URL` nas configurações do projeto
4. Deploy automático!

## Módulos

- `/login` — Autenticação
- `/dashboard` — Visão geral
- `/clientes` — Gestão de clientes
- `/financeiro` — Controle financeiro
- `/contratos` — Contratos
- `/estoque` — Estoque
- `/fornecedores` — Fornecedores
- `/maquinarios` — Maquinários
- `/documentos` — Documentos
- `/users` — Usuários
