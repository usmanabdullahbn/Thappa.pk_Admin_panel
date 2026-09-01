import { usePlatformOverview } from "../../api/useAdminApi";
import { StatCard } from "../../components/StatCard";

export function PlatformOverviewPage() {
  const { data, isLoading } = usePlatformOverview();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-thappa-navy">Platform Overview</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Active Businesses" value={data?.activeBusinesses ?? 0} />
          <StatCard label="Total Businesses" value={data?.totalBusinesses ?? 0} />
          <StatCard label="Total Stamps Issued" value={data?.totalStamps ?? 0} />
          <StatCard label="Total Customers" value={data?.totalCustomers ?? 0} />
        </div>
      )}
    </div>
  );
}
