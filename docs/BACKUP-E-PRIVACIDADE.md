# ACTA — Backup, segurança e privacidade

## Onde ficam os dados?

O ACTA salva o arquivo na **IndexedDB**, dentro do perfil do navegador e da **origem** do site. Isso significa que:

- Sem login, não existe sincronização entre aparelhos.
- Reinstalar navegador, limpar dados do site, usar navegação privada ou trocar de perfil pode resultar na perda do arquivo.
- Registros locais **não são criptografados** na IndexedDB. Qualquer pessoa com acesso ao perfil do navegador ou código executado na mesma origem pode conseguir lê-los.
- Sob GitHub Pages, `https://usuario.github.io/app1/` e `https://usuario.github.io/acta-personal-archive/` têm a **mesma origem**, mesmo que sejam repositórios diferentes. Um script executado em outro app desse domínio pode tecnicamente acessar a IndexedDB do ACTA. **Para informações sensíveis, prefira hospedar o ACTA em uma origem exclusiva** — por exemplo, um domínio próprio diferente do de seus outros apps. O uso de domínio exclusivo não equivale a criptografia nem impede acesso por pessoas com controle do dispositivo.
- A exportação de arquivo não é feita automaticamente: o usuário deve realizar o backup periodicamente.

## Exportar com senha (recomendado)

1. Abra **Configurações → Backup & restauração**.
2. Clique em **Exportar criptografado**.
3. Escolha uma senha longa e única e confirme-a (mínimo técnico de 8 caracteres).
4. Guarde o arquivo `.acta` em local de sua escolha. O arquivo terá somente os dados do arquivo pessoal criptografados; o código da aplicação não é incluído.
5. Guarde a senha separadamente em um gerenciador de senhas confiável. **Não existe recuperação da senha.**

A criptografia é executada inteiramente no navegador, usando a **Web Crypto API**: PBKDF2-SHA256 (310.000 iterações), salt aleatório de 128 bits e AES-256-GCM com nonce aleatório de 96 bits. A senha não é persistida em arquivos do aplicativo.

> O backup criptografado é protegido, mas o banco em uso no navegador permanece em claro. Criptografia do armazenamento local está planejada para versões futuras.

## Exportar JSON sem senha

Existe uma opção de exportação em JSON legível para interoperabilidade. Ela exige confirmação porque qualquer pessoa que obtenha esse arquivo poderá ler nomes, memórias, opiniões e outros dados. **Nunca publique esse JSON no GitHub**, envie-o por engano ou coloque-o em pastas compartilhadas não protegidas.

## Restaurar backup

1. Faça primeiro uma exportação dos registros atuais.
2. Vá em **Configurações → Selecionar arquivo** e escolha `.acta` ou `.json`.
3. Se o backup for criptografado, informe a senha.
4. O ACTA valida a assinatura do formato, versão (`actaBackup: 1`, esquema `schemaVersion: 1` ou `2`), listas, IDs, códigos e referências relacionais.
5. O aplicativo informa a quantidade de pessoas, capítulos e memórias e pede **confirmação explícita** para substituir os dados atuais.
6. Confirme apenas se desejar substituir **todo** o arquivo atual. Não é um merge.

A importação recusa versões incompatíveis, códigos duplicados, vínculos inválidos e imagens remotas no campo de avatar. A importação possui limite de 25 MB por arquivo neste MVP.

## Recuperação e proteção

- Exporte sempre depois de registrar memórias importantes.
- Mantenha ao menos duas cópias protegidas em locais diferentes.
- Teste a restauração em um **perfil de navegador separado** (de preferência em origem exclusiva) antes de depender de uma única cópia.
- Proteja o dispositivo por senha, evite perfis de navegador compartilhados e ative bloqueio de tela.
- O ACTA não envia telemetria, eventos de uso nem registros para serviços externos. GitHub Pages, como qualquer hospedagem web, pode registrar requisições HTTP normais de entrega de arquivos estáticos; isso é independente do banco de dados privado.
- Código-fonte público e dados privados são coisas distintas: o aplicativo não contém dados pessoais de demonstração ou usuário no ZIP.
- A privacidade dos dados de terceiros também importa: registre apenas o necessário para sua própria memória e evite difusão indevida.


## Migração 0.1 → 0.2

A versão v0.2.0-alpha usa `schemaVersion: 2`. Ao abrir no **mesmo navegador/origem** com dados da v0.1, valida o arquivo anterior, copia a estrutura e adiciona campos opcionais, preservando IDs, códigos, vínculos e conteúdo. O backup de formato `actaBackup: 1` permanece compatível e arquivos legados válidos são migrados depois da descriptografia, antes da importação.

**Faça um backup criptografado antes de publicar a versão nova.** Não há migração entre domínios: mudar para domínio próprio ou outro `usuario.github.io` cria outra origem, e os dados permanecem no armazenamento antigo até serem exportados/importados por você.

O histórico de porcentagens, tags, arquétipos e aniversários integra a exportação criptografada, mas **dados IndexedDB abertos no navegador não são criptografados**.
