# Respuestas para el formulario (copiar/pegar)

## 1. ¿Qué construiste? (≤150 palabras)

Pulse: un MVP de inteligencia para el dueño de agencia. Incluye login JWT (cookie httpOnly), un overview con insight de señal vs ruido, métricas con nivel de confianza, ranking de agentes y drill-down con acciones. La regla central: una conversación solo cuenta si hay disposición humana adecuada o ≥4 speaker turns; carrier answered nunca prueba conversación. Excluí PBG Billing, marqué teléfono compartido Carlos/Diego y advertí divergencia de premium en Maria. Los callbacks no cuentan como citas.

## 2. ¿Cuál fue tu decisión técnica más importante y por qué? (≤150 palabras)

Definir métricas de confianza antes de visualizar. En lugar de graficar columnas crudas, modelé conversaciones confirmadas, contacto inflado y citas reales, y etiqueté lo demás como baja/media confianza. Eso responde al enunciado (“no puedes confiar en todos los datos”) y evita que el dueño optimice vanity metrics. JWT fue deliberadamente mínimo: demuestra frontera de producto sin robar tiempo al problema de negocio.

## 3. ¿Qué podría romperse si esto entrara mañana a producción? (≤150 palabras)

Auth demo (secreto/credenciales fijos), sin refresh/revocación ni RBAC. CSV en proceso no escala ni audita. Heurísticas de confirmación pueden falsos positivos/negativos según calidad de dispos/transcription. Atribución con teléfono compartido seguiría contaminando rankings. Premium pantalla sin reconciliar con documentos puede distorsionar revenue. Falta paginación, tests de regresión de métricas y controles de acceso por agencia/tenant.

## 4. Si tuvieras una semana adicional, ¿qué construirías después? (≤150 palabras)

Pipeline de eventos en tiempo casi real, reconciliación premium pantalla vs documento, score de confianza por fila, cohortes semanales, alertas automáticas de contacto inflado, multi-tenant real, auth productiva, y tests que fijen las reglas del dataset. Luego export ejecutivo PDF y “qué hacer mañana” priorizado por ROI (coste/conversación confirmada y coste/venta).

## Respuesta segundo reto (≤500 palabras)

Pegar el contenido resumido de SCREEN_SHARING_RESEARCH.md (versión corta abajo).

---

Versión corta (~380 palabras) para el formulario:

Queremos un link sin app para ver la pantalla del cliente (incluye otras apps). En desktop es viable con WebRTC + getDisplayMedia tras permiso. En Android Chrome hay soporte parcial/variable de captura vía browser/OS. En iPhone/Safari no es posible capturar la pantalla del sistema (otras apps) solo con una página web: el sandbox de iOS lo impide; ReplayKit exige app/extensión nativa. Tampoco se puede garantizar captura silenciosa ni bypass de secure surfaces. Diferencia clave: desktop alto, Android medio, iOS web puro inviable para OS-level share. Alternativa: (1) screen share WebRTC en desktop/Android; (2) en iOS, co-browse en portal hospedado + telemetría de página/annotations, o app ligera con Broadcast Upload; (3) feature flags honestos por plataforma. Fuentes: MDN getDisplayMedia, W3C Screen Capture, Apple ReplayKit, compat WebKit/MDN.
