import { useState } from "react";
import {
  useActiveBusinesses,
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaignExpiry,
  useUpdateCampaignStatus,
} from "../../api/useAdminApi";
import { apiErrorMessage } from "../../api/client";
import { Table } from "../../components/Table";
import { Button, Input } from "../../components/ui";

function isExpired(campaign: any) {
  return !!campaign.expiresAt && new Date(campaign.expiresAt).getTime() <= Date.now();
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}

/** A date as YYYY-MM-DD in the admin's local timezone, for date pickers. */
function dateInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Campaigns run through the end of the chosen day in the admin's local time. */
function endOfLocalDay(dateInput: string) {
  return new Date(`${dateInput}T23:59:59.999`);
}

function CampaignStatus({ campaign }: { campaign: any }) {
  if (!campaign.expiresAt) {
    return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">No expiry set (hidden from app)</span>;
  }
  if (isExpired(campaign)) {
    return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Expired</span>;
  }
  if (campaign.businessId?.status && campaign.businessId.status !== "ACTIVE") {
    return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Hidden (business {campaign.businessId.status.toLowerCase()})</span>;
  }
  return campaign.isActive ? (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Live</span>
  ) : (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Paused</span>
  );
}

export function CampaignsPage() {
  const [showModal, setShowModal] = useState(false);
  const [expiryCampaign, setExpiryCampaign] = useState<any>(null);
  const { data, isLoading } = useCampaigns();
  const updateStatus = useUpdateCampaignStatus();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-thappa-navy">Campaigns</h1>
          <p className="text-sm text-gray-500">Live campaigns are shown to customers in the Thappa mobile app.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New Campaign</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <Table
          emptyMessage="No campaigns yet. Create one to show it in the mobile app."
          columns={[
            { header: "Cafe", render: (c: any) => <span className="font-medium">{c.businessId?.name || "—"}</span> },
            {
              header: "Campaign",
              render: (c: any) => (
                <div className="max-w-sm">
                  <p className="font-medium">{c.headline}</p>
                  <p className="truncate text-xs text-gray-500" title={c.description}>
                    {c.description}
                  </p>
                </div>
              ),
            },
            { header: "Stamps", render: (c: any) => c.stampsRequired },
            { header: "Reward", render: (c: any) => c.rewardDescription },
            { header: "Expires", render: (c: any) => formatDate(c.expiresAt) },
            { header: "Status", render: (c: any) => <CampaignStatus campaign={c} /> },
            {
              header: "Actions",
              render: (c: any) => (
                <div className="flex gap-3">
                  {c.expiresAt && !isExpired(c) && (
                    <button
                      className={`text-xs hover:underline ${c.isActive ? "text-red-600" : "text-green-600"}`}
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: c._id, isActive: !c.isActive })}
                    >
                      {c.isActive ? "Pause" : "Resume"}
                    </button>
                  )}
                  <button className="text-xs text-thappa-navy hover:underline" onClick={() => setExpiryCampaign(c)}>
                    {!c.expiresAt ? "Set expiry" : isExpired(c) ? "Extend" : "Change expiry"}
                  </button>
                </div>
              ),
            },
          ]}
          rows={data?.data || []}
        />
      )}

      {showModal && <CreateCampaignModal onClose={() => setShowModal(false)} />}
      {expiryCampaign && <ExpiryModal campaign={expiryCampaign} onClose={() => setExpiryCampaign(null)} />}
    </div>
  );
}

const labelClass = "flex flex-col gap-1 text-sm font-medium text-gray-700";
const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal focus:border-thappa-orange focus:outline-none focus:ring-1 focus:ring-thappa-orange";

function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const createCampaign = useCreateCampaign();
  const { data: businesses, isLoading: loadingBusinesses } = useActiveBusinesses();
  const [form, setForm] = useState({
    businessId: "",
    headline: "",
    description: "",
    stampsRequired: "5",
    rewardDescription: "",
    expiresOn: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const stampsRequired = Number(form.stampsRequired);
    if (!Number.isInteger(stampsRequired) || stampsRequired < 1 || stampsRequired > 50) {
      setError("Number of stamps must be a whole number between 1 and 50.");
      return;
    }

    const expiresAt = endOfLocalDay(form.expiresOn);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      setError("Choose an expiry date of today or later.");
      return;
    }

    try {
      await createCampaign.mutateAsync({
        businessId: form.businessId,
        headline: form.headline,
        description: form.description,
        rewardDescription: form.rewardDescription,
        stampsRequired,
        expiresAt: expiresAt.toISOString(),
      });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-thappa-navy">Create a Campaign</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className={labelClass}>
            Cafe
            <select
              className={fieldClass}
              required
              value={form.businessId}
              onChange={(e) => setForm({ ...form, businessId: e.target.value })}
            >
              <option value="" disabled>
                {loadingBusinesses ? "Loading cafes…" : "Select a cafe"}
              </option>
              {businesses?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          {!loadingBusinesses && businesses?.length === 0 && (
            <p className="text-xs text-gray-500">No active businesses yet — onboard one on the Businesses page first.</p>
          )}

          <label className={labelClass}>
            Headline
            <Input
              required
              maxLength={80}
              placeholder="Buy 5 iced lattes, get the 6th free"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
          </label>

          <label className={labelClass}>
            Description
            <textarea
              className={fieldClass}
              required
              minLength={10}
              maxLength={500}
              rows={3}
              placeholder="Collect a stamp with every iced latte and enjoy your next one on us."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Number of stamps
              <Input
                type="number"
                required
                min={1}
                max={50}
                step={1}
                value={form.stampsRequired}
                onChange={(e) => setForm({ ...form, stampsRequired: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Reward
              <Input
                required
                maxLength={120}
                placeholder="1 free iced latte"
                value={form.rewardDescription}
                onChange={(e) => setForm({ ...form, rewardDescription: e.target.value })}
              />
            </label>
          </div>

          <label className={labelClass}>
            Expiry date
            <Input
              type="date"
              required
              min={dateInputValue()}
              value={form.expiresOn}
              onChange={(e) => setForm({ ...form, expiresOn: e.target.value })}
            />
            <span className="text-xs font-normal text-gray-500">
              The campaign ends at the end of this day and is removed from the mobile app.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
            <Button type="submit" disabled={createCampaign.isPending}>
              {createCampaign.isPending ? "Creating…" : "Create Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpiryModal({ campaign, onClose }: { campaign: any; onClose: () => void }) {
  const updateExpiry = useUpdateCampaignExpiry();
  const [expiresOn, setExpiresOn] = useState(
    campaign.expiresAt && !isExpired(campaign) ? dateInputValue(new Date(campaign.expiresAt)) : ""
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const expiresAt = endOfLocalDay(expiresOn);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      setError("Choose an expiry date of today or later.");
      return;
    }

    try {
      await updateExpiry.mutateAsync({ id: campaign._id, expiresAt: expiresAt.toISOString() });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-thappa-navy">Campaign expiry</h2>
        <p className="mb-4 text-sm text-gray-500">
          {campaign.businessId?.name} — {campaign.headline}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className={labelClass}>
            Expiry date
            <Input type="date" required min={dateInputValue()} value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
            <span className="text-xs font-normal text-gray-500">
              The campaign ends at the end of this day and is removed from the mobile app.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
            <Button type="submit" disabled={updateExpiry.isPending}>
              {updateExpiry.isPending ? "Saving…" : "Save expiry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
