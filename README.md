<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/66d79206-470c-41ef-aab9-fc2c4600636c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend local (Express + MySQL)

El backend se ejecuta aparte de Vite en el puerto `4000`. Para prepararlo:

1. Crea una base de datos MySQL local y configura `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `SESSION_SECRET` en `.env` (puedes copiar `.env.example` como punto de partida). Genera el secreto con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. Ejecuta el contenido de `database/schema.sql` en MySQL Workbench o en tu cliente MySQL. Esto crea las tablas `products`, `users`, `user_sessions`, `password_reset_tokens`, pedidos (`sales_orders`, `sales_order_items`) y checkouts pendientes de Mercado Pago (`mercadopago_pending_orders`). La API agrega automáticamente las nuevas columnas de cuenta, estado, detalles y `products.lsc_video_url` si encuentra una tabla antigua.
3. Con el esquema creado, ejecuta `npm run db:seed` para cargar en MySQL los productos iniciales del proyecto. El comando no sobrescribe una tabla `products` que ya tenga registros.
4. Crea la primera cuenta administradora con `npm run auth:create-admin`. El comando solicita nombre, correo y contraseña de forma interactiva; la contraseña no se muestra al escribirla. Solo permite crearla si aún no existe otra cuenta administradora.
5. Inicia la API con `npm run dev:api` (también se admite `npm run dev:server`); para comprobar la conexión abre `http://localhost:4000/api/health`.
6. Inicia el frontend en otra terminal con `npm run dev`. Vite reenvía las rutas `/api` al backend.

La ruta de salud responde `200` cuando MySQL está conectado y `503` si la conexión falla. No incluyas credenciales reales en el repositorio.

El catálogo de la tienda consulta `GET /api/products`. Las altas y ediciones desde la pestaña Gestión de Productos se guardan en MySQL; el identificador del producto lo genera el servidor. Al crear un producto, el administrador puede indicar una URL de imagen o cargar un archivo JPEG, PNG, WebP o GIF de hasta 5 MB; las imágenes cargadas se guardan en `data/product-images/` y se sirven desde `/api/products/images/`. En despliegues, este directorio debe estar en almacenamiento persistente. La baja es lógica y reversible: `DELETE /api/products/:id` marca el producto como inactivo sin borrar su registro, y se puede restaurar con `PATCH /api/products/:id/status` enviando `{"active":true}`. La gestión de usuarios también consulta MySQL (`GET /api/auth/users`); bloquear/desbloquear (`PATCH /api/auth/users/:id/status`) y eliminar (`DELETE /api/auth/users/:id`) requiere una sesión activa de administrador. Solo pueden eliminarse cuentas de cliente; las cuentas de administrador están protegidas. Las escrituras administrativas validan la sesión y el rol en el backend.

### Checkout Pro de Mercado Pago (solo sandbox)

El botón **Pagar con Mercado Pago** redirige al checkout oficial de pruebas de Mercado Pago mediante Checkout Pro. El backend crea la preferencia con precios, IVA e inventario calculados desde MySQL; al regresar, consulta el pago directamente a Mercado Pago y solo registra el pedido y descuenta existencias si el pago está aprobado, coincide con la referencia, preferencia e importe, usa COP y `live_mode` es `false`. Los parámetros de retorno del navegador no se consideran prueba suficiente de pago. El checkout requiere iniciar sesión. No se debe presentar ni configurar como pago de producción: el backend exige `MP_ENVIRONMENT=sandbox` y solo entrega una URL de checkout sandbox. Copia el Access Token desde el entorno **Prueba** de Mercado Pago Developers. El prefijo por sí solo no identifica el entorno: en Colombia un token de prueba también puede empezar con `APP_USR`. Consulta la [documentación oficial de credenciales](https://www.mercadopago.com.co/developers/es/docs/your-integrations/credentials) y nunca uses credenciales de producción en este modo.

Mercado Pago puede devolver URLs sandbox regionales como `https://sandbox.mercadopago.com.co/...`; la validación del checkout acepta el dominio sandbox oficial con o sin el sufijo regional, y rechaza dominios ajenos.

Para probarlo:

1. En Mercado Pago Developers crea/usa una aplicación y las cuentas de prueba de vendedor y comprador. Copia el Access Token desde **Credenciales de prueba**; usa las credenciales de comprador de prueba en el checkout oficial y nunca las credenciales personales de una cuenta real.
2. En `.env`, configura `MP_ENVIRONMENT="sandbox"`, `MP_ACCESS_TOKEN` con el token de prueba del vendedor y `MP_RETURN_URL` con una URL **HTTPS pública** que apunte al frontend y termine en `/checkout`. En desarrollo local, publica el puerto de Vite (3000) mediante un túnel HTTPS. No pongas el token en variables `VITE_*`, en el navegador ni en el repositorio.
3. Inicia MySQL, la API (`npm run dev:api`) y Vite (`npm run dev`). Entra con una cuenta de cliente, agrega productos disponibles y pulsa **Pagar con Mercado Pago**. En la página oficial selecciona la opción de prueba disponible e inicia sesión con la cuenta de comprador de prueba.
4. Al volver a `/checkout`, el backend valida el pago en la API de Mercado Pago Sandbox. Solo entonces aparece la confirmación y se registra el pedido. Un pago pendiente, rechazado, de importe distinto o en modo live no genera pedido. Si el inventario cambia mientras el comprador está en el checkout, la confirmación se rechaza para no crear un pedido con stock negativo.

El backend crea `mercadopago_pending_orders` automáticamente; también está incluida en `database/schema.sql`. Si faltan credenciales o la URL HTTPS, la API informa que Checkout Pro sandbox no está configurado y no cambia a un checkout local. El antiguo simulador de billetera virtual permanece aislado en `POST /api/payments/simulated/charge` para sus pruebas existentes; ya no es el flujo del botón de checkout ni permite simular una sesión en el sitio oficial.

### Panel LSC y videos de productos

El video de bienvenida se sirve desde `public/assets/videos/welcome.mp4` y se muestra al entrar y al volver a Inicio; al terminar, el panel se minimiza y se puede reabrir desde el botón flotante. No se usa como respaldo para videos de producto. El contexto LSC es global para visitantes, clientes y administradores. Al enfocar o pasar el cursor por una tarjeta del catálogo se carga la ruta asignada al producto; al salir de la tarjeta el panel se minimiza sin reemplazar el video. El video LSC del `Ultrabook Pro 16` (código `CUD008`) se sirve desde `public/assets/videos/ultrabook_pro_16.mp4`, el del `Monitor Curvo 34" UltraWide QHD Lumínico` (código `CUD009`) desde `public/assets/videos/monitor.mp4`, el del `Teclado Mecánico Háptico Silent Touch` (código `CUD010`) desde `public/assets/videos/teclado_mecanico.mp4`, el de los `Auriculares de Conducción Ósea con Faro LED` (código `CUD011`) desde `public/assets/videos/auriculares.mp4`, el de la `Tablet Gráfica Pro 12" PaperTouch` (código `CUD012`) desde `public/assets/videos/tablet.mp4`, el del `Hub Thunderbolt 4 con Matriz LED de Diagnóstico` (código `CUD013`) desde `public/assets/videos/hub.mp4`, el del `Ratón Ergonómico Háptico con Tira Lumínica` (código `CUD014`) desde `public/assets/videos/raton.mp4`, la `Baliza Estroboscópica USB para Notificaciones` (código `CUD015`) desde `public/videos/baliza.mp4`, y el `Prototipo de Teclado Braille Óptico` (código `CUD016`) desde `public/assets/videos/prototipo_teclado.mp4`. Los demás clips pueden colocarse en `public/assets/videos/lsc/`, usando como nombre el código del catálogo. Si un clip específico no existe o no carga, el panel informa que el video no está disponible, sin reproducir la bienvenida.

`GET /api/products` y `GET /api/products/:id` incluyen `lsc_video_url`; las rutas de escritura siguen requiriendo una sesión de administrador. Cuando un producto no incluye un clip o tiene guardada la ruta de bienvenida por compatibilidad histórica, la API asigna la ruta LSC correspondiente a su código, nunca el video de bienvenida. En bases existentes, la API añade la columna y rellena valores vacíos de forma adaptativa; también actualiza las rutas específicas de los productos `CUD008`, `CUD009`, `CUD010`, `CUD011`, `CUD012`, `CUD013`, `CUD014`, `CUD015` y `CUD016`. La semilla guarda una ruta específica por código de producto y, como antes, solo inserta cuando la tabla está vacía.

El inicio de sesión usa el mismo formulario para cuentas de cliente y administración; el backend obtiene los privilegios del rol asociado al correo almacenado y no acepta un rol solicitado por el cliente. El registro crea siempre una cuenta de cliente; el rol administrador solo se asigna desde el comando local. Las contraseñas tienen entre 8 y 128 caracteres, se almacenan como hash `scrypt` y nunca se devuelven a la interfaz. Las sesiones usan una cookie `HttpOnly` y se cierran tras 10 minutos de inactividad. Las cuentas de demostración anteriores son datos locales y no se migran a MySQL.

Para habilitar el restablecimiento de contraseña, configura `APP_URL` con la URL HTTPS pública del frontend (se permite HTTP en `localhost`) y `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM` en `.env`. Los enlaces son aleatorios, de un solo uso y vencen a los 30 minutos; se limitan las solicitudes por IP. La API devuelve un mensaje genérico para no revelar si una dirección tiene cuenta.

Rutas de autenticación: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/password-reset/request`, `POST /api/auth/password-reset/confirm`, `GET /api/auth/me` y `POST /api/auth/logout`. Rutas de usuarios: `GET /api/auth/users`, `PATCH /api/auth/users/:id/status` y `DELETE /api/auth/users/:id` para administración de cuentas. Rutas de productos: `GET /api/products` y `GET /api/products/:id` para lectura; `POST /api/products/images` carga imágenes para administradores autenticados; `POST /api/products`, `PUT /api/products/:id`, `PATCH /api/products/:id/status` y `DELETE /api/products/:id` para escritura administrativa. `POST /api/payments/simulated/charge` valida y procesa pagos únicamente con las cuentas virtuales demo descritas arriba, y registra el pedido de forma idempotente en la misma transacción. `GET /api/orders/mine` permite a un usuario autenticado consultar únicamente sus pedidos; `GET /api/orders` y `PATCH /api/orders/:orderId/status` requieren sesión de administrador. `GET /api/analytics/sales?year=2026` devuelve totales por año/mes, categorías, ticket promedio y cinco productos más vendidos, y requiere sesión de administrador. El historial personal muestra número, artículos, estado y comprobante simulado desde MySQL para consultarlo incluso en otro dispositivo. Los pedidos locales/de demostración anteriores no se convierten automáticamente en pedidos de cuenta: solo se muestran y sincronizan los nuevos pedidos registrados en el backend.
