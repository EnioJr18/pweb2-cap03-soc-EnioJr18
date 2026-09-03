# Padrão de commits da atividade

Refatore em **etapas pequenas**, com **um commit por etapa**, no padrão
**[Conventional Commits](https://www.conventionalcommits.org/pt-br/)**. Como é uma
refatoração, o tipo mais usado é **`refactor`** (muda a estrutura sem mudar o comportamento).

## Formato

```
<tipo>(<escopo>): <descrição no imperativo, minúscula, sem ponto final>
```

- **tipo:** `refactor` (extrair/reorganizar), `feat` (só se adicionar comportamento), `fix`, `chore`.
- **escopo:** `router`, `controller`, `middleware`, `app`.

## Sequência sugerida (uma etapa = um commit)

| Commit | Mensagem |
|---|---|
| 1 | `refactor(router): extrai as rotas de usuários para src/routes com express.Router` |
| 2 | `refactor(controller): move a lógica das rotas para src/controllers` |
| 3 | `refactor(middleware): extrai a validação do POST para um middleware` |
| 4 | `refactor(middleware): adiciona middleware de erro (err, req, res, next)` |
| 5 | `refactor(app): deixa o server.js só com a configuração do app` |

> Após **cada** commit, rode `npm run check` (ou dê `push` e veja o Actions): o **comportamento**
> deve continuar 100% e a **estrutura** vai ficando verde a cada etapa.

## Exemplo com corpo (opcional)

```
refactor(controller): move a lógica das rotas para src/controllers

As funções listar/obter/criar/atualizar/remover saem do arquivo de rotas.
As rotas passam a apenas mapear caminho -> função do controller.
```
