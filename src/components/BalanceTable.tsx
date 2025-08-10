"use client";

import { useState } from "react";
import {
  BalanceData,
  UserBalanceData,
  aggregateBalancesByUser,
} from "@/lib/solana";

interface BalanceTableProps {
  balances: BalanceData[];
  loading: boolean;
}

type TabType = "wallets" | "users";

function formatUserId(userId: string): string {
  return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}

export default function BalanceTable({ balances, loading }: BalanceTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>("wallets");

  const userBalances = aggregateBalancesByUser(balances);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        SOL Balance Checker
      </h1>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("wallets")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "wallets"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🏆 Top Wallets ({balances.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              👥 Top Users ({userBalances.length})
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "wallets" ? (
            <WalletsTable balances={balances} />
          ) : (
            <UsersTable userBalances={userBalances} />
          )}
        </div>

        {balances.length === 0 && !loading && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg font-medium">No public keys found</p>
              <p className="text-sm mt-1">
                Make sure your Supabase table has public keys in the user_keys
                table
              </p>
            </div>
          </div>
        )}
      </div>

      {balances.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          {activeTab === "wallets"
            ? `Showing ${balances.length} wallet${
                balances.length !== 1 ? "s" : ""
              } • Sorted by highest SOL balance`
            : `Showing ${userBalances.length} user${
                userBalances.length !== 1 ? "s" : ""
              } • Sorted by total SOL balance`}
        </div>
      )}
    </div>
  );
}

function WalletsTable({ balances }: { balances: BalanceData[] }) {
  return (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Rank
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Public Key
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            SOL Balance
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {balances.map((balance, index) => (
          <tr
            key={balance.publicKey}
            className="hover:bg-gray-50 transition-colors duration-150"
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  #{index + 1}
                </span>
                {index === 0 && (
                  <span className="ml-2 text-yellow-500">👑</span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-mono text-gray-900">
                {balance.publicKey.slice(0, 4)}...{balance.publicKey.slice(-4)}
              </div>
              <div className="text-xs text-gray-500 mt-1 break-all">
                {balance.publicKey}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-mono text-gray-600">
                {formatUserId(balance.userId)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm font-medium text-gray-900">
                {balance.balanceSOL.toFixed(4)} SOL
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UsersTable({ userBalances }: { userBalances: UserBalanceData[] }) {
  return (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Rank
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User ID
          </th>
          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Wallets
          </th>
          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total SOL
          </th>
          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Top Wallet
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {userBalances.map((user, index) => (
          <tr
            key={user.userId}
            className="hover:bg-gray-50 transition-colors duration-150"
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  #{index + 1}
                </span>
                {index === 0 && (
                  <span className="ml-2 text-yellow-500">👑</span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-mono text-gray-900">
                {formatUserId(user.userId)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.walletCount} wallet{user.walletCount !== 1 ? "s" : ""}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.totalBalanceSOL.toFixed(4)} SOL
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm text-gray-500">
                {user.topWalletBalance.toFixed(4)} SOL
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
