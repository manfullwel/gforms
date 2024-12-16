# Guia de Desenvolvimento - Form Generator App

## Índice
1. [Infraestrutura e DevOps](#1-infraestrutura-e-devops)
2. [Backend (FastAPI)](#2-backend-fastapi)
3. [Frontend (React/TypeScript)](#3-frontend-reacttypescript)
4. [Segurança](#4-segurança)
5. [Monitoramento](#5-monitoramento)
6. [Recursos e Referências](#6-recursos-e-referências)

## 1. Infraestrutura e DevOps

### 1.1. Configuração do Docker
**Objetivo**: Containerizar a aplicação para garantir consistência entre ambientes.

#### Recursos de Aprendizado:
- [Docker para Desenvolvedores](https://www.docker.com/get-started) - Documentação oficial
- [Docker Mastery](https://www.freecodecamp.org/news/docker-simplified-96639a35ff36/) - FreeCodeCamp
- [FastAPI com Docker](https://fastapi.tiangolo.com/deployment/docker/) - Documentação oficial

#### Passos:
1. **Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

3. **Docker Compose**:
```yaml
version: '3.8'
services:
  backend:
    build: ./Backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/formdb
    depends_on:
      - db
  
  frontend:
    build: ./Frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=formdb
```

### 1.2. CI/CD com GitHub Actions

#### Recursos de Aprendizado:
- [GitHub Actions](https://docs.github.com/en/actions/learn-github-actions) - Documentação oficial
- [CI/CD para Python](https://www.digitalocean.com/community/tutorials/how-to-set-up-continuous-integration-with-python) - DigitalOcean
- [React CI/CD](https://blog.logrocket.com/ci-cd-pipeline-react-app-github-actions/) - LogRocket

#### Exemplo de Workflow:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd Backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd Backend
          pytest
```

## 2. Backend (FastAPI)

### 2.1. Autenticação JWT

#### Recursos de Aprendizado:
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/) - Documentação oficial
- [JWT Authentication](https://testdriven.io/blog/fastapi-jwt-auth/) - TestDriven.io
- [OAuth2 com FastAPI](https://medium.com/data-rebels/fastapi-authentication-revisited-enabling-oauth2-bearer-jwt-tokens-683fa08d08c7)

#### Implementação Base:
```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Configuração em config.py
SECRET_KEY = "sua_chave_secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

## 3. Frontend (React/TypeScript)

### 3.1. Gerenciamento de Estado

#### Recursos de Aprendizado:
- [React Query](https://tanstack.com/query/latest/docs/react/overview) - Documentação oficial
- [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started) - Documentação oficial
- [Zustand](https://github.com/pmndrs/zustand) - GitHub

#### Exemplo com React Query:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Hook personalizado para formulários
export const useFormData = () => {
  return useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const response = await fetch('/api/forms');
      return response.json();
    }
  });
};
```

## 4. Segurança

### Recursos de Aprendizado:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Guia de segurança
- [Web Security Academy](https://portswigger.net/web-security) - PortSwigger
- [FastAPI Security](https://fastapi.tiangolo.com/advanced/security/) - Documentação oficial

### Implementação de Rate Limiting:
```python
from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter

@app.get("/api/resource")
@limiter.limit("5/minute")
async def read_resource(request: Request):
    return {"message": "Success"}
```

## 5. Monitoramento

### Recursos de Aprendizado:
- [Sentry Documentation](https://docs.sentry.io/) - Monitoramento de erros
- [Prometheus](https://prometheus.io/docs/introduction/overview/) - Métricas
- [ELK Stack](https://www.elastic.co/what-is/elk-stack) - Logging

### Exemplo de Logging Estruturado:
```python
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("request_started",
                path=request.url.path,
                method=request.method)
    response = await call_next(request)
    return response
```

## 6. Recursos e Referências

### Tutoriais Completos
- [FastAPI Full Stack](https://fastapi.tiangolo.com/tutorial/) - Tiangolo
- [Full Stack Open](https://fullstackopen.com/en/) - Universidade de Helsinki
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Canais do YouTube
- [Traversy Media](https://www.youtube.com/user/TechGuyWeb)
- [Fireship](https://www.youtube.com/c/Fireship)
- [Python Engineer](https://www.youtube.com/c/PythonEngineer)

### Plataformas de Aprendizado
- [FreeCodeCamp](https://www.freecodecamp.org/)
- [Real Python](https://realpython.com/)
- [Egghead.io](https://egghead.io/)

### Comunidades
- [FastAPI Discord](https://discord.com/invite/VQjSZaeJmf)
- [Reactiflux Discord](https://discord.gg/reactiflux)
- [Python Discord](https://discord.gg/python)

---

> **Nota**: Este guia está em constante evolução. Contribuições são bem-vindas através de pull requests.
