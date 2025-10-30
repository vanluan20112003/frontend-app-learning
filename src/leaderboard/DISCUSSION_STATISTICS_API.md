# API Thống Kê Tương Tác Discussion

Tài liệu này mô tả các API thống kê tương tác của khóa học trong hệ thống Discussion.

## Tổng quan

Các API này cung cấp thông tin thống kê chi tiết về hoạt động thảo luận trong khóa học, bao gồm:
- Thống kê tổng quan về số lượng topic, comment, người tham gia
- Bảng xếp hạng người dùng theo nhiều tiêu chí
- Hoạt động theo thời gian (timeline)
- Người dùng hoạt động nhiều nhất

**Base URL**: `/api/custom/v1/discussions/`

**Authentication**: Tất cả APIs đều yêu cầu authentication (Bearer token)

---

## 1. API Thống Kê Chi Tiết Khóa Học

Lấy thống kê chi tiết về tương tác trong khóa học.

### Endpoint
```
GET /api/custom/v1/discussions/statistics/detailed/<course_id>/
```

### Parameters
- `course_id` (path parameter): ID của khóa học (ví dụ: `course-v1:edX+DemoX+Demo_Course`)

### Response

```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "statistics": {
        "total_threads": 150,
        "total_comments": 523,
        "total_questions": 85,
        "total_discussions": 65,
        "total_participants": 45,
        "threads_with_comments": 120,
        "response_rate": 80.0,
        "total_upvotes": 234,
        "total_downvotes": 12,
        "total_interactions": 673
    }
}
```

### Giải thích các trường:
- `total_threads`: Tổng số topic (threads)
- `total_comments`: Tổng số comment (bao gồm cả replies)
- `total_questions`: Số lượng câu hỏi (thread_type = "question")
- `total_discussions`: Số lượng discussion (thread_type = "discussion")
- `total_participants`: Số người tham gia thảo luận (unique users)
- `threads_with_comments`: Số threads có ít nhất 1 comment
- `response_rate`: Tỷ lệ % threads có người trả lời
- `total_upvotes`: Tổng số upvotes
- `total_downvotes`: Tổng số downvotes
- `total_interactions`: Tổng tương tác (threads + comments)

### Ví dụ sử dụng:

```bash
curl -X GET "http://localhost:18000/api/custom/v1/discussions/statistics/detailed/course-v1:edX+DemoX+Demo_Course/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. API Bảng Xếp Hạng Người Dùng

Lấy bảng xếp hạng người dùng theo các tiêu chí khác nhau.

### Endpoint
```
GET /api/custom/v1/discussions/leaderboard/<course_id>/
```

### Parameters

**Path Parameter:**
- `course_id`: ID của khóa học

**Query Parameters:**
- `ranking_type` (optional): Loại xếp hạng, mặc định `all`
  - `all`: Tổng tất cả tương tác (threads + comments)
  - `threads`: Số lượng topic tạo
  - `comments`: Số lượng comment
  - `questions`: Số lượng câu hỏi tạo
  - `votes`: Số lượng upvotes nhận được
- `limit` (optional): Số lượng users trả về, mặc định `20`

### Response

**Ranking Type = 'all' (Tất cả tương tác)**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "ranking_type": "all",
    "total_users": 20,
    "data": [
        {
            "rank": 1,
            "user_id": "490",
            "username": "john_doe",
            "threads_count": 25,
            "comments_count": 150,
            "total_interactions": 175
        },
        {
            "rank": 2,
            "user_id": "523",
            "username": "jane_smith",
            "threads_count": 30,
            "comments_count": 120,
            "total_interactions": 150
        }
    ]
}
```

**Ranking Type = 'threads' (Số lượng topic)**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "ranking_type": "threads",
    "total_users": 20,
    "data": [
        {
            "rank": 1,
            "user_id": "523",
            "username": "jane_smith",
            "threads_count": 30
        },
        {
            "rank": 2,
            "user_id": "490",
            "username": "john_doe",
            "threads_count": 25
        }
    ]
}
```

**Ranking Type = 'comments' (Số lượng comment)**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "ranking_type": "comments",
    "total_users": 20,
    "data": [
        {
            "rank": 1,
            "user_id": "490",
            "username": "john_doe",
            "comments_count": 150
        },
        {
            "rank": 2,
            "user_id": "523",
            "username": "jane_smith",
            "comments_count": 120
        }
    ]
}
```

**Ranking Type = 'questions' (Số lượng câu hỏi)**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "ranking_type": "questions",
    "total_users": 15,
    "data": [
        {
            "rank": 1,
            "user_id": "490",
            "username": "john_doe",
            "questions_count": 18
        },
        {
            "rank": 2,
            "user_id": "567",
            "username": "bob_wilson",
            "questions_count": 12
        }
    ]
}
```

**Ranking Type = 'votes' (Số lượng upvotes)**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "ranking_type": "votes",
    "total_users": 20,
    "data": [
        {
            "rank": 1,
            "user_id": "523",
            "username": "jane_smith",
            "total_upvotes": 234
        },
        {
            "rank": 2,
            "user_id": "490",
            "username": "john_doe",
            "total_upvotes": 198
        }
    ]
}
```

### Ví dụ sử dụng:

```bash
# Xếp hạng tổng thể (all interactions)
curl -X GET "http://localhost:18000/api/custom/v1/discussions/leaderboard/course-v1:edX+DemoX+Demo_Course/?ranking_type=all&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xếp hạng theo số topic tạo
curl -X GET "http://localhost:18000/api/custom/v1/discussions/leaderboard/course-v1:edX+DemoX+Demo_Course/?ranking_type=threads&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xếp hạng theo số comment
curl -X GET "http://localhost:18000/api/custom/v1/discussions/leaderboard/course-v1:edX+DemoX+Demo_Course/?ranking_type=comments&limit=15" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xếp hạng theo số câu hỏi
curl -X GET "http://localhost:18000/api/custom/v1/discussions/leaderboard/course-v1:edX+DemoX+Demo_Course/?ranking_type=questions&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xếp hạng theo upvotes
curl -X GET "http://localhost:18000/api/custom/v1/discussions/leaderboard/course-v1:edX+DemoX+Demo_Course/?ranking_type=votes&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. API Timeline Hoạt Động

Lấy thống kê hoạt động theo thời gian (timeline).

### Endpoint
```
GET /api/custom/v1/discussions/timeline/<course_id>/
```

### Parameters

**Path Parameter:**
- `course_id`: ID của khóa học

**Query Parameters:**
- `time_range` (optional): Khoảng thời gian, mặc định `7days`
  - `7days`: 7 ngày gần đây
  - `30days`: 30 ngày gần đây
  - `90days`: 90 ngày gần đây
  - `all`: Tất cả thời gian
- `group_by` (optional): Nhóm theo, mặc định `day`
  - `day`: Theo ngày
  - `week`: Theo tuần
  - `month`: Theo tháng

### Response

**Group by Day**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "time_range": "7days",
    "group_by": "day",
    "data": [
        {
            "date": "2025-10-05",
            "threads_count": 5,
            "comments_count": 23,
            "total_interactions": 28
        },
        {
            "date": "2025-10-06",
            "threads_count": 8,
            "comments_count": 31,
            "total_interactions": 39
        },
        {
            "date": "2025-10-07",
            "threads_count": 3,
            "comments_count": 18,
            "total_interactions": 21
        }
    ]
}
```

**Group by Week**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "time_range": "30days",
    "group_by": "week",
    "data": [
        {
            "date": "2025-W40",
            "threads_count": 25,
            "comments_count": 120,
            "total_interactions": 145
        },
        {
            "date": "2025-W41",
            "threads_count": 30,
            "comments_count": 140,
            "total_interactions": 170
        }
    ]
}
```

**Group by Month**
```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "time_range": "90days",
    "group_by": "month",
    "data": [
        {
            "date": "2025-08",
            "threads_count": 60,
            "comments_count": 280,
            "total_interactions": 340
        },
        {
            "date": "2025-09",
            "threads_count": 75,
            "comments_count": 320,
            "total_interactions": 395
        },
        {
            "date": "2025-10",
            "threads_count": 42,
            "comments_count": 185,
            "total_interactions": 227
        }
    ]
}
```

### Ví dụ sử dụng:

```bash
# Timeline 7 ngày gần đây, theo ngày
curl -X GET "http://localhost:18000/api/custom/v1/discussions/timeline/course-v1:edX+DemoX+Demo_Course/?time_range=7days&group_by=day" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Timeline 30 ngày, theo tuần
curl -X GET "http://localhost:18000/api/custom/v1/discussions/timeline/course-v1:edX+DemoX+Demo_Course/?time_range=30days&group_by=week" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Timeline 90 ngày, theo tháng
curl -X GET "http://localhost:18000/api/custom/v1/discussions/timeline/course-v1:edX+DemoX+Demo_Course/?time_range=90days&group_by=month" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Timeline tất cả thời gian, theo tháng
curl -X GET "http://localhost:18000/api/custom/v1/discussions/timeline/course-v1:edX+DemoX+Demo_Course/?time_range=all&group_by=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. API Top Active Users

Lấy danh sách người dùng hoạt động nhiều nhất trong X ngày gần đây.

### Endpoint
```
GET /api/custom/v1/discussions/top-active-users/<course_id>/
```

### Parameters

**Path Parameter:**
- `course_id`: ID của khóa học

**Query Parameters:**
- `days` (optional): Số ngày gần đây, mặc định `7`
- `limit` (optional): Số lượng users trả về, mặc định `10`

### Response

```json
{
    "success": true,
    "course_id": "course-v1:edX+DemoX+Demo_Course",
    "time_period": "last_7_days",
    "total_active_users": 28,
    "data": [
        {
            "rank": 1,
            "user_id": "490",
            "username": "john_doe",
            "threads_count": 8,
            "comments_count": 45,
            "total_activities": 53
        },
        {
            "rank": 2,
            "user_id": "523",
            "username": "jane_smith",
            "threads_count": 12,
            "comments_count": 38,
            "total_activities": 50
        },
        {
            "rank": 3,
            "user_id": "567",
            "username": "bob_wilson",
            "threads_count": 5,
            "comments_count": 42,
            "total_activities": 47
        }
    ]
}
```

### Giải thích các trường:
- `rank`: Thứ hạng
- `user_id`: ID người dùng
- `username`: Tên người dùng
- `threads_count`: Số threads tạo trong X ngày
- `comments_count`: Số comments trong X ngày
- `total_activities`: Tổng hoạt động (threads + comments)

### Ví dụ sử dụng:

```bash
# Top 10 users trong 7 ngày gần đây
curl -X GET "http://localhost:18000/api/custom/v1/discussions/top-active-users/course-v1:edX+DemoX+Demo_Course/?days=7&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Top 20 users trong 30 ngày gần đây
curl -X GET "http://localhost:18000/api/custom/v1/discussions/top-active-users/course-v1:edX+DemoX+Demo_Course/?days=30&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Top 5 users trong 14 ngày gần đây
curl -X GET "http://localhost:18000/api/custom/v1/discussions/top-active-users/course-v1:edX+DemoX+Demo_Course/?days=14&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Use Cases

### 1. Dashboard Tổng Quan Khóa Học
Hiển thị các thông số chính về hoạt động thảo luận:
```bash
GET /api/custom/v1/discussions/statistics/detailed/course-v1:edX+DemoX+Demo_Course/
```

### 2. Bảng Xếp Hạng Người Dùng Tương Tác Nhiều Nhất
Hiển thị top contributors trong khóa học:
```bash
GET /api/custom/v1/discussions/leaderboard/course-v1:edX+DemoX+Demo_Course/?ranking_type=all&limit=20
```

### 3. Bảng Xếp Hạng Người Đặt Câu Hỏi Nhiều Nhất
Hiển thị những người tạo nhiều câu hỏi nhất:
```bash
GET /api/custom/v1/discussions/leaderboard/course-v1:edX+DemoX+Demo_Course/?ranking_type=questions&limit=10
```

### 4. Biểu Đồ Hoạt Động Theo Thời Gian
Hiển thị biểu đồ hoạt động 30 ngày gần đây:
```bash
GET /api/custom/v1/discussions/timeline/course-v1:edX+DemoX+Demo_Course/?time_range=30days&group_by=day
```

### 5. Widget "Most Active This Week"
Hiển thị top 5 users hoạt động nhất tuần này:
```bash
GET /api/custom/v1/discussions/top-active-users/course-v1:edX+DemoX+Demo_Course/?days=7&limit=5
```

---

## Error Handling

Tất cả APIs trả về cấu trúc error thống nhất:

### 400 Bad Request
```json
{
    "success": false,
    "error": "Invalid ranking_type. Must be one of: all, threads, comments, questions, votes"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "error": "Error message here"
}
```

---

## Notes

1. **Performance**: Các API thống kê sử dụng MongoDB aggregation pipeline để tối ưu hiệu suất
2. **Caching**: Nên implement caching cho các thống kê không thay đổi thường xuyên
3. **Real-time**: Dữ liệu được lấy real-time từ MongoDB, không có delay
4. **Time Zones**: Tất cả thời gian sử dụng UTC
5. **Authentication**: Phải có token hợp lệ để gọi APIs

---

## Tổng Kết APIs

| API | Endpoint | Mục đích |
|-----|----------|----------|
| Thống kê chi tiết | `/discussions/statistics/detailed/<course_id>/` | Tổng quan số liệu khóa học |
| Bảng xếp hạng | `/discussions/leaderboard/<course_id>/` | Xếp hạng users theo nhiều tiêu chí |
| Timeline | `/discussions/timeline/<course_id>/` | Hoạt động theo thời gian |
| Top active users | `/discussions/top-active-users/<course_id>/` | Users hoạt động nhiều nhất gần đây |
