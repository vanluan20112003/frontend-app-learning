# Notes Styling Guide - VideoProgressTool

## Overview
VideoProgressTool hiển thị 4 loại chú ý với màu sắc và mục đích khác nhau để hướng dẫn học sinh.

---

## 1. Info Note (Xanh dương) 💡

### Mục đích
Cung cấp thông tin, giải thích về điểm quá trình

### Styling
```scss
background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
border-left: 3px solid #3b82f6;
color: #1e40af;
```

### Nội dung
```
💡 Điểm quá trình bao gồm điểm tương tác video và bài tập trong khóa học
   (không bao gồm điểm thi)
```

### Visual
- Background: Xanh dương nhạt
- Border trái: Xanh dương đậm
- Text: Xanh navy

---

## 2. Warning Note (Vàng) ⚠️

### Mục đích
Cảnh báo, nhắc nhở hành động quan trọng

### Styling
```scss
background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
border-left: 3px solid #f59e0b;
color: #92400e;
```

### Nội dung

#### Warning #1: Nút ngôi sao
```
⭐ Quan trọng: Bấm vào nút ngôi sao ở cuối video để hoàn thành xem video
```

#### Warning #2: Nộp bài
```
📝 Bài tập: Nhớ bấm nút "Nộp bài" để kết quả được ghi nhận
```

### Visual
- Background: Vàng nhạt
- Border trái: Vàng cam
- Text: Nâu đậm
- **Strong text**: Nâu đen (#78350f)

---

## 3. Danger Note (Đỏ) 🚫

### Mục đích
Cảnh báo nghiêm trọng, hành động cần tránh

### Styling
```scss
background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
border-left: 3px solid #ef4444;
color: #991b1b;
```

### Nội dung
```
⚠️ Chú ý: Không sử dụng tab ẩn danh khi làm bài tập tương tác
```

### Visual
- Background: Đỏ nhạt
- Border trái: Đỏ tươi
- Text: Đỏ đậm
- **Strong text**: Đỏ đen (#7f1d1d)

---

## Layout Structure

### Full View
Notes được hiển thị theo thứ tự:
1. Info Note (Xanh - Giải thích)
2. Warning Note #1 (Vàng - Nút ngôi sao)
3. Warning Note #2 (Vàng - Nộp bài)
4. Danger Note (Đỏ - Tab ẩn danh)
5. Score Details (Dữ liệu số liệu)

### Compact View
Chỉ hiển thị số liệu, không hiển thị notes để tiết kiệm không gian.

---

## CSS Classes

```scss
.score-detail-item {
  &.info-note { /* Xanh dương */ }
  &.warning-note { /* Vàng */ }
  &.danger-note { /* Đỏ */ }
}
```

---

## Common Styling Properties

Tất cả notes đều có:
- `display: block`
- `padding: 0.75rem`
- `border-radius: 8px`
- `border-left: 3px solid [color]`
- `margin-bottom: 0.5rem`

### Detail Note Text
- `font-size: 0.8rem`
- `line-height: 1.5`
- `font-weight: 500`

### Strong Text (trong warning/danger)
- `font-weight: 700`

---

## Color Palette

### Info (Blue)
- Background: `#e0f2fe` → `#dbeafe`
- Border: `#3b82f6`
- Text: `#1e40af`

### Warning (Yellow/Amber)
- Background: `#fef3c7` → `#fde68a`
- Border: `#f59e0b`
- Text: `#92400e`
- Strong: `#78350f`

### Danger (Red)
- Background: `#fee2e2` → `#fecaca`
- Border: `#ef4444`
- Text: `#991b1b`
- Strong: `#7f1d1d`

---

## Usage Guidelines

### Khi nào dùng Info Note?
- Giải thích khái niệm
- Cung cấp context
- Thông tin bổ sung

### Khi nào dùng Warning Note?
- Hành động quan trọng cần nhớ
- Best practices
- Tips để đạt kết quả tốt

### Khi nào dùng Danger Note?
- Lỗi nghiêm trọng cần tránh
- Hành động có thể gây mất dữ liệu
- Cảnh báo bảo mật

---

## Icons Used

- 💡 - Info/Lightbulb
- ⭐ - Star/Important
- 📝 - Clipboard/Assignment
- ⚠️ - Warning Triangle

---

## Responsive Behavior

Notes tự động co giãn theo chiều rộng container:
- Desktop: Full width trong stat-card
- Mobile: Stack vertically, giữ padding

---

## Accessibility

- Semantic HTML với proper structure
- Color không phải cách duy nhất truyền đạt ý nghĩa (có icons + text)
- Contrast ratio đảm bảo WCAG AA standards
- Text size tối thiểu 0.8rem (12.8px @ 16px base)

---

**Version:** 1.0
**Last Updated:** 2025-01-23
