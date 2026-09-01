import { useState } from "react";
import { useMyBusiness, useGenerateQr } from "../../api/useBusinessApi";
import { apiErrorMessage } from "../../api/client";
import { Button, Input } from "../../components/ui";

export function GenerateQRPage() {
  const { data: businessData } = useMyBusiness();
  const generateQr = useGenerateQr();
  const [branchId, setBranchId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const branches = businessData?.branches || [];
  const activeBranchId = branchId || branches[0]?._id;

  async function handleGenerate() {
    setError("");
    if (!activeBranchId) {
      setError("Add a branch first under Loyalty Settings.");
      return;
    }
    try {
      const result = await generateQr.mutateAsync({
        branchId: activeBranchId,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
      });
      const expiresInMs = new Date(result.expiresAt).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.round(expiresInMs / 1000)));
      const interval = setInterval(() => {
        setSecondsLeft((s) => {
          if (s === null || s <= 1) {
            clearInterval(interval);
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
    <div className="flex flex-col items-center">
      <h1 className="mb-4 self-start text-xl font-bold text-thappa-navy">Generate Stamp QR</h1>

      <div className="mb-6 flex w-full max-w-sm flex-col gap-3">
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
        <Input
          type="number"
          placeholder="Bill amount (optional)"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />
        <Button onClick={handleGenerate} disabled={generateQr.isPending}>
          {generateQr.isPending ? "Generating…" : "New Stamp QR"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {generateQr.data && (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <img src={generateQr.data.qrImageBase64} alt="Stamp QR" className="h-72 w-72" />
          <p className="mt-4 text-sm text-gray-500">
            {secondsLeft !== null && secondsLeft > 0
              ? `Expires in ${secondsLeft}s — single use`
              : "Expired — generate a new one"}
          </p>
        </div>
      )}
    </div>
  );
}
