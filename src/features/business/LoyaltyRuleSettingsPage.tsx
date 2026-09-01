import { useState, useEffect } from "react";
import { useMyBusiness, useAddBranch, useUpdateLoyaltyRule } from "../../api/useBusinessApi";
import { Button, Input, SecondaryButton } from "../../components/ui";

export function LoyaltyRuleSettingsPage() {
  const { data, isLoading } = useMyBusiness();
  const updateRule = useUpdateLoyaltyRule();
  const addBranch = useAddBranch();

  const [stampsRequired, setStampsRequired] = useState(5);
  const [rewardDescription, setRewardDescription] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (data?.business?.loyaltyRule) {
      setStampsRequired(data.business.loyaltyRule.stampsRequired);
      setRewardDescription(data.business.loyaltyRule.rewardDescription);
    }
  }, [data]);

  async function handleSaveRule(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg("");
    await updateRule.mutateAsync({ loyaltyRule: { stampsRequired: Number(stampsRequired), rewardDescription } });
    setSavedMsg("Saved!");
  }

  async function handleAddBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!branchName) return;
    await addBranch.mutateAsync({ name: branchName, address: branchAddress });
    setBranchName("");
    setBranchAddress("");
  }

  if (isLoading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-thappa-navy">Loyalty Settings</h1>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-700">Stamp Rule</h2>
        <form onSubmit={handleSaveRule} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Stamps required for a reward</label>
            <Input type="number" min={1} max={50} value={stampsRequired} onChange={(e) => setStampsRequired(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Reward description</label>
            <Input value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} placeholder="1 Free Coffee (any size)" />
          </div>
          <Button type="submit" disabled={updateRule.isPending} className="self-start">
            {updateRule.isPending ? "Saving…" : "Save Rule"}
          </Button>
          {savedMsg && <p className="text-sm text-green-600">{savedMsg}</p>}
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-700">Branches</h2>
        <ul className="mb-4 space-y-2">
          {(data?.branches || []).map((b: any) => (
            <li key={b._id} className="rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <span className="font-medium">{b.name}</span>
              {b.address && <span className="ml-2 text-gray-400">{b.address}</span>}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddBranch} className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="New branch name" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
          <Input placeholder="Address (optional)" value={branchAddress} onChange={(e) => setBranchAddress(e.target.value)} />
          <SecondaryButton type="submit" disabled={addBranch.isPending}>
            + Add Branch
          </SecondaryButton>
        </form>
      </section>
    </div>
  );
}
