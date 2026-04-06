// --- SIFU AI CHATBOT GLOBAL WIDGET ---

// 1. Inject HTML into the body once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const aiWidgetHTML = `
        <!-- Sifu AI Chat Widget (Floating) -->
        <div class="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
            <!-- Chat Window (Hidden) -->
            <div id="aiChatWindow" class="hidden w-80 h-96 glass-panel border border-[#D4AF37]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] mb-4 flex-col overflow-hidden bg-[#050505] transition-all duration-300">
                <div class="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black px-4 py-3 flex justify-between items-center z-10 relative shadow-md">
                    <div class="font-bold flex items-center"><i class="fas fa-robot text-xl mr-2"></i>Sifu AI</div>
                    <button onclick="toggleAIChat()" class="hover:text-white transition-colors"><i class="fas fa-times"></i></button>
                </div>
                <div id="aiChatBody" class="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-sm">
                    <div class="self-start bg-gray-800/80 text-gray-200 px-3 py-2 rounded-2xl rounded-tl-none border border-white/5 inline-block max-w-[85%] leading-relaxed shadow-sm">
                        Assalamualaikum dan salam hormat, Pendekar! <br><br>Saya adalah <strong>Sifu AI</strong>, penjaga khazanah maya. Apakah ilmu, susur galur, atau jejak langkah persilatan Daeng Kuning yang ingin ditelaah hari ini?
                    </div>
                </div>
                <div class="p-3 bg-black/60 border-t border-white/10 relative">
                    <input type="text" id="aiChatInput" placeholder="Tanya sesuatu..." class="w-full bg-black/80 text-gray-200 px-4 py-2 rounded-full border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37] text-sm pr-10 shadow-inner" onkeypress="if(event.key === 'Enter') sendAIMessage()">
                    <button onclick="sendAIMessage()" class="absolute right-5 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:scale-110 transition-transform"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            
            <!-- FAB Toggle -->
            <button onclick="toggleAIChat()" id="aiFabToggle" class="w-14 h-14 bg-gradient-to-tr from-[#D4AF37] to-yellow-500 rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.4)] text-black text-2xl flex items-center justify-center hover:scale-110 transition-all">
                <i class="fas fa-comment-dots"></i>
            </button>
        </div>
    `;

    // Ensure we don't inject multiple times
    if (!document.getElementById('aiChatWindow')) {
        document.body.insertAdjacentHTML('beforeend', aiWidgetHTML);
        
        // Ensure FontAwesome is available for the icons
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }
    }
});

// 2. Chatbot Logic
let aiChatHistory = [];
let aiIsThinking = false;

window.toggleAIChat = function() {
    const chatWindow = document.getElementById('aiChatWindow');
    if (!chatWindow) return;
    
    if (chatWindow.classList.contains('hidden')) {
        chatWindow.classList.remove('hidden');
        chatWindow.classList.add('flex');
        // Mild animation
        chatWindow.animate([
            { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });
        setTimeout(() => document.getElementById('aiChatInput')?.focus(), 300);
    } else {
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('flex');
    }
};

window.sendAIMessage = async function() {
    if (aiIsThinking) return;
    const inputEl = document.getElementById('aiChatInput');
    const msg = inputEl.value.trim();
    if (!msg) return;

    // Clear input
    inputEl.value = '';
    
    // Add User Message to UI
    appendChatBubble('user', msg);
    aiChatHistory.push({ role: 'user', content: msg });
    
    // Add thinking Bubble
    aiIsThinking = true;
    const botBubbleId = appendChatBubble('model', '<i class="fas fa-circle-notch fa-spin text-[#D4AF37]"></i> Mentafsir...');
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: aiChatHistory })
        });
        
        if (!response.ok) {
            const errBody = await response.json().catch(()=>({}));
            throw new Error(errBody.error || "Ralat pelayan");
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let fullResponse = "";
        
        const bubbleEl = document.getElementById(botBubbleId);
        bubbleEl.innerHTML = ""; 
        
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                bubbleEl.innerHTML = formatAIResponse(fullResponse);
            }
            scrollToBottomAI();
        }
        
        aiChatHistory.push({ role: 'model', content: fullResponse });
        
    } catch (e) {
        console.error("AI Error:", e);
        const bubbleEl = document.getElementById(botBubbleId);
        bubbleEl.innerHTML = `<span class="text-red-400"><i class="fas fa-exclamation-triangle"></i> ${e.message || "Maaf, Sifu kepenatan bertafakur. Cuba sebentar lagi."}</span>`;
    } finally {
        aiIsThinking = false;
    }
};

function appendChatBubble(role, htmlOrString) {
    const chatBody = document.getElementById('aiChatBody');
    if (!chatBody) return;
    
    const bubbleId = 'ai_msg_' + Date.now() + Math.floor(Math.random()*1000);
    const div = document.createElement('div');
    
    if (role === 'user') {
        div.className = "self-end bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)] px-3 py-2 rounded-2xl rounded-tr-none border border-[#D4AF37]/40 inline-block max-w-[85%] font-medium leading-relaxed";
        div.innerHTML = htmlOrString;
    } else {
        div.className = "self-start bg-gray-800/80 text-gray-200 px-3 py-2 rounded-2xl rounded-tl-none border border-white/10 inline-block max-w-[85%] leading-relaxed shadow-sm";
        div.id = bubbleId;
        div.innerHTML = htmlOrString;
    }
    
    chatBody.appendChild(div);
    scrollToBottomAI();
    return bubbleId;
}

function scrollToBottomAI() {
    const chatBody = document.getElementById('aiChatBody');
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function formatAIResponse(text) {
    // Simple rudimentary Markdown to HTML for boldness and line breaks
    // Allows **text** to become <strong>text</strong> and \n to <br/>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
}
