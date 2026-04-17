# Git Branch and Merge

***Este ficheiro tem de ser melhorado, passar para inglês e fazer uma revisão.***

---

## 1. Atualizar a branch principal (main)

#### 1.1. Mudar para a branch principal
```
git checkout main
```

#### 1.2. Descarregar as últimas alterações feitas no repositório
```
git pull origin main
```

---

## 2. Criar e mudar para a nova branch

#### 2.1. Criar nova branch
```
git branch new-branch-name
```

#### 2.2 Mover para a nova branch
```
git switch new-branch-name
```

#### Extra. Este comando cria e move para a nova branch de uma só vez
```
git switch -c new-branch-name
```

---

## 3. Fazer alterações e enviar o commit

#### 3.1 Adicionar ficheiros alterados
```
git add .
```

#### 3.2 Enviar o commit com a mensagem
```
git commit -m "Update main.c"
```

---

## 4. Enviar a nova branch para o GitHub
```
git push -u origin new-branch-name
```
*Nota: Nas próximas vezes que quiseres enviar alterações nesta mesma branch, basta escreveres apenas `git push`.*

---

## 5. Criar o Pull Request e fazer o Merge

#### 5.1. Fazer Pull Request no GitHub
No título do Pull Request devem descrever o que foi feito no âmbito desta branch. Se pretenderem podem adicionar uma descrição, mas é opcional.

#### 5.2. Fazer Merge no GitHub
*Importante: Ao fazer merge não devem alterar o título do mesmo, devem manter o título gerado pelo GitHub, ficando alguma coisa assim:*
```
Merge pull request #1 from ricanudo/create-database
```

---

## 6. Limpeza

#### 6.1. Voltar para a branch principal
```
git checkout main
```

#### 6.2. Descarregar a versão do repositório do GitHub atualizada
```
git pull origin main
```

#### 6.3. Apagar a branch do GitHub pelo terminal
```
git push origin --delete new-branch-name
```

#### 6.4. Apagar a branch local
```
git branch -D new-branch-name
```

#### 6.5. Limpa historico de branch
```
git fetch -p
```
