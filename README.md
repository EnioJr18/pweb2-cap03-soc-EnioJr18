# Atividade Cap. 3 — Separation of Concerns

> **Programação Web II — IFAL/Maceió.** Atividade **formativa** (não vale nota). Você recebe uma
> API de usuários que **funciona, mas faz tudo num arquivo só** (`server.js`). Sua missão é aplicar
> **Separation of Concerns (SoC)**: separar cada responsabilidade em seu próprio módulo — **sem
> mudar o comportamento**.

## O conceito: Separation of Concerns

Um mesmo arquivo hoje mistura **quatro responsabilidades** diferentes:

| Responsabilidade (concern) | Hoje (monólito) | Onde deve ficar |
|---|---|---|
| **Roteamento** — qual método/caminho aciona o quê | `app.get/post/...` inline | `src/routes/` (**express.Router**) |
| **Tratamento da requisição** — o que fazer em cada rota | corpo de cada `app.get/...` | `src/controllers/` (**Controller**) |
| **Validação da entrada** | `if (!nome) ...` dentro do POST | `src/middlewares/` (**Middleware** de validação) |
| **Tratamento de erros** | espalhado / ausente | `src/middlewares/` (**Middleware** de erro) |

Quando cada *concern* fica isolado, o código vira mais fácil de ler, testar e evoluir — e é a base
para a arquitetura em camadas do **Capítulo 4**.

> **Escopo desta atividade:** paramos em Roteamento, Controller e Middlewares. A separação da
> **lógica de negócio/dados** (camada de *Service*) é o assunto do **Cap. 4** — não faça agora.

## A regra de ouro

O `server.js` já passa em **todos os testes de comportamento**. Ao separar as responsabilidades,
você **não pode quebrá-los**. O autograder tem duas camadas:

- **ESTRUTURA** — confere que cada *concern* foi movido para o seu módulo.
- **COMPORTAMENTO** — confere que a API continua respondendo igual.

Meta: **100%** (as duas camadas verdes). A cada `git push`, o GitHub Actions roda e mostra o
resultado na aba **Actions** (resumo do job).

## O que você deve produzir

```
src/
├── routes/
│   └── usuarios.routes.js       # concern: ROTEAMENTO (express.Router)
├── controllers/
│   └── usuarios.controller.js   # concern: TRATAMENTO DA REQUISIÇÃO (req → res)
└── middlewares/
    ├── validacao.middleware.js  # concern: VALIDAÇÃO da entrada (usado no POST)
    └── erro.middleware.js       # concern: TRATAMENTO DE ERROS (err, req, res, next)
server.js                        # só a COMPOSIÇÃO do app: express.json(), monta o router, 404 e o middleware de erro
```

### Tarefas (uma responsabilidade de cada vez)

1. **Roteamento** — crie `src/routes/usuarios.routes.js` com `express.Router()`, mova as rotas
   `GET/POST/PUT/DELETE` para lá e monte no app com `app.use('/api/usuarios', usuariosRouter)`.
2. **Controller** — mova o corpo de cada rota para funções em
   `src/controllers/usuarios.controller.js`; as rotas passam a só apontar `caminho → função`.
3. **Validação (middleware)** — extraia a validação do POST para
   `src/middlewares/validacao.middleware.js` e aplique-a **antes** do controller na rota de criação.
4. **Erros (middleware)** — crie `src/middlewares/erro.middleware.js` com a assinatura
   `(err, req, res, next)` e registre-o **por último** no `server.js`.

> Dica: a validação roda **antes** e chama `next()` para seguir; o middleware de erro tem **4
> parâmetros** e captura o que chega via `next(err)`.

## Contrato da API (não pode mudar)

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/usuarios` | — | `200` array |
| GET | `/api/usuarios/:id` | — | `200` usuário · `404` `{erro}` |
| POST | `/api/usuarios` | `{ nome, email }` | `201` criado · `400` se `nome`<2 ou `email` sem `@` |
| PUT | `/api/usuarios/:id` | `{ nome, email }` | `200` atualizado · `404` |
| DELETE | `/api/usuarios/:id` | — | `204` · `404` |
| (qualquer) | rota não mapeada | — | `404` `{erro}` |

## Como rodar e conferir

```bash
npm install
npm start           # sobe em http://localhost:3000
# em outro terminal:
npm run check       # roda o autograder (estrutura + comportamento)
```

O autograder é aberto — leia `autograder/check.mjs` para ver exatamente o que se espera.

## Passo a passo e commits

- Guia detalhado: **[PASSO-A-PASSO.md](PASSO-A-PASSO.md)**.
- Faça **um commit por responsabilidade separada**, no padrão de **[COMMITS.md](COMMITS.md)**.
