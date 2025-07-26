# Documentação do Aplicativo: Tarefa360 Companion

## 1. Visão Geral

O **Tarefa360 Companion** é uma aplicação web desenvolvida para gerenciar e acompanhar ciclos de avaliação de desempenho de funcionários. Construído com Next.js, React, TypeScript e utilizando componentes da biblioteca ShadCN/UI, o sistema oferece uma interface moderna, responsiva e intuitiva para três perfis de usuário distintos: Administrador, Avaliador e Avaliado.

O objetivo principal é digitalizar e simplificar o processo de registro e acompanhamento de atividades, permitindo que avaliadores e avaliados tenham uma visão clara do progresso ao longo do tempo e facilitando a geração de relatórios consolidados.

## 2. Tecnologias Utilizadas

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **UI Framework:** React
- **Componentes:** ShadCN/UI
- **Estilização:** Tailwind CSS
- **Estado Global:** React Context API
- **Geração de PDF:** `jspdf` e `html2canvas`

## 3. Estrutura do Projeto

O projeto segue uma organização baseada em funcionalidades e papéis de usuário.

```
src/
├── app/
│   ├── (admin)/         # Rotas e telas exclusivas do Administrador
│   │   ├── dashboard/
│   │   └── profile/
│   ├── (appraisee)/     # Rotas e telas exclusivas do Avaliado
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── reports/
│   ├── (appraiser)/     # Rotas e telas exclusivas do Avaliador
│   │   ├── dashboard/
│   │   ├── appraisee/[id]/
│   │   ├── profile/
│   │   └── reports/
│   ├── shared/          # Componentes de página reutilizados
│   │   ├── profile/
│   │   └── reports/
│   ├── globals.css      # Estilos globais e tema (ShadCN)
│   ├── layout.tsx       # Layout raiz da aplicação
│   └── page.tsx         # Página de Login
│
├── components/
│   ├── ui/              # Componentes base da biblioteca ShadCN
│   └── logo.tsx         # Componente do logo da aplicação
│
├── context/
│   └── DataContext.tsx  # Provedor de estado global (mock de dados)
│
├── hooks/
│   ├── use-mobile.tsx   # Hook para detectar telas móveis
│   └── use-toast.ts     # Hook para exibir notificações (toasts)
│
├── lib/
│   ├── mock-data.ts     # Dados simulados para a aplicação
│   ├── types.ts         # Definições de tipos TypeScript
│   └── utils.ts         # Funções utilitárias (ex: cn)
```

## 4. Funcionalidades Principais

### 4.1. Sistema de Login

-   **Arquivo:** `src/app/page.tsx`
-   **Funcionamento:** A tela inicial é a de login. O usuário insere seu CPF (11 dígitos, apenas números). O sistema verifica o CPF no `DataContext` e, se encontrado, redireciona o usuário para o dashboard correspondente ao seu `role` (`admin`, `appraiser`, ou `appraisee`).

### 4.2. Painel do Administrador

-   **Localização:** `src/app/admin/dashboard/page.tsx`
-   **Funcionalidades:**
    1.  **Gerenciamento de Contas:** Uma tabela exibe todos os usuários do sistema. O admin pode:
        -   **Editar Usuários:** Clicar no ícone de edição abre um modal (`UserFormModal`) para alterar nome, e-mail, CPF, setor, função e perfil de acesso.
        -   **Criar Contas:** (Botão "Criar Conta" presente, funcionalidade a ser implementada).
        -   **Excluir Contas:** (Botão "Excluir" presente, funcionalidade a ser implementada).
    2.  **Gerenciamento de Períodos de Avaliação:**
        -   **Listagem:** Exibe os ciclos de avaliação, com data de início, fim e status.
        -   **Ativar/Inativar:** O admin pode alternar o status de um período. O sistema garante que apenas um período possa estar "Ativo" por vez.
        -   **Criar/Editar Períodos:** Um modal (`PeriodFormModal`) permite criar novos ciclos de avaliação ou editar os existentes.
    3.  **Gerenciamento de Associações:**
        -   **Criar Vínculos:** Permite associar um "Avaliado" a um "Avaliador" através de dois campos de seleção.
        -   **Listagem:** Exibe as associações existentes, mostrando o nome do avaliado e do avaliador correspondente.

### 4.3. Painel do Avaliado

-   **Localização:** `src/app/appraisee/dashboard/page.tsx`
-   **Funcionalidades:**
    1.  **Registro de Atividades:**
        -   O botão "Registrar Atividade" abre um modal (`ActivityForm`) para que o usuário crie uma nova tarefa, definindo título, descrição e data de início.
    2.  **Visualização de Atividades:**
        -   As atividades são divididas em duas abas: "Em Andamento" e "Concluídas".
        -   Atividades em andamento são exibidas como cards, mostrando o progresso mais recente.
        -   Atividades concluídas (100%) são movidas para uma tabela na aba "Concluídas".
    3.  **Gerenciamento de Atividades:**
        -   **Editar:** O usuário pode editar o título, a descrição e registrar o progresso de suas atividades. O registro de progresso é mensal, onde se insere a porcentagem concluída e um comentário.
        -   **Excluir:** Uma atividade pode ser permanentemente removida.

### 4.4. Painel do Avaliador

-   **Localização:** `src/app/appraiser/dashboard/page.tsx`
-   **Funcionalidades:**
    -   **Listagem de Avaliados:** Exibe uma tabela com todos os funcionários que estão sob a avaliação do avaliador logado.
    -   **Navegação para Relatórios:** Clicar no botão "Ver Atividades" (ou no ícone correspondente em telas pequenas) redireciona o avaliador para a página de detalhes do avaliado.

### 4.5. Relatório de Atividades do Avaliado (Visão do Avaliador)

-   **Localização:** `src/app/appraiser/appraisee/[id]/page.tsx`
-   **Funcionalidades:**
    1.  **Visualização Detalhada:** Exibe todas as atividades de um avaliado específico, agrupadas por mês.
    2.  **Filtro Mensal:** O avaliador pode filtrar as atividades para visualizar o progresso de um mês específico ou de todos os meses do período de avaliação ativo.
    3.  **Visualizar Detalhes da Atividade:** Clicar no título de uma atividade abre o `ActivityForm` em modo de leitura, permitindo ver todos os detalhes e o histórico de progresso.
    4.  **Geração de PDF:**
        -   O botão "Gerar PDF" utiliza `html2canvas` para capturar uma versão para impressão do relatório e `jspdf` para criar um arquivo PDF para download.
        -   O layout do PDF é formatado para se assemelhar a uma "Ficha de Registro de Trabalhos".

### 4.6. Gerenciamento de Perfil

-   **Localização:** `src/app/shared/profile/page.tsx` (componente reutilizado)
-   **Funcionalidades:** Acessível a todos os perfis através do link "Meu Perfil" no menu lateral.
    -   **Atualização de Dados:** Permite ao usuário alterar nome completo, nome social e e-mail.
    -   **Alteração de Avatar:** O usuário pode fazer upload de uma nova foto de perfil (PNG/JPG), com pré-visualização instantânea. A imagem é salva como Data URL.
    -   **Alteração de Senha:** Um formulário dedicado permite a alteração da senha (funcionalidade simulada).

## 5. Gerenciamento de Estado

O estado global da aplicação (usuários, atividades, períodos e associações) é gerenciado através da **React Context API**.

-   **`src/context/DataContext.tsx`**:
    -   Inicializa o estado com dados do arquivo `src/lib/mock-data.ts`.
    -   Disponibiliza o estado e as funções para atualizá-lo (`setUsers`, `setActivities`, etc.) para todos os componentes envolvidos pelo `DataProvider`.
    -   Isso simula um backend, permitindo que as alterações feitas em uma parte da aplicação (ex: admin criando um usuário) sejam refletidas em outra (ex: página de login).

## 6. UI/UX e Componentes Reutilizáveis

-   **Barra Lateral Recolhível:** O componente `src/components/ui/sidebar.tsx` foi customizado para ser recolhível, exibindo apenas ícones e o avatar do usuário no modo compacto. Em telas pequenas, ele se comporta como um menu "off-canvas".
-   **Responsividade:** O layout se adapta a diferentes tamanhos de tela. Em telas menores, tabelas simplificam-se (ocultando colunas menos importantes) e botões de texto transformam-se em botões de ícone.
-   **Notificações (`Toast`):** O `useToast` hook é utilizado para fornecer feedback ao usuário sobre ações bem-sucedidas (ex: "Perfil Atualizado") ou erros (ex: "CPF não encontrado").

## 7. Como Executar o Projeto

1.  **Instalar dependências:**
    ```bash
    npm install
    ```
2.  **Executar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
3.  Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver a aplicação.

### CPFs para Login (Mock)
-   **Admin:** `00000000000`
-   **Avaliador (Ana):** `11111111111`
-   **Avaliador (Roberto):** `22222222222`
-   **Avaliado (Carlos):** `33333333333`

---
