# SimulatedWorld User Personas Guide

## Overview

SimulatedWorld now supports **user persona switching**, allowing you to view the simulated organization from different team members' perspectives. This is essential for testing how different users interact with the system.

---

## Two Viewing Modes

### 1. Master View (Default)
- **What You See**: Everything in the organization
- **All Channels**: Public + Private
- **All Emails**: All Gmail messages across all users
- **All Events**: Complete calendar across all attendees
- **All Tasks**: Every task in the system
- **Perfect for**: 
  - Understanding the complete state
  - Debugging system-wide issues
  - Observing all interactions
  - Testing scenarios end-to-end

### 2. User Persona View
- **What You See**: Only what that specific user can access
- **Channels**: Only public channels + private channels they're members of
- **Emails**: Only emails sent to/from them
- **Events**: Only calendar events they're invited to
- **Tasks**: Only their own tasks
- **Perfect for**:
  - Testing access control
  - Verifying privacy boundaries
  - Simulating user workflows
  - Testing role-based features

---

## How to Switch Personas

### Step 1: Click the User Selector
Look in the **top right of the header** for the persona selector button. It shows:
- 👁️ icon = Master View
- User initials = Current persona

### Step 2: Choose a View
The dropdown shows:

**Master View Option**
```
👁️ Master View
   See all channels, emails, and events
```

**User Persona Options** (for each user in the organization)
```
[Avatar] Alice Johnson
        alice@company.com
```

### Step 3: View Changes Instantly
The entire UI updates to show only data visible to that persona:
- Channel list filters to their channels
- Messages show only conversations they're in
- Calendar shows only their events
- Tasks show only their assignments

---

## Example Workflows

### Workflow 1: Test Private Channel Access

**Scenario**: Alice is in a private channel `#sales-strategy` but Bob isn't.

**Steps**:
1. Switch to **Master View** → See all channels including `#sales-strategy`
2. Switch to **Alice** persona → See `#sales-strategy` (she's a member)
3. Switch to **Bob** persona → `#sales-strategy` disappears (he can't access it)

**Verification**: ✅ Private channel access control working correctly

### Workflow 2: Verify Calendar Conflicts

**Scenario**: Testing how Piper's meeting scheduler handles conflicts.

**Steps**:
1. Switch to **Alice** persona → View her calendar, see her free time
2. View the same time in **Bob** persona → See different availability
3. Run a scenario that schedules a meeting between them
4. Verify both see the meeting on their calendars

**Verification**: ✅ Cross-user calendar sync working

### Workflow 3: Test Email Access

**Scenario**: Ensure users only see emails meant for them.

**Steps**:
1. Switch to **Master View** → See all emails in the organization
2. Switch to **Alice** persona → Gmail view shows only Alice's emails
3. Send an email to Bob
4. Switch to **Bob** persona → New email appears in his inbox
5. Switch back to **Alice** → Email doesn't appear (she wasn't included)

**Verification**: ✅ Email privacy working correctly

### Workflow 4: Multi-User Scenario Testing

**Scenario**: Run a complex meeting scheduling scenario across 4 people.

**Steps**:
1. **Master View**: Run a meeting scheduling scenario
2. Watch real-time mutations in Trace Log
3. Switch to **Alice** → See meeting appeared in her calendar
4. Switch to **Bob** → See same meeting (but from his timezone perspective)
5. Switch to **Charlie** → Confirm he received the invitation
6. Switch to **Diana** → Verify she can also see it

**Verification**: ✅ Multi-user workflows work across personas

---

## What Filters Per Persona

### Slack Channels
- **Master**: All public + all private
- **Persona**: Public channels + private channels they're members of

### Messages
- **Master**: All messages in all channels
- **Persona**: Only messages in channels they can see

### Calendar Events
- **Master**: All events across all users
- **Persona**: Only events where they're an attendee

### Gmail
- **Master**: All emails sent by anyone
- **Persona**: Only emails where they're sender or recipient

### Tasks (Todoist)
- **Master**: All tasks in all projects
- **Persona**: Only their assigned tasks

### Documents
- **Master**: All documents in organization
- **Persona**: Only documents shared with them

---

## Advanced: Switching During Scenarios

You can switch personas **while a scenario is running**:

1. **Start Scenario** in Master View
2. Watch it execute with real-time mutations
3. **Switch to Alice persona** → See her perspective of the changes
4. **Switch to Bob persona** → See his perspective
5. **Back to Master View** → See complete picture

This allows you to:
- Test multi-user scenarios
- Verify each user sees correct data
- Catch sync issues between users
- Validate access control during operations

---

## API Context for Developers

The persona system is exposed via the `useWorldState` hook:

```typescript
const { 
  currentUserPersona,    // Current persona object (User | null)
  masterViewMode,        // Boolean: true if in master view
  setCurrentUserPersona, // Function to switch personas
  setMasterViewMode,     // Function to toggle master view
  users                  // All available users
} = useWorldState();

// Switch to a specific user
setCurrentUserPersona(users[0]);

// Switch to master view
setCurrentUserPersona(null); // or setMasterViewMode(true)
```

---

## Personas in Your Simulated Organization

The UI auto-populates user personas from the SimulatedWorld state:

```
Organization
├── Alice Johnson (alice@company.com)
├── Bob Smith (bob@company.com)
├── Charlie Brown (charlie@company.com)
├── Diana Martinez (diana@company.com)
└── ... more users
```

You can add more users by:
1. Modifying the SimulatedWorld initialization data
2. Running scenarios that create users
3. Loading from organization snapshots

---

## UI Indicators

### Master View Indicator
- Avatar shows 👁️ icon
- Label says "Master View"
- Subtext says "All Data"

### Persona View Indicator
- Avatar shows user initials
- Label says "Viewing As"
- Subtext shows their name

### Current Persona in Views
- Slack header shows persona context
- Calendar shows filtered events
- Email shows filtered messages

---

## Common Questions

**Q: Can I break something by switching personas?**
A: No. Switching personas only changes what data is visible. All data remains in the system. Switching back to Master View shows everything again.

**Q: Does switching personas affect running scenarios?**
A: No. Scenarios run in Master View by default. You can switch personas to observe the scenario's effect from different perspectives.

**Q: How do I add new test personas?**
A: Modify the organization initialization in the backend SimulatedWorld, or create new users via scenarios.

**Q: Can personas have different permissions?**
A: Currently, users see all public channels and only their private channels. You can extend this with custom access control logic.

---

## Next: Using Personas for Testing

The most powerful use of personas is **testing multi-user scenarios**:

1. **Design Scenario**: "Alice books a meeting with Bob and Charlie"
2. **Run in Master View**: Watch all mutations happen
3. **Switch to Each User**: Verify they see the correct result
4. **Measure Success**: All users can see the meeting, at correct times, in their timezones

This ensures your multi-user features work correctly across different user perspectives.

---

## Summary

✅ **Master View** for complete observability  
✅ **User Personas** for perspective-specific testing  
✅ **Switch Anytime** during execution  
✅ **Access Control** verified per-user  
✅ **Multi-User Scenarios** fully testable  

**You're now set up to test SimulatedWorld from any user's perspective!**
