# SESSION START CHECKLIST - AUTOMATED INTEGRATION

## 🚨 MANDATORY BEFORE ANY CODING

### 1. VERIFICATION CHECK (User runs)
**REMIND USER TO RUN:**
- `npm run verify` (compilation check)
- `npm run lint` (lint check)

**Claude does NOT run shell commands directly**

### 2. AUTO-DETECT LATEST SESSION (AUTOMATED)
**Claude automatically:**
1. **serena:list_memories** - Get all memory names
2. **Parse session numbers** - Find all "session_X_" patterns
3. **Read highest session** - Auto-load most recent session context
4. **Present continuation plan** - Show user what's next from that session

**If no session memories found:**
- Read `project_overview` and `architectural_guide_and_customization_planning`
- Ask user what they want to work on

### 3. SESSION GOALS (From Previous Session)
**Claude presents from latest session memory:**
- ✅ **What was completed** - Quick summary
- 🎯 **Next priorities** - What should be worked on
- 🔧 **Technical context** - Important notes for continuation
- 📁 **Files to modify** - Expected changes

**Then ask user:**
- "Ready to continue with [specific task from memory]?"
- "Or do you want to work on something else?"

## ⚡ INTEGRATION WITH SESSION END

### SEAMLESS WORKFLOW
- **Session End** → Saves session_X memory with next priorities
- **Session Start** → Auto-loads that session_X memory
- **Continuation** → Presents exact next steps
- **No manual lookup** → Everything automated

### EXAMPLE AUTO-DETECTION
```
Claude: "I found session_11_pip_calculator_widget_complete as the latest session.

✅ Last session completed: Pip calculator widget with real-time updates
🎯 Next priorities: Position size calculator implementation  
🔧 Files to modify: src/components/Calculator.tsx

Ready to continue with the position size calculator, or would you like to work on something else?"
```

## 🔧 TOOLS PRIORITY ORDER

### 1. File Understanding
- `serena:read_file` (complete)
- `serena:search_for_pattern` 
- `serena:find_symbol`

### 2. Making Changes
- `serena:replace_regex` (targeted)
- `serena:replace_symbol_body`
- `serena:insert_after_symbol`

### 3. Validation
**USER RUNS:**
- `npm run verify`
- `claudepoint:create_checkpoint`

## 🎯 SESSION END TRIGGER INTEGRATION

### AUTOMATIC SESSION END TRIGGERS
When user says any of these, **immediately execute session end protocol**:
- "wrap up"
- "save session" 
- "end session"
- "session end"
- "checkpoint this"
- "save progress"
- "finish for now"
- "that's enough for today"

### SESSION END PROTOCOL REFERENCE
See `session_end_protocol_automated` memory for complete automation sequence.

## ✅ QUALITY ASSURANCE

### Green Flags (Healthy Session Start):
- [ ] npm run verify passes
- [ ] npm run lint passes  
- [ ] Latest session memory auto-detected
- [ ] Next priorities clearly presented
- [ ] User confirms direction or provides new direction

### Red Flags (Stop and Fix):
- [ ] Verification commands fail
- [ ] Cannot detect latest session
- [ ] Session memory incomplete/unclear
- [ ] User confused about next steps

---

**Result: Zero-friction session transitions with perfect context preservation**