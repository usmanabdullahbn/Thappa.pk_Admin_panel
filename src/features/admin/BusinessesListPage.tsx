import { useState } from "react";
import { useBusinesses, useCreateBusiness, useUpdateBusinessStatus } from "../../api/useAdminApi";
import { apiErrorMessage } from "../../api/client";
import { Table } from "../../components/Table";
import { Button, Input, SecondaryButton } from "../../components/ui";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    SUSPENDED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || ""}`}>{status}</span>;
}

export function BusinessesListPage() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useBusinesses(page);
  const updateStatus = useUpdateBusinessStatus();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-thappa-navy">Businesses</h1>
        <Button onClick={() => setShowModal(true)}>+ Onboard Business</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
          <Table
            columns={[
              { header: "Name", render: (b: any) => <span className="font-medium">{b.name}</span> },
              { header: "Category", render: (b: any) => b.category },
              { header: "QR Mode", render: (b: any) => b.qrMode },
              { header: "Status", render: (b: any) => <StatusBadge status={b.status} /> },
              {
                header: "Actions",
                render: (b: any) => (
                  <div className="flex gap-2">
                    {b.status !== "SUSPENDED" ? (
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => updateStatus.mutate({ id: b._id, status: "SUSPENDED" })}
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        className="text-xs text-green-600 hover:underline"
                        onClick={() => updateStatus.mutate({ id: b._id, status: "ACTIVE" })}
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
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

      {showModal && <CreateBusinessModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function CreateBusinessModal({ onClose }: { onClose: () => void }) {
  const createBusiness = useCreateBusiness();
  const [form, setForm] = useState({
    businessName: "",
    category: "CAFE",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    branchName: "",
    branchAddress: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createBusiness.mutateAsync(form);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-thappa-navy">Onboard a New Business</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input placeholder="Business name" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="CAFE">Café</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="SALON">Salon</option>
            <option value="GYM">Gym</option>
            <option value="OTHER">Other</option>
          </select>
          <Input placeholder="Owner full name" required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          <Input type="email" placeholder="Owner email" required value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
          <Input
            type="password"
            placeholder="Temporary password"
            required
            value={form.ownerPassword}
            onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
          />
          <Input placeholder="Branch name (optional)" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
          <Input placeholder="Branch address (optional)" value={form.branchAddress} onChange={(e) => setForm({ ...form, branchAddress: e.target.value })} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
            <Button type="submit" disabled={createBusiness.isPending}>
              {createBusiness.isPending ? "Creating…" : "Create Business"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
