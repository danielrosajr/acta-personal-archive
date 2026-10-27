# ACTA v0.2.1-alpha — Hotfix de Configurações e tutorial

**Erro que motivou a correção:** `Uncaught (in promise) ReferenceError: CATEGORIES is not defined`.

O Codex e Configurações consultavam `CATEGORIES` sem importar a constante do módulo `src/lib/model.js`, o que interrompia a renderização dessas telas. O guia também não se iniciava automaticamente no arquivo novo: o código anterior mostrava apenas uma mensagem.

## Atualizar pelo site do GitHub (sem terminal)

1. **Antes de atualizar**, se possível, abra o ACTA na URL publicada e exporte um backup criptografado em Configurações. Se Configurações não abre, **não limpe dados do navegador**: a atualização preserva os registros locais existentes. Exporte o backup após a correção.
2. Baixe e extraia `acta-v0.2.1-alpha-hotfix.zip`.
3. No **mesmo repositório GitHub**, vá em **Add file → Upload files** e envie os diretórios/arquivos extraídos, preservando exatamente os caminhos relativos, especialmente `src/main.js` e `public/sw.js`. Confirme a substituição dos arquivos antigos. Alternativamente, você pode enviar o ZIP completo do projeto, substituindo todos os arquivos.
4. Commit: `fix: restore Codex Settings and guided tutorial`.
5. Em **Actions**, confirme que o workflow `Deploy ACTA to GitHub Pages` ficou verde. Em **Settings → Pages**, a origem da publicação continua **GitHub Actions**.
6. Abra o site na **mesma URL e mesmo perfil do navegador**. Pressione `Ctrl+Shift+R` ou `Ctrl+F5` para recarregar os arquivos públicos.
7. Confira **Configurações**, as cores dos vínculos, o ícone de livro na barra superior e o tutorial. Na primeira visita a um arquivo realmente vazio, o guia abre automaticamente. Em arquivos já usados, clique no botão do livro ou em Configurações → Iniciar tutorial.

## Se ainda aparecer o antigo erro no console

O navegador pode manter um arquivo JS antigo armazenado pelo service worker. Com o site aberto, entre em Ferramentas do desenvolvedor → **Application → Service Workers → Unregister**, e então faça um refresh forçado (`Ctrl+Shift+R`). Isso remove o service worker, **não o IndexedDB**. Não clique em **Clear site data / Limpar dados do site / Clear storage**, porque essas opções podem apagar as memórias e o histórico local do ACTA.

Se o erro continuar, confira o último workflow em **Actions** e se ele publicou o commit que contém `src/main.js` atualizado. No rodapé/sidebar a versão deve aparecer como `v0.2.1-alpha`.

## Compatibilidade e segurança

- Não há alteração de schema, endereços de armazenamento ou nome do IndexedDB nesta correção.
- **Não** envie arquivos de backup pessoais ao GitHub.
- O tutorial não escreve dados fictícios automaticamente e pode ser encerrado com Esc.
- Persistência no site publicado e atualização do service worker devem ser verificadas no seu navegador; não foi possível simular essas verificações via HTTPS neste ambiente.
