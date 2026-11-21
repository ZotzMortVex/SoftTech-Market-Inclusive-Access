# Informe de revision integral pre-sustentacion

Fecha de verificacion: 21 de noviembre de 2026
Rama: `fix/revision-integral-pre-sustentacion`
Repositorio: `ZotzMortVex/SoftTech-Market-Inclusive-Access`

## 1. Resumen ejecutivo

| Comprobacion | Resultado |
|---|---|
| Rama | Trabajo realizado en `fix/revision-integral-pre-sustentacion`, publicada previamente; no se integro en `main`. Los cambios de esta actualizacion siguen locales y sin publicar. |
| Respaldo | Se confirmo `DB_HOST` local antes de crear y verificar un respaldo `mysqldump` fuera del repositorio (34.097 bytes). |
| `npm run lint` | Aprobado (`tsc --noEmit`, codigo de salida 0). |
| `npm test` | 59 aprobadas, 0 fallidas, 0 omitidas en la verificacion actual. |
| `npm run build` | Aprobado. Vite advierte que el chunk principal minificado mide 800,57 kB y supera el umbral de 500 kB. |
| Smoke tests HTTP | 61 aprobados, 0 fallidos en la ejecucion de API resumida en esta revision; no se conserva el script temporal. |
| API y base de datos | `GET /api/health`: HTTP 200, `status=ok`, `database=connected`. Base local: 9 productos activos; existe `products.lsc_video_url`. |
| Estado de recuperacion | `password_reset_tokens` aparece en `database/schema.sql`, pero no en la base local existente. No se modifico el esquema. |
| Datos de prueba | La consulta local encontro 2 cuentas `prueba+...@example.com` y 2 sesiones, sin pedidos asociados. Se eliminaron localmente y se verifico que quedaran 0. No se creo administrador de prueba ni pedidos. |
| Dependencias | `node_modules` ya existia; no se instalaron ni actualizaron dependencias. |

`npm audit` reporto 5 vulnerabilidades: 2 altas, 2 moderadas y 1 baja, en dependencias asociadas a `body-parser`, `vite`, `nodemailer`, `qs` y `dompurify`. No se ejecuto `npm audit fix` ni se cambiaron dependencias.

## 2. Hallazgos

| ID | Severidad | Modulo | Descripcion y causa | Estado | Archivo y commit | Evidencia |
|---|---|---|---|---|---|---|
| H-01 | P0 | Aprovisionamiento fallback | El almacen fallback podia crear un administrador con una credencial fija. Se exige ahora configuracion explicita antes de aprovisionarlo. | Corregido | [server/fallbackStore.ts](../server/fallbackStore.ts), [server/auth.ts](../server/auth.ts). Commit `48a935a`. | Prueba de regresion `does not create a fallback administrator without explicit credentials`; suite actual 59/59. |
| H-02 | P1 | Accesibilidad | El centro no presentaba la opcion para apagar los destellos, aunque el estado podia representarse. Se agrego la opcion y una confirmacion escrita al desactivarlos. | Corregido | [src/components/AccessibilityCenterView.tsx](../src/components/AccessibilityCenterView.tsx), [src/utils/accessibilitySettings.ts](../src/utils/accessibilitySettings.ts), [src/App.tsx](../src/App.tsx). Commit `c1c30ff`. | Pruebas de estados de intensidad y confirmacion; verificacion manual en navegador de “Apagado”, aviso escrito y restauracion a “Estandar”. |
| H-03 | P1 | Reflujo al 200 % | El centro de accesibilidad desbordaba horizontalmente y los controles flotantes tapaban contenido. Se ajusto el encabezado, se apilaron los controles de garantia y se movieron los controles flotantes al flujo del documento al 200 %. | Corregido | [src/App.tsx](../src/App.tsx), [src/index.css](../src/index.css), [src/components/FloatingAccessibilityWidget.tsx](../src/components/FloatingAccessibilityWidget.tsx), [src/components/SignLanguageInterpreter.tsx](../src/components/SignLanguageInterpreter.tsx); sin commit. | Navegador local: cambio claro/oscuro a 200 % y sin desbordamiento en 360, 768 y 1280 px. CP-10 actualizado en [docs/resultados_pruebas_aceptacion.md](./resultados_pruebas_aceptacion.md). |
| H-04 | P1 (riesgo reportado por auditoria) | Dependencias | `npm audit` detecta vulnerabilidades de severidad alta, moderada y baja. No se verifico explotabilidad en este prototipo y no se actualizaron versiones. | Pendiente de confirmacion para actualizar dependencias | `package.json` y archivo de bloqueo; sin cambios ni commit. | Resultado de `npm audit`: 2 altas, 2 moderadas, 1 baja. |
| H-05 | P1 | Baja de cuentas y sesiones | La baja de un cliente elimina en una transaccion sus sesiones persistidas en MySQL y las sesiones de respaldo mantenidas en memoria por `MysqlSessionStore`; si la revocacion falla, la baja no se confirma. Se conservan los pedidos historicos. | Corregido | [server/auth.ts](../server/auth.ts), [server/accountDeletion.ts](../server/accountDeletion.ts), [server/mysqlSessionStore.ts](../server/mysqlSessionStore.ts), [server/session.ts](../server/session.ts); sin commit. | Pruebas unitarias verifican SQL parametrizado, orden de baja/revocacion, proteccion de otros roles y limpieza selectiva del almacenamiento en memoria. No se ejecuto una baja administrativa HTTP contra MySQL. |

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
| `GET /api/auth/users`, `PATCH /api/auth/users/:id/status`, `DELETE /api/auth/users/:id` | `GET /users`: 401 sin sesion y 403 con sesion cliente. Pruebas unitarias verifican revocacion de sesiones al eliminar una cuenta. | Casos felices administrativos, bloqueo, baja HTTP contra MySQL y proteccion de otros administradores. |
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
| Texto al 200 % | Aprobado en el centro de accesibilidad a 360, 768 y 1280 px, en tema claro y oscuro; ancho del documento igual al ancho visible y controles flotantes sin superposicion. Otras vistas requieren comprobacion manual. |
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
- Se corrigio el reflujo al 200 % del centro de accesibilidad y se pasan sus controles flotantes al flujo del documento para que no cubran contenido.
- La baja de clientes revoca sesiones persistidas en MySQL y las sesiones conservadas por el almacenamiento en memoria de respaldo; las pruebas cubren la revocacion selectiva.
- No se cambio el esquema de base de datos ni se instalaron/actualizaron dependencias.
- CP-10 se actualizo a aprobado para el centro de accesibilidad en los anchos comprobados; las demas vistas al 200 % siguen pendientes.

## 7. Archivos y publicacion

Commits de la rama publicados previamente:

- `48a935a Elimina el administrador de respaldo inseguro`
- `c1c30ff Añade control para desactivar los destellos`

Los cambios de esta actualizacion no tienen commit ni se publicaron. El diff de trabajo incluye los arreglos de reflujo y revocacion de sesiones, sus pruebas y este informe.

No se modifico `main`, no se publico el diff de esta actualizacion, no se integro la rama y no se movieron etiquetas. No se imprimieron ni se incluyeron secretos o datos personales. El respaldo permanece fuera del repositorio. La limpieza previa verifico 0 cuentas coincidentes y 0 pedidos asociados despues de eliminar localmente 2 cuentas de prueba y sus sesiones.

## 8. Riesgos restantes

- El reflujo al 200 % se verifico en el centro de accesibilidad; falta recorrer las demas vistas en ese nivel de ampliacion.
- Vulnerabilidades reportadas por `npm audit` pendientes de decidir/actualizar (H-04).
- Recuperacion de contrasena sin SMTP probado y con tabla ausente en la base local actual.
- No se verificaron de extremo a extremo los pagos, concurrencia, perfiles administrativos, lector de pantalla, persona sorda ni todos los anchos.
- El chunk principal de produccion supera el umbral de advertencia de Vite.

La rama publicada permanece sin integrar en `main`; los cambios de esta actualizacion aun requieren revision y publicacion.
