# Micro Units Completion Tracking

## 📋 Overview

Hệ thống completion tracking cho Micro Units được thiết kế để đồng bộ completion status giữa:
- **Course Units**: Toàn bộ units của khóa học
- **Micro Unit Blocks**: Các blocks thuộc một micro unit cụ thể

## 🔄 API Integration

### 1. Course Units API
```
GET /api/micro_unit/v1/units/{courseId}
```

**Response:**
```json
{
  "course_id": "course-v1:...",
  "units": [
    {
      "id": "block-v1:...",
      "display_name": "Tổng quan khóa học",
      "complete": true,
      "graded": false,
      "has_score": false,
      "format": "",
      "due": null
    }
  ]
}
```

**Purpose:** Lấy trạng thái completion của TẤT CẢ units trong course cho user hiện tại.

### 2. Micro Unit Blocks API
```
GET /api/micro_unit/v1/micro-units/{microUnitId}/blocks/
```

**Response:**
```json
{
  "results": [
    {
      "id": 58,
      "block_usage_key": "block-v1:...",
      "display_name": "Chế độ tỷ giá",
      "lms_web_url": "http://...",
      "order_in_micro_unit": 0
    }
  ],
  "count": 5
}
```

**Purpose:** Lấy danh sách blocks thuộc micro unit (KHÔNG có completion data).

## 🔀 Data Merging Strategy

Trong `fetchMicroUnitBlocks` thunk:

```javascript
// 1. Fetch both APIs in parallel
const [blocksData, courseUnitsData] = await Promise.all([
  getMicroUnitBlocks(microUnitId),
  getMicroUnits(courseId)
]);

// 2. Create lookup map
const courseUnitsMap = {};
courseUnitsData.units.forEach(unit => {
  courseUnitsMap[unit.id] = unit;
});

// 3. Merge data
const transformedUnits = blocksData.results.map(block => ({
  id: block.blockUsageKey,
  displayName: block.displayName,
  // Merge completion from course units
  complete: courseUnitsMap[block.blockUsageKey]?.complete || false,
  graded: courseUnitsMap[block.blockUsageKey]?.graded || false,
  hasScore: courseUnitsMap[block.blockUsageKey]?.hasScore || false,
}));
```

## ⏱️ Auto Completion Flow

### Timeline:
1. **T=0s**: User vào xem một unit
2. **T=5s**: Trigger completion (ONLY for non-graded, non-scored units)
   - Mark complete locally (optimistic update)
   - Show completion toast
3. **T=6s**: Refresh data from server
   - Re-fetch both APIs
   - Merge updated completion status
   - Update Redux state
   - Sidebar icons auto-update

### Important Rules:
- ✅ **Auto-complete**: Regular content units (video, text, HTML)
- ❌ **NO auto-complete**:
  - Graded units (`graded: true`)
  - Units with scores (`hasScore: true`)
  - These require actual completion from user interaction

### Code:
```javascript
useEffect(() => {
  if (!unitId || unit?.complete) return;

  // Skip auto-completion for graded units or units with scores
  if (unit?.graded || unit?.hasScore) return;

  const timer = setTimeout(async () => {
    // Optimistic update
    dispatch(markUnitComplete({ unitId }));

    // Sync with server
    if (microUnitId && courseId) {
      setTimeout(() => {
        dispatch(fetchMicroUnitBlocks(microUnitId, courseId));
      }, 1000);
    }
  }, 5000);

  return () => clearTimeout(timer);
}, [unitId, unit?.complete, unit?.graded, unit?.hasScore, microUnitId, courseId, dispatch]);
```

## 🎯 Benefits

### 1. **Accurate Completion Tracking**
- Completion status luôn đồng bộ với course
- Khi complete unit trong micro unit → Course unit cũng complete
- Khi complete unit trong course → Micro unit cũng hiển thị complete

### 2. **Real-time Updates**
- Optimistic update: UI responsive ngay lập tức
- Server sync: Đảm bảo data accuracy sau 1 giây

### 3. **Performance Optimization**
- Parallel API calls: `Promise.all()` giảm thời gian load
- Client-side merging: Không cần API endpoint mới
- Efficient re-renders: Redux only updates when data changes

### 4. **Sidebar Auto-Update**
- Sidebar nhận units từ Redux
- Khi Redux update → Sidebar re-render
- Icon CheckCircle hiển thị cho completed units

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  User views     │
│  unit for 5s    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  markUnitComplete│
│  (Redux Action)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Show Toast     │      │  After 1s:       │
│  Notification   │─────▶│  Refresh from    │
└─────────────────┘      │  Server          │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Fetch Both APIs:│
                         │  1. Course Units │
                         │  2. Micro Blocks │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Merge Data      │
                         │  Update Redux    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Sidebar         │
                         │  Re-renders      │
                         │  with ✓ icons    │
                         └──────────────────┘
```

## 🔧 Key Components

### 1. Redux Slice (`slice.js`)
```javascript
markUnitComplete: (state, action) => {
  const { unitId } = action.payload;
  const unitIndex = state.units.findIndex(u => u.id === unitId);
  if (unitIndex !== -1) {
    state.units[unitIndex].complete = true;
  }
}
```

### 2. Thunk (`thunks.js`)
```javascript
export function fetchMicroUnitBlocks(microUnitId, courseId) {
  // Fetch + merge logic
}
```

### 3. Player Component (`MicroUnitPlayer.jsx`)
```javascript
// Auto completion timer
useEffect(() => { ... }, [unitId, unit?.complete]);
```

### 4. Sidebar Component (`MicroUnitsSidebar.jsx`)
```javascript
// Icons based on complete status
{unit.complete ? <CheckCircle /> : <Circle />}
```

## ✅ Testing Checklist

### Regular Units (non-graded, non-scored):
- [ ] Unit shows as incomplete initially
- [ ] After 5 seconds, automatically marked complete
- [ ] Icon in sidebar changes to CheckCircle
- [ ] Navigate to another unit and back → Still shows complete
- [ ] Complete unit in regular course → Shows complete in micro unit
- [ ] Complete unit in micro unit → Shows complete in regular course
- [ ] Refresh page → Completion persists

### Graded/Scored Units:
- [ ] Unit shows as incomplete initially
- [ ] After 5 seconds, still shows incomplete (NO auto-complete)
- [ ] After 10 seconds, still shows incomplete (NO auto-complete)
- [ ] Only marked complete when user actually submits and passes the assessment
- [ ] Badge "Bài kiểm tra" shows in unit header
- [ ] Manual completion works correctly when user completes quiz/problem

## 🚀 Future Improvements

1. **Real-time WebSocket Updates**: Sync completion across tabs
2. **Offline Support**: Queue completion events when offline
3. **Progress Analytics**: Track time spent per unit
4. **Gamification**: Badges, streaks for completing units
