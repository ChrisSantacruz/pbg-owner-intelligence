# Reto universal: Screen sharing del cliente sin app

## Qué piden

Enviar un link al cliente (móvil, sin instalar app). Tras permiso, el **agente ve la pantalla del cliente** mientras navega por otros sitios o apps, para guiarlo.

## Qué es técnicamente posible

### Desktop (Chrome / Edge / Firefox / Safari reciente)

- **WebRTC + `getDisplayMedia()`** permite capturar pantalla/ventana/pestaña desde el navegador, con permiso explícito del usuario.
- Un link puede abrir una página web que pida compartir pantalla y envíe el stream al agente (SFU/TURN).
- Limitaciones: el usuario elige qué compartir; puede parar cuando quiera; políticas corporativas/OS pueden bloquearlo.

Fuentes: [MDN getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia), [W3C Screen Capture](https://www.w3.org/TR/screen-capture/).

### Android

- En **Chrome Android**, `getDisplayMedia` existe con soporte más limitado/variable según versión; a menudo captura la pantalla completa tras permiso del sistema.
- Un PWA/página web puede acercarse al flujo “link → permiso → stream”, pero la UX de permiso es del SO y no es idéntica a desktop.
- Capturar **otras apps** de forma fiable desde un tab web está sujeto a restricciones del SO y del browser.

Fuente: Chromium/Android release notes y MDN compat tables para `getDisplayMedia`.

### iPhone / iOS (Safari)

- **No es posible** que una página web abierta por link capture la pantalla completa del iPhone (otras apps + home screen) solo con APIs web estándar.
- Safari **no expone** a páginas web arbitrarias un `getDisplayMedia` usable como en desktop para screen share remoto del dispositivo.
- ReplayKit / Broadcast Upload Extension permiten screen broadcast, pero requieren **app nativa** (o integración tipo Broadcast Upload), no un simple link web sin instalar nada.
- Facetime/SharePlay u otras apps de Apple son caminos nativos, no “un link mágico sin app”.

Fuentes: [Apple ReplayKit](https://developer.apple.com/documentation/replaykit), documentación WebKit sobre media capture limitations, MDN compat de `getDisplayMedia` (iOS Safari: soporte de screen share web no equivalente al desktop).

## Qué no es posible (y por qué)

1. **iOS: ver toda la pantalla del cliente (incluye otras apps) solo con un link web, sin app** — el sandbox de iOS no deja que una web capture el framebuffer del sistema.
2. **Garantizar captura cross-app silenciosa** en cualquier plataforma — siempre hay permiso visible y el usuario puede negar/parar; en móvil es más estricto.
3. **Bypass de DRM / apps que bloquean capture** — muchas apps bancarias/video marcan flags de secure surface.
4. **“Exactamente lo pedido” en iPhone** con cero instalación y navegación libre por el OS — hoy no es viable de forma compliant.

## Diferencias clave

| Plataforma | Link sin app | Ver otras apps | Madurez |
|------------|--------------|----------------|---------|
| Desktop    | Sí (web)     | Sí, si el usuario comparte pantalla/ventana | Alta |
| Android    | Parcial      | A veces pantalla completa vía browser/OS   | Media |
| iPhone     | No (para screen real del device) | No vía web pura | Baja / requiere nativo |

## Mejor alternativa técnica (recomendada)

Arquitectura en capas, no una sola promesa imposible:

1. **Desktop + Android Chrome (cuando soporte):** flujo web inmediato  
   `link → página PBG → getDisplayMedia/WebRTC → agente ve stream`  
   (TURN/SFU, consent logs, watermark, kill switch).

2. **iOS (realidad del mercado):**  
   - **Opción A (máxima fidelidad):** app ligera o extensión Broadcast Upload (ReplayKit) publicada en App Store / TestFlight; el link abre Universal Link que lanza el broadcast.  
   - **Opción B (cero install, menor fidelidad — la más pragmática para ventas):** el cliente no comparte el OS; comparte un **contexto controlado**:
     - co-browsing dentro de un webview/página de PBG (DOM sync, no framebuffer), o
     - el agente comparte **su** pantalla al cliente (ya lo tienen con Life View) + el cliente envía fotos/archivos/QR, o
     - sesión asistida donde el cliente navega un **portal hosted** (ilustración/aplicación) con telemetría de página, cursor y annotations — suficiente para guiar el 80% de casos de seguros.

3. **Producto honesto:** feature flags por plataforma  
   - Desktop: “Ver pantalla del cliente”  
   - iOS: “Sesión guiada (co-browse)” / “Pedir captura manual”  
   Nunca prometer OS-level screen share en iPhone vía solo link.

## Recomendación final para PBG

Priorizar **WebRTC screen share en desktop/Android** + **co-browse / portal guiado en iOS**, con messaging claro al agente según el device del cliente. Eso se acerca al objetivo de negocio (guiar remotamente) sin mentir técnicamente sobre iPhone.

## Fuentes principales

- MDN: `MediaDevices.getDisplayMedia()`
- W3C Screen Capture specification
- Apple ReplayKit documentation
- WebKit / iOS Safari media capture constraints (compatibilidad pública MDN/Can I Use)
