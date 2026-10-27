# Changelog — ACTA

Todos os marcos futuros são planejados e podem mudar após testes.

## [0.2.0-alpha] — 2026-10-26 — Codex Evolved

### Adicionado
- Vinculação de cor padrão a categoria de pessoa e vínculo principal selecionável; personalização global de cores.
- Cadastro opcional de aniversário com ou sem ano; avisos de datas próximas no Dashboard, configuráveis (7, 14, 30 ou 60 dias).
- Biblioteca de símbolos clicáveis integrada ao editor do Codex.
- Arquétipos pessoais Vlastnyys, Yotunt, Kantionyys, Chiteyavs e Tsuknyys, com editor de nomes/descrições em Configurações.
- Tags livres de percepção, sugestões editáveis e filtros por arquétipo/tag.
- Lista de porcentagens e ranking com dois indicadores subjetivos independentes, variações e registros narrativos.
- Histórico cumulativo de acontecimentos positivos, negativos, neutros ou reflexivos, com vínculos opcionais a eventos/memórias existentes.
- Busca global em arquétipos, tags, impacto da pessoa e notas do histórico.
- Tutorial guiado ampliado, agora com destaque no editor de símbolos, categorias e arquétipos, ranking e registro de porcentagens.
- Migração automática de dados locais schema 1 → schema 2, incluindo leitura de backups antigos (criptografados e JSON).
- Testes de migração, histórico, aniversários, cores e backups (18 testes Node).

### Ajustado
- Campo “Importância histórica subjetiva” renomeado para “Impacto na minha história” com ajuda contextual.
- Cache do service worker versionado para forçar atualização dos arquivos públicos.
- A exclusão de uma memória/evento preserva o histórico de porcentagens e remove apenas a referência ao registro excluído.

### Limitações
- Avisos de aniversário somente na interface quando o app estiver aberto; sem push/notificações em background.
- Arquétipos, tags e notas descrevem percepções privadas do autor, sem qualquer classificação automatizada de pessoas.
- O ranking é um índice subjetivo de proximidade, não uma avaliação de dignidade, caráter ou saúde mental.
- IndexedDB continua sem criptografia em repouso; não use perfis de navegador compartilhados para memórias sensíveis.

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
