# MySQL no Docker com Laravel — quem faz o quê e onde se configura

Como o banco deste projeto passou do MySQL do Herd para um container Docker: o
que cada peça faz, em qual arquivo se mexe em cada coisa, e as armadilhas que já
apareceram na prática.

O PHP continua sendo servido pelo **Herd** em `http://login-crm.test`. Só o
**banco** mudou de lugar. Não existe container de PHP aqui.

Versões conferidas em 08/09/2026: **Docker 29.2.1**, **Docker Compose v5.1.0**,
**mysql:8.4** (LTS), **Herd 1.29.0**, **Laravel 13 / PHP 8.4**.

## A divisão de trabalho

```
navegador  →  http://login-crm.test
                    ↓
              Herd (nginx + PHP 8.4)             ← fora do Docker
                    ↓  PDO em 127.0.0.1:3306
              container login-crm-mysql          ← dentro do Docker
                    ↓
              volume login-crm_login-crm-mysql   ← onde os dados moram
```

O Laravel não sabe que o banco está num container. Ele abre uma conexão TCP em
`127.0.0.1:3306` exatamente como fazia antes — quem atende naquela porta é que
mudou. É por isso que **nenhuma linha de PHP precisou ser alterada**.

## Docker Desktop ou linha de comando?

Essa é a confusão número um, e a resposta é: **os dois, sempre**. Não são
alternativas.

| Peça | O que é | Precisa estar rodando? |
|---|---|---|
| **Docker Desktop** | a aplicação que roda o *engine* (o daemon que de fato cria e executa containers) | **Sim, sempre.** Sem ela nenhum comando `docker` funciona |
| **`docker` / `docker compose`** no terminal | um *cliente* que manda ordens pro engine | Só quando você quer digitar um comando |
| **A janela do Docker Desktop** | outro cliente pro mesmo engine, com botões | Só quando você quer clicar |

Ou seja: o Desktop é obrigatório de qualquer jeito. A pergunta real é apenas
**por onde você dá as ordens** — pela janela ou pelo terminal.

**O detalhe que trava todo mundo:** o Docker Desktop **não tem** um botão de
"abrir este `docker-compose.yml`". Compose é um recurso do CLI. Então a primeira
subida é obrigatoriamente um comando:

```bash
docker compose up -d
```

Depois disso o projeto aparece na aba **Containers** do Desktop, agrupado como
**`login-crm`** (o Compose agrupa pelo nome da pasta), e o dia a dia pode ser
100% nos botões.

### Mesma coisa, dois caminhos

| No Docker Desktop | No terminal |
|---|---|
| ▶ / ⏹ no grupo `login-crm` | `docker compose up -d` / `docker compose stop` |
| aba **Logs** | `docker compose logs -f mysql` |
| aba **Exec** | `docker compose exec mysql mysql -u root login_crm` |
| aba **Stats** | `docker stats` |
| aba **Volumes** | `docker volume ls` |
| 🗑 no container | `docker compose down` |

Você só **precisa** voltar ao terminal quando editar o `docker-compose.yml` — aí
roda `docker compose up -d` de novo pra aplicar as mudanças.

## Onde se configura cada coisa

Quatro arquivos, quatro responsabilidades diferentes. Confundir eles é a fonte
da maioria dos erros.

| Arquivo | Responde por | Exemplo do que se mexe aqui |
|---|---|---|
| `docker-compose.yml` | **como o servidor MySQL sobe** | versão da imagem, porta publicada, senha do root, charset do servidor |
| `.env` | **como o Laravel acha o servidor** | `DB_HOST`, `DB_PORT`, `DB_DATABASE`, credenciais |
| `config/database.php` | **como o Laravel usa a conexão** | driver, `strict` mode, opções de PDO, defaults |
| `phpunit.xml` | **o banco dos testes** | força SQLite em memória |

Regra prática: **mudou o servidor → `docker-compose.yml`. Mudou o endereço →
`.env`. Mudou o comportamento do Eloquent → `config/database.php`.**

### O `docker-compose.yml`, linha a linha

```yaml
services:
    mysql:
        image: mysql:8.4
        container_name: login-crm-mysql
        restart: unless-stopped
        ports:
            - '${DB_PORT:-3306}:3306'
        environment:
            MYSQL_ALLOW_EMPTY_PASSWORD: 'yes'
            MYSQL_DATABASE: '${DB_DATABASE:-login_crm}'
            MYSQL_ROOT_HOST: '%'
        command:
            - --character-set-server=utf8mb4
            - --collation-server=utf8mb4_unicode_ci
        volumes:
            - login-crm-mysql:/var/lib/mysql
            - ./docker/mysql/init:/docker-entrypoint-initdb.d
        healthcheck:
            test: ['CMD', 'mysqladmin', 'ping', '-h', '127.0.0.1']
            interval: 10s
            timeout: 5s
            retries: 10
            start_period: 30s

volumes:
    login-crm-mysql:
        driver: local
```

- **Sem `version:`** — a chave era exigida no Compose v1. Da v2 em diante ela é
  obsoleta e só gera warning.
- **`image: mysql:8.4`** — versão **fixada**, e LTS. Ver a armadilha do
  `mysql:latest` mais abaixo.
- **`restart: unless-stopped`** — volta sozinho ao ligar o PC, exceto se você o
  tiver parado na mão.
- **`ports: 'HOST:CONTAINER'`** — o lado esquerdo é a porta da *sua máquina* (é
  o que o `.env` enxerga), o direito é a porta *dentro* do container. O
  `${DB_PORT:-3306}` faz o Compose ler o `.env` da pasta, então a porta
  acompanha o Laravel automaticamente; sem a variável, cai no default 3306.
- **`MYSQL_ALLOW_EMPTY_PASSWORD`** — a imagem oficial **se recusa a inicializar**
  sem uma variável de senha. Como o `.env` daqui tem `DB_PASSWORD=` vazio, é
  esta a escolhida. Só vale pra desenvolvimento local.
- **`MYSQL_DATABASE`** — cria o banco `login_crm` vazio no primeiro boot.
- **`MYSQL_ROOT_HOST: '%'`** — sem isso o root só entraria a partir de
  `localhost` (de dentro do container). Como a conexão vem de fora, precisa
  liberar qualquer host.
- **`command:`** — força `utf8mb4` / `utf8mb4_unicode_ci` **no servidor**,
  batendo com o que o `config/database.php` já pede no cliente.
- **`volumes:`** — dois tipos diferentes, ver a seção seguinte.
- **`healthcheck`** — o container fica em `starting` até o MySQL realmente
  aceitar conexão. Importante porque o primeiro boot leva ~20s, e conectar antes
  disso dá "connection refused" sem motivo aparente.

### O `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=login_crm
DB_USERNAME=root
DB_PASSWORD=
```

`DB_HOST` é `127.0.0.1` — e **não** `mysql` ou `login-crm-mysql` — porque quem
conecta é o PHP do Herd, que roda no Windows, fora da rede do Docker. Nomes de
serviço (`mysql`) só funcionam entre containers. Se um dia o PHP também virar
container, esta linha muda pra `DB_HOST=mysql`.

### `config/database.php` e a pegadinha dos testes

O bloco `mysql` só lê as variáveis do `.env`, com defaults:

```php
'host' => env('DB_HOST', '127.0.0.1'),
'port' => env('DB_PORT', '3306'),
'charset' => env('DB_CHARSET', 'utf8mb4'),
'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
```

Mas o `phpunit.xml` sobrescreve tudo:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

**Os testes não usam o Docker.** Rodam em SQLite em memória, criado e destruído
a cada execução. É de propósito (é rápido e não suja o banco de trabalho), mas
gera o efeito confuso de um teste passar enquanto o app quebra — ou o contrário.
Quando isso acontecer, lembre que são dois bancos diferentes.

## Onde os dados moram

O `docker-compose.yml` monta dois volumes, de naturezas diferentes:

| Montagem | Tipo | Pra quê |
|---|---|---|
| `login-crm-mysql:/var/lib/mysql` | volume **nomeado** (gerenciado pelo Docker) | os dados do banco |
| `./docker/mysql/init:/docker-entrypoint-initdb.d` | **bind mount** (pasta do projeto) | `.sql` de carga inicial |

O volume nomeado aparece como **`login-crm_login-crm-mysql`** — o Compose
prefixa com o nome do projeto. Ele é gerenciado pelo Docker, fora da pasta do
projeto; no Windows isso é bem mais rápido que um bind mount, e evita que o
`git status` veja milhares de arquivos internos do MySQL.

Consequência importante:

```bash
docker compose down       # remove o container, PRESERVA os dados
docker compose down -v    # remove o container E APAGA o volume
```

O `down -v` seguido de `up -d` + `php artisan migrate` te dá um banco limpo em
segundos. É a forma mais confiável de testar migration do zero.

### Carga inicial

Tudo que for `.sql` dentro de `docker/mysql/init/` roda **só na criação do
volume** — ou seja, no primeiro `up`, ou depois de um `down -v`. Colocar um
arquivo lá com o volume já existente não faz nada.

Pra trazer dados de outro MySQL:

```bash
mysqldump -h 127.0.0.1 -u root login_crm > docker/mysql/init/dump.sql
docker compose down -v && docker compose up -d
```

## O fluxo completo, do zero

```bash
docker compose up -d          # sobe (Docker Desktop precisa estar aberto)
docker compose ps             # espere o STATUS virar (healthy)
php artisan migrate           # cria as tabelas — o banco nasce VAZIO
```

Com o Herd aberto e o `npm run dev` rodando, `http://login-crm.test/register` já
grava usuário de verdade.

## Armadilhas que já morderam

**1. Conflito de porta com o MySQL do Herd.** Os dois querem a 3306. Se o do
Herd estiver ligado, o container falha ao subir (ou o contrário). Mantenha
**só um** — aqui a escolha foi o Docker, com o serviço MySQL desligado na janela
do Herd. Pior que o erro de porta é o caso em que você alterna entre os dois: a
conexão funciona, o `.env` está certo, e mesmo assim as tabelas "somem" — porque
são dois bancos diferentes.

> O Herd 1.29.0 no Windows **não tem** o comando `herd services`. Serviços se
> ligam e desligam pela janela do Herd, não pelo terminal.

**2. `mysql:latest` não é o que parece.** A tag `latest` da imagem oficial
aponta pra release *innovation* (experimental, hoje a 26.7.0), não pra LTS. Por
isso o compose fixa `mysql:8.4`. Nunca use `latest` em banco.

**3. Criar o container na mão pelo Desktop.** O botão "Run" da imagem pede as
variáveis em dois campos separados — *nome* e *valor*. É fácil inverter e acabar
com uma variável chamada `login_crm` de valor `root`, em vez de `MYSQL_DATABASE`
= `login_crm`. Sem uma variável de senha válida o container morre no boot com:

```
[ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
```

O container fica na lista como `Exited (1)`. É justamente isso que o
`docker-compose.yml` evita: a configuração fica escrita, versionada e repetível.

**4. O banco do Docker nasce vazio.** Ele não herda nada do MySQL antigo.
Sempre `php artisan migrate` depois do primeiro `up`.

**5. `.env` corrompido derruba tudo, não só o banco.** Se alguma saída de
terminal for parar dentro do arquivo, qualquer `php artisan` morre com:

```
The environment file is invalid! Failed to parse dotenv file.
```

O erro não aponta a linha culpada. Pra achar:

```bash
grep -nvE '^\s*(#.*)?$' .env | grep -vE '^[0-9]+:[A-Z_][A-Z0-9_]*='
```

## Diagnóstico rápido

```bash
docker compose ps                  # está (healthy)?
docker compose logs --tail=30 mysql
php artisan migrate:status         # o Laravel enxerga o banco?
```

O que o `migrate:status` responde e o que significa:

| Resposta | Significado |
|---|---|
| lista com `Ran` | tudo certo |
| `Migration table not found` | **conectou**, mas o banco está vazio → falta `migrate` |
| `Connection refused` | container não está de pé, ou ainda em `starting` |
| `Access denied` | credenciais do `.env` não batem com as do compose |
| `Failed to parse dotenv file` | `.env` malformado — ver armadilha 5 |
