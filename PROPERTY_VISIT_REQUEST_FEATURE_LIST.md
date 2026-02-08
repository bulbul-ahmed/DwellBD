# Property Visit Request Feature - Complete Requirements List

## 📋 Feature Overview

**Goal**: Enable tenants to request property visits and allow owners to confirm visit dates. Both can see confirmed visit schedules.

**Status**: Planning Phase

---

## 🎯 User Stories

### Tenant (Renter) Flow
- [x] View "Request Visit" button on property detail page
- [x] Open visit request modal with date/time picker
- [x] See list of all visit requests they've made
- [x] See status of each request (PENDING, CONFIRMED, REJECTED)
- [x] See confirmed visit date and time after owner confirms
- [x] Add optional note/message in visit request
- [x] Cancel pending visit request
- [x] View upcoming confirmed visits in calendar/list view

### Owner (Property Manager) Flow
- [x] See "Incoming Requests" dashboard or tab
- [x] View all visit requests for their properties
- [x] See tenant details (name, phone, email)
- [x] Accept request and set confirmed date/time
- [x] Reject request with optional reason
- [x] Suggest alternative date if preferred
- [x] See all upcoming confirmed visits
- [x] Cancel confirmed visit (with notification to tenant)

### Both Users
- [x] View confirmed visit dates clearly
- [x] Get notifications when status changes
- [x] See visitor/owner information
- [x] Track visit history

---

## 🗄️ Database Schema Required

### PropertyVisit Table
```
Fields:
- id (String, @id, @default(cuid()))
- propertyId (String, FK to Property)
- tenantId (String, FK to User - the one requesting)
- ownerId (String, FK to User - property owner)
- requestedDate (DateTime - initial date requested by tenant)
- confirmedDate (DateTime? - final date confirmed by owner)
- status (Enum: PENDING, CONFIRMED, REJECTED, CANCELLED)
- rejectionReason (String? - if owner rejects)
- tenantNote (String? - optional message from tenant)
- ownerNote (String? - optional response from owner)
- startTime (String? - HH:mm format)
- endTime (String? - HH:mm format)
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
-
Relations:
- property (Property)
- tenant (User)
- owner (User)

Unique Constraint:
- propertyId + tenantId + requestedDate (optional - allow multiple if different dates)
```

### VisitStatus Enum
```
PENDING - Awaiting owner response
CONFIRMED - Owner approved, date set
REJECTED - Owner declined
CANCELLED - Tenant cancelled before confirmation
COMPLETED - Visit happened (after date passes)
```

---

## 🔧 Backend Requirements

### API Endpoints Needed

#### 1. Create Visit Request
```
POST /api/property-visits
Auth: Required (Tenant)
Body: {
  propertyId: string,
  requestedDate: DateTime,
  startTime?: string (HH:mm),
  endTime?: string (HH:mm),
  tenantNote?: string
}
Response: PropertyVisit object with status PENDING
Validation:
- Tenant cannot request visit for own property
- requestedDate must be in future
- Max 30 days from now (optional limit)
```

#### 2. Get Visit Requests for Owner
```
GET /api/property-visits/owner/incoming
Auth: Required (Owner)
Query: propertyId? (filter by property)
Response: [PropertyVisit] - all PENDING requests for owner's properties
```

#### 3. Get Visit Requests for Tenant
```
GET /api/property-visits/tenant
Auth: Required (Tenant)
Query: status? (filter by status)
Response: [PropertyVisit] - all requests made by this tenant
```

#### 4. Get Visit Details
```
GET /api/property-visits/:visitId
Auth: Required
Response: PropertyVisit with full details
Authorization: Only tenant, owner, or admin can view
```

#### 5. Confirm Visit (Owner Action)
```
PATCH /api/property-visits/:visitId/confirm
Auth: Required (Owner)
Body: {
  confirmedDate: DateTime,
  startTime?: string,
  endTime?: string,
  ownerNote?: string
}
Response: PropertyVisit with status CONFIRMED, confirmedDate set
Validation:
- Can only confirm own visits as owner
- Confirmed date must be within reasonable range of requested
```

#### 6. Reject Visit Request
```
PATCH /api/property-visits/:visitId/reject
Auth: Required (Owner)
Body: {
  rejectionReason?: string
}
Response: PropertyVisit with status REJECTED
```

#### 7. Suggest Alternative Date
```
PATCH /api/property-visits/:visitId/suggest-alternative
Auth: Required (Owner)
Body: {
  suggestedDate: DateTime,
  startTime?: string,
  endTime?: string
}
Response: PropertyVisit with status PENDING, suggestedDate set
Note: Tenant can then confirm or request another date
```

#### 8. Cancel Visit Request
```
DELETE /api/property-visits/:visitId
Auth: Required (Tenant for PENDING, either for CONFIRMED with notice)
Response: 204 No Content
Note: If CONFIRMED, send notification to owner
```

#### 9. Get Upcoming Visits Calendar
```
GET /api/property-visits/calendar
Auth: Required
Query: startDate, endDate
Response: [PropertyVisit] - all confirmed visits in date range
For Tenant: their confirmed visits
For Owner: all confirmed visits for their properties
```

#### 10. Get Visit History
```
GET /api/property-visits/history
Auth: Required
Query: limit?, offset?
Response: [PropertyVisit] - completed or cancelled visits
```

---

## 💻 Frontend Components Required

### New Pages/Components

#### 1. **PropertyVisitModal.tsx**
**Purpose**: Modal for tenant to request property visit
**Location**: `/frontend/src/components/PropertyVisitModal.tsx`
**Features**:
- [x] Date picker (minimum date = tomorrow, max = 30 days ahead)
- [x] Time picker (business hours 9 AM - 6 PM, 30-min intervals)
- [x] Optional note textarea (max 200 chars)
- [x] Submit button with loading state
- [x] Validation: date selected, no past dates
- [x] Toast notifications (success/error)
- [x] Display property name and owner info
- [x] Show current pending requests count

#### 2. **VisitRequestsList.tsx**
**Purpose**: Display tenant's visit requests
**Location**: `/frontend/src/components/VisitRequestsList.tsx`
**Features**:
- [x] Tabs: PENDING, CONFIRMED, REJECTED, CANCELLED
- [x] Cards showing:
  - Property image, title, area
  - Requested date & time
  - Owner name (if confirmed)
  - Status badge with color coding
  - Confirmed date (if applicable)
  - Action buttons (cancel if pending, view details)
- [x] Empty state message
- [x] Filter/sort options

#### 3. **OwnerVisitRequests.tsx**
**Purpose**: Dashboard for owner to manage visit requests
**Location**: `/frontend/src/components/OwnerVisitRequests.tsx`
**Features**:
- [x] Tabs: PENDING, CONFIRMED, HISTORY
- [x] Cards for each request showing:
  - Property image, title
  - Tenant name, phone, email
  - Requested date
  - Tenant note (if provided)
- [x] Action buttons:
  - Confirm (opens date picker to set final date/time)
  - Reject (opens reason input)
  - Suggest alternative (date picker)
- [x] Confirmation modal before actions
- [x] Notification messages

#### 4. **VisitRequestDetail.tsx**
**Purpose**: Detailed view of single visit request
**Location**: `/frontend/src/components/VisitRequestDetail.tsx`
**Features**:
- [x] Full visit information
- [x] Property details with image
- [x] Tenant/Owner contact info
- [x] All messages/notes
- [x] Status timeline (requested → confirmed → completed)
- [x] Action buttons context-aware
- [x] Map location (if available)

#### 5. **UpcomingVisits.tsx**
**Purpose**: Calendar/list of upcoming confirmed visits
**Location**: `/frontend/src/components/UpcomingVisits.tsx`
**Features**:
- [x] Calendar view (month/week)
- [x] List view (chronological)
- [x] Toggle between views
- [x] Show:
  - Date & time
  - Property/Tenant name
  - Owner/Visitor contact info
- [x] Color coding by property
- [x] Click to see details
- [x] "Mark as completed" button (for owner)

#### 6. **VisitRequestButton.tsx**
**Purpose**: Button component on property detail page
**Location**: `/frontend/src/components/VisitRequestButton.tsx`
**Features**:
- [x] Shows "Request Visit" if user is tenant
- [x] Shows "View Requests" if user is owner
- [x] Shows "Pending" with count if already requested
- [x] Disabled if user is property owner
- [x] Opens appropriate modal/page on click
- [x] Loading state while checking status

---

## 📱 Page Integrations

### PropertyDetailPage.tsx
**Changes**:
- [x] Add VisitRequestButton component
- [x] Add PropertyVisitModal for visit requests
- [x] Show confirmed visit date if exists (prominent display)
- [x] Show pending request status badge
- [x] Show request count for owners

### New Pages

#### `/tenant/visits` - Tenant Visits Dashboard
**Components**: VisitRequestsList + UpcomingVisits
**Features**:
- [x] All visit requests at a glance
- [x] Upcoming confirmed visits
- [x] Request management

#### `/owner/visit-requests` - Owner Visit Management
**Components**: OwnerVisitRequests + UpcomingVisits
**Features**:
- [x] Incoming requests to manage
- [x] Upcoming scheduled visits
- [x] Visit history

---

## 📊 API Service Functions Required

### `/frontend/src/api/visitApi.ts`

Functions needed:
```typescript
// Create & Manage Requests
requestPropertyVisit(propertyId, requestedDate, startTime?, endTime?, note?)
cancelVisitRequest(visitId)
getMyVisitRequests(status?)

// Owner Actions
getIncomingVisitRequests(propertyId?)
confirmVisit(visitId, confirmedDate, startTime?, endTime?, note?)
rejectVisit(visitId, reason?)
suggestAlternativeDate(visitId, suggestedDate, startTime?, endTime?)

// Views
getVisitDetails(visitId)
getUpcomingVisits(startDate?, endDate?)
getVisitHistory(limit?, offset?)
```

---

## 🔔 Notifications Required

### Toast Notifications (Frontend)
- [x] "Visit request sent successfully"
- [x] "Visit request cancelled"
- [x] "Visit confirmed by owner"
- [x] "Visit request rejected"
- [x] "Alternative date suggested by owner"
- [x] "Error sending request"

### Email Notifications (Backend - Phase 2)
- [x] Owner: "New visit request received"
- [x] Tenant: "Your visit request was confirmed"
- [x] Tenant: "Your visit request was rejected"
- [x] Tenant: "Owner suggested alternative date"

### In-App Notifications (Phase 2)
- [x] Badge on navigation for new requests
- [x] Notification center showing visit events

---

## 🔐 Security & Validation

### Authorization Checks
- [x] Tenant can only request visits for properties they don't own
- [x] Tenant can only view/cancel their own requests
- [x] Owner can only see/manage requests for their properties
- [x] Only authenticated users can make requests
- [x] Admin can view/manage all visits

### Input Validation
- [x] Date must be in future (not past)
- [x] Date should be within 30 days (configurable)
- [x] Time must be within business hours (9 AM - 6 PM)
- [x] Note: max 200 chars for tenant, 300 for owner
- [x] No duplicate pending requests for same property by tenant

### Rate Limiting
- [x] Max 5 visit requests per day per tenant
- [x] Max 3 requests for same property per tenant (configurable)
- [x] Apply to POST/PATCH endpoints

---

## 🧪 Testing Scenarios

### Tenant Testing
- [x] Request visit with valid date
- [x] Request visit with past date (should fail)
- [x] Cancel pending request
- [x] View confirmed visit details
- [x] Cannot request own property
- [x] See owner's confirmation message

### Owner Testing
- [x] See incoming request
- [x] Confirm with date change
- [x] Reject with reason
- [x] Suggest alternative date
- [x] See upcoming visits calendar
- [x] Mark visit as completed

### Edge Cases
- [x] Multiple requests for same property
- [x] Timezone handling
- [x] Concurrent modifications
- [x] Property deleted while request pending
- [x] User deleted while request exists

---

## 📈 Implementation Priority

### Phase 1 (MVP - Week 1)
**Priority: HIGH**
- [x] Database model (PropertyVisit)
- [x] Core API endpoints (create, get, confirm, reject)
- [x] PropertyVisitModal component
- [x] VisitRequestsList component
- [x] Owner visit requests page
- [x] Basic notifications (toast)
- [x] Property detail page integration

### Phase 2 (Enhancement - Week 2)
**Priority: MEDIUM**
- [x] UpcomingVisits calendar
- [x] Visit request detail page
- [x] Suggest alternative date feature
- [x] Visit history
- [x] Better filtering/sorting
- [x] Email notifications

### Phase 3 (Polish - Week 3+)
**Priority: LOW**
- [x] Timezone support
- [x] Availability calendar for owners
- [x] Automatic visit completion
- [x] Analytics on visit patterns
- [x] Virtual tour integration

---

## 🗂️ File Structure Summary

```
Frontend:
├── /pages
│   ├── TenantVisitsDashboard.tsx (NEW)
│   └── OwnerVisitRequests.tsx (NEW)
├── /components
│   ├── PropertyVisitModal.tsx (NEW)
│   ├── VisitRequestsList.tsx (NEW)
│   ├── VisitRequestDetail.tsx (NEW)
│   ├── UpcomingVisits.tsx (NEW)
│   ├── VisitRequestButton.tsx (NEW)
│   ├── PropertyDetailPage.tsx (UPDATE)
│   └── /ui/DatePicker.tsx (NEW)
└── /api
    └── visitApi.ts (NEW)

Backend:
├── /routes
│   └── visitRoutes.ts (NEW)
├── /controllers
│   └── visitController.ts (NEW)
├── /services
│   └── visitService.ts (NEW)
├── /middleware
│   └── visitRateLimiter.ts (NEW)
└── /prisma
    └── schema.prisma (UPDATE)
```

---

## ✅ Success Criteria

- [x] Tenant can request property visit with date/time
- [x] Owner can see all incoming requests
- [x] Owner can confirm with final date/time
- [x] Both users see confirmed visit date
- [x] Pending requests show in both dashboards
- [x] Rejections work with reason
- [x] Alternative date suggestions work
- [x] Cancellations work and notify owner
- [x] Calendar view shows upcoming visits
- [x] No authorization bypasses
- [x] Proper error handling
- [x] Toast notifications working
- [x] Mobile responsive
- [x] Zero TypeScript errors

---

## 📝 Notes

- **Date/Time Format**: Use consistent ISO 8601 for backend, display format for frontend
- **Business Hours**: 9 AM - 6 PM Monday-Sunday (configurable)
- **Timezone**: Initially use user's local time, expand to support different zones later
- **Notification Strategy**: Toast for immediate feedback, email for important events (Phase 2)
- **State Management**: Use React Query for caching visit data
- **UI Pattern**: Match existing BDFlatHub design (Airbnb-inspired, Tailwind CSS)

---

## 🎯 Next Step

**Ready for implementation planning?**
Once you approve this list, I will:
1. Create detailed implementation plan
2. Start with backend (schema + API)
3. Build frontend components
4. Integrate into existing pages
5. Test all scenarios

**Questions or additions?** Let me know!
