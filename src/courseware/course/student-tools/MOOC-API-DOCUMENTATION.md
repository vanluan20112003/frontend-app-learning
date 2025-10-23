# MOOC REST API Documentation

## Tổng quan
Hệ thống REST API để truy vấn dữ liệu học tập của người dùng trong hệ thống MOOC - H5P.

**Base URL:** `https://h5p.itp.vn/wp-json/mooc/v1`

**Format:** JSON

---

## 1. MOOC SCORES API
API để lấy điểm số H5P của user theo course.

### 1.1. Lấy tất cả điểm của user trong course
```
GET /scores/{user_id}/{course_id}
```

**Ví dụ:**
```bash
# Course ID đơn giản
curl https://h5p.itp.vn/wp-json/mooc/v1/scores/123/course-abc

# Course ID phức tạp (có ký tự đặc biệt: dấu hai chấm, dấu cộng)
curl https://h5p.itp.vn/wp-json/mooc/v1/scores/4/course-v1:DHQG-HCM+FM101+2025_S2

# Nếu cần, có thể URL encode (: -> %3A, + -> %2B)
curl "https://h5p.itp.vn/wp-json/mooc/v1/scores/4/course-v1%3ADHQG-HCM%2BFM101%2B2025_S2"
```

**Response:**
```json
{
  "user_id": "123",
  "course_id": "course-abc",
  "summary": {
    "total_contents": 15,
    "completed_contents": 10,
    "total_score": 850,
    "total_max_score": 1000,
    "overall_percentage": 85.0,
    "total_time_spent": 3600
  },
  "scores": [
    {
      "id": 1,
      "content_id": 45,
      "score": 90,
      "max_score": 100,
      "opened": 1,
      "finished": 1,
      "time": 300,
      "content_title": "Bài tập 1",
      "percentage": 90.0,
      "folder_id": 10,
      "folder_name": "Chương 1",
      "total_contents_in_folder": 25
    }
  ]
}
```

### 1.2. Lấy điểm của một content cụ thể
```
GET /scores/{user_id}/{course_id}/{content_id}
```

### 1.3. Lấy top scores
```
GET /scores/{user_id}/{course_id}/top?limit=10
```

### 1.4. Lấy danh sách contents chưa hoàn thành
```
GET /scores/{user_id}/{course_id}/incomplete
```

---

## 2. FOLDER SCORES API
API để lấy tổng điểm các folder.

### 2.1. Lấy tổng điểm các folders
```
GET /folder-scores/{user_id}/{course_id}
```

**Response:**
```json
{
  "user_id": "123",
  "course_id": "course-abc",
  "summary": {
    "total_folders": 5,
    "completed_folders": 3,
    "grand_total_score": 2500,
    "grand_total_max_score": 3000,
    "overall_percentage": 83.33
  },
  "folder_scores": [
    {
      "id": 1,
      "folder_id": 10,
      "folder_name": "Chương 1",
      "total_score": 500,
      "total_max_score": 600,
      "percentage": 83.33,
      "content_count": 8,
      "total_content_count": 10,
      "completion_rate": 80.0
    }
  ]
}
```

### 2.2. Lấy chi tiết điểm của một folder
```
GET /folder-scores/{user_id}/{course_id}/{folder_id}
```

### 2.3. Lấy danh sách folders chưa hoàn thành
```
GET /folder-scores/{user_id}/{course_id}/incomplete
```

### 2.4. Lấy thống kê folder scores
```
GET /folder-scores/{user_id}/{course_id}/stats
```

---

## 3. VIDEO PROGRESS API
API để lấy tiến độ xem video.

### 3.1. Lấy tiến độ xem video của user
```
GET /video-progress/{user_id}/{course_id}
```

**Response:**
```json
{
  "user_id": "123",
  "course_id": "course-abc",
  "summary": {
    "total_videos": 20,
    "completed_videos": 15,
    "in_progress_videos": 3,
    "not_started_videos": 2,
    "total_duration": 7200,
    "total_watched_time": 6500,
    "overall_progress": 90.28
  },
  "video_progress": [
    {
      "id": 1,
      "content_id": 50,
      "content_title": "Video bài giảng 1",
      "progress_percent": 100,
      "current_time": 600,
      "duration": 600,
      "status": "completed",
      "folder_id": 10,
      "folder_name": "Chương 1",
      "total_contents_in_folder": 25
    }
  ]
}
```

### 3.2. Lấy tiến độ của một video cụ thể
```
GET /video-progress/{user_id}/{course_id}/{content_id}
```

### 3.3. Lấy videos chưa hoàn thành
```
GET /video-progress/{user_id}/{course_id}/incomplete
```

### 3.4. Lấy videos xem gần đây
```
GET /video-progress/{user_id}/{course_id}/recent?limit=10
```

### 3.5. Lấy thống kê video theo folder
```
GET /video-progress/{user_id}/{course_id}/by-folder
```

---

## 4. FOLDER VIDEO PROGRESS API
API để lấy tổng tiến độ xem video theo folder.

### 4.1. Lấy tiến độ video theo folder
```
GET /folder-video-progress/{user_id}/{course_id}
```

**Response:**
```json
{
  "user_id": "123",
  "course_id": "course-abc",
  "summary": {
    "total_folders": 5,
    "completed_folders": 3,
    "in_progress_folders": 2,
    "not_started_folders": 0,
    "total_videos_all_folders": 50,
    "total_completed_videos": 40,
    "average_progress": 85.5
  },
  "folder_progress": [
    {
      "id": 1,
      "folder_id": 10,
      "folder_name": "Chương 1",
      "total_progress": 92.5,
      "videos_started": 10,
      "videos_completed": 9,
      "total_videos": 10,
      "completion_percentage": 90.0,
      "remaining_videos": 1
    }
  ]
}
```

### 4.2. Lấy chi tiết tiến độ video của một folder
```
GET /folder-video-progress/{user_id}/{course_id}/{folder_id}
```

### 4.3. Lấy danh sách folders chưa hoàn thành
```
GET /folder-video-progress/{user_id}/{course_id}/incomplete
```

### 4.4. Lấy thống kê folder video
```
GET /folder-video-progress/{user_id}/{course_id}/stats
```

### 4.5. So sánh tiến độ giữa các folder
```
GET /folder-video-progress/{user_id}/{course_id}/compare
```

---

## 5. USER DASHBOARD API
API tổng hợp toàn bộ tiến độ học tập của user.

### 5.1. Dashboard tổng quan
```
GET /dashboard/{user_id}/{course_id}
```

**Response:**
```json
{
  "user_id": "123",
  "course_id": "course-abc",
  "overview": {
    "overall_completion": 85.5,
    "total_items": 70,
    "completed_items": 60,
    "items_to_complete": 10
  },
  "h5p_stats": {
    "total_contents": 30,
    "completed_contents": 25,
    "total_score": 2250,
    "total_max_score": 3000,
    "average_percentage": 75.0,
    "total_time_spent": 5400
  },
  "folder_scores_stats": {
    "total_folders": 5,
    "completed_folders": 3,
    "average_folder_percentage": 80.0
  },
  "video_stats": {
    "total_videos": 40,
    "completed_videos": 35,
    "in_progress_videos": 3,
    "average_video_progress": 92.5
  },
  "recent_activities": [],
  "top_achievements": [],
  "items_to_complete": {
    "h5p_contents": 5,
    "videos": 5,
    "folders": 2
  }
}
```

### 5.2. Báo cáo chi tiết
```
GET /dashboard/{user_id}/{course_id}/report
```

Trả về báo cáo chi tiết theo từng folder với tất cả contents và tiến độ.

### 5.3. Gợi ý học tập
```
GET /dashboard/{user_id}/{course_id}/suggestions
```

Trả về danh sách nội dung được gợi ý để học tiếp theo.

### 5.4. Thống kê theo thời gian
```
GET /dashboard/{user_id}/{course_id}/timeline?days=7
```

**Parameters:**
- `days` (optional): Số ngày thống kê (mặc định: 7)

---

## Cấu trúc Database

### 1. wp_mooc_scores
Lưu điểm số H5P của user.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INT | Primary key |
| content_id | INT | ID của H5P content |
| user_id | VARCHAR | User ID từ MOOC |
| course_id | VARCHAR | Course ID từ MOOC |
| score | INT | Điểm đạt được |
| max_score | INT | Điểm tối đa |
| opened | TINYINT | Đã mở content |
| finished | TINYINT | Đã hoàn thành |
| time | INT | Thời gian làm bài (giây) |

### 2. wp_mooc_folder_max_scores
Lưu tổng điểm folder.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INT | Primary key |
| folder_id | INT | ID folder |
| user_id | VARCHAR | User ID từ MOOC |
| course_id | VARCHAR | Course ID từ MOOC |
| total_score | INT | Tổng điểm đạt được |
| total_max_score | INT | Tổng điểm tối đa |
| percentage | DECIMAL | Phần trăm hoàn thành |
| content_count | INT | Số content đã hoàn thành |
| total_content_count | INT | Tổng số content |

### 3. wp_video_progress
Lưu tiến độ xem video.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INT | Primary key |
| content_id | INT | ID của video content |
| user_id | VARCHAR | User ID từ MOOC |
| course_id | VARCHAR | Course ID từ MOOC |
| progress_percent | DECIMAL | Phần trăm xem (0-100) |
| current_time | INT | Thời gian hiện tại (giây) |
| duration | INT | Tổng thời lượng (giây) |

### 4. wp_folder_video_progress
Lưu tổng tiến độ video của folder.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INT | Primary key |
| folder_id | INT | ID folder |
| user_id | VARCHAR | User ID từ MOOC |
| course_id | VARCHAR | Course ID từ MOOC |
| total_progress | DECIMAL | Tổng % tiến trình trung bình |
| videos_started | INT | Số video đã bắt đầu xem |
| videos_completed | INT | Số video đã xem xong |
| total_videos | INT | Tổng số video |
| completion_percentage | DECIMAL | Phần trăm hoàn thành folder |

### 5. wp_folder_courses
Liên kết giữa folder và course.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INT | Primary key |
| folder_id | INT | ID folder |
| course_id | VARCHAR | Course ID từ MOOC |

---

## 6. COMBINED PROGRESS API (MỚI)
API tổng hợp cả video progress và scores trong một endpoint.

### 6.1. Lấy tổng hợp video và điểm
```
GET /combined-progress/{user_id}/{course_id}
```

**Response:**
```json
{
  "user_id": "4",
  "course_id": "course-v1:DHQG-HCM+FM101+2025_S2",
  "overall": {
    "total_items": 50,
    "completed_items": 40,
    "overall_completion": 80.0,
    "total_contents_in_course_folders": 48
  },
  "video_progress": {
    "total_videos": 30,
    "completed_videos": 25,
    "in_progress_videos": 3,
    "not_started_videos": 2,
    "average_progress": 85.5,
    "total_duration": 7200,
    "total_watched_time": 6500
  },
  "scores": {
    "total_contents": 20,
    "completed_contents": 15,
    "pending_contents": 5,
    "total_score": 1350,
    "total_max_score": 2000,
    "average_percentage": 67.5,
    "total_time_spent": 3600
  }
}
```

**Thông tin trả về:**

**`overall`** - Thống kê tổng quan:
- `total_items`: Tổng số items (videos + scored contents) mà user đã tương tác
- `completed_items`: Số items đã hoàn thành
- `overall_completion`: Phần trăm hoàn thành tổng thể
- `total_contents_in_course_folders`: Tổng số H5P contents trong tất cả folders của course (bất kể user đã tương tác hay chưa)

**`video_progress`** - Thống kê video:
- `total_videos`: Tổng số videos user đã xem
- `completed_videos`: Số videos đã xem xong (≥95%)
- `in_progress_videos`: Số videos đang xem
- `not_started_videos`: Số videos chưa xem
- `average_progress`: % tiến độ trung bình
- `total_duration`: Tổng thời lượng videos (giây)
- `total_watched_time`: Tổng thời gian đã xem (giây)

**`scores`** - Thống kê điểm:
- `total_contents`: Tổng số H5P contents có điểm
- `completed_contents`: Số contents đã hoàn thành
- `pending_contents`: Số contents chưa hoàn thành
- `total_score`: Tổng điểm đạt được
- `total_max_score`: Tổng điểm tối đa
- `average_percentage`: % điểm trung bình
- `total_time_spent`: Tổng thời gian làm bài (giây)

### 6.2. Tổng hợp theo từng folder
```
GET /combined-progress/{user_id}/{course_id}/by-folder
```

Trả về thông tin video và điểm của từng folder, bao gồm `total_contents_in_folder`.

### 6.3. Summary nhanh
```
GET /combined-progress/{user_id}/{course_id}/summary
```

Chỉ trả về số liệu tổng hợp, không có chi tiết.

---

## 7. CONTENT DETAIL API
API để lấy chi tiết điểm số và tiến độ video của một content cụ thể.

### 7.1. Lấy chi tiết một content
```
GET /content-detail/{user_id}/{course_id}/{content_id}
```

**Ví dụ:**
```bash
curl "https://h5p.itp.vn/wp-json/mooc/v1/content-detail/4/course-v1:DHQG-HCM+FM101+2025_S2/259"
```

**Response:**
```json
{
  "user_id": "4",
  "course_id": "course-v1:DHQG-HCM+FM101+2025_S2",
  "content_id": 259,
  "content_info": {
    "title": "Bài tập chương 1",
    "library_id": 15
  },
  "folder_info": {
    "folder_id": 10,
    "folder_name": "Chương 1 - Giới thiệu",
    "total_contents_in_folder": 25
  },
  "score": {
    "has_score": true,
    "score": 4,
    "max_score": 5,
    "percentage": 80.0,
    "opened": true,
    "finished": false,
    "time_spent": 904,
    "created_at": "2025-10-09 14:27:41",
    "updated_at": "2025-10-09 14:30:44"
  },
  "video_progress": {
    "has_progress": true,
    "progress_percent": 97.65,
    "current_time": 498.48,
    "duration": 510.49,
    "watch_percentage": 97.65,
    "status": "completed",
    "remaining_time": 12.01,
    "last_updated": "2025-10-09 23:49:14"
  },
  "summary": {
    "is_completed": true,
    "has_interaction": true,
    "overall_progress": 88.83
  }
}
```

**Thông tin trả về:**

**`content_info`** - Thông tin H5P content:
- `title`: Tiêu đề content
- `library_id`: ID thư viện H5P

**`folder_info`** - Thông tin folder chứa content:
- `folder_id`: ID folder
- `folder_name`: Tên folder
- `total_contents_in_folder`: Tổng số contents trong folder
- `null` nếu content không thuộc folder nào

**`score`** - Thông tin điểm số:
- `has_score`: Có dữ liệu điểm hay không
- `score`: Điểm đạt được
- `max_score`: Điểm tối đa
- `percentage`: Phần trăm điểm (score/max_score × 100)
- `opened`: Đã mở content chưa
- `finished`: Đã hoàn thành chưa
- `time_spent`: Thời gian làm bài (giây)
- `created_at`: Thời gian tạo record
- `updated_at`: Thời gian cập nhật cuối

**`video_progress`** - Tiến độ xem video:
- `has_progress`: Có dữ liệu tiến độ hay không
- `progress_percent`: Phần trăm tiến độ xem (0-100)
- `current_time`: Thời gian hiện tại đã xem (giây)
- `duration`: Tổng thời lượng video (giây)
- `watch_percentage`: Phần trăm thời gian đã xem (current_time/duration × 100)
- `status`: Trạng thái (`not_started`, `started`, `in_progress`, `completed`)
- `remaining_time`: Thời gian còn lại (giây)
- `last_updated`: Thời gian cập nhật cuối

**`summary`** - Tổng hợp:
- `is_completed`: Content đã hoàn thành chưa (finished=true hoặc progress≥95%)
- `has_interaction`: User đã tương tác với content chưa
- `overall_progress`: Tiến độ tổng thể (trung bình cộng của score percentage và video progress)

**Use cases:**
- Hiển thị chi tiết tiến độ của một content cụ thể
- Tracking học tập chi tiết của học viên
- Hiển thị popup thông tin khi click vào content
- Sync trạng thái content giữa MOOC và H5P

---

## Ví dụ sử dụng

### JavaScript/Fetch API
```javascript
// Lấy dashboard tổng quan
async function getUserDashboard(userId, courseId) {
  const response = await fetch(
    `https://h5p.itp.vn/wp-json/mooc/v1/dashboard/${userId}/${courseId}`
  );
  const data = await response.json();
  console.log(data);
}

// Lấy tiến độ video
async function getVideoProgress(userId, courseId) {
  const response = await fetch(
    `https://h5p.itp.vn/wp-json/mooc/v1/video-progress/${userId}/${courseId}`
  );
  const data = await response.json();
  return data;
}
```

### PHP/cURL
```php
// Lấy điểm số user
function get_user_scores($user_id, $course_id) {
    $url = "https://h5p.itp.vn/wp-json/mooc/v1/scores/{$user_id}/{$course_id}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}
```

### Python/Requests
```python
import requests

def get_user_dashboard(user_id, course_id):
    url = f"https://h5p.itp.vn/wp-json/mooc/v1/dashboard/{user_id}/{course_id}"
    response = requests.get(url)
    return response.json()

# Sử dụng
data = get_user_dashboard("123", "course-abc")
print(data['overview'])
```

---

## Status Codes

| Code | Mô tả |
|------|-------|
| 200 | Success |
| 400 | Bad Request - Thiếu parameters |
| 404 | Not Found - Không tìm thấy dữ liệu |
| 500 | Internal Server Error |

---

## Notes

- Tất cả API đều trả về JSON format
- **`user_id`:** Chấp nhận chữ, số, underscore và dấu gạch ngang (`[a-zA-Z0-9_-]`)
- **`course_id`:** Chấp nhận chữ, số, underscore, dấu gạch ngang, dấu hai chấm và dấu cộng (`[a-zA-Z0-9_-:+]`)
  - Ví dụ course_id hợp lệ:
    - `course-abc`
    - `course_123`
    - `course-v1:DHQG-HCM+FM101+2025_S2`
  - Nếu gặp lỗi 404, thử URL encode các ký tự đặc biệt (`:` → `%3A`, `+` → `%2B`)
- Phần trăm được làm tròn đến 2 chữ số thập phân
- Thời gian được tính bằng giây
- Timestamps sử dụng format MySQL datetime (`Y-m-d H:i:s`)

---

## Permission & Security

⚠️ **Lưu ý:** Hiện tại API đang sử dụng `permission_callback => '__return_true'` (public access).

Để production, nên thêm authentication:
```php
'permission_callback' => function() {
    return current_user_can('read');
}
```

Hoặc sử dụng JWT/OAuth token authentication cho cross-domain requests.
