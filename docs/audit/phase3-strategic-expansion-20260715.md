# Phase 3: Strategic Expansion (Product Mode)

**Evaluation Date:** 2026-07-15T08:25:00Z
**Evaluator:** CMZ Agent (Ultrawork Loop)
**Branch:** main

---

## Objective

Add ONE high-leverage functional capability that addresses a real gap.

## STRICT CONSTRAINTS

- ❌ NO cosmetic changes
- ❌ NO low-impact features
- ✅ MUST address documented gap in `docs/blueprint.md` or `docs/roadmap.md`
- ✅ MUST include user story, acceptance criteria, and value justification

---

## SELECTED FEATURE: Team Collaboration

### User Story

**As a** team lead managing multiple projects,
**I want to** invite team members to collaborate on ideas and plans,
**So that** we can collectively refine ideas, assign tasks, and track progress together.

### Value Justification

1. **Phase 3 Roadmap Alignment** — Explicitly listed as Phase 3 priority
2. **User Engagement** — Multi-user features increase retention and daily active users
3. **Enterprise Readiness** — Required for B2B sales and team adoption
4. **Competitive Parity** — Most productivity tools offer team collaboration
5. **Monetization Path** — Team features enable premium pricing tiers

### Current Gap Analysis

| Capability      | Current State    | Gap                      |
| --------------- | ---------------- | ------------------------ |
| User roles      | Single user only | No team roles            |
| Invitations     | None             | No invite system         |
| Shared ideas    | No               | Ideas are private        |
| Task assignment | No               | No assignment capability |
| Activity feed   | No               | No collaboration history |
| Comments        | No               | No discussion threads    |

---

## ACCEPTANCE CRITERIA

### Core Requirements

1. **Team Creation**
   - [ ] Users can create a team
   - [ ] Team has a name and optional description
   - [ ] Creator becomes team owner

2. **Member Invitation**
   - [ ] Owner can invite members by email
   - [ ] Invited users receive email notification
   - [ ] Invited users can accept/decline
   - [ ] Pending invitations are tracked

3. **Role-Based Access**
   - [ ] Owner: Full control, can delete team
   - [ ] Admin: Can manage members, edit all ideas
   - [ ] Member: Can edit assigned ideas only
   - [ ] Viewer: Read-only access

4. **Shared Ideas**
   - [ ] Ideas can be shared with team
   - [ ] Shared ideas appear in team dashboard
   - [ ] All team members can view shared ideas

5. **Task Assignment**
   - [ ] Tasks can be assigned to team members
   - [ ] Assigned members see tasks in their dashboard
   - [ ] Assignment notifications sent

6. **Activity Feed**
   - [ ] Track idea creation, edits, assignments
   - [ ] Show recent activity on team dashboard
   - [ ] Filter by member, date, action type

7. **Comments**
   - [ ] Add comments to ideas
   - [ ] Add comments to tasks
   - [ ] @mention team members in comments
   - [ ] Comment notifications for mentioned users

---

## TECHNICAL DESIGN

### Database Schema Additions

```sql
-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team invitations
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea sharing
CREATE TABLE idea_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, team_id)
);

-- Task assignments
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Endpoint                         | Description          |
| ------ | -------------------------------- | -------------------- |
| POST   | /api/teams                       | Create team          |
| GET    | /api/teams                       | List user's teams    |
| GET    | /api/teams/[id]                  | Get team details     |
| PUT    | /api/teams/[id]                  | Update team          |
| DELETE | /api/teams/[id]                  | Delete team          |
| POST   | /api/teams/[id]/invite           | Invite member        |
| GET    | /api/teams/[id]/members          | List members         |
| PUT    | /api/teams/[id]/members/[userId] | Update role          |
| DELETE | /api/teams/[id]/members/[userId] | Remove member        |
| POST   | /api/invites/[token]/accept      | Accept invitation    |
| POST   | /api/invites/[token]/decline     | Decline invitation   |
| POST   | /api/ideas/[id]/share            | Share idea with team |
| GET    | /api/teams/[id]/ideas            | List team ideas      |
| POST   | /api/tasks/[id]/assign           | Assign task          |
| GET    | /api/teams/[id]/activity         | Get activity feed    |
| POST   | /api/ideas/[id]/comments         | Add comment          |
| GET    | /api/ideas/[id]/comments         | List comments        |

### Frontend Components

1. **TeamDashboard** — Team overview, members, activity
2. **InviteModal** — Send invitations
3. **MemberList** — Manage team members
4. **RoleSelector** — Change member roles
5. **ShareDialog** — Share ideas with team
6. **AssignmentPicker** — Assign tasks to members
7. **CommentThread** — Discussion on ideas/tasks
8. **ActivityFeed** — Recent team activity

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)

- [ ] Database schema and migrations
- [ ] Team CRUD API
- [ ] Basic team dashboard UI

### Phase 2: Membership (Week 3-4)

- [ ] Invitation system
- [ ] Email notifications
- [ ] Accept/decline flow

### Phase 3: Collaboration (Week 5-6)

- [ ] Idea sharing
- [ ] Task assignment
- [ ] Role-based permissions

### Phase 4: Communication (Week 7-8)

- [ ] Comments system
- [ ] @mention notifications
- [ ] Activity feed

---

## SUCCESS METRICS

| Metric                     | Target                    | Measurement |
| -------------------------- | ------------------------- | ----------- |
| Team creation rate         | 10% of users create teams | Analytics   |
| Invitation acceptance      | >50% acceptance rate      | Database    |
| Daily active collaborators | 20 DAU on team features   | Analytics   |
| Task assignment rate       | 30% of tasks assigned     | Database    |
| Comment engagement         | 5+ comments per idea      | Database    |

---

## RISKS & MITIGATIONS

| Risk                  | Impact | Mitigation                              |
| --------------------- | ------ | --------------------------------------- |
| Email delivery issues | High   | Use reliable provider (Resend/SendGrid) |
| Permission complexity | Medium | Start with simple roles, iterate        |
| Performance at scale  | Medium | Add indexes, pagination                 |
| Notification overload | Low    | Allow notification preferences          |

---

## LABELS

- Category: feature
- Priority: P2

---

**Next Steps:** Create database migrations, implement team CRUD, build invitation system.
