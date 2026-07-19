# 10 — Testing

Diagnóstico de partida: Auditoría §10 — cero pruebas con tooling declarado (A-02). El documento de estrategia se escribe antes que el primer test.

| Documento | Objetivo · contenido | Depende de | Prioridad | Cuándo | Módulos | ¿Obligatorio? |
|---|---|---|---|---|---|---|
| ESTRATEGIA.md | Pirámide para las 3 apps: qué se prueba (services server ≥70%, services model ≥70%, contrato server↔model, flujos HTTP con supertest, utilidades client) y qué se decide no probar (cobertura de UI exhaustiva) con justificación; convenciones (naming, fixtures, mocks del modelo, BD de test); definición de done por PR (CI verde) | Auditoría §10 | **Crítica** | Fase 1, antes del primer test | server, model, client, CI | **Sí** |
| COBERTURA.md | Reporte vivo por fase: % por paquete, huecos conocidos y por qué; se regenera al cerrar cada fase (evidencia citable en sustentación — pregunta 10 del jurado) | ESTRATEGIA.md | Alta | Fin de cada fase desde la 1 | — | **Sí** |
| CASOS-BORDE-MODELO.md | Catálogo de casos borde del microservicio que todo cambio debe seguir pasando: 0 transacciones, 1 mes, 2 meses (el caso R²=1.0), ingreso mínimo, texto vacío/fuera de dominio (debe dar OTHER), payload máximo | ESTRATEGIA.md, PROTOCOLO (15) | Alta | Fase 1 (inicial) + Fase 5 (ampliación) | model | Sí |
