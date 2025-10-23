# H5P API Integration - VideoProgressTool

## Tổng quan
VideoProgressTool đã được tích hợp với H5P API để lấy dữ liệu học tập thực tế của học sinh thay vì dùng dữ liệu mẫu.

## API Endpoint được sử dụng

### Combined Progress API
```
GET https://h5p.itp.vn/wp-json/mooc/v1/combined-progress/{user_id}/{course_id}
```

API này trả về tổng hợp cả:
- Tiến độ xem video
- Điểm số bài tập H5P
- Thống kê tổng quan

## Data Mapping

### API Response Structure
```json
{
  "user_id": "4",
  "course_id": "course-v1:DHQG-HCM+FM101+2025_S2",
  "overall": {
    "total_items": 50,
    "completed_items": 40,
    "overall_completion": 80.0
  },
  "video_progress": {
    "total_videos": 30,
    "completed_videos": 25,
    "average_progress": 85.5,
    "total_watched_time": 6500,
    "total_duration": 7200
  },
  "scores": {
    "total_contents": 20,
    "completed_contents": 15,
    "total_score": 1350,
    "total_max_score": 2000,
    "average_percentage": 67.5
  }
}
```

### Mapped to progressData
```javascript
{
  // Video statistics
  videosStarted: data.video_progress.total_videos,
  totalVideos: data.video_progress.total_videos,
  videosCompleted: data.video_progress.completed_videos,
  averageWatchProgress: data.video_progress.average_progress,

  // Score statistics
  currentScore: data.scores.total_score,
  maxPossibleScore: data.scores.total_max_score,
  scorePercentage: data.scores.average_percentage,
  videoInteractionPoints: data.scores.total_score,

  // Overall completion
  courseCompletionRate: data.overall.overall_completion,

  // Additional info
  totalContents: data.scores.total_contents,
  completedContents: data.scores.completed_contents,
  totalWatchedTime: data.video_progress.total_watched_time,
  totalDuration: data.video_progress.total_duration
}
```

## Tính năng

### 1. Auto-load Data
- Tự động tải dữ liệu khi component mount
- Lấy user_id từ API `/api/custom/v1/users/me/`
- Gọi H5P API với user_id và courseId

### 2. Refresh Button
- Nút "Cập nhật" màu xanh lá
- Cho phép refresh dữ liệu thủ công
- Hiển thị loading state khi đang cập nhật
- Icon: Refresh

### 3. Error Handling
- Hiển thị error message khi API fails
- Nút "Thử lại" để retry
- Console log để debug

### 4. Loading States
- Spinner khi đang tải dữ liệu lần đầu
- Button disabled state khi đang refresh
- Text thay đổi: "Cập nhật" → "Đang cập nhật..."

### 5. Thuật ngữ rõ ràng
- "Điểm quá trình" thay vì "Điểm số"
- Giải thích rõ: bao gồm điểm tương tác video & bài tập (không bao gồm điểm thi)

### 6. Chú ý quan trọng cho học sinh
#### 📌 3 Chú ý được hiển thị trong Full View:

1. **Info Note (Xanh dương)**:
   - 💡 Điểm quá trình bao gồm điểm tương tác video và bài tập trong khóa học (không bao gồm điểm thi)

2. **Warning Note #1 (Vàng)**:
   - ⭐ **Quan trọng:** Bấm vào nút ngôi sao ở cuối video để hoàn thành xem video

3. **Warning Note #2 (Vàng)**:
   - 📝 **Bài tập:** Nhớ bấm nút "Nộp bài" để kết quả được ghi nhận

4. **Danger Note (Đỏ)**:
   - ⚠️ **Chú ý:** Không sử dụng tab ẩn danh khi làm bài tập tương tác

### 7. UI Simplification
- Bỏ User ID khỏi header
- Bỏ Course ID khỏi header
- Chỉ hiển thị: Tên học sinh & Email

## Test với dữ liệu thực

### Test User & Course
Theo tài liệu API, có thể test với:
- User ID: `4`
- Course ID: `course-v1:DHQG-HCM+FM101+2025_S2`

### Test URL
```
https://h5p.itp.vn/wp-json/mooc/v1/combined-progress/4/course-v1:DHQG-HCM+FM101+2025_S2
```

### Browser Console
Mở browser console để xem:
- `Fetching progress from: [URL]` - URL đang gọi
- `H5P Progress Data: [Object]` - Response từ API

## Troubleshooting

### Lỗi CORS
Nếu gặp CORS error, cần config server H5P để allow cross-origin requests.

### Course ID encoding
Course ID có ký tự đặc biệt (`:`, `+`) có thể cần URL encode:
- `:` → `%3A`
- `+` → `%2B`

Hiện tại code đã xử lý tự động bằng `fetch()`.

### Empty/No Data
- Kiểm tra user_id có tồn tại trong database H5P
- Kiểm tra course_id có đúng format
- Verify user đã có dữ liệu học tập trong course

### 404 Error
- Kiểm tra H5P API endpoint có hoạt động
- Test trực tiếp bằng cURL hoặc browser
- Flush WordPress permalinks nếu cần

## Code Location

- **Component**: `/src/courseware/course/student-tools/VideoProgressTool.jsx`
- **Styles**: `/src/courseware/course/student-tools/VideoProgressTool.scss`
- **API Docs**:
  - `/src/courseware/course/student-tools/README-API.md`
  - `/src/courseware/course/student-tools/MOOC-API-DOCUMENTATION.md`

## Future Improvements

1. **Caching**: Cache API response để giảm số lần gọi API
2. **Real-time updates**: WebSocket hoặc polling để cập nhật real-time
3. **Offline support**: Lưu dữ liệu vào localStorage
4. **Progress animation**: Animate numbers khi cập nhật
5. **Detailed breakdown**: Chi tiết theo từng folder/section

## API Documentation

Xem thêm chi tiết tại:
- [MOOC-API-DOCUMENTATION.md](./MOOC-API-DOCUMENTATION.md)
- [README-API.md](./README-API.md)
