# ACTA — Testes e verificações (v0.1.0-alpha)

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
