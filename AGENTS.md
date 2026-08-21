
# Instrucoes para agentes

Objetivo principal: resolver tarefas com o menor uso possivel de tokens, memoria e comandos pesados.

## Contexto do projeto

O **Tarefa360** é uma plataforma de gestão de desempenho e acompanhamento de atividades.
- **Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, ShadCN UI.
- **Backend/Banco de Dados:** Firebase Firestore (acesso via client SDK).
- **IA:** Genkit para fluxos generativos.
- **Perfis de Usuário:** Administrador, Avaliador e Avaliado.
- **Funcionalidades Chave:** Login por CPF, gestão de períodos de avaliação (Novembro a Outubro), associações por ano, registro de progresso e geração de relatórios PDF.

## Regras permanentes

- Seja objetivo.
- Evite respostas longas quando uma resposta curta resolver.
- Nao gere codigo sem solicitacao.
- Nao repita informacoes ja definidas anteriormente.
- Considere decisoes aprovadas como regras permanentes do projeto.
- Preserve compatibilidade com decisoes anteriores.
- Priorize simplicidade, manutencao e escalabilidade.

## Autonomia

Resolva a tarefa completa antes de responder.
Não peça confirmação para: renomeações, refatorações locais, criação de métodos privados, ajustes de import, correções de lint ou melhorias de legibilidade.

Pergunte somente quando a decisão alterar regra de negócio, contrato de API, banco de dados ou comportamento funcional.

## Modo economico

- Antes de ler arquivos grandes, use buscas direcionadas para localizar símbolos ou textos exatos.
- Evite abrir README, lockfiles, JSONs grandes, assets e arquivos gerados sem necessidade.
- Mantenha respostas curtas.
- Nao explique codigo obvio.

## Edicao

- Faca mudancas pequenas e localizadas.
- Preserve o padrao existente de Next.js, ShadCN e Tailwind.
- Use UTF-8 para garantir suporte a acentuação em português (pt-BR).

## Testes e validacao

- Verifique a renderização e o comportamento esperado do componente.
- Se não rodar testes, informe isso e o motivo.

## Comandos uteis

- `npm run dev` - Iniciar ambiente de desenvolvimento.
- `npm run typecheck` - Validar tipos TypeScript.

## Ao responder

- Responda em portugues.
- Comece pelo resultado.
- Cite caminhos de arquivos alterados.
