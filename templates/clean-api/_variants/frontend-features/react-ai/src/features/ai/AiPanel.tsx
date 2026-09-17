import { FormEvent, useState } from 'react';
import { askBusinessQuestion, type BusinessChatMessage } from './ai.api';

const DEFAULT_SUGGESTIONS = [
  'Summarize the current business situation.',
  'How many orders are pending right now?',
  'Which products are selling best?',
  'How many products are low on stock?',
];

export function AiPanel() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<BusinessChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function ask(value: string) {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    const history = messages.slice(-12);
    setMessages(current => [...current, { role: 'user', content: trimmed }]);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      const response = await askBusinessQuestion(trimmed, history);
      setMessages(current => [...current, { role: 'assistant', content: response.answer }]);
      setSuggestions(response.suggestedQuestions);
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

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Assistant</p>
          <h2>Business AI chat</h2>
        </div>
        <span className="pill">Read-only business data</span>
      </div>

      <p>
        Ask about revenue, orders, top products, inventory risk, recent activity, or practical operating suggestions.
        Questions that need unavailable metrics or fall outside the business scope are rejected by the application layer.
      </p>

      {messages.length > 0 && (
        <div className="stack">
          {messages.map((message, index) => (
            <div className="surface" key={`${message.role}-${index}`}>
              <strong>{message.role === 'user' ? 'You' : 'Business AI'}</strong>
              {message.role === 'assistant'
                ? <pre className="ai-output">{message.content}</pre>
                : <p>{message.content}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="stack">
        <p className="eyebrow">Try asking</p>
        <div>
          {suggestions.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void ask(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <form className="stack" onSubmit={submit}>
        <label>
          Question
          <textarea
            rows={4}
            maxLength={1000}
            value={question}
            placeholder="Example: Doanh thu và đơn hàng hiện tại có điểm gì cần chú ý?"
            onChange={event => setQuestion(event.target.value)}
          />
        </label>
        <button className="primary" disabled={loading || !question.trim()}>
          {loading ? 'Thinking…' : 'Ask business AI'}
        </button>
      </form>

      {error && <p className="error surface-error">{error}</p>}
    </section>
  );
}
