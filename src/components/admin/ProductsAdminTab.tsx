import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  RefreshCw,
  Copy,
  Check,
  Store,
  DollarSign,
  Star
} from "lucide-react";
import { LazyImage } from "../common/LazyImage";
import { adminFetch } from "../../utils/apiClient";

interface ProductItem {
  id: string;
  slug: string;
  merchantId: string;
  name: string;
  arabicName: string;
  description?: string;
  image?: string;
  productUrl: string;
  affiliateUrl: string;
  price: number;
  oldPrice?: number;
  currency: string;
  discountPercentage?: number;
  availability: string;
  sku?: string;
  brand?: string;
  rating?: number;
  category: string;
  merchant?: any;
}

export const ProductsAdminTab: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    merchantId: "",
    name: "",
    arabicName: "",
    description: "",
    image: "",
    productUrl: "",
    affiliateUrl: "",
    price: "",
    oldPrice: "",
    currency: "SAR",
    brand: "",
    category: "إلكترونيات وجوالات"
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        adminFetch("/api/admin/products")
          .then((r) => (r.ok ? r.json() : { products: [] }))
          .catch(() => ({ products: [] })),
        adminFetch("/api/admin/merchants")
          .then((r) => (r.ok ? r.json() : { merchants: [] }))
          .catch(() => ({ merchants: [] }))
      ]);
      setProducts(pRes?.products || []);
      setMerchants(mRes?.merchants || []);
      if (mRes?.merchants && mRes.merchants.length > 0 && !newProduct.merchantId) {
        setNewProduct((prev) => ({ ...prev, merchantId: mRes.merchants[0].id }));
      }
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({
          merchantId: merchants[0]?.id || "",
          name: "",
          arabicName: "",
          description: "",
          image: "",
          productUrl: "",
          affiliateUrl: "",
          price: "",
          oldPrice: "",
          currency: "SAR",
          brand: "",
          category: "إلكترونيات وجوالات"
        });
        fetchData();
      }
    } catch (e) {
      console.error("Failed to create product:", e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  };

  const handleCopyLink = (path: string, id: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter((p) =>
    (p.arabicName || p.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            كتالوج المنتجات والروابط التتبعية
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدارة المنتجات المستهدفة، توليد روابط التتبع /go/p/:id وحساب العمولات.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم المنتج، الماركة، أو التصنيف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{filteredProducts.length} منتج</span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            جاري تحميل كتالوج المنتجات...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            لا توجد منتجات مسجلة تطابق بحثك.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const merchant = merchants.find((m) => m.id === product.merchantId);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {product.image && (
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <LazyImage
                        src={product.image}
                        alt={product.arabicName}
                        className="w-full h-full object-cover"
                      />
                      {product.discountPercentage && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-600 text-white text-xs font-black rounded-lg shadow-sm">
                          خصم {product.discountPercentage}%
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {merchant?.arabicName || "متجر معتمد"}
                      </span>
                      {product.brand && <span className="font-bold">{product.brand}</span>}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2" title={product.arabicName}>
                      {product.arabicName}
                    </h3>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-black text-slate-900">
                        {product.price.toLocaleString()} {product.currency}
                      </span>
                      {product.oldPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {product.oldPrice.toLocaleString()} {product.currency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyLink(`/go/p/${product.id}`, product.id)}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                  >
                    {copiedId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        تم نسخ الرابط
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        رابط التتبع /go/p
                      </>
                    )}
                  </button>

                  <a
                    href={`/go/p/${product.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl"
                    title="فتح الرابط"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 bg-white hover:bg-red-50 border border-slate-200 text-red-600 rounded-xl transition-all"
                    title="حذف المنتج"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">إضافة منتج تسويق بالعمولة جديد</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المتجر الشريك</label>
                <select
                  value={newProduct.merchantId}
                  onChange={(e) => setNewProduct({ ...newProduct, merchantId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.arabicName} ({m.affiliateNetwork})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنتج بالعربية</label>
                <input
                  type="text"
                  value={newProduct.arabicName}
                  onChange={(e) => setNewProduct({ ...newProduct, arabicName: e.target.value, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="مثال: سماعة آبل إيربودز برو الجيل الثاني"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر الحالي (ريال)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="799"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر السابق (اختياري)</label>
                  <input
                    type="number"
                    value={newProduct.oldPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط المنتج المباشر في المتجر</label>
                <input
                  type="url"
                  value={newProduct.productUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, productUrl: e.target.value, affiliateUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="https://www.amazon.sa/dp/..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة المنتج</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold rounded-xl text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm"
                >
                  حفظ ونشر المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
