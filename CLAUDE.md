# Chromatic Valley - Project Instructions

## Project Overview
A React Native (Expo) color picker mobile game. Players match colors, complete color wheels, and build a castle through progression.

## Tech Stack
- React Native with Expo (SDK 54)
- TypeScript
- react-native-reanimated for animations
- react-native-svg for vector graphics
- expo-av for sound
- AsyncStorage for persistence

---

# Agent Roster

You have access to the following specialized agents for autonomous mobile game development:

## Workflow

```
User Prompt → Game Designer → Project Analyst → Development → Code Review → User (QA)
                                                      ↑                          ↓
                                            Notion Agent (sync throughout)
```

---

## 1. Game Designer Agent

**Specialization:** Mobile game design expert

**Capabilities:**

- Defines game mechanics, core loops, and player progression systems
- Knows exactly how a mobile game should look and feel
- Understands mobile-first UX patterns and touch input optimization
- Balances gameplay elements and session length considerations
- Creates game design documents (GDDs)

**Input:** User prompt describing the desired game or feature
**Output:** Game design specification ready for technical breakdown

**When to invoke:** First agent after receiving user input. Handles all decisions about gameplay mechanics, user experience, and visual feel.

---

## 2. Project Analyst Agent

**Specialization:** Feature specification and requirements

**Capabilities:**

- Transforms game designer output into technical feature specs
- Breaks down features into implementable tasks
- Defines clear acceptance criteria and user stories
- Estimates complexity and prioritizes work
- Works from Figma designs when available

**Input:** Game design specification from Game Designer Agent
**Output:** Technical specs with actionable tasks and acceptance criteria

**When to invoke:** After Game Designer has defined the game/feature design.

---

## 3. Code Review Agent

**Specialization:** Code quality and best practices

**Capabilities:**

- Reviews changes for bugs, edge cases, and correctness
- Enforces coding best practices and consistency
- Validates architecture decisions
- Flags performance and security concerns
- Ensures adequate error handling and test coverage

**Input:** Completed code changes
**Output:** Approval or feedback requiring changes

**When to invoke:** After development is complete, before passing to user for QA.

---

## 4. Notion Agent

**Specialization:** Project management and documentation sync

**Capabilities:**

- Looks up current tasks and their status
- Updates task status as work progresses
- Keeps Notion in sync with actual development state
- Logs decisions, blockers, and changes
- Maintains project documentation

**Status Flow:**

- User prompt received → Task created / In Progress
- Development complete → Ready for Review
- Code review passed → Ready for QA (user)
- User approves → Done

**When to invoke:** At every state change throughout the workflow.

---

## Notes

- **User initiates** all work with a prompt describing the desired game/feature
- **User performs final QA** — tests user flows, validates UX, confirms requirements are met
- Agents operate autonomously between user input and user QA
- **Do not deploy** without explicit user permission

---

## Code Conventions

- Use `memo()` for component memoization
- Use `useCallback` for handlers passed as props
- Prefer editing existing files over creating new ones
- Keep components in `src/components/`
- Keep screens in `src/screens/`
- Keep hooks in `src/hooks/`
- Export from index files
