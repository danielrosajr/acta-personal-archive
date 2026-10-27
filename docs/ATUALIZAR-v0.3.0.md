# Atualizar ACTA da v0.2.1 para v0.3.0-alpha pelo navegador do GitHub

1. Abra a versão já publicada e faça um backup criptografado. **Não envie seu arquivo `.acta` para o GitHub.**
2. Extraia `acta-v0.3.0-alpha-github-pages.zip`. Abra a pasta extraída e envie **todos os arquivos do projeto**, inclusive `.github/workflows/deploy.yml`, para a raiz do mesmo repositório (`acta-personal-archive`) usando **Add file → Upload files**.
3. Quando o GitHub solicitar, escolha substituir os arquivos com o mesmo caminho. Não envie a pasta externa inteira como uma subpasta e não envie somente o ZIP.
4. Use o commit `feat: add temporal relationship charts and codex connections`.
5. Em **Settings → Pages**, mantenha **GitHub Actions** como source. Consulte **Actions → Deploy ACTA to GitHub Pages** e verifique os passos `Install dependencies`, `Run tests`, `Build` e `Deploy`.
6. Abra a URL existente; não altere o domínio. Entre em **Lista de porcentagens** e verifique o gráfico de todas as pessoas; abra a ficha de uma pessoa com registros para ver o gráfico individual.
7. Em **Codex**, confira grupos e filtros; em uma ficha, confira **Conexões** e **Comparar dois momentos**. Teste um novo registro e recarregue a página para verificar IndexedDB.
8. Caso o navegador mostre uma versão antiga, recarregue com Ctrl+Shift+R. Se necessário, use ferramentas do navegador para **desregistrar apenas o service worker**; **não** apague IndexedDB, Storage nem dados do site.
9. Em **Releases → Draft a new release**, crie a tag `v0.3.0-alpha`, título `ACTA v0.3.0-alpha — Connections & Time` e cole o conteúdo de `docs/RELEASE-NOTES-v0.3.0-alpha.md`.

**Atenção:** esta versão migra o arquivo local de schema 1/2 para 3. O backup de antes da migração é recomendado. Testes automatizados passaram, mas a publicação precisa validar build Vite e IndexedDB em origem real.
