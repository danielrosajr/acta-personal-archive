# ACTA — Testes e verificações (v0.2.1-alpha)

## O que foi executado no ambiente desta entrega

- `npm run check` — **PASSOU**: 9 testes automatizados no executor nativo Node.js, além das verificações de sintaxe dos arquivos JavaScript principais.
- Testes unitários: identificação/códigos antigos/duplicatas, relações pessoa-capítulo, exclusão e preservação de memórias, validação, base demonstrativa, pesquisa textual e backup JSON.
- Backup criptografado: **PASSOU**: criptografia AES-GCM, descriptografia com senha correta, rejeição de senha incorreta e de senha fraca (execução no Node.js Web Crypto).
- Chromium automatizado — **PASSOU na montagem isolada de frontend**: telas do dashboard, criação de pessoa, edição do código e histórico, ato/capítulo, vínculo de participante, memória, pesquisa por código antigo e por trecho textual, tutorial com setas e mudança de telas, sem exceções JS no fluxo exercitado.
- Layout Chromium — **PASSOU na montagem isolada**: viewport desktop 1440 px e mobile 390 px; no mobile a largura do documento permaneceu em 390 px, sem overflow horizontal no dashboard.

## O que não foi possível executar/verificar aqui

- `npm run build`: o ambiente não conseguiu acessar o registro npm para instalar Vite. **O build publicado pelo workflow do GitHub ainda precisa ser confirmado.**
- Navegação por HTTP/HTTPS em navegador automatizado: política de rede do navegador do ambiente bloqueou URLs, inclusive localhost; o teste de interface injetou os módulos de frontend em página isolada. Portanto, essa verificação **não substitui teste ponta a ponta no site servido**.
- Persistência IndexedDB entre recargas e restauro integral na UI: não foram testados em um site servido com origem persistente. Os módulos de armazenamento foram verificados sintaticamente, e a criptografia/validação foi testada de modo unitário.
- Service worker offline após deploy: ainda não validado num ambiente HTTPS real.
- Navegadores Safari/iPhone, Firefox, leitores de tela: não executados neste ambiente.

## Como validar a publicação

1. Faça upload do código e habilite GitHub Actions para GitHub Pages.
2. Abra **Actions**: verifique instalação, testes, build e deploy verdes.
3. No site HTTPS: crie uma pessoa, atualize a página e confirme a permanência.
4. Renomeie `SCP-015` para `ARK-015`; pesquise ambos e confira que acessam a mesma ficha.
5. Crie ato/capítulo e vincule a pessoa; confira ambos os sentidos da navegação.
6. Crie uma memória com data incerta; procure uma palavra do conteúdo.
7. Exporte com senha, restaure em um perfil de navegador vazio, confirme os vínculos.
8. Desconecte a internet **depois da primeira visita e ativação do service worker** e tente reabrir o app.
9. Experimente tema claro, modal de edição no celular e tutorial com teclado.
10. Faça backup antes de qualquer teste de exclusão.

## Comando de teste

```bash
npm run check
```

Os testes principais estão em `src/tests/` e podem ser ampliados com cenários de navegador usando Playwright quando um ambiente com acesso à aplicação estiver disponível.


## Verificações adicionais da v0.2.0-alpha

- **18 testes automatizados** passaram em 2026-10-26: identificadores, vínculos, buscas, schema 1 → 2, categorias/cores, aniversários, arquétipos, tags, histórico de percentuais, referências a eventos/memórias e criptografia de backup.
- Executadas interações no **Chromium em uma montagem isolada** dos módulos JavaScript/CSS: criação de ficha, seleção de símbolo e categorias, nascimento sem ano, arquétipo, tag, registro de proximidade, visualização do ranking, filtros de arquétipo/tag, Dashboard e navegação do tutorial.
- O mesmo teste isolado foi repetido num viewport móvel de **390 × 844 px**; navegação, formulários, ranking e tutorial funcionaram sem rolagem horizontal.
- **Limitações:** a montagem de navegador não roda em uma origem HTTP confiável do site: a execução Chromium com URL HTTP/file é bloqueada neste ambiente. Portanto **não foi validada persistência IndexedDB em página servida, migração real de dados do navegador, service worker, `npm run build`, publicação efetiva GitHub Pages**. Testes unitários da migração/backup passaram; verifique integração após publicar. A montagem do navegador testou o estado em memória.
- `npm run check` verifica testes e sintaxe do código. No GitHub Actions, `npm install`, `npm run check` e `npm run build` são executados no servidor do GitHub.


## Verificações adicionais da v0.2.1-alpha

- `npm run check`: **20 testes passaram** (18 anteriores + 2 testes de regressão: contratos dos imports da UI e existência do tutorial), além de checagem de sintaxe.
- No Chromium, usando montagem isolada dos módulos JS/CSS em `about:blank` devido ao bloqueio HTTP do ambiente, foi verificado: entrada no Dashboard, início automático do guia 01/15, navegação do guia e reinício manual; renderização de Configurações com as 9 cores; salvamento do formulário de preferências; cadastro de pessoa; registro de 56,7% e 44,0% e ranking; **nenhuma exceção JavaScript registrada**.
- **Não foi testado**: persistência real do IndexedDB em URL servida, build Vite local por falta de dependências em cache (`npm install --offline` → `ENOTCACHED`), cache/service worker em HTTPS e deploy de GitHub Pages. O workflow de GitHub Actions continua verificando testes e build no deploy.
