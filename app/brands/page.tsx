import api from "@/lib/api";
import Link from "next/link";

type Brand = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  parentBrand?: string;
  level?: number;
  brandPath?: string[];
  productCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
};

// ✅ Main Page Component
export default async function BrandPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  let brands: Brand[] = [];
  try {
    const res = await api.get("/brands");
    brands = res.data?.data || res.data || [];
  } catch (err) {
    console.error("Failed to fetch brands", err);
  }
  return (
    <div className="min-h-screen ">
      <div className="max-w-8xl mx-auto p-4 sm:p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Shop by Brand</h1>
          </div>
          {/* ................................................................. */}
          {/* ✅ Responsive Grid: 8 columns × 8 rows (64 brands) */}
          <div className="grid grid-cols-2 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8 gap-10">
            {brands.length === 0 && (
              <div className="p-6  text-center text-gray-500 col-span-full">
                No brands found
              </div>
            )}

            {/* ✅ Show only 64 brands */}
            {brands.slice(0, 64).map((brand) => (
              <Link
                key={brand._id}
                href={`/products?brand=${brand._id}`}
                className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                {/* Image Section */}
                <div className="w-full  h-20 flex items-center justify-center overflow-hidden relative">
                  {brand.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-gray-400   text-sm">No image</div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-2 text-center">
                  <h2 className="font-medium  text-gray-900 text-xs truncate group-hover:text-blue-600 transition">
                    {brand.name}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
