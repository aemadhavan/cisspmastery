# UI Update Plan - Class → Deck Migration

## Files to Update

### 1. Admin Flashcards Page
**File:** `src/app/admin/flashcards/page.tsx` (872 lines)

**Changes Needed:**
- Remove `Topic` interface (lines 31-38)
- Update `Domain` interface → rename to `Class`
- Remove `selectedTopicId` state
- Remove `handleTopicChange` function
- Update dropdown: Domain/Topic/Deck → Class/Deck
- Update `loadDomains` → `loadClasses`
- Remove `difficulty` field from form

**Key Sections:**
- Lines 22-48: Interface definitions
- Lines 70-73: State for domain/topic selection
- Lines 104-116: `loadDomains` function
- Lines 534-594: Dropdown UI (3 selects → 2 selects)

### 2. Admin Navigation/Layout
**File:** `src/app/admin/layout.tsx`

**Changes Needed:**
- Add "Classes" menu item
- Keep existing Flashcards and Analytics

### 3. User Dashboard
**File:** `src/app/dashboard/page.tsx`

**Changes Needed:**
- Display classes instead of domains
- Update routing links
- Update card display logic

### 4. Study Mode Page
**File:** `src/app/dashboard/domain/[id]/page.tsx` → Rename to `deck/[id]/page.tsx`

**Changes Needed:**
- Change routing from domain to deck
- Update API calls to fetch deck data
- Update display logic

## Implementation Order

1. ✅ Backend/API (COMPLETED)
2. 🔄 Admin UI:
   - Update flashcards page (simplify dropdowns)
   - Create classes management page
   - Update admin layout
3. 🔄 User UI:
   - Update dashboard to show classes
   - Update study mode routing
4. 🔄 Testing

## Detailed Changes

### Admin Flashcards Page Updates

#### Interface Changes:
```typescript
// OLD
interface Domain {
  id: string;
  name: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  decks: Deck[];
}

// NEW
interface Class {
  id: string;
  name: string;
  description: string | null;
  order: number;
  icon: string | null;
  color: string | null;
  decks: Deck[];
}
```

#### State Changes:
```typescript
// REMOVE
const [selectedTopicId, setSelectedTopicId] = useState<string>("");

// KEEP (rename domains → classes)
const [classes, setClasses] = useState<Class[]>([]);
const [selectedClassId, setSelectedClassId] = useState<string>("");
```

#### UI Changes:
```typescript
// REMOVE Topic dropdown entirely
// Update Class dropdown to directly show decks

// OLD: Domain → Topic → Deck
// NEW: Class → Deck
```

---

## Testing Checklist

### Admin Tests:
- [ ] Can select a class from dropdown
- [ ] Can select a deck within that class
- [ ] Can create a new flashcard
- [ ] Can upload images (up to 5 per question, 5 per answer)
- [ ] Can edit existing flashcard
- [ ] Can delete flashcard
- [ ] Images are properly associated with cards

### User Tests:
- [ ] Can see list of classes on dashboard
- [ ] Can click into a class to see decks
- [ ] Can start studying a deck
- [ ] Flashcards display correctly with images
- [ ] Can rate confidence (1-5)
- [ ] Progress is saved

---

## Rollback Plan

If UI updates cause issues:

1. Revert the admin flashcards page:
   ```bash
   git checkout src/app/admin/flashcards/page.tsx
   ```

2. Backend API maintains backward compatibility via `/api/admin/domains`

3. Can operate with old UI + new backend temporarily

---

## Notes

- Backend API already updated to support new schema
- `/api/admin/domains` returns classes in backward-compatible format
- Existing flashcards preserved with all data
- Image upload functionality unchanged (max 10 per card)
