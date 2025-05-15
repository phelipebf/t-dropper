'use client';

import { useState, useMemo } from "react";
import { InputForm } from '@/components/ui/InputField';
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const config = useConfig();
    const chainId = useChainId();
    const account = useAccount();
    useMemo(() => console.log(calculateTotal(amounts)), [amounts]);

    async function handleSubmit() {
        const tSenderAddress = chainsToTSender[chainId].tsender;
        console.log('chainId', chainId);
        console.log('tSenderAddress', tSenderAddress);
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        console.log('approvedAmount', approvedAmount);
    }

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found. Please use a supported chain.");
            return 0;
        }

        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`],
        });

        return response as number;
    }

    return (
        <div className="space-y-6">
            <InputForm
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputForm
                label="Recipients (comma or new line separated)"
                placeholder="0x123..., 0x456..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}
            />
            <InputForm
                label="Amounts (wei; comma or new line separated)"
                placeholder="100, 200, 300..."
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
                large={true}
            />
            <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                Send tokens
            </button>
        </div>
    );
}