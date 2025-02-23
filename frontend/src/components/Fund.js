import React, { useState } from 'react';
import config from '../config';

function Balance({ latestData }) {
  if (!latestData || !latestData.bankBalance) {
    console.log('Latest data or bank balance is missing:', latestData);
    return (
      <div>
        <h2>balance</h2>
        <div className="loading-text">loading balance...</div>
      </div>
    );
  }
  const bankBalance = latestData.bankBalance;
  const pending =
    latestData.stripeBalance &&
    latestData.stripeBalance.pending &&
    latestData.stripeBalance.pending.length > 0
      ? latestData.stripeBalance.pending[0].amount / 100
      : 0;
  return (
    <div>
      <h2>balance</h2>
      <p>
        <span className="total-balance">${bankBalance.amount.toFixed(2)}</span>{' '}
        (+{pending.toFixed(2)} pending)
      </p>
      <p className="last-sync">
        last sync:{' '}
        {latestData.lastSynced
          ? new Date(latestData.lastSynced).toLocaleString()
          : 'n/a'}
      </p>
    </div>
  );
}

function Transactions({ latestData }) {
  const [page, setPage] = useState(1);
  const limit = 12;
  if (!latestData) {
    return (
      <div>
        <h2>transactions</h2>
        <div className="loading-text">loading transactions...</div>
      </div>
    );
  }
  const txs = latestData.bankWithdrawals || [];
  const charges = latestData.stripeCharges || [];
  const combined = [...txs, ...charges].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.date);
    const dateB = new Date(b.timestamp || b.date);
    return dateB - dateA;
  });
  const totalContributed = combined
    .filter((item) => !item.timestamp)
    .reduce((sum, item) => sum + item.amount / 100, 0);
  const totalPages = Math.ceil(combined.length / limit);
  const start = (page - 1) * limit;
  const paginated = combined.slice(start, start + limit);
  const hasNext = start + limit < combined.length;
  return (
    <div>
      <h2>transactions</h2>
      <div className="transactions-grid">
        {paginated.map((item, idx) => {
          const isWithdrawal = !!item.timestamp;
          const date = new Date(
            item.timestamp || item.date
          ).toLocaleDateString();
          const amount = isWithdrawal
            ? `$${Math.abs(item.amount).toFixed(2)}`
            : `$${(item.amount / 100).toFixed(2)}`;
          const type = isWithdrawal ? 'withdrawal' : 'contribution';
          const typeClass = isWithdrawal
            ? 'transaction-withdrawal'
            : 'transaction-contribution';
          const uniqueKey =
            (item.id || item.stripeId || 'noId') + `-p${page}-i${idx}`;
          return (
            <div className="transaction-card" key={uniqueKey}>
              <div className="transaction-date">{date}</div>
              <div className={`transaction-type-amount ${typeClass}`}>
                {type}: {amount}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '10px' }}>
        <span className="page-text" style={{ marginRight: '8px' }}>
          page {page}/{totalPages}
        </span>
        {page > 1 && (
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            prev
          </button>
        )}
        {hasNext && <button onClick={() => setPage((p) => p + 1)}>next</button>}
      </div>
      <div className="total-contributed" style={{ marginTop: '10px' }}>
        <strong style={{ color: '#F5A9B8' }}>total contributions:</strong> $
        {totalContributed.toFixed(2)}
      </div>
    </div>
  );
}

function Contribute() {
  const handleContribute = () => {
    if (config.donateEnabled) {
      window.open(config.donateUrl, '_blank');
    }
  };
  return (
    <div>
      <h2>contribute</h2>
      <p>click the button to contribute securely via Stripe</p>
      <button
        className="contribute-btn"
        onClick={handleContribute}
        disabled={!config.donateEnabled}
      >
        {config.donateEnabled ? 'contribute now' : 'payments disabled'}
      </button>
      <p>
        disclaimer: contributions are anonymous and will not be disclosed,
        except as required by the IRS for individuals that contribute over
        $5,000 in a single year.
      </p>
    </div>
  );
}

function Fund({ latestData }) {
  return (
    <div>
      <Balance latestData={latestData} />
      <Transactions latestData={latestData} />
      <Contribute />
    </div>
  );
}

export default Fund;
