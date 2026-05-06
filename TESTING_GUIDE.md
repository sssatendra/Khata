# 🧪 Khata Testing Guide

Welcome to the testing guide for the Khata project! This document explains the testing infrastructure we've built, the code already written, and additional methods you can use to build a robust app.

---

## 1. The Testing Stack

We use three main tools that work together:

1.  **Jest**: The **Test Runner**. It finds files, runs the code, and tells you if it passed or failed.
2.  **React Native Testing Library (RNTL)**: The **Utility Library**. It provides functions like `render` and `fireEvent` to interact with your components as if you were a user.
3.  **Jest-Native**: A set of **Custom Matchers** (e.g., `.toBeVisible()`, `.toHaveTextContent()`) specifically for React Native.

---

## 2. Anatomy of our Tests

Every test file we've written follows this structure:

### A. The Setup (Describe & Mocks)
```typescript
describe('Button Component', () => { ... })
```
- **`describe`**: Groups related tests together.
- **`jest.mock()`**: This is critical. It replaces complex modules (like your Store or Firebase) with simple "fakes" so we can test one thing at a time.

### B. The Spy (Jest Functions)
```typescript
const onPressMock = jest.fn();
```
- **`jest.fn()`**: Creates a "Spy". It doesn't do anything, but it **remembers** if it was called, how many times, and with what arguments.

### C. The Assertions (Expect)
```typescript
expect(onPressMock).toHaveBeenCalledTimes(1);
```
- **`expect`**: The actual "test". If the condition isn't met, the test fails.

---

## 3. Explaining our existing Tests

### `utils/helpers.test.ts` (Logic Testing)
These are **Pure Unit Tests**. They don't need a UI. We just pass inputs to functions and check outputs.
- **Key method**: `expect(result).toBe(expectedValue)`.

### `components/ui/Button.test.tsx` (Interaction Testing)
We test if the button actually triggers logic when clicked.
- **Key method**: `fireEvent.press(element)`.
- **Logic**: We pass the `onPressMock` and verify the component actually executes it.

### `components/ui/SearchBar.test.tsx` (State Mocking)
This is our most advanced test. It mocks your **Zustand store**.
- **`useUIStore.mockReturnValue(...)`**: We force the store to have a specific state (like an empty search query) before the test starts.
- **`fireEvent.changeText`**: Simulates a user typing.

---

## 4. "Missing" Advanced Methods (Useful Patterns)

Here are powerful methods we haven't used yet, but you should know:

### 📸 1. Snapshot Testing
Snapshots save the "HTML-like" structure of your component to a file. If you accidentally change the UI later, Jest will warn you.
```typescript
it('renders correctly (snapshot)', () => {
  const { toJSON } = render(<Button title="Snap" onPress={() => {}} />);
  expect(toJSON()).toMatchSnapshot();
});
```

### ⏳ 2. Asynchronous Testing (`waitFor`)
Use this when you are waiting for an API call or a timer to finish.
```typescript
import { waitFor } from '@testing-library/react-native';

it('shows data after loading', async () => {
  const { getByText } = render(<MyComponent />);
  
  // Wait for the text to appear (e.g., after an API call)
  await waitFor(() => expect(getByText('Loaded Data')).toBeTruthy());
});
```

### 🔍 3. Finding elements safely (`findBy...`)
`getByText` fails immediately if the text isn't there. `findByText` is a **Promise** that waits up to 1 second for the text to appear.
```typescript
const element = await findByText('Success'); // Better for async UI
```

### 📊 4. Code Coverage
Want to see which lines of code are *not* tested yet? Run:
```powershell
npm test -- --coverage
```
This generates a `coverage/` folder with a full report!

---

## 5. Behind the Scenes: The Configs

- **`babel.config.js`**: Tells Jest how to translate your TypeScript and Modern Javascript into something Node.js can understand.
- **`jest.setup.js`**: Runs before *every* test. It mocks global things like `react-native-reanimated` (which crashes Jest otherwise) and `expo-router`.
- **`jest.config.js`**: The master settings file. It points to the setup files and tells Jest which files to ignore (like `node_modules`).

---

## 💡 Pro-Tip: The "User-Centric" Rule
Always try to test **what the user sees**, not the internal variables. 
- **Bad**: `expect(component.state.isOpen).toBe(true)`
- **Good**: `expect(getByText('Menu is Open')).toBeTruthy()`
