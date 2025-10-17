# Week 8 Progress: Directives System (IN PROGRESS)

## Current Status: ~40% Complete

### ✅ Completed Tasks

1. **Package Structure Setup**
   - Created `packages/directives/` directory structure
   - Set up package.json with dependencies
   - Configured TypeScript (tsconfig.json)
   - Configured Vitest (vitest.config.ts)
   - Package builds successfully ✅

2. **Type Definitions** (`src/types.ts`)
   - `Directive` and `DirectiveHooks` interfaces
   - `DirectiveBinding` with value, arg, modifiers
   - `TransitionProps` and `TransitionHooks`
   - `TransitionPhase` type
   - `ForDirectiveOptions`, `ShowDirectiveOptions`, `IfDirectiveOptions`

3. **Core Directives Implemented**

   **v-show** (`src/directives/show.ts`)
   - Toggles element display property
   - Supports reactive signals
   - Preserves original display value
   - Lightweight conditional display

   **v-if/v-else/v-else-if** (`src/directives/if.ts`)
   - Conditional rendering (adds/removes from DOM)
   - Creates anchor comment nodes
   - Supports reactive signals
   - Proper cleanup on unmount

   **v-for** (`src/directives/for.ts`)
   - List rendering with keyed reconciliation
   - Efficient updates with Map-based tracking
   - Supports reactive arrays
   - Custom key functions

4. **Custom Directive API** (`src/directives/custom.ts`)
   - `registerDirective()` - Register global directives
   - `getDirective()` - Retrieve registered directive
   - `applyDirective()` - Apply to element
   - `updateDirective()` - Update binding
   - `removeDirective()` - Cleanup
   - `defineDirective()` - Create directive
   - Global directive registry

5. **Transition System** (`src/transitions/transition.ts`)
   - `performEnter()` - Enter animations
   - `performLeave()` - Leave animations
   - `withTransition()` - Apply to directives
   - `Transition` component helper
   - CSS class-based transitions
   - JS hook support
   - Auto-detect transition duration

6. **Main Export** (`src/index.ts`)
   - All directives exported
   - Custom directive API exported
   - Transition system exported
   - Auto-registration of built-in directives
   - TypeScript types exported

### ❌ Pending Tasks (CRITICAL - DO THESE NEXT)

1. **Write Comprehensive Test Suite** (HIGH PRIORITY)
   - Test v-show directive (5-8 tests)
   - Test v-if/v-else directives (8-10 tests)
   - Test v-for directive with keys (10-12 tests)
   - Test custom directive API (6-8 tests)
   - Test transition system (8-10 tests)
   - Target: ~40-50 tests total
   - Files needed:
     - `__tests__/show.test.ts`
     - `__tests__/if.test.ts`
     - `__tests__/for.test.ts`
     - `__tests__/custom.test.ts`
     - `__tests__/transitions.test.ts`

2. **Create Example Application**
   - `examples/directives-demo/` directory
   - Demonstrate all directives in action
   - Show v-if vs v-show
   - Show v-for with dynamic lists
   - Show transitions
   - Show custom directive creation

3. **Compiler Integration** (OPTIONAL for now)
   - Transform JSX attributes to directive calls
   - Example: `<div v-show={visible}>` → directive application
   - May be deferred to later

4. **Update Documentation**
   - Update `docs/PROGRESS.md` with Week 8 section
   - Update `README.md` with directives info
   - Add directives to package list
   - Update test counts

5. **Build and Test**
   - Run `pnpm test` in packages/directives
   - Ensure all tests pass
   - Build package
   - Verify exports

6. **Commit to Repository**
   - Stage all directives files
   - Commit with descriptive message
   - Push to main branch

---

## Package Structure Created

```
packages/directives/
├── src/
│   ├── types.ts                    # ✅ Type definitions
│   ├── index.ts                    # ✅ Main export
│   ├── directives/
│   │   ├── show.ts                 # ✅ v-show directive
│   │   ├── if.ts                   # ✅ v-if/v-else/v-else-if
│   │   ├── for.ts                  # ✅ v-for directive
│   │   └── custom.ts               # ✅ Custom directive API
│   ├── transitions/
│   │   └── transition.ts           # ✅ Transition system
│   └── compiler/                   # ❌ NOT CREATED (optional)
├── __tests__/                      # ❌ NO TESTS YET (CRITICAL)
├── package.json                    # ✅ Created
├── tsconfig.json                   # ✅ Created
└── vitest.config.ts                # ✅ Created
```

---

## How to Continue (STEP BY STEP)

### Step 1: Write Tests (START HERE)

```bash
cd packages/directives
```

Create test files:

1. **`__tests__/show.test.ts`** - Test v-show directive
   - Test mounting with true/false values
   - Test reactive updates with signals
   - Test original display preservation
   - Test cleanup on unmount

2. **`__tests__/if.test.ts`** - Test v-if directives
   - Test conditional mounting/unmounting
   - Test anchor node creation
   - Test reactive updates
   - Test v-else behavior
   - Test cleanup

3. **`__tests__/for.test.ts`** - Test v-for directive
   - Test list rendering
   - Test keyed reconciliation
   - Test item addition/removal
   - Test reactive array updates
   - Test custom key functions

4. **`__tests__/custom.test.ts`** - Test custom directive API
   - Test registration
   - Test application
   - Test updates
   - Test removal
   - Test lifecycle hooks

5. **`__tests__/transitions.test.ts`** - Test transitions
   - Test enter transitions
   - Test leave transitions
   - Test CSS classes
   - Test JS hooks
   - Test duration detection

### Step 2: Run Tests

```bash
cd packages/directives
pnpm test
```

Fix any failing tests until all pass.

### Step 3: Create Example App

```bash
mkdir -p examples/directives-demo/src
```

Create:
- `examples/directives-demo/package.json`
- `examples/directives-demo/index.html`
- `examples/directives-demo/vite.config.ts`
- `examples/directives-demo/src/main.tsx`

Demonstrate:
- Toggle visibility with v-show
- Conditional rendering with v-if
- Dynamic lists with v-for
- Transitions
- Custom directives

### Step 4: Update Documentation

Update `docs/PROGRESS.md`:
```markdown
## ✅ Directives System (Week 8)

### Built-in Directives (`packages/directives/`)
- **v-show** - Toggle display without DOM removal
- **v-if/v-else** - Conditional rendering with DOM manipulation
- **v-for** - List rendering with keyed reconciliation
- **Custom API** - Register and use custom directives
- **Transitions** - Enter/leave animations with CSS/JS hooks

### Test Coverage (Directives)
- `__tests__/show.test.ts` - v-show tests (X tests)
- `__tests__/if.test.ts` - v-if tests (X tests)
- `__tests__/for.test.ts` - v-for tests (X tests)
- `__tests__/custom.test.ts` - Custom directives (X tests)
- `__tests__/transitions.test.ts` - Transitions (X tests)

**Total Directives Tests**: **XX tests** ✅
```

Update `README.md`:
- Add directives to features list
- Add `@quantum/directives` to packages
- Update test count

### Step 5: Build and Commit

```bash
cd packages/directives
pnpm build
pnpm test

cd ../..
git add packages/directives examples/directives-demo docs/
git commit -m "Implement Week 8: Directives System

Add comprehensive directive system with v-show, v-if, v-for, and custom directives.

Features:
- v-show directive for display toggling
- v-if/v-else/v-else-if for conditional rendering
- v-for with keyed reconciliation for lists
- Custom directive API with lifecycle hooks
- Transition system with CSS and JS animations
- Full TypeScript support

Technical achievements:
- XX tests passing (total: 220+XX)
- Efficient DOM manipulation
- Reactive signal integration
- Keyed list reconciliation
- Extensible directive system

Status: Alpha v0.0.4 - Directives complete
Next: SSR support (Week 9)"

git push origin master
```

---

## Key Implementation Details

### v-show Implementation
- Uses `display` CSS property
- Stores original display value in Symbol
- Supports reactive signals via `effect()`
- No DOM manipulation (fast)

### v-if Implementation
- Creates anchor comment nodes
- Inserts/removes actual elements
- Tracks with Symbol properties
- Proper cleanup on unmount

### v-for Implementation
- Map-based item tracking
- Custom key functions supported
- Efficient updates (only changed items)
- Template cloning for new items

### Custom Directives
- Global registry (Map)
- Lifecycle hooks: beforeMount, mounted, beforeUpdate, updated, beforeUnmount, unmounted
- Simple function directives supported
- Apply/update/remove API

### Transitions
- CSS class-based (`name-enter-from`, `name-enter-active`, etc.)
- JS hook support (beforeEnter, enter, afterEnter, etc.)
- Auto-detect duration from CSS
- Manual duration support
- Enter/leave phases

---

## Dependencies Installed

```json
{
  "dependencies": {
    "@quantum/reactivity": "workspace:*",
    "@quantum/component": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "jsdom": "^24.0.0",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0"
  }
}
```

---

## Build Status

✅ TypeScript compilation: **SUCCESS**
❌ Tests: **NOT WRITTEN YET**
✅ Package structure: **COMPLETE**
❌ Examples: **NOT CREATED YET**
❌ Documentation: **NOT UPDATED YET**

---

## Next Conversation: Quick Start Commands

```bash
# Navigate to directives package
cd D:/projects/quantum-framework/packages/directives

# Check current state
ls src/ __tests__/

# Start writing tests
# Create __tests__/show.test.ts first
# Then if.test.ts, for.test.ts, custom.test.ts, transitions.test.ts

# Run tests as you write them
pnpm test

# After tests pass, create example
cd ../../examples
mkdir directives-demo

# Then update docs and commit
```

---

## Important Notes

1. **NO TESTS YET** - This is the critical next step
2. **Package builds successfully** - TypeScript compilation works
3. **All core directives implemented** - v-show, v-if, v-for, custom API, transitions
4. **Reactive signal support** - Directives work with Quantum signals
5. **TypeScript types complete** - Full type safety

---

## Estimated Work Remaining

- Tests: ~2-3 hours (40-50 tests)
- Example app: ~1 hour
- Documentation: ~30 minutes
- Testing & fixes: ~1 hour

**Total: ~4-5 hours to complete Week 8**

---

## Week 8 Goal (from ROADMAP.md)

**Original Goal**: Directives system, transitions, error boundaries

**Current Status**:
- ✅ Directives system (v-show, v-if, v-for, custom API)
- ✅ Transitions (enter/leave with CSS/JS)
- ❌ Error boundaries (deferred)
- ❌ Tests (critical)
- ❌ Examples (needed)
- ❌ Documentation (needed)

---

## File Checklist for Next Session

COMPLETED FILES (Don't modify):
- ✅ packages/directives/package.json
- ✅ packages/directives/tsconfig.json
- ✅ packages/directives/vitest.config.ts
- ✅ packages/directives/src/types.ts
- ✅ packages/directives/src/index.ts
- ✅ packages/directives/src/directives/show.ts
- ✅ packages/directives/src/directives/if.ts
- ✅ packages/directives/src/directives/for.ts
- ✅ packages/directives/src/directives/custom.ts
- ✅ packages/directives/src/transitions/transition.ts

FILES TO CREATE:
- ❌ packages/directives/__tests__/show.test.ts
- ❌ packages/directives/__tests__/if.test.ts
- ❌ packages/directives/__tests__/for.test.ts
- ❌ packages/directives/__tests__/custom.test.ts
- ❌ packages/directives/__tests__/transitions.test.ts
- ❌ examples/directives-demo/package.json
- ❌ examples/directives-demo/index.html
- ❌ examples/directives-demo/vite.config.ts
- ❌ examples/directives-demo/src/main.tsx

FILES TO UPDATE:
- ❌ docs/PROGRESS.md (add Week 8 section)
- ❌ README.md (add directives to features/packages)

---

**PRIORITY FOR NEXT SESSION: WRITE TESTS FIRST!**

The package is built and compiles, but has zero tests. Start with `__tests__/show.test.ts` and work through each directive systematically.
