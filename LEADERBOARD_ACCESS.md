# Cách truy cập Bảng Xếp Hạng (Leaderboard)

## Phương pháp 1: Qua URL trực tiếp
Truy cập leaderboard bằng URL sau:
```
/course/:courseId/leaderboard
```

Ví dụ:
```
http://localhost:2000/course/course-v1:edX+DemoX+Demo_Course/leaderboard
```

## Phương pháp 2: Cấu hình Backend
Để tab leaderboard hiển thị trong navigation tabs, backend cần trả về trong API response `courseHomeMeta`:

```json
{
  "tabs": [
    {
      "title": "Bảng Xếp Hạng",
      "slug": "leaderboard",
      "url": "/course/:courseId/leaderboard"
    }
  ]
}
```

## Tính năng Leaderboard

### 1. Bảng Xếp Hạng Điểm (Grades)
- Top học viên theo điểm số
- Hiển thị: điểm trung bình, số bài hoàn thành
- Chọn số lượng: 10/20/50/100 học viên
- Summary statistics

### 2. Bảng Xếp Hạng Tiến Độ (Progress)
- Top học viên theo tốc độ học
- Filter theo thời gian: Tuần/Tháng/Mọi thời đại
- Hiển thị: % tiến độ, tốc độ học
- Speed badges: Thần tốc/Nhanh/Ổn định

### 3. Demo Mode
Nếu API backend chưa có, hệ thống tự động dùng dữ liệu demo để hiển thị.

## API Endpoints (Backend cần implement)
```
GET /api/custom/v1/leaderboard/top-grades/{course_id}/
GET /api/custom/v1/leaderboard/top-progress/{course_id}/
```

## Giao diện
- Thiết kế thanh lịch, chuyên nghiệp
- Phù hợp môi trường giáo dục
- Medal icons cho top 3
- Responsive mobile
- Dark mode support
