"use client";

import React from 'react';
import { useAccount, useConnect } from 'wagmi';

const truncateAddress = (address?: string) => {
  if (!address) return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
};

export default function ConnectMenu() {
  const { isConnected, address, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  if (isConnected) {
    return (
      <div style={{
        background: 'linear-gradient(90deg, #7b2ff7 0%, #f357a8 100%)',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: '8px',
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(123,47,247,0.15)',
        display: 'inline-block',
        margin: '12px 0',
      }}>
        <span style={{ marginRight: 12 }}>🟢 Connected</span>
        <span style={{ fontFamily: 'monospace', background: '#fff2', padding: '2px 8px', borderRadius: '6px' }}>
          {truncateAddress(address)}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending || isConnecting}
      style={{
        background: 'linear-gradient(90deg, #7b2ff7 0%, #f357a8 100%)',
        color: '#fff',
        padding: '12px 28px',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 800,
        fontSize: '18px',
        cursor: isPending || isConnecting ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 8px rgba(123,47,247,0.15)',
        margin: '12px 0',
        transition: 'background 0.3s',
      }}
    >
      {isPending || isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
} 