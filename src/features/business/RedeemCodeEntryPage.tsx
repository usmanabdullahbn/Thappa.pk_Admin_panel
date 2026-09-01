import { useState } from "react";
import { useVerifyRedemption } from "../../api/useBusinessApi";
import { apiErrorMessage } from "../../api/client";
import { Button, Input } from "../../components/ui";

export function RedeemCodeEntryPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const verify = useVerifyRedemption();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    try {
      const data = await verify.mutateAsync({ redemptionCode: code });
      setResult("success");
      setMessage(`Reward given: ${data.redemption.rewardDescription}`);
      setCode("");
    } catch (err) {
      setResult("error");
      setMessage(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-6 self-start text-xl font-bold text-thappa-navy">Redeem Reward Code</h1>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <p className="text-sm text-gray-500">Ask the customer for their 6-digit reward code and enter it below to confirm the reward was given.</p>
        <Input
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          inputMode="numeric"
          className="text-center text-2xl tracking-widest"
        />
        <Button type="submit" disabled={verify.isPending || code.length !== 6}>
          {verify.isPending ? "Checking…" : "Confirm Redemption"}
        </Button>

        {result === "success" && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✅ {message}</p>}
        {result === "error" && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">❌ {message}</p>}
      </form>
    </div>
  );
}
