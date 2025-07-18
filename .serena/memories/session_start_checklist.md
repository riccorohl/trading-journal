# SESSION START CHECKLIST - QUICK REFERENCE

## 🚨 MANDATORY BEFORE ANY CODING

### 1. VERIFICATION CHECK (User runs)
**REMIND USER TO RUN:**
- `npm run verify` (compilation check)
- `npm run lint` (lint check)

**Claude does NOT run shell commands directly**

### 2. MEMORY REFRESH (1 minute) - LATEST CONTEXT PROTOCOL
**Automatically identify most recent work context:**
- [ ] **LATEST SESSION** → Read highest `session_X` number (what was just worked on)
- [ ] **ARCHITECTURAL GUIDE** → Read `architectural_guide_and_customization_planning` (strategic decisions & future planning)  
- [ ] **ERROR PREVENTION** → Read `critical_error_prevention_protocol` (avoid coding mistakes)
- [ ] **IF unclear which session is latest** → Ask user: "Which memory contains the most recent work?"

**Memory Content Guide:**
- **Session memories** = Recent feature work, what was accomplished
- **Architectural guide** = Strategic vision, customization planning, design decisions  
- **Error prevention** = Coding best practices, duplicate prevention

### 3. SESSION GOALS (Ask User)
- [ ] What specific task needs completion?
- [ ] Which files need modification?
- [ ] Any known issues to address?

## ⚡ QUICK CODING RULES

### BEFORE EDITING ANY FILE:
1. **`serena:read_file`** - Read complete file
2. **Check imports** - Search for existing patterns  
3. **Understand structure** - Use symbolic tools if needed
4. **Make targeted changes** - Minimal modifications

### DUPLICATE PREVENTION:
- ❌ **NEVER add imports without checking existing**
- ❌ **NEVER copy-paste without context verification**  
- ❌ **NEVER assume file structure**
- ✅ **ALWAYS read complete file first**

### AFTER CHANGES:
**REMIND USER TO RUN:**
- `npm run verify` (before any checkpoint)

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

## 🎯 SESSION END PROTOCOL

### Before Finishing:
- [ ] User runs all verification commands
- [ ] Development server starts successfully  
- [ ] Create detailed checkpoint
- [ ] Update memories if needed

---

**Time investment: 2-3 minutes per session start**  
**Debugging time saved: Hours of duplicate error fixing**  
**Result: Professional, reliable development workflow**