# AI Coding Agent Token Optimization Rules

## 1. Response Architecture
* **Direct Code First:** Start the response with the code block. 
* **Zero Conversational Text:** Eliminate greetings, confirmations, and polite transitions.
* **No Post-Code Summaries:** Do not summarize what the code does after the block.
* **Inline Comments Only:** Place all necessary explanations as short comments inside the code block.

## 2. Formatting Rules
* **Raw Code Blocks:** Wrap code strictly in standard markdown blocks with the language identifier.
* **No External Explanations:** Do not write descriptive text outside the code block unless explicitly requested.
* **Minimalist Text:** If text is mandatory, use punchy fragments under 10 words.

## 3. Ambiguity & Completeness Rules
* **Production-Ready:** Provide fully functional, complete code instead of placeholders or `// TODO` comments.
* **Explicit Naming:** Use descriptive variable and function names to eliminate the need for textual explanations.
* **Strict Type Safety:** Always include strict typing, error handling, and edge-case management within the logic.

## 4. Code Modification Rules
* **Targeted Refactoring:** When updating existing code, output only the modified functions or classes.
* **Diff Context:** Provide just enough surrounding lines for context, rather than rewriting unchanged files.
