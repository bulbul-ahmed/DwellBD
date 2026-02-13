# Phase 2 End-to-End Testing Checklist

## Testing Status: In Progress
**Date**: February 13, 2026
**Tested By**: Claude Sonnet 4.5

---

## 1. Backend API Endpoints Verification

### Owner Request Endpoints
- [ ] POST /api/owner/requests - Submit new request
- [ ] GET /api/owner/requests - Get owner's requests (with pagination)
- [ ] GET /api/owner/requests/:id - Get specific request
- [ ] PATCH /api/owner/requests/:id/cancel - Cancel pending request

### Admin Request Endpoints
- [ ] GET /api/admin/requests - Get all requests (with filters)
- [ ] PATCH /api/admin/requests/:id/approve - Approve request
- [ ] PATCH /api/admin/requests/:id/reject - Reject request
- [ ] PATCH /api/admin/requests/:id/review - Mark as in review

---

## 2. Owner Profile Features

### Service Areas Display
- [ ] Service areas display as chips on profile
- [ ] Empty state shows "Not set" message
- [ ] Only visible when user.role === 'OWNER'
- [ ] Mobile responsive layout

### Business Information
- [ ] Business name displays correctly
- [ ] Business location displays correctly
- [ ] Section hidden if no business info
- [ ] Only visible when user.role === 'OWNER'

### Owner Stats Dashboard
- [ ] Total Properties stat displays correct count
- [ ] Active Listings stat displays correct count
- [ ] Total Inquiries stat displays correct count
- [ ] Pending Visits stat displays correct count
- [ ] Stats cards have proper icons and colors
- [ ] Stats are clickable (navigate to relevant pages)

### Recent Activity Feed
- [ ] Last 5 activities display correctly
- [ ] Inquiry activities show property name, tenant, timestamp
- [ ] Visit activities show property name, tenant, timestamp
- [ ] Status badges display correct colors
- [ ] "View" buttons navigate to correct pages
- [ ] Empty state when no activities

### Quick Action Shortcuts
- [ ] "My Properties" button navigates to /my-properties
- [ ] "Inquiries" button navigates to /owner/inquiries
- [ ] "Visit Requests" button navigates to /owner/visit-requests
- [ ] "Add Property" button opens PropertyFormModal
- [ ] Mobile responsive (stacks vertically on small screens)

### Trust & Verification Badges
- [ ] Verification badge displays for verified owners
- [ ] Average rating displays correctly
- [ ] Total reviews count displays
- [ ] Response rate badge shows if > 80%
- [ ] Member since date displays correctly

---

## 3. Owner Request Submission

### Business Info Change Request
- [ ] "Request Change" button visible on profile
- [ ] RequestChangeModal opens with correct fields
- [ ] Current values pre-filled
- [ ] Business name input (max 100 chars)
- [ ] Business location input (max 200 chars)
- [ ] Reason input required (min 10 chars)
- [ ] Form validation works
- [ ] Submit creates BUSINESS_INFO_CHANGE request
- [ ] Success toast displays
- [ ] Modal closes after submission
- [ ] Request appears in /owner/requests

### Service Area Change Request
- [ ] "Request Change" button visible on profile
- [ ] RequestChangeModal opens with MultiSelect
- [ ] Current areas pre-selected
- [ ] Can add new areas from DHAKA_AREAS list
- [ ] Can remove existing areas
- [ ] Search functionality works in dropdown
- [ ] Reason input required (min 10 chars)
- [ ] Submit creates SERVICE_AREA_CHANGE request
- [ ] Success toast displays
- [ ] Request appears in /owner/requests

### Property Approval Request (Auto-created)
- [ ] Owner clicks "Add Property" in /my-properties
- [ ] PropertyFormModal displays "Admin Approval Required" notice
- [ ] Form fills out completely
- [ ] Submit creates property with status=PENDING
- [ ] Auto-creates PROPERTY_APPROVAL request
- [ ] Success toast: "Property submitted for admin approval!"
- [ ] Property card shows "⏳ Awaiting admin approval" badge
- [ ] Request appears in /owner/requests with type PROPERTY_APPROVAL
- [ ] Request data includes propertyId and property details

---

## 4. Owner Request Tracking (/owner/requests)

### Page Display
- [ ] Page accessible at /owner/requests
- [ ] Protected route (requires OWNER role)
- [ ] Tab navigation (All, Pending, In Review, Approved, Rejected, Cancelled)
- [ ] Request cards display correctly
- [ ] Status badges show correct colors
- [ ] Request type labels display
- [ ] Submission timestamps show relative time
- [ ] Pagination works if > 10 requests

### Request Details
- [ ] Click "View Details" expands request card
- [ ] Request ID displays
- [ ] Requested changes show in JSON format
- [ ] Current data displays (if available)
- [ ] Reason displays
- [ ] Reviewer info shows (if reviewed)
- [ ] Review notes display (if approved)
- [ ] Rejection reason displays (if rejected)

### Cancel Request
- [ ] "Cancel Request" button visible for PENDING requests
- [ ] Confirmation dialog appears
- [ ] Cancel updates status to CANCELLED
- [ ] Success toast displays
- [ ] Request moves to Cancelled tab
- [ ] Cannot cancel IN_REVIEW, APPROVED, or REJECTED requests

### Empty States
- [ ] "No requests found" shows when no requests exist
- [ ] Tab-specific empty states show correct messages
- [ ] Empty state for each filter tab

---

## 5. Admin Request Dashboard (/admin/requests)

### Page Display
- [ ] Page accessible at /admin/requests
- [ ] Protected route (requires ADMIN role)
- [ ] Navigation link visible in admin sidebar (orange theme)
- [ ] Stats cards display: Pending count, In Review count, Total count
- [ ] Icons and colors correct for stats

### Filters
- [ ] Status filter dropdown (All, Pending, In Review, Approved, Rejected, Cancelled)
- [ ] Request Type filter dropdown (All types)
- [ ] Search owner input field
- [ ] Filters apply correctly
- [ ] Page resets to 1 when filters change
- [ ] Results update in real-time

### Request List (Desktop)
- [ ] Table displays with columns: Owner, Request Type, Status, Submitted, Actions
- [ ] Owner name and email display
- [ ] Verification badge shows for verified owners
- [ ] Request type labels correct
- [ ] Status badges display with correct colors
- [ ] Submitted date/time formatted correctly
- [ ] "Review" button on each row

### Request List (Mobile)
- [ ] Card layout displays on mobile
- [ ] All relevant info visible in cards
- [ ] Status badges visible
- [ ] "Review Request" button at bottom
- [ ] Responsive design works

### Pagination
- [ ] Shows if > 20 requests
- [ ] "Previous" button disabled on page 1
- [ ] "Next" button disabled on last page
- [ ] Page numbers display correctly

---

## 6. Admin Request Review (RequestReviewModal)

### Modal Display
- [ ] Opens when "Review" clicked
- [ ] Title: "Review Owner Request"
- [ ] Request type displays as label
- [ ] Submission timestamp formatted
- [ ] Status badge shows current status
- [ ] Modal responsive on mobile

### Owner Information Section
- [ ] Owner name displays (firstName + lastName)
- [ ] Owner email displays
- [ ] Verification status shows (✓ Verified or Not verified)
- [ ] Section has gray background

### Reason Display
- [ ] Reason for request displays in text box
- [ ] Formatted correctly

### Changes Comparison

#### Business Info Change
- [ ] Shows current business name vs. requested
- [ ] Shows current location vs. requested
- [ ] Side-by-side comparison (2 columns)
- [ ] Blue highlight on requested values
- [ ] "Not set" shows for empty current values

#### Service Area Change
- [ ] Shows current service areas as chips
- [ ] Shows requested service areas as chips
- [ ] Blue highlight on requested chips
- [ ] Empty state if no areas

#### Contact Info Change
- [ ] Shows current phone vs. requested
- [ ] Shows current email vs. requested
- [ ] Side-by-side comparison

#### Property Approval
- [ ] Shows property details in JSON format
- [ ] Property ID, title, address, area visible
- [ ] Price, bedrooms, bathrooms visible
- [ ] No current data (new property)

#### Default (JSON Comparison)
- [ ] Requested changes show in formatted JSON
- [ ] Current data shows in formatted JSON (if available)
- [ ] Syntax highlighted

### Admin Notes (Optional)
- [ ] Textarea for admin notes
- [ ] Max 500 characters
- [ ] Character counter displays
- [ ] Optional field (not required)
- [ ] Disabled if request already reviewed

### Rejection Form
- [ ] "Reject" button shows rejection form
- [ ] Rejection reason textarea required
- [ ] Minimum 10 characters enforced
- [ ] Max 500 characters
- [ ] Character counter displays
- [ ] Red border/background for rejection section
- [ ] "Cancel" button hides rejection form

### Actions

#### Mark In Review
- [ ] Button visible for PENDING requests only
- [ ] Updates status to IN_REVIEW
- [ ] Success toast displays
- [ ] Modal closes
- [ ] Request list refreshes

#### Approve
- [ ] "Approve" button visible for PENDING/IN_REVIEW
- [ ] Confirmation dialog appears
- [ ] Updates status to APPROVED
- [ ] Applies changes automatically (backend)
- [ ] Success toast displays
- [ ] Modal closes
- [ ] Request list refreshes
- [ ] Owner data updated (for business/service area requests)
- [ ] Property status updated to ACTIVE (for property approval)

#### Reject
- [ ] "Reject" button visible for PENDING/IN_REVIEW
- [ ] Opens rejection form
- [ ] Requires 10+ char reason
- [ ] Confirmation dialog appears
- [ ] Updates status to REJECTED
- [ ] Saves rejection reason
- [ ] Success toast displays
- [ ] Modal closes
- [ ] Request list refreshes

#### Contact Owner
- [ ] Email link opens mailto: with owner email
- [ ] Link visible when request is PENDING/IN_REVIEW

#### Close
- [ ] "Close" button visible
- [ ] Closes modal without changes
- [ ] Works at all stages

### Reviewer Information (After Review)
- [ ] Shows reviewer name (firstName + lastName)
- [ ] Shows reviewed timestamp
- [ ] Shows review notes (if provided)
- [ ] Shows rejection reason (if rejected)
- [ ] Blue background for info section

---

## 7. Property Approval Workflow (End-to-End)

### Owner Creates Property
1. [ ] Owner navigates to /my-properties
2. [ ] Clicks "Add Property"
3. [ ] PropertyFormModal opens
4. [ ] "Admin Approval Required" notice displays at top
5. [ ] Fills out all property fields
6. [ ] Clicks "Submit"
7. [ ] Loading state displays
8. [ ] Property created with status=PENDING
9. [ ] PROPERTY_APPROVAL request auto-created
10. [ ] Toast: "Property submitted for admin approval!"
11. [ ] Modal closes
12. [ ] Property list refreshes
13. [ ] New property visible with PENDING status
14. [ ] "⏳ Awaiting admin approval" badge visible on card

### Owner Tracks Request
1. [ ] Owner navigates to /owner/requests
2. [ ] Property approval request visible in list
3. [ ] Status: PENDING
4. [ ] Can view request details
5. [ ] Property details visible in JSON

### Admin Reviews Request
1. [ ] Admin navigates to /admin/requests
2. [ ] Pending count incremented
3. [ ] Property approval request in list
4. [ ] Clicks "Review"
5. [ ] RequestReviewModal opens
6. [ ] Property details display in JSON format
7. [ ] Can see property title, address, price, etc.
8. [ ] Clicks "Approve"
9. [ ] Confirmation dialog appears
10. [ ] Clicks "Confirm"
11. [ ] Backend updates property status: PENDING → ACTIVE
12. [ ] Backend updates request status: PENDING → APPROVED
13. [ ] Success toast: "Request approved successfully"
14. [ ] Modal closes
15. [ ] Request list refreshes

### Property Goes Live
1. [ ] Owner navigates to /my-properties
2. [ ] Property status badge now shows "Active"
3. [ ] "Awaiting approval" badge removed
4. [ ] Property visible in public /properties listing
5. [ ] Property viewable by tenants
6. [ ] Owner can edit/delete property

### Alternative: Admin Rejects
1. [ ] Admin clicks "Reject" on property approval
2. [ ] Rejection form appears
3. [ ] Enters reason: "Incomplete property information"
4. [ ] Clicks "Confirm Rejection"
5. [ ] Backend updates request status: PENDING → REJECTED
6. [ ] Property status remains PENDING (not visible to public)
7. [ ] Owner sees rejection in /owner/requests
8. [ ] Rejection reason visible
9. [ ] Owner can delete property or submit new request

---

## 8. Admin User Management (Owner Fields)

### AdminUsers Page
- [ ] Page accessible at /admin/users
- [ ] User list displays
- [ ] Edit button on each user
- [ ] Edit modal opens

### Edit Owner Fields
- [ ] Modal shows owner-specific fields when role=OWNER
- [ ] Service Areas MultiSelect visible
- [ ] Can add/remove service areas
- [ ] Areas validated against DHAKA_AREAS
- [ ] Business Name input visible (max 100 chars)
- [ ] Business Location input visible (max 200 chars)
- [ ] Save updates user successfully
- [ ] Changes reflected in owner profile immediately

### Convert User to Owner
- [ ] Change role from TENANT to OWNER
- [ ] Owner fields become visible
- [ ] Can set service areas
- [ ] Can set business info
- [ ] Save creates owner profile

### Convert Owner to Tenant
- [ ] Change role from OWNER to TENANT
- [ ] Owner fields hidden
- [ ] Owner-specific data cleared on save
- [ ] Profile no longer shows owner sections

---

## 9. Integration & Navigation

### Header Navigation
- [ ] "My Properties" link visible for owners
- [ ] "Inquiries" link visible for owners
- [ ] "Visit Requests" link visible for owners
- [ ] Links navigate correctly
- [ ] Mobile menu includes all links

### Admin Sidebar Navigation
- [ ] "Owner Requests" link visible (orange theme)
- [ ] Link navigates to /admin/requests
- [ ] Active state highlights current page
- [ ] Mobile sidebar includes link

### Protected Routes
- [ ] /owner/requests requires OWNER role
- [ ] /admin/requests requires ADMIN role
- [ ] Redirect to login if not authenticated
- [ ] Show "Unauthorized" if wrong role

### Cross-Page Integration
- [ ] Profile "Request Change" → RequestChangeModal → /owner/requests
- [ ] My Properties "Add Property" → Auto-request → /owner/requests
- [ ] Owner Requests "View Details" → Request detail expanded
- [ ] Admin Requests "Review" → RequestReviewModal
- [ ] Approval → Owner profile updated → Changes visible immediately

---

## 10. Error Handling & Edge Cases

### Duplicate Request Prevention
- [ ] Cannot submit duplicate PENDING business info change
- [ ] Cannot submit duplicate PENDING service area change
- [ ] Error message: "You already have a pending request of this type"
- [ ] Can submit new request after previous is completed

### Validation Errors
- [ ] Reason < 10 chars shows error
- [ ] Business name > 100 chars shows error
- [ ] Invalid service area rejected
- [ ] Empty request data rejected
- [ ] Invalid email format rejected (contact info change)

### Authorization Checks
- [ ] Tenant cannot access owner routes
- [ ] Owner cannot access admin routes
- [ ] Cannot approve own request
- [ ] Cannot modify another owner's request

### Network Errors
- [ ] API failure shows error toast
- [ ] Loading states clear on error
- [ ] User can retry action
- [ ] Error messages are user-friendly

### Data Consistency
- [ ] Request data matches user data
- [ ] Property approval updates property correctly
- [ ] Service area changes apply immediately after approval
- [ ] Business info changes apply immediately after approval

---

## 11. Performance & UX

### Loading States
- [ ] Request submission shows loading spinner
- [ ] Request list shows loading spinner
- [ ] Modal actions show loading state
- [ ] Pagination loading handled

### Toast Notifications
- [ ] Success toasts display for all successful actions
- [ ] Error toasts display for all failures
- [ ] Toast duration appropriate (3-5 seconds)
- [ ] Toast positioned correctly
- [ ] Multiple toasts stack properly

### Responsive Design
- [ ] All pages mobile responsive
- [ ] Modals work on mobile
- [ ] Tables switch to cards on mobile
- [ ] Forms stack correctly on small screens
- [ ] No horizontal scroll on mobile

---

## 12. Backend Data Integrity

### Database Operations
- [ ] Request creation saves all fields correctly
- [ ] Request approval updates user data atomically
- [ ] Property approval updates property status atomically
- [ ] No orphaned requests in database
- [ ] Timestamps set correctly (createdAt, reviewedAt)

### Business Logic
- [ ] applyRequestChanges works for all request types
- [ ] validateRequestData validates all types
- [ ] Duplicate check works correctly
- [ ] Status transitions valid (PENDING → IN_REVIEW → APPROVED/REJECTED)

---

## Test Summary

**Total Test Cases**: 200+

**Categories**:
- API Endpoints: 8 tests
- Owner Profile Features: 25 tests
- Request Submission: 30 tests
- Request Tracking: 15 tests
- Admin Dashboard: 20 tests
- Request Review: 40 tests
- Property Approval Workflow: 30 tests
- Admin User Management: 15 tests
- Integration: 10 tests
- Error Handling: 15 tests
- Performance/UX: 12 tests

**Testing Approach**:
1. Manual API testing with curl/Postman
2. Frontend testing in browser
3. End-to-end workflow testing
4. Edge case validation
5. Performance monitoring

---

## Issues Found

### Critical Issues
*None found yet*

### Medium Issues
*None found yet*

### Minor Issues
*None found yet*

---

## Completion Checklist

- [ ] All API endpoints tested
- [ ] All frontend pages tested
- [ ] All workflows tested end-to-end
- [ ] Edge cases verified
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Mobile responsive verified
- [ ] Documentation complete
- [ ] Code cleanup done
- [ ] Ready for deployment
