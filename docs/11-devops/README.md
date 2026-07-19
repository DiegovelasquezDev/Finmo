# 11 — DevOps

Diagnóstico de partida: Auditoría §11 (A-05, A-06, Dockerfile del modelo). 

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| ENTORNOS.md | Matriz dev/CI/prod: variables por entorno (la lista real de env.js — cierra D-12), servicios activos, diferencias (swagger, rate limits, logging); compose reparado como entorno dev canónico | Fase 0 | Alta | Fase 0–1 | infra | Sí |
| CI-CD.md | Pipeline GitHub Actions: jobs (lint/test/build ×3 apps), política de ramas y PRs, qué bloquea el merge | ESTRATEGIA (10) | **Crítica** | Fase 1 | CI | **Sí** |
| DESPLIEGUE.md | Runbook de producción completo: Railway con los 3 servicios + MySQL (+ Redis si Fase 8 lo adopta), imagen del modelo optimizada (multi-stage, HF horneado, non-root, HEALTHCHECK), migraciones en release, rollback, dominios y secretos | ENTORNOS.md, Fase 2–3 | **Crítica** | Fase 10 | infra | **Sí** |
