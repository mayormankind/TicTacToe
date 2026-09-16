import { useState, useEffect, useRef } from 'preact/hooks';

export function ChatBox({ messages, onSend, myName }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };

  return (
    <div class="chatbox">
      <div class="chat-messages">
        {messages.length === 0 ? (
          <p class="chat-empty">No messages yet — say something!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} class={`chat-msg ${m.name === myName ? 'chat-mine' : 'chat-theirs'}`}>
              <span class="chat-sender">{m.name}</span>
              <span class="chat-text">{m.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form class="chat-form" onSubmit={handleSend}>
        <input
          type="text"
          maxLength={200}
          placeholder="Type a message..."
          value={input}
          onInput={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
