# MOOC API - Quick Start Guide

## 🚀 Giới thiệu
Hệ thống REST API để truy vấn dữ liệu học tập MOOC - H5P.

**Base URL:** `https://h5p.itp.vn/wp-json/mooc/v1`

## 📋 Các file quan trọng

1. **[MOOC-API-DOCUMENTATION.md](MOOC-API-DOCUMENTATION.md)** - Tài liệu API đầy đủ
2. **[test-api.html](test-api.html)** - Web UI để test API
3. **[/test-mooc-api.php](/test-mooc-api.php)** - Script PHP test tự động

## 🔧 Cấu trúc API Files

```
wp-content/themes/H5P-MANAGEMENT/
├── inc/api/
│   ├── mooc-scores.php              # API điểm số H5P
│   ├── mooc-folder-scores.php       # API tổng điểm folder
│   ├── video-progress.php           # API tiến độ xem video
│   ├── folder-video-progress.php    # API tiến độ video theo folder
│   └── user-dashboard.php           # API dashboard tổng hợp
├── functions.php                     # Đăng ký REST routes
├── MOOC-API-DOCUMENTATION.md        # Tài liệu đầy đủ
├── test-api.html                    # Test UI
└── README-API.md                    # File này
```

## 🎯 Quick Test

### Cách 1: Web UI
Mở trong browser:
```
https://h5p.itp.vn/wp-content/themes/H5P-MANAGEMENT/test-api.html
```

### Cách 2: PHP Script
Truy cập:
```
https://h5p.itp.vn/test-mooc-api.php
```

### Cách 3: cURL Command
```bash
# Lấy dashboard tổng quan
curl "https://h5p.itp.vn/wp-json/mooc/v1/dashboard/4/course-v1:DHQG-HCM+FM101+2025_S2"

# Lấy điểm số
curl "https://h5p.itp.vn/wp-json/mooc/v1/scores/4/course-v1:DHQG-HCM+FM101+2025_S2"

# Lấy tiến độ video
curl "https://h5p.itp.vn/wp-json/mooc/v1/video-progress/4/course-v1:DHQG-HCM+FM101+2025_S2"
```

### Cách 4: JavaScript
```javascript
fetch('https://h5p.itp.vn/wp-json/mooc/v1/dashboard/4/course-v1:DHQG-HCM+FM101+2025_S2')
  .then(res => res.json())
  .then(data => console.log(data));
```

## 📊 Các API Endpoints chính

### 1. Dashboard (Tổng hợp)
```
GET /dashboard/{user_id}/{course_id}
GET /dashboard/{user_id}/{course_id}/report
GET /dashboard/{user_id}/{course_id}/suggestions
GET /dashboard/{user_id}/{course_id}/timeline?days=7
```

### 2. Scores (Điểm số)
```
GET /scores/{user_id}/{course_id}
GET /scores/{user_id}/{course_id}/{content_id}
GET /scores/{user_id}/{course_id}/top?limit=10
GET /scores/{user_id}/{course_id}/incomplete
```

### 3. Folder Scores (Điểm theo folder)
```
GET /folder-scores/{user_id}/{course_id}
GET /folder-scores/{user_id}/{course_id}/{folder_id}
GET /folder-scores/{user_id}/{course_id}/stats
GET /folder-scores/{user_id}/{course_id}/incomplete
```

### 4. Video Progress (Tiến độ video)
```
GET /video-progress/{user_id}/{course_id}
GET /video-progress/{user_id}/{course_id}/{content_id}
GET /video-progress/{user_id}/{course_id}/recent?limit=10
GET /video-progress/{user_id}/{course_id}/incomplete
GET /video-progress/{user_id}/{course_id}/by-folder
```

### 5. Folder Video Progress (Tiến độ video theo folder)
```
GET /folder-video-progress/{user_id}/{course_id}
GET /folder-video-progress/{user_id}/{course_id}/{folder_id}
GET /folder-video-progress/{user_id}/{course_id}/stats
GET /folder-video-progress/{user_id}/{course_id}/compare
GET /folder-video-progress/{user_id}/{course_id}/incomplete
```

### 6. Combined Progress (Tổng hợp video + điểm) ⭐ MỚI
```
GET /combined-progress/{user_id}/{course_id}
GET /combined-progress/{user_id}/{course_id}/by-folder
GET /combined-progress/{user_id}/{course_id}/summary
```

**🎯 Khuyến nghị:** Sử dụng endpoint này để lấy tổng hợp cả video và điểm trong một lần gọi API thay vì gọi riêng lẻ.

## 💡 Lưu ý quan trọng

### Course ID Format
Course ID có thể chứa các ký tự đặc biệt:
- ✅ Hợp lệ: `course-abc`, `course_123`, `course-v1:DHQG-HCM+FM101+2025_S2`
- Pattern: `[a-zA-Z0-9_-:+]`

Nếu gặp lỗi 404, thử URL encode:
- `:` → `%3A`
- `+` → `%2B`

### Response Format
Tất cả API trả về JSON với cấu trúc:
```json
{
  "user_id": "4",
  "course_id": "course-v1:DHQG-HCM+FM101+2025_S2",
  "summary": { ... },
  "data": [ ... ]
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request (thiếu parameters)
- `404` - Not Found (không tìm thấy dữ liệu)
- `500` - Internal Server Error

## 🔒 Security

⚠️ **Hiện tại:** API đang ở chế độ public access (không cần authentication).

Để production, nên thêm authentication vào [functions.php](functions.php):
```php
'permission_callback' => function() {
    return current_user_can('read');
}
```

## 📖 Xem thêm

- **Full Documentation:** [MOOC-API-DOCUMENTATION.md](MOOC-API-DOCUMENTATION.md)
- **Interactive Tester:** [test-api.html](test-api.html)
- **WordPress REST API Handbook:** https://developer.wordpress.org/rest-api/

## 🐛 Troubleshooting

### Lỗi 404 - Route not found
- Kiểm tra course_id format (có thể cần URL encode)
- Flush rewrite rules: Vào WordPress Admin → Settings → Permalinks → Save Changes

### Lỗi 500 - Internal Error
- Kiểm tra PHP error log
- Kiểm tra database connection
- Verify các bảng database tồn tại

### Empty Response
- Kiểm tra user_id và course_id có tồn tại trong database
- Verify dữ liệu trong các bảng `wp_mooc_*`

## 📞 Support

Nếu cần hỗ trợ, vui lòng:
1. Kiểm tra [MOOC-API-DOCUMENTATION.md](MOOC-API-DOCUMENTATION.md)
2. Test với [test-api.html](test-api.html)
3. Xem PHP error logs
4. Liên hệ team dev

---

**Version:** 1.0
**Last Updated:** 2025-01-11
**Author:** Claude AI Assistant
