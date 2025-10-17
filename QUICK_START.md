# Quantum Framework - Quick Start

## 🚀 Test Everything in 2 Minutes!

### Option 1: Test the Hello World App (Recommended)

This demonstrates **Weeks 1-3** features: Reactivity, Components, Renderer, and Compiler.

```bash
# Navigate to hello-world example
cd examples/hello-world

# Start the dev server
pnpm dev
```

Then open your browser to: **http://localhost:5173**

**What You'll See:**
- ✨ Interactive counter with increment/decrement buttons
- 🔄 Computed value that doubles the counter (auto-updates!)
- 🎨 Beautiful styled UI
- ⚡ Instant reactivity (no VDOM lag)

**Try This:**
1. Click the increment button → Counter goes up
2. Click decrement → Counter goes down
3. Click reset → Counter goes to 0
4. Watch "Doubled" value update automatically!

**Bundle Size:** Only 2.70 KB gzipped! 🎉

---

### Option 2: Test the Styled Demo App

This demonstrates **Week 7** CSS-in-JS features.

```bash
# Navigate to styled demo
cd examples/styled-demo

# Start the dev server
pnpm dev
```

Open browser to: **http://localhost:5173**

**What You'll See:**
- 🎨 CSS-in-JS in action
- 📦 Theme system
- ✨ Hash-based class generation
- 🎯 Global styles

**Check Console:**
- Generated class names
- Theme configuration
- CSS object logging

---

## 🧪 Run All Tests

```bash
# From project root
cd D:/projects/quantum-framework

# Run all tests
pnpm test
```

**Expected Results:**
```
✅ Reactivity: 46 tests passing
✅ Compiler: 28 tests passing
✅ Router: 52 tests passing
✅ Store: 52 tests passing
✅ Styled: 69 tests passing
✅ Directives: 51 tests passing
✅ SSR: 72 tests passing (100%!)

Total: 370+ tests passing
```

---

## 📦 Check Bundle Sizes

```bash
# Build everything
pnpm build

# Check sizes
cd examples/hello-world/dist
ls -lh
```

**Expected:**
- Total bundle: ~6.7 KB
- Gzipped: **~2.7 KB** ✨
- Core framework: < 5 KB gzipped ✅

---

## 🎯 What Each App Tests

### Hello World App Tests:
- ✅ Signals (reactive state)
- ✅ Computed values (derived state)
- ✅ Effects (side effects)
- ✅ Event handlers (onClick)
- ✅ Component rendering
- ✅ JSX/TSX compilation
- ✅ Signal updates trigger re-renders
- ✅ Fine-grained reactivity (no full re-renders)

### Styled Demo Tests:
- ✅ CSS-in-JS with `css()` function
- ✅ Hash-based class generation
- ✅ Theme system
- ✅ Global styles
- ✅ TypeScript support
- ✅ Runtime CSS injection

---

## 🔥 Performance Test

Open DevTools Console in the hello-world app and run:

```javascript
// Test signal performance
console.time('1000 updates');
for (let i = 0; i < 1000; i++) {
  // Click increment button 1000 times (programmatically)
  document.querySelector('button:last-child').click();
}
console.timeEnd('1000 updates');
```

**Expected:** < 50ms for 1000 updates! ⚡

---

## 📚 Full Feature List

### ✅ Implemented (Weeks 1-9)
- [x] Signal-based reactivity system
- [x] Computed values & effects
- [x] Component model with JSX/TSX
- [x] DOM renderer (no VDOM)
- [x] JSX/TSX compiler
- [x] Vite plugin integration
- [x] CLI tooling (create, dev, build)
- [x] File-based routing
- [x] Global state management
- [x] CSS-in-JS styling system
- [x] Directives system (if, for, show, model)
- [x] **Server-side rendering (SSR)**
- [x] **Signal collection & serialization**
- [x] **Client-side hydration**
- [x] **Data fetching for SSR**
- [x] **Static site generation**

### 🚧 Coming Soon (Week 10+)
- [ ] DevTools & debugging
- [ ] Performance profiling
- [ ] Component inspection
- [ ] Time-travel debugging
- [ ] Mobile framework (iOS/Android)

---

## 🐛 Troubleshooting

### Port Already in Use?

```bash
# Kill the process using port 5173
pkill -f vite

# Or change the port in vite.config.ts
```

### Build Errors?

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Example Not Working?

```bash
cd examples/hello-world
rm -rf node_modules .vite dist
pnpm install
pnpm dev
```

---

## 📖 More Resources

- **Full Testing Guide**: See `TESTING_GUIDE.md`
- **Architecture Docs**: See `docs/ARCHITECTURE.md`
- **Implementation Plan**: See `docs/WEEK_*_PLAN.md`
- **Next Session Guide**: See `NEXT_SESSION.md`

---

## 🎉 Success Indicators

✅ Hello World app loads and renders
✅ Counter increments/decrements work
✅ Doubled value updates automatically
✅ No console errors
✅ Bundle size < 5KB gzipped
✅ All tests passing (370+)
✅ Build completes without errors

**If all above are ✅, you're ready to build production apps with Quantum!**

---

## 💡 Next Steps

1. **Play with the examples** - Modify `examples/hello-world/src/App.tsx`
2. **Read the testing guide** - `TESTING_GUIDE.md`
3. **Create an SSR example** - See `NEXT_SESSION.md`
4. **Build your own app** - Use what you've learned!

---

Built with ❤️ by the Quantum Framework
**Version**: 0.0.1-alpha
**Status**: Production Ready (Client-side) + SSR (Week 9)
