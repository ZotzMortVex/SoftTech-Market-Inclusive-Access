import { Product, SimulatedOrder, TechGlossaryItem, SupportTicket, GlossaryTerm } from '../types';
import { getProductLscVideoUrl } from '../utils/lscVideos';

const INITIAL_PRODUCT_DATA: Omit<Product, 'lscVideoUrl'>[] = [
  {
    id: 'prod-001',
    code: 'CUD008',
    name: 'Ultrabook Pro 16" OLED Visual Edition',
    category: 'Laptops',
    brand: 'SoftTech Systems',
    price: 7499000,
    originalPrice: 8690000,
    inStock: true,
    stockCount: 14,
    active: true,
    visualCert: 'Certificación WCAG 2.1 AAA - Testigo LED Bisel',
    rating: 4.9,
    reviewsCount: 38,
    images: {
      primary: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Frontal', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-2', label: 'Lateral Puertos', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-3', label: 'Teclado & Bisel LED', url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-4', label: 'Perfil Cerrado', url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80' },
      ]
    },
    description: 'Portátil de alto rendimiento optimizado para accesibilidad sensorial. Incorpora bisel lumínico perimetral configurable para notificaciones de sistema, pantalla OLED de altísimo contraste de 3.2K y teclado con respuesta táctil mecánica optimizada.',
    visualAlert: 'LED Perimetral Notificador | Modo Alto Contraste Nativo',
    specs: [
      { label: 'Procesador', value: 'Intel Core Ultra 9 185H (16 núcleos)' },
      { label: 'Memoria RAM', value: '32 GB LPDDR5X 7467 MHz' },
      { label: 'Almacenamiento', value: '1 TB SSD M.2 NVMe PCIe 4.0' },
      { label: 'Pantalla', value: '16" OLED 3200x2000 120Hz 500 nits HDR' },
      { label: 'Alertas Visuales', value: 'Barra LED sincronizada en marco superior' },
      { label: 'Conectividad', value: '2x Thunderbolt 4, HDMI 2.1, Wi-Fi 7' },
      { label: 'Batería', value: '84 Wh (Hasta 14 horas de autonomía)' },
      { label: 'Peso', value: '1.68 kg con chasis de aluminio aeroespacial' }
    ],
    inclusiveFeatures: [
      'Sin dependencia de señales audibles para errores o notificaciones del SO',
      'Alertas lumínicas perimetrales con 8 patrones cromáticos configurables',
      'Teclado con relieve táctil marcado en teclas F, J, Enter y Espacio',
      'Garantía de soporte 100% por chat escrito y videollamada en lengua de señas'
    ]
  },
  {
    id: 'prod-002',
    code: 'CUD009',
    name: 'Monitor Curvo 34" UltraWide QHD Lumínico',
    category: 'Monitores',
    brand: 'VisionCraft',
    price: 2950000,
    originalPrice: 3550000,
    inStock: true,
    stockCount: 8,
    active: true,
    visualCert: 'WCAG AAA - Tira RGB Visual Sync',
    rating: 4.8,
    reviewsCount: 24,
    images: {
      primary: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Frontal Panorámica', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-2', label: 'Curvatura 1800R', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-3', label: 'Iluminación Posterior', url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-4', label: 'Puertos & Montaje', url: 'https://images.unsplash.com/photo-1586775490184-b79f0621891f?auto=format&fit=crop&w=1000&q=80' },
      ]
    },
    description: 'Monitor panorámico de 34 pulgadas con curvatura ergonómica 1800R. Incluye un sistema de halo visual posterior reflectante que proyecta destellos de color en la pared cuando recibes correos o mensajes importantes.',
    visualAlert: 'Halo Luminoso Trasero | Panel IPS 99% sRGB Calibrado',
    specs: [
      { label: 'Resolución', value: '3440 x 1440 QHD UltraWide (21:9)' },
      { label: 'Tasa de Refresco', value: '144 Hz con soporte FreeSync Premium' },
      { label: 'Luminosidad', value: '450 cd/m² con certificación HDR400' },
      { label: 'Halo Visual', value: 'Ambilight óptico para notificaciones de escritorio' }
    ],
    inclusiveFeatures: [
      'Destello ambiental de colores asignables según tipo de aplicación',
      'Modo de alto contraste con texto súper perfilado',
      'Filtro de luz azul regulable sin distorsión de color'
    ]
  },
  {
    id: 'prod-003',
    code: 'CUD010',
    name: 'Teclado Mecánico Háptico Silent Touch',
    category: 'Periféricos',
    brand: 'HapticWave',
    price: 620000,
    originalPrice: 780000,
    inStock: true,
    stockCount: 22,
    active: true,
    visualCert: 'Micro-vibración háptica sin clics audibles',
    rating: 4.9,
    reviewsCount: 52,
    images: {
      primary: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Vista Cenital', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-2', label: 'Switches Mecánicos', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-3', label: 'Iluminación Tecla a Tecla', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-4', label: 'Chasis Inclinado', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80' },
      ]
    },
    description: 'Teclado mecánico con tecnología de retroalimentación de micro-vibración en el chasis. Comunica la confirmación de pulsación y atajos mediante pulsos táctiles y destellos en el perímetro.',
    visualAlert: 'Respuesta Háptica Silenciosa + RGB Programable',
    specs: [
      { label: 'Interruptores', value: 'Switches lineales silenciosos con damping' },
      { label: 'Motor Háptico', value: '2 actuadores LRA de resonancia lineal' },
      { label: 'Conexión', value: 'USB-C trenzado / Bluetooth 5.3 / 2.4 GHz' },
      { label: 'Estructura', value: 'PBT de doble inyección con textura antideslizante' }
    ],
    inclusiveFeatures: [
      'Confirmación táctil de escritura sin necesidad de clics ruidosos',
      'Destellos luminosos en barra espaciadora durante mayúsculas o bloqueo',
      'Totalmente configurable sin software invasivo'
    ]
  },
  {
    id: 'prod-004',
    code: 'CUD011',
    name: 'Auriculares de Conducción Ósea con Faro LED',
    category: 'Audio Visual',
    brand: 'SonicVision',
    price: 510000,
    originalPrice: 630000,
    inStock: true,
    stockCount: 19,
    active: true,
    visualCert: 'Transmisión Craneal + Faro de Estado Luminoso',
    rating: 4.7,
    reviewsCount: 31,
    images: {
      primary: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Perspectiva General', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-2', label: 'Transductores Óseos', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-3', label: 'Indicador LED Lateral', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-4', label: 'Estuche de Carga', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80' },
      ]
    },
    description: 'Dispositivo ergonómico de conducción ósea para personas con restos auditivos o sensibilidad vibroacústica. Cuenta con faro LED exterior que avisa a personas alrededor cuando estás en videollamada o concentrado.',
    visualAlert: 'Testigo Luminoso de Actividad | Vibración Craneal Segura',
    specs: [
      { label: 'Tecnología', value: 'Transductores de conducción ósea PremiumPitch 2.0+' },
      { label: 'Indicador LED', value: 'Tres colores (Verde: Libre, Azul: Reunión, Rojo: Ocupado)' },
      { label: 'Autonomía', value: '10 horas continuas + 24 horas estuche' },
      { label: 'Protección', value: 'IP67 resistente a sudor y salpicaduras' }
    ],
    inclusiveFeatures: [
      'Deja los canales auditivos libres sin presión en el tímpano',
      'Señalización lumínica hacia terceros para evitar interrupciones',
      'Botones físicos grandes con relieve para control intuitivo'
    ]
  },
  {
    id: 'prod-005',
    code: 'CUD012',
    name: 'Tablet Gráfica Pro 12" PaperTouch',
    category: 'Periféricos',
    brand: 'DrawSense',
    price: 1520000,
    originalPrice: 1760000,
    inStock: true,
    stockCount: 11,
    active: true,
    visualCert: 'Textura Táctil de Papel + 8 Teclas con Marcadores Físicos',
    rating: 4.9,
    reviewsCount: 45,
    images: {
      primary: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Pantalla & Lápiz', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-2', label: 'Detalle Botones Físicos', url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-3', label: 'Ángulo de Trabajo', url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-4', label: 'Perfil Delgado', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80' },
      ]
    },
    description: 'Herramienta creativa digital con respuesta visual inmediata de cero retardo. Las 8 teclas de acceso rápido tienen iconos en relieve y retroiluminación para uso ágil en dibujo y diagramación.',
    visualAlert: 'Lápiz con retroalimentación háptica y pantalla mate',
    specs: [
      { label: 'Área Activa', value: '12 pulgadas con laminación total antirreflejo' },
      { label: 'Niveles de Presión', value: '8192 niveles con reconocimiento de inclinación 60°' },
      { label: 'Resolución', value: '5080 LPI con tasa de reporte de 300 PPS' },
      { label: 'Compatibilidad', value: 'Windows, macOS, Android, Linux' }
    ],
    inclusiveFeatures: [
      'Control 100% visual y táctil sin alertas sonoras de calibración',
      'Textura física de grano fino para máximo agarre y precisión',
      'Soporte regulable ergonómico incluido'
    ]
  },
  {
    id: 'prod-006',
    code: 'CUD013',
    name: 'Hub Thunderbolt 4 con Matriz LED de Diagnóstico',
    category: 'Accesorios',
    brand: 'SoftTech Connectivity',
    price: 860000,
    originalPrice: 1020000,
    inStock: true,
    stockCount: 16,
    active: true,
    visualCert: 'Matriz Gráfica Frontal de Flujo de Datos',
    rating: 4.8,
    reviewsCount: 19,
    images: {
      primary: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Frontal Matriz LED', url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-2', label: 'Puertos Posteriores', url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-3', label: 'Chasis de Aluminio', url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-4', label: 'Conexión a Laptop', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80' },
      ]
    },
    description: 'Estación de conexión universal con 8 puertos de alta velocidad. Su pantalla frontal de micro-LEDs muestra gráficamente qué puertos están transfiriendo datos, la velocidad de carga y el estado de la conexión sin ningún pitido de error.',
    visualAlert: 'Pantalla OLED de Estado Integrada | Potencia 96W PD',
    specs: [
      { label: 'Puertos', value: '3x Thunderbolt 4, 3x USB-A 10Gbps, 1x HDMI 2.1, 1x Ethernet 2.5G' },
      { label: 'Carga Suministrada', value: 'Hasta 96W Power Delivery hacia el equipo host' },
      { label: 'Pantalla Frontal', value: 'Display gráfico monocromático de velocidad y voltaje' },
      { label: 'Construcción', value: 'Bloque unibody de aluminio disipador pasivo' }
    ],
    inclusiveFeatures: [
      'Diagnóstico visual instantáneo de desconexión o sobretensión',
      'Sin alarmas audibles: parpadeo suave en color ámbar ante anomalías',
      'Cable de alta visibilidad con indicador luminoso de flujo'
    ]
  },
  {
    id: 'prod-007',
    code: 'CUD014',
    name: 'Ratón Ergonómico Háptico con Tira Lumínica',
    category: 'Periféricos',
    brand: 'HapticWave',
    price: 350000,
    originalPrice: 430000,
    inStock: true,
    stockCount: 18,
    active: true,
    visualCert: 'Micro-vibración háptica y banda LED programable',
    rating: 4.8,
    reviewsCount: 29,
    images: {
      primary: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Perspectiva Lateral', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80' },
        { id: 'ang-2', label: 'Base Ergonómica', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80' }
      ]
    },
    description: 'Ratón vertical ergonómico de 57 grados con motor háptico interno. Confirma los clics mediante una micro-vibración en la yema del pulgar y proyecta un tenue resplandor en la alfombrilla ante alertas de software.',
    visualAlert: 'Vibración en Pulgar + Faro Lateral RGB',
    specs: [
      { label: 'Sensor', value: 'Óptico 16000 DPI de alta precisión' },
      { label: 'Ergonomía', value: 'Ángulo vertical de 57° con reposapulgar texturizado' },
      { label: 'Conectividad', value: 'Inalámbrico 2.4G y Bluetooth Multi-Dispositivo' }
    ],
    inclusiveFeatures: [
      'Sustituye el clic mecánico ruidoso con retroalimentación háptica táctil',
      'Indicador lumínico de estado de batería en 3 colores sin tonos audibles'
    ]
  },
  {
    id: 'prod-008',
    code: 'CUD015',
    name: 'Baliza Estroboscópica USB para Notificaciones',
    category: 'Accesorios',
    brand: 'SoftTech Systems',
    price: 195000,
    originalPrice: 255000,
    inStock: false,
    stockCount: 0,
    active: true,
    visualCert: 'Faro estroboscópico de alta visibilidad para escritorio',
    rating: 4.6,
    reviewsCount: 15,
    images: {
      primary: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
      angles: [
        { id: 'ang-1', label: 'Faro Encendido', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80' }
      ]
    },
    description: 'Baliza lumínica compacta de escritorio que se conecta por USB. Proyecta pulsos de luz periférica de 360 grados para notificar timbres de puerta, mensajes de mensajería o llamadas entrantes en texto.',
    visualAlert: 'Pulsos de 360° en 5 Colores | Conexión USB Plug & Play',
    specs: [
      { label: 'Intensidad', value: 'LED difuso regulable hasta 300 lúmenes' },
      { label: 'Compatibilidad', value: 'Windows, macOS, Android TV y Linux' }
    ],
    inclusiveFeatures: [
      'Diseñado específicamente para sustituir timbres audibles de teléfono y puerta',
      'Sin ningún zumbador o altavoz en su circuito interno'
    ]
  },
  {
    id: 'prod-009',
    code: 'CUD016',
    name: 'Prototipo de Teclado Braille Óptico',
    category: 'Periféricos',
    brand: 'SoftTech Lab',
    price: 1180000,
    originalPrice: 1380000,
    inStock: true,
    stockCount: 5,
    active: false,
    visualCert: 'En fase de homologación interna - No visible en catálogo público',
    rating: 5.0,
    reviewsCount: 3,
    images: {
      primary: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      angles: []
    },
    description: 'Equipo de laboratorio experimental para transcripción háptica y óptica. Este producto se encuentra inactivo y no debe figurar en el catálogo público para visitantes y usuarios.',
    visualAlert: 'Celdas táctiles dinámicas con lectura óptica',
    specs: [
      { label: 'Estado', value: 'Inactivo / Prototipo de laboratorio' }
    ],
    inclusiveFeatures: [
      'Uso exclusivo para investigación interna'
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = INITIAL_PRODUCT_DATA.map((product) => ({
  ...product,
  lscVideoUrl: getProductLscVideoUrl(product.code),
}));

export const INITIAL_ORDERS: SimulatedOrder[] = [
  {
    orderId: '#STK-98420-VISUAL',
    userId: 'usr-001',
    userEmail: 'elena.gomez@visualaccess.com',
    date: '15 de Septiembre, 2026',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[5], quantity: 1 }
    ],
    subtotal: 8359000,
    tax: 1588210,
    shipping: 0,
    total: 9947210,
    status: 'enviado',
    shippingChannel: 'sms_visual',
    shippingAddress: 'Av. Paseo de la Reforma 412, Piso 8, Ciudad de México',
    recipientName: 'Elena Gómez Morales',
    contactNumber: '+52 55 9876 5432 (Canal SMS)',
    notes: 'Entrega accesible: Favor de no llamar por teléfono. Tocar timbre luminoso o enviar SMS de llegada.',
    visualCheckConfirmed: true,
    trackingHistory: [
      { step: 'Pedido Registrado', date: '15 Sep - 10:15 AM', done: true, active: false, desc: 'Verificación visual completada e ingreso al sistema' },
      { step: 'Control de Calidad Cero Audio', date: '15 Sep - 02:40 PM', done: true, active: false, desc: 'Inspección de testigos lumínicos y certificación WCAG 2.1 AAA' },
      { step: 'En Tránsito con Guía Satelital', date: '16 Sep - 08:30 AM', done: true, active: true, desc: 'Unidad de entrega en ruta hacia la dirección registrada' },
      { step: 'Entrega y Firma Digital', date: 'Estimada: Hoy 03:00 PM', done: false, active: false, desc: 'Recepción presencial con confirmación por SMS visual' }
    ]
  },
  {
    orderId: '#STK-77210-VISUAL',
    userId: 'usr-001',
    userEmail: 'elena.gomez@visualaccess.com',
    date: '12 de Septiembre, 2026',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 1 }
    ],
    subtotal: 2950000,
    tax: 560500,
    shipping: 0,
    total: 3510500,
    status: 'preparacion',
    shippingChannel: 'sms_visual',
    shippingAddress: 'Av. Paseo de la Reforma 412, Piso 8, Ciudad de México',
    recipientName: 'Elena Gómez Morales',
    contactNumber: '+52 55 9876 5432 (Canal SMS)',
    notes: 'Tocar timbre luminoso en recepción.',
    visualCheckConfirmed: true,
    trackingHistory: [
      { step: 'Pedido Registrado', date: '12 Sep - 11:00 AM', done: true, active: false, desc: 'Orden validada y confirmada en sistema' },
      { step: 'Preparación y Calibración Óptica', date: '12 Sep - 04:15 PM', done: false, active: true, desc: 'Ajuste de respuesta lumínica y empaque con sellos de garantía' },
      { step: 'Despacho Satelital Programado', date: 'Programado: Próximas horas', done: false, active: false, desc: 'Asignación de mensajería con protocolo sin timbre sonoro' },
      { step: 'Entrega Presencial Accesible', date: 'Estimada: Próximo día hábil', done: false, active: false, desc: 'Confirmación presencial con alerta SMS' }
    ]
  },
  {
    orderId: '#STK-44119-VISUAL',
    userId: 'usr-002',
    userEmail: 'carlos.soto@tecnologiasorda.org',
    date: '02 de Septiembre, 2026',
    items: [
      { product: INITIAL_PRODUCTS[2], quantity: 1 }
    ],
    subtotal: 620000,
    tax: 117800,
    shipping: 0,
    total: 737800,
    status: 'entregado',
    shippingChannel: 'email_escrito',
    shippingAddress: 'Calle Durango 205, Depto 4B, Roma Norte, CDMX',
    recipientName: 'Carlos Soto Villagrán',
    contactNumber: 'c.soto@tecnologiasorda.org',
    visualCheckConfirmed: true,
    trackingHistory: [
      { step: 'Pedido Registrado', date: '02 Sep - 09:00 AM', done: true, active: false, desc: 'Orden confirmada en el portal' },
      { step: 'Inspección Óptica', date: '02 Sep - 11:30 AM', done: true, active: false, desc: 'Verificación de actuadores táctiles' },
      { step: 'Despachado', date: '02 Sep - 03:00 PM', done: true, active: false, desc: 'Mensajería accesible en camino' },
      { step: 'Entregado con Éxito', date: '03 Sep - 11:45 AM', done: true, active: false, desc: 'Recibido en mano con acuse escrito' }
    ]
  }
];

export const TECH_GLOSSARY: TechGlossaryItem[] = [
  {
    id: 'glo-1',
    term: 'Unidad de Almacenamiento SSD NVMe',
    tag: 'Rendimiento & Almacenamiento',
    definition: 'Memoria sólida ultrarrápida sin partes mecánicas móviles. Multiplica por 10 la velocidad de apertura de programas.',
    visualExplanation: 'Diagrama visual: La información fluye directamente a través de pistas electrónicas doradas, permitiendo que tu sistema arranque en menos de 4 segundos.',
    iconName: 'hard_drive'
  },
  {
    id: 'glo-2',
    term: 'Pantalla OLED con Contraste Infinito',
    tag: 'Visión & Ergonomía',
    definition: 'Cada píxel emite su propia luz y los negros son píxeles completamente apagados. Permite una nitidez extrema para lectura prolongada.',
    visualExplanation: 'Diagrama óptico: Relación de contraste 1,000,000:1. El texto blanco sobre fondo oscuro no genera halos borrosos, descansando tu vista al leer señas o texto.',
    iconName: 'monitor'
  },
  {
    id: 'glo-3',
    term: 'Memoria RAM DDR5 de Alta Frecuencia',
    tag: 'Multitarea & Fluidez',
    definition: 'Canal de memoria de última generación para procesar múltiples ventanas de video, documentos y chats simultáneamente sin pausas.',
    visualExplanation: 'Diagrama de flujo: 2 canales independientes de 32 bits que transmiten hasta 7467 millones de transferencias por segundo en paralelo.',
    iconName: 'memory'
  },
  {
    id: 'glo-4',
    term: 'Alertas Hápticas & Testigo Lumínico',
    tag: 'Accesibilidad Sensorial',
    definition: 'Sistemas que convierten tonos o pitidos audibles en pulsos mecánicos tangibles y destellos cromáticos en el marco o teclado.',
    visualExplanation: 'Diagrama sensorial: Un pulso electromagnético vibra sutilmente bajo tus dedos mientras un LED en el bisel pulsa en verde suave ante un mensaje nuevo.',
    iconName: 'vibration'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-8821',
    date: '14 de Septiembre, 2026',
    subject: 'Consulta sobre compatibilidad de alertas lumínicas en Windows 11',
    category: 'Asistencia Técnica',
    message: 'Hola equipo, quisiera confirmar si el bisel LED del Ultrabook Pro se sincroniza automáticamente con las alertas visuales de Teams sin instalar software adicional.',
    channel: 'Formulario Escrito (Portal)',
    status: 'resuelto',
    response: 'Confirmado: El bisel LED responde a la API de accesibilidad de Windows 11 sin software extra.'
  },
  {
    id: 'TCK-9043',
    date: '16 de Septiembre, 2026',
    subject: 'Solicitud de factura electrónica con acuse escrito para pedido #STK-98420',
    category: 'Facturación & Pedidos',
    message: 'Favor de remitir el comprobante fiscal PDF y XML al correo registrado. No requiero llamada telefónica de seguimiento.',
    channel: 'SMS Visual',
    status: 'en_revision',
    response: 'En proceso de emisión por el departamento administrativo. Se remitirá a tu correo registrado.'
  }
];

export const initialProducts = INITIAL_PRODUCTS;
export const initialMockOrders = INITIAL_ORDERS;
export const initialTickets = INITIAL_TICKETS;

export const initialGlossary: GlossaryTerm[] = [
  {
    id: 'glo-1',
    term: 'Norma WCAG 2.1 AAA',
    category: 'Estándar',
    definition: 'Nivel más estricto de accesibilidad web mundial. Exige ratios de contraste mínimos de 7:1 en texto y garantiza que toda la información acústica tenga un equivalente visual autónomo.'
  },
  {
    id: 'glo-2',
    term: 'Garantía Cero Audio',
    category: 'Filosofía',
    definition: 'Arquitectura de interacción donde ninguna funcionalidad, compra, autenticación o despacho requiere altavoces, tonos ni llamadas telefónicas de voz.'
  },
  {
    id: 'glo-3',
    term: 'Testigo Lumínico & Destello Óptico',
    category: 'Hardware',
    definition: 'Sistema de señalización perimetral mediante LEDs de color y pulsos estroboscópicos de marco que sustituyen campanas y timbres audibles.'
  },
  {
    id: 'glo-4',
    term: 'Despacho con Guía SMS Visual',
    category: 'Logística',
    definition: 'Servicio de entrega donde el mensajero se comunica mediante mensajes de texto directos o timbres con luz estroboscópica al arribar a la puerta.'
  },
  {
    id: 'glo-5',
    term: 'Feedback Háptico Táctil',
    category: 'Hardware',
    definition: 'Respuesta física mediante micro-vibraciones mecánicas localizadas en teclados y ratones para confirmar acciones del usuario sin pitidos.'
  }
];
