"use client"

import type React from "react"
import Modal from "@/components/common/Modal"
import type { Product } from "@/lib/types/product"

interface ProductDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categories: Array<{ id: string; name: string }>
}

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-800 border-b border-[#FFD6D6] pb-2 mb-3">
    {children}
  </h3>
)

const InfoRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-[#A30000]">
      {label}
    </span>
    <div className="text-sm text-gray-800">{value}</div>
  </div>
)

const YesNoBadge = ({ value }: { value?: string }) => {
  const yes = value === "yes"
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${yes ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
    >
      {yes ? "Yes" : "No"}
    </span>
  )
}

const StatusBadge = ({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean
  activeLabel: string
  inactiveLabel: string
}) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
  >
    {active ? activeLabel : inactiveLabel}
  </span>
)

const formatPrice = (n: unknown): string => {
  const x = typeof n === "number" ? n : Number(n)
  if (Number.isNaN(x)) return "—"
  return `₹${x.toFixed(2)}`
}

const formatNum = (n: unknown): string => {
  if (n === undefined || n === null || n === "") return "—"
  const x = typeof n === "number" ? n : Number(n)
  if (Number.isNaN(x)) return "—"
  return String(x)
}

const formatDateSafe = (v: unknown): string => {
  if (v === undefined || v === null || v === "") return "—"
  if (
    typeof v === "object" &&
    v !== null &&
    "toDate" in v &&
    typeof (v as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      const d = (v as { toDate: () => Date }).toDate()
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      /* fallthrough */
    }
  }
  const raw = typeof v === "string" ? v : String(v)
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const HtmlBlock = ({
  title,
  html,
}: {
  title: string
  html?: string
}) => {
  const trimmed = html?.trim() ?? ""
  return (
    <div className="bg-[#fff5f5] p-5 rounded-2xl shadow-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#A30000] mb-2">
        {title}
      </h4>
      {!trimmed ? (
        <span className="text-sm text-gray-400 italic">—</span>
      ) : (
        <div
          className="prose prose-sm max-w-none text-gray-800 [&_*]:break-words prose-headings:text-gray-900"
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
      )}
    </div>
  )
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
}) => {
  if (!product) return null

  const categoryName =
    categories.find((cat) => cat.id === product.categoryId)?.name || "—"

  const isCustomYes = product.ProductCustomise === "yes"
  const imageCount = Array.isArray(product.images) ? product.images.length : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      width="80rem"
      closeLabel="Close"
    >
      <div className="space-y-8 text-[#4B3F2F]">
        {/* Product Images — same logical block as ProductForm */}
        <div>
          <SectionHeader>Product Images</SectionHeader>
          <p className="text-xs text-gray-600 mb-3">{imageCount} / 6 images</p>
          {imageCount > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {product.images!.map((img, idx) => (
                <img
                  key={idx}
                  src={img || "/placeholder.svg?height=150&width=150"}
                  alt={`${product.productName} - ${idx + 1}`}
                  className="w-32 h-32 object-cover rounded-xl border shadow-sm hover:scale-[1.02] transition-transform duration-200"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = "/placeholder.svg?height=150&width=150"
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-6 bg-[#fff5f5] rounded-2xl">
              <span className="text-sm text-gray-400 italic">No images uploaded</span>
            </div>
          )}
        </div>

        {/* Category & basic identity */}
        <div>
          <SectionHeader>Category &amp; product name</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
            <InfoRow label="Product ID" value={product.id || "—"} />
            <InfoRow label="Category" value={categoryName} />
            <InfoRow label="Product Name" value={product.productName || "—"} />
            <InfoRow label="Slug" value={product.slug?.trim() || "—"} />
            <InfoRow
              label="Activity"
              value={
                typeof product.activity === "number"
                  ? product.activity === 1
                    ? "1 (active)"
                    : product.activity === 0
                      ? "0 (inactive)"
                      : String(product.activity)
                  : formatNum(product.activity)
              }
            />
          </div>
        </div>

        {/* Same row concept as ProductForm: prices + dropdowns */}
        <div>
          <SectionHeader>Pricing &amp; availability</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
            <InfoRow label="Original Price (₹)" value={formatPrice(product.originalPrice)} />
            <InfoRow label="Amount / Selling Price (₹)" value={formatPrice(product.productPrice)} />
            <InfoRow
              label="Discount (%)"
              value={
                <span className="inline-block px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                  {product.discountPercentage ?? 0}%
                </span>
              }
            />
            <InfoRow
              label="Out of Stock"
              value={
                <StatusBadge
                  active={product.outOfStock !== "yes"}
                  activeLabel="No (In stock)"
                  inactiveLabel="Yes (Out of stock)"
                />
              }
            />
            <InfoRow label="Is Best Sell" value={<YesNoBadge value={product.isBestSell} />} />
            <InfoRow label="Is Corporate Gifts" value={<YesNoBadge value={product.isCorporateGifts} />} />
            <InfoRow
              label="Status"
              value={<StatusBadge active={product.status === "active"} activeLabel="Active" inactiveLabel="Inactive" />}
            />
            <InfoRow
              label="Product Customise"
              value={<YesNoBadge value={product.ProductCustomise === "yes" ? "yes" : "no"} />}
            />
          </div>
        </div>

        {/* Product customise (when yes — aligns with conditional block on form) */}
        <div>
          <SectionHeader>Product Customise</SectionHeader>
          {isCustomYes ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A30000] block mb-2">
                  Product Customise Image
                </span>
                {product.ProductCustomiseImage ? (
                  <img
                    src={product.ProductCustomiseImage}
                    alt="Customise"
                    className="max-w-full max-h-48 object-contain rounded-lg border shadow-sm bg-white"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = "/placeholder.svg?height=150&width=150"
                    }}
                  />
                ) : (
                  <span className="text-sm text-gray-400 italic">—</span>
                )}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A30000] block mb-2">
                  Product Customise Text <span className="font-normal lowercase">(optional)</span>
                </span>
                {product.ProductCustomiseText?.trim() ? (
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{product.ProductCustomiseText}</p>
                ) : (
                  <span className="text-sm text-gray-400 italic">—</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#fff5f5] p-5 rounded-2xl text-sm text-gray-600">
              Product Customise is <strong>No</strong> — no customise image or text stored.
            </div>
          )}
        </div>

        {/* Description — plain textarea on form */}
        <div>
          <SectionHeader>Description</SectionHeader>
          <div className="bg-[#fff5f5] p-5 rounded-2xl shadow-sm">
            {product.description?.trim() ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{product.description}</p>
            ) : (
              <span className="text-sm text-gray-400 italic">—</span>
            )}
          </div>
        </div>

        {/* Offers & Highlights — side by side like form */}
        <div>
          <SectionHeader>Available Offers &amp; Highlights</SectionHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HtmlBlock title="Available Offers" html={product.availableOffers} />
            <HtmlBlock title="Highlights" html={product.highlights} />
          </div>
        </div>

        {/* Shipping */}
        <div>
          <SectionHeader>Shipping Details</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
            <InfoRow label="Length (cm)" value={formatNum(product.length)} />
            <InfoRow label="Breadth (cm)" value={formatNum(product.breadth)} />
            <InfoRow label="Height (cm)" value={formatNum(product.height)} />
            <InfoRow label="Weight (kg)" value={formatNum(product.weight)} />
          </div>
        </div>

        {/* SEO */}
        <div>
          <SectionHeader>SEO Purpose</SectionHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner items-start">
            <InfoRow label="Meta Title" value={product.metaTitle?.trim() || "—"} />
            <InfoRow label="Meta Keywords" value={product.metaKeywords?.trim() || "—"} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A30000]">
                Meta Description
              </span>
              {product.metaDescription?.trim() ? (
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{product.metaDescription}</p>
              ) : (
                <span className="text-sm text-gray-400 italic">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div>
          <SectionHeader>Timestamps</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
            <InfoRow label="Created At" value={formatDateSafe(product.createdAt)} />
            <InfoRow label="Updated At" value={formatDateSafe(product.updatedAt)} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ProductDetailsModal
