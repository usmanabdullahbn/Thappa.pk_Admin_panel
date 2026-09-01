import { useState } from "react";
import { useCustomers, useCustomerDetail, useManualAdjust } from "../../api/useBusinessApi";
import { Table } from "../../components/Table";
import { Input, SecondaryButton, Button } from "../../components/ui";

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ customerId: string; branchId: string } | null>(null);
  const { data, isLoading } = useCustomers(page, search);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-thappa-navy">Customers</h1>
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
          <Table
            columns={[
              { header: "Name", render: (c: any) => c.customerId?.name || "—" },
              { header: "Phone", render: (c: any) => c.customerId?.phone || c.customerId?.email || "—" },
              { header: "Stamps", render: (c: any) => `${c.currentStamps} / ${c.stampsRequired}` },
              { header: "Last Visit", render: (c: any) => (c.lastStampAt ? new Date(c.lastStampAt).toLocaleDateString() : "—") },
              {
                header: "",
                render: (c: any) => (
                  <button
                    className="text-xs font-medium text-thappa-navy hover:underline"
                    onClick={() => setSelected({ customerId: c.customerId?._id, branchId: c.branchId })}
                  >
                    View
                  </button>
                ),
              },
            ]}
            rows={data?.data || []}
          />
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
            <SecondaryButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </SecondaryButton>
            <span>
              Page {data?.page} of {data?.totalPages || 1}
            </span>
            <SecondaryButton disabled={!data || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </SecondaryButton>
          </div>
        </>
      )}

      {selected && <CustomerDetailDrawer customerId={selected.customerId} branchId={selected.branchId} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CustomerDetailDrawer({ customerId, branchId, onClose }: { customerId: string; branchId: string; onClose: () => void }) {
  const { data, isLoading } = useCustomerDetail(customerId);
  const manualAdjust = useManualAdjust();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-thappa-navy">Customer Detail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <>
            <div className="mb-4 rounded-xl bg-gray-50 p-4">
              <p className="font-semibold">{data?.card?.customerId?.name}</p>
              <p className="text-sm text-gray-500">{data?.card?.customerId?.phone || data?.card?.customerId?.email}</p>
              <p className="mt-2 text-sm">
                Stamps: <span className="font-medium">{data?.card?.currentStamps}</span> / {data?.card?.stampsRequired}
              </p>
            </div>

            <div className="mb-4 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => manualAdjust.mutate({ customerId, branchId, direction: "ADD", reason: "Manual add via dashboard" })}
              >
                + Add Stamp
              </Button>
              <SecondaryButton
                className="flex-1"
                onClick={() => manualAdjust.mutate({ customerId, branchId, direction: "REMOVE", reason: "Manual remove via dashboard" })}
              >
                − Remove Stamp
              </SecondaryButton>
            </div>

            <h3 className="mb-2 text-sm font-semibold text-gray-600">Recent Activity</h3>
            <ul className="space-y-2 text-sm">
              {(data?.transactions || []).map((t: any) => (
                <li key={t._id} className="rounded-lg border border-gray-100 px-3 py-2">
                  <span className="font-medium">{t.type}</span>
                  <span className="ml-2 text-gray-400">{new Date(t.createdAt).toLocaleString()}</span>
                </li>
              ))}
              {(data?.transactions || []).length === 0 && <p className="text-gray-400">No activity yet.</p>}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
