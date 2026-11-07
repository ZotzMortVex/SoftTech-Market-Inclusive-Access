import { useState, useEffect, useCallback, useRef } from "react";
import {
  ActiveView,
  UserRole,
  UserAccount,
  Product,
  CartItem,
  SimulatedOrder,
  AccessibilitySettings,
  SupportTicket,
  AdminPanelSection,
  GlobalToastNotification,
  CustomProductRequest,
  UserSuggestion,
  ChatMessage,
} from "./types";
import {
  INITIAL_PRODUCTS,
  initialMockOrders,
  initialGlossary,
  initialTickets,
} from "./data/mockData";

// Core UI Components
import { Footer } from "./components/Footer";
import { ErrorPage } from "./components/ErrorPage";
import { OpticalFlash } from "./components/OpticalFlash";
import { VisualNoticeModal } from "./components/VisualNoticeModal";
import { GlobalVisualToast } from "./components/GlobalVisualToast";
import { ToastNotification } from "./components/ToastNotification";
import { ProductRequestModal } from "./components/ProductRequestModal";

import { SuggestionsMailboxModal } from "./components/SuggestionsMailboxModal";

// Views
import { WelcomeView } from "./components/WelcomeView";
import { CatalogView } from "./components/CatalogView";
import { ProductDetailView } from "./components/ProductDetailView";
import { CartView } from "./components/CartView";
import { CheckoutFlow } from "./components/CheckoutFlow";
import { OrderConfirmationView } from "./components/OrderConfirmationView";
import { OrderHistoryView } from "./components/OrderHistoryView";
import { AdminPanelView } from "./components/AdminPanelView";
import { AccessibilityCenterView } from "./components/AccessibilityCenterView";
import { FloatingAccessibilityWidget } from "./components/FloatingAccessibilityWidget";
import { WrittenSupportChat } from "./components/support/WrittenSupportChat";
import { AuthViews } from "./components/AuthViews";
import { IndependentAuthPortal } from "./components/auth/IndependentAuthPortal";
import { AccessibleWrittenCheckout } from "./components/checkout/AccessibleWrittenCheckout";

import {
  loadStoredUsers,
  saveStoredUsers,
  appendUserToStorage,
  replaceUserInStorage,
} from "./utils/authStorage";
import {
  fetchCurrentAccount,
  fetchManagedUsers,
  loginAccount,
  logoutAccount,
  renewAuthenticatedSession,
  registerAccount,
  deleteManagedUser,
  setManagedUserActive,
} from "./utils/authApi";
import type { RegisterAccountInput } from "./utils/authApi";
import {
  loadStoredOrders,
  saveStoredOrders,
  loadStoredCart,
  saveStoredCart,
} from "./utils/orderStorage";
import {
  fetchAllOrders,
  fetchMyOrders,
  updateOrderStatus,
} from "./utils/ordersApi";
import {
  createProduct,
  fetchProducts,
  setProductActive,
  updateProduct,
  type ProductWriteInput,
} from "./utils/productApi";
import {
  loadStoredTickets,
  saveStoredTickets,
  SUPPORT_TICKETS_KEY,
} from "./utils/supportStorage";
import { NavigationChrome } from "./components/NavigationChrome";
import { AdminDropdown } from "./components/admin/AdminDropdown";
import { SignLanguageInterpreter } from "./components/SignLanguageInterpreter";
import { useSignLanguage } from "./context/SignLanguageContext";
import { formatCOP } from "./utils/formatters";
import { getAdaptiveColorTokens } from "./utils/accessibleColors";
import { ShoppingCart } from "lucide-react";
import { clampFontScale } from "./utils/accessibilityScale";
import { useAutoLogout } from "./hooks/useAutoLogout";
import {
  SESSION_UNAUTHORIZED_EVENT,
  type ApiAccessDeniedEventDetail,
} from "./utils/apiFetch";

// LocalStorage keys for new features
const LS_PRODUCT_REQUESTS = "softtech_product_requests";
const LS_SUGGESTIONS = "softtech_suggestions";
const REGISTRATION_NOTICE_DURATION_MS = 5 * 60 * 1000;

const signLanguageVideoSources: Partial<
  Record<ActiveView, string | undefined>
> = {
  welcome: import.meta.env.VITE_LSC_WELCOME_VIDEO,
  catalog: import.meta.env.VITE_LSC_CATALOG_VIDEO,
  cart: import.meta.env.VITE_LSC_CART_VIDEO,
  checkout: import.meta.env.VITE_LSC_CHECKOUT_VIDEO,
  order_confirmation: import.meta.env.VITE_LSC_ORDER_CONFIRMATION_VIDEO,
  admin: import.meta.env.VITE_LSC_ADMIN_VIDEO,
  product_detail: import.meta.env.VITE_LSC_CATALOG_VIDEO,
  order_history: import.meta.env.VITE_LSC_ORDER_CONFIRMATION_VIDEO,
  accessibility: import.meta.env.VITE_LSC_DEFAULT_VIDEO,
  contact_support: import.meta.env.VITE_LSC_DEFAULT_VIDEO,
  support: import.meta.env.VITE_LSC_SUPPORT_QUESTION_VIDEO,
  login: import.meta.env.VITE_LSC_AUTH_VIDEO,
  auth_login: import.meta.env.VITE_LSC_AUTH_VIDEO,
  register: import.meta.env.VITE_LSC_AUTH_VIDEO,
  auth_register: import.meta.env.VITE_LSC_AUTH_VIDEO,
  admin_login: import.meta.env.VITE_LSC_AUTH_VIDEO,
  forgot_password: import.meta.env.VITE_LSC_AUTH_VIDEO,
  auth_forgot: import.meta.env.VITE_LSC_AUTH_VIDEO,
  profile: import.meta.env.VITE_LSC_AUTH_VIDEO,
  auth_profile: import.meta.env.VITE_LSC_AUTH_VIDEO,
};

const signLanguageCaptions: Partial<Record<ActiveView, string>> = {
  welcome: "Bienvenida a SoftTech Market",
  catalog: "Catálogo y filtros de productos",
  product_detail: "Detalles del producto",
  cart: "Revisión del carrito",
  checkout: "Desglose de compra y confirmación en pesos colombianos",
  order_confirmation: "Confirmación y seguimiento del pedido",
  order_history: "Historial de pedidos",
  admin: "Gestión administrativa de la tienda",
  admin_login: "Acceso administrativo",
  login: "Portal de acceso: invitado, usuario, administrador y registro",
  auth_login: "Portal de acceso: invitado, usuario, administrador y registro",
  register: "Registro de cuenta",
  auth_register: "Registro de cuenta",
  forgot_password: "Recuperación de contraseña",
  auth_forgot: "Recuperación de contraseña",
  accessibility: "Opciones de accesibilidad",
  contact_support: "Soporte escrito",
  support: "Soporte escrito",
};

function loadProductRequests(): CustomProductRequest[] {
  try {
    const raw = localStorage.getItem(LS_PRODUCT_REQUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveProductRequests(items: CustomProductRequest[]) {
  localStorage.setItem(LS_PRODUCT_REQUESTS, JSON.stringify(items));
}
function loadSuggestions(): UserSuggestion[] {
  try {
    const raw = localStorage.getItem(LS_SUGGESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveSuggestions(items: UserSuggestion[]) {
  localStorage.setItem(LS_SUGGESTIONS, JSON.stringify(items));
}

export default function App() {
  const {
    setInterpreterVideo,
    triggerLscVideo,
    playWelcomeVideo,
    isWelcomePlayback,
    isProductPlayback,
  } = useSignLanguage();

  // Navigation & Role State
  const [activeView, setActiveView] = useState<ActiveView>(() =>
    new URLSearchParams(window.location.search).has("passwordResetToken")
      ? "login"
      : "catalog",
  );
  const viewNavigationHistory = useRef<ActiveView[]>([activeView]);
  const viewNavigationIndex = useRef(0);
  const [navigationHistoryPosition, setNavigationHistoryPosition] = useState(0);
  const previousInterpreterViewRef = useRef(activeView);
  const [userRole, setUserRole] = useState<UserRole>("visitor");
  const [registrationNoticeStartedAt, setRegistrationNoticeStartedAt] =
    useState(() => Date.now());
  const [isRegistrationNoticeVisible, setIsRegistrationNoticeVisible] =
    useState(true);
  const [httpErrorStatus, setHttpErrorStatus] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const pendingProtectedView = useRef<ActiveView | null>(null);
  const sessionExpirationHandled = useRef(false);

  const setActiveViewWithHistory = (view: ActiveView) => {
    const nextHistory = viewNavigationHistory.current.slice(
      0,
      viewNavigationIndex.current + 1,
    );
    if (nextHistory[nextHistory.length - 1] !== view) {
      nextHistory.push(view);
    }
    viewNavigationHistory.current = nextHistory;
    viewNavigationIndex.current = nextHistory.length - 1;
    setNavigationHistoryPosition(viewNavigationIndex.current);
    setActiveView(view);
  };

  const resetActiveViewHistory = (view: ActiveView) => {
    viewNavigationHistory.current = [view];
    viewNavigationIndex.current = 0;
    setNavigationHistoryPosition(0);
    setActiveView(view);
  };

  useEffect(() => {
    if (userRole !== "visitor") {
      setIsRegistrationNoticeVisible(false);
      return;
    }

    const remainingTime =
      registrationNoticeStartedAt +
      REGISTRATION_NOTICE_DURATION_MS -
      Date.now();
    if (remainingTime <= 0) {
      setIsRegistrationNoticeVisible(false);
      return;
    }

    const timeoutId = window.setTimeout(
      () => setIsRegistrationNoticeVisible(false),
      remainingTime,
    );
    return () => window.clearTimeout(timeoutId);
  }, [registrationNoticeStartedAt, userRole]);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [adminPanelSection, setAdminPanelSection] =
    useState<AdminPanelSection>("inventory");
  const [adminMenuFocusDescription, setAdminMenuFocusDescription] = useState<
    string | null
  >(null);

  // Domain Data State (Client-Side Simulated)
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => loadStoredCart());
  const [orders, setOrders] = useState<SimulatedOrder[]>(() =>
    loadStoredOrders(),
  );
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    loadStoredTickets(),
  );
  const [users, setUsers] = useState<UserAccount[]>(() => loadStoredUsers());
  const [usersError, setUsersError] = useState<string | null>(null);
  const [productRequests, setProductRequests] = useState<
    CustomProductRequest[]
  >(() => loadProductRequests());
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>(() =>
    loadSuggestions(),
  );

  // Active Selected Entity
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null,
  );
  const [activeOrder, setActiveOrder] = useState<SimulatedOrder | null>(() => {
    const loaded = loadStoredOrders();
    return loaded.length > 0 ? loaded[0] : initialMockOrders[0];
  });

  const loadCatalogProducts = useCallback(async (signal?: AbortSignal) => {
    setIsProductsLoading(true);
    setProductsError(null);

    try {
      const loadedProducts = await fetchProducts(signal);
      setProducts(loadedProducts);
      setSelectedProduct((current) =>
        loadedProducts.find((product) => product.id === current?.id) ??
        loadedProducts[0] ??
        null,
      );
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
      console.error("Failed to load catalog products:", error);
      setProducts(INITIAL_PRODUCTS);
      setSelectedProduct((current) =>
        INITIAL_PRODUCTS.find((product) => product.id === current?.id) ??
        INITIAL_PRODUCTS[0] ??
        null,
      );
      setProductsError(
        `${error instanceof Error ? error.message : "No se pudo cargar el catálogo."} Se muestra el catálogo local de respaldo mientras se restablece el servicio.`,
      );
    } finally {
      if (!signal?.aborted) {
        setIsProductsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthResolved || httpErrorStatus !== null) return;

    const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
    const publicViews: Record<string, ActiveView> = {
      "/": "catalog",
      "/catalog": "catalog",
      "/catalogo": "catalog",
      "/login": "login",
      "/register": "register",
      "/registro": "register",
    };
    const protectedViews: Record<
      string,
      { view: ActiveView; role: "user" | "admin" }
    > = {
      "/admin": { view: "admin", role: "admin" },
      "/admin/analytics": { view: "admin", role: "admin" },
      "/admin/ventas": { view: "admin", role: "admin" },
      "/ventas": { view: "admin", role: "admin" },
      "/pedidos": { view: "order_history", role: "user" },
      "/orders": { view: "order_history", role: "user" },
      "/perfil": { view: "profile", role: "user" },
      "/profile": { view: "profile", role: "user" },
      "/checkout": { view: "checkout", role: "user" },
    };

    const publicView = publicViews[pathname];
    if (publicView) {
      if (publicView !== "catalog") setActiveView(publicView);
      return;
    }

    const protectedRoute =
      protectedViews[pathname] ??
      (pathname.startsWith("/admin/")
        ? { view: "admin" as const, role: "admin" as const }
        : undefined);
    if (protectedRoute) {
      if (!currentUser) {
        pendingProtectedView.current = protectedRoute.view;
        setActiveView("login");
        return;
      }
      if (currentUser.role !== protectedRoute.role) {
        setHttpErrorStatus(403);
        return;
      }
      setActiveView(protectedRoute.view);
      return;
    }

    setHttpErrorStatus(404);
  }, [currentUser, httpErrorStatus, isAuthResolved]);

  useEffect(() => {
    const controller = new AbortController();
    void loadCatalogProducts(controller.signal);
    return () => controller.abort();
  }, [loadCatalogProducts]);

  // Accessibility State (WCAG 2.1 AAA)
  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings>({
      contrastMode: "light_mode",
      fontSize: 100,
      reduceMotion: false,
      opticalFlashes: true,
      visualCaptions: true,
      highContrast: false,
      flashIntensity: "standard",
    });

  // Optical Flash Trigger
  const [isFlashActive, setIsFlashActive] = useState(false);

  // === GLOBAL VISUAL TOAST (Sistema de notificaciones globales ===
  const [activeToast, setActiveToast] =
    useState<GlobalToastNotification | null>(null);

  // === MODAL: Authentication Required for Visitors ===
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    actionDesc: string;
  }>({
    isOpen: false,
    actionDesc: "",
  });
  const resumeCheckoutAfterAuthentication = useRef(false);

  // === MODAL: Product Request (Bodega) ===
  const [isProductRequestOpen, setIsProductRequestOpen] = useState(false);

  // === MODAL: Suggestions Mailbox ===
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // Synchronize Root HTML & Body theme classes for 100% viewport coverage
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove("theme-dark", "theme-light", "theme-high-contrast");
    body.classList.remove("theme-dark", "theme-light", "theme-high-contrast");

    const activeTheme =
      accessibilitySettings.contrastMode === "light_mode"
        ? "theme-light"
        : accessibilitySettings.contrastMode === "high_contrast"
          ? "theme-high-contrast"
          : "theme-dark";

    root.classList.add(activeTheme);
    body.classList.add(activeTheme);

    const colorTokens = getAdaptiveColorTokens(
      accessibilitySettings.contrastMode,
    );
    for (const [property, value] of Object.entries(colorTokens)) {
      root.style.setProperty(property, value);
    }
  }, [accessibilitySettings.contrastMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * (clampFontScale(accessibilitySettings.fontSize) / 100)}px`;
  }, [accessibilitySettings.fontSize]);

  useEffect(() => {
    function syncSupportTickets(event: StorageEvent) {
      if (event.key !== SUPPORT_TICKETS_KEY) return;
      if (!event.newValue) {
        setTickets([]);
        return;
      }
      try {
        const updatedTickets = JSON.parse(event.newValue) as SupportTicket[];
        if (Array.isArray(updatedTickets)) setTickets(updatedTickets);
      } catch {
        // Ignore invalid ticket snapshots from another tab.
      }
    }

    window.addEventListener("storage", syncSupportTickets);
    return () => window.removeEventListener("storage", syncSupportTickets);
  }, []);

  useEffect(() => {
    const viewChanged = previousInterpreterViewRef.current !== activeView;
    previousInterpreterViewRef.current = activeView;

    if (activeView === "welcome" || (isWelcomePlayback && !viewChanged))
      return;

    if (isAdminDropdownOpen) {
      const focusCaption = adminMenuFocusDescription
        ? `Menú administrativo: ${adminMenuFocusDescription}`
        : "Opciones del menú de gestión administrativa";
      setInterpreterVideo(
        import.meta.env.VITE_LSC_ADMIN_MENU_VIDEO ??
          signLanguageVideoSources.admin ??
          import.meta.env.VITE_LSC_DEFAULT_VIDEO,
        focusCaption,
      );
      return;
    }

    if (
      isProductPlayback &&
      (!viewChanged || activeView === "product_detail")
    ) {
      return;
    }

    const routeCaption =
      activeView === "order_confirmation" && activeOrder
        ? `Confirmación del pedido ${activeOrder.orderId}. Total: ${formatCOP(activeOrder.total)}.`
        : (signLanguageCaptions[activeView] ?? "Navegación por la tienda");

    setInterpreterVideo(
      signLanguageVideoSources[activeView] ??
        import.meta.env.VITE_LSC_DEFAULT_VIDEO,
      routeCaption,
    );
  }, [
    activeView,
    activeOrder,
    adminMenuFocusDescription,
    isAdminDropdownOpen,
    isWelcomePlayback,
    isProductPlayback,
    setInterpreterVideo,
  ]);

  useEffect(() => {
    let isCurrent = true;
    void fetchCurrentAccount()
      .then((user) => {
        if (!isCurrent || !user) return;
        setCurrentUser(user);
        setUserRole(user.role);
        resetActiveViewHistory(user.role === "admin" ? "admin" : "catalog");
      })
      .catch((error: unknown) => {
        console.error("Unable to restore authentication session:", error);
      })
      .finally(() => {
        if (isCurrent) setIsAuthResolved(true);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setOrdersLoading(false);
      setOrdersError(null);
      return;
    }

    let isCurrent = true;
    setOrders([]);
    setOrdersLoading(true);
    setOrdersError(null);
    const loadOrders =
      currentUser.role === "admin" ? fetchAllOrders : fetchMyOrders;
    void loadOrders()
      .then((loadedOrders) => {
        if (!isCurrent) return;
        setOrders(loadedOrders);
        saveStoredOrders(loadedOrders);
      })
      .catch((loadError: unknown) => {
        if (!isCurrent) return;
        console.error("Unable to load authenticated orders:", loadError);
        setOrdersError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los pedidos desde el servidor.",
        );
      })
      .finally(() => {
        if (isCurrent) setOrdersLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (
      !currentUser ||
      (activeView !== "order_history" && activeView !== "order_confirmation")
    ) {
      return;
    }

    let isCurrent = true;
    setOrdersLoading(true);
    setOrdersError(null);
    const loadOrders =
      currentUser.role === "admin" ? fetchAllOrders : fetchMyOrders;
    void loadOrders()
      .then((loadedOrders) => {
        if (!isCurrent) return;
        setOrders(loadedOrders);
        saveStoredOrders(loadedOrders);
        if (activeView === "order_confirmation" && activeOrder) {
          const refreshedOrder = loadedOrders.find(
            (order) => order.orderId === activeOrder.orderId,
          );
          if (refreshedOrder) setActiveOrder(refreshedOrder);
        }
      })
      .catch((loadError: unknown) => {
        if (!isCurrent) return;
        console.error("Unable to refresh order status:", loadError);
        setOrdersError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo actualizar el estado del pedido.",
        );
      })
      .finally(() => {
        if (isCurrent) setOrdersLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [activeView, currentUser, activeOrder?.orderId]);

  useEffect(() => {
    if (userRole !== "admin") return;

    let isCurrent = true;
    setUsersError(null);
    void fetchManagedUsers()
      .then((managedUsers) => {
        if (!isCurrent) return;
        setUsers(managedUsers);
        setUsersError(null);
        saveStoredUsers(managedUsers);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        console.error("Unable to load managed users:", error);
        setUsersError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los usuarios desde la base de datos.",
        );
        setUsers(currentUser ? [currentUser] : []);
      });

    return () => {
      isCurrent = false;
    };
  }, [currentUser, userRole]);

  const triggerFlash = useCallback(() => {
    if (accessibilitySettings.flashIntensity === "off") return;
    setIsFlashActive(true);
  }, [accessibilitySettings.flashIntensity]);

  // Global toast dispatcher
  const showToast = useCallback(
    (toast: Omit<GlobalToastNotification, "id">) => {
      setActiveToast({ ...toast, id: `toast-${Date.now()}` });
      triggerFlash();
    },
    [triggerFlash],
  );

  const handleSessionExpiration = useCallback(
    (message: string) => {
      if (sessionExpirationHandled.current) return;
      sessionExpirationHandled.current = true;
      pendingProtectedView.current = null;
      setCurrentUser(null);
      setUserRole("visitor");
      resetActiveViewHistory("login");
      setIsProductRequestOpen(false);
      setIsSuggestionsOpen(false);
      showToast({
        type: "info",
        title: "Sesión cerrada",
        message,
      });
    },
    [showToast],
  );

  const expireSessionForInactivity = useCallback(() => {
    void logoutAccount().catch((error: unknown) => {
      console.error("Unable to invalidate inactive authentication session:", error);
    });
    handleSessionExpiration(
      "Tu sesión se ha cerrado por 10 minutos de inactividad por tu seguridad.",
    );
  }, [handleSessionExpiration]);

  const renewSessionForActivity = useCallback(() => {
    void renewAuthenticatedSession().catch((error: unknown) => {
      console.error("Unable to renew active authentication session:", error);
    });
  }, []);

  useAutoLogout(
    currentUser !== null,
    expireSessionForInactivity,
    renewSessionForActivity,
  );

  useEffect(() => {
    const handleUnauthorizedSession = (event: Event) => {
      const status =
        event instanceof CustomEvent
          ? (event.detail as ApiAccessDeniedEventDetail | undefined)?.status
          : undefined;

      if (status === undefined) return;
      setHttpErrorStatus(status);

      if (status === 401 && currentUser) {
        void logoutAccount().catch((error: unknown) => {
          console.error("Unable to clear an expired server session:", error);
        });
        handleSessionExpiration(
          "Tu sesión expiró o dejó de ser válida. Inicia sesión nuevamente para continuar.",
        );
      }
    };

    window.addEventListener(
      SESSION_UNAUTHORIZED_EVENT,
      handleUnauthorizedSession,
    );
    return () => {
      window.removeEventListener(
        SESSION_UNAUTHORIZED_EVENT,
        handleUnauthorizedSession,
      );
    };
  }, [currentUser, handleSessionExpiration]);

  const updateAccessibilitySettings = useCallback(
    (settings: Partial<AccessibilitySettings>) => {
      setAccessibilitySettings((previous) => ({
        ...previous,
        ...settings,
        fontSize: clampFontScale(settings.fontSize ?? previous.fontSize),
      }));
    },
    [],
  );

  const handleNavigate = (
    view: ActiveView,
    adminSection?: AdminPanelSection,
    recordInHistory = true,
  ) => {
    const navigateToView = (nextView: ActiveView) => {
      if (recordInHistory) {
        setActiveViewWithHistory(nextView);
      } else {
        setActiveView(nextView);
      }
    };

    const adminOnlyView = view === "admin";
    const customerOnlyView = [
      "order_history",
      "checkout",
      "order_confirmation",
      "profile",
      "auth_profile",
      "support",
      "contact_support",
    ].includes(view);

    if (adminOnlyView || customerOnlyView) {
      if (!isAuthResolved) return;

      if (!currentUser) {
        pendingProtectedView.current = view;
        resumeCheckoutAfterAuthentication.current = view === "checkout";
        navigateToView("login");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const allowed =
        adminOnlyView
          ? currentUser.role === "admin"
          : currentUser.role === "user";
      if (!allowed) {
        pendingProtectedView.current = null;
        setHttpErrorStatus(403);
        navigateToView(currentUser.role === "admin" ? "admin" : "catalog");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (view === "admin" && adminSection) {
      setAdminPanelSection(adminSection);
    }

    if (view === "welcome" && userRole === "visitor") {
      setRegistrationNoticeStartedAt(Date.now());
      setIsRegistrationNoticeVisible(true);
    }

    if (view === "admin_login") {
      navigateToView("login");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (view === "welcome") {
      navigateToView(view);
      playWelcomeVideo("Bienvenida a SoftTech Market");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigateToView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moveThroughViewHistory = (direction: -1 | 1) => {
    const nextIndex = viewNavigationIndex.current + direction;
    const nextView = viewNavigationHistory.current[nextIndex];
    if (!nextView) return;

    viewNavigationIndex.current = nextIndex;
    setNavigationHistoryPosition(nextIndex);
    handleNavigate(nextView, undefined, false);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      saveStoredCart(updated);
      return updated;
    });

    showToast({
      type: "cart_add",
      title: "✅ Producto Agregado al Carrito",
      message: `"${product.name}" fue añadido exitosamente a tu carrito de compras.`,
      product,
      actionLabel: "Ver Carrito",
      onAction: () => setActiveViewWithHistory("cart"),
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item,
      );
      saveStoredCart(updated);
      return updated;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const removedItem = cart.find((i) => i.product.id === productId);
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      saveStoredCart(updated);
      return updated;
    });
    if (removedItem) {
      showToast({
        type: "cart_remove",
        title: "🗑️ Producto Eliminado del Carrito",
        message: `"${removedItem.product.name}" fue removido de tu carrito.`,
        product: removedItem.product,
      });
    }
  };

  const handleClearCart = () => {
    setCart([]);
    saveStoredCart([]);
    showToast({
      type: "cart_remove",
      title: "🗑️ Carrito Vaciado",
      message: "Se eliminaron todos los productos del carrito de compras.",
    });
  };

  // Order operations
  const handleOrderCompleted = (newOrder: SimulatedOrder): void => {
    const persistedOrder: SimulatedOrder = {
      ...newOrder,
    };
    setOrders((prev) => {
      const updated = [
        persistedOrder,
        ...prev.filter((order) => order.orderId !== persistedOrder.orderId),
      ];
      saveStoredOrders(updated);
      return updated;
    });
    setActiveOrder(persistedOrder);
    setCart([]);
    saveStoredCart([]);
    setActiveViewWithHistory("order_confirmation");
    showToast({
      type: "order_success",
      title: "🎉 ¡Compra Confirmada con Éxito!",
      message: "Tu pedido fue registrado y está en proceso de preparación.",
      orderId: persistedOrder.orderId,
      actionLabel: "Ver Confirmación",
      onAction: () => setActiveViewWithHistory("order_confirmation"),
    });
  };

  // Admin operations
  const saveProductInState = (savedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((product) => product.id === savedProduct.id);
      return exists
        ? prev.map((product) =>
            product.id === savedProduct.id ? savedProduct : product,
          )
        : [savedProduct, ...prev];
    });
    setSelectedProduct((current) =>
      current?.id === savedProduct.id ? savedProduct : current,
    );
  };

  const handleAddProduct = async (newProd: ProductWriteInput) => {
    const savedProduct = await createProduct(newProd);
    saveProductInState(savedProduct);
    triggerFlash();
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    const savedProduct = await updateProduct(updatedProd);
    saveProductInState(savedProduct);
    triggerFlash();
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: SimulatedOrder["status"],
  ): Promise<void> => {
    return updateOrderStatus(orderId, newStatus).then(() => {
      setOrders((prev) => {
        const updated = prev.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order,
        );
        saveStoredOrders(updated);
        return updated;
      });
      setActiveOrder((order) =>
        order?.orderId === orderId ? { ...order, status: newStatus } : order,
      );
    });
  };

  const handleToggleProductStatus = async (
    productId: string,
    active: boolean,
  ) => {
    const savedProduct = await setProductActive(productId, active);
    saveProductInState(savedProduct);
    triggerFlash();
  };

  const handleToggleUserBlock = async (userId: string, active: boolean) => {
    const updatedUser = await setManagedUserActive(userId, active);
    setUsers((prev) => replaceUserInStorage(prev, updatedUser));
    triggerFlash();
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteManagedUser(userId);
    setUsers((prev) => {
      const updated = prev.filter((user) => user.id !== userId);
      saveStoredUsers(updated);
      return updated;
    });
    triggerFlash();
  };

  // Auth Operations
  const applyAuthenticatedUser = (user: UserAccount) => {
    sessionExpirationHandled.current = false;
    setUsers((prev) => appendUserToStorage(prev, user));
    setCurrentUser(user);
    setUserRole(user.role);
    const shouldResumeCheckout =
      resumeCheckoutAfterAuthentication.current &&
      user.role === "user" &&
      cart.length > 0;
    resumeCheckoutAfterAuthentication.current = false;
    const intendedView = pendingProtectedView.current;
    pendingProtectedView.current = null;
    const intendedViewAllowed =
      intendedView !== null &&
      (intendedView === "admin"
        ? user.role === "admin"
        : user.role === "user");
    const nextView = intendedViewAllowed
      ? intendedView
      : user.role === "admin"
        ? "admin"
        : shouldResumeCheckout
          ? "checkout"
          : "catalog";
    resetActiveViewHistory(
      nextView,
    );
    if (intendedView && !intendedViewAllowed) {
      showToast({
        type: "info",
        title: "Acceso restringido",
        message:
          "Tu cuenta inició sesión, pero no tiene permisos para la pantalla solicitada.",
      });
    }
  };

  const handleRegister = async (account: RegisterAccountInput) => {
    const user = await registerAccount(account);
    applyAuthenticatedUser(user);
    showToast({
      type: "info",
      title: "🎉 ¡Cuenta Creada Exitosamente!",
      message: `Bienvenido/a ${user.name}. Ya puedes comprar, seguir pedidos y usar el buzón.`,
    });
    return user;
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers((prev) => replaceUserInStorage(prev, updatedUser));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    triggerFlash();
  };

  const handleLogin = async (email: string, password: string) => {
    const user = await loginAccount(email, password);
    applyAuthenticatedUser(user);
    showToast({
      type: "info",
      title: `✅ Sesión Iniciada — ${user.role === "admin" ? "Administrador" : "Usuario Registrado"}`,
      message: `Bienvenido/a de vuelta, ${user.name}. Tienes acceso completo a la plataforma.`,
    });
    return user;
  };

  const handleLogout = async () => {
    try {
      await logoutAccount();
      pendingProtectedView.current = null;
      setCurrentUser(null);
      setUserRole("visitor");
      resetActiveViewHistory("login");
      showToast({
        type: "info",
        title: "Sesión Cerrada",
        message: "Has cerrado tu sesión correctamente. Vuelve cuando quieras.",
      });
    } catch (error) {
      console.error("Unable to close authentication session:", error);
      showToast({
        type: "info",
        title: "No se pudo cerrar la sesión",
        message:
          error instanceof Error
            ? error.message
            : "Inténtalo de nuevo cuando la conexión esté disponible.",
      });
    }
  };

  const handleHttpErrorHome = () => {
    pendingProtectedView.current = null;
    setHttpErrorStatus(null);
    window.history.replaceState(null, "", "/");
    resetActiveViewHistory("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const retryCurrentPage = () => window.location.reload();

  // Product Selection
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    triggerLscVideo(
      product.lscVideoUrl,
      `Señas del producto: ${product.name}`,
    );
    setActiveViewWithHistory("product_detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Order Selection
  const handleSelectOrder = (order: SimulatedOrder) => {
    setActiveOrder(order);
    setActiveViewWithHistory("order_confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Support ticket creation
  const handleCreateTicket = (ticket: SupportTicket) => {
    setTickets((prev) => {
      const updated = [ticket, ...prev];
      saveStoredTickets(updated);
      return updated;
    });
  };

  const handleAppendSupportMessage = (
    ticketId: string,
    message: ChatMessage,
  ) => {
    setTickets((prev) => {
      const updated = prev.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;

        const conversation = ticket.conversation?.length
          ? ticket.conversation
          : [
              {
                id: `${ticket.id}-legacy-user`,
                sender: "user" as const,
                senderName: ticket.userName ?? "Cliente",
                text: ticket.message,
                timestamp: ticket.date,
                isRead: true,
              },
              ...(ticket.response
                ? [
                    {
                      id: `${ticket.id}-legacy-agent`,
                      sender: "agent" as const,
                      senderName: "Soporte SoftTech",
                      text: ticket.response,
                      timestamp: "Respuesta registrada",
                      isRead: true,
                    },
                  ]
                : []),
            ];

        const status: SupportTicket["status"] =
          message.sender === "agent" ? "resuelto" : "en_revision";

        return {
          ...ticket,
          conversation: [...conversation, message],
          response: message.sender === "agent" ? message.text : ticket.response,
          status,
        };
      });
      saveStoredTickets(updated);
      return updated;
    });
  };

  const handleSupportTyping = (ticketId: string, isTyping: boolean) => {
    setTickets((prev) => {
      const updated = prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, agentTyping: isTyping } : ticket,
      );
      saveStoredTickets(updated);
      return updated;
    });
  };

  // Product request (bodega) submission
  const handleSubmitProductRequest = (request: CustomProductRequest) => {
    setProductRequests((prev) => {
      const updated = [request, ...prev];
      saveProductRequests(updated);
      return updated;
    });
    showToast({
      type: "product_request",
      title: "📦 Solicitud Enviada a Bodega",
      message: `Tu solicitud para "${request.productName}" fue registrada. Te notificaremos por escrito cuando esté disponible.`,
    });
  };

  // Suggestion / mailbox submission
  const handleSubmitSuggestion = (suggestion: UserSuggestion) => {
    setSuggestions((prev) => {
      const updated = [suggestion, ...prev];
      saveSuggestions(updated);
      return updated;
    });
    showToast({
      type: "suggestion_sent",
      title: "💌 Mensaje Enviado al Buzón",
      message:
        "Tu sugerencia o pedido especial fue registrado y será atendido por nuestros asesores certificados.",
    });
  };

  // Compute Root Theme and Contrast Classes
  const themeClass =
    accessibilitySettings.contrastMode === "light_mode"
      ? "theme-light text-[#0f172a]"
      : accessibilitySettings.contrastMode === "high_contrast"
        ? "theme-high-contrast text-white"
        : "theme-dark text-[#f1f5f9]";

  const contrastClass = accessibilitySettings.highContrast
    ? "border-yellow-400"
    : "";

  return (
    <div
      className={`app-global-background min-h-screen flex flex-col font-sans transition-colors duration-200 ${themeClass} ${contrastClass}`}
    >
      {httpErrorStatus !== null && (
        <ErrorPage
          status={httpErrorStatus}
          onHome={handleHttpErrorHome}
          onRetry={retryCurrentPage}
        />
      )}

      {/* Optical Beacon (Sensory Flash) */}
      <OpticalFlash
        active={isFlashActive}
        onComplete={() => setIsFlashActive(false)}
      />

      {/* Alertas Visuales Accesibles Flotantes (useToast Hook) */}
      <ToastNotification />

      {/* === GLOBAL VISUAL TOAST (Sistema de notificaciones prominentes) === */}
      <GlobalVisualToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
      />

      {/* === MODAL: Solicitud de Producto a Bodega === */}
      <ProductRequestModal
        isOpen={isProductRequestOpen}
        onClose={() => setIsProductRequestOpen(false)}
        userRole={userRole}
        userEmail={currentUser?.email}
        onSubmitRequest={handleSubmitProductRequest}
        onTriggerFlash={triggerFlash}
      />

      {/* === MODAL: Buzón de Sugerencias (solo usuarios registrados) === */}
      <SuggestionsMailboxModal
        isOpen={isSuggestionsOpen}
        onClose={() => setIsSuggestionsOpen(false)}
        currentUser={currentUser}
        suggestions={suggestions}
        onSubmitSuggestion={handleSubmitSuggestion}
        onTriggerFlash={triggerFlash}
      />

      <NavigationChrome
        currentView={activeView}
        userRole={userRole}
        isAdminAuthenticated={currentUser?.role === "admin"}
        canGoBack={navigationHistoryPosition > 0}
        canGoForward={
          navigationHistoryPosition < viewNavigationHistory.current.length - 1
        }
        onNavigate={handleNavigate}
        onNavigateBack={() => moveThroughViewHistory(-1)}
        onNavigateForward={() => moveThroughViewHistory(1)}
        onLogout={handleLogout}
        onRequestProduct={() => {
          setIsProductRequestOpen(true);
          triggerFlash();
        }}
      />

      {/* 1. PORTAL DE ACCESO INDEPENDIENTE (Aislado de la Tienda) */}
      {!isAuthResolved ? (
        <main
          className="flex min-h-[60vh] flex-1 items-center justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <p className="rounded-xl border border-slate-300 bg-white px-6 py-4 text-center font-semibold text-slate-800 shadow-sm">
            Verificando tu sesión y permisos...
          </p>
        </main>
      ) : activeView === "login" ||
      activeView === "auth_login" ||
      activeView === "register" ||
      activeView === "auth_register" ||
      activeView === "forgot_password" ||
      activeView === "auth_forgot" ||
      activeView === "admin_login" ? (
        <IndependentAuthPortal
          initialTab={
            activeView === "register" || activeView === "auth_register"
              ? "register"
              : activeView === "forgot_password" || activeView === "auth_forgot"
                ? "forgot"
                : "user"
          }
          onLogin={handleLogin}
          onRegister={handleRegister}
          onContinueAsGuest={() => {
            resumeCheckoutAfterAuthentication.current = false;
            pendingProtectedView.current = null;
            setCurrentUser(null);
            setUserRole("visitor");
            handleNavigate("catalog");
          }}
          onTriggerFlash={triggerFlash}
        />
      ) : (
        <>
          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-3 pb-10 sm:px-6 lg:px-8">
            {(activeView === "welcome" || activeView === "catalog") && (
              <>
                <WelcomeView
                  onNavigate={handleNavigate}
                  userRole={userRole}
                  showRegistrationNotice={
                    isRegistrationNoticeVisible && userRole === "visitor"
                  }
                />
                <CatalogView
                  products={products}
                  productsLoading={isProductsLoading}
                  productsError={productsError}
                  onRetryProducts={() => void loadCatalogProducts()}
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={handleAddToCart}
                  userRole={userRole}
                  onTriggerFlash={triggerFlash}
                  onNavigate={handleNavigate}
                />
              </>
            )}

            {/* Product Detail View */}
            {activeView === "product_detail" && selectedProduct && (
              <ProductDetailView
                product={selectedProduct}
                onBack={() => handleNavigate("catalog")}
                onAddToCart={handleAddToCart}
                onDirectCheckout={(prod, qty) => {
                  handleAddToCart(prod, qty);
                  handleNavigate("checkout");
                }}
                userRole={userRole}
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Cart View */}
            {activeView === "cart" && (
              <CartView
                cart={cart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onNavigateToCatalog={() => handleNavigate("catalog")}
                onProceedToCheckout={() => handleNavigate("checkout")}
                userRole={userRole}
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Pasarela de Pagos 100% Escrita */}
            {activeView === "checkout" && (
              <AccessibleWrittenCheckout
                cart={cart}
                currentUser={currentUser}
                onBackToCart={() => handleNavigate("cart")}
                onPaymentVerified={handleOrderCompleted}
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Order Confirmation View */}
            {activeView === "order_confirmation" && activeOrder && (
              <OrderConfirmationView
                order={activeOrder}
                isRegisteredCustomer={userRole === "user"}
                onNavigate={handleNavigate}
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Order History View */}
            {activeView === "order_history" && (
              <OrderHistoryView
                orders={orders}
                currentUser={currentUser}
                userRole={userRole}
                isLoading={ordersLoading}
                loadError={ordersError}
                onRetry={() => {
                  if (!currentUser) return;
                  setOrdersLoading(true);
                  setOrdersError(null);
                  const loadOrders =
                    currentUser.role === "admin" ? fetchAllOrders : fetchMyOrders;
                  void loadOrders()
                    .then((loadedOrders) => {
                      setOrders(loadedOrders);
                      saveStoredOrders(loadedOrders);
                    })
                    .catch((loadError: unknown) => {
                      console.error("Unable to retry loading orders:", loadError);
                      setOrdersError(
                        loadError instanceof Error
                          ? loadError.message
                          : "No se pudieron cargar los pedidos desde el servidor.",
                      );
                    })
                    .finally(() => setOrdersLoading(false));
                }}
                onSelectOrder={handleSelectOrder}
                onNavigate={handleNavigate}
                onRequestAuthModal={(desc) =>
                  setAuthModalState({
                    isOpen: true,
                    actionDesc: desc ?? "consultar tu historial de pedidos",
                  })
                }
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Admin Panel View */}
            {activeView === "admin" && userRole === "admin" && currentUser && (
              <AdminPanelView
                products={products}
                orders={orders}
                users={users}
                usersError={usersError}
                currentUser={currentUser}
                userRole={userRole}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onToggleProductStatus={handleToggleProductStatus}
                onToggleUserBlock={handleToggleUserBlock}
                onDeleteUser={handleDeleteUser}
                onSelectOrder={handleSelectOrder}
                initialSection={adminPanelSection}
                onNavigate={handleNavigate}
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Accessibility Center View */}
            {activeView === "accessibility" && (
              <AccessibilityCenterView
                settings={accessibilitySettings}
                onUpdateSettings={(newSt) =>
                  updateAccessibilitySettings(newSt)
                }
                glossary={initialGlossary}
                onNavigate={handleNavigate}
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Contact & Written Support View */}
            {(activeView === "contact_support" || activeView === "support") && (
              <WrittenSupportChat
                tickets={tickets}
                currentUser={currentUser}
                userRole={userRole}
                onCreateTicket={handleCreateTicket}
                onAppendMessage={handleAppendSupportMessage}
                onUpdateAdminTyping={handleSupportTyping}
                onTriggerFlash={triggerFlash}
              />
            )}

            {/* Auth Views: Register, Forgot Password, Profile */}
            {(activeView === "profile" || activeView === "auth_profile") && (
              <AuthViews
                initialTab="profile"
                currentUser={currentUser}
                userRole={userRole}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onRegister={handleRegister}
                onUpdateUser={handleUpdateUser}
                onNavigate={handleNavigate}
                onTriggerFlash={triggerFlash}
              />
            )}
          </main>

          {/* Main Footer */}
          <Footer onNavigate={handleNavigate} userRole={userRole} />
        </>
      )}

      {isAuthResolved && (
        <AdminDropdown
          currentUser={currentUser}
          currentView={activeView}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onTriggerFlash={triggerFlash}
          onMenuOpenChange={setIsAdminDropdownOpen}
          onMenuFocusChange={setAdminMenuFocusDescription}
        />
      )}

      <SignLanguageInterpreter isAdmin={userRole === "admin"} />

      {/* ============================================================
          VISITOR AUTH NOTICE MODAL
          Aparece cuando un invitado intenta hacer una acción de compra
      ============================================================ */}
      <VisualNoticeModal
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState({ isOpen: false, actionDesc: "" })}
        title={
          authModalState.actionDesc === "finalizar tu compra"
            ? "Regístrate para finalizar tu compra"
            : "Registro o Inicio de Sesión Requerido"
        }
        type="warning"
        primaryAction={{
          label: "Registrarme como usuario",
          onClick: () => {
            setAuthModalState({ isOpen: false, actionDesc: "" });
            setActiveViewWithHistory("register");
            triggerFlash();
          },
          variant: "primary",
        }}
        secondaryAction={{
          label: "Iniciar Sesión",
          onClick: () => {
            setAuthModalState({ isOpen: false, actionDesc: "" });
            setActiveViewWithHistory("login");
            triggerFlash();
          },
        }}
      >
        <div className="space-y-2">
          {authModalState.actionDesc === "finalizar tu compra" ? (
            <>
              <p className="font-bold text-white">
                Para finalizar la compra debes registrarte como usuario.
              </p>
              <p>
                Si ya tienes una cuenta, inicia sesión. Los productos y
                cantidades de tu carrito se conservarán y continuarás con el
                pago al completar el acceso.
              </p>
            </>
          ) : (
            <>
              <p>
                Como <strong className="text-white font-bold">Visitante</strong>{" "}
                puedes explorar libremente el catálogo, agregar productos al
                carrito y conservar tu selección.
              </p>
              <p>
                Para{" "}
                <strong className="text-[#00e3fd]">
                  {authModalState.actionDesc}
                </strong>
                , necesitas registrarte o iniciar sesión para vincular tu canal
                SMS de despacho seguro.
              </p>
            </>
          )}
        </div>
      </VisualNoticeModal>

      <FloatingAccessibilityWidget
        currentView={activeView}
        settings={accessibilitySettings}
        onUpdateSettings={(newSettings) =>
          updateAccessibilitySettings(newSettings)
        }
        onNavigate={handleNavigate}
        onTriggerFlash={triggerFlash}
      />

      <button
        type="button"
        onClick={() => handleNavigate("cart")}
        aria-label={`Abrir carrito, ${cart.reduce((total, item) => total + item.quantity, 0)} productos`}
        className="premium-floating-cta cart-floating-trigger fixed bottom-[5.75rem] right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-white transition duration-200 hover:scale-105 active:scale-95 motion-reduce:animate-none"
      >
        <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        <span className="cart-floating-label">Carrito</span>
        <span className="cart-floating-count absolute -right-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-extrabold">
          {cart.reduce((total, item) => total + item.quantity, 0)}
        </span>
      </button>
    </div>
  );
}
