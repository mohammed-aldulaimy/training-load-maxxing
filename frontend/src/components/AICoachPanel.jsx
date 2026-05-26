import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Key, CheckCircle2, AlertTriangle, Calendar, RefreshCw, Eye, EyeOff, FileText } from 'lucide-react';

// Custom Lightweight Premium Markdown Parser Component
function SoccerMarkdownRenderer({ markdown }) {
  if (!markdown) return null;

  // Split content by lines
  const lines = markdown.split('\n');
  const renderedElements = [];
  
  let inList = false;
  let listItems = [];
  
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      // Determine if this is Strengths list or Weaknesses list based on the last rendered header
      const isWeaknessList = renderedElements.some(el => 
        el.props && el.props.className && el.props.className.includes('header-improvement')
      ) && !renderedElements.some(el => 
        el.props && el.props.className && el.props.className.includes('header-schedule')
      );

      renderedElements.push(
        <ul key={`list-${key}`} style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          margin: '0.5rem 0 1rem 0'
        }}>
          {listItems.map((item, itemIdx) => {
            // Check for bold headlines like **Headline**: text
            const boldMatch = item.match(/^\*\*(.*?)\*\*:(.*)/);
            let boldContent = item;
            
            if (boldMatch) {
              boldContent = (
                <span>
                  <strong style={{ color: '#fff', fontWeight: '700' }}>{boldMatch[1]}:</strong>
                  {boldMatch[2]}
                </span>
              );
            }

            return (
              <li key={itemIdx} style={{
                display: 'flex',
                gap: '0.5rem',
                fontSize: '0.78rem',
                lineHeight: '1.4',
                color: 'hsl(var(--text-secondary))',
                alignItems: 'flex-start'
              }}>
                <span style={{ 
                  color: isWeaknessList ? 'hsl(var(--color-warning))' : 'hsl(var(--color-success))', 
                  fontWeight: '900',
                  marginTop: '1px'
                }}>
                  {isWeaknessList ? '!' : '✓'}
                </span>
                <span>{boldContent}</span>
              </li>
            );
          })}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      renderedElements.push(
        <div key={`table-wrapper-${key}`} className="table-responsive" style={{
          overflowX: 'auto',
          margin: '0.75rem 0 1.25rem 0',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.75rem',
            textAlign: 'left',
            background: 'rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {tableHeaders.map((h, idx) => (
                  <th key={idx} style={{
                    padding: '0.65rem 0.85rem',
                    fontWeight: '700',
                    color: 'hsl(var(--color-primary))',
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    letterSpacing: '0.02em'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: 'var(--transition-smooth)',
                  background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.005)'
                }} className="table-row-hover">
                  {row.map((cell, cellIdx) => {
                    // Make days bold and electric cyan
                    const isDayCell = cellIdx === 0;
                    const cleanCell = cell.replace(/\*\*/g, '');
                    
                    return (
                      <td key={cellIdx} style={{
                        padding: '0.65rem 0.85rem',
                        color: isDayCell ? 'hsl(var(--color-primary))' : 'hsl(var(--text-secondary))',
                        fontWeight: isDayCell ? '800' : '500',
                        lineHeight: '1.35',
                        fontFamily: isDayCell ? 'var(--font-display)' : 'inherit',
                        maxWidth: cellIdx === 2 ? '300px' : 'auto'
                      }}>
                        {cleanCell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <style dangerouslySetInnerHTML={{__html: `
            .table-row-hover:hover {
              background-color: rgba(255,255,255,0.02) !important;
            }
          `}} />
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 1. Skip dividers or blank lines
    if (!trimmed || trimmed.startsWith('|-') || trimmed.startsWith('| -') || trimmed === '---') {
      return;
    }

    // 2. Detect Table Block
    if (trimmed.startsWith('|')) {
      flushList(idx);
      inTable = true;
      const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
      
      // If it looks like a markdown spacer line, skip it
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

    // 3. Detect List Items
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      inList = true;
      listItems.push(trimmed.substring(2));
      return;
    } else {
      flushList(idx);
    }

    // 4. Headers
    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h2 key={idx} style={{
          fontSize: '1.4rem',
          fontWeight: '800',
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(90deg, #fff, hsl(var(--color-primary)))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '0.5rem'
        }}>
          {trimmed.substring(2)}
        </h2>
      );
    } 
    else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const text = trimmed.startsWith('## ') ? trimmed.substring(3) : trimmed.substring(4);
      
      // Select beautiful colored classes corresponding to headers
      let icon = <FileText size={16} />;
      let headerColor = 'hsl(var(--text-primary))';
      let className = '';

      if (text.includes('Status Summary')) {
        icon = <Sparkles size={16} style={{ color: 'hsl(var(--color-primary))' }} />;
        headerColor = 'hsl(var(--color-primary))';
        className = 'header-status';
      } else if (text.includes('Strengths')) {
        icon = <CheckCircle2 size={16} style={{ color: 'hsl(var(--color-success))' }} />;
        headerColor = 'hsl(var(--color-success))';
        className = 'header-strengths';
      } else if (text.includes('Improvement')) {
        icon = <AlertTriangle size={16} style={{ color: 'hsl(var(--color-warning))' }} />;
        headerColor = 'hsl(var(--color-warning))';
        className = 'header-improvement';
      } else if (text.includes('Calendar') || text.includes('Schedule')) {
        icon = <Calendar size={16} style={{ color: 'hsl(var(--color-secondary))' }} />;
        headerColor = 'hsl(var(--color-secondary))';
        className = 'header-schedule';
      }

      renderedElements.push(
        <div key={idx} className={className} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginTop: '1.25rem',
          marginBottom: '0.5rem',
          color: headerColor,
          fontFamily: 'var(--font-display)',
          fontWeight: '800',
          fontSize: '0.88rem',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
          paddingBottom: '0.35rem'
        }}>
          {icon}
          <span>{text.replace(/\(.*\)/g, '')}</span>
        </div>
      );
    } 
    // 5. Standard Text Paragraphs
    else {
      // Check if it's the green banner text or warning banner text (under status summary)
      const isGreen = trimmed.includes('🟢') || trimmed.includes('FIT & AVAILABLE');
      const isRed = trimmed.includes('🔴') || trimmed.includes('EXTREME INJURY RISK') || trimmed.includes('CRITICAL');
      const isAmber = trimmed.includes('🟡') || trimmed.includes('MONITOR CLOSELY');
      
      let bannerStyle = {};
      if (isGreen) {
        bannerStyle = {
          background: 'hsla(var(--color-success), 0.06)',
          borderLeft: '4px solid hsl(var(--color-success))',
          color: 'hsl(var(--text-primary))'
        };
      } else if (isRed) {
        bannerStyle = {
          background: 'hsla(var(--color-danger), 0.06)',
          borderLeft: '4px solid hsl(var(--color-danger))',
          color: 'hsl(var(--text-primary))'
        };
      } else if (isAmber) {
        bannerStyle = {
          background: 'hsla(var(--color-warning), 0.06)',
          borderLeft: '4px solid hsl(var(--color-warning))',
          color: 'hsl(var(--text-primary))'
        };
      }

      // Handle raw inline bolds e.g. **Text**
      const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');

      renderedElements.push(
        <p key={idx} style={{
          fontSize: '0.8rem',
          lineHeight: '1.45',
          color: isGreen || isRed || isAmber ? '#fff' : 'hsl(var(--text-secondary))',
          padding: isGreen || isRed || isAmber ? '0.75rem 1rem' : '0',
          borderRadius: isGreen || isRed || isAmber ? 'var(--radius-sm)' : '0',
          margin: '0.5rem 0 1rem 0',
          fontWeight: isGreen || isRed || isAmber ? '600' : '400',
          ...bannerStyle
        }}>
          {cleanText}
        </p>
      );
    }
  });

  // Flush remaining lists or tables
  flushList(lines.length);
  flushTable(lines.length);

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>{renderedElements}</div>;
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
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
      
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-lg)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div className="loading-spinner" />
          <h4 style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-primary))', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            AI Coach is thinking...
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontStyle: 'italic', maxWidth: '300px' }}>
            "{loadingQuotes[loadingQuoteIdx]}"
          </p>
        </div>
      )}

      {/* Header Widget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit className="pulse-primary" style={{ color: 'hsl(var(--color-primary))' }} size={24} />
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
              LLM AI Head of Performance
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
              Dynamic Squad Load & Readiness Assessments
            </span>
          </div>
        </div>

        {/* API Settings Panel Trigger */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {apiKey ? (
            <span className="badge badge-success" style={{ fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Sparkles size={10} /> Gemini Connected
            </span>
          ) : (
            <span className="badge badge-info" style={{ fontSize: '0.62rem' }}>
              Background AI Active
            </span>
          )}
          
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: 'var(--radius-sm)' }}
          >
            <Key size={11} /> {showKeyInput ? 'Close Config' : 'Configure LLM'}
          </button>
        </div>
      </div>

      {/* Settings Panel Key Input */}
      {showKeyInput && (
        <form onSubmit={handleSaveKey} className="glass-card" style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          border: '1px dashed hsla(var(--color-primary), 0.3)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'hsl(var(--text-secondary))' }}>
              Connect Custom Gemini API Key
            </label>
            <p style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
              Enter a custom Gemini API key to override the background club settings. Keys are stored locally on your machine.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
            <input 
              type={showMaskedKey ? 'text' : 'password'} 
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste AIzaSy... key here"
              className="input-field"
              style={{ fontSize: '0.8rem', paddingRight: '2.5rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowMaskedKey(!showMaskedKey)}
              style={{
                position: 'absolute',
                right: '90px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'hsl(var(--text-muted))',
                cursor: 'pointer'
              }}
            >
              {showMaskedKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              Save
            </button>
          </div>
        </form>
      )}

      {/* Render the strict Rich Markdown Document directly */}
      {insights && insights.markdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <SoccerMarkdownRenderer markdown={insights.markdown} />
          
          <button 
            className="btn btn-secondary flex items-center justify-center gap-2"
            onClick={onRefresh}
            style={{ width: '100%', fontSize: '0.75rem', padding: '0.45rem 1rem', marginTop: '0.5rem' }}
          >
            <RefreshCw size={13} /> Re-analyze & Refresh AI Coach
          </button>
        </div>
      )}

    </div>
  );
}
