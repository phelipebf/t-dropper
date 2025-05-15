'use client';

import { useState, useMemo, useEffect } from "react";
import { InputForm } from '@/components/ui/InputField';
import { CgSpinner } from "react-icons/cg";
import { RiAlertFill, RiInformationLine } from "react-icons/ri";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true);

    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

    const config = useConfig();
    const chainId = useChainId();
    const account = useAccount();
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract();
    const { data: tokenData } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [account.address],
            },
        ],
    });

    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    });

    async function handleSubmit() {
        const tSenderAddress = chainsToTSender[chainId].tsender;
        console.log('chainId', chainId);
        console.log('tSenderAddress', tSenderAddress);
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        console.log('approvedAmount', approvedAmount);

        if (approvedAmount < total) {
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)],
            });

            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash,
            });

            console.log("Approval confirmed:", approvalReceipt);

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        } else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            },)
        }
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

    function getButtonContent() {
        if (!hasEnoughTokens && tokenAddress) {
            return "Insufficient token balance";
        }

        if (isPending)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Confirming in wallet...</span>
                </div>
            )
        if (isConfirming)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Waiting for transaction to be included...</span>
                </div>
            )
        if (error || isError) {
            console.log(error);
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <span>Error, see console.</span>
                </div>
            )
        }
        if (isConfirmed) {
            return "Transaction confirmed.";
        }

        return "Send Tokens";
    }

    useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress')
        const savedRecipients = localStorage.getItem('recipients')
        const savedAmounts = localStorage.getItem('amounts')

        if (savedTokenAddress) setTokenAddress(savedTokenAddress)
        if (savedRecipients) setRecipients(savedRecipients)
        if (savedAmounts) setAmounts(savedAmounts)
    }, [])

    useEffect(() => {
        localStorage.setItem('tokenAddress', tokenAddress)
    }, [tokenAddress])

    useEffect(() => {
        localStorage.setItem('recipients', recipients)
    }, [recipients])

    useEffect(() => {
        localStorage.setItem('amounts', amounts)
    }, [amounts])

    useEffect(() => {
        if (tokenAddress && total > 0 && tokenData?.[2]?.result as number !== undefined) {
            const userBalance = tokenData?.[2].result as number;
            setHasEnoughTokens(userBalance >= total);
        } else {
            setHasEnoughTokens(true);
        }
    }, [tokenAddress, total, tokenData]);

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
            <button
                className={`cursor-pointer flex items-center justify-center w-full py-3 rounded-[9px] text-white transition-colors font-semibold relative border bg-blue-500 hover:bg-blue-600 border-blue-500 ${!hasEnoughTokens && tokenAddress ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleSubmit}
                disabled={isPending || isConfirming || isError || (!!error as boolean) || (!hasEnoughTokens && tokenAddress !== "")}
            >
                {/* Gradient */}
                <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% to-transparent mix-blend-overlay z-10 rounded-lg" />
                {/* Inner shadow */}
                <div className="absolute w-full inset-0 mix-blend-overlay z-10 inner-shadow rounded-lg" />
                {/* White inner border */}
                <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] border-white/20 rounded-lg" />
                {getButtonContent()}
            </button>
        </div>
    );
}