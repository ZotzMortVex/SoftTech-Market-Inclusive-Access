# Informe de revision integral final

Fecha y hora de la revision: 21 de noviembre de 2026

## 1. Estado de Git

| Comprobacion | Resultado |
|---|---|
| Rama actual | `fix/revision-integral-pre-sustentacion` |
| Estado | Rama publicada en seguimiento de `origin/fix/revision-integral-pre-sustentacion`; Git indica 3 commits locales por delante de `origin`. El working tree contiene únicamente el informe nuevo `docs/informe_revision_integral_final.md` como archivo no preparado. |
| Commits nuevos sobre `main` | 7 |

Commits nuevos:

| Hash completo | Hash corto | Mensaje |
|---|---|---|
| `cb469a57564dd8b6b7f22b51f5a27084e131bfeb` | `cb469a5` | Devuelve al carrito al cancelar Mercado Pago |
| `4b9bdeed603c96e1b4d2497a88107b4005d0f41e` | `4b9bdee` | Revoca sesiones al eliminar una cuenta |
| `07922bb903149335445dd9cd61c8fd7292a8a30d` | `07922bb` | Corrige el reflujo al 200 por ciento |
| `d505164bdf5c0a75ac7754f812f29d837b56d7b9` | `d505164` | Ajusta formato del informe integral |
| `499f3fd386e04ed57729f0c74e20ef9ebf79dc64` | `499f3fd` | Documenta resultados de la revision integral |
| `c1c30ff501a6667ca968fc17565559d0e3e3aa6b` | `c1c30ff` | Anade control para desactivar los destellos |
| `48a935ae831cf30abf0746bc82215f46f1329039` | `48a935a` | Elimina el administrador de respaldo inseguro |

Diff `main...HEAD`:

| Archivo | Cambios |
|---|---|
| `docs/informe_revision_integral.md` | Modificado |
| `docs/resultados_pruebas_aceptacion.md` | Modificado |
| `server/accountDeletion.test.ts` | Nuevo |
| `server/accountDeletion.ts` | Nuevo |
| `server/auth.ts` | Modificado |
| `server/fallbackStore.test.ts` | Nuevo |
| `server/fallbackStore.ts` | Modificado |
| `server/mysqlSessionStore.ts` | Modificado |
| `server/session.ts` | Modificado |
| `src/App.tsx` | Modificado |
| `src/components/AccessibilityCenterView.tsx` | Modificado |
| `src/components/FloatingAccessibilityWidget.tsx` | Modificado |
| `src/components/NavigationChrome.tsx` | Modificado |
| `src/components/SignLanguageInterpreter.tsx` | Modificado |
| `src/components/checkout/AccessibleWrittenCheckout.tsx` | Modificado |
| `src/index.css` | Modificado |
| `src/utils/accessibilitySettings.test.ts` | Nuevo |
| `src/utils/accessibilitySettings.ts` | Nuevo |
| `src/utils/mercadoPagoReturn.test.ts` | Modificado |
| `src/utils/mercadoPagoReturn.ts` | Modificado |

Total reportado por `git diff --stat main...HEAD`: 20 archivos, 637 inserciones y 71 eliminaciones.

## 2. Verificacion actual ejecutada ahora

| Verificacion | Resultado |
|---|---|
| `npm run lint` | Aprobado. `tsc --noEmit`, codigo de salida 0. |
| `npm test` | 59 pruebas totales, 59 aprobadas, 0 fallidas, 0 omitidas, 0 canceladas. |
| `npm run build` | Aprobado. Vite genero el build de produccion. Advertencia: el chunk principal `index-BXGUeHC6.js` mide 800,97 kB y supera el umbral de 500 kB. |
| `GET /api/health` | Ejecutado contra `http://localhost:4000/api/health`: HTTP 200; cuerpo `{"status":"ok","database":"connected"}`. |
| Smoke/API adicional | No se ejecuto una bateria HTTP adicional en esta revision final. |

Pruebas nuevas o de regresion relevantes confirmadas por `npm test`:

- `revokes the deleted customer's sessions in the same deletion flow`
- `does not revoke sessions when the target is not a customer`
- `revokes sessions by the stored userId using a bound parameter`
- `revokes fallback sessions only for the deleted customer`
- `does not create a fallback administrator without explicit credentials`
- `provides an accessible off option that disables optical flashes`
- `enables optical flashes for each visible intensity`
- `font scale remains within the supported 100%-200% range`
- `font scale rounds to the nearest five-percent step`
- `non-finite font scale returns the accessible default`
- `treats null Mercado Pago callback values as missing`
- `reads a valid payment id and falls back to legacy callback parameters`
- `rejects malformed payment ids and oversized external references`

## 3. Base de datos local

La verificacion obtuvo 8 tablas locales, no las 9 requeridas:

`mercadopago_pending_orders`, `products`, `sales_order_items`, `sales_orders`, `simulated_payment_transactions`, `simulated_payment_wallets`, `user_sessions`, `users`.

`password_reset_tokens`: no existe en la base local.

Comprobaciones de datos de prueba:

| Elemento | Resultado |
|---|---|
| Cuentas coincidentes con patrones de prueba | 0 |
| Administradores de prueba | 0 |
| Sesiones coincidentes con patrones de prueba | 0 |
| Productos de prueba | 0 |
| Imagenes o videos LSC de prueba | 0 |
| IDs de pedidos coincidentes con patrones de prueba | 0 |
| Pedidos pendientes de Mercado Pago con IDs de prueba | 0 |
| Hallazgo puntual en detalles de pedidos | Una fila coincidió con el texto genérico `test/prueba`, pero su identificador no contenía esos patrones y no pudo atribuirse como pedido de prueba con evidencia exacta. |

Por separado, no se encontró ninguna cuenta de administrador de prueba ni cuentas coincidentes con patrones de prueba. No se hizo ninguna modificacion o limpieza de datos en esta revision.

## 4. Hallazgos

| ID | Estado actual | Archivos corregidos | Commits | Prueba o evidencia |
|---|---|---|---|---|
| H-01 | Corregido | `server/fallbackStore.ts`, `server/auth.ts` | `48a935a` | `does not create a fallback administrator without explicit credentials`; suite actual 59/59. |
| H-02 | Corregido | `src/components/AccessibilityCenterView.tsx`, `src/utils/accessibilitySettings.ts`, `src/App.tsx` | `c1c30ff` | Dos pruebas nuevas cubren la opcion `off` y los niveles visibles. Evidencia manual previa: “Apagado”, aviso escrito y restauracion a “Estandar”. No se repitió el navegador en esta revision actual. |
| H-03 | Corregido | `src/App.tsx`, `src/index.css`, `src/components/FloatingAccessibilityWidget.tsx`, `src/components/SignLanguageInterpreter.tsx`, `src/components/NavigationChrome.tsx` | `07922bb` | Verificacion previa registrada en el navegador. La revision actual no reejecuto navegador. |
| H-04 | Pendiente | `package.json`, `package-lock.json`; no hubo cambios de version ni commits | Sin commit | `npm audit` y `npm audit --omit=dev`: 5 vulnerabilidades totales: 2 altas, 2 moderadas, 1 baja. 0 paquetes cambiaron de version. |
| H-05 | Corregido | `server/auth.ts`, `server/accountDeletion.ts`, `server/mysqlSessionStore.ts`, `server/session.ts` | `4b9bdee` | Cuatro pruebas de `accountDeletion.test.ts`; no se ejecuto una baja HTTP real contra MySQL en esta revision. |
| H-06 nuevo | Pendiente — brecha de esquema local | `database/schema.sql` declara la tabla; base local no la contiene | Sin commit | Consulta actual de `information_schema`: 8 tablas totales y `password_reset_tokens=false`. |

### H-03 al 200 %

Cambio realizado:

- El encabezado de navegación se ajusta y permite envoltura.
- El centro de accesibilidad usa ancho completo y elimina desbordes.
- Las rejillas pasan a una columna.
- Los controles de garantía se apilan.
- Los controles flotantes de LSC, accesibilidad y carrito pasan de `position: fixed` a flujo del documento cuando `fontScale=200`.
- Las etiquetas flotales se ocultan y los botones quedan en bloques de 56 px.
- El ancho lateral y los encabezados del centro de accesibilidad usan `min-width: 0`, `overflow-wrap: anywhere` y ajuste de texto.

Anchuras registradas en la verificacion anterior:

| Ancho | Evidencia registrada |
|---|---|
| 360 px | Centro de accesibilidad al 200 %, tema claro y oscuro sin desbordamiento; ancho visible 345 px y scrollWidth 345 px. |
| 768 px | Centro de accesibilidad al 200 %, tema claro y oscuro sin desbordamiento; ancho visible 753 px y scrollWidth 753 px. |
| 1280 px | Centro de accesibilidad al 200 %, tema claro y oscuro sin desbordamiento; ancho visible 1265 px y scrollWidth 1265 px. |

Esta verificacion historica no fue reejecutada en esta revision final. Las otras vistas permanecen pendientes.

### H-04

Comandos ejecutados ahora:

- `npm audit`
- `npm audit --omit=dev`

Ambos reportaron:

| Severidad | Cantidad |
|---|---|
| Critica | 0 |
| Alta | 2 |
| Moderada | 2 |
| Baja | 1 |

Paquetes y dependencias relacionados reportados: `body-parser`, `dompurify`, `nodemailer`, `qs` y `vite`. Versiones cambiadas por esta revision: ninguna. No se ejecuto `npm audit fix`.

## 5. Casos de aceptacion

| Codigo | Estado real actual | Evidencia |
|---|---|---|
| CP-01 | Aprobado, por evidencia anterior | Registro HTTP temporal respondió 201. No se reejecutó smoke HTTP en esta revision. |
| CP-02 | Aprobado, por evidencia anterior | Segundo registro con correo existente respondió 409 y mensaje claro. |
| CP-03 | Aprobado, por evidencia anterior | Contraseña incorrecta 401; credenciales correctas 200 y cookie de sesión. |
| CP-04 | Requiere ejecucion manual | Evidencia estatica de `INACTIVITY_LIMIT_MS` y `SESSION_DURATION_MS` a 10 minutos; no se esperó la sesión real 10 minutos. |
| CP-05 | Requiere ejecucion manual | Falta SMTP real y la tabla local `password_reset_tokens` no existe. |
| CP-06 | Requiere ejecucion manual | Evidencia anterior parcial por API `GET /api/products`; falta búsqueda visual y filtro por categoría. |
| CP-07 | Requiere ejecucion manual | Evidencia anterior parcial por API de detalle; falta inspeccion visual de todos los campos. |
| CP-08 | Requiere ejecucion manual | El panel LSC no fue recorrido ni probado con persona usuaria. |
| CP-09 | Requiere ejecucion manual | Existen pruebas unitarias de `off`, `soft`, `standard` e `intense`; falta la prueba visual de destello y aviso. |
| CP-10 | Aprobado solo para centro de accesibilidad | Evidencia previa a 200 % en 360, 768 y 1280 px, tema claro/oscuro. Otras vistas siguen pendientes. |
| CP-11 | Aprobado, por evidencia anterior | `POST /api/payments/simulated/charge` respondió 409 ante cantidad superior al inventario. |
| CP-12 | Requiere ejecucion manual | Falta compra sandbox aprobada end-to-end con pedido e inventario. |
| CP-13 | Requiere ejecucion manual | Falta probar pago rechazado/pendiente y comprobacion de carrito/pedido. |
| CP-14 | Aprobado, por evidencia anterior | Sin sesión 401 y cliente 403 en `GET /api/auth/users`. |
| CP-15 | Requiere ejecucion manual | Falta enviar consultas reales al chat escrito y validar respuestas/fallback. |
| CP-16 | Requiere ejecucion manual | Falta recorrido completo con teclado sin ratón. |

## 6. Cambios de comportamiento para el documento tecnico

- Se eliminó el aprovisionamiento automático de un administrador fallback con credencial fija. Solo se permite si existe configuración explícita.
- Se agregó la opción de intensidad `Apagado` y los niveles `Suave`, `Estándar` e `Intenso`.
- Al elegir `Apagado`, el aviso escrito cambia a “Destellos lumínicos desactivados”.
- Al elegir otro nivel, el aviso cambia a “Intensidad de destello óptico fijada en: <nivel>”.
- El valor por defecto de destellos es `standard` y `opticalFlashes=true`.
- El tamaño de texto soportado se mantiene de 100 % a 200 %, con pasos de ajuste de 5 %. Un valor no finito vuelve al valor accesible por defecto.
- Al cancelar o recibir una devolución incompleta de Mercado Pago, el sistema conserva el carrito y no crea un pedido confirmado.
- Mensaje actual para confirmación incompleta: “No se recibió una confirmación válida del pago. No se registró el pedido y tus productos siguen en el carrito. Si ves un cobro, no vuelvas a pagar y contacta soporte.”
- Mensaje para pago aprobado con datos insuficientes: “Mercado Pago indicó un pago aprobado, pero faltan datos para verificarlo. No vuelvas a pagar; revisa tu actividad de Mercado Pago y contacta soporte. Tu pedido no se registró y tus productos siguen en el carrito.”
- Para pago pendiente: “El pago quedó pendiente y aún no se registró el pedido. Tus productos siguen en el carrito.”
- Al eliminar una cuenta cliente, la sesión persistida en MySQL y las sesiones fallback se revocan en el mismo flujo. Si falla la revocación, la baja no se confirma.
- Al 200 % se apilan los controles del centro de accesibilidad y los elementos flotantes pasan al flujo del documento para no cubrir contenido.
- Se conservan sin cambios las limitaciones conocidas: sin subtitulos LSC, sin aviso previo por inactividad, sin límite de intentos de login y sin cabeceras HTTP de seguridad centralizadas.

## 7. Ejecucion manual exacta requerida

1. Ejecutar `npm audit fix --dry-run` o `npm audit fix --dry-run --omit=dev` y decidir qué versiones actualizar; no actualizar hasta aprobarse.
2. Autorizar y preparar la migración local para crear `password_reset_tokens`; después ejecutar el esquema/migración correspondiente.
3. CP-04: iniciar sesión, dejarla sin actividad 10 minutos, ejecutar una acción protegida o recargar y comprobar el cierre sin aviso previo.
4. CP-05: configurar SMTP real de prueba, solicitar restablecimiento, recibir correo, usar el enlace una vez, reutilizarlo y comprobar su rechazo.
5. CP-06: probar búsqueda por texto y combinación con categoría en el catálogo; capturar resultados y estado vacío.
6. CP-07: abrir detalle de varios productos y verificar descripción, características, precio, disponibilidad, garantía y envío.
7. CP-08: reproducir, minimizar y mover el panel LSC; probar atajos; abrir producto sin video y comprobar texto escrito.
8. CP-09: en el centro de accesibilidad elegir `Suave`, `Estándar`, `Intenso` y `Apagado`; agregar al carrito y comprobar destello y aviso escrito.
9. CP-10: repetir tema claro/oscuro y texto al 200 % en catálogo, detalle, carrito y checkout a 360, 768 y 1280 px.
10. CP-12: realizar una compra sandbox aprobada y confirmar pedido, descuento de inventario y número visible.
11. CP-13: realizar una compra rechazada o pendiente y comprobar que no existe pedido nuevo y que el carrito conserva los productos.
12. CP-15: probar el chat escrito con una consulta válida y otra fuera de contexto.
13. CP-16: recorrer catálogo, detalle, carrito y checkout usando solo teclado; verificar foco visible y operabilidad.
14. Mercado Pago sandbox: probar aprobado, pendiente y rechazado con credenciales de prueba; no usar producción ni compartir credenciales.
15. Ejecutar recorridos administrativos con una cuenta autorizada: crear, editar, desactivar/reactivar productos, cambiar estados de pedido y probar exportación PDF.
16. Ejecutar revisión con lector de pantalla y una persona sorda, con consentimiento: registro, catálogo, carrito, checkout y soporte.
17. Ejecutar revisión de subtítulos/alternativas visuales del panel LSC y comprobar que no existe dependencia de audio.
18. Ejecutar Lighthouse/axe u otra auditoría de accesibilidad automatizada si se requiere declarar conformidad formal.
