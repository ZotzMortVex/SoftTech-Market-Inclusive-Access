import React, { useState } from 'react';
import { Product, UserRole } from '../../types';
import { 
  ShieldCheck, 
  Boxes, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  Search, 
  X, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface ProductCertificationManagerProps {
  products: Product[];
  userRole: UserRole;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onToggleProductStatus: (productId: string, active: boolean) => Promise<void>;
  onTriggerFlash: () => void;
}

export function ProductCertificationManager({
  products,
  userRole,
  onAddProduct,
  onUpdateProduct,
  onToggleProductStatus,
  onTriggerFlash
}: ProductCertificationManagerProps) {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: 'Laptops',
    brand: '',
    price: 0,
    originalPrice: 0,
    stockCount: 10,
    description: '',
    visualAlert: 'Bisel óptico LED y pantalla antirreflejo',
    visualCert: 'WCAG 2.1 AAA - Cero Audio',
    active: true
  });

  // Toggle de Certificación Visual
  const [isVisuallyCertified, setIsVisuallyCertified] = useState(true);

  // Estados de error ergonómico
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtrado de productos para la tabla administrativa
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartCreate = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      code: `CUD-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Laptops',
      brand: 'SoftTech Eco',
      price: 2500000,
      originalPrice: 2800000,
      stockCount: 15,
      description: '',
      visualAlert: 'Notificación por bisel luminoso LED RGB personalizable',
      visualCert: 'WCAG 2.1 AAA - Cero Audio',
      active: true
    });
    setIsVisuallyCertified(true);
    setIsEditing(true);
    setFormError(null);
    onTriggerFlash();
  };

  const handleStartEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({ ...product });
    setIsVisuallyCertified(product.visualCert.includes('WCAG') || product.visualCert.includes('Cero Audio'));
    setIsEditing(true);
    setFormError(null);
    onTriggerFlash();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name?.trim() || !formData.description?.trim()) {
      setFormError('El nombre del equipo y su descripción textual detallada son obligatorios.');
      onTriggerFlash();
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setFormError('Por favor especifica un precio válido mayor a 0.');
      onTriggerFlash();
      return;
    }

    const finalCert = isVisuallyCertified 
      ? 'Certificado en Accesibilidad Visual Cero Audio (WCAG 2.1 AAA)' 
      : 'Estándar General sin Certificación Lumínica';

    setIsSaving(true);
    try {
      if (selectedProduct) {
        const updated: Product = {
          ...selectedProduct,
          ...formData as Product,
          visualCert: finalCert
        };
        await onUpdateProduct(updated);
        showToast({
          type: 'success',
          title: 'Equipo Actualizado con Éxito',
          message: `Los cambios para "${updated.name}" y su estado de certificación fueron guardados en MySQL.`,
          badge: 'Admin Panel'
        });
      } else {
        const stockCount = Number(formData.stockCount || 0);
        const created: Omit<Product, 'id'> = {
          code: formData.code || `CUD-${Math.floor(100 + Math.random() * 900)}`,
          name: formData.name,
          category: formData.category || 'Laptops',
          brand: formData.brand || 'SoftTech Pro',
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice || formData.price),
          inStock: stockCount > 0,
          stockCount,
          active: formData.active ?? true,
          visualCert: finalCert,
          rating: 5.0,
          reviewsCount: 1,
          images: {
            primary: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
            angles: [
              { id: 'a1', label: 'Vista Frontal', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80' }
            ]
          },
          description: formData.description ?? '',
          visualAlert: formData.visualAlert || 'Alertas luminosas en pantalla OLED',
          specs: [
            { label: 'Certificación Visual', value: isVisuallyCertified ? '100% Cero Audio' : 'Estándar' },
            { label: 'Garantía Escrita', value: '24 meses' }
          ],
          inclusiveFeatures: [
            'Sin pitidos ni alarmas sonoras',
            'Notificación de estado por LED frontal',
            'Contraste superior a 10:1 en pantalla'
          ]
        };
        await onAddProduct(created);
        showToast({
          type: 'success',
          title: 'Nuevo Producto Incorporado',
          message: `"${created.name}" fue guardado en MySQL y ${isVisuallyCertified ? 'certificado en accesibilidad visual' : 'publicado en catálogo'}.`
        });
      }

      setIsEditing(false);
      onTriggerFlash();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Inténtalo de nuevo.';
      setFormError(message);
      showToast({
        type: 'error',
        title: 'No se pudo guardar el producto',
        message
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 text-left">
      
      {/* 1. Encabezado del Módulo de Administración en Teal Relajante */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#cbe1dc] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5f2] border border-[#a2d5ca] text-[#134e5e] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#134e5e]" />
              Consola de Gestión Administrativa
            </span>
            <span className="text-xs text-[#526377]">
              {products.length} productos en base de datos
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#113835]">
            Edición & Certificación de Productos
          </h1>
          <p className="text-xs sm:text-sm text-[#4d6c67] max-w-2xl leading-relaxed">
            Control de equipos tecnológicos, especificaciones de soporte óptico y certificación estricta bajo el protocolo Cero Audio (WCAG 2.1 AAA).
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="px-5 py-3 rounded-2xl bg-[#134e5e] hover:bg-[#0e3b47] text-white font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Producto</span>
        </button>
      </div>

      {/* 2. Formulario Ergonómico de Edición / Alta (Se muestra si isEditing está activo) */}
      {isEditing && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#134e5e]/30 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#e2ece9] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e8f5f2] text-[#134e5e] flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-[#113835]">
                {selectedProduct ? `Editando: ${selectedProduct.name}` : 'Registrar Nuevo Equipo Tecnológico'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner de Error Amable si aplica */}
          {formError && (
            <div className="p-4 rounded-2xl bg-[#faeae4] border border-[#e6b9ac] text-[#5d2317] flex items-start gap-3 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-[#9c3f2d] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Campo Requerido:</strong>
                <span>{formError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Código CUD:
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CUD-101"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Nombre del Producto:
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. UltraBook Pro Visual Silent 15"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Categoría:
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
                >
                  <option value="Laptops">Laptops</option>
                  <option value="Monitores">Monitores</option>
                  <option value="Periféricos">Periféricos</option>
                  <option value="Audio Visual">Audio Visual</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Marca:
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Precio (COP):
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Stock Disponible:
                </label>
                <input
                  type="number"
                  value={formData.stockCount}
                  onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                Descripción Textual Detallada (Sin referencias auditivas):
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el funcionamiento del equipo, tipo de pantalla antirreflejo y puertos..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                Alerta Visual Nativa (Característica Óptica):
              </label>
              <input
                type="text"
                value={formData.visualAlert}
                onChange={(e) => setFormData({ ...formData, visualAlert: e.target.value })}
                placeholder="Ej. Anillo LED azul en bisel para avisos de sistema"
                className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
              />
            </div>

            {/* INTERRUPTOR (TOGGLE) DE CERTIFICACIÓN VISUAL CERO AUDIO */}
            <div className="p-4 rounded-2xl bg-[#f0f8f6] border border-[#c4e3dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${isVisuallyCertified ? 'text-[#134e5e]' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold text-[#113835]">
                    Certificación en Accesibilidad Visual Cero Audio
                  </span>
                </div>
                <p className="text-xs text-[#4b6d68] leading-relaxed">
                  Garantiza que el equipo fue auditado bajo las normas WCAG 2.1 AAA: cero dependencia de alertas sonoras y alto descanso visual.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsVisuallyCertified(!isVisuallyCertified)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVisuallyCertified ? 'bg-[#134e5e]' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={isVisuallyCertified}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isVisuallyCertified ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#134e5e] hover:bg-[#0e3b47] text-white font-bold text-xs sm:text-sm shadow-xs transition-all duration-200"
              >
                {isSaving
                  ? 'Guardando...'
                  : selectedProduct
                    ? 'Guardar Cambios'
                    : 'Publicar en Catálogo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Tabla Ergonómica de Productos Certificados */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#dde3ea] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eef2f6] pb-4">
          <h2 className="text-base font-bold text-[#1b2533] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#134e5e]" />
            <span>Inventario Tecnológico y Estado de Certificación</span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6c8095] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nombre..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-xs text-[#1b2432] focus:outline-none focus:ring-2 focus:ring-[#134e5e]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table-compact w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8edf2] text-[#55697f] font-bold">
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Producto</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Precio</th>
                <th className="py-3 px-3">Stock</th>
                <th className="py-3 px-3">Certificación Visual</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f8]">
              {filteredProducts.map((p) => {
                const isCert = p.visualCert.includes('WCAG') || p.visualCert.includes('Cero Audio');
                return (
                  <tr key={p.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#1e4265]">
                      {p.code}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#192330]">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-[#526377]">
                      {p.category}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#1b2533]">
                      {formatCOP(p.price)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                        p.stockCount > 0 ? 'bg-[#eaf5ef] text-[#164e3b]' : 'bg-[#faede8] text-[#7a2c1e]'
                      }`}>
                        {p.stockCount} un.
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isCert ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f5f2] border border-[#a2d5ca] text-[#134e5e] font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-[#134e5e]" />
                          Cero Audio AAA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b] text-[10px]">
                          Estándar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 rounded-lg text-[#134e5e] hover:bg-[#e8f5f2] transition-colors"
                          title="Editar producto y certificación"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const active = !p.active;
                            try {
                              await onToggleProductStatus(p.id, active);
                              showToast({
                                type: 'info',
                                title: 'Estado de Producto Modificado',
                                message: `El producto ${p.code} fue ${active ? 'restaurado' : 'archivado'}.`
                              });
                            } catch (error) {
                              showToast({
                                type: 'error',
                                title: 'No se pudo cambiar el estado',
                                message: error instanceof Error ? error.message : 'Inténtalo de nuevo.'
                              });
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.active ? 'text-[#207a5c] hover:bg-[#eaf5ef]' : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={p.active ? 'Desactivar del catálogo' : 'Activar en catálogo'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
