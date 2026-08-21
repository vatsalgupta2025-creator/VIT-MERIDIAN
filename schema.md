Backend Dataset — Parent Communication Module (Updated Spec)
Updated Decisions
Academics visibility: Parents see attendance only — no CGPA/grades exposed.
Leave/Outing approval: dual approval required — Proctor first, then Parent. Either can reject; both must approve for the request to clear.
Fees: handled by the existing college portal (VTOP), not built natively. The app provides:
A read-only synced fee status shown on the parent dashboard
A direct access link/SSO into the portal so the parent can log in and pay without needing the student's credentials
---
Backend Tables / Collections
1. `users`
Base identity table for everyone (students, parents, proctors, wardens, admins) — role-based, not separate auth systems.
Column	Type	Notes
id	UUID (PK)	
role	enum	`student`, `parent`, `proctor`, `warden`, `admin`
name	string	
email	string	unique
phone	string	
password_hash	string	or SSO/OAuth reference
created_at	timestamp	
2. `students`
Column	Type	Notes
id	UUID (PK)	references `users.id`
reg_no	string	unique, e.g. VIT reg number
hostel_block_id	FK → `hostel_blocks.id`	
room_no	string	
proctor_id	FK → `users.id`	assigned academic proctor
portal_student_ref	string	ID used to match with VTOP/portal sync, if available
3. `parents`
Column	Type	Notes
id	UUID (PK)	references `users.id`
preferred_language	string	for SMS/notification content
4. `student_parent_links`
Many-to-many — supports multiple guardians per student, multiple children per parent.
Column	Type	Notes
id	UUID (PK)	
student_id	FK → `students.id`	
parent_id	FK → `parents.id`	
relation	enum	`father`, `mother`, `guardian`
verification_status	enum	`pending`, `verified`, `revoked`
link_code_used	string	the one-time code the student generated
verified_at	timestamp	
5. `proctors`
Column	Type	Notes
id	UUID (PK)	references `users.id`
department	string	
max_students	int	optional, for admin load-balancing
6. `leave_requests`
Column	Type	Notes
id	UUID (PK)	
student_id	FK → `students.id`	
type	enum	`outing`, `leave`, `emergency_leave`
from_date	date	
to_date	date	
reason	text	
status	enum	`pending_proctor`, `pending_parent`, `approved`, `rejected`, `cancelled`
created_at	timestamp	
updated_at	timestamp	
7. `leave_approvals`
One row per approval step — keeps a clean audit trail of the dual-approval flow.
Column	Type	Notes
id	UUID (PK)	
leave_request_id	FK → `leave_requests.id`	
approver_role	enum	`proctor`, `parent`
approver_id	FK → `users.id`	
decision	enum	`approved`, `rejected`, `query_raised`
comment	text	optional
decided_at	timestamp	
> Logic: a `leave_request` only reaches `approved` when there's an `approved` row from **both** roles. A `rejected` from either role immediately sets the request to `rejected`.
8. `notifications`
Column	Type	Notes
id	UUID (PK)	
recipient_id	FK → `users.id`	(parent or student)
category	enum	`attendance`, `hostel`, `fees`, `discipline`, `leave`, `general`
message	text	
related_entity_id	UUID nullable	e.g. leave_request_id, notice_id
read	boolean	
created_at	timestamp	
9. `message_threads`
Column	Type	Notes
id	UUID (PK)	
parent_id	FK → `parents.id`	
student_id	FK → `students.id`	
with_role	enum	`warden`, `proctor`
with_user_id	FK → `users.id`	resolved automatically from student's `hostel_block_id` or `proctor_id`
last_message_at	timestamp	
10. `messages`
Column	Type	Notes
id	UUID (PK)	
thread_id	FK → `message_threads.id`	
sender_id	FK → `users.id`	
body	text	
sent_at	timestamp	
read_at	timestamp	nullable
11. `fee_status_sync`
Read-only cache synced from the college portal (via API/scraper/nightly batch, whatever integration is feasible on the portal side).
Column	Type	Notes
id	UUID (PK)	
student_id	FK → `students.id`	
status	enum	`paid`, `due`, `overdue`
amount_due	decimal	nullable
due_date	date	nullable
last_synced_at	timestamp	
portal_deep_link	string	pre-built SSO/redirect URL for "Pay Now"
12. `attendance_sync`
Same idea — read-only, synced from the academic system.
Column	Type	Notes
id	UUID (PK)	
student_id	FK → `students.id`	
overall_percent	decimal	
subject_breakdown	JSON	optional array of `{subject, percent}` — omit if not needed
last_synced_at	timestamp	
13. `notification_preferences`
Column	Type	Notes
id	UUID (PK)	
parent_id	FK → `parents.id`	
category	enum	same as `notifications.category`
push	boolean	
sms	boolean	
email	boolean	
14. `audit_logs`
Column	Type	Notes
id	UUID (PK)	
actor_id	FK → `users.id`	
action	string	e.g. `leave_approved`, `parent_linked`, `link_revoked`
target_entity	string	e.g. `leave_request:uuid`
metadata	JSON	
created_at	timestamp	
---
Existing Tables Reused (from Hostel Module)
`hostel_blocks` — id, name, category, year_group, tags, room_types, mess_info
`wardens` — id, hostel_block_id, name(s), email, phone
These are referenced by `students.hostel_block_id` and `message_threads.with_user_id` so the parent's "Message Warden" button always resolves correctly without duplicating warden data.
---
Key Backend Logic to Implement
Dual-approval state machine for `leave_requests`:
`pending_proctor` → (proctor approves) → `pending_parent` → (parent approves) → `approved`
Any rejection at any stage → `rejected`, and both student + the other approver get notified immediately.
Linking flow security: `student_parent_links.link_code_used` should be a short-lived, single-use code generated by the student (e.g., 6-digit, expires in 15 min) — verify server-side before setting `verification_status = verified`.
Fee & attendance sync jobs: scheduled job (e.g., nightly or on portal webhook if available) pulls into `fee_status_sync` / `attendance_sync`. If the portal has no API, this may need to be a manual/admin-triggered sync initially — flag this as a dependency on IT/portal team access.
Notification fan-out: when a row is inserted into `leave_requests`, `notifications`, or fee/attendance sync detects a threshold breach (e.g., attendance < 75%), trigger the notification pipeline respecting each parent's `notification_preferences`.
Data scoping middleware: every API call from a `parent` role must filter through `student_parent_links` where `verification_status = verified` — never trust a student_id passed directly from the client without this check.
---
Open Dependency to Flag
Fee and attendance sync depend on portal-side integration (API access or export mechanism from VTOP or whatever system the college uses). This is the one piece that needs coordination with IT/admin — everything else here can be built independently.