# Micro Unit API - Complete Documentation

Tài liệu đầy đủ về tất cả các API endpoints của Micro Unit app.

## 📑 Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Permissions](#permissions)
4. [API Endpoints](#api-endpoints)
   - [1. Course Units API](#1-course-units-api)
   - [2. Micro Units Management APIs](#2-micro-units-management-apis)
     - [2.1 List Micro Units](#21-list-micro-units)
     - [2.2 Get Micro Unit Detail](#22-get-micro-unit-detail)
     - [2.3 Create Micro Unit](#23-create-micro-unit)
     - [2.4 Update Micro Unit](#24-update-micro-unit)
     - [2.5 Delete Micro Unit](#25-delete-micro-unit)
   - [3. Micro Unit Blocks API](#3-micro-unit-blocks-api)
   - [4. Course-Micro Unit Relationship API](#4-course-micro-unit-relationship-api)
5. [Python SDK Examples](#python-sdk-examples)
6. [Error Responses](#error-responses)
7. [Rate Limiting](#rate-limiting)
8. [Changelog](#changelog)

---

## Base URL

```
/api/micro_unit/v1/
```

## Authentication

Tất cả các API đều hỗ trợ các phương thức xác thực sau:
- **JWT Authentication**: Header `Authorization: JWT <token>`
- **Bearer Token Authentication**: Header `Authorization: Bearer <token>`
- **Session Authentication**: Cookies (khi đã đăng nhập)

## Permissions

API sử dụng 2 mức độ phân quyền:

### Read Operations (GET)
- ✅ Tất cả authenticated users có thể đọc

### Write Operations (POST/PUT/PATCH/DELETE)
Chỉ những người sau có quyền tạo/sửa/xóa micro units:

- ✅ **Django Admin** (`is_staff=True`) - Toàn quyền
- ✅ **Course Staff** - Chỉ với courses mà họ quản lý
- ✅ **Course Instructor** - Chỉ với courses mà họ quản lý

**Chi tiết:** Xem [PERMISSIONS.md](PERMISSIONS.md) để hiểu đầy đủ về permission logic.

---

## API Endpoints

### Tổng Quan API Endpoints

App cung cấp **8 API endpoints** được nhóm thành 4 categories:

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/units/{course_id}` | Lấy tất cả units của course | Yes |
| 2 | GET | `/micro-units/` | List micro units (với filters) | Yes |
| 3 | GET | `/micro-units/{id}/` | Chi tiết micro unit | Yes |
| 4 | POST | `/micro-units/create/` | Tạo micro unit | Admin/Staff/Instructor |
| 5 | PUT/PATCH | `/micro-units/{id}/update/` | Cập nhật micro unit | Admin/Staff/Instructor |
| 6 | DELETE | `/micro-units/{id}/delete/` | Xóa micro unit | Admin/Staff/Instructor |
| 7 | GET | `/micro-units/{id}/blocks/` | Lấy blocks của micro unit | Yes |
| 8 | GET | `/courses/{course_id}/micro-units/` | Lấy micro units của course | Yes |

---

## 1. Course Units API

### GET /api/micro_unit/v1/units/{course_id}

Lấy danh sách tất cả các units (verticals) của một khóa học.

**Parameters:**
- `course_id` (path, required): Course ID (ví dụ: `course-v1:edX+DemoX+Demo_Course`)

**Response (200 OK):**
```json
{
  "course_id": "course-v1:edX+DemoX+Demo_Course",
  "total_units": 15,
  "units": [
    {
      "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_1",
      "display_name": "Introduction",
      "type": "vertical",
      "lms_web_url": "https://lms.example.com/courses/.../jump_to/...",
      "graded": false,
      "format": "",
      "due": null,
      "has_score": false,
      "complete": true
    }
  ]
}
```

**Example:**
```bash
curl -X GET "https://lms.example.com/api/micro_unit/v1/units/course-v1:edX+DemoX+Demo_Course" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. Micro Units Management APIs

### 2.1. List Micro Units

**GET /api/micro_unit/v1/micro-units/**

Lấy danh sách tất cả micro units với khả năng filter.

**Query Parameters:**
- `difficulty` (optional): Filter theo mức độ khó (`easy`, `medium`, `hard`)
- `is_active` (optional): Filter theo trạng thái (`true`, `false`)
- `search` (optional): Tìm kiếm trong title và description

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Introduction to Python",
    "description": "Learn Python basics",
    "thumbnail": "https://lms.example.com/media/micro_units/2025/01/python.jpg",
    "estimated_duration": 30,
    "difficulty_level": "easy",
    "order": 1,
    "is_active": true,
    "total_blocks": 5,
    "total_courses": 2,
    "created_by": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    },
    "updated_by": {
      "id": 2,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-20T14:30:00Z"
  }
]
```

**Examples:**
```bash
# Lấy tất cả micro units
curl -X GET "https://lms.example.com/api/micro_unit/v1/micro-units/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter theo difficulty
curl -X GET "https://lms.example.com/api/micro_unit/v1/micro-units/?difficulty=easy" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tìm kiếm
curl -X GET "https://lms.example.com/api/micro_unit/v1/micro-units/?search=python" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Chỉ lấy active micro units
curl -X GET "https://lms.example.com/api/micro_unit/v1/micro-units/?is_active=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.2. Get Micro Unit Detail

**GET /api/micro_unit/v1/micro-units/{id}/**

Lấy thông tin chi tiết của một micro unit, bao gồm blocks và courses.

**Parameters:**
- `id` (path, required): Micro Unit ID

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "description": "Learn Python basics",
  "thumbnail": "https://lms.example.com/media/micro_units/2025/01/python.jpg",
  "estimated_duration": 30,
  "difficulty_level": "easy",
  "order": 1,
  "is_active": true,
  "total_blocks": 5,
  "total_courses": 2,
  "blocks": [
    {
      "id": 1,
      "block_usage_key": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit1",
      "display_name": "Variables and Data Types",
      "lms_web_url": "https://lms.example.com/courses/.../jump_to/...",
      "order_in_micro_unit": 0,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "courses": [
    {
      "id": 1,
      "course_id": "course-v1:edX+Python101+2025",
      "order_in_course": 0,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "created_by": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  },
  "updated_by": {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-20T14:30:00Z"
}
```

**Example:**
```bash
curl -X GET "https://lms.example.com/api/micro_unit/v1/micro-units/1/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.3. Create Micro Unit

**POST /api/micro_unit/v1/micro-units/create/**

Tạo một micro unit mới kèm blocks và courses.

**⚠️ Permissions Required:** Admin / Course Staff / Course Instructor

**Permission Logic:**
- User phải là Admin, HOẶC
- User phải là Staff/Instructor của ít nhất 1 course trong request body

**Thumbnail Options:**
- **Option 1:** Send `thumbnail_url` (string) - Direct URL to image
- **Option 2:** Upload `thumbnail` (file) - Binary file upload via multipart/form-data
- **Priority:** If both provided, `thumbnail` (file) takes priority
- **Response:** `thumbnail_display` field shows the final URL to use

**Request Body (Option 1 - JSON with thumbnail URL):**
```json
{
  "title": "Introduction to Python",
  "description": "Learn Python basics",
  "thumbnail_url": "https://example.com/images/python-thumbnail.jpg",
  "estimated_duration": 30,
  "difficulty_level": "easy",
  "order": 1,
  "is_active": true,
  "blocks": [
    {
      "block_usage_key": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit1",
      "display_name": "Variables and Data Types",
      "lms_web_url": "https://lms.example.com/courses/.../jump_to/...",
      "order_in_micro_unit": 0
    },
    {
      "block_usage_key": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit2",
      "display_name": "Control Flow",
      "lms_web_url": "https://lms.example.com/courses/.../jump_to/...",
      "order_in_micro_unit": 1
    }
  ],
  "courses": [
    {
      "course_id": "course-v1:edX+Python101+2025",
      "order_in_course": 0
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "description": "Learn Python basics",
  "thumbnail": null,
  "thumbnail_url": "https://example.com/python.jpg",
  "thumbnail_display": "https://example.com/python.jpg",
  "estimated_duration": 30,
  "difficulty_level": "easy",
  "order": 1,
  "is_active": true,
  "created_by": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  },
  "updated_by": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  },
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z",
  "blocks": [...],
  "courses": [...]
}
```

**Note:**
- `thumbnail`: Path to uploaded file (if file was uploaded)
- `thumbnail_url`: Direct URL string (if URL was provided)
- `thumbnail_display`: Final URL to display (auto-selects from thumbnail or thumbnail_url)

**Request Body (Option 2 - Multipart form-data with file upload):**
```bash
# Upload thumbnail as file
Content-Type: multipart/form-data

title: "Introduction to Python"
description: "Learn Python basics"
thumbnail: [binary file data]
estimated_duration: 30
difficulty_level: "easy"
order: 1
is_active: true
blocks: '[{"block_usage_key": "...", "display_name": "...", "order_in_micro_unit": 0}]'
courses: '[{"course_id": "...", "order_in_course": 0}]'
```

**Example 1: Create with thumbnail URL (JSON):**
```bash
curl -X POST "https://lms.example.com/api/micro_unit/v1/micro-units/create/" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Python",
    "description": "Learn Python basics",
    "thumbnail_url": "https://example.com/python.jpg",
    "estimated_duration": 30,
    "difficulty_level": "easy",
    "order": 1,
    "blocks": [
      {
        "block_usage_key": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit1",
        "display_name": "Unit 1",
        "lms_web_url": "https://lms.example.com/...",
        "order_in_micro_unit": 0
      }
    ],
    "courses": [
      {
        "course_id": "course-v1:edX+Python101+2025",
        "order_in_course": 0
      }
    ]
  }'
```

**Example 2: Create with file upload (Multipart):**
```bash
curl -X POST "https://lms.example.com/api/micro_unit/v1/micro-units/create/" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Introduction to Python" \
  -F "description=Learn Python basics" \
  -F "thumbnail=@/path/to/image.jpg" \
  -F "estimated_duration=30" \
  -F "difficulty_level=easy" \
  -F "order=1" \
  -F 'blocks=[{"block_usage_key":"block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit1","display_name":"Unit 1","lms_web_url":"https://...","order_in_micro_unit":0}]' \
  -F 'courses=[{"course_id":"course-v1:edX+Python101+2025","order_in_course":0}]'
```

---

### 2.4. Update Micro Unit

**PUT /api/micro_unit/v1/micro-units/{id}/update/**
**PATCH /api/micro_unit/v1/micro-units/{id}/update/**

Cập nhật thông tin micro unit.

**⚠️ Permissions Required:** Admin / Course Staff / Course Instructor

**Permission Logic:**
- User phải là Admin, HOẶC
- User phải là Staff/Instructor của ít nhất 1 course liên kết với micro unit này

**Parameters:**
- `id` (path, required): Micro Unit ID

**Request Body (PUT - full update):**
```json
{
  "title": "Advanced Python",
  "description": "Learn advanced Python concepts",
  "estimated_duration": 60,
  "difficulty_level": "hard",
  "order": 2,
  "is_active": true,
  "blocks": [
    {
      "block_usage_key": "block-v1:...",
      "display_name": "Decorators",
      "lms_web_url": "https://...",
      "order_in_micro_unit": 0
    }
  ],
  "courses": [
    {
      "course_id": "course-v1:edX+Python201+2025",
      "order_in_course": 0
    }
  ]
}
```

**Request Body (PATCH - partial update):**
```json
{
  "title": "Advanced Python Programming",
  "difficulty_level": "hard"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Advanced Python Programming",
  ...
}
```

**Examples:**
```bash
# Full update (PUT)
curl -X PUT "https://lms.example.com/api/micro_unit/v1/micro-units/1/update/" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Partial update (PATCH)
curl -X PATCH "https://lms.example.com/api/micro_unit/v1/micro-units/1/update/" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title", "difficulty_level": "medium"}'
```

---

### 2.5. Delete Micro Unit

**DELETE /api/micro_unit/v1/micro-units/{id}/delete/**

Xóa một micro unit.

**⚠️ Requires Admin Permission**

**Parameters:**
- `id` (path, required): Micro Unit ID

**Response (204 No Content)**

**Example:**
```bash
curl -X DELETE "https://lms.example.com/api/micro_unit/v1/micro-units/1/delete/" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 2.6. Get Micro Unit Blocks

**GET /api/micro_unit/v1/micro-units/{id}/blocks/**

Lấy danh sách tất cả các blocks/units của một micro unit.

**Parameters:**
- `id` (path, required): Micro Unit ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "block_usage_key": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit1",
    "display_name": "Variables and Data Types",
    "lms_web_url": "https://lms.example.com/courses/.../jump_to/...",
    "order_in_micro_unit": 0,
    "created_at": "2025-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "block_usage_key": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit2",
    "display_name": "Control Flow",
    "lms_web_url": "https://lms.example.com/courses/.../jump_to/...",
    "order_in_micro_unit": 1,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET "https://lms.example.com/api/micro_unit/v1/micro-units/1/blocks/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Course-Micro Unit Relationship API

### GET /api/micro_unit/v1/courses/{course_id}/micro-units/

Lấy tất cả micro units của một course cụ thể (bao gồm cả inactive micro units).

**Parameters:**
- `course_id` (path, required): Course ID

**Note:** API này trả về **tất cả** micro units của course, bao gồm:
- Active micro units (`is_active=true`)
- Inactive micro units (`is_active=false`)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Introduction to Python",
    "description": "Learn Python basics",
    "thumbnail": "https://...",
    "estimated_duration": 30,
    "difficulty_level": "easy",
    "order": 1,
    "is_active": true,
    "total_blocks": 5,
    "total_courses": 2,
    "blocks": [...],
    "courses": [...],
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET "https://lms.example.com/api/micro_unit/v1/courses/course-v1:edX+Python101+2025/micro-units/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. Course-Micro Unit Relationship API

### GET /api/micro_unit/v1/courses/{course_id}/micro-units/

Lấy tất cả micro units của một course cụ thể.

**Parameters:**
- `course_id` (path, required): Course ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Introduction to Python",
    "description": "Learn Python basics",
    "thumbnail": "https://...",
    "estimated_duration": 30,
    "difficulty_level": "easy",
    "order": 1,
    "is_active": true,
    "total_blocks": 5,
    "total_courses": 2,
    "blocks": [...],
    "courses": [...],
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET "https://lms.example.com/api/micro_unit/v1/courses/course-v1:edX+Python101+2025/micro-units/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Python SDK Examples

### Installation
```python
pip install requests
```

### Basic Usage

```python
import requests

class MicroUnitAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def get_course_units(self, course_id):
        """Get all units from a course"""
        url = f'{self.base_url}/api/micro_unit/v1/units/{course_id}'
        response = requests.get(url, headers=self.headers)
        return response.json()

    def list_micro_units(self, difficulty=None, is_active=None, search=None):
        """List all micro units with filters"""
        url = f'{self.base_url}/api/micro_unit/v1/micro-units/'
        params = {}
        if difficulty:
            params['difficulty'] = difficulty
        if is_active is not None:
            params['is_active'] = str(is_active).lower()
        if search:
            params['search'] = search

        response = requests.get(url, headers=self.headers, params=params)
        return response.json()

    def get_micro_unit(self, micro_unit_id):
        """Get micro unit detail"""
        url = f'{self.base_url}/api/micro_unit/v1/micro-units/{micro_unit_id}/'
        response = requests.get(url, headers=self.headers)
        return response.json()

    def create_micro_unit(self, data):
        """Create a new micro unit"""
        url = f'{self.base_url}/api/micro_unit/v1/micro-units/create/'
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()

    def update_micro_unit(self, micro_unit_id, data, partial=False):
        """Update a micro unit"""
        url = f'{self.base_url}/api/micro_unit/v1/micro-units/{micro_unit_id}/update/'
        method = requests.patch if partial else requests.put
        response = method(url, headers=self.headers, json=data)
        return response.json()

    def delete_micro_unit(self, micro_unit_id):
        """Delete a micro unit"""
        url = f'{self.base_url}/api/micro_unit/v1/micro-units/{micro_unit_id}/delete/'
        response = requests.delete(url, headers=self.headers)
        return response.status_code == 204

    def get_course_micro_units(self, course_id):
        """Get all micro units for a course"""
        url = f'{self.base_url}/api/micro_unit/v1/courses/{course_id}/micro-units/'
        response = requests.get(url, headers=self.headers)
        return response.json()

    def get_micro_unit_blocks(self, micro_unit_id):
        """Get all blocks/units for a micro unit"""
        url = f'{self.base_url}/api/micro_unit/v1/micro-units/{micro_unit_id}/blocks/'
        response = requests.get(url, headers=self.headers)
        return response.json()

# Usage
api = MicroUnitAPI('https://lms.example.com', 'your-token-here')

# Get all units from a course
units = api.get_course_units('course-v1:edX+DemoX+Demo_Course')
print(f"Total units: {units['total_units']}")

# List micro units
micro_units = api.list_micro_units(difficulty='easy', is_active=True)
for mu in micro_units:
    print(f"- {mu['title']} ({mu['difficulty_level']})")

# Get micro unit detail
detail = api.get_micro_unit(1)
print(f"Micro Unit: {detail['title']}")
print(f"Blocks: {len(detail['blocks'])}")

# Create new micro unit
new_micro_unit = api.create_micro_unit({
    'title': 'Django Basics',
    'description': 'Learn Django framework',
    'estimated_duration': 45,
    'difficulty_level': 'medium',
    'order': 1,
    'blocks': [
        {
            'block_usage_key': 'block-v1:...',
            'display_name': 'Django Models',
            'lms_web_url': 'https://...',
            'order_in_micro_unit': 0
        }
    ],
    'courses': [
        {
            'course_id': 'course-v1:edX+Django101+2025',
            'order_in_course': 0
        }
    ]
})
print(f"Created: {new_micro_unit['id']}")

# Update micro unit
updated = api.update_micro_unit(1, {'title': 'New Title'}, partial=True)
print(f"Updated: {updated['title']}")

# Get micro units by course
course_mus = api.get_course_micro_units('course-v1:edX+Python101+2025')
print(f"Course has {len(course_mus)} micro units")

# Get blocks of a micro unit
blocks = api.get_micro_unit_blocks(1)
print(f"Micro unit has {len(blocks)} blocks")
for block in blocks:
    print(f"  {block['order_in_micro_unit']}. {block['display_name']}")
```

---

## Error Responses

Tất cả các API có thể trả về các error codes sau:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "title": ["This field is required"],
    "estimated_duration": ["Ensure this value is greater than 0"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## Rate Limiting

Hiện tại chưa có rate limiting. Trong production, nên implement rate limiting cho các API.

---

## Changelog

### Version 1.1 (2025-10-25)
- **[NEW]** Added MicroUnit Blocks API endpoint: `GET /api/micro_unit/v1/micro-units/{id}/blocks/`
- **[CHANGED]** Updated permissions for Create/Update/Delete operations
  - Previously: Only Django Admin
  - Now: Admin + Course Staff + Course Instructor
- **[UPDATED]** All write operations now check course-level permissions
- **[ADDED]** Custom permission class: `IsAdminOrCourseStaffInstructor`
- **[DOCS]** Added comprehensive PERMISSIONS.md guide

### Version 1.0 (2025-01-15)
- Initial release
- Course units API
- Micro units CRUD APIs
- Course-MicroUnit relationship API
