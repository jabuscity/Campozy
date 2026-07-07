import { HousingService } from "@/services/housing-service";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { CampusFilter } from "@/components/discovery/campus-filter";
import { DiscoveryControls } from "@/components/discovery/discovery-controls";
import { MapPin } from "lucide-react"; // Fixes 'MapPin' is not defined

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: { q?: string; campus?: string; sort?: string };
}) {
  const campuses = await HousingService.getCampuses();

  const query = searchParams.q || "";
  const campusId = searchParams.campus;
  const sort =
    searchParams.sort === "price_asc" || searchParams.sort === "latest"
      ? searchParams.sort
      : "highest_score";

  const properties = campusId
    ? await HousingService.getPropertiesByCampus(campusId, { sort })
    : [];

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header / Search Bar */}
      <div className="bg-white border-b border-neutral-200 pt-8 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight uppercase">
                Housing Intel
              </h1>
              <p className="text-neutral-500 text-lg">
                Discover verified student housing with trusted utility scores
                and community insights.
              </p>
            </div>

            <DiscoveryControls query={query} />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="text-neutral-900">
            <span className="font-bold text-lg">{properties.length}</span>
            <span className="text-neutral-500 ml-2 italic">
              verified properties found
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
            Sort by:
            {/* WARNING: This select dropdown will throw a runtime error in its current state */}
            <select
              className="bg-transparent border-none focus:ring-0 font-bold text-neutral-900 cursor-pointer"
              value={sort}
              onChange={(e) => {
                const newSearchParams = new URLSearchParams(
                  window.location.search,
                );
                newSearchParams.set("sort", e.currentTarget.value);
                redirect(`/discovery?${newSearchParams.toString()}`);
              }}
            >
              <option value="highest_score">Highest Score</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="latest">Latest</option>
            </select>
          </div>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-neutral-200">
            <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
              <MapPin className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              No Verified Housing Found
            </h3>
            <p className="text-neutral-500 max-w-xs mx-auto mb-8">
              We&apos;re still mapping this campus. Be a pioneer and nominate
              yours. first hostel!
            </p>
            <Button size="lg" className="px-10">
              Nominate Property
            </Button>
          </div>
        )}
      </div>

      {/* Map Toggle Floating Button (Mobile) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:hidden">
        <Button
          variant="primary" size="lg" 
          className="rounded-full shadow-2xl px-8 gap-2 h-12 text-lg"
        >
          <MapPin className="h-5 w-5" /> View Map
        </Button>
      </div>
      <CampusFilter campuses={campuses} campusId={campusId} />
    </div>
  );
}