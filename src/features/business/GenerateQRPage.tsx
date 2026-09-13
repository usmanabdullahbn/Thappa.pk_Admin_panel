import { useEffect, useRef, useState } from "react";
import { useActiveCampaigns, useGenerateQr, useMyBusiness } from "../../api/useBusinessApi";
import { apiErrorMessage } from "../../api/client";
import { getSocket } from "../../api/socket";
import { Button, Input } from "../../components/ui";

interface StampEarnedEvent {
  branchId: string;
  customerName: string;
  campaignHeadline?: string;
  currentStamps: number;
  stampsRequired: number;
  rewardUnlocked: boolean;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function GenerateQRPage() {
  const { data: businessData } = useMyBusiness();
  const { data: campaigns, isLoading: loadingCampaigns } = useActiveCampaigns();
  const generateQr = useGenerateQr();
  const [campaignId, setCampaignId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [liveEvent, setLiveEvent] = useState<StampEarnedEvent | null>(null);
  const countdown = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const branches = businessData?.branches || [];
  const activeBranchId = branchId || branches[0]?._id;

  function stopCountdown() {
    if (countdown.current) clearInterval(countdown.current);
    countdown.current = undefined;
  }

  useEffect(() => stopCountdown, []);

  // Live "customer scanned!" confirmation — the QR is single-use, so once a
  // scan lands for this branch we clear it and prompt staff to generate the
  // next one instead of leaving a dead QR on screen.
  useEffect(() => {
    if (!activeBranchId) return;
    const socket = getSocket();
    socket.emit("join:branch", activeBranchId);

    function onStampEarned(event: StampEarnedEvent) {
      if (event.branchId !== activeBranchId) return;
      setLiveEvent(event);
      stopCountdown();
      setSecondsLeft(null);
      generateQr.reset();
      setTimeout(() => setLiveEvent(null), 6000);
    }

    socket.on("stamp:earned", onStampEarned);
    return () => {
      socket.off("stamp:earned", onStampEarned);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranchId]);

  function selectCampaign(id: string) {
    setCampaignId(id);
    setError("");
    stopCountdown();
    setSecondsLeft(null);
    generateQr.reset();
  }

  async function handleGenerate() {
    setError("");
    if (!campaignId) {
      setError("Select an active campaign first.");
      return;
    }
    if (!activeBranchId) {
      setError("Add a branch first under Loyalty Settings.");
      return;
    }
    try {
      const result = await generateQr.mutateAsync({
        campaignId,
        branchId: activeBranchId,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
      });
      stopCountdown();
      const expiresInMs = new Date(result.expiresAt).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.round(expiresInMs / 1000)));
      countdown.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s === null || s <= 1) {
            stopCountdown();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <h1 className="text-xl font-bold text-thappa-navy">Generate Stamp QR</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Pick the campaign the customer is buying for, then show them the QR. They scan it with their phone camera to collect a stamp.
      </p>

      {liveEvent && (
        <div className="mb-6 w-full rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="font-semibold text-green-800">🎉 {liveEvent.customerName} just scanned!</p>
          <p className="mt-1 text-sm text-green-700">
            {liveEvent.campaignHeadline ? `${liveEvent.campaignHeadline} — ` : ""}
            {liveEvent.rewardUnlocked
              ? "Reward unlocked — ask them for their 6-digit code."
              : `Stamp ${liveEvent.currentStamps} / ${liveEvent.stampsRequired}`}
          </p>
        </div>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">1. Select an active campaign</h2>
        {loadingCampaigns ? (
          <p className="text-sm text-gray-500">Loading campaigns…</p>
        ) : !campaigns?.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No active campaigns right now. Campaigns are created by the Thappa admin team.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {campaigns.map((campaign) => {
              const selected = campaign._id === campaignId;
              return (
                <button
                  key={campaign._id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCampaign(campaign._id)}
                  className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${
                    selected ? "border-thappa-orange ring-2 ring-thappa-orange" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-thappa-navy">{campaign.headline}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {campaign.stampsRequired} stamps · Reward: {campaign.rewardDescription}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Ends {formatDate(campaign.expiresAt)}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-6 flex w-full max-w-sm flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700">2. Generate the QR</h2>
        {branches.length > 1 && (
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={activeBranchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            {branches.map((b: any) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <Input type="number" placeholder="Bill amount (optional)" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
        <Button onClick={handleGenerate} disabled={generateQr.isPending || !campaignId}>
          {generateQr.isPending ? "Generating…" : "Generate QR"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      {generateQr.data && (
        <div className="flex flex-col items-center self-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{businessData?.business?.name}</p>
          <p className="mb-4 mt-1 text-center font-semibold text-thappa-navy">{generateQr.data.campaign.headline}</p>
          <img src={generateQr.data.qrImageBase64} alt={`Stamp QR for ${generateQr.data.campaign.headline}`} className="h-72 w-72" />
          <p className="mt-4 text-sm text-gray-500">
            {secondsLeft !== null && secondsLeft > 0 ? `Expires in ${secondsLeft}s — single use` : "Expired — generate a new one"}
          </p>
        </div>
      )}
    </div>
  );
}
