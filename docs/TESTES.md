# ACTA v0.3.0-alpha — Testes e limites da validação

## Verificado

- `npm run check`: **28 testes passaram** (base anterior + cronologia, conexões, grupos, migração de schema 2 para 3, exclusão segura, importação de backup, correções com histórico, datas desconhecidas e rejeição de registros inconsistentes).
- Checagem de sintaxe Node para `src/main.js`, `src/lib/model.js`, `src/lib/backup.js` e `src/lib/storage.js`.
- Montagem isolada do frontend no **Chromium**: Configurações, início de tutorial, cadastro de duas fichas fictícias, duas avaliações históricas, gráfico individual, comparação entre duas datas, criação de conexão entre pessoas, criação de grupo, filtro por conexões, correção auditável de valor antigo, gráfico geral e troca de indicador. **Sem exceções JavaScript nesse fluxo**.
- Layout 390 px do gráfico geral: sem rolagem horizontal do documento; o gráfico pode usar sua própria rolagem horizontal para manter legibilidade.

## Não verificado neste ambiente

- `npm run build`: `npm install --offline` falhou com `ENOTCACHED` (o pacote Vite não está disponível no cache do npm). O GitHub Actions instalado no pacote fará a instalação, os testes e o build no workflow real.
- Teste automatizado por HTTP/HTTPS: Chromium bloqueou a navegação para localhost (`ERR_BLOCKED_BY_ADMINISTRATOR`); o frontend foi testado por injeção isolada dos módulos em uma página, não por servidor HTTP.
- Persistência IndexedDB entre recargas do site servido, migração na origem GitHub Pages, offline real com service worker, Safari/iOS e leitores de tela não foram validados ponta a ponta.

## Checklist depois do deploy

1. Verificar workflow verde no GitHub Actions (install, tests, build, deploy).
2. Antes de atualizar, exportar backup seguro no site antigo.
3. Confirmar que os códigos e registros já existentes aparecem na v0.3.0.
4. Registrar porcentagens para **duas pessoas diferentes**, em duas datas cada. Confirmar duas linhas no gráfico geral e duas séries no gráfico de cada pessoa.
5. Alternar o gráfico geral entre proximidade e reciprocidade; testar recorte de datas e tabela acessível.
6. Comparar datas anteriores/atuais e confirmar que ausência de dado aparece como “—”.
7. Criar uma conexão e um grupo, confirmar visualização nas duas fichas e a persistência ao recarregar.
8. Corrigir um registro histórico, abrir o histórico da correção e conferir que a versão antiga permanece.
9. Abrir Configurações e o tutorial guiado; testar setas do teclado, reinício e cancelamento.
10. Exportar backup criptografado; validar restauração em **outro perfil de navegador** sem comprometer o arquivo original.
11. Confirmar no celular e tema claro; verificar se há problemas visuais.
12. Não limpar IndexedDB nem enviar backups para GitHub.
