# ACTA ◈ Arquivo Narrativo da Vida

**ACTA v0.3.0-alpha — Connections & Time**

A private-first narrative life archive with acts, chapters, memories, missions and a personal codex of meaningful people.

O ACTA é um aplicativo web **local-first** para narrar a própria vida em atos, capítulos, eventos, missões, pessoas e memórias. Não exige conta, backend, banco remoto, IA ou serviços pagos. O código pode ser público; **os dados do arquivo são salvos apenas no navegador e não devem ser publicados no GitHub**.

> **Aviso de privacidade importante:** IndexedDB não é criptografado. Pessoas que utilizem o mesmo perfil de navegador ou scripts de outras páginas com a mesma origem podem acessar registros locais. Em especial, sites GitHub Pages sob `https://usuario.github.io/` compartilham a **mesma origem**, mesmo em diferentes repositórios/caminhos. Para informações realmente sensíveis, use uma origem exclusiva (por exemplo, um domínio dedicado) e avalie aguardar armazenamento criptografado de ponta a ponta. Faça backups criptografados e preserve a senha.

## Atualização segura a partir das versões anteriores

1. **Antes de substituir qualquer arquivo, faça um backup criptografado** em Configurações na sua versão atual. Guarde a senha e o arquivo `.acta` fora do GitHub.
2. Abra **o mesmo repositório** e publique os arquivos da **v0.3.0-alpha** com o GitHub Actions. Não altere o domínio/origem do aplicativo ao atualizar.
3. O ACTA lê a estrutura local antiga (schema 1 ou 2), valida antes da conversão e migra para **schema 3**, preservando IDs, códigos históricos, memórias, capítulos e avaliações. Cria somente as coleções vazias necessárias (`connections` e `groups`) e o histórico de correções.
4. Confirme no site publicado: pessoas antigas, porcentagens, eventos vinculados, Configurações, gráficos e exportação de backup.
5. Não limpe os dados do site, o IndexedDB ou o perfil do navegador durante uma atualização. O backup é seu meio de recuperação se o armazenamento local falhar.

## Funcionalidades da v0.3.0-alpha

- **Gráfico individual:** cada ficha exibe duas séries: quanto você se sente próximo e quanto imagina que a outra pessoa se sente próxima. Eixo temporal com datas reais, filtros de período, pontos com descrição e tabela acessível.
- **Gráfico geral:** na Lista de porcentagens, uma linha por pessoa; alternância entre proximidade e reciprocidade, recorte de datas, legenda e tabela de pontos. Pessoas sem registros datados são omitidas do gráfico (mas continuam no Codex).
- **Comparação temporal:** compare duas datas na ficha individual e na lista geral. O sistema usa o último registro datado conhecido até cada data e mantém campos desconhecidos como `—`, sem transformá-los em zero nem supor sentimentos reais.
- **Conexões:** vínculos entre duas pessoas do Codex com tipo, período e observação subjetiva; a ligação aparece em ambas as fichas e pode ser editada ou excluída.
- **Grupos/organizações:** círculos narrativos com nome, descrição, período e integrantes. Edições guardam instantâneos anteriores no histórico interno do backup.
- **Correções com auditoria:** corrija data, porcentagem ou nota de uma avaliação antiga com motivo obrigatório; o valor anterior fica acessível na ficha e o encadeamento posterior permanece coerente.
- **Referências a acontecimentos:** continue associando avaliações a uma memória ou evento, com título e acesso às informações na ficha.
- **Filtros:** por vínculo principal, arquétipo, tags, situação sem contato, aniversários do mês, existência de histórico/conexão, ato de participação e múltiplas tags simultâneas.
- **Tutorial guiado expandido:** destaque contextual nas telas de gráficos gerais, comparação temporal, vínculos, grupos, correções e nos recursos anteriores; setas esquerda/direita e botão para reiniciar.
- **Recursos anteriores preservados:** atos/capítulos, Codex, pesquisa, aniversários, símbolos, arquétipos narrativos, memórias, missões, exportação criptografada, temas e IndexedDB.

### Entendendo os gráficos

Os pontos representam avaliações efetivamente registradas com data completa válida (`AAAA-MM-DD`). Os segmentos ligam esses pontos visualmente, mas o ACTA **não gera estimativas para datas intermediárias**. Avaliações sem data continuam no histórico, mas não são colocadas arbitrariamente no eixo temporal. Dados desconhecidos permanecem ausentes. Os percentuais são percepções privadas, não medidas científicas ou juízos objetivos sobre terceiros.

### Privacidade

Não há conta, banco remoto, analytics ou requisições de API para processar memórias. O IndexedDB **não é criptografado em repouso**. Backups criptografados usam Web Crypto (AES-256-GCM com derivação de senha PBKDF2-SHA256). GitHub Pages no mesmo domínio de usuário compartilha a origem entre projetos — use domínio isolado para arquivos sensíveis.

## Tecnologias

JavaScript ES Modules, CSS, Web Components nativos do navegador (DOM renderizado sem framework), Vite 6 para build, IndexedDB, Web Crypto API e testes com o executor nativo do Node.js. **Vue/Pinia não são dependências:** no MVP, a escolha foi usar frontend nativo para reduzir carga inicial, dependências e superfície de atualização. Vite é usado para gerar os arquivos de publicação. O app não usa analytics, Google Fonts nem CDNs.

## Estrutura

```text
acta-personal-archive/
├── index.html                  Interface de entrada
├── vite.config.js              Base automática para GitHub Pages
├── package.json                Build e testes
├── .gitignore                  Exclui dados privados e dist
├── .github/workflows/deploy.yml Publicação via GitHub Actions
├── public/
│   ├── favicon.svg
│   └── sw.js                    Cache offline de recursos estáticos
├── src/
│   ├── main.js                 Interface, navegação e formulários
│   ├── style.css               Tema, desktop e mobile
│   ├── lib/
│   │   ├── model.js            Entidades, CRUD, IDs, vínculos, validação
│   │   ├── search.js           Busca global
│   │   ├── storage.js          IndexedDB
│   │   └── backup.js           Importação / exportação / criptografia
│   └── tests/                 Testes automáticos
├── docs/
│   ├── GUIA-DE-USO.md
│   ├── BACKUP-E-PRIVACIDADE.md
│   ├── PUBLICAR-NO-GITHUB.md
│   ├── TESTES.md
│   ├── RELEASE-NOTES-v0.1.0-alpha.md
│   ├── RELEASE-NOTES-v0.2.0-alpha.md
│   └── RELEASE-NOTES-v0.2.1-alpha.md
├── ROADMAP.md
└── CHANGELOG.md
```

## Executar localmente

Requer **Node.js 20+** e npm, além de navegador moderno com IndexedDB e Web Crypto.

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

Para verificar:

```bash
npm run check
npm run build
npm run preview
```

### Alternativa simples, sem instalar dependências

Como os módulos de runtime são JavaScript nativo, você também pode servir **a raiz do projeto** com um servidor HTTP estático, por exemplo `python3 -m http.server 8000`, e abrir `http://localhost:8000`. **Não abra `index.html` diretamente com `file://`** (restrições de origem). Na execução sem Vite, o service worker e o favicon podem não ser encontrados na raiz, pois seus arquivos estão em `public/`. Para experiência completa, use `npm run dev` ou o site compilado.

## Publicação rápida via navegador GitHub

1. Crie o repositório `acta-personal-archive`, de preferência público para servir GitHub Pages gratuito (arquivos do repositório são somente código, não seus registros).
2. Extraia o ZIP e envie os **arquivos do projeto**, incluindo a pasta oculta `.github`, para a raiz do repositório, usando **Add file → Upload files**. **Não envie o ZIP como único arquivo**.
3. Entre em **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. O workflow `.github/workflows/deploy.yml` é disparado por um commit na branch `main`. Veja a aba **Actions**; aguarde build e deploy concluírem.
5. Abra `https://USUARIO.github.io/acta-personal-archive/` (substitua `USUARIO`). Se o repositório for `USUARIO.github.io`, a URL é a raiz.

**Tutorial detalhado, solução de erros e criação de release:** [`docs/PUBLICAR-NO-GITHUB.md`](docs/PUBLICAR-NO-GITHUB.md).

### Atualizações

- Acesse o repositório, substitua arquivos alterados usando o navegador e faça commit.
- Atualize `package.json`, `CHANGELOG.md`, `ROADMAP.md` e as release notes conforme a versão.
- Se publicar uma versão nova, altere `CACHE` em `public/sw.js` para invalidar o cache antigo.
- Crie a **Release** em **Releases → Draft a new release** com tag `v0.3.0-alpha`, usando `docs/RELEASE-NOTES-v0.3.0-alpha.md`.
- **Não carregue arquivos `.acta`, backups, dados pessoais ou os arquivos `dist`/`node_modules`** no repositório.

## Limitações honestas da versão alpha

- Não há autenticação, banco remoto, sincronização entre dispositivos, criptografia do IndexedDB em repouso, controle de acesso por senha, anexos genéricos, editor visual de grafo ou relatórios PDF.
- Excluir um registro não tem lixeira; faça backup antes.
- Categorias principais e situações são conjuntos iniciais fixos; cores, tags e arquétipos podem ser personalizados. Outros tipos de categorias e classificações avançadas estão no roadmap.
- As avaliações são registradas em sequência de criação e visualizadas cronologicamente quando contêm data completa. É possível corrigir registros antigos com motivo e auditoria; a exclusão de entradas usa confirmação e restrições de integridade.
- Porcentagens são apenas estimativas do autor; não expressam certeza sobre sentimentos de outras pessoas.
- Os lembretes de aniversário não chegam como notificações push e o app não executa em segundo plano.
- Não há detecção automatizada de caráter, diagnóstico ou análise de terceiros.
- Arquivos grandes ou dezenas de milhares de registros podem ultrapassar a quota do navegador.
- Primeira execução offline e persistência de longo prazo dependem de navegador, cache, origem e configurações.

Consulte [`ROADMAP.md`](ROADMAP.md), [`CHANGELOG.md`](CHANGELOG.md) e [`docs/TESTES.md`](docs/TESTES.md).

## Licença

Copyright © 2026 ACTA. **Nenhuma licença de reutilização foi concedida neste pacote.** Escolha e adicione um arquivo `LICENSE` antes de permitir redistribuição, alteração ou contribuições por terceiros. A visibilidade pública do repositório não equivale a conceder uma licença de código aberto.

## Atualização a partir da v0.2.1-alpha

Consulte [`docs/ATUALIZAR-v0.3.0.md`](docs/ATUALIZAR-v0.3.0.md). Substitua os arquivos na mesma URL, sem apagar dados do navegador e **sempre exportando um backup criptografado antes**.
