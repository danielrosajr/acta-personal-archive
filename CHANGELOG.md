# Changelog — ACTA

Todos os marcos futuros são planejados e podem mudar após testes.

## [0.1.0-alpha] — 2026-10-26 — The Personal Codex

### Adicionado
- Dashboard responsivo com visão geral de atos, capítulos, pessoas, missões e últimas memórias.
- ACTA Codex com códigos exclusivos, prefixos, aliases de códigos históricos, codinomes e apelidos descritivos.
- Fichas de pessoas com informações opcionais, categorias múltiplas, status, cor, símbolo e avatar local.
- Reflexões históricas datadas que não sobrescrevem as anteriores.
- Atos e capítulos com vínculo bidirecional de pessoas, fases e campos narrativos.
- Eventos e missões com associação opcional a capítulos e pessoas.
- Memórias com datas exatas, aproximadas ou desconhecidas e indicação de grau de certeza.
- Busca global por nomes, códigos, codinomes, títulos e conteúdo textual.
- Persistência no navegador com IndexedDB; importação e exportação de arquivo validado.
- Exportação criptografada AES-256-GCM com derivação de senha PBKDF2-SHA256.
- Tema claro/escuro; tutorial guiado contextual com atalhos de teclado; dados fictícios opt-in.
- Interface offline-capable e GitHub Actions workflow para compilação/publicação Vite.
- Testes Node nativos de códigos, CRUD, vínculo, pesquisa, integridade e backup.

### Limitações conhecidas
- IndexedDB em repouso não é criptografado e é compartilhado por origem (atenção especial em GitHub Pages).
- Não há login, sincronização, backend ou inteligência artificial.
- A execução de build Vite e o teste final de deploy dependerão da instalação de dependências num ambiente com acesso ao npm.
