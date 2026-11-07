/** Roles que distinguen el acceso de visitante, cliente autenticado y administrador. */
export type UserRole = "visitor" | "user" | "admin";

/** Secciones disponibles dentro de la navegación del panel administrativo. */
export type AdminPanelSection =
  | "inventory"
  | "orders"
  | "users"
  | "analytics";

/** Identificadores de las pantallas que puede mostrar la aplicación principal. */
export type ActiveView =
  | "welcome"
  | "catalog"
  | "register"
  | "login"
  | "forgot_password"
  | "profile"
  | "product_detail"
  | "cart"
  | "checkout"
  | "order_confirmation"
  | "order_history"
  | "admin"
  | "admin_login"
  | "accessibility"
  | "support"
  | "contact_support"
  | "auth_register"
  | "auth_login"
  | "auth_forgot"
  | "auth_profile";

/** Imagen alternativa de producto usada para presentar otra vista en el catálogo. */
export interface ProductAngle {
  /** Identificador de la imagen dentro de la colección de vistas del producto. */
  id: string;
  /** Texto accesible que explica qué vista del artículo muestra la imagen. */
  label: string;
  /** Dirección de la imagen usada por el catálogo y el detalle del producto. */
  url: string;
}

/** Modelo compartido de un producto del catálogo y del inventario administrativo. */
export interface Product {
  /** Identificador único con el que la aplicación relaciona producto, carrito y pedido. */
  id: string;
  /** Código legible de inventario que se muestra en las vistas de producto y pedido. */
  code: string;
  /** Nombre comercial presentado al visitante y al cliente. */
  name: string;
  /** Familia utilizada para clasificar y filtrar el producto en el catálogo. */
  category:
    | "Laptops"
    | "Monitores"
    | "Periféricos"
    | "Audio Visual"
    | "Accesorios";
  /** Marca que identifica el producto en sus fichas y listados. */
  brand: string;
  /** Precio vigente utilizado para calcular carrito, impuestos y totales de compra. */
  price: number;
  /** Precio de referencia que permite presentar descuentos o el precio anterior. */
  originalPrice: number;
  /** Indica si las unidades disponibles permiten agregar el artículo al carrito. */
  inStock: boolean;
  /** Cantidad registrada para controlar disponibilidad y evitar pedidos sin existencias. */
  stockCount: number;
  /** Determina si el producto se ofrece en el catálogo público de la tienda. */
  active: boolean;
  /** Certificación o descripción visual asociada a la accesibilidad del producto. */
  visualCert: string;
  /** Calificación visible que resume las reseñas del producto. */
  rating: number;
  /** Cantidad de reseñas representadas por la calificación visible. */
  reviewsCount: number;
  /** Recursos gráficos principales y vistas adicionales que ilustran el producto. */
  images: {
    /** Imagen principal mostrada como representación predeterminada del artículo. */
    primary: string;
    /** Vistas alternativas usadas en la galería del catálogo o del detalle. */
    angles: ProductAngle[];
  };
  /** Descripción comercial mostrada para explicar características y uso del artículo. */
  description: string;
  /** Aviso escrito sobre señales visuales o condiciones importantes del artículo. */
  visualAlert: string;
  /** Video opcional en Lengua de Señas Colombiana relacionado con el producto. */
  lscVideoUrl?: string;
  /** Pares de etiqueta y valor usados para mostrar las especificaciones técnicas. */
  specs: { label: string; value: string }[];
  /** Lista de características inclusivas presentada en la ficha del producto. */
  inclusiveFeatures: string[];
  /** Valor contable opcional utilizado en reportes o procesos internos de inventario. */
  accountingValue?: number;
}

/** Línea de compra que asocia un producto del catálogo con su cantidad seleccionada. */
export interface CartItem {
  /** Datos del producto necesarios para representarlo y calcular el valor de la línea. */
  product: Product;
  /** Número de unidades del producto que el cliente desea comprar. */
  quantity: number;
}

/** Hito que describe una etapa del seguimiento de despacho de un pedido. */
export interface TrackingStep {
  /** Nombre visible de la etapa, como preparación, envío o entrega. */
  step: string;
  /** Fecha o referencia temporal que se presenta junto al hito de seguimiento. */
  date: string;
  /** Indica que la etapa ya fue completada en la cronología del pedido. */
  done: boolean;
  /** Marca la etapa que representa el avance actual del pedido. */
  active: boolean;
  /** Explicación accesible y textual del trabajo realizado durante esta etapa. */
  desc: string;
}

/** Pedido de cliente usado por el historial, el checkout y la administración. */
export interface SimulatedOrder {
  /** Código único con el que se identifica el pedido en la tienda y sus APIs. */
  orderId: string;
  /** Identificador opcional del cliente propietario del pedido. */
  userId?: string;
  /** Correo opcional del cliente asociado al pedido y a sus notificaciones. */
  userEmail?: string;
  /** Fecha de creación del pedido en el formato que presenta la interfaz. */
  date: string;
  /** Productos y cantidades incluidos en el pedido. */
  items: CartItem[];
  /** Suma de productos antes de impuestos y costos de envío. */
  subtotal: number;
  /** Impuesto calculado sobre el subtotal del pedido. */
  tax: number;
  /** Cargo de envío aplicado al pedido; puede ser cero para envío gratuito. */
  shipping: number;
  /** Importe final que debe coincidir con el desglose de pago. */
  total: number;
  /** Estado operativo empleado por el historial del cliente y el panel administrativo. */
  status:
    | "preparacion"
    | "despachado"
    | "enviado"
    | "entregado"
    | "pendiente"
    | "confirmado"
    | "en_camino";
  /** Medio escrito elegido para coordinar notificaciones y entrega accesible. */
  shippingChannel: "sms_visual" | "email_escrito" | "dashboard";
  /** Dirección de entrega informada durante el proceso de compra. */
  shippingAddress: string;
  /** Ciudad asociada a la dirección de entrega, cuando se dispone por separado. */
  city?: string;
  /** Persona que recibirá los productos del pedido. */
  recipientName: string;
  /** Número de contacto usado para las comunicaciones de entrega acordadas. */
  contactNumber: string;
  /** Instrucciones opcionales del cliente para la entrega o el mensajero. */
  notes?: string;
  /** Confirma que el cliente aceptó el protocolo de entrega mediante comunicación visual. */
  visualCheckConfirmed: boolean;
  /** Secuencia de hitos que explica visualmente el avance de despacho del pedido. */
  trackingHistory: TrackingStep[];
  /** Comprobante opcional devuelto por la pasarela de pago integrada. */
  payment?: {
    /** Distingue el pago virtual simulado de una operación de Mercado Pago Sandbox. */
    provider: "mercadopago_simulado" | "mercadopago_sandbox";
    /** Identificador de la transacción entregado por el medio de pago. */
    paymentId: string;
    /** Correo de la cuenta que la pasarela asocia al pago. */
    accountEmail: string;
    /** Cantidad confirmada o intentada por la transacción de pago. */
    amount: number;
    /** Saldo restante opcional, disponible solamente para el monedero simulado. */
    balanceAfter?: number;
    /** Señala que el comprobante pertenece al entorno de pruebas, no a un cobro real. */
    simulated: true;
  };
}

/** Métricas agregadas de ventas para una categoría individual. */
export interface SalesAnalyticsProduct {
  /** Identificador del producto que permite relacionar la métrica con el catálogo. */
  productId: string;
  /** Código de inventario mostrado junto al producto en el reporte. */
  code: string;
  /** Nombre comercial incluido en el análisis de ventas. */
  name: string;
  /** Categoría a la que pertenece el producto analizado. */
  category: string;
  /** Total de unidades de este producto vendidas durante el período consultado. */
  unitsSold: number;
  /** Número de pedidos distintos que incluyeron el producto. */
  orders: number;
  /** Valor monetario total atribuido a las ventas del producto. */
  totalSales: number;
}

/** Resumen temporal y desgloses que presenta el tablero analítico administrativo. */
export interface SalesAnalytics {
  /** Año que se está usando como filtro principal del análisis de ventas. */
  selectedYear: number;
  /** Mes opcional seleccionado para limitar el análisis a un período mensual. */
  selectedMonth?: number;
  /** Años con datos de ventas que pueden seleccionarse desde el tablero. */
  years: number[];
  /** Importe total vendido durante el período seleccionado. */
  totalSales: number;
  /** Cantidad de pedidos registrados durante el período seleccionado. */
  totalOrders: number;
  /** Valor promedio calculado por pedido durante el período. */
  averageTicket: number;
  /** Desglose de ventas, unidades y pedidos agrupados por categoría. */
  categories: {
    /** Nombre de la categoría agregada en este renglón del reporte. */
    category: string;
    /** Importe total de ventas atribuido a la categoría. */
    totalSales: number;
    /** Unidades vendidas de todos los productos de la categoría. */
    unitsSold: number;
    /** Pedidos que contenían al menos un producto de la categoría. */
    orders: number;
  }[];
  /** Productos destacados por volumen de unidades vendidas. */
  topProducts: SalesAnalyticsProduct[];
  /** Productos destacados por el importe total de ventas generado. */
  topRevenueProducts: SalesAnalyticsProduct[];
  /** Serie de ventas y pedidos agrupada por mes del año seleccionado. */
  monthlySales: {
    /** Número del mes calendario representado, del 1 al 12. */
    month: number;
    /** Importe de ventas registrado en ese mes. */
    totalSales: number;
    /** Pedidos registrados en ese mes. */
    orders: number;
  }[];
  /** Serie histórica de ventas y pedidos agrupada por año. */
  annualSales: {
    /** Año calendario representado en esta fila de la serie histórica. */
    year: number;
    /** Importe de ventas agregado para ese año. */
    totalSales: number;
    /** Pedidos agregados para ese año. */
    orders: number;
  }[];
}

/** Preferencias visuales que personalizan el Centro de Accesibilidad de la tienda. */
export interface AccessibilitySettings {
  /** Paleta general de contraste elegida para las pantallas de la aplicación. */
  contrastMode: "dark_deep" | "high_contrast" | "light_mode";
  /** Escala tipográfica aplicada para facilitar la lectura de la interfaz. */
  fontSize: number;
  /** Indica si las animaciones deben reducirse para evitar movimiento innecesario. */
  reduceMotion: boolean;
  /** Permite habilitar o deshabilitar señales luminosas de notificación. */
  opticalFlashes: boolean;
  /** Controla la disponibilidad de subtítulos y mensajes visuales en la interfaz. */
  visualCaptions: boolean;
  /** Opción heredada de alto contraste para compatibilidad con preferencias previas. */
  highContrast?: boolean;
  /** Intensidad opcional de las alertas luminosas configuradas por el usuario. */
  flashIntensity?: "off" | "soft" | "standard" | "intense";
}

/** Perfil público de una cuenta usada en autenticación, permisos y administración. */
export interface UserAccount {
  /** Identificador estable de la cuenta usado para asociar pedidos y permisos. */
  id: string;
  /** Nombre que la interfaz muestra en el perfil, las notificaciones y los pedidos. */
  name: string;
  /** Correo usado para identificar la cuenta e intercambiar comunicaciones escritas. */
  email: string;
  /** Rol que limita las vistas y operaciones disponibles para la cuenta. */
  role: UserRole;
  /** Número de contacto guardado en el perfil del cliente. */
  phone: string;
  /** Canal preferido para comunicaciones visuales o escritas de la tienda. */
  preferredChannel: "sms_visual" | "email_escrito" | "portal";
  /** Indica si la cuenta está habilitada para acceder al servicio. */
  active: boolean;
  /** Fecha de registro presentada en el perfil o en el listado administrativo. */
  registeredDate: string;
  /** Número acumulado de pedidos atribuidos a esta cuenta. */
  totalOrdersCount: number;
}

/** Caso de soporte que puede iniciar un cliente autenticado o un visitante. */
export interface SupportTicket {
  /** Identificador único del caso dentro del centro de soporte. */
  id: string;
  /** Fecha en que la solicitud fue recibida por la tienda. */
  date: string;
  /** Asunto breve utilizado para resumir la solicitud en listados y notificaciones. */
  subject: string;
  /** Tipo de consulta que facilita clasificar y asignar el caso. */
  category: string;
  /** Descripción enviada por la persona que solicita asistencia. */
  message: string;
  /** Medio mediante el que se recibió o se está atendiendo el caso. */
  channel: string;
  /** Etapa actual del tratamiento de la solicitud por parte del equipo de soporte. */
  status: "abierto" | "en_revision" | "resuelto";
  /** Indica si la solicitud incluye un archivo adjunto. */
  hasAttachment?: boolean;
  /** Respuesta escrita opcional enviada por el agente al solicitante. */
  response?: string;
  /** Nombre de la persona que creó la solicitud, cuando se conoce. */
  userName?: string;
  /** Correo al que se puede enviar una respuesta escrita. */
  userEmail?: string;
  /** Identificador de sesión que permite asociar solicitudes de visitantes. */
  guestSessionId?: string;
  /** Estado visual que informa si el agente está redactando una respuesta. */
  agentTyping?: boolean;
  /** Mensajes que forman la conversación vinculada con el caso de soporte. */
  conversation?: ChatMessage[];
}

/** Mensaje individual dentro de una conversación del centro de soporte. */
export interface ChatMessage {
  /** Identificador único que permite ordenar y actualizar el mensaje. */
  id: string;
  /** Origen del mensaje: cliente, agente de soporte o sistema. */
  sender: "user" | "agent" | "system";
  /** Nombre que se muestra junto al contenido del mensaje. */
  senderName: string;
  /** Texto de la comunicación escrita intercambiada por las partes. */
  text: string;
  /** Fecha y hora del mensaje usadas para ordenar la conversación. */
  timestamp: string;
  /** Indica si el destinatario ya consultó el mensaje. */
  isRead: boolean;
}

/** Entrada breve de glosario usada para explicar conceptos tecnológicos. */
export interface GlossaryTerm {
  /** Identificador único del término para su selección o búsqueda. */
  id: string;
  /** Palabra o expresión que se define en el glosario. */
  term: string;
  /** Tema usado para agrupar términos relacionados. */
  category: string;
  /** Explicación textual del significado del término. */
  definition: string;
}

/** Término del glosario accesible con apoyo de explicación e iconografía visual. */
export interface TechGlossaryItem {
  /** Identificador que permite enlazar el elemento con su vista o selección. */
  id: string;
  /** Concepto tecnológico que la aplicación presenta al usuario. */
  term: string;
  /** Etiqueta corta utilizada para clasificar o buscar el concepto. */
  tag: string;
  /** Definición textual que explica el concepto en lenguaje directo. */
  definition: string;
  /** Explicación complementaria que facilita su comprensión visual. */
  visualExplanation: string;
  /** Nombre del icono que ilustra el concepto dentro del glosario. */
  iconName: string;
}

/** Solicitud de un producto que todavía no está disponible en el catálogo. */
export interface CustomProductRequest {
  /** Identificador único para dar seguimiento a la solicitud personalizada. */
  id: string;
  /** Nombre del producto que la persona quisiera encontrar en la tienda. */
  productName: string;
  /** Categoría sugerida para clasificar la petición. */
  category: string;
  /** Características, requisitos o contexto descritos por el solicitante. */
  details: string;
  /** Medio de contacto escrito facilitado para responder la solicitud. */
  contactInfo: string;
  /** Fecha de recepción de la petición. */
  date: string;
  /** Rol de quien envió la solicitud, útil para distinguir cuenta y visitante. */
  requesterRole: UserRole;
  /** Etapa de evaluación o disponibilidad de la petición. */
  status: "recibida" | "en_evaluacion" | "disponible";
}

/** Sugerencia o solicitud de mejora enviada por una cuenta de usuario. */
export interface UserSuggestion {
  /** Identificador único de la sugerencia para consultar su seguimiento. */
  id: string;
  /** Identificador de la cuenta propietaria de la sugerencia. */
  userId: string;
  /** Nombre del usuario que se muestra al equipo administrativo. */
  userName: string;
  /** Correo asociado a la cuenta para enviar una respuesta escrita. */
  userEmail: string;
  /** Área a la que pertenece la sugerencia o solicitud. */
  type: "pedido_especial" | "sugerencia_tienda" | "accesibilidad";
  /** Título breve que permite identificar la petición en el buzón. */
  subject: string;
  /** Descripción detallada enviada por la persona usuaria. */
  message: string;
  /** Fecha en que se registró la sugerencia. */
  date: string;
  /** Estado actual de revisión y respuesta de la sugerencia. */
  status: "recibido" | "en_proceso" | "respondido";
  /** Respuesta opcional preparada por el equipo de la tienda. */
  response?: string;
}

/** Notificación visual global que informa un resultado o acción de la tienda. */
export interface GlobalToastNotification {
  /** Identificador único para actualizar o cerrar esta notificación concreta. */
  id: string;
  /** Categoría visual usada para asignar estilo e icono a la notificación. */
  type:
    | "cart_add"
    | "cart_remove"
    | "order_success"
    | "guest_block"
    | "product_request"
    | "suggestion_sent"
    | "info";
  /** Encabezado breve de la notificación que se anuncia visualmente. */
  title: string;
  /** Descripción de la acción completada o de la información presentada. */
  message: string;
  /** Producto opcional relacionado con la notificación del carrito o catálogo. */
  product?: Product;
  /** Pedido opcional asociado a una notificación de compra. */
  orderId?: string;
  /** Texto opcional del botón de acción contextual de la notificación. */
  actionLabel?: string;
  /** Acción opcional que ejecuta la interfaz cuando se activa el botón contextual. */
  onAction?: () => void;
}
