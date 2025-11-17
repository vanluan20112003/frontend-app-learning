# Course Feedback Feature

## Overview

This feature implements a feedback popup modal that appears when a learner reaches **85% or more** course completion. The popup allows users to provide a star rating (1-5) and optional text feedback about their course experience.

## Architecture

### Backend (edx-platform)

#### Location
`lms/djangoapps/user_course_feedback/`

#### Components

1. **models.py** - Database model for storing feedback
   - `UserCourseFeedback` model with fields:
     - `user` - ForeignKey to User
     - `course_id` - CourseKeyField
     - `rating` - Integer (1-5)
     - `feedback` - TextField (optional)
     - `created_at`, `updated_at` - Timestamps
   - Unique constraint on (user, course_id)

2. **serializers.py** - DRF serializers
   - `UserCourseFeedbackSerializer` - Handles validation and serialization
   - Validates course_id format and rating range
   - Implements update_or_create logic

3. **views.py** - API endpoints
   - `UserCourseFeedbackView` (POST) - Submit new feedback
   - `UserCourseFeedbackDetailView` (GET/PUT/PATCH/DELETE) - Manage feedback for a specific course
   - `UserCourseFeedbackListView` (GET) - List all user's feedback
   - `CourseFeedbackEligibilityView` (GET) - Check if user is eligible to provide feedback

4. **urls.py** - URL routing
   - `/api/user_course_feedback/v1/feedback/` - Submit/list feedback
   - `/api/user_course_feedback/v1/feedback/<course_id>/` - Manage specific course feedback
   - `/api/user_course_feedback/v1/eligibility/<course_id>/` - Check eligibility

5. **admin.py** - Django admin interface
   - Read-only admin interface for viewing feedback
   - Searchable by user, course, rating
   - Manual addition disabled (API-only)

#### API Integration

The eligibility check uses the existing `get_course_blocks_completion_summary` function from `lms/djangoapps/courseware/courses.py` which calculates:
- `complete_count` - Number of completed units
- `incomplete_count` - Number of incomplete units
- `locked_count` - Number of locked/gated units

**Completion percentage** = (complete_count / (complete_count + incomplete_count)) × 100

#### URL Registration

Added to `lms/urls.py`:
```python
path('api/user_course_feedback/v1/', include('lms.djangoapps.user_course_feedback.urls')),
```

### Frontend (frontend-app-learning)

#### Location
`src/course-feedback/`

#### Components

1. **CourseFeedbackModal.jsx** - Main modal component
   - Star rating interface (1-5 stars with hover effects)
   - Optional text feedback field (max 1000 characters)
   - Loading states and error handling
   - Success confirmation
   - Analytics tracking for all interactions
   - Accessible (ARIA labels, keyboard navigation)

2. **messages.js** - i18n message definitions
   - All user-facing text is internationalized
   - Includes labels, placeholders, error messages

3. **data/api.js** - API client functions
   - `checkFeedbackEligibility(courseId)` - Check if user should see popup
   - `submitCourseFeedback(courseId, rating, feedback)` - Submit feedback
   - `getCourseFeedback(courseId)` - Retrieve existing feedback
   - `updateCourseFeedback(courseId, rating, feedback)` - Update feedback
   - `deleteCourseFeedback(courseId)` - Delete feedback

4. **useCourseFeedback.js** - Custom React hook
   - Automatically checks eligibility on mount
   - Manages modal open/close state
   - Returns eligibility data and completion percentage
   - Prevents duplicate eligibility checks

5. **CourseFeedbackModal.scss** - Component styles
   - Consistent with Open edX design patterns
   - Responsive design (mobile-friendly)
   - Focus states for accessibility
   - Smooth transitions and hover effects

#### Integration

The modal is integrated into `src/courseware/course/Course.jsx`:
- Imported alongside other celebration modals
- Uses the `useCourseFeedback` hook to manage state
- Automatically appears when user reaches 85% completion
- Only shows once per course per user

## User Flow

1. **Progress Tracking**: The system continuously tracks course completion via the existing progress API
2. **Eligibility Check**: When a user accesses courseware, the frontend checks eligibility:
   - Completion >= 85%
   - User hasn't already submitted feedback for this course
3. **Popup Display**: If eligible, the modal appears automatically after a 1-second delay
4. **User Interaction**:
   - **Submit**: User rates (required) and optionally adds comments, then submits
   - **Skip**: User dismisses the modal without providing feedback
   - **Close**: User closes modal (treated as skip)
5. **Feedback Storage**: Submitted feedback is saved to the database
6. **No Re-prompting**: Once feedback is submitted, the user won't see the popup again for that course

## Analytics Events

All interactions are tracked using `sendTrackEvent`:

- `edx.ui.lms.course_feedback.submitted` - Feedback submitted successfully
  - Properties: course_id, rating, has_comment
- `edx.ui.lms.course_feedback.skipped` - User clicked "Skip"
  - Properties: course_id
- `edx.ui.lms.course_feedback.dismissed` - User closed modal
  - Properties: course_id
- `edx.ui.lms.course_feedback.error` - Submission error occurred
  - Properties: course_id, error

## API Endpoints

### Check Eligibility
```
GET /api/user_course_feedback/v1/eligibility/{course_id}/
```

**Response**:
```json
{
  "course_id": "course-v1:edX+DemoX+Demo_Course",
  "completion_percentage": 87.5,
  "is_eligible": true,
  "should_show_popup": true,
  "has_submitted_feedback": false,
  "complete_count": 35,
  "incomplete_count": 5,
  "total_count": 40
}
```

### Submit Feedback
```
POST /api/user_course_feedback/v1/feedback/
Content-Type: application/json

{
  "course_id": "course-v1:edX+DemoX+Demo_Course",
  "rating": 5,
  "feedback": "Great course! I learned a lot."
}
```

**Response**:
```json
{
  "id": 123,
  "user_id": 456,
  "username": "learner123",
  "course_id": "course-v1:edX+DemoX+Demo_Course",
  "rating": 5,
  "feedback": "Great course! I learned a lot.",
  "created_at": "2025-11-06T10:30:00Z",
  "updated_at": "2025-11-06T10:30:00Z"
}
```

### Get Feedback
```
GET /api/user_course_feedback/v1/feedback/{course_id}/
```

### Update Feedback
```
PATCH /api/user_course_feedback/v1/feedback/{course_id}/
Content-Type: application/json

{
  "rating": 4,
  "feedback": "Updated feedback text"
}
```

### Delete Feedback
```
DELETE /api/user_course_feedback/v1/feedback/{course_id}/
```

## Database Schema

**Table**: `user_course_feedback_usercoursefeedback`

| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key, Auto-increment |
| user_id | Integer | Foreign Key to auth_user, NOT NULL |
| course_id | Varchar(255) | NOT NULL, Indexed |
| rating | Integer | NOT NULL, CHECK (1 <= rating <= 5) |
| feedback | Text | Nullable |
| created_at | DateTime | NOT NULL, Auto-set |
| updated_at | DateTime | NOT NULL, Auto-update |

**Indexes**:
- Primary key on `id`
- Index on `course_id`
- Unique constraint on (`user_id`, `course_id`)

## Security & Permissions

- All endpoints require authentication (`IsAuthenticated` permission)
- Users can only submit/view/edit their own feedback
- Course enrollment validation - users must be enrolled to provide feedback
- CSRF protection enabled via Django/DRF defaults
- Rate limiting should be configured at the server level

## Accessibility Features

- Full keyboard navigation support
- ARIA labels on all interactive elements
- Screen reader friendly
- Focus indicators on all focusable elements
- Sufficient color contrast ratios
- Error messages are announced to screen readers

## Internationalization

- All user-facing strings use `react-intl`
- Message IDs follow the pattern: `courseFeedback.[descriptor]`
- Ready for translation into any supported language
- RTL (Right-to-Left) language support via Paragon

## Testing Considerations

### Backend Tests (Django)
- Model validation tests
- API endpoint tests (permissions, validation, CRUD operations)
- Eligibility calculation tests
- Edge cases (duplicate submissions, invalid course IDs)

### Frontend Tests (Jest/React Testing Library)
- Component rendering tests
- User interaction tests (rating selection, text input, submission)
- Hook behavior tests
- API integration tests (mocked)
- Accessibility tests (a11y)

## Future Enhancements

1. **Instructor Dashboard**: Add a page for instructors to view aggregated feedback
2. **Export Functionality**: Allow course teams to export feedback as CSV
3. **Response System**: Enable course teams to respond to feedback
4. **Sentiment Analysis**: Automatically analyze text feedback sentiment
5. **Configurable Threshold**: Allow per-course configuration of the 85% threshold
6. **Email Notifications**: Notify course teams of new feedback
7. **Feedback Categories**: Add predefined categories (content quality, difficulty, etc.)
8. **Anonymous Option**: Allow users to submit feedback anonymously

## Deployment Notes

### Backend Migration
```bash
# Run migrations to create the database table
python manage.py makemigrations user_course_feedback
python manage.py migrate user_course_feedback
```

### Frontend Build
The feature is automatically included in the frontend-app-learning build. No special configuration needed.

### Configuration
No additional configuration required. The feature works out-of-the-box.

## Troubleshooting

### Modal doesn't appear
- Check browser console for API errors
- Verify user has >= 85% completion
- Confirm user hasn't already submitted feedback
- Check that course enrollment is active

### Submission fails
- Verify LMS_BASE_URL is correctly configured
- Check authentication tokens
- Verify backend URL routing is correct
- Check Django logs for errors

### Progress calculation issues
- Ensure course has units that can be completed
- Verify completion tracking is working correctly
- Check for gated/locked content that might affect counts

## Support

For issues or questions, please:
1. Check the browser console for errors
2. Check Django server logs
3. Verify API endpoints are accessible
4. Test with a different course/user combination
