# AUTOMATED SESSION END PROTOCOL

## 🚨 TRIGGER PHRASES
When user says ANY of these phrases, **IMMEDIATELY** execute this protocol:
- "wrap up"
- "save session" 
- "end session"
- "session end"
- "checkpoint this"
- "save progress"
- "finish for now"
- "that's enough for today"

## 🔄 AUTOMATED SEQUENCE (NO USER INPUT REQUIRED)

### STEP 1: DETERMINE SESSION NUMBER
```bash
# Find highest existing session number
1. serena:list_memories
2. Parse all "session_X_" patterns  
3. Find highest number (e.g., if session_10 exists, next is session_11)
4. If no session memories exist, start with session_1
```

### STEP 2: CREATE SESSION MEMORY NAME
**Format**: `session_[NUMBER]_[descriptive_title]`
**Examples**:
- `session_11_pip_calculator_widget_complete`
- `session_12_position_size_calculator_implementation`
- `session_13_forex_analytics_dashboard_phase2`

### STEP 3: USER VERIFICATION REMINDER
**MANDATORY - Remind user to run:**
```bash
npm run verify
npm run lint
```
**Wait for confirmation these pass before proceeding**

### STEP 4: CREATE CHECKPOINT
```bash
claudepoint:create_checkpoint "Session [NUMBER]: [Title] - [Brief description of what was accomplished]"
```

### STEP 5: GENERATE SESSION MEMORY CONTENT
**Template Structure:**
```markdown
# Session [NUMBER]: [Descriptive Title]

## ✅ MAJOR ACCOMPLISHMENTS
[List key features/fixes completed]

## 🔧 TECHNICAL DETAILS
### Files Modified:
- file1.tsx - what was changed
- file2.ts - what was added

### Key Implementations:
- Feature A - description
- Bug fix B - what was resolved

## 🎯 CURRENT STATUS
- [What's working now]
- [What's been tested]
- [Any known issues]

## 📋 NEXT SESSION PRIORITIES
### Immediate Tasks:
1. [Specific next task]
2. [Follow-up item]

### Technical Considerations:
- [Important notes for next developer]
- [Potential challenges]

## 🔗 CONTINUATION CONTEXT
**Next session should:**
- Read this memory first for context
- Continue with [specific task]
- Pay attention to [important details]

**Files likely to be modified next:**
- [list of files]

**Key areas of focus:**
- [technical areas]
```

### STEP 6: SAVE SESSION MEMORY
```bash
serena:write_memory 
memory_name: "session_[NUMBER]_[descriptive_title]"
content: [generated content above]
```

### STEP 7: UPDATE SESSION START INSTRUCTIONS
**Automatically update the session start checklist to point to this new session**

## 🎯 INTEGRATION WITH SESSION START

### SESSION START AUTO-DETECTION
When next session starts, the session start protocol will:
1. **Auto-detect highest session number** from memory list
2. **Read that session memory first** to understand context
3. **Load continuation priorities** from that memory
4. **Present user with next steps** from the memory

### SEAMLESS HANDOFF
- **Current session context** → Saved in session memory
- **Next priorities** → Listed in session memory  
- **Technical state** → Documented for continuation
- **File modifications** → Tracked for next developer

## 📋 QUALITY CHECKLIST

### Before Creating Session Memory:
- [ ] User confirmed npm run verify passed
- [ ] User confirmed npm run lint passed
- [ ] Session number calculated correctly
- [ ] Descriptive title reflects main accomplishment
- [ ] All major changes documented
- [ ] Next priorities clearly listed
- [ ] Technical context preserved

### After Creating Session Memory:
- [ ] Checkpoint created with proper description
- [ ] Memory saved with correct naming convention
- [ ] Next session context established
- [ ] User informed of successful session end

## 🚀 EXAMPLE EXECUTION

**User says**: "wrap up"

**Claude automatically**:
1. Checks memories → finds session_10 as highest
2. Next session will be session_11
3. Reminds user: "Please run npm run verify and npm run lint"
4. User confirms: "Both pass"
5. Creates checkpoint: "Session 11: Pip Calculator Widget - Implemented pip calculation widget with real-time updates"
6. Generates memory content documenting everything accomplished
7. Saves as "session_11_pip_calculator_widget_complete"
8. Confirms: "Session 11 saved! Next session will automatically load this context."

**Result**: Perfect handoff with zero manual work required.