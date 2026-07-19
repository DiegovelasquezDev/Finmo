# Documentación técnica de Finmo — índice maestro

Esta carpeta es la **fuente oficial de verdad** del proyecto. Regla de trabajo (obligatoria para cualquier sesión de desarrollo, humana o con agentes):

1. **Doc-first:** ninguna fase del [roadmap](01-roadmap/FASES.md) se implementa sin que su documentación esté escrita y revisada.
2. **No contradicción:** si una implementación necesita apartarse de un documento, primero se actualiza el documento (y el ADR si es decisión de arquitectura), después se escribe el código.
3. **Evidencia:** las afirmaciones sobre el estado del sistema citan archivo:línea o experimento versionado. Lo no verificado se marca como hipótesis.
4. **Honestidad académica:** ningún dato simulado se presenta como real; los datos de demostración se rotulan siempre.

## Mapa de carpetas

| Carpeta | Propósito | Estado |
|---|---|---|
| [00-auditoria/](00-auditoria/) | Auditoría integral del estado real (fuente de verdad de hallazgos) | ✅ escrita |
| [01-roadmap/](01-roadmap/) | Plan por fases doc-first + backlog priorizado | ✅ escritos |
| [02-arquitectura/](02-arquitectura/) | Vista general, diagramas C4, contratos entre servicios | 📝 planificada |
| [03-frontend/](03-frontend/) | Convenciones, estado de servidor, descomposición, a11y | 📝 planificada |
| [04-backend/](04-backend/) | Convenciones de features, integración con el modelo, degradación | 📝 planificada |
| [05-inteligencia-artificial/](05-inteligencia-artificial/) | Fichas de modelos, datasets, anotación, explicabilidad, emociones | 📝 planificada |
| [06-modelo-dominio/](06-modelo-dominio/) | Entidades, invariantes y reglas de negocio del dominio | 📝 planificada |
| [07-base-datos/](07-base-datos/) | Esquema, migraciones, retención, mantenimiento | 📝 planificada |
| [08-api/](08-api/) | Contrato real de la API, versionado, convenciones de error | 📝 planificada |
| [09-seguridad/](09-seguridad/) | Modelo de amenazas, políticas de sesión/datos, Ley 1581 | 📝 planificada |
| [10-testing/](10-testing/) | Estrategia de pruebas, cobertura, contrato server↔model | 📝 planificada |
| [11-devops/](11-devops/) | Despliegue, entornos, CI/CD, runbooks | 📝 planificada |
| [12-observabilidad/](12-observabilidad/) | Logs, métricas, correlación, incidentes | 📝 planificada |
| [13-funcionalidades/](13-funcionalidades/) | Especificación funcional por feature (alertas, reportes, presupuestos, import) | 📝 planificada |
| [14-metodologia/](14-metodologia/) | Scrum operativo + metodología experimental + cronograma real | 📝 planificada |
| [15-evaluacion-modelos/](15-evaluacion-modelos/) | Protocolo experimental y resultados reproducibles | 📝 planificada |
| [16-innovacion/](16-innovacion/) | Diferenciales, comparativa de mercado, comercialización | 📝 planificada |
| [17-deuda-tecnica/](17-deuda-tecnica/) | Registro vivo de deuda con severidad y estado | 📝 planificada |
| [18-decisiones-arquitectura/](18-decisiones-arquitectura/) | ADRs (decisiones con contexto, alternativas y consecuencias) | 📝 planificada |
| [19-sustentacion/](19-sustentacion/) | Guion de demo, banco de preguntas, resultados, slides | 📝 planificada |

Cada carpeta contiene un `README.md` con el plan detallado de sus documentos (objetivo, contenido, dependencias, prioridad, fase en que se escribe, y si es obligatorio para terminar el proyecto).

## Resumen del plan de documentación

Documentos **obligatorios** para considerar el proyecto terminado, en orden de escritura:

| Documento | Carpeta | Fase | Prioridad |
|---|---|---|---|
| AUDITORIA-INTEGRAL.md | 00 | ✅ hecha | — |
| FASES.md · BACKLOG-PRIORIZADO.md | 01 | ✅ hechas | — |
| ADR-001…004 (microservicio, JWT, monorepo, deps/tablas muertas) | 18 | 0 | Crítica |
| REGISTRO.md (deuda técnica viva) | 17 | 0 | Crítica |
| ESTRATEGIA.md (testing) | 10 | 1 | Crítica |
| MODELO-AMENAZAS.md · POLITICAS.md | 09 | 2 | Crítica |
| DISENO.md (observabilidad) · INTEGRACION-MODELO.md | 12 · 04 | 3 | Alta |
| DATASETS.md · GUIA-ANOTACION.md · PROTOCOLO.md | 05 · 15 | 4 | Crítica |
| MODELOS.md (fichas) · RESULTADOS.md | 05 · 15 | 5 | Crítica |
| EXPLICABILIDAD.md · EXPLICACIONES.md (UX) | 05 · 13 | 6 | Alta |
| EMOCIONES.md + actualización modelo de dominio | 05 · 06 | 7 | Alta |
| ALERTAS-PROACTIVAS.md · REPORTES.md · PRESUPUESTOS.md | 13 | 8 | Alta |
| IMPORTACION.md | 13 | 9 | Media |
| DESPLIEGUE.md · COMERCIALIZACION.md · COMPARATIVA-MERCADO.md | 11 · 16 | 10 | Alta |
| METODOLOGIA.md · CRONOGRAMA.md · GUION-DEMO.md · BANCO-PREGUNTAS.md · RESULTADOS.md | 14 · 19 | 11 | Crítica |

Documentos recomendados no bloqueantes: VISION-GENERAL.md y C4 (02), CONVENCIONES (03/04), ENTIDADES.md (06), ESQUEMA.md (07), CONTRATO.md (08).
