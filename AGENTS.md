
# Instrucoes para agentes

Objetivo principal: resolver tarefas com o menor uso possivel de tokens, memoria e comandos pesados.

## Contexto do projeto

O **Tarefa360** é uma plataforma de gestão de desempenho e acompanhamento de atividades.
- **Stack:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, ShadCN UI.
- **Backend/Banco de Dados:** Firebase Firestore (acesso via client SDK).
- **IA:** Genkit para fluxos generativos (quando aplicável).
- **Perfis de Usuário:** Administrador, Avaliador e Avaliado.
- **Funcionalidades Chave:** Login por CPF, gestão de períodos de avaliação, associações dinâmicas entre avaliadores e avaliados por ano, registro de progresso mensal de atividades e geração de relatórios consolidados em PDF.
- **Arquitetura:** Componentes de interface baseados em Radix UI (via ShadCN), estado global centralizado no `DataContext.tsx` e lógica de negócio compartilhada em `src/app/shared`.

## Regras permanentes

- Seja objetivo.
- Evite respostas longas quando uma resposta curta resolver.
- Nao gere codigo sem solicitacao.
- Nao repita informacoes ja definidas anteriormente.
- Considere decisoes aprovadas como regras permanentes do projeto.
- Preserve compatibilidade com decisoes anteriores.
- Quando houver mais de uma solucao possivel, apresente vantagens, desvantagens e uma recomendacao tecnica.
- Priorize simplicidade, manutencao e escalabilidade.

## Autonomia

Resolva a tarefa completa antes de responder.

Não peça confirmação para:

- renomeações;
- refatorações locais;
- criação de métodos privados;
- ajustes de import;
- correções de lint;
- melhorias de legibilidade.

Pergunte somente quando a decisão alterar regra de negócio, contrato de API, banco de dados ou comportamento funcional.

## Modo economico

- Antes de ler arquivos grandes, use buscas direcionadas para localizar símbolos ou textos exatos.
- Evite abrir README, lockfiles, JSONs grandes, changelogs, assets e arquivos gerados sem necessidade.
- Nao liste a arvore inteira do projeto quando uma busca direcionada resolver.
- Mantenha respostas curtas: diga o que mudou, onde mudou e como foi validado.
- Nao explique codigo obvio. Explique somente decisoes, riscos ou pontos nao triviais.

## Edicao

- Faca mudancas pequenas e localizadas.
- Preserve o padrao existente de Next.js, ShadCN e Tailwind.
- Nao refatore arquivos fora do escopo pedido.
- Nao reverta alteracoes existentes do usuario.
- Prefira nomes claros a comentarios longos.
- Use UTF-8 para garantir suporte a acentuação em português (pt-BR).

## Testes e validacao

- Rode o menor teste relevante para a mudanca.
- Para frontend, verifique a renderização e o comportamento esperado do componente.
- Se não rodar testes, informe isso e o motivo.
- Evite builds completos se uma validacao menor der confianca suficiente.

## Comandos uteis

- `npm run dev` - Iniciar ambiente de desenvolvimento.
- `npm run typecheck` - Validar tipos TypeScript.

## Ao responder

- Responda em portugues.
- Comece pelo resultado.
- Cite caminhos de arquivos alterados.
- Inclua comandos executados somente quando forem relevantes.
- Nao despeje logs longos; resuma erros e proximos passos.
