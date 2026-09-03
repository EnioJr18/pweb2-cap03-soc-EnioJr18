# Passo a passo da atividade — Separation of Concerns

> Você vai pegar uma API que **faz tudo num arquivo** (`server.js`) e **separar cada
> responsabilidade em seu módulo** — sem quebrar o comportamento. A cada responsabilidade
> separada, faça **um commit** e veja a nota subir. Meta: autograder **100%**.

## A ideia

O `server.js` de partida mistura **quatro concerns**. Você vai isolar cada um:

| # | Concern (responsabilidade) | Vai para |
|---|---|---|
| 1 | **Roteamento** — qual método/caminho aciona o quê | `src/routes/usuarios.routes.js` (Router) |
| 2 | **Tratamento da requisição** — o que fazer em cada rota | `src/controllers/usuarios.controller.js` |
| 3 | **Validação** da entrada | `src/middlewares/validacao.middleware.js` |
| 4 | **Tratamento de erros** | `src/middlewares/erro.middleware.js` |

> A separação da **lógica de dados/negócio** (camada de *Service*) **não** faz parte desta
> atividade — isso é o **Capítulo 4**. Por enquanto, os dados podem ficar no controller.

## Pré-requisitos

- Node.js 18+ (`node --version`), Git e uma conta no GitHub.

## Etapa 0 — Crie seu repositório e rode o ponto de partida

1. No template, clique em **"Use this template" → Create a new repository**
   (sugestão de nome: `pweb2-cap03-soc-<seu-usuario>`).
2. Clone e instale:
   ```bash
   git clone <url-do-seu-repo> && cd <seu-repo>
   npm install
   npm start        # http://localhost:3000
   ```
3. Rode o autograder e veja o ponto de partida (em outro terminal):
   ```bash
   npm run check
   ```
   O **comportamento** já está 100%; a **estrutura** está zerada. Seu trabalho é separar os
   concerns **sem** derrubar o comportamento.

## Etapa 1 — Separe o **Roteamento** (commit 1)

- Crie `src/routes/usuarios.routes.js`:
  ```js
  import { Router } from 'express';
  const router = Router();
  // mova para cá: router.get('/', ...), router.get('/:id', ...), router.post('/', ...) etc.
  export default router;
  ```
- No `server.js`, importe e monte: `app.use('/api/usuarios', usuariosRouter);` e **remova** as
  rotas inline de `/api/usuarios`.
- `npm run check` → o item **Roteamento** fica verde; comportamento continua 100%.
- Commit: `refactor(router): separa o roteamento em src/routes com express.Router`

## Etapa 2 — Separe o **Tratamento da requisição** (Controller) (commit 2)

- Crie `src/controllers/usuarios.controller.js` exportando `listar`, `obter`, `criar`,
  `atualizar`, `remover` (mova o corpo das rotas para cá).
- No arquivo de rotas, importe essas funções: `router.get('/', listar)`, etc.
- `npm run check` → **Controller** verde.
- Commit: `refactor(controller): move o tratamento das rotas para src/controllers`

## Etapa 3 — Separe a **Validação** (middleware) (commit 3)

- Crie `src/middlewares/validacao.middleware.js`:
  ```js
  export function validarUsuario(req, res, next) {
    const { nome, email } = req.body ?? {};
    if (!nome || nome.trim().length < 2) return res.status(400).json({ erro: 'Nome inválido (mínimo 2 caracteres)' });
    if (!email || !email.includes('@')) return res.status(400).json({ erro: 'E-mail inválido' });
    next();
  }
  ```
- Aplique **antes** do controller na criação: `router.post('/', validarUsuario, criar)`.
- `npm run check` → **Validação** verde (o POST inválido continua dando 400).
- Commit: `refactor(middleware): separa a validação da criação em um middleware`

## Etapa 4 — Separe o **Tratamento de erros** (middleware) (commit 4)

- Crie `src/middlewares/erro.middleware.js`:
  ```js
  export function middlewareDeErro(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
  ```
- Registre-o **por último** no `server.js`: `app.use(middlewareDeErro);` (depois do 404).
- `npm run check` → **Erros** verde.
- Commit: `refactor(middleware): adiciona middleware de erro (err, req, res, next)`

## Etapa 5 — Deixe o `server.js` só com a **composição** (commit 5)

- O `server.js` deve conter apenas: `express.json()`, `app.use('/api/usuarios', ...)`, o handler
  404 e `app.use(middlewareDeErro)` — **nenhuma rota de `/usuarios` inline**.
- `npm run check` → **100%** (estrutura + comportamento). Dê `git push` e confirme o Actions verde.
- Commit: `refactor(app): deixa o server.js apenas com a composição do app`

## Checklist final

- [ ] `src/routes/usuarios.routes.js` com `express.Router()`
- [ ] `src/controllers/usuarios.controller.js` usado pelas rotas
- [ ] `src/middlewares/validacao.middleware.js` aplicado no POST
- [ ] `src/middlewares/erro.middleware.js` com `(err, req, res, next)`
- [ ] `server.js` sem rotas de `/usuarios` inline
- [ ] Autograder **100%** (Actions verde)

Bom trabalho! 🚀
