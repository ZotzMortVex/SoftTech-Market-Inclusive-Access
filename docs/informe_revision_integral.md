# Informe de revision integral pre-sustentacion

Fecha de verificacion: 21 de noviembre de 2026
Rama: `fix/revision-integral-pre-sustentacion`
Repositorio: `ZotzMortVex/SoftTech-Market-Inclusive-Access`

## 1. Resumen ejecutivo

| Comprobacion | Resultado |
|---|---|
| Rama | Trabajo realizado en la rama requerida; no se publico ni se integro en `main`. |
| Respaldo | Se confirmo `DB_HOST` local antes de crear y verificar un respaldo `mysqldump` fuera del repositorio (34.097 bytes). |
| `npm run lint` | Aprobado (`tsc --noEmit`, codigo de salida 0). |
| `npm test` | 55 aprobadas, 0 fallidas, 0 omitidas. |
| `npm run build` | Aprobado. Vite advierte que el chunk principal minificado mide 800,43 kB y supera el umbral de 500 kB. |
| Smoke tests HTTP | 61 aprobados, 0 fallidos en la ejecucion de API resumida en esta revision; no se conserva el script temporal. |
| API y base de datos | `GET /api/health`: HTTP 200, `status=ok`, `database=connected`. Base local: 9 productos activos; existe `products.lsc_video_url`. |
| Estado de recuperacion | `password_reset_tokens` aparece en `database/schema.sql`, pero no en la base local existente. No se modifico el esquema. |
| Datos de prueba | La consulta local encontro 2 cuentas `prueba+...@example.com` y 2 sesiones, sin pedidos asociados. Se eliminaron localmente y se verifico que quedaran 0. No se creo administrador de prueba ni pedidos. |
| Dependencias | `node_modules` ya existia; no se instalaron ni actualizaron dependencias. |

`npm audit` reporto 5 vulnerabilidades: 2 altas, 2 moderadas y 1 baja, en dependencias asociadas a `body-parser`, `vite`, `nodemailer`, `qs` y `dompurify`. No se ejecuto `npm audit fix` ni se cambiaron dependencias.

## 2. Hallazgos

| ID | Severidad | Modulo | Descripcion y causa | Estado | Archivo y commit | Evidencia |
|---|---|---|---|---|---|---|
| H-01 | P0 | Aprovisionamiento fallback | El almacen fallback podia crear un administrador con una credencial fija. Se exige ahora configuracion explicita antes de aprovisionarlo. | Corregido | [server/fallbackStore.ts](../server/fallbackStore.ts), [server/auth.ts](../server/auth.ts). Commit `48a935a`. | Prueba de regresion `does not create a fallback administrator without explicit credentials`; suite 55/55. |
| H-02 | P1 | Accesibilidad | El centro no presentaba la opcion para apagar los destellos, aunque el estado podia representarse. Se agrego la opcion y una confirmacion escrita al desactivarlos. | Corregido | [src/components/AccessibilityCenterView.tsx](../src/components/AccessibilityCenterView.tsx), [src/utils/accessibilitySettings.ts](../src/utils/accessibilitySettings.ts), [src/App.tsx](../src/App.tsx). Commit `c1c30ff`. | Pruebas de estados de intensidad y confirmacion; verificacion manual en navegador de “Apagado”, aviso escrito y restauracion a “Estandar”. |
| H-03 | P1 | Reflujo al 200 % | En el centro de accesibilidad, al aumentar el texto a 200 %, aparece desplazamiento horizontal y los controles flotantes se superponen al contenido. No se corrigio: el intento de ajuste visual fue revertido por el usuario y no se reaplico. | Pendiente | [src/App.tsx](../src/App.tsx), [src/index.css](../src/index.css); sin commit. | Verificacion visual en viewport integrado de 833 x 622, con el control de texto en 200 %. Tambien se registra en [docs/resultados_pruebas_aceptacion.md](./resultados_pruebas_aceptacion.md), CP-10. |
| H-04 | P1 (riesgo reportado por auditoria) | Dependencias | `npm audit` detecta vulnerabilidades de severidad alta, moderada y baja. No se verifico explotabilidad en este prototipo y no se actualizaron versiones. | Pendiente de confirmacion para actualizar dependencias | `package.json` y archivo de bloqueo; sin cambios ni commit. | Resultado de `npm audit`: 2 altas, 2 moderadas, 1 baja. |
| H-05 | P2 | Baja de cuentas y sesiones | El endpoint de baja elimina el registro de `users`, pero no elimina explicitamente sesiones de `user_sessions`; `requireAuth` solo comprueba que exista `session.userId`. La tabla de pedidos tampoco define una FK que elimine pedidos al borrar un cliente. No se comprobo acceso posterior con una cuenta eliminada ni se definio si los pedidos deben conservarse. | Pendiente de confirmacion sobre la politica de sesiones e historial | [server/auth.ts](../server/auth.ts), [server/session.ts](../server/session.ts), [database/schema.sql](../database/schema.sql); sin commit. | Inspeccion estatica de `DELETE /api/auth/users/:id`, `requireAuth`, `user_sessions` y `sales_orders`. No se hizo una baja administrativa feliz porque no se utilizaron credenciales del administrador existente. |

### Limitaciones conocidas aceptadas

Se mantienen sin cambios: los videos no tienen subtitulos; no hay aviso previo al cierre por inactividad; no hay limite de intentos de inicio de sesion; no hay cabeceras de seguridad HTTP ni auditoria centralizada; `POST /api/payments/simulated/charge` es una ruta heredada, fuera del flujo principal de compra; y `@google/genai` figura en `package.json` pero no se usa.

## 3. Cobertura de API

Las 61 verificaciones HTTP fueron smoke tests, no una ejecucion exhaustiva de todas las combinaciones de campos invalidos, roles, carreras, estados de pago e imagenes indicadas en el plan. La tabla distingue lo probado de lo que falta:

| Ruta o grupo | Resultado comprobado | Pendiente |
|---|---|---|
| `GET /api/health` | HTTP 200 y conexion MySQL confirmada. | Ninguno para la comprobacion basica de salud. |
| `POST /api/auth/register`, `POST /api/auth/login` | Registro y acceso con cuenta temporal; correo duplicado, contrasena incorrecta, limites 7/8/128/129, rol cliente y cookie `HttpOnly` revisados. | Matriz completa de tipos, longitudes extremas y mensajes en todas las variantes. |
| `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/activity` | Se comprobo el acceso sin sesion y el vencimiento simulado de una sesion en las verificaciones HTTP. | Recorrido completo del cierre, renovacion de actividad y sesiones invalidas en cada ruta. |
| `POST /api/auth/password-reset/request` | Limite de 5 solicitudes y rechazo 429 de la sexta comprobados. Sin SMTP configurado, las solicitudes previas respondieron 503. | Envio real de correo, expiracion/reutilizacion de enlace y `POST /confirm`. La tabla de tokens falta en la base local; no se altero el esquema. |
| `GET /api/auth/users`, `PATCH /api/auth/users/:id/status`, `DELETE /api/auth/users/:id` | `GET /users`: 401 sin sesion y 403 con sesion cliente. | Casos felices administrativos, bloqueo, baja, proteccion de otros administradores y revocacion de sesiones. |
| `GET /api/products`, `GET /api/products/:id` | HTTP 200 y datos de catalogo/detalle consultados. La API devolvio 9 productos. | Filtros en interfaz, productos inactivos y detalle visual completo. |
| `POST /api/products/images`, `POST /api/products`, `PUT /api/products/:id`, `PATCH /api/products/:id/status`, `DELETE /api/products/:id` | Se comprobo el rechazo de acceso sin sesion/rol administrador en el smoke test. | Carga real, encabezados de imagen, limite 5 MB, CRUD feliz, baja/reactivacion y archivo en disco. |
| `GET /api/orders/mine`, `GET /api/orders`, `PATCH /api/orders/:orderId/status` | Se comprobo control de acceso sin sesion y de cliente en rutas administrativas. | Historial, transiciones de estado y gestion feliz con administrador. |
| `POST /api/payments/mercadopago/preferences`, `POST /api/payments/mercadopago/confirm` | Suite unitaria cubre validaciones sandbox y confirmacion simulada. No se contactaron servicios externos. | Checkout integral con Mercado Pago, estados aprobado/pendiente/rechazado, discrepancias de importe/moneda/referencia/live mode, repeticion e inventario concurrente. |
| `GET /api/analytics/sales` | Se comprobo el control de acceso administrativo. Pruebas unitarias cubren validacion de periodo. | Consulta feliz como administrador y exportacion PDF en navegador. |
| `POST /api/payments/simulated/charge` | API rechazo cantidad superior al inventario con HTTP 409. Pruebas automatizadas cubren validacion de datos y el flujo simulado en el cliente. | Transaccion real, pago rechazado/pendiente, doble compra concurrente y consistencia inventario/pedido en MySQL. |
| JSON invalido, cuerpo mayor a 16 kB e inyeccion en campos | Incluidos en los smoke tests HTTP; no se observaron filtraciones de contrasenas en las respuestas comprobadas. | Ampliar entradas invalidas ruta por ruta y revisar todas las respuestas de error. |

La columna `products.lsc_video_url` existe en la base local. La base local no contiene `password_reset_tokens`, aunque la tabla esta declarada en el esquema; no se aplico `schema.sql` ni otra migracion.

## 4. Cobertura de frontend y accesibilidad

| Vista/flujo | Resultado |
|---|---|
| Catalogo como visitante | Abre y muestra tarjetas de producto. La instantanea accesible del navegador encontro textos y botones con nombre accesible. |
| Centro de accesibilidad | Se verificaron en navegador los botones de intensidad, la opcion “Apagado” y su mensaje escrito; luego se restauro “Estandar” y texto 100 %. |
| Texto al 200 % | Fallido: desplazamiento horizontal y controles flotantes superpuestos en el centro de accesibilidad. |
| Recuperacion en `IndependentAuthPortal` | Inspeccion estatica confirma uso de las funciones API de solicitud y confirmacion. No se envio correo real. El flujo alternativo antiguo no se considero evidencia del flujo activo. |
| Otras vistas y perfiles | No se completaron recorridos integrales de registro, perfil, carrito, checkout, historial, soporte, contacto y administracion con los tres perfiles. Requieren ejecucion manual. |
| Consola | La carga anonima registro dos respuestas HTTP 401 de consultas de sesion, compatibles con el estado visitante. No se observo una pagina de error de React. La consola no quedo limpia de errores de red, por lo que no se declara aprobada. |
| Teclado, lector de pantalla, contraste, destellos y responsive | No validados exhaustivamente. No se ejecuto Lighthouse/axe ni se hizo prueba con una persona sorda. |

## 5. Pruebas que requieren ejecucion manual

1. **CP-04, inactividad:** iniciar sesion, dejar la aplicacion sin actividad durante 10 minutos, luego intentar una ruta protegida y capturar el cierre. La constante del cliente es `INACTIVITY_LIMIT_MS = 10 * 60 * 1000` en [src/hooks/useAutoLogout.ts](../src/hooks/useAutoLogout.ts); la sesion del servidor usa `SESSION_DURATION_MS = 10 * 60 * 1000` en [server/session.ts](../server/session.ts). No hay aviso previo, limitacion aceptada.
2. **CP-05, recuperacion por correo:** configurar un SMTP de prueba, solicitar enlace, comprobar que el mensaje es generico, abrir el enlace una vez, reutilizarlo y verificar rechazo. Para probar contra la base local antigua, primero debe autorizarse la actualizacion local necesaria para disponer de `password_reset_tokens`; no se hizo aqui.
3. **Mercado Pago sandbox:** usar comprador y credenciales sandbox, completar una compra aprobada, verificar pedido e inventario; repetir con pagos pendiente y rechazado. No usar credenciales de produccion ni compartir contrasenas/tokens.
4. **Lector de pantalla y validacion con persona sorda:** recorrer registro, catalogo, carrito, checkout y soporte; revisar anuncios, nombres accesibles, subtitulos/alternativas visuales y claridad de mensajes. Registrar hallazgos con consentimiento.
5. **Responsive:** repetir catalogo, detalle, carrito y checkout a 360, 768 y 1280 px, y al 200 % de texto; guardar capturas de desbordes, superposiciones o controles inaccesibles.
6. **Panel LSC:** con una persona usuaria, comprobar reproduccion, movimiento, minimizacion y atajos; en un producto sin video verificar mensaje escrito y ausencia del video de bienvenida.
7. **Flujos administrativos y de pedido:** con una cuenta autorizada de prueba, crear/editar/desactivar/reactivar producto y cambiar estados de pedido; verificar imagen, video, historial y exportacion PDF.

## 6. Cambios realizados

- Se elimino el aprovisionamiento automatico de un administrador fallback con credencial fija, salvo configuracion explicita.
- Se agrego la intensidad “Apagado” para destellos y su confirmacion escrita.
- No se cambio el esquema de base de datos ni se instalaron/actualizaron dependencias.
- Se corrigio CP-10 en el documento de aceptacion para registrar el fallo observado y se actualizo la limpieza de datos.

## 7. Archivos y publicacion

Commits locales contra `main`:

- `48a935a Elimina el administrador de respaldo inseguro`
- `c1c30ff Añade control para desactivar los destellos`

`git diff --stat main...HEAD` muestra 7 archivos versionados: 111 inserciones y 22 eliminaciones. Los documentos [docs/resultados_pruebas_aceptacion.md](./resultados_pruebas_aceptacion.md) y este informe estan sin seguimiento en Git, por lo que no aparecen en ese `git diff --stat`; deben incluirse en la revision del diff antes de publicar.

No se modifico `main`, no se hizo `push`, no se integro la rama y no se movieron etiquetas. No se imprimieron ni se incluyeron secretos o datos personales. El respaldo permanece fuera del repositorio. La limpieza final verifico 0 cuentas coincidentes y 0 pedidos asociados antes del borrado; se eliminaron 2 cuentas y sus 2 sesiones, sin borrar datos de produccion porque el host confirmado era local.

## 8. Riesgos restantes

- Fallo de reflujo y superposicion con texto al 200 % (H-03).
- Vulnerabilidades reportadas por `npm audit` pendientes de decidir/actualizar (H-04).
- Politica de sesiones e historial al eliminar una cuenta pendiente de confirmacion (H-05).
- Recuperacion de contrasena sin SMTP probado y con tabla ausente en la base local actual.
- No se verificaron de extremo a extremo los pagos, concurrencia, perfiles administrativos, lector de pantalla, persona sorda ni todos los anchos.
- El chunk principal de produccion supera el umbral de advertencia de Vite.

Para publicar, primero revisar `git diff main...HEAD` junto con los documentos sin seguimiento. La rama debe permanecer sin publicar hasta autorizacion expresa.
