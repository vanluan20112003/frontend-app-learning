# Micro Units Module

Module này cung cấp tính năng hiển thị và phát các micro learning units (verticals) độc lập, tách riêng khỏi cấu trúc khóa học chính.

## Tính năng

- Hiển thị danh sách tất cả units của một khóa học dưới dạng card grid
- Phát từng unit riêng lẻ trong iframe player
- Hiển thị trạng thái completion, grading, và metadata của unit
- Điều hướng dễ dàng giữa danh sách và player
- Responsive design cho mobile và desktop

## Cấu trúc thư mục

```
src/micro-units/
├── data/
│   ├── api.js              # API service functions
│   ├── slice.js            # Redux slice
│   ├── thunks.js           # Redux thunks
│   ├── selectors.js        # Redux selectors
│   └── index.js            # Exports
├── MicroUnitsPage.jsx      # Main page component
├── MicroUnitPlayer.jsx     # Unit player component
├── index.js                # Module exports
└── README.md               # This file
```

## API Endpoint

Module này sử dụng API endpoint mới từ backend:

```
GET /api/micro_unit/v1/units/{course_id}
```

**Response format:**
```json
{
  "course_id": "course-v1:edX+DemoX+Demo_Course",
  "total_units": 15,
  "units": [
    {
      "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_1",
      "display_name": "Introduction",
      "type": "vertical",
      "lms_web_url": "https://...",
      "graded": false,
      "format": "",
      "due": null,
      "has_score": false,
      "complete": true
    }
  ]
}
```

## Routes

Module thêm 2 routes mới:

1. **Danh sách units**: `/micro-units/{courseId}`
   - Hiển thị grid của tất cả units trong khóa học

2. **Phát unit**: `/micro-units/{courseId}/{unitId}`
   - Hiển thị player cho unit cụ thể

## Cách sử dụng

### Truy cập từ URL

```
# Xem danh sách units
http://localhost:2000/micro-units/course-v1:edX+DemoX+Demo_Course

# Phát unit cụ thể
http://localhost:2000/micro-units/course-v1:edX+DemoX+Demo_Course/block-v1:...
```

### Sử dụng trong code

```javascript
import { MicroUnitsPage, MicroUnitPlayer } from '@src/micro-units';

// Hoặc dispatch thunks
import { fetchMicroUnits } from '@src/micro-units';

dispatch(fetchMicroUnits(courseId));
```

### Redux State

State được lưu trong `state.microUnits`:

```javascript
{
  courseId: string,
  units: Array<Unit>,
  totalUnits: number,
  status: 'idle' | 'loading' | 'loaded' | 'failed',
  error: string | null,
  currentUnit: Unit | null,
  currentUnitStatus: 'idle' | 'loading' | 'loaded' | 'failed',
  currentUnitError: string | null,
}
```

## Components

### MicroUnitsPage

Component chính hiển thị:
- Header với tiêu đề và số lượng units
- Grid cards của tất cả units (khi chế độ list)
- Player cho unit đã chọn (khi chế độ player)
- Nút "Back to List" để quay lại danh sách

**Props**: Không có (sử dụng URL params)

### MicroUnitPlayer

Component player để phát unit trong iframe:

**Props**:
- `courseId` (string, required): ID của khóa học
- `unitId` (string, required): ID của unit cần phát
- `unit` (object, optional): Object unit với metadata

## Styling

Components sử dụng:
- Styled JSX cho scoped styles
- Paragon components (@openedx/paragon)
- Responsive breakpoints cho mobile
- Gradient header với màu tím
- Loading states với spinners

## Khác biệt với Courseware

| Feature | Courseware | Micro Units |
|---------|------------|-------------|
| Cấu trúc | Hierarchical (Course → Section → Sequence → Unit) | Flat (Course → Units) |
| Navigation | Sequential, với breadcrumbs | Grid view, direct access |
| API | `/api/course_home/v1/navigation/` | `/api/micro_unit/v1/units/` |
| Layout | Full course structure với sidebar | Simplified, units only |
| Use case | Structured learning path | Quick access, micro-learning |

## Development

### Thêm tính năng mới

1. Cập nhật API service trong `data/api.js`
2. Thêm actions/reducers trong `data/slice.js`
3. Tạo thunks trong `data/thunks.js`
4. Thêm selectors trong `data/selectors.js`
5. Cập nhật components

### Testing

```bash
# Lint check
npm run lint src/micro-units/

# Build
npm run build

# Development
npm start
```

## Backend Requirements

Backend cần implement API endpoint:
- `GET /api/micro_unit/v1/units/{course_id}`
- Authentication: JWT, Bearer Token, hoặc Session
- Permissions: User phải có quyền access course

Xem chi tiết tại backend README: `lms/djangoapps/micro_unit/README.md`

## Future Enhancements

- [ ] Thêm filters (graded, incomplete, etc.)
- [ ] Thêm search functionality
- [ ] Thêm sorting options
- [ ] Thêm pagination
- [ ] Thêm bookmarking units
- [ ] Thêm progress tracking
- [ ] Export unit list
- [ ] Share unit links

