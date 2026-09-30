# Pulse — Inteligencia para el Dueño de la Agencia

MVP para el reto de ingeniería PBG Consulting. Ayuda al dueño de una agencia a ver **qué está pasando de verdad**, no solo lo que el carrier reporta.

## Demo local

```bash
cd web
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

**Login demo**

- Email: `owner@pbg.agency`
- Password: `pulse2026`

Auth: JWT HS256 en cookie httpOnly (`pbg_owner_session`, 8h).

## Qué construimos

1. Login de dueño (sesión segura).
2. Overview ejecutivo (señal vs ruido) pensado para móvil.
3. Métricas **definidas antes de mostrarse**, con nivel de confianza.
4. Ranking de agentes (excluye cuentas no humanas).
5. Drill-down + acción sugerida + alertas de confianza.
6. **Asesor Pulse (LLM)**: briefing + chatbot para preguntar por el negocio.
7. **Carga escalable**: sube otro CSV (+ notas JSON) y analiza con las mismas reglas.

## Reglas de confianza del dataset

| Concepto | Definición |
|----------|------------|
| Conversación confirmada | `disposition` ∈ {conversation, appointment} **o** `speaker_turns >= 4` |
| Carrier answered | Señal técnica de baja confianza — **no** prueba conversación |
| Contacto inflado | Carrier answered **sin** conversación confirmada |
| Cita real | `appointment_type === appointment` (callbacks no cuentan) |
| Totales de negocio | Excluyen cuentas `non_person_account` (PBG Billing) |

Datos en `web/src/data/` (sintéticos del paquete del reto).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- `jose` para JWT
- Sin base de datos: CSV + notas de confianza

## Entrega

- Repo: este directorio
- Video ≤ 2 min: login → insight → señal/ruido → agente flagged → acción
- Respuestas del formulario: ver `ENTREGA.md`
- Screen sharing research: `SCREEN_SHARING_RESEARCH.md`
