(() => {
  const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
  const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
  const CHAT_STORAGE_KEY = "tlfta_ai_chat_messages_v1";
  const API_KEY_STORAGE_KEY = "tlfta_openrouter_api_key";
  const PREFERRED_FREE_MODELS = [
    "meta-llama/llama-3.3-8b-instruct:free",
    "qwen/qwen3-14b:free",
    "google/gemma-3-12b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "deepseek/deepseek-chat-v3-0324:free",
  ];
  const WELCOME_MESSAGE = "Hi I'm Lex! Ask me any question about the firm.";
  const LEGACY_WELCOME_MESSAGES = new Set([
    "Hello. Ask me about the firm, practice areas, lawyers, and consultation details. For legal advice on your specific case, please book a consultation.",
  ]);
  const CHATBOT_STYLE_ID = "tlfta-ai-chatbot-style";

  const injectChatbotShell = () => {
    if (document.getElementById("ai-chatbot")) return false;
    if (!document.body) return false;

    const wrapper = document.createElement("div");
    wrapper.className = "ai-chatbot";
    wrapper.id = "ai-chatbot";
    wrapper.innerHTML = `
      <button
        type="button"
        id="ai-chat-toggle"
        class="ai-chat-toggle"
        aria-expanded="false"
        aria-controls="ai-chat-panel"
        aria-label="Open Lex chat"
      >
        <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
          <path d="M5 3h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-5.2L9 22v-4H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm2.6 9a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7Zm4.4 0a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7Zm4.4 0a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7Z"/>
        </svg>
      </button>
      <section class="ai-chat-panel" id="ai-chat-panel" hidden>
        <div class="ai-chat-head">
          <div>
            <h3>Hi, I'm Lex! Ask me a question.</h3>
            <p>Ask about services, lawyers, and office details.</p>
          </div>
          <button class="ai-chat-close" id="ai-chat-close" type="button" aria-label="Close chatbot">x</button>
        </div>
        <div class="ai-chat-model" id="ai-chat-model">Connecting to OpenRouter free model...</div>
        <div class="ai-chat-messages" id="ai-chat-messages" aria-live="polite"></div>
        <form id="ai-chat-form" class="ai-chat-form">
          <label for="ai-chat-input" style="display: none">Message</label>
          <textarea
            id="ai-chat-input"
            class="ai-chat-input"
            placeholder="Ask about our lawyers, services, or consultation process..."
            required
          ></textarea>
          <div class="ai-chat-actions">
            <button type="button" id="ai-chat-reset" class="ai-chat-reset">Reset</button>
            <button type="submit" id="ai-chat-send" class="ai-chat-send">Send</button>
          </div>
          <p class="ai-chat-note">
            The information on this website is for general informational purposes only and does not constitute legal advice.
          </p>
        </form>
      </section>
    `;
    document.body.appendChild(wrapper);
    return true;
  };

  const injectChatbotStyles = () => {
    if (document.getElementById(CHATBOT_STYLE_ID)) return;
    if (!document.head) return;

    const style = document.createElement("style");
    style.id = CHATBOT_STYLE_ID;
    style.textContent = `
      .ai-chatbot {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 1200;
        width: min(400px, calc(100vw - 24px));
        display: grid;
        justify-items: end;
        gap: 0.65rem;
      }
      .ai-chatbot.open { gap: 0; }
      .ai-chat-toggle {
        width: 58px;
        height: 58px;
        border: 1px solid #c9a84c;
        border-radius: 999px;
        background: #390d2f;
        color: #ffffff;
        padding: 0;
        cursor: pointer;
        display: grid;
        place-items: center;
        box-shadow: 0 12px 22px rgba(57, 13, 47, 0.32);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .ai-chat-toggle svg {
        width: 27px;
        height: 27px;
        fill: currentColor;
        transition: transform 0.2s ease;
      }
      .ai-chat-toggle:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 16px 28px rgba(57, 13, 47, 0.42);
      }
      .ai-chat-toggle:hover svg {
        transform: scale(1.06);
      }
      .ai-chat-toggle:focus-visible {
        outline: 2px solid #4a1040;
        outline-offset: 2px;
      }
      .ai-chat-panel {
        width: 100%;
        margin: 0;
        padding: 0 !important;
        max-height: min(70vh, 560px);
        background: #faf8f5;
        border: 1px solid #c9a84c;
        border-radius: 16px;
        box-shadow: 0 28px 54px rgba(57, 13, 47, 0.24);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      .ai-chatbot.open .ai-chat-panel { display: flex; }
      .ai-chatbot.open .ai-chat-toggle { display: none; }
      .ai-chat-head {
        display: flex;
        justify-content: space-between;
        gap: 0.85rem;
        align-items: flex-start;
        padding: 0.8rem 1rem 0.68rem;
        background: linear-gradient(160deg, #390d2f 0%, #4a1040 100%);
        border-bottom: 1px solid rgba(201, 168, 76, 0.55);
      }
      .ai-chat-head h3 {
        margin: 0;
        font-size: 1.08rem;
        color: #faf8f5;
      }
      .ai-chat-head p {
        margin: 0.28rem 0 0;
        color: rgba(250, 248, 245, 0.85);
        font-size: 0.79rem;
        line-height: 1.35;
      }
      .ai-chat-close {
        width: 30px;
        height: 30px;
        border: 1px solid rgba(201, 168, 76, 0.65);
        border-radius: 999px;
        background: rgba(250, 248, 245, 0.14);
        color: #faf8f5;
        font-size: 1.05rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        display: grid;
        place-items: center;
      }
      .ai-chat-model {
        padding: 0.5rem 1rem;
        font-size: 0.72rem;
        color: #390d2f;
        border-bottom: 1px solid rgba(201, 168, 76, 0.55);
        background: #f4ecdf;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ai-chat-messages {
        padding: 0.7rem 0.9rem;
        background: radial-gradient(circle at top right, #fff7e8 0%, #faf8f5 62%, #f7f2eb 100%);
        overflow-y: auto;
        flex: 1 1 auto;
        display: grid;
        gap: 0.55rem;
        align-content: start;
      }
      .ai-chat-bubble {
        max-width: 89%;
        border-radius: 14px;
        padding: 0.68rem 0.78rem;
        font-size: 0.9rem;
        line-height: 1.42;
        white-space: pre-wrap;
      }
      .ai-chat-bubble.user {
        margin-left: auto;
        background: linear-gradient(140deg, #4d1543 0%, #390d2f 100%);
        color: #ffffff;
      }
      .ai-chat-bubble.assistant {
        margin-right: auto;
        background: #f8efe0;
        border: 1px solid #dcc28c;
        color: #311027;
      }
      .ai-chat-bubble code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        background: rgba(57, 13, 47, 0.08);
        padding: 0.1rem 0.3rem;
        border-radius: 5px;
        font-size: 0.84em;
      }
      .ai-chat-form {
        border-top: 1px solid rgba(201, 168, 76, 0.55);
        padding: 0.6rem 0.85rem 0.55rem;
        background: #faf8f5;
      }
      .ai-chat-input {
        width: 100%;
        border: 1px solid #ccb072;
        border-radius: 12px;
        min-height: 72px;
        max-height: 132px;
        padding: 0.68rem 0.72rem;
        font: inherit;
        font-size: 0.9rem;
        line-height: 1.42;
        resize: vertical;
      }
      .ai-chat-input:focus {
        outline: none;
        border-color: #390d2f;
        box-shadow: 0 0 0 3px rgba(57, 13, 47, 0.16);
      }
      .ai-chat-actions {
        margin-top: 0.55rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.55rem;
      }
      .ai-chat-actions button {
        border: none;
        border-radius: 999px;
        font: inherit;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        padding: 0.52rem 0.92rem;
      }
      .ai-chat-send {
        background: linear-gradient(135deg, #ef6c11 0%, #d95b05 100%);
        color: #ffffff;
      }
      .ai-chat-reset {
        background: #e9ddbf;
        color: #390d2f;
      }
      .ai-chat-note {
        margin: 0.5rem 0 0;
        color: #5a4d45;
        font-size: 0.72rem;
        line-height: 1.35;
      }
      @media (max-width: 780px) {
        .ai-chatbot {
          right: 10px;
          bottom: 10px;
          width: calc(100vw - 20px);
        }
        .ai-chat-toggle {
          width: 52px;
          height: 52px;
        }
        .ai-chat-toggle svg {
          width: 24px;
          height: 24px;
        }
        .ai-chat-panel {
          max-height: 66vh;
          border-radius: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  };

  if (injectChatbotShell()) {
    injectChatbotStyles();
  }

  const chatbot = document.getElementById("ai-chatbot");
  const toggleButton = document.getElementById("ai-chat-toggle");
  const closeButton = document.getElementById("ai-chat-close");
  const panel = document.getElementById("ai-chat-panel");
  const modelEl = document.getElementById("ai-chat-model");
  const messagesEl = document.getElementById("ai-chat-messages");
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");
  const sendButton = document.getElementById("ai-chat-send");
  const resetButton = document.getElementById("ai-chat-reset");

  if (
    !chatbot ||
    !toggleButton ||
    !closeButton ||
    !panel ||
    !messagesEl ||
    !form ||
    !input ||
    !sendButton ||
    !resetButton
  ) {
    return;
  }

  const refererValue =
    typeof window.location.origin === "string" && window.location.origin !== "null"
      ? window.location.origin
      : "http://localhost";

  const firmContext = [
    "Firm: The Law Firm of Talampas & Associates.",
    "Tagline: Professionalism. Integrity. Excellence.",
    "Jurisdiction: Philippines only, primarily Quezon City and Metro Manila.",
    "Main office: Unit 202 Philippine College of Surgeons, 992 EDSA, Brgy. Sto. Cristo beside SM North EDSA Annex Bldg 1105, Quezon City, Philippines.",
    "Contact: 289620069 and talampasandassociates@yahoo.com.",
    "Business hours: 9 AM to 5 PM (UTC+8).",
    "Lawyers: Atty. Ruben C. Talampas Jr. (Managing Partner), Atty. Clarolyn Jane A. Capellan, Atty. Jan Aldrin E. Afos, Atty. Louella O. Janda, Atty. Geelleanne L. Ubalde.",
    "Practice areas include: Family Law, Corporate Law, Labor Law, Cybercrime Law, Environmental Law, Civil Law, Arbitration & ADR, Banking & Insurance, Intellectual Property, Taxation, Immigration, Mining, Real Estate, Product Liability.",
  ].join(" ");

  const systemPrompt = [
    "You are Lex, the website assistant for The Law Firm of Talampas & Associates in the Philippines.",
    firmContext,
    "Primary behavior: answer questions about this firm first (services, lawyers, office details, consultation).",
    "Provide only general informational guidance, not legal advice.",
    "Never guarantee outcomes.",
    "Do not claim the firm is outside Philippine jurisdiction.",
    "If the question needs case-specific legal strategy, advise booking a consultation with the firm.",
    "Keep responses concise, practical, and professional.",
    "Include this reminder when appropriate: visiting this website does not create an attorney-client relationship.",
  ].join(" ");

  const state = {
    messages: [],
    availableFreeModels: [],
    selectedModel: "",
    isSending: false,
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatAssistantContent = (value) => {
    const escaped = escapeHtml(value);
    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  const loadSavedMessages = () => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
        .map((entry) => ({
          role: entry.role,
          content: String(entry.content || ""),
        }))
        .filter((entry) => entry.content)
        .filter((entry) => !(entry.role === "assistant" && LEGACY_WELCOME_MESSAGES.has(entry.content)));
    } catch (error) {
      return [];
    }
  };

  const saveMessages = () => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state.messages.slice(-24)));
    } catch (error) {
      // Ignore storage errors.
    }
  };

  const setModelStatus = (text) => {
    if (modelEl) modelEl.textContent = text;
  };

  const scrollToLatest = () => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const appendBubble = (role, content) => {
    const bubble = document.createElement("div");
    bubble.className = `ai-chat-bubble ${role}`;
    bubble.innerHTML = role === "assistant" ? formatAssistantContent(content) : escapeHtml(content);
    messagesEl.appendChild(bubble);
    scrollToLatest();
    return bubble;
  };

  const renderAllMessages = () => {
    messagesEl.innerHTML = "";
    state.messages.forEach((entry) => appendBubble(entry.role, entry.content));
    if (!state.messages.length) {
      appendBubble("assistant", WELCOME_MESSAGE);
    }
  };

  const getApiKey = () => {
    const globalKey = typeof window !== "undefined" ? window.TLFTA_OPENROUTER_API_KEY : "";
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY) || "";
    return String(globalKey || storedKey || "").trim();
  };

  const ensureApiKey = () => {
    const existingKey = getApiKey();
    if (existingKey) return existingKey;
    const entered = window.prompt("Enter your OpenRouter API key to use the AI assistant:");
    const cleaned = String(entered || "").trim();
    if (!cleaned) return "";
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, cleaned);
    } catch (error) {
      // Ignore storage errors.
    }
    return cleaned;
  };

  const toModelList = (payload) => {
    if (!payload || !Array.isArray(payload.data)) return [];
    return payload.data
      .map((entry) => (entry && typeof entry.id === "string" ? entry.id.trim() : ""))
      .filter(Boolean);
  };

  const pickModel = (freeModels) => {
    if (!freeModels.length) return "";
    const preferred = PREFERRED_FREE_MODELS.find((id) => freeModels.includes(id));
    return preferred || freeModels[0];
  };

  const loadFreeModels = async () => {
    try {
      const response = await fetch(OPENROUTER_MODELS_URL);
      if (!response.ok) {
        throw new Error(`Model list request failed (${response.status})`);
      }
      const payload = await response.json();
      const freeModels = toModelList(payload).filter((id) => id.endsWith(":free"));
      state.availableFreeModels = freeModels;
      state.selectedModel = pickModel(freeModels);
      if (state.selectedModel) {
        setModelStatus(`OpenRouter model: ${state.selectedModel}`);
      } else {
        setModelStatus("No OpenRouter free model found. Check OpenRouter model availability.");
      }
    } catch (error) {
      setModelStatus("Unable to load OpenRouter model list. A fallback free model will be attempted.");
      state.selectedModel = PREFERRED_FREE_MODELS[0];
    }
  };

  const normalizeResponseText = (payload) => {
    const firstChoice = payload && Array.isArray(payload.choices) ? payload.choices[0] : null;
    const message = firstChoice && firstChoice.message ? firstChoice.message : null;
    const content = message ? message.content : "";
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
      return content
        .map((part) => (part && typeof part.text === "string" ? part.text : ""))
        .join("")
        .trim();
    }
    return "";
  };

  const requestCompletion = async (apiKey, model, messages) => {
    const response = await fetch(OPENROUTER_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": refererValue,
        "X-Title": "TalampasLaw Website Chatbot",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 450,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload && errorPayload.error && errorPayload.error.message
        ? errorPayload.error.message
        : `OpenRouter request failed (${response.status})`;
      throw new Error(message);
    }

    return response.json();
  };

  const getCandidateModels = () => {
    const ordered = [
      state.selectedModel,
      ...PREFERRED_FREE_MODELS,
      ...state.availableFreeModels,
    ].filter(Boolean);
    return [...new Set(ordered)];
  };

  const sendToOpenRouter = async (apiKey, userText) => {
    const contextMessages = state.messages.slice(-10).map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));
    const requestMessages = [
      { role: "system", content: systemPrompt },
      ...contextMessages,
      { role: "user", content: userText },
    ];

    const candidates = getCandidateModels();
    if (!candidates.length) {
      throw new Error("No OpenRouter free model is available.");
    }

    let lastError = "Unable to generate a reply.";

    for (const model of candidates) {
      try {
        const payload = await requestCompletion(apiKey, model, requestMessages);
        const text = normalizeResponseText(payload);
        if (!text) {
          throw new Error("The model returned an empty response.");
        }
        state.selectedModel = model;
        setModelStatus(`OpenRouter model: ${model}`);
        return text;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    throw new Error(lastError);
  };

  const setSending = (nextSending) => {
    state.isSending = nextSending;
    sendButton.disabled = nextSending;
    input.disabled = nextSending;
    sendButton.textContent = nextSending ? "Sending..." : "Send";
  };

  const openPanel = () => {
    chatbot.classList.add("open");
    panel.hidden = false;
    toggleButton.setAttribute("aria-expanded", "true");
    input.focus();
  };

  const closePanel = () => {
    chatbot.classList.remove("open");
    panel.hidden = true;
    toggleButton.setAttribute("aria-expanded", "false");
  };

  toggleButton.addEventListener("click", () => {
    if (panel.hidden) {
      openPanel();
      return;
    }
    closePanel();
  });

  closeButton.addEventListener("click", closePanel);

  document.addEventListener("click", (event) => {
    if (!chatbot.classList.contains("open")) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!chatbot.contains(target)) {
      closePanel();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && chatbot.classList.contains("open")) {
      closePanel();
    }
  });

  resetButton.addEventListener("click", () => {
    state.messages = [];
    saveMessages();
    renderAllMessages();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.isSending) return;

    const userText = input.value.trim();
    if (!userText) return;

    const apiKey = ensureApiKey();
    if (!apiKey) {
      appendBubble("assistant", "OpenRouter API key is required before sending messages.");
      return;
    }

    state.messages.push({ role: "user", content: userText });
    appendBubble("user", userText);
    saveMessages();

    input.value = "";
    setSending(true);

    const pending = appendBubble("assistant", "Thinking...");

    try {
      const reply = await sendToOpenRouter(apiKey, userText);
      pending.innerHTML = formatAssistantContent(reply);
      state.messages.push({ role: "assistant", content: reply });
      saveMessages();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : String(error);
      pending.innerHTML = formatAssistantContent(`Unable to reply right now. ${errorText}`);
    } finally {
      setSending(false);
      scrollToLatest();
      input.focus();
    }
  });

  state.messages = loadSavedMessages();
  closePanel();
  renderAllMessages();
  loadFreeModels();
})();
