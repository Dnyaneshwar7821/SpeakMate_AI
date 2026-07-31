import re

with open('src/pages/ConversationSession.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the layout
old_top_container = '<div className="flex-1 flex flex-col h-full bg-[var(--bg-canvas)] p-3 sm:p-5 gap-4 overflow-hidden relative">'
new_top_container = '''<div className="flex-1 flex flex-col h-full bg-[var(--bg-canvas)] overflow-hidden relative">
      {/* FULL SCREEN AVATAR BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <AvatarCanvas className="w-full h-full" />
        </div>
        {/* Dark gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-canvas)]/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* FLOATING UI LAYER (z-10) */}
      <div className="relative z-10 flex-1 flex flex-col h-full p-3 sm:p-5 gap-3 pointer-events-none">
'''

content = content.replace(old_top_container, new_top_container)

# The first top bar is wrapped in a div. We need to add pointer-events-auto
content = content.replace(
    '<div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-between gap-3 shadow-sm shrink-0">',
    '<div className="pointer-events-auto p-3.5 rounded-2xl bg-[var(--bg-surface)]/70 backdrop-blur-md border border-[var(--border-default)] flex items-center justify-between gap-3 shadow-sm shrink-0">'
)

# The avatar stage needs to be replaced entirely with an invisible spacer
old_avatar_stage_pattern = re.compile(r'\{\/\* 2\. CENTERED AI LIVE2D AVATAR STAGE \*\/\}.*?\{\/\* 3\. CONVERSATION THREAD', re.DOTALL)
new_avatar_spacer = '''{/* 2. INVISIBLE SPACER TO PUSH CHAT DOWN */}
        <div className="flex-1 min-h-0 pointer-events-none flex flex-col items-center justify-center">
          {/* Status Badge Indicator */}
          <div className="flex flex-col items-center space-y-3">
            <span className={`h-12 w-12 rounded-full border-4 border-[var(--bg-canvas)]/50 backdrop-blur flex items-center justify-center text-xl shadow-xl ${isListening ? "bg-rose-500 text-white animate-bounce" : isAiSpeaking ? "bg-[#6c63ff] text-white animate-pulse" : "bg-emerald-500 text-white"}`}>
              {isListening ? "🎙️" : isAiSpeaking ? "🔊" : "✨"}
            </span>
            <div className="space-y-1 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6c63ff] bg-[var(--bg-canvas)]/50 backdrop-blur-sm px-2.5 py-1 rounded-full">SpeakMate AI</span>
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] flex items-center justify-center gap-2 drop-shadow-md bg-[var(--bg-canvas)]/30 backdrop-blur-md px-3 py-1 rounded-full border border-[var(--border-default)]/30">
                <span>{avatarState}</span>
                {isAiSpeaking && (
                  <span className="flex items-center gap-1 h-3 shrink-0">
                    <span className="w-1 bg-[#6c63ff] rounded-full animate-soundbar-1 h-3" />
                    <span className="w-1 bg-[#ff6584] rounded-full animate-soundbar-2 h-3" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-soundbar-3 h-3" />
                  </span>
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* 3. CONVERSATION THREAD'''

content = old_avatar_stage_pattern.sub(new_avatar_spacer, content)

# 3. Conversation Thread styling
content = content.replace(
    '<div className="flex-1 min-h-0 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-sm overflow-hidden flex flex-col">',
    '<div className="pointer-events-auto max-h-[38%] bg-[var(--bg-surface)]/75 backdrop-blur-md border border-[var(--border-default)]/50 rounded-3xl shadow-xl overflow-hidden flex flex-col shrink-0">'
)

# 4. Bottom Controls Bar styling
content = content.replace(
    '<div className="p-3 sm:p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg flex items-center justify-between gap-3 shrink-0">',
    '<div className="pointer-events-auto p-3 sm:p-4 rounded-3xl bg-[var(--bg-surface)]/80 backdrop-blur-lg border border-[var(--border-default)]/50 shadow-2xl flex items-center justify-between gap-3 shrink-0">'
)

# 5. Fix closing tags logic
content = content.replace(
    '''        </div>
      </div>
    </div>
  );
}''',
    '''        </div>
      </div>
    </div>
    </div>
  );
}'''
)

with open('src/pages/ConversationSession.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
