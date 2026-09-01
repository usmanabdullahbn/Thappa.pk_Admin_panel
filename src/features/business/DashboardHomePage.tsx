import { useMyBusiness, useBusinessAnalytics } from "../../api/useBusinessApi";
import { StatCard } from "../../components/StatCard";

export function DashboardHomePage() {
  const { data: businessData, isLoading: loadingBusiness } = useMyBusiness();
  const { data: analytics, isLoading: loadingAnalytics } = useBusinessAnalytics();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-thappa-navy">{businessData?.business?.name || "Dashboard"}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {loadingBusiness ? "Loading…" : `${businessData?.branches?.length || 0} branch(es) · Reward: ${businessData?.business?.loyaltyRule?.rewardDescription}`}
      </p>

      {loadingAnalytics ? (
        <p className="text-gray-500">Loading analytics…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Stamps (last 30 days)" value={analytics?.stampsLast30d ?? 0} />
          <StatCard label="Redemptions (last 30 days)" value={analytics?.redemptionsLast30d ?? 0} />
          <StatCard label="Total Loyalty Members" value={analytics?.totalCustomers ?? 0} />
        </div>
      )}

      <div className="mt-8 rounded-xl border border-thappa-orange/40 bg-orange-50 p-5 text-sm text-gray-700">
        <p className="font-semibold text-thappa-navy">Quick tip</p>
        <p className="mt-1">
          Leave the <span className="font-medium">Generate Stamp QR</span> page open on a tablet or phone at your counter. After every
          purchase, tap "New Stamp" — a fresh QR appears for the customer to scan, valid for a few minutes and usable only once.
        </p>
      </div>
    </div>
  );
}
