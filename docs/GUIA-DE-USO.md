# ACTA — Guia de uso (v0.3.0-alpha)

## 1. Primeiro acesso

No dashboard, você verá um arquivo vazio. **O ACTA não cria pessoas nem capítulos fictícios por padrão.** Tudo é salvo no navegador. Recomendamos começar criando um **ato**, depois um **capítulo** e finalmente uma **pessoa** no Codex. Se desejar explorar sem dados pessoais, vá em **Configurações → Carregar arquivo fictício**. Se já houver conteúdo, o app pedirá confirmação para misturá-los.

## 2. Atos e capítulos

Em **Atos & capítulos**, clique em **Novo ato**. Um ato é uma fase, como “Mudanças” ou “Descobertas”, sem precisar ser cronologicamente exata. Preencha título, descrição, início e fim em texto livre, símbolo, cor, ordem e status. Os únicos dados necessários são o título.

Dentro de um ato, selecione **Novo capítulo neste ato**. Informe o título, objetivo inicial, situações e observações conforme sua vontade. Um capítulo pode estar planejado, em andamento ou encerrado. Selecione pessoas que já estejam no Codex; outras podem ser vinculadas depois.

## 3. ACTA Codex

Abra **ACTA Codex → Nova pessoa**. Digite apenas o **codinome principal**, como “A Raposa”; um código sequencial será proposto. O nome real, a data e qualquer outra informação são opcionais. Você pode escolher a classificação narrativa entre múltiplas categorias, definir situação de contato, cor e símbolo, registrar uma foto local e escrever percepções pessoais.

O código é um **rótulo pesquisável**, não o identificador usado nos relacionamentos internos. Você pode mudar `SCP-015` para `ARK-015` ao editar a ficha. `SCP-015` ficará no histórico de códigos e continuará sendo encontrado na pesquisa. O identificador interno não muda.

Na ficha, use **Adicionar** em “Codinomes & aliases” para guardar apelidos, seu significado e o período de utilização. Use **Alterar principal preservando o anterior** para promover um novo nome. Os nomes antigos permanecem guardados como aliases.

## 4. Pessoas nos capítulos

Na ficha de uma pessoa, clique em **Vincular** para escolher um capítulo existente. Alternativamente, dentro de um capítulo, clique em **Associar** e selecione alguém do Codex. O mesmo vínculo aparecerá na página de ambos: você não precisará cadastrar a pessoa de novo. É possível remover o vínculo sem excluir a pessoa ou o capítulo.

## 5. Memórias e certeza

Acesse **Memórias → Nova memória** ou use o botão na ficha da pessoa ou no capítulo. Uma memória possui título, texto, data livre, grau de certeza, tags, pessoas e capítulo opcionais.

Escolha entre: **Acontecimento confirmado**, **Lembrança pessoal**, **Lembrança incompleta**, **Interpretação atual**, **Informação não confirmada**. Isso representa **sua classificação do registro**, não uma confirmação científica/externa da verdade.

Exemplo: “Lembro que A Raposa estava na viagem, talvez em 2017 ou 2018.” Você pode escrever “2017 ou 2018” no campo de data, sem inventar exatidão.

## 6. Reflexões históricas

Na ficha do Codex, use **Registrar** em “Reflexões ao longo do tempo”. Cada reflexão recebe texto e um período opcional. As reflexões são adicionadas ao histórico e não apagam as anteriores. Para corrigir informações na descrição geral da ficha, use **Editar ficha**.

## 7. Missões e acontecimentos

**Eventos** são acontecimentos que tiveram lugar. **Missões** são objetivos que você gostaria de acompanhar, sem cobrança ou pontuação. Ambos podem ter capítulos e pessoas associados. As missões podem ser pendentes, em andamento, pausadas, concluídas ou canceladas; prioridade é opcional.

## 8. Pesquisa global

Clique em **Pesquisa global** ou pressione `Ctrl+K` (ou `⌘K`). Pesquise `SCP-015`, `A Raposa`, `Projeto Aurora`, o título de um capítulo ou palavras presentes na descrição de uma memória. Use filtros para limitar a tipo de registro. A busca remove diferenças de maiúsculas/minúsculas e acentuação, mas não emprega IA.

## 9. Tutorial guiado

Em **Configurações → Iniciar tutorial guiado**, o ACTA destaca um controle próximo ao texto de cada etapa. Avance e volte pelos botões ou setas do teclado. Pressione **Esc** para fechar. Pode ser reaberto quando quiser. Se uma etapa exigir dados que ainda não existem, o guia explicará o pré-requisito.

## 10. Temas e backups

Em **Configurações**, altere o tema claro/escuro ou o prefixo sugerido dos futuros códigos. Você também pode **exportar um backup criptografado**, exportar JSON sem proteção ou **importar um arquivo ACTA** com validação e confirmação de substituição. Para procedimentos seguros, leia [`BACKUP-E-PRIVACIDADE.md`](BACKUP-E-PRIVACIDADE.md).

## 11. Limitações relevantes

- Não há sincronização entre telefone e computador.
- Fotos importadas são compactadas para até 320 px em JPEG; não substituem um álbum de arquivos originais.
- Atos e memórias permitem períodos em texto livre; o gráfico de porcentagens exige uma data completa válida, ou deixa a avaliação fora do eixo cronológico.
- Categorias e situações iniciais não são editáveis globalmente no MVP.
- A exclusão é definitiva: faça backup antes.
- Não atribua a códigos um sentido de julgamento real sobre pessoas.


## Novos recursos da v0.2.0-alpha

### Impacto na minha história
Na ficha, preencha **Impacto na minha história** com uma influência, aprendizado ou fase importante. Não é necessário atribuir “grau de importância” nem escrever um julgamento sobre a pessoa.

### Cor principal e símbolos
Ao editar uma pessoa, marque um ou mais vínculos (por exemplo, Família e Amizade). Escolha **Vínculo principal** e mantenha **Cor da ficha: Usar a cor do vínculo principal**. Para usar outra cor, escolha **Cor personalizada**. Altere as cores de todas as categorias em **Configurações**. A biblioteca de símbolos no formulário permite clicar para preencher o campo, mas você também pode digitar qualquer símbolo.

### Aniversário
Use `MM-DD` quando não sabe o ano ou `AAAA-MM-DD` quando sabe. Exemplo: `05-23` ou `1997-05-23`. Não é obrigatório saber a idade. O Dashboard consulta os aniversários dos próximos 30 dias por padrão; em Configurações pode usar 7, 14, 30 ou 60 dias. O site **não envia notificações com a aba fechada**. Para nascimentos em 29/02, nos anos não bissextos o aplicativo mostrará 01/03.

### Arquétipos, tags e filtros
Os cinco arquétipos históricos (Vlastnyys, Yotunt, Kantionyys, Chiteyavs e Tsuknyys) aparecem no cadastro. Você pode alterar descrições, criar novos ou retirar opções da lista em **Configurações → Arquétipos narrativos**, no formato `Nome | descrição`, uma por linha. Categorias removidas não são apagadas de fichas antigas. Use **Tags de percepção** livres, separadas por vírgula; tags sugeridas podem ser preenchidas com um clique. Na tela Codex há filtros por categoria, arquétipo e tag. Esses campos são apenas sua interpretação pessoal, não diagnósticos nem fatos objetivos.

### Lista de porcentagens
Abra uma ficha de pessoa → **Proximidade & percepções → Novo registro**. Informe **Minha proximidade** e **Reciprocidade que imagino**, cada uma de 0 a 100, com até uma casa decimal (vírgula aceita). Os valores podem ser desconhecidos/deixados em branco. Escolha uma categoria da ocorrência (Positivo, Negativo, Neutro, Reflexão), registre a data e descreva o contexto. É permitido guardar um acontecimento sem alterar números, desde que tenha uma anotação.

O histórico conserva o valor anterior de cada dimensão. Registros antigos não são editados; para desfazer, só é possível remover o registro mais recente, retornando ao estado anterior. Acesse **Lista de porcentagens** na barra lateral para consultar a ordem por proximidade, reciprocidade estimada, última subida ou última queda. O ranking é uma organização privada da sua percepção, não uma classificação do valor das pessoas.

### Tutorial guiado
Em **Configurações → Iniciar tutorial guiado** você pode percorrer as etapas guiadas, incluindo os próprios controles de cadastro, a biblioteca de símbolos, cores, arquétipos e o histórico de porcentagens. Pressione **←** e **→** para voltar e avançar; **Esc** encerra. O tutorial não preenche nem envia dados reais automaticamente. Se não houver pessoas cadastradas, o passo de porcentagens indica onde acessar o recurso.

## Novos recursos — v0.3.0-alpha

### Gráficos individuais de porcentagens

Abra **Codex → Pessoa → Proximidade & percepções**. Registre pelo menos duas avaliações com datas distintas no botão **Novo registro**. As duas curvas usam informações separadas: **minha proximidade** e **reciprocidade que imagino**. Para recortar o intervalo, escolha datas em **Gráfico desde** e **Gráfico até**. Para consultar valores sem depender da visão, expanda **Ver dados exatos do gráfico**.

### Gráfico geral (todas as pessoas)

Entre em **Lista de porcentagens → Gráfico de todas as pessoas**. Cada pessoa com avaliações datadas gera uma linha. Escolha o indicador **Minha proximidade** ou **Reciprocidade percebida**. Filtre por período com as datas abaixo do seletor. O gráfico não inventa avaliações entre as amostras nem coloca valores ausentes em 0%.

### Comparar duas datas

Na mesma tela do ranking, use **Comparar períodos — todas as pessoas**. Na ficha individual, use **Comparar dois momentos**. Cada coluna mostra o último registro conhecido até a data que você informou; se ainda não havia avaliação conhecida, aparece **—**.

### Conexões entre pessoas

Na ficha de uma pessoa, abra **Conexões com outras pessoas → Vincular**, selecione alguém e um tipo de vínculo, com período/observação opcionais. A ligação aparecerá nas duas fichas automaticamente. Você pode editá-la ou excluí-la, sem apagar as pessoas ou memórias associadas.

### Grupos e organizações narrativas

Na página **ACTA Codex**, depois do índice de fichas, selecione **Grupos e organizações → Novo grupo**. Escreva o nome e, opcionalmente, descrição, período e integrantes. As fichas das pessoas passam a mostrar em quais grupos aparecem. As edições deixam a versão anterior guardada no histórico de backup.

### Corrigir uma avaliação sem apagar a versão anterior

Na seção de proximidade da ficha, localize a avaliação e clique no ícone **Editar** ao lado dela. Ajuste porcentagens, data ou nota e **explique obrigatoriamente o motivo**. O ACTA guarda o conteúdo anterior e você pode visualizá-lo em **Histórico de correções**.

### Novos filtros

No Codex, refine a listagem por **sem contato**, **aniversário neste mês**, **com histórico**, **pessoas conectadas**, **ato da narrativa** ou **conter todas estas tags** (tags separadas por vírgula). Esses filtros são aplicados localmente.

### Tutorial

Use o ícone de **livro** na barra superior ou **Configurações → Iniciar tutorial guiado**. Os passos novos mostram os gráficos, a comparação temporal, a lista de pessoas, os grupos e o histórico de correções. Use ←/→ e Esc.
