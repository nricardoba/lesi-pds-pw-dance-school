# Create database

To begin, Docker Desktop must be running.

## 1. Generate database from the `prisma/schema.prisma` file

### 1.1. You must have this configuration in the `backend/.env` file
```
# Server Configuration
PORT=3333

DB_USER=my_username
DB_PASSWORD=my_password
DB_NAME=dance-school-database

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
```

---

### 1.2. You must have this configuration in the `backend/docker-compose.yml` file
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
*The `backend/docker-compose.yml` file fetches the `DB_USER`, `DB_PASSWORD` and `DB_NAME` variables from the `backend/.env` file.*

---

### 1.3. Tear down the database and clear the old volume
This command is optional, it serves to clear the docker volume
```
docker-compose down -v
```
*Note: You might have to use `docker compose` instead of `docker-compose`*

---

### 1.4. Bring the database up again
```
docker-compose up -d
```
*Note 1: Wait 10 seconds after running this command*  
*Note 2: You might have to use `docker compose` instead of `docker-compose`*

---

### 1.5. Start the container and check if it is running

#### 1.5.1. Start the container
```
docker start postgres-dance-school
```

#### 1.5.2. Check if it is running
```
docker ps
```

---

### 1.6. Apply migrations to the new database
```
npx prisma migrate dev
```
*(You don't need `--name init` this time because you are not creating a new migration, you are just telling Prisma to apply the existing ones in the folder).*

---

### 1.7. Check if Prisma is working (optional)
```
npx prisma validate
```

---

### 1.8. Generate the Prisma client
```
npx prisma generate
```

---

### 1.9. Open Prisma Studio
```
npx prisma studio
```

---

### 1.10. Populate the tables with the seed
```
npx prisma db seed
```

---

## 2. Apply changes made in the `prisma/schema.prisma` file to the database

### 2.1. Bring the database up
```
docker-compose up -d
```
*Note 1: Wait 10 seconds after running this command*  
*Note 2: You might have to use `docker compose` instead of `docker-compose`*

### 2.2. Apply changes made in the schema.prisma file
Whenever you want to add a new column or table, change it **only** in `schema.prisma` and run in the terminal:  
```
npx prisma migrate dev --name add_new_table
```

### 2.3. Reset the database
```
npx prisma migrate reset
```

### 2.4. Generate the Prisma client
```
npx prisma generate
```
