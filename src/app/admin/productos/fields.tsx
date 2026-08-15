type Category = { id: string; name: string };
type Product = {
  name: string;
  category_id: string | null;
  description: string | null;
  price: number;
  discount_percent: number;
  active: boolean;
} | null;

export function ProductFields({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="label">Nombre</span>
        <input className="field mt-1.5" name="name" defaultValue={product?.name} required />
      </label>

      <label>
        <span className="label">Categoría</span>
        <select
          className="field mt-1.5"
          name="category_id"
          defaultValue={product?.category_id ?? ""}
          required
        >
          {/* value="" + required = el navegador bloquea el envío. Sin JS. */}
          <option value="" disabled>
            Elige una categoría
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-end gap-3 pb-2.5">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? true}
          className="size-4 accent-[var(--color-ink)]"
        />
        <span className="label">Visible en la tienda</span>
      </label>

      <label>
        <span className="label">Precio</span>
        <input
          className="field mt-1.5"
          name="price"
          type="number"
          min="0"
          step="1"
          defaultValue={product?.price}
          required
        />
      </label>

      <label>
        <span className="label">Descuento (%)</span>
        <input
          className="field mt-1.5"
          name="discount_percent"
          type="number"
          min="0"
          max="100"
          step="1"
          defaultValue={product?.discount_percent ?? 0}
          required
        />
        <span className="mt-1.5 block text-xs text-faint">
          0 = sin descuento. El precio rebajado se calcula solo.
        </span>
      </label>

      <label className="sm:col-span-2">
        <span className="label">Descripción</span>
        <textarea className="field mt-1.5" name="description" rows={5} defaultValue={product?.description ?? ""} />
      </label>
    </div>
  );
}
