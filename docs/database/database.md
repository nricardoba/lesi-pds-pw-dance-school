# Criar base de dados no docker

***Este ficheiro tem de ser melhorado, passar para inglês e fazer uma revisão.***

---

Para começar, o docker desktop deve estar a correr.

## 1. Devem ter esta configuração no ficheiro `backend/.env`
```
# Server Configuration
PORT=3333

DB_USER=meu_username
DB_PASSWORD=minha_password
DB_NAME=dance-school-database

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
```

---

## 2. Devem ter esta configuração no ficheiro `backend/docker-compose.yml`
```
services:
  postgres:
    image: postgres
    container_name: postgres-dance-school
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres-dance-school-data:/var/lib/postgresql

volumes:
  postgres-dance-school-data:
```
*O ficheiro `backend/docker-compose.yml` vai buscar as variaveis `DB_USER`, `DB_PASSWORD` e `DB_NAME` ao ficheiro `backend/.env`*

---

## 3. Derrubar a base de dados e limpar o volume antigo
Este comando é opcional, serve para limpar o volume do docker
```
docker-compose down -v
```
*Nota: podes ter de utilizar `docker compose` em vez de `docker-compose`*

---

## 4. Subir novamente a base de dados (agora vazia)
```
docker-compose up -d
```
*Nota 1: Esperar 10 segundos depois de correr este comando*
*Nota 2: podes ter de utilizar `docker compose` em vez de `docker-compose`*

---

## 5. Iniciar o container e verificar se está a correr

#### 5.1. Iniciar o contentor
```
docker start postgres-dance-school
```

#### 5.2. Verificar se está a correr
```
docker ps
```

---

## 6. Aplicar as migrações à nova base de dados
```
npx prisma migrate dev
```
*(Não precisas do `--name init` desta vez porque não estás a criar uma nova migração, estás apenas a dizer ao Prisma para aplicar as que já existem na pasta).*

---

## 7. Verificar se o prisma está a funcionar (opcional)
```
npx prisma validate
```

---

## 8. Gerar o prisma client
```
npx prisma generate
```

---

## 9. Abrir o prisma studio
```
npx prisma studio
```

---

## 10. Preencher as tabelas com o seed
```
npx prisma db seed
```

---

## 11. Aplicar as alterações efetuadas no ficheiro schema.prisma (apenas vai utilizar este commando o gestor da dase de dados)

Sempre que quiseres adicionar uma coluna ou tabela nova, mudas **apenas** no `schema.prisma` e corres no terminal:
```
npx prisma migrate dev --name add_new_table
```
