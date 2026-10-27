# ACTA ◈ Arquivo Narrativo da Vida

**ACTA v0.1.0-alpha — The Personal Codex**

A private-first narrative life archive with acts, chapters, memories, missions and a personal codex of meaningful people.

O ACTA é um aplicativo web **local-first** para narrar a própria vida em atos, capítulos, eventos, missões, pessoas e memórias. Não exige conta, backend, banco remoto, IA ou serviços pagos. O código pode ser público; **os dados do arquivo são salvos apenas no navegador e não devem ser publicados no GitHub**.

> **Aviso de privacidade importante:** IndexedDB não é criptografado. Pessoas que utilizem o mesmo perfil de navegador ou scripts de outras páginas com a mesma origem podem acessar registros locais. Em especial, sites GitHub Pages sob `https://usuario.github.io/` compartilham a **mesma origem**, mesmo em diferentes repositórios/caminhos. Para informações realmente sensíveis, use uma origem exclusiva (por exemplo, um domínio dedicado) e avalie aguardar armazenamento criptografado de ponta a ponta. Faça backups criptografados e preserve a senha.

## O que funciona nesta versão

- **ACTA Codex:** criar, editar e excluir fichas; códigos exclusivos; sugestão sequencial por prefixo; códigos históricos após renomeação; codinome principal e histórico de apelidos; status, múltiplas categorias, símbolo e cor; foto local compactada; descrições, período incerto, observações e reflexões datadas.
- **Narrativa:** criar atos com ordem, datas livres, símbolos e status; criar capítulos em atos; associar pessoas a diversos capítulos; navegar entre ficha e capítulo.
- **Memórias:** registrar texto livre, data aproximada ou em branco, tags, grau de certeza, pessoas e capítulo opcional.
- **Eventos e missões:** cadastro, edição, exclusão, vínculos, status, prioridade e notas de progresso.
- **Pesquisa:** em pessoas, atos, capítulos, memórias, eventos e missões por códigos atuais ou anteriores, nomes, codinomes e conteúdo textual. Atalho `Ctrl+K`/`⌘K`.
- **Privacidade e backup:** IndexedDB, exportação JSON em claro ou backup criptografado com senha (AES-256-GCM + PBKDF2-SHA256), importação validada com confirmação de substituição.
- **Interface:** dark/light persistente, responsiva, dados fictícios opcionais, tutorial com foco no elemento e setas de navegação.
- **Offline:** service worker pré-armazena recursos básicos após a primeira visita online bem-sucedida; dados ficam no IndexedDB. Offline não é garantido se o navegador limpar o cache, se as permissões de armazenamento falharem ou se os arquivos não forem armazenados corretamente.

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
│   └── RELEASE-NOTES-v0.1.0-alpha.md
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
- Crie a nova **Release** em **Releases → Draft a new release** com tag `v0.1.0-alpha` para a primeira versão.
- **Não carregue arquivos `.acta`, backups, dados pessoais ou os arquivos `dist`/`node_modules`** no repositório.

## Limitações honestas da versão alpha

- Não há autenticação, banco remoto, sincronização entre dispositivos, criptografia do IndexedDB em repouso, controle de acesso por senha, anexos genéricos, editor visual de grafo ou relatórios PDF.
- Excluir um registro não tem lixeira; faça backup antes.
- Categorias e status são conjuntos iniciais fixos; personalização completa está no roadmap.
- Não há detecção automatizada de caráter, diagnóstico ou análise de terceiros.
- Arquivos grandes ou dezenas de milhares de registros podem ultrapassar a quota do navegador.
- Primeira execução offline e persistência de longo prazo dependem de navegador, cache, origem e configurações.

Consulte [`ROADMAP.md`](ROADMAP.md), [`CHANGELOG.md`](CHANGELOG.md) e [`docs/TESTES.md`](docs/TESTES.md).

## Licença

Copyright © 2026 ACTA. **Nenhuma licença de reutilização foi concedida neste pacote.** Escolha e adicione um arquivo `LICENSE` antes de permitir redistribuição, alteração ou contribuições por terceiros. A visibilidade pública do repositório não equivale a conceder uma licença de código aberto.
