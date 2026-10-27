# ACTA — Publicar no GitHub Pages, pelo navegador

Este guia não exige instalar Git nem fazer `git push` pelo terminal. O GitHub Actions executará o build Vite e publicará o site automaticamente.

## 1. Nome e descrição do repositório

**Nome:** `acta-personal-archive`

**Descrição (cole no GitHub):**

> A private-first narrative life archive with acts, chapters, memories, missions and a personal codex of meaningful people.

**Visibilidade:** Público se você pretende utilizar o GitHub Pages de um plano que exija repositório público. Somente o **código-fonte** deve ser publicado. Os registros pessoais continuam no IndexedDB do navegador, sujeito aos avisos de privacidade no README.

## 2. Criar o repositório

1. No GitHub, clique no menu **+ → New repository**.
2. Escolha o proprietário da conta e digite `acta-personal-archive`.
3. Preencha a descrição acima.
4. Você pode deixar **Add a README** desmarcado (já fornecemos um `README.md`).
5. Clique em **Create repository**.

## 3. Enviar os arquivos via navegador

**Se está atualizando a v0.1 ou v0.2:** antes de substituir os arquivos, acesse o ACTA antigo no mesmo navegador e **exporte um backup criptografado**. A v0.2 e a v0.2.1 convertem dados locais antigos automaticamente quando acessada na mesma origem. Atualize/substitua todos os arquivos da pasta `src/`, além dos documentos, `package.json`, `public/sw.js` e os demais arquivos do ZIP; não mescle uma versão antiga de `src/main.js` com o novo modelo.

1. Extraia o arquivo ZIP em seu computador.
2. Abra o novo repositório em `https://github.com/USUARIO/acta-personal-archive`.
3. Clique em **Add file → Upload files**.
4. Arraste **o conteúdo de dentro da pasta extraída** para a tela de upload — `index.html`, `package.json`, `vite.config.js`, `src/`, `public/`, `docs/`, `README.md`, `CHANGELOG.md`, `ROADMAP.md` etc.
5. Confirme que a pasta **`.github/workflows/deploy.yml`** também foi enviada. Em alguns gerenciadores, pastas iniciadas com `.` ficam ocultas; use `Ctrl+H` no Linux para mostrar arquivos ocultos. Se o upload não trouxer `.github`, vá em **Add file → Create new file**, escreva o caminho `.github/workflows/deploy.yml` e cole o conteúdo do arquivo fornecido.
6. No campo de mensagem de commit, cole: `fix: restore Codex Settings and guided tutorial`.
7. Selecione **Commit directly to the main branch** e confirme.

**Nunca envie** backups `.acta`, arquivos JSON pessoais, `node_modules`, `dist`, banco de dados local ou fotos privadas exportadas.

## 4. Configurar GitHub Pages

1. No repositório, abra **Settings**.
2. No menu lateral, escolha **Pages**.
3. Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. Não use “Deploy from a branch” para este projeto Vite: o workflow é responsável por gerar a pasta `dist/` antes da publicação.
5. Em **Actions**, permita a execução do workflow se o GitHub solicitar a confirmação inicial.
6. Caso o primeiro push tenha ocorrido antes de você ativar Pages, vá em **Actions → Deploy ACTA to GitHub Pages → Run workflow** e execute na branch `main`, ou faça um novo commit.

## 5. O que o workflow faz

O arquivo `.github/workflows/deploy.yml` já foi incluído no ZIP. Ele:

1. Baixa o código do repositório com `actions/checkout`.
2. Prepara Node.js 22 com `actions/setup-node`.
3. Instala as dependências usando `npm install`.
4. Executa `npm run check` (testes + checagem sintática).
5. Compila os arquivos via `npm run build` (Vite).
6. Configura GitHub Pages e envia a pasta `dist` como artefato.
7. Publica o conteúdo com `actions/deploy-pages`.

As permissões `contents: read`, `pages: write`, `id-token: write` já estão configuradas. O workflow dispara quando a branch `main` recebe um commit ou por **Run workflow**.

**Nota sobre npm:** não foi gerado `package-lock.json` porque o ambiente de criação não pôde obter as dependências do registro npm. Por isso, o workflow usa `npm install`, e não `npm ci`. Em atualização futura, gere e inclua o lockfile e altere o workflow para `npm ci` para obter builds mais reproduzíveis.

## 6. Entender a configuração Vite

Em sites do tipo `https://USUARIO.github.io/REPOSITORIO/`, Vite precisa compilar caminhos usando `base: '/REPOSITORIO/'`. O arquivo `vite.config.js` detecta automaticamente o nome do repositório no GitHub Actions (`GITHUB_REPOSITORY`) e ajusta o `base`.

- `USUARIO.github.io/acta-personal-archive/`: `base = '/acta-personal-archive/'`.
- `USUARIO.github.io/` com repositório `USUARIO.github.io`: `base = '/'`.
- Domínio personalizado na raiz: defina a variável de ambiente `ACTA_BASE=/` no workflow, caso seja necessário.

O app usa navegação por `#/rota` para evitar erro 404 ao recarregar páginas internas no GitHub Pages.

## 7. Verificar publicação

1. Abra a aba **Actions** e clique na última execução **Deploy ACTA to GitHub Pages**.
2. Confirme que as etapas `build` e `deploy` estão verdes.
3. Acesse a URL informada em **Settings → Pages**, normalmente `https://USUARIO.github.io/acta-personal-archive/`.
4. Abra o ACTA, crie uma **pessoa fictícia**, atualize a página e verifique se ela permaneceu (IndexedDB).
5. Faça um backup criptografado e restaure em **outro perfil de navegador** para testar a importação sem arriscar os dados reais.
6. Use as ferramentas de desenvolvedor para verificar erros de carregamento de `.js`, `.css` ou service worker.

## 8. Resolver erros comuns

### Página em branco
- Verifique **Actions**: o build precisa concluir.
- Confirme que `src/`, `index.html`, `public/`, `package.json` e `.github/workflows/deploy.yml` estão presentes no repositório, não dentro de uma subpasta extra.
- Confirme **Settings → Pages → Source: GitHub Actions**.
- Faça um refresh forçado (`Ctrl+Shift+R`) e confira o console. Se o service worker estiver antigo, limpe o cache **após realizar backup**.

### 404 em arquivos JS/CSS
- O nome do repositório no deploy deve coincidir com `GITHUB_REPOSITORY`, e Vite deve ter gerado a base correta. Confira `vite.config.js`.
- Se usou nome de repositório diferente, a detecção automática normalmente resolverá no workflow.

### Workflow não aparece
- Verifique se o arquivo está no caminho exato `.github/workflows/deploy.yml` na branch `main`.
- Verifique as permissões do GitHub Actions no repositório.

### Site carrega, mas meus dados sumiram
- Confirme que está no **mesmo navegador e perfil** e na **mesma origem**.
- Dados locais não são parte do GitHub. Use um backup anterior.
- Não limpe os dados do site sem criar backup.

## 9. Criar a release de atualização

1. Abra **Releases → Draft a new release**.
2. Escolha **Create new tag**: `v0.2.0-alpha`, com destino na branch `main`.
3. Título: `ACTA v0.2.0-alpha — Codex Evolved`.
4. Cole o conteúdo de `docs/RELEASE-NOTES-v0.2.0-alpha.md`.
5. Marque **Set as a pre-release**.
6. Publique com **Publish release**.
7. Opcionalmente, anexe o ZIP do código-fonte preparado para esta entrega. Não anexe backups pessoais.

## 10. Publicar novas versões pelo navegador

Substitua os arquivos modificados usando **Upload files**, faça um commit `feat: ...` / `fix: ...`, atualize versão e changelog e rode novamente o workflow. Para novas versões com recursos estáticos alterados, atualize a constante `CACHE` em `public/sw.js`. Repita o processo de Release com uma nova tag.

## Referências oficiais

- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub workflow personalizado: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Vite estático em GitHub Pages: https://vite.dev/guide/static-deploy.html


## Atualização específica: v0.2.0-alpha → v0.2.1-alpha

Para corrigir a página de Configurações e o tutorial, siga `HOTFIX-v0.2.1.md`. Não é necessário recriar o repositório, migrar o banco ou apagar os dados do navegador.
