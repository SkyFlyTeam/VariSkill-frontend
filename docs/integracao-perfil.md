# Integração do perfil com Django

A tela de perfil usa a sessão real do Backend. Não há fallback para usuário fictício.

## Executar localmente

Na pasta `Backend`, inicie o banco e aplique as migrations antes de subir a API:

```sh
docker compose up -d database
docker compose run --rm app uv run python manage.py migrate
docker compose up -d app
```

Mantenha apenas uma instância da API na porta 8000. Se ela já estiver rodando por
`docker compose run --rm --service-ports app`, use essa instância.

Na pasta `Frontend`:

```sh
npm install
npm run dev
```

Abra o endereço `http://localhost:5173` informado pelo Vite. Faça login com o
**apelido** e a senha de uma conta real. Caso ainda não exista conta, o Backend
oferece `POST /api/register/`, com `apelido`, `nome`, `email` e `password`;
o Swagger fica em `http://localhost:8000/api/docs/`.

O proxy envia `/api` para `http://localhost:8000`. Para outro destino, copie
`.env.example` para `.env`, ajuste `BACKEND_URL` e reinicie o Vite. Use sempre
localhost (ou sempre 127.0.0.1) ao navegar, pois os cookies pertencem ao host.

O proxy preserva Host/Origin do navegador para o Django validar CSRF.
Para acessar por outro hostname, configure ALLOWED_HOSTS no Backend.
Em produção, o servidor que publica o Frontend precisa encaminhar `/api`
ao Django no mesmo domínio; o proxy do Vite só se aplica ao desenvolvimento.

## Contrato verificado no Backend local

| Ação             | Endpoint                 | Dados                               |
| ---------------- | ------------------------ | ----------------------------------- |
| Login            | `POST /api/login/`       | `{ apelido, password }`             |
| Restaurar sessão | `GET /api/users/me/`     | Usuário autenticado                 |
| Ler perfil       | `GET /api/users/{id}/`   | Usuário retornado pelo login/sessão |
| Editar perfil    | `PATCH /api/users/{id}/` | `{ nome, apelido }`                 |
| Alterar senha    | `PATCH /api/users/{id}/` | `{ password }`                      |
| Sair             | `POST /api/auth/logout/` | Rota de logout do DRF               |

`UserProfile` usa `xp_total` e `streak_dias`. `criado_em` é opcional: existe
no modelo, mas não está em `UserSerializer.Meta.fields` na versão local.
Nenhuma data é inventada pelo Frontend.

As requisições incluem os cookies de sessão; as alterações enviam também
`X-CSRFToken` com o valor atual de `csrftoken`, criado/rotacionado no login.

O diálogo recebe apenas `senhaAtual` e `novaSenha`. O serviço identifica o
usuário pela sessão, confirma a senha atual em `/api/login/` e só então
faz o PATCH com a nova senha. Após sucesso, pede novo login, pois o Backend
usa `set_password` sem renovar o hash da sessão existente.

A confirmação da senha atual faz parte deste fluxo de UI. O PATCH genérico
atual do Backend não exige a senha antiga; essa garantia deve ser implementada
no servidor se for exigida para todos os clientes da API.

A foto continua armazenada no navegador: o Backend não oferece campo/endpoint
para upload da foto de perfil. Essa alteração integra os dados textuais e senha.

## Validação

```sh
npm run build
npm test -- --runInBand
```

Os testes cobrem nomes dos campos, URLs, métodos, cookies/CSRF, troca de senha,
restauração da sessão e ausência de sucesso simulado quando a API falha.
