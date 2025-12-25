# Custom Hooks Refactoring Plan

## Overview

Extract timer functionality into three custom hooks with improved APIs while
maintaining all existing behavior. The hooks will have better naming, more
flexible options, and clearer interfaces.

---

## 1. Directory Structure

```
src/hooks/
├── index.ts                 // Export all hooks
├── use-timer-logic.ts       // Timer countdown and state management
├── use-timer-audio.ts       // Audio playback management
└── use-timer-actions.ts     // Timer deletion and navigation
```

---

## 2. Hook Designs with Improvements

### `useTimerLogic` - Enhanced Timer Management

**Improvements:**

- Timer Status Enum: More descriptive than boolean
- Configuration Options: Flexible behavior control
- Better Callback Naming: `onTimeExpired` instead of `onTimerComplete`

```typescript
enum TimerStatus {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
}

interface UseTimerLogicOptions {
  autoReset?: boolean // For interval timers
  onTimeExpired?: () => void // Better naming
}

interface UseTimerLogicReturn {
  time: Time
  status: TimerStatus // More descriptive than boolean
  isRunning: boolean // Keep for backward compatibility
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
}
```

### `useTimerAudio` - Enhanced Audio Controls

**Improvements:**

- Combined Toggle Function: `toggleAudio()` instead of separate play/pause
- Audio State Enum: More descriptive than boolean
- Preload Option: Better audio loading control

```typescript
enum AudioState {
  STOPPED = "stopped",
  PLAYING = "playing",
  PAUSED = "paused",
}

interface UseTimerAudioOptions {
  preload?: boolean // Preload audio source
  autoPlayOnComplete?: boolean // Auto-play when timer ends
}

interface UseTimerAudioReturn {
  audioState: AudioState
  isAudioPlaying: boolean // Keep for backward compatibility
  audioRef: React.RefObject<HTMLAudioElement>
  toggleAudio: () => void // Combined function
  playAudio: () => void
  pauseAudio: () => void
  setAudioSrc: () => void
}
```

### `useTimerActions` - Enhanced Timer Actions

**Improvements:**

- Action Result: Return success/failure state
- Navigation Options: Configurable navigation behavior
- Confirmation Callback: Optional confirmation before deletion

```typescript
interface UseTimerActionsOptions {
  navigateOnDelete?: string // Where to navigate after deletion
  confirmBeforeDelete?: boolean // Require confirmation
  onDeleteSuccess?: () => void // Success callback
}

interface UseTimerActionsReturn {
  deleteTimer: () => Promise<{ success: boolean; error?: string }>
  isDeleting: boolean // Loading state
}
```

---

## 3. Integration Strategy

### Phase 1: Create Hook Files

1. Create `/src/hooks/` directory
2. Implement each hook with improved interfaces
3. Add comprehensive TypeScript types
4. Include JSDoc comments for better IDE support

### Phase 2: Refactor TimerComponent

1. Import the new hooks
2. Replace existing functions with hook returns
3. Update component to use improved APIs
4. Maintain all existing UI and behavior

### Phase 3: Update GlobalTimer

1. Use hooks in the main timer component
2. Ensure proper state synchronization
3. Test all timer modes (normal, interval, one-time)

---

## 4. Key Improvements Summary

| Aspect          | Current                           | Improved                          |
| --------------- | --------------------------------- | --------------------------------- |
| Timer State     | `isRunning: boolean`              | `status: TimerStatus` enum        |
| Audio Control   | Separate `playAudio`/`pauseAudio` | Combined `toggleAudio` + separate |
| Configuration   | Hardcoded behavior                | Flexible options object           |
| Callback Naming | `onTimerComplete`                 | `onTimeExpired`                   |
| Error Handling  | None                              | Action results with error states  |
| Loading States  | None                              | `isDeleting` for async actions    |

---

## 5. Backward Compatibility

The improved hooks will maintain backward compatibility by:

- Keeping existing boolean properties alongside new enums
- Supporting both old and new callback names
- Providing default values for new options
- Maintaining identical function signatures where possible

---

## 6. Testing Strategy

1. **Unit Tests**: Test each hook in isolation
2. **Integration Tests**: Test hook interactions
3. **Regression Tests**: Ensure existing behavior is preserved
4. **Type Checking**: Verify TypeScript interfaces

---

## 7. Migration Benefits

- **Reduced Component Size**: From 570 lines to ~200 lines
- **Better Separation of Concerns**: Each hook has single responsibility
- **Improved Testability**: Individual hooks can be unit tested
- **Enhanced Reusability**: Hooks can be used in other timer components
- **Type Safety**: Better TypeScript interfaces and enums

---

## 8. Questions for Implementation

1. **Enum Preference**: Do you like the status enums, or prefer to keep it simpler with booleans?
2. **Options Object**: Should I use the options pattern (`{ timer, options: { ... } }`) or keep it flat (`{ timer, autoReset, onTimeExpired }`)?
3. **Error Handling**: Do you want the enhanced error handling with action results, or keep it simple?
4. **Audio Auto-play**: Should the audio automatically play when timer completes, or keep the current manual trigger?
