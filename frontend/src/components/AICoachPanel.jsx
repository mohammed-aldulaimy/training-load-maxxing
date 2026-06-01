/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Sparkles, BrainCircuit, Key, CheckCircle2, AlertTriangle, Calendar, RefreshCw, Eye, EyeOff, FileText } from 'lucide-react';

function SoccerMarkdownRenderer({ markdown }) {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const renderedElements = [];

  let listItems = [];
  let tableHeaders = [];
  let tableRows = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      const isWeaknessList = renderedElements.some(el =>
        el.props && el.props.className && el.props.className.includes('header-improvement')
      ) && !renderedElements.some(el =>
        el.props && el.props.className && el.props.className.includes('header-schedule')
      );

      renderedElements.push(
        <ul key={`list-${key}`} className="markdown-list" data-status={isWeaknessList ? 'warning' : 'success'}>
          {listItems.map((item, itemIdx) => {
            const boldMatch = item.match(/^\*\*(.*?)\*\*:(.*)/);
            let boldContent = item;

            if (boldMatch) {
              boldContent = (
                <span>
                  <strong>{boldMatch[1]}:</strong>
                  {boldMatch[2]}
                </span>
              );
            }

            return (
              <li key={itemIdx}>
                <span className="markdown-list__mark">
                  {isWeaknessList ? '!' : '✓'}
                </span>
                <span>{boldContent}</span>
              </li>
            );
          })}
        </ul>
      );
      listItems = [];
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      renderedElements.push(
        <div key={`table-wrapper-${key}`} className="table-responsive">
          <table className="markdown-table">
            <thead>
              <tr>
                {tableHeaders.map((h, idx) => (
                  <th key={idx}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => {
                    const cleanCell = cell.replace(/\*\*/g, '');

                    return <td key={cellIdx}>{cleanCell}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('|-') || trimmed.startsWith('| -') || trimmed === '---') {
      return;
    }

    if (trimmed.startsWith('|')) {
      flushList(idx);
      const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);

      if (cells.every(c => c.startsWith(':---') || c.startsWith('---') || c.startsWith(':--') || c.endsWith('---:'))) {
        return;
      }

      if (tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else {
      flushTable(idx);
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(trimmed.substring(2));
      return;
    } else {
      flushList(idx);
    }

    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h2 key={idx}>
          {trimmed.substring(2)}
        </h2>
      );
    }
    else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const text = trimmed.startsWith('## ') ? trimmed.substring(3) : trimmed.substring(4);
      let icon = <FileText size={16} />;
      let className = '';
      let status = 'neutral';

      if (text.includes('Status Summary')) {
        icon = <Sparkles size={16} />;
        className = 'header-status';
        status = 'info';
      } else if (text.includes('Strengths')) {
        icon = <CheckCircle2 size={16} />;
        className = 'header-strengths';
        status = 'success';
      } else if (text.includes('Improvement')) {
        icon = <AlertTriangle size={16} />;
        className = 'header-improvement';
        status = 'warning';
      } else if (text.includes('Calendar') || text.includes('Schedule')) {
        icon = <Calendar size={16} />;
        className = 'header-schedule';
        status = 'info';
      }

      renderedElements.push(
        <h3 key={idx} className={className} data-status={status}>
          {icon}
          <span>{text.replace(/\(.*\)/g, '')}</span>
        </h3>
      );
    }
    else {
      const isGreen = trimmed.includes('🟢') || trimmed.includes('FIT & AVAILABLE');
      const isRed = trimmed.includes('🔴') || trimmed.includes('EXTREME INJURY RISK') || trimmed.includes('CRITICAL');
      const isAmber = trimmed.includes('🟡') || trimmed.includes('MONITOR CLOSELY');

      let status = '';
      if (isGreen) {
        status = 'success';
      } else if (isRed) {
        status = 'danger';
      } else if (isAmber) {
        status = 'warning';
      }

      const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');

      renderedElements.push(
        <p
          key={idx}
          className={status ? 'markdown-banner' : undefined}
          data-status={status || undefined}
        >
          {cleanText}
        </p>
      );
    }
  });

  flushList(lines.length);
  flushTable(lines.length);

  return <div className="markdown-body">{renderedElements}</div>;
}

export default function AICoachPanel({ insights, loading, onRefresh, apiKey, onApiKeyChange }) {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [showMaskedKey, setShowMaskedKey] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    onApiKeyChange(tempKey);
    setShowKeyInput(false);
  };

  const loadingQuotes = [
    "Analyzing cardiac autonomic biometrics...",
    "Computing Acute:Chronic workload ratios...",
    "Drafting periodized vascular recovery plans...",
    "Calibrating peripheral muscular thresholds...",
    "Consulting athletic coaching algorithms..."
  ];

  const [loadingQuoteIdx] = useState(() => Math.floor(Math.random() * loadingQuotes.length));

  return (
    <section className="panel insights-panel">
      {loading && (
        <div className="insights-panel__loading">
          <div className="insights-panel__loading-content">
            <div className="loading-spinner" />
            <h3>Insights are updating...</h3>
            <p>{loadingQuotes[loadingQuoteIdx]}</p>
          </div>
        </div>
      )}

      <div className="insights-panel__header">
        <div className="insights-panel__title">
          <BrainCircuit size={22} aria-hidden="true" />
          <div>
            <h2>Insights</h2>
            <p className="insights-panel__subtitle">Load and readiness recommendations</p>
          </div>
        </div>

        <div className="insights-panel__actions">
          {apiKey ? (
            <span className="badge badge-success">
              <Sparkles size={10} /> Gemini Connected
            </span>
          ) : (
            <span className="badge badge-info">
              Background AI Active
            </span>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => setShowKeyInput(!showKeyInput)}
          >
            <Key size={13} /> {showKeyInput ? 'Close' : 'Configure'}
          </button>
        </div>
      </div>

      {showKeyInput && (
        <form onSubmit={handleSaveKey} className="settings-form">
          <label className="settings-form__label">
            Gemini API key
            <span className="settings-form__hint">
              Stored locally and used only for this insights panel.
            </span>
          </label>

          <div className="settings-form__row">
            <input
              type={showMaskedKey ? 'text' : 'password'}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste Gemini key"
              className="input-field"
            />
            <button
              type="button"
              onClick={() => setShowMaskedKey(!showMaskedKey)}
              className="icon-button"
              aria-label={showMaskedKey ? 'Hide API key' : 'Show API key'}
            >
              {showMaskedKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>

            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      )}

      {insights && insights.markdown && (
        <>
          <SoccerMarkdownRenderer markdown={insights.markdown} />

          <button
            className="btn btn-secondary refresh-button"
            onClick={onRefresh}
          >
            <RefreshCw size={13} /> Refresh insights
          </button>
        </>
      )}
    </section>
  );
}
