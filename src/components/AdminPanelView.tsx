import React, { useState, useMemo, useEffect } from 'react';
import { 
  Product, 
  SimulatedOrder, 
  UserAccount, 
  UserRole, 
  ActiveView,
  AdminPanelSection,
} from '../types';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Eye, 
  X, 
  ArrowRight,
  Edit3,
  AlertTriangle,
  Check,
  Copy,
  MapPin,
  Calendar,
  Sparkles,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  Info,
  DollarSign,
  ShoppingBag,
  Trash2,
  BarChart3
} from 'lucide-react';
import { VisualNoticeModal } from './VisualNoticeModal';
import { ORDER_STATUSES, StandardOrderStatus } from './OrderHistoryView';
import { formatCOP } from '../utils/formatters';
import { uploadProductImage } from '../utils/productApi';
import { SalesAnalyticsDashboard } from './admin/SalesAnalyticsDashboard';
import { DataTable, type DataTableColumn } from './admin/DataTable';


interface AdminPanelViewProps {
  products: Product[];
  orders: SimulatedOrder[];
  users: UserAccount[];
  usersError: string | null;
  currentUser: UserAccount | null;
  userRole: UserRole;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, newStatus: SimulatedOrder['status']) => Promise<void>;
  onToggleProductStatus: (productId: string, active: boolean) => Promise<void>;
  onToggleUserBlock: (userId: string, active: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onSelectOrder?: (order: SimulatedOrder) => void;
  initialSection?: AdminPanelSection;
  onNavigate: (view: ActiveView) => void;
  onTriggerFlash: () => void;
}

interface VisualFeedback {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const CATEGORIES: Product['category'][] = [
  'Laptops',
  'Monitores',
  'Periféricos',
  'Audio Visual',
  'Accesorios'
];

export function AdminPanelView({
  products,
  orders,
  users,
  usersError,
  currentUser,
  userRole,
  onAddProduct,
  onUpdateProduct,
  onUpdateOrderStatus,
  onToggleProductStatus,
  onToggleUserBlock,
  onDeleteUser,
  onSelectOrder,
  initialSection = 'inventory',
  onNavigate,
  onTriggerFlash
}: AdminPanelViewProps) {
  // Sección activa del panel
  const [activeTab, setActiveTab] = useState<AdminPanelSection>(initialSection);

  useEffect(() => {
    setActiveTab(initialSection);
  }, [initialSection]);

  // Sistema de Mensajes Visuales (Zero Audio)
  const [visualFeedback, setVisualFeedback] = useState<VisualFeedback | null>(null);

  // Auto-cierre de alertas visuales
  useEffect(() => {
    if (visualFeedback) {
      const timer = setTimeout(() => {
        setVisualFeedback(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [visualFeedback]);

  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setVisualFeedback({ type, title, message });
    onTriggerFlash();
  };

  // -------------------------------------------------------------
  // ESTADOS SECCIÓN 1: GESTIÓN DE PRODUCTOS
  // -------------------------------------------------------------
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  // Modal Crear Producto
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdImageFile, setNewProdImageFile] = useState<File | null>(null);
  const [newProdImagePreview, setNewProdImagePreview] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('Periféricos');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('12');
  const [newProdVisualAlert, setNewProdVisualAlert] = useState('LED Perimetral Notificador | Luz RGB Sincronizada');
  const [newProdDescription, setNewProdDescription] = useState('Dispositivo tecnológico adaptado con testigos luminosos de alta visibilidad para cero emisión acústica.');
  const [createErrors, setCreateErrors] = useState<{ [key: string]: string }>({});
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  useEffect(() => {
    if (!newProdImageFile) {
      setNewProdImagePreview(newProdImageUrl);
      return;
    }

    const previewUrl = URL.createObjectURL(newProdImageFile);
    setNewProdImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [newProdImageFile, newProdImageUrl]);

  // Modal Editar Producto
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState<Product['category']>('Periféricos');
  const [editDescription, setEditDescription] = useState('');
  const [editStockCount, setEditStockCount] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editVisualAlert, setEditVisualAlert] = useState('');
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  // -------------------------------------------------------------
  // ESTADOS SECCIÓN 2: GESTIÓN DE PEDIDOS
  // -------------------------------------------------------------
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');
  const [inspectingOrder, setInspectingOrder] = useState<SimulatedOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // -------------------------------------------------------------
  // ESTADOS SECCIÓN 3: GESTIÓN DE USUARIOS
  // -------------------------------------------------------------
  const [userSearch, setUserSearch] = useState('');
  const [userToToggleBlock, setUserToToggleBlock] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // =============================================================
  // REGLA: ACCESO RESTRINGIDO - SOLO ADMINISTRADORES
  // =============================================================
  if (userRole !== 'admin') {
    return (
      <div className="space-y-8 animate-fadeIn pb-16 text-left max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#00172b] border-2 border-[#ff5449]/50 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-[#290d10] border-2 border-[#ff5449]/60 text-[#ff5449] mx-auto flex items-center justify-center shadow-lg relative">
            <Lock className="w-10 h-10" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff5449] rounded-full animate-ping" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#ff5449]/20 text-[#ff5449] text-xs font-black uppercase tracking-wider border border-[#ff5449]/40">
              Acceso Restringido · Rol Administrador Requerido
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Panel Administrativo Protegido
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tu rol activo actual es <strong className="text-amber-300 capitalize">{userRole === 'visitor' ? 'Cliente Visitante' : 'Cliente Registrado'}</strong>.
              Por normas de gobernanza y protección de catálogo Cero Audio, los clientes y visitantes no tienen acceso a la consola administrativa de inventario, despachos ni usuarios.
            </p>
          </div>

          {/* Acceso al panel solamente después de una autenticación real */}
          <div className="p-4 rounded-2xl bg-[#001426] border border-[#003459] max-w-lg mx-auto text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00e3fd]">
              <Info className="w-4 h-4" />
              <span>Acceso administrativo:</span>
            </div>
            <p className="text-xs text-slate-300">
              El rol administrador se valida con una cuenta creada desde el comando local seguro.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('admin_login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ffc038] hover:bg-[#ffd166] text-[#001629] font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Iniciar sesión como Administrador</span>
            </button>

            <button
              onClick={() => {
                onNavigate('catalog');
                onTriggerFlash();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00243e] hover:bg-[#003357] text-slate-200 font-semibold text-xs sm:text-sm border border-[#00406b] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Volver a la Tienda como Cliente</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // FILTRADOS EN MEMORIA SOBRE LOS DATOS CARGADOS DESDE LA API
  // =============================================================

  // 1. Productos filtrados
  const filteredProducts = products.filter((prod) => {
    const q = productSearch.toLowerCase().trim();
    const matchesSearch = !q || 
      prod.name.toLowerCase().includes(q) ||
      prod.code.toLowerCase().includes(q) ||
      prod.brand.toLowerCase().includes(q) ||
      prod.category.toLowerCase().includes(q) ||
      prod.description.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'todos' || prod.category === categoryFilter;
    const matchesStatus = 
      statusFilter === 'todos' || 
      (statusFilter === 'activos' && (prod.active ?? prod.inStock)) || 
      (statusFilter === 'inactivos' && !(prod.active ?? prod.inStock));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const productColumns: DataTableColumn<Product>[] = [
    {
      key: 'code',
      label: 'Código / Imagen',
      sortValue: (product) => product.code,
      render: (prod) => (
        <div className="flex items-center gap-3">
          <img
            src={prod.images.primary}
            alt={prod.name}
            className="h-12 w-12 shrink-0 rounded-xl border border-[#003860] object-cover"
          />
          <div>
            <span className="block font-mono text-sm font-black text-[#00e3fd]">
              {prod.code}
            </span>
            <span className="text-[10px] uppercase text-slate-400">{prod.brand}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nombre & Categoría',
      sortValue: (product) => product.name,
      render: (prod) => (
        <div className="max-w-xs">
          <div className="text-xs font-bold text-white sm:text-sm">{prod.name}</div>
          <span className="mt-1 inline-block rounded-full border border-[#002f52] bg-[#001324] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
            {prod.category}
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción Técnica',
      sortValue: (product) => product.description,
      render: (prod) => (
        <div className="max-w-xs text-[11px] text-slate-300">
          <p className="line-clamp-2" title={prod.description}>{prod.description}</p>
          <span className="mt-1 block truncate text-[10px] font-semibold text-emerald-400">
            {prod.visualAlert}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Precio (COP)',
      sortValue: (product) => product.price,
      headerClassName: 'text-center',
      className: 'whitespace-nowrap text-center',
      render: (prod) => <span className="text-sm font-black text-white">{formatCOP(prod.price)}</span>,
    },
    {
      key: 'stock',
      label: 'Disponibilidad',
      sortValue: (product) => product.stockCount,
      headerClassName: 'text-center',
      className: 'whitespace-nowrap text-center',
      render: (prod) => (
        <>
          <div className={`text-xs font-black ${prod.stockCount > 0 ? 'text-white' : 'text-red-400'}`}>
            {prod.stockCount} unidades
          </div>
          <span className="text-[10px] text-slate-400">
            {prod.stockCount > 0 ? 'En bodega' : 'Agotado'}
          </span>
        </>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortValue: (product) => Number(product.active),
      headerClassName: 'text-center',
      className: 'whitespace-nowrap text-center',
      render: (prod) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black uppercase ${
          prod.active
            ? 'border-emerald-700 bg-emerald-100 text-emerald-950'
            : 'border-amber-500/80 bg-amber-950/90 text-amber-300'
        }`}>
          {prod.active ? (
            <><CheckCircle2 className="h-3 w-3 text-emerald-800" /><span>Activo</span></>
          ) : (
            <><Lock className="h-3 w-3 text-amber-400" /><span>Pausado</span></>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      headerClassName: 'text-right',
      className: 'whitespace-nowrap text-right',
      render: (prod) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenEditProduct(prod)}
            title="Editar precio, categoría, descripción y disponibilidad"
            className="flex items-center gap-1 rounded-xl border border-[#004e80] bg-[#002b4d] px-3 py-1.5 text-xs font-bold text-[#00e3fd] transition-colors hover:bg-[#003966]"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleProduct(prod)}
            title={prod.active ? 'Archivar del catálogo público' : 'Restaurar al catálogo'}
            className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
              prod.active
                ? 'border-amber-700/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                : 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
            }`}
          >
            {prod.active ? (
              <><Lock className="h-3.5 w-3.5" /><span>Archivar</span></>
            ) : (
              <><Unlock className="h-3.5 w-3.5" /><span>Restaurar</span></>
            )}
          </button>
        </div>
      ),
    },
  ];

  // 2. Pedidos filtrados
  const filteredOrders = orders.filter((ord) => {
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      ord.orderId.toLowerCase().includes(q) ||
      ord.recipientName.toLowerCase().includes(q) ||
      ord.shippingAddress.toLowerCase().includes(q) ||
      (ord.city && ord.city.toLowerCase().includes(q)) ||
      ord.items.some(i => i.product.name.toLowerCase().includes(q) || i.product.code.toLowerCase().includes(q));

    const canonicalStatus = (ORDER_STATUSES[ord.status]?.key || ord.status).toLowerCase();
    const matchesStatus = orderStatusFilter === 'todos' || canonicalStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // 3. Usuarios filtrados
  const filteredUsers = users.filter((usr) => {
    const q = userSearch.toLowerCase().trim();
    return !q ||
      usr.name.toLowerCase().includes(q) ||
      usr.email.toLowerCase().includes(q) ||
      usr.phone.toLowerCase().includes(q) ||
      usr.role.toLowerCase().includes(q);
  });

  // =============================================================
  // MANEJADORES DE SECCIÓN 1: PRODUCTOS
  // =============================================================

  // Abrir Modal de Edición
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCode(prod.code);
    setEditCategory(prod.category);
    setEditPrice(prod.price.toString());
    setEditDescription(prod.description);
    setEditStockCount(prod.stockCount.toString());
    setEditActive(prod.active);
    setEditVisualAlert(prod.visualAlert);
    setEditErrors({});
    onTriggerFlash();
  };

  // Guardar Cambios de Edición
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const errors: { [key: string]: string } = {};
    const parsedPrice = parseFloat(editPrice);
    const parsedStock = parseInt(editStockCount, 10);

    if (!editName.trim()) errors.name = 'El nombre del equipo es obligatorio.';
    if (!editCode.trim()) errors.code = 'El código CUD es obligatorio.';
    if (isNaN(parsedPrice) || parsedPrice <= 0) errors.price = 'El precio debe ser un número positivo mayor a $ 0 COP.';
    if (isNaN(parsedStock) || parsedStock < 0) errors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
    if (!editDescription.trim()) errors.description = 'La descripción técnica es obligatoria.';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showNotification('error', 'Error en Formulario de Edición', 'Por favor verifica los campos resaltados.');
      return;
    }

    const updated: Product = {
      ...editingProduct,
      name: editName.trim(),
      code: editCode.trim(),
      category: editCategory,
      price: parsedPrice,
      originalPrice: parsedPrice * 1.2,
      description: editDescription.trim(),
      stockCount: parsedStock,
      inStock: parsedStock > 0,
      active: editActive,
      visualAlert: editVisualAlert.trim() || editingProduct.visualAlert
    };

    setIsSavingProduct(true);
    try {
      await onUpdateProduct(updated);
      setEditingProduct(null);
      showNotification(
        'success',
        'Producto Actualizado con Éxito',
        `Se guardaron los cambios en MySQL para ${updated.code} (${formatCOP(parsedPrice)}).`
      );
    } catch (error) {
      showNotification(
        'error',
        'No se pudo actualizar el producto',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Enviar Formulario de Creación
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    const parsedPrice = parseFloat(newProdPrice);
    const parsedStock = parseInt(newProdStock, 10);

    if (!newProdName.trim() || newProdName.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres.';
    }
    if (!newProdCode.trim()) {
      errors.code = 'El código CUD es obligatorio.';
    }
    if (newProdImageFile) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedImageTypes.includes(newProdImageFile.type)) {
        errors.image = 'El archivo debe ser JPEG, PNG, WebP o GIF.';
      } else if (newProdImageFile.size > 5 * 1024 * 1024) {
        errors.image = 'La imagen no puede superar los 5 MB.';
      }
    } else if (!newProdImageUrl.trim()) {
      errors.image = 'Ingresa una URL o selecciona una imagen del ordenador.';
    } else {
      try {
        const imageUrl = new URL(newProdImageUrl);
        if (!['http:', 'https:'].includes(imageUrl.protocol)) {
          errors.image = 'Ingresa una URL de imagen válida (http o https).';
        }
      } catch {
        errors.image = 'Ingresa una URL de imagen válida.';
      }
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'El precio debe ser mayor a 0.';
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      errors.stock = 'El stock no puede ser negativo.';
    }
    if (!newProdDescription.trim()) {
      errors.description = 'La descripción técnica es obligatoria.';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      showNotification('error', 'Error de Validación', 'Completa los campos obligatorios del nuevo producto.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const imageUrl = newProdImageFile
        ? await uploadProductImage(newProdImageFile)
        : newProdImageUrl.trim();
      const newProduct: Omit<Product, 'id'> = {
        code: newProdCode.trim().toUpperCase(),
        name: newProdName.trim(),
        category: newProdCategory,
        brand: 'SoftTech Certified',
        price: parsedPrice,
        originalPrice: parsedPrice * 1.25,
        inStock: parsedStock > 0,
        stockCount: parsedStock,
        active: true,
        visualCert: 'WCAG 2.1 AAA - Alerta Lumínica Certificada',
        rating: 5.0,
        reviewsCount: 1,
        images: {
          primary: imageUrl,
          angles: [{ id: 'ang-1', label: 'Frontal', url: imageUrl }]
        },
        description: newProdDescription.trim(),
        visualAlert: newProdVisualAlert.trim() || 'Indicador LED Perimetral Certificado',
        specs: [
          { label: 'Compatibilidad', value: 'Multiplataforma 100% Visual' },
          { label: 'Indicador', value: newProdVisualAlert }
        ],
        inclusiveFeatures: [
          'Totalmente calibrado para personas sordas e hipoacúsicas',
          'Señalización lumínica de alta visibilidad',
          'Cero dependencia de señales acústicas'
        ]
      };
      await onAddProduct(newProduct);
      setIsAddProductModalOpen(false);
      setNewProdName('');
      setNewProdCode('');
      setNewProdPrice('');
      setNewProdImageUrl('');
      setNewProdImageFile(null);
      setCreateErrors({});
      showNotification(
        'success',
        'Producto Registrado en Catálogo',
        `El equipo "${newProduct.name}" (${newProduct.code}) fue guardado en MySQL y activado para venta.`
      );
    } catch (error) {
      showNotification(
        'error',
        'No se pudo crear el producto',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Alternar Activar/Desactivar Producto
  const handleToggleProduct = async (prod: Product) => {
    const willBeActive = !prod.active;
    try {
      await onToggleProductStatus(prod.id, willBeActive);
      showNotification(
        willBeActive ? 'success' : 'info',
        willBeActive ? 'Producto Restaurado' : 'Producto Archivado',
        `El equipo ${prod.code} ahora está ${willBeActive ? 'activo y visible para compra' : 'archivado y oculto para clientes'}.`
      );
    } catch (error) {
      showNotification(
        'error',
        'No se pudo cambiar el estado',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    }
  };

  // =============================================================
  // MANEJADORES DE SECCIÓN 2: PEDIDOS
  // =============================================================
  const handleStatusChange = async (
    orderId: string,
    newStatus: SimulatedOrder['status'],
  ): Promise<boolean> => {
    const meta = ORDER_STATUSES[newStatus] || ORDER_STATUSES.pendiente;
    try {
      await onUpdateOrderStatus(orderId, newStatus);
      showNotification(
        'success',
        'Estado de Pedido Actualizado',
        `La orden ${orderId} cambió a "${meta.label}" y se guardó en el servidor.`
      );
      return true;
    } catch (error) {
      showNotification(
        'error',
        'No se pudo actualizar el pedido',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
      return false;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedCode(text);
    onTriggerFlash();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // =============================================================
  // MANEJADORES DE SECCIÓN 3: USUARIOS
  // =============================================================
  const handleToggleBlockRequest = (user: UserAccount) => {
    // Protección: no bloquear al administrador en sesión
    if (currentUser && user.id === currentUser.id) {
      showNotification('error', 'Acción No Permitida', 'No puedes bloquear tu propia cuenta de administrador en sesión.');
      return;
    }
    setUserToToggleBlock(user);
    onTriggerFlash();
  };

  const confirmToggleUserBlock = async () => {
    if (userToToggleBlock) {
      const targetUser = userToToggleBlock;
      const isBlocking = targetUser.active;
      try {
        await onToggleUserBlock(targetUser.id, !isBlocking);
        showNotification(
          'success',
          isBlocking ? 'Usuario Bloqueado' : 'Usuario Reactivado',
          `La cuenta de "${targetUser.name}" (${targetUser.email}) fue ${isBlocking ? 'bloqueada temporalmente' : 'desbloqueada y reactivada'}.`
        );
      } catch (error) {
        showNotification(
          'error',
          'No se pudo actualizar el usuario',
          error instanceof Error ? error.message : 'Inténtalo de nuevo.',
        );
      } finally {
        setUserToToggleBlock(null);
      }
    }
  };

  const handleDeleteUserRequest = (user: UserAccount) => {
    if (user.role !== 'user' || user.id === currentUser?.id) {
      showNotification('error', 'Acción No Permitida', 'No se puede eliminar una cuenta administradora.');
      return;
    }
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await onDeleteUser(userToDelete.id);
      showNotification(
        'success',
        'Usuario eliminado',
        `La cuenta de "${userToDelete.name}" (${userToDelete.email}) fue eliminada definitivamente.`,
      );
    } catch (error) {
      showNotification(
        'error',
        'No se pudo eliminar el usuario',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    } finally {
      setIsDeletingUser(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 text-left max-w-7xl mx-auto">
      
      {/* -----------------------------------------------------------
          BANNER SUPERIOR: PANEL ADMINISTRATIVO STITCH
      ----------------------------------------------------------- */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#001c33] border-2 border-[#ffc038]/60 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffc038]/20 text-[#ffc038] text-xs font-black uppercase tracking-wider border border-[#ffc038]/50 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Consola Administrativa de Operaciones</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#001324] text-slate-300 text-xs font-mono border border-[#003459]">
                Sesión: <strong className="text-white">{currentUser?.name || 'Administrador'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-[#ffc038]" />
              <span>Panel Administrativo Inclusivo</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              El catálogo, las cuentas y los pedidos se consultan y administran en MySQL.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => {
                onNavigate('catalog');
                onTriggerFlash();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#00243e] hover:bg-[#003357] text-[#00e3fd] font-bold text-xs transition-colors border border-[#004e80] flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Tienda Pública</span>
            </button>
          </div>
        </div>

        {/* Notificación de Accesibilidad Multimodal */}
        <div className="p-3 rounded-xl bg-[#001426] border border-[#00355c] flex items-center gap-3 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-[#ffc038] shrink-0" />
          <span>
            Las acciones administrativas se guardan en el servidor y muestran avisos visuales accesibles conforme a <strong>WCAG 2.1 AAA</strong>, sin sonidos invasivos.
          </span>
        </div>
      </div>

      {/* -----------------------------------------------------------
          BANER DE MENSAJE VISUAL (ACCIONES EXITOSAS / ERRORES)
      ----------------------------------------------------------- */}
      {visualFeedback && (
        <div
          role="alert"
          aria-live="assertive"
          data-notification-type={visualFeedback.type === 'success' ? 'success' : visualFeedback.type === 'error' ? 'error' : 'info'}
          className={`app-visual-notification p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 shadow-xl animate-fadeIn ${
            visualFeedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/40'
              : visualFeedback.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200 shadow-red-950/40'
              : 'bg-[#002b4d] border-[#00e3fd] text-[#00e3fd]'
          }`}
        >
          <div className="flex items-start gap-3">
            {visualFeedback.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : visualFeedback.type === 'error' ? (
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-6 h-6 text-[#00e3fd] shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-extrabold text-sm text-white">
                {visualFeedback.title}
              </h4>
              <p className="text-xs mt-0.5 text-slate-200">
                {visualFeedback.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => setVisualFeedback(null)}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-black/20"
            title="Cerrar notificación visual"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* -----------------------------------------------------------
          ALERTAS CRÍTICAS DE STOCK (≤ 2 unidades) — REQUISITO ADMIN
      ----------------------------------------------------------- */}
      {(() => {
        const criticalProducts = products.filter(p => p.stockCount <= 2 && (p.active ?? p.inStock));
        if (criticalProducts.length === 0) return null;
        return (
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-red-500 bg-red-100 text-red-950 space-y-3 shadow-xl shadow-red-900/10 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-700 text-white flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-900 block">⚠️ Alerta Crítica de Inventario</span>
                <h3 className="text-base font-black text-red-950">{criticalProducts.length} producto{criticalProducts.length > 1 ? 's' : ''} con stock crítico (≤ 2 unidades)</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {criticalProducts.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-50 border border-red-300">
                  <img src={p.images.primary} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-red-950 truncate">{p.name}</p>
                    <span className="font-mono text-xs text-red-900">{p.code}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        p.stockCount === 0 ? 'bg-red-700 border-red-400 text-white' : 'bg-amber-700 border-amber-400 text-white'
                      }`}>
                        {p.stockCount === 0 ? '🔴 AGOTADO' : `🟡 ${p.stockCount} ud. restante${p.stockCount > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-red-950 font-semibold">
              Recomendación: Actualiza el stock de estos equipos desde la pestaña <strong>Gestión de Productos</strong> o desactívalos del catálogo hasta reabastecer.
            </p>
          </div>
        );
      })()}

      {/* -----------------------------------------------------------
          INDICADORES EJECUTIVOS (KPIS STITCH)
      ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Productos */}
        <div 
          onClick={() => { setActiveTab('inventory'); onTriggerFlash(); }}
          className={`p-5 rounded-2xl bg-[#001e36] border-2 cursor-pointer transition-all ${
            activeTab === 'inventory' ? 'border-[#00e3fd] shadow-lg ring-2 ring-[#00e3fd]/20' : 'border-[#003d69] hover:border-[#004e80]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Gestión de Productos</span>
            <Package className="w-4 h-4 text-[#00e3fd]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">{products.length}</span>
            <span className="text-xs font-semibold text-emerald-400">
              {products.filter(p => p.inStock).length} activos
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Crear, editar precios, stock y categorías</span>
        </div>

        {/* KPI 2: Pedidos */}
        <div 
          onClick={() => { setActiveTab('orders'); onTriggerFlash(); }}
          className={`p-5 rounded-2xl bg-[#001e36] border-2 cursor-pointer transition-all ${
            activeTab === 'orders' ? 'border-[#00e3fd] shadow-lg ring-2 ring-[#00e3fd]/20' : 'border-[#003d69] hover:border-[#004e80]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Gestión de Pedidos</span>
            <Truck className="w-4 h-4 text-[#ffc038]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[#ffc038]">{orders.length}</span>
            <span className="text-xs font-semibold text-slate-300">en sistema</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">4 estados: Pendiente, Preparación, Enviado, Entregado</span>
        </div>

        {/* KPI 3: Usuarios */}
        <div 
          onClick={() => { setActiveTab('users'); onTriggerFlash(); }}
          className={`p-5 rounded-2xl bg-[#001e36] border-2 cursor-pointer transition-all ${
            activeTab === 'users' ? 'border-[#00e3fd] shadow-lg ring-2 ring-[#00e3fd]/20' : 'border-[#003d69] hover:border-[#004e80]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Gestión de Usuarios</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">{users.length}</span>
            <span className="text-xs font-bold text-emerald-400">
              {users.filter(u => u.active).length} activos
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Nombres, correos, roles y bloqueo preventivo</span>
        </div>

        <button
          type="button"
          aria-pressed={activeTab === 'analytics'}
          onClick={() => { setActiveTab('analytics'); onTriggerFlash(); }}
          className={`w-full p-5 rounded-2xl bg-[#001e36] border-2 text-left cursor-pointer transition-all ${
            activeTab === 'analytics' ? 'border-[#00e3fd] shadow-lg ring-2 ring-[#00e3fd]/20' : 'border-[#003d69] hover:border-[#004e80]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Análisis de Ventas</span>
            <BarChart3 className="w-4 h-4 text-[#00e3fd]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">Ver</span>
            <span className="text-xs font-semibold text-[#00e3fd]">análisis</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Consultar métricas y reportes de ventas</span>
        </button>
      </div>

      {/* -----------------------------------------------------------
          PESTAÑAS DE NAVEGACIÓN DEL PANEL (3 SECCIONES REQUERIDAS)
      ----------------------------------------------------------- */}
      <div role="group" aria-label="Secciones del panel administrativo" className="flex items-center gap-2 border-b-2 border-[#003860] pb-3 overflow-x-auto">
        <button
          type="button"
          aria-pressed={activeTab === 'inventory'}
          onClick={() => {
            setActiveTab('inventory');
            onTriggerFlash();
          }}
          className={`admin-panel-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-[#00e3fd] text-[#001629] shadow-md ring-2 ring-[#00e3fd]/30'
              : 'bg-[#001729] text-slate-300 border border-[#003357] hover:bg-[#00223b]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>1. Gestión de Productos ({products.length})</span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'orders'}
          onClick={() => {
            setActiveTab('orders');
            onTriggerFlash();
          }}
          className={`admin-panel-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#00e3fd] text-[#001629] shadow-md ring-2 ring-[#00e3fd]/30'
              : 'bg-[#001729] text-slate-300 border border-[#003357] hover:bg-[#00223b]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>2. Gestión de Pedidos ({orders.length})</span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'users'}
          onClick={() => {
            setActiveTab('users');
            onTriggerFlash();
          }}
          className={`admin-panel-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#00e3fd] text-[#001629] shadow-md ring-2 ring-[#00e3fd]/30'
              : 'bg-[#001729] text-slate-300 border border-[#003357] hover:bg-[#00223b]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Gestión de Usuarios ({users.length})</span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'analytics'}
          onClick={() => {
            setActiveTab('analytics');
            onTriggerFlash();
          }}
          className={`admin-panel-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-[#00e3fd] text-[#001629] shadow-md ring-2 ring-[#00e3fd]/30'
              : 'bg-[#001729] text-slate-300 border border-[#003357] hover:bg-[#00223b]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>4. Análisis de Ventas</span>
        </button>

      </div>

      {/* =============================================================
          ANÁLISIS DE VENTAS PARA ADMINISTRACIÓN
      ============================================================= */}
      {activeTab === 'analytics' && <SalesAnalyticsDashboard />}

      {/* =============================================================
          SECCIÓN 1: GESTIÓN DE PRODUCTOS
      ============================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">

          {/* Controles de Barra: Búsqueda, Filtros y Botón Crear */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#00172b] p-4 rounded-2xl border border-[#003357]">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar por código CUD, nombre, categoría o descripción..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001324] border border-[#00355c] focus:border-[#00e3fd] text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>

            {/* Filtros de Categoría y Estado */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#001324] border border-[#00355c] text-white text-xs focus:outline-none focus:border-[#00e3fd]"
              >
                <option value="todos">Todas las Categorías</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#001324] border border-[#00355c] text-white text-xs focus:outline-none focus:border-[#00e3fd]"
              >
                <option value="todos">Todos los Estados</option>
                <option value="activos">Solo Activos</option>
                <option value="inactivos">Solo Desactivados</option>
              </select>

              {/* Botón Crear Producto */}
              <button
                onClick={() => {
                  setIsAddProductModalOpen(true);
                  onTriggerFlash();
                }}
                className="px-4 py-2 rounded-xl bg-[#34a273] hover:bg-[#3ec78e] text-[#001629] font-black text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Producto</span>
              </button>
            </div>
          </div>

          {/* Tabla de Productos */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 p-8 rounded-3xl bg-[#00172b] border-2 border-dashed border-[#00385c] space-y-3">
              <Package className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No se encontraron productos</h3>
              <p className="text-xs text-slate-400">Intenta restablecer tus filtros o crear un nuevo equipo para el catálogo.</p>
              <button
                onClick={() => {
                  setProductSearch('');
                  setCategoryFilter('todos');
                  setStatusFilter('todos');
                }}
                className="px-4 py-2 rounded-xl bg-[#002b4d] text-[#00e3fd] text-xs font-bold border border-[#004e80]"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <DataTable
              caption="Catálogo de productos"
              rows={filteredProducts}
              columns={productColumns}
              getRowKey={(product) => product.id}
              getSearchText={(product) =>
                `${product.code} ${product.name} ${product.brand} ${product.category} ${product.description}`
              }
              searchValue={productSearch}
              onSearchChange={setProductSearch}
              showSearch={false}
              variant="dark"
              emptyMessage="No se encontraron productos con esa búsqueda."
            />
          )}
        </div>
      )}

      {/* =============================================================
          SECCIÓN 2: GESTIÓN DE PEDIDOS
          - Consultar pedidos simulados
          - Ver detalle de cada pedido
          - Cambiar estado entre: Pendiente, En preparación, Enviado, Entregado
      ============================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Controles de Búsqueda y Filtro de Estados */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#00172b] p-4 rounded-2xl border border-[#003357]">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Buscar por código #STK, cliente, ciudad o dirección..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001324] border border-[#00355c] focus:border-[#00e3fd] text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>

            {/* Pestañas de los 4 estados requeridos */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'pendiente', label: 'Pendiente' },
                { key: 'preparacion', label: 'En preparación' },
                { key: 'enviado', label: 'Enviado' },
                { key: 'entregado', label: 'Entregado' }
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => {
                    setOrderStatusFilter(st.key);
                    onTriggerFlash();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    orderStatusFilter === st.key
                      ? 'bg-[#00e3fd] text-[#001629]'
                      : 'bg-[#001324] text-slate-300 border border-[#002b47] hover:bg-[#00223b]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Pedidos */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 p-8 rounded-3xl bg-[#00172b] border-2 border-dashed border-[#00385c] space-y-3">
              <Truck className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No hay órdenes con estos filtros</h3>
              <p className="text-xs text-slate-400">Intenta buscar con otro término o cambiar el filtro de estado logístico.</p>
              <button
                onClick={() => {
                  setOrderSearch('');
                  setOrderStatusFilter('todos');
                }}
                className="px-4 py-2 rounded-xl bg-[#002b4d] text-[#00e3fd] text-xs font-bold border border-[#004e80]"
              >
                Restablecer
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#001c33] border-2 border-[#003a61] overflow-x-auto shadow-xl">
              <table className="data-table-compact w-full text-left text-xs text-slate-300">
                <thead className="bg-[#001324] text-slate-400 uppercase font-bold border-b border-[#003254]">
                  <tr>
                    <th className="p-4">Código #STK / Fecha</th>
                    <th className="p-4">Destinatario & Destino</th>
                    <th className="p-4">Canal Escrito</th>
                    <th className="p-4 text-center">Total Facturado</th>
                    <th className="p-4 text-center">Estado Logístico Actual</th>
                    <th className="p-4 text-center">Cambiar Estado</th>
                    <th className="p-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#002947]">
                  {filteredOrders.map((order) => {
                    const meta = ORDER_STATUSES[order.status] || ORDER_STATUSES.pendiente;
                    const StatusIcon = meta.icon;

                    return (
                      <tr key={order.orderId} className="hover:bg-[#00243e] transition-colors">
                        {/* Código #STK y Fecha */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-sm text-[#00e3fd]">
                              {order.orderId}
                            </span>
                            <button
                              onClick={() => handleCopy(order.orderId)}
                              title="Copiar código"
                              className="p-1 hover:bg-[#001426] rounded text-slate-400 hover:text-white"
                            >
                              {copiedCode === order.orderId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{order.date}</span>
                          </div>
                        </td>

                        {/* Destinatario & Ciudad */}
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-white text-xs">{order.recipientName}</div>
                          <div className="text-[11px] text-slate-400 truncate" title={order.shippingAddress}>
                            {order.shippingAddress}
                          </div>
                          {order.city && (
                            <span className="text-[10px] text-[#00e3fd] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {order.city}
                            </span>
                          )}
                        </td>

                        {/* Canal Escrito Cero Audio */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-[#001426] text-[#00e3fd] text-[10px] font-mono border border-[#002f52] uppercase">
                            {order.shippingChannel.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Total Facturado */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="font-black text-white text-sm">
                            {formatCOP(order.total)}
                          </div>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            {order.items.length} {order.items.length === 1 ? 'equipo' : 'equipos'}
                          </span>
                        </td>

                        {/* Estado Actual (Texto visible + Ícono + Color) */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <span
                            aria-label={`Estado logístico: ${meta.label}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold normal-case border shadow-sm ${
                              meta.key === 'enviado'
                                ? 'border-yellow-500 bg-yellow-100 text-yellow-950'
                                : meta.key === 'preparacion'
                                  ? 'border-purple-500 bg-purple-100 text-purple-950'
                                  : meta.key === 'entregado'
                                    ? 'border-green-600 bg-green-100 text-green-950'
                                    : 'border-red-500 bg-red-100 text-red-950'
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{meta.label}</span>
                          </span>
                        </td>

                        {/* Selector de los 4 Estados Requeridos */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <select
                            value={
                              order.status === 'en_camino'
                                ? 'enviado'
                                : order.status === 'confirmado'
                                ? 'pendiente'
                                : order.status
                            }
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value as any)}
                            className="px-3 py-1.5 rounded-xl bg-[#001426] border border-[#003860] text-xs font-bold text-white focus:border-[#00e3fd] focus:outline-none cursor-pointer"
                          >
                            <option value="pendiente">1. Pendiente</option>
                            <option value="preparacion">2. En preparación</option>
                            <option value="enviado">3. Enviado</option>
                            <option value="entregado">4. Entregado</option>
                          </select>
                        </td>

                        {/* Botón Ver Detalle */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setInspectingOrder(order);
                              onTriggerFlash();
                            }}
                            className="admin-order-detail-button px-3 py-1.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Detalle</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          SECCIÓN 3: GESTIÓN DE USUARIOS
          - Consultar usuarios simulados
          - Ver nombre y correo
          - Identificar el rol
          - Bloquear o desbloquear usuarios de demostración
      ============================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {usersError && (
            <div role="alert" className="rounded-xl border border-red-500/70 bg-red-950/60 p-4 text-sm text-red-200">
              No se pudo cargar la lista de cuentas: {usersError}
            </div>
          )}
          {/* Controles de Búsqueda de Usuarios */}
          <div className="bg-[#00172b] p-4 rounded-2xl border border-[#003357] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuarios por nombre, correo electrónico o teléfono..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#001324] border border-[#00355c] focus:border-[#00e3fd] text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-400">
              Total Registrados: <strong className="text-white">{filteredUsers.length}</strong>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 p-8 rounded-3xl bg-[#00172b] border-2 border-dashed border-[#00385c] space-y-3">
              <Users className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No se encontraron usuarios</h3>
              <p className="text-xs text-slate-400">Intenta con otro nombre o dirección de correo.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#001c33] border-2 border-[#003a61] overflow-x-auto shadow-xl">
              <table className="data-table-compact w-full text-left text-xs text-slate-300">
                <thead className="bg-[#001324] text-slate-400 uppercase font-bold border-b border-[#003254]">
                  <tr>
                    <th className="p-4">Identidad & Nombre</th>
                    <th className="p-4">Correo Electrónico</th>
                    <th className="p-4">Teléfono / Aviso</th>
                    <th className="p-4 text-center">Rol Identificado</th>
                    <th className="p-4 text-center">Canal Preferido</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Acciones de Cuenta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#002947]">
                  {filteredUsers.map((usr) => {
                    const isSelfAdmin = currentUser && usr.id === currentUser.id;

                    return (
                      <tr key={usr.id} className="hover:bg-[#00243e] transition-colors">
                        {/* Nombre */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#002542] border border-[#004e80] text-[#00e3fd] font-black flex items-center justify-center text-sm shrink-0">
                              {usr.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs sm:text-sm">
                                {usr.name}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {usr.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Correo Electrónico */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Mail className="w-3.5 h-3.5 text-[#00e3fd] shrink-0" />
                            <span className="font-mono text-xs">{usr.email}</span>
                          </div>
                        </td>

                        {/* Teléfono */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="font-mono text-xs">{usr.phone}</span>
                          </div>
                        </td>

                        {/* Identificación de Rol */}
                        <td className="p-4 text-center whitespace-nowrap">
                          {usr.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#2e1d00] text-[#ffc038] border border-[#ffc038]/60 shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Administrador</span>
                            </span>
                          ) : usr.role === 'user' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#002b4d] text-[#00e3fd] border border-[#00e3fd]/60">
                              <span>Usuario Registrado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#00172b] text-slate-300 border border-slate-700">
                              <span>Cliente Visitante</span>
                            </span>
                          )}
                        </td>

                        {/* Canal Preferido */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-[#001426] text-slate-200 text-[10px] font-mono border border-[#002f52] uppercase">
                            {usr.preferredChannel?.replace('_', ' ') || 'SMS VISUAL'}
                          </span>
                        </td>

                        {/* Estado: Activo vs Bloqueado */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className={`admin-user-status inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            usr.active
                              ? 'admin-user-status--active'
                              : 'admin-user-status--blocked'
                          }`}>
                            {usr.active ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Activo</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Bloqueado</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Acción: Bloquear o Desbloquear */}
                        <td className="p-4 text-right whitespace-nowrap">
                          {usr.role !== 'user' ? (
                            <span className="text-[11px] text-slate-400 italic">
                              {isSelfAdmin ? '(Sesión Activa)' : 'Cuenta protegida'}
                            </span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleToggleBlockRequest(usr)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                                  usr.active
                                    ? 'bg-red-950/40 text-red-300 border-red-700/80 hover:bg-red-900/60'
                                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/60'
                                }`}
                              >
                                {usr.active ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Bloquear</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Desbloquear</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUserRequest(usr)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-red-700/80 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-colors flex items-center gap-1.5"
                                aria-label={`Eliminar cuenta de ${usr.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          MODAL: CREAR PRODUCTO (Formulario sencillo con validaciones)
      ============================================================= */}
      {isAddProductModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" 
          role="dialog" 
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-[#001e36] border-2 border-[#005085] rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#003860] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#34a273]/20 text-[#3ec78e]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Crear Nuevo Producto</h3>
                  <p className="text-xs text-slate-400">Ingresa las especificaciones del equipo para el catálogo accesible.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">
                  Nombre del Equipo: *
                </label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej. Ratón Ergonómico con Feedback Háptico y LED"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                    createErrors.name ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                  }`}
                />
                {createErrors.name && (
                  <span className="text-[11px] text-red-400 font-semibold block">{createErrors.name}</span>
                )}
              </div>

              {/* Imagen del producto */}
              <div className="space-y-1">
                <label htmlFor="new-product-image-url" className="font-bold text-slate-200 block">
                  Imagen del Producto (URL o archivo): *
                </label>
                <input
                  id="new-product-image-url"
                  type="url"
                  value={newProdImageUrl}
                  onChange={(e) => {
                    setNewProdImageUrl(e.target.value);
                    if (e.target.value) setNewProdImageFile(null);
                  }}
                  placeholder="https://ejemplo.com/imagen-producto.jpg"
                  aria-invalid={Boolean(createErrors.image)}
                  aria-describedby={createErrors.image ? 'new-product-image-error' : 'new-product-image-help'}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                    createErrors.image ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                  }`}
                />
                <label htmlFor="new-product-image-file" className="font-bold text-slate-200 block pt-2">
                  O cargar una foto desde el ordenador:
                </label>
                <input
                  id="new-product-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;
                    setNewProdImageUrl('');
                    setNewProdImageFile(file);
                    setCreateErrors((current) => {
                      const { image: _imageError, ...remainingErrors } = current;
                      return remainingErrors;
                    });
                  }}
                  aria-invalid={Boolean(createErrors.image)}
                  aria-describedby={createErrors.image ? 'new-product-image-error' : 'new-product-image-help'}
                  className="admin-product-image-file block w-full rounded-xl border border-[#003459] bg-[#001426] text-slate-200 text-xs"
                />
                {createErrors.image ? (
                  <span id="new-product-image-error" className="text-[11px] text-red-400 font-semibold block">
                    {createErrors.image}
                  </span>
                ) : (
                  <span id="new-product-image-help" className="text-[11px] text-slate-400 block">
                    Selecciona JPEG, PNG, WebP o GIF (máximo 5 MB), o pega un enlace público.
                  </span>
                )}
                {newProdImagePreview && (
                  <img
                    src={newProdImagePreview}
                    alt="Vista previa de la imagen del producto"
                    className="mt-2 h-28 w-28 rounded-xl border border-[#003459] bg-[#001426] object-contain"
                  />
                )}
              </div>

              {/* Código CUD y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Código CUD: *
                  </label>
                  <input
                    type="text"
                    value={newProdCode}
                    onChange={(e) => setNewProdCode(e.target.value)}
                    placeholder="Ej. CUD017"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                      createErrors.code ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                    }`}
                  />
                  {createErrors.code && (
                    <span className="text-[11px] text-red-400 font-semibold block">{createErrors.code}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Categoría: *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs focus:outline-none focus:border-[#00e3fd]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Precio y Disponibilidad / Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Precio (COP): *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="1000"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="450000"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                        createErrors.price ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                      }`}
                    />
                  </div>
                  {createErrors.price && (
                    <span className="text-[11px] text-red-400 font-semibold block">{createErrors.price}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Disponibilidad (Stock Inicial): *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="10"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                      createErrors.stock ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                    }`}
                  />
                  {createErrors.stock && (
                    <span className="text-[11px] text-red-400 font-semibold block">{createErrors.stock}</span>
                  )}
                </div>
              </div>

              {/* Alerta Visual */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">
                  Alerta Visual / Prestación Inclusiva Cero Audio:
                </label>
                <input
                  type="text"
                  value={newProdVisualAlert}
                  onChange={(e) => setNewProdVisualAlert(e.target.value)}
                  placeholder="LED Perimetral Notificador | Luz RGB Sincronizada"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs focus:outline-none focus:border-[#00e3fd]"
                />
              </div>

              {/* Descripción Técnica */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">
                  Descripción Técnica: *
                </label>
                <textarea
                  rows={3}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Explica las características técnicas y ventajas de accesibilidad visual del equipo..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                    createErrors.description ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                  }`}
                />
                {createErrors.description && (
                  <span className="text-[11px] text-red-400 font-semibold block">{createErrors.description}</span>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#003860]">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-[#00172b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2.5 rounded-xl bg-[#34a273] hover:bg-[#3ec78e] text-[#001629] font-black shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingProduct ? 'Guardando...' : 'Guardar en Catálogo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: EDITAR PRODUCTO
          - Modificar precio
          - Modificar categoría
          - Modificar descripción
          - Modificar disponibilidad (stock & inStock)
          - Activar / Desactivar
      ============================================================= */}
      {editingProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" 
          role="dialog" 
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-[#001e36] border-2 border-[#00e3fd]/60 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#003860] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#00e3fd]/20 text-[#00e3fd]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Editar Producto · {editingProduct.code}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifica precio, categoría, descripción técnica y disponibilidad.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de Edición */}
            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">
                  Nombre del Equipo:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                    editErrors.name ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                  }`}
                />
                {editErrors.name && (
                  <span className="text-[11px] text-red-400 font-semibold block">{editErrors.name}</span>
                )}
              </div>

              {/* Código CUD y Modificar Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Código CUD:
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs focus:outline-none focus:border-[#00e3fd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Modificar Categoría:
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs focus:outline-none focus:border-[#00e3fd]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modificar Precio y Modificar Disponibilidad (Stock) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Modificar Precio (COP):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#00e3fd] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="1000"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs font-bold focus:outline-none ${
                        editErrors.price ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                      }`}
                    />
                  </div>
                  {editErrors.price && (
                    <span className="text-[11px] text-red-400 font-semibold block">{editErrors.price}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    Modificar Disponibilidad (Unidades):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStockCount}
                    onChange={(e) => setEditStockCount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs font-bold focus:outline-none ${
                      editErrors.stock ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                    }`}
                  />
                  {editErrors.stock && (
                    <span className="text-[11px] text-red-400 font-semibold block">{editErrors.stock}</span>
                  )}
                </div>
              </div>

              {/* Modificar Alerta Visual */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">
                  Alerta Visual / Certificación:
                </label>
                <input
                  type="text"
                  value={editVisualAlert}
                  onChange={(e) => setEditVisualAlert(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs focus:outline-none focus:border-[#00e3fd]"
                />
              </div>

              {/* Modificar Descripción */}
              <div className="space-y-1">
                <label className="font-bold text-slate-200 block">
                  Modificar Descripción:
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#001426] border text-white text-xs focus:outline-none ${
                    editErrors.description ? 'border-red-500' : 'border-[#003459] focus:border-[#00e3fd]'
                  }`}
                />
                {editErrors.description && (
                  <span className="text-[11px] text-red-400 font-semibold block">{editErrors.description}</span>
                )}
              </div>

              {/* Activar / Desactivar Producto */}
              <div className="p-3.5 rounded-xl bg-[#001426] border border-[#00355c] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Estado de Publicación:</span>
                  <span className="text-[11px] text-slate-400">
                    {editActive ? 'Activo y visible en la tienda' : 'Archivado / Oculto para clientes'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors flex items-center gap-1.5 ${
                    editActive
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-amber-950 text-amber-300 border-amber-600'
                  }`}
                >
                  {editActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Producto Activo</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Producto Archivado</span>
                    </>
                  )}
                </button>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#003860]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-[#00172b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2.5 rounded-xl bg-[#00e3fd] hover:bg-[#3de9ff] text-[#001629] font-black shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingProduct ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: DETALLE DEL PEDIDO (Ver Detalle de cada pedido)
      ============================================================= */}
      {inspectingOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" 
          role="dialog" 
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-[#001e36] border-2 border-[#004e80] rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#003860] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-[#00e3fd]">
                    {inspectingOrder.orderId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#001426] text-slate-300 text-[10px] font-mono border border-[#002f52] uppercase">
                    Avisos: {inspectingOrder.shippingChannel.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fecha del pedido: <strong className="text-slate-200">{inspectingOrder.date}</strong>
                </p>
              </div>

              <button
                onClick={() => setInspectingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Directo de Estado desde el Modal */}
            <div className="p-4 rounded-2xl bg-[#001426] border border-[#003254] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Estado Logístico:
                </span>
                <select
                  value={
                    inspectingOrder.status === 'en_camino'
                      ? 'enviado'
                      : inspectingOrder.status === 'confirmado'
                      ? 'pendiente'
                      : inspectingOrder.status
                  }
                  onChange={(e) => {
                    const nextSt = e.target.value as any;
                    void handleStatusChange(inspectingOrder.orderId, nextSt).then(
                      (updated) => {
                        if (!updated) return;
                        setInspectingOrder({
                          ...inspectingOrder,
                          status: nextSt,
                        });
                      },
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#001d36] border border-[#004e80] text-xs font-bold text-[#00e3fd] focus:outline-none"
                >
                  <option value="pendiente">1. Pendiente</option>
                  <option value="preparacion">2. En preparación</option>
                  <option value="enviado">3. Enviado</option>
                  <option value="entregado">4. Entregado</option>
                </select>
              </div>

              <p className="text-xs text-slate-400">
                {(ORDER_STATUSES[inspectingOrder.status] || ORDER_STATUSES.pendiente).description}
              </p>
            </div>

            {/* Datos del Destinatario */}
            <div className="p-4 rounded-2xl bg-[#00172b] border border-[#002e4f] space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Datos de Entrega Cero Audio:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[11px]">Destinatario:</span>
                  <strong className="text-white">{inspectingOrder.recipientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Teléfono de Contacto:</span>
                  <strong className="text-white">{inspectingOrder.contactNumber}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Dirección Registrada:</span>
                  <strong className="text-white">{inspectingOrder.shippingAddress}</strong>
                  {inspectingOrder.city && (
                    <span className="text-slate-400 block">Ciudad: {inspectingOrder.city}</span>
                  )}
                </div>
                {inspectingOrder.notes && (
                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-[#001121] border border-[#002440] text-amber-300">
                    <strong>Protocolo de Entrega:</strong> {inspectingOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Desglose de Productos */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Equipos en el Pedido ({inspectingOrder.items.length}):
              </h4>
              <div className="divide-y divide-[#002c4a] rounded-2xl bg-[#001426] border border-[#002f52] overflow-hidden">
                {inspectingOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images.primary}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#003860]"
                      />
                      <div>
                        <h5 className="font-bold text-white">{item.product.name}</h5>
                        <span className="font-mono text-[#00e3fd] text-[11px]">
                          {item.product.code} · Cant: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white block">
                        {formatCOP(item.product.price * item.quantity)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatCOP(item.product.price)} c/u
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="p-4 rounded-2xl bg-[#00172b] border border-[#003357] space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatCOP(inspectingOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IVA (19%):</span>
                <span>{formatCOP(inspectingOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Despacho Cero Audio:</span>
                <span>$ 0 COP (Inclusivo)</span>
              </div>
              <div className="flex justify-between text-white font-extrabold text-sm pt-2 border-t border-[#002d4f]">
                <span>Total Facturado:</span>
                <span className="text-[#00e3fd]">{formatCOP(inspectingOrder.total)}</span>
              </div>
            </div>

            {/* Botón de Cierre */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#002b4d] hover:bg-[#003966] text-white font-bold text-xs border border-[#004e80]"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: BLOQUEAR / DESBLOQUEAR USUARIO
      ============================================================= */}
      <VisualNoticeModal
        isOpen={userToToggleBlock !== null}
        onClose={() => setUserToToggleBlock(null)}
        title={userToToggleBlock?.active ? 'Bloqueo Preventivo de Usuario' : 'Reactivación de Cuenta'}
        type={userToToggleBlock?.active ? 'danger' : 'success'}
        primaryAction={{
          label: userToToggleBlock?.active ? 'Confirmar Bloqueo' : 'Confirmar Desbloqueo',
          onClick: confirmToggleUserBlock,
          variant: userToToggleBlock?.active ? 'danger' : 'primary'
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setUserToToggleBlock(null)
        }}
      >
        <p>
          ¿Estás seguro de que deseas {userToToggleBlock?.active ? 'bloquear' : 'desbloquear'} la cuenta de <strong className="text-white">&quot;{userToToggleBlock?.name}&quot;</strong> ({userToToggleBlock?.email})?
        </p>
        <p className="text-xs text-slate-400">
          {userToToggleBlock?.active
            ? 'El usuario no podrá ingresar ni generar nuevos pedidos simulados hasta que un administrador reactive su cuenta.'
            : 'El usuario recuperará acceso inmediato a su historial de compras y catálogo tecnológico.'}
        </p>
      </VisualNoticeModal>

      <VisualNoticeModal
        isOpen={userToDelete !== null}
        onClose={() => {
          if (!isDeletingUser) setUserToDelete(null);
        }}
        title="Eliminar cuenta de usuario"
        type="danger"
        primaryAction={{
          label: isDeletingUser ? 'Eliminando…' : 'Eliminar definitivamente',
          onClick: () => void confirmDeleteUser(),
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setUserToDelete(null),
        }}
      >
        <p>
          ¿Confirmas que deseas eliminar la cuenta de <strong className="text-white">&quot;{userToDelete?.name}&quot;</strong> ({userToDelete?.email})?
        </p>
        <p className="text-xs text-slate-400">
          Esta acción elimina la cuenta de forma permanente y no se puede deshacer. Las cuentas administradoras están protegidas.
        </p>
      </VisualNoticeModal>

    </div>
  );
}
