import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  askBusinessQuestion,
  getBusinessChatHistory,
  type BusinessChatMessage,
} from './ai.api';
import './ai.css';

const DEFAULT_SUGGESTIONS = [
  'Summarize the current business situation.',
  'How many orders are pending right now?',
  'Which products are selling best?',
  'How many products are low on stock?',
];

function AssistantAnswer({ content }: { content: string }) {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length <= 1) return <p className="ai-answer-paragraph">{content}</p>;

  return (
    <div className="ai-answer">
      {lines.map((line, index) => {
        const bullet = line.match(/^[-*•]\s+(.*)$/);
        if (bullet) {
          return (
            <div className="ai-answer-bullet" key={`${line}-${index}`}>
              <span aria-hidden="true">•</span>
              <span>{bullet[1]}</span>
            </div>
          );
        }

        if (line.length < 72 && line.endsWith(':')) {
          return <strong className="ai-answer-heading" key={`${line}-${index}`}>{line}</strong>;
        }

        return <p className="ai-answer-paragraph" key={`${line}-${index}`}>{line}</p>;
      })}
    </div>
  );
}

export function AiPanel() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<BusinessChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    void getBusinessChatHistory()
      .then(history => {
        if (active) setMessages(history);
      })
      .catch(() => {
        // History is optional at runtime; a Redis outage should not hide the assistant.
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, open]);

  async function ask(value: string) {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    setMessages(current => [...current, { role: 'user', content: trimmed }]);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      const response = await askBusinessQuestion(trimmed);
      setMessages(current => [...current, { role: 'assistant', content: response.answer }]);
      setSuggestions(response.suggestedQuestions.length > 0 ? response.suggestedQuestions : DEFAULT_SUGGESTIONS);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Business AI request failed.');
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await ask(question);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void ask(question);
    }
  }

  return (
    <div className="ai-chat-root">
      {open && (
        <section className="ai-chat-panel" aria-label="Business AI assistant">
          <header className="ai-chat-header">
            <div className="ai-chat-brand">
              <span className="ai-chat-avatar" aria-hidden="true">✦</span>
              <div>
                <strong>Business AI</strong>
                <span>Read-only assistant</span>
              </div>
            </div>
            <button className="ai-chat-icon-button" type="button" aria-label="Close AI chat" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className="ai-chat-body">
            {historyLoading && messages.length === 0 && (
              <div className="ai-chat-status">Loading today&apos;s conversation…</div>
            )}

            {!historyLoading && messages.length === 0 && (
              <div className="ai-chat-welcome">
                <span className="ai-chat-welcome-icon" aria-hidden="true">✦</span>
                <strong>What do you want to know?</strong>
                <p>Ask about revenue, orders, products, inventory, recent activity, or practical operating signals.</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                className={`ai-message-row ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}
                key={`${message.role}-${index}`}
              >
                <div className="ai-message-bubble">
                  {message.role === 'assistant'
                    ? <AssistantAnswer content={message.content} />
                    : <p>{message.content}</p>}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message-row is-assistant">
                <div className="ai-message-bubble ai-typing" aria-label="AI is thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="ai-chat-suggestions">
            {suggestions.slice(0, 3).map(suggestion => (
              <button key={suggestion} type="button" disabled={loading} onClick={() => void ask(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>

          {error && <p className="ai-chat-error">{error}</p>}

          <form className="ai-chat-composer" onSubmit={submit}>
            <textarea
              rows={1}
              maxLength={1000}
              value={question}
              placeholder="Ask about your business…"
              aria-label="Ask Business AI"
              onKeyDown={handleKeyDown}
              onChange={event => setQuestion(event.target.value)}
            />
            <button className="ai-chat-send" type="submit" disabled={loading || !question.trim()} aria-label="Send message">
              ↑
            </button>
          </form>

          <div className="ai-chat-footnote">History resets automatically at 00:00 UTC.</div>
        </section>
      )}

      <button
        className={`ai-chat-launcher ${open ? 'is-open' : ''}`}
        type="button"
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        {open ? '×' : '✦'}
      </button>
    </div>
  );
}
