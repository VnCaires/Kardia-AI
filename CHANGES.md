# Mudanças implementadas no Kardia AI

## 1. Tela de login inicial
- Adicionei uma tela de autenticação com visual alinhado ao design do projeto, usando cards translúcidos, gradientes sutis e componentes de formulário consistentes com a identidade visual atual.
- A tela exibe feedback visual para erros de autenticação.
- A senha padrão para o acesso administrativo é kardia-admin.

## 2. Backend em FastAPI
- Implementei um backend em Python com FastAPI para lidar com:
  - login de usuários
  - registro básico de usuários
  - salvamento e leitura de decks
  - endpoints de saúde e autenticação simples
- A API roda localmente em http://127.0.0.1:8000 e pode ser iniciada com uvicorn.

## 3. Banco de dados escolhido
- Optei por SQLite como banco de dados local porque o projeto ainda é uma aplicação de estudo individual com persistência simples, sem necessidade imediata de escalabilidade distribuída ou alta concorrência.
- SQLite é leve, já vem com Python, não exige servidor separado e se encaixa bem para o estágio atual do produto.
- A estrutura é simples e pode crescer para tabelas adicionais de usuários, decks e metadados sem exigir uma migração complexa.

## 4. Estrutura de dados
- O backend usa arquivos JSON inicialmente para persistir usuários e decks, o que facilita o desenvolvimento rápido e a execução local.
- O banco relacional pode ser expandido futuramente com tabelas explícitas para usuários, decks e cards, mantendo a lógica de recuperação bem organizada.

## 5. Documentação
- Atualizei o README com instruções para rodar o frontend, o backend e configurar o ambiente local.
- Este arquivo descreve as decisões de implementação e os próximos passos para evolução do sistema.
