import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

function getContactInfoLabel(method) {
  switch (method) {
    case 'email':
      return 'email address';
    case 'signal':
      return 'signal username';
    case 'text':
      return 'mobile number';
    case 'discord':
      return 'discord username';
    default:
      return 'contact info';
  }
}

function mapRequestState(state) {
  return state.toLowerCase();
}

function CurrentRequests({ latestRequests }) {
  const [page, setPage] = useState(1);
  if (!latestRequests) {
    return (
      <div>
        <h2>requests for aid</h2>
        <div className="loading-text">loading requests...</div>
      </div>
    );
  }
  const sortedRequests = [...latestRequests].sort(
    (a, b) => new Date(b.requestReceivedAt) - new Date(a.requestReceivedAt)
  );
  const totalPaid = sortedRequests
    .filter((req) => req.state === 'Paid')
    .reduce((sum, req) => sum + parseFloat(req.amountRequested || 0), 0);
  const limit = 12;
  const totalPages = Math.ceil(sortedRequests.length / limit);
  const start = (page - 1) * limit;
  const paginatedRequests = sortedRequests.slice(start, start + limit);
  const hasNext = start + limit < sortedRequests.length;

  return (
    <div>
      <h2>requests for aid</h2>
      <div className="transactions-grid">
        {paginatedRequests.map((req, idx) => {
          const date = new Date(req.requestReceivedAt).toLocaleDateString();
          const amount = parseFloat(req.amountRequested);
          const cardClass = `transaction-card${
            req.state === 'Paid' ? ' paid-border' : ''
          }${req.state === 'Failed Verification' ? ' failed-verification' : ''}${
            req.state === 'Rejected' ? ' rejected' : ''
          }`;
          return (
            <div className={cardClass} key={req.id || idx}>
              <div className="transaction-date">{date}</div>
              <div className="transaction-type-amount">
                {req.category}: ${amount.toFixed(2)}
              </div>
              <div className="transaction-state">
                {mapRequestState(req.state)}
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
      <div className="total-paid" style={{ marginTop: '10px' }}>
        <strong style={{ color: '#F5A9B8' }}>total paid:</strong> $
        {totalPaid.toFixed(2)}
      </div>
    </div>
  );
}

function RequestAidForm({ refreshData }) {
  const [name, setName] = useState('');
  const [amountRequested, setAmountRequested] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isTrans, setIsTrans] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [receiveMethod, setReceiveMethod] = useState('');
  const [references, setReferences] = useState('');
  const [referral, setReferral] = useState('');
  const [receiveDetails, setReceiveDetails] = useState('');

  const handleReceiveMethodChange = (e) => {
    const method = e.target.value;
    setReceiveMethod(method);
    if (method === 'cash' || method === '') {
      setReceiveDetails('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !amountRequested ||
      !category ||
      !description ||
      !isTrans ||
      !neighborhood ||
      !pronouns ||
      !contactMethod ||
      !contactInfo ||
      !receiveMethod
    ) {
      alert('Please fill out all required fields.');
      return;
    }
    if (
      (receiveMethod === 'venmo' || receiveMethod === 'cash app') &&
      !receiveDetails
    ) {
      alert('Please provide your username for Venmo or Cash app.');
      return;
    }
    const payload = {
      name,
      isTrans,
      pronouns,
      amountRequested,
      category,
      description,
      neighborhood,
      socialMedia,
      contactMethod,
      contactInfo,
      receiveMethod,
      references,
      referral,
      receiveDetails,
    };
    try {
      const res = await fetch(config.api.endpoint + '/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Request submitted successfully.');
        refreshData(); // re-fetch the latest data
      } else {
        console.error('Error sending request:', {
          status: res.status,
          payload,
        });
        alert('There was an error submitting your request.');
      }
    } catch (error) {
      console.error('Error sending request:', error, payload);
      alert('There was an error submitting your request.');
    }
  };

  return (
    <div>
      <h2>new request</h2>
      <p>
        to request money from the fund, fill out this form. money will only be
        distributed to members of the Seattle trans community after they have
        been verified by our team.
      </p>
      <form
        onSubmit={handleSubmit}
        className="aid-form"
        aria-label="Request Aid Form"
        style={{ marginTop: '1rem' }}
      >
        <div className="aid-form-fields">
          <fieldset>
            <legend style={{ color: '#5BCEFA' }}>shared with our team</legend>
            <label htmlFor="name">name or nickname</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="pronouns">pronouns</label>
            <input
              id="pronouns"
              type="text"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              required
            />
            <label htmlFor="isTrans">do you identify as trans?</label>
            <select
              id="isTrans"
              value={isTrans}
              onChange={(e) => setIsTrans(e.target.value)}
              required
            >
              <option value="">select</option>
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
            <label htmlFor="description">what do you need the aid for?</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <label htmlFor="neighborhood">which neighborhood are you in?</label>
            <input
              id="neighborhood"
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
            />
            <label htmlFor="socialMedia">
              if you have any social media profiles that you'd like to share to
              help us verify your identity, please list them here
            </label>
            <textarea
              id="socialMedia"
              value={socialMedia}
              onChange={(e) => setSocialMedia(e.target.value)}
            />
            <label htmlFor="references">
              if you know anyone on our team, or anyone who has received aid
              from us before, please list them here
            </label>
            <textarea
              id="references"
              value={references}
              onChange={(e) => setReferences(e.target.value)}
            />
            <label htmlFor="referral">how did you hear about us?</label>
            <input
              id="referral"
              type="text"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            />
            <label htmlFor="contactMethod">
              how should we reach out to you?
            </label>
            <select
              id="contactMethod"
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              required
            >
              <option value="">select</option>
              <option value="discord">discord</option>
              <option value="signal">signal</option>
              <option value="email">email</option>
              <option value="text">text</option>
              <option value="other">other</option>
            </select>
            <label htmlFor="contactInfo">
              {getContactInfoLabel(contactMethod)}
            </label>
            <input
              id="contactInfo"
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
            />
            <label htmlFor="receiveMethod">
              how do you want to receive money?
            </label>
            <select
              id="receiveMethod"
              value={receiveMethod}
              onChange={handleReceiveMethodChange}
              required
            >
              <option value="">select</option>
              <option value="venmo">venmo</option>
              <option value="cash app">cash app</option>
              <option value="zelle">zelle</option>
              <option value="cash">cash</option>
            </select>
            {(receiveMethod === 'venmo' ||
              receiveMethod === 'cash app' ||
              receiveMethod === 'zelle') && (
              <>
                <label htmlFor="receiveDetails">
                  {receiveMethod === 'zelle'
                    ? 'zelle email address or phone number'
                    : `${receiveMethod} username`}
                </label>
                <input
                  id="receiveDetails"
                  type="text"
                  value={receiveDetails}
                  onChange={(e) => setReceiveDetails(e.target.value)}
                  required
                />
              </>
            )}
          </fieldset>
          <fieldset>
            <legend style={{ color: '#5BCEFA' }}>shared publicly</legend>
            <label htmlFor="amountRequested">amount requested</label>
            <input
              id="amountRequested"
              type="number"
              value={amountRequested}
              onChange={(e) => setAmountRequested(e.target.value)}
              required
            />
            <label htmlFor="category">category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">select</option>
              <option value="housing">housing</option>
              <option value="health">health</option>
              <option value="food">food</option>
              <option value="other">other</option>
            </select>
          </fieldset>
        </div>
        <p style={{ marginTop: '1rem' }}>
          once you submit, our team will begin reviewing your request. if you
          don't hear back within one week, please reach out to the email address
          or Discord channel on the{' '}
          <Link
            to="/about"
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            about
          </Link>{' '}
          page.
        </p>
        <button type="submit" disabled={!config.requestAidEnabled}>
          {config.requestAidEnabled ? 'request aid' : 'requests disabled'}
        </button>
      </form>
    </div>
  );
}

function Aid({ latestRequests, refreshData }) {
  return (
    <div>
      <CurrentRequests latestRequests={latestRequests} />
      <RequestAidForm refreshData={refreshData} />
    </div>
  );
}

export default Aid;
