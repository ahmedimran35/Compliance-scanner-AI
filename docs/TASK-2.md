# Task 2: Project Management System

## Overview
This task implements a complete project management system that allows users to create projects and add URLs for compliance scanning, with tier-based restrictions enforced in the backend.

## Database Schema

### Project Model
```typescript
interface IProject {
  _id: ObjectId;
  name: string;           // Required, max 100 chars
  ownerId: string;        // Clerk user ID
  description?: string;   // Optional, max 500 chars
  createdAt: Date;
  updatedAt: Date;
}
```

### URL Model
```typescript
interface IURL {
  _id: ObjectId;
  projectId: ObjectId;    // Reference to Project
  url: string;            // Required, validated URL format
  name?: string;          // Optional, max 100 chars
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  lastScanned?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Routes

### Projects

#### GET /api/projects
- **Description**: Get all projects for authenticated user
- **Authentication**: Required
- **Response**: Array of projects with URL counts
- **Example Response**:
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "My Website",
    "description": "Main company website",
    "ownerId": "user_2abc123def456",
    "urlCount": 3,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /api/projects/:projectId
- **Description**: Get specific project with its URLs
- **Authentication**: Required
- **Response**: Project object with URLs array
- **Example Response**:
```json
{
  "project": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "My Website",
    "description": "Main company website",
    "ownerId": "user_2abc123def456",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "urls": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "projectId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "url": "https://example.com",
      "name": "Homepage",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/projects
- **Description**: Create a new project
- **Authentication**: Required
- **Body**:
```json
{
  "name": "Project Name",
  "description": "Optional description"
}
```
- **Tier Enforcement**: 
  - Free: Max 1 project
  - Pro: Unlimited projects
- **Response**: Created project object

#### PUT /api/projects/:projectId
- **Description**: Update project details
- **Authentication**: Required
- **Body**: Same as POST
- **Response**: Updated project object

#### DELETE /api/projects/:projectId
- **Description**: Delete project and all associated URLs
- **Authentication**: Required
- **Response**: Success message

### URLs

#### POST /api/projects/:projectId/urls
- **Description**: Add URL to project
- **Authentication**: Required
- **Body**:
```json
{
  "url": "https://example.com",
  "name": "Optional URL name"
}
```
- **Tier Enforcement**:
  - Free: Max 5 URLs per project
  - Pro: Unlimited URLs
- **Response**: Created URL object

#### PUT /api/projects/:projectId/urls/:urlId
- **Description**: Update URL details
- **Authentication**: Required
- **Body**: Same as POST
- **Response**: Updated URL object

#### DELETE /api/projects/:projectId/urls/:urlId
- **Description**: Delete URL from project
- **Authentication**: Required
- **Response**: Success message

## Tier Enforcement Logic

### Project Limits
```typescript
// Free tier: 1 project max
if (user.tier === 'free' && projectCount >= user.maxProjects) {
  return res.status(403).json({ 
    error: 'Project limit reached',
    message: `Free tier allows maximum ${user.maxProjects} project(s). Upgrade to Pro for unlimited projects.`,
    currentCount: projectCount,
    maxAllowed: user.maxProjects
  });
}
```

### URL Limits
```typescript
// Free tier: 5 URLs per project max
if (user.tier === 'free' && urlCount >= 5) {
  return res.status(403).json({ 
    error: 'URL limit reached',
    message: 'Free tier allows maximum 5 URLs per project. Upgrade to Pro for unlimited URLs.',
    currentCount: urlCount,
    maxAllowed: 5
  });
}
```

## Frontend Components

### Pages
- `/projects` - Main projects listing page
- `/projects/[id]` - Individual project detail page (future implementation)

### Components
- `CreateProjectModal` - Modal for creating new projects
- `EditProjectModal` - Modal for editing project details
- `DeleteProjectModal` - Modal for confirming project deletion

### Features
- **Responsive Design**: Works on all screen sizes
- **Real-time Updates**: Projects list updates immediately after CRUD operations
- **Error Handling**: Comprehensive error messages and validation
- **Loading States**: Smooth loading indicators
- **Tier Restrictions**: UI shows appropriate messages for tier limits

## Security Features

### Authentication
- All routes require valid JWT token from Clerk
- User can only access their own projects
- Project ownership verified on every operation

### Validation
- URL format validation using built-in URL constructor
- Input sanitization and length limits
- Duplicate URL prevention within projects

### Data Integrity
- Cascading deletes (delete project → delete all URLs)
- Proper indexing for performance
- Transaction-like operations where needed

## Error Handling

### Common Error Responses
```json
{
  "error": "Project limit reached",
  "message": "Free tier allows maximum 1 project(s). Upgrade to Pro for unlimited projects.",
  "currentCount": 1,
  "maxAllowed": 1
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (tier limits exceeded)
- `404` - Not Found
- `500` - Internal Server Error

## Usage Examples

### Creating a Project
```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Website',
    description: 'Main company website for compliance scanning'
  })
});
```

### Adding a URL
```javascript
const response = await fetch(`/api/projects/${projectId}/urls`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    name: 'Homepage'
  })
});
```

## Future Enhancements

1. **Project Detail Page**: Individual project view with URL management
2. **Bulk URL Import**: CSV/JSON import functionality
3. **URL Validation**: Real-time URL accessibility checking
4. **Project Templates**: Pre-configured project templates
5. **Advanced Filtering**: Search and filter projects/URLs
6. **Export Functionality**: Export project data
7. **Collaboration**: Team member access to projects
8. **Scan Scheduling**: Automated scanning schedules
9. **Scan History**: Historical scan results
10. **Compliance Reports**: Detailed compliance analysis reports

## Testing

### Backend Testing
- Unit tests for models and validation
- Integration tests for API routes
- Authentication and authorization tests
- Tier limit enforcement tests

### Frontend Testing
- Component unit tests
- Integration tests for CRUD operations
- Error handling tests
- Responsive design tests

## Deployment Considerations

1. **Database Indexing**: Ensure proper indexes for performance
2. **Rate Limiting**: Implement API rate limiting
3. **Caching**: Cache frequently accessed project data
4. **Monitoring**: Monitor API performance and errors
5. **Backup**: Regular database backups
6. **Security**: Regular security audits 