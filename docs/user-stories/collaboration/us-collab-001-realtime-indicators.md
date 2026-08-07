# US-COLLAB-001: Real-Time Collaboration Indicators

## Story Metadata

- **Story ID**: US-COLLAB-001
- **Status**: Ready
- **Title**: Real-Time Collaboration Indicators for Multi-User Editing
- **Priority**: P2 (Could Have)
- **Story Points**: 8
- **Epic**: Team Collaboration
- **Sprint**: Phase 3 Scale
- **Related Issues**: #1926

## User Story

```
As a team member working on shared ideas,
I want to see who else is currently viewing or editing the same idea,
So that I can avoid conflicts and coordinate with my teammates effectively.
```

## Acceptance Criteria

### Scenario 1: Presence Indicator Display

```gherkin
Given I am viewing an idea in the results page
When other users are also viewing the same idea
Then I should see their avatars or initials displayed near the idea title
And I should see a count of "X users viewing" if more than 3 users
And the presence indicators should update in real-time without page refresh
```

### Scenario 2: Active Editor Indicator

```gherkin
Given I am editing an idea's title or description
When I start typing
Then other users viewing the same idea should see an "editing" indicator next to my avatar
And the indicator should show "User is editing..." with my name
And the indicator should disappear when I stop typing for 3 seconds
```

### Scenario 3: Conflict Prevention Warning

```gherkin
Given another user is currently editing an idea
When I try to edit the same field
Then I should see a warning "This field is being edited by [User Name]"
And I should have the option to "Take Over" or "Cancel"
And if I choose "Take Over", the other user should see a notification
```

### Scenario 4: Offline/Disconnected Handling

```gherkin
Given I am viewing an idea with other users
When my connection is lost
Then I should see a "Reconnecting..." indicator
And when connection is restored, presence indicators should refresh automatically
And I should not see stale presence data
```

### Checklist

- [ ] Real-time presence tracking using Supabase Realtime
- [ ] User avatar/initials display for viewers
- [ ] "X users viewing" count for large groups
- [ ] Active editor indicator with user name
- [ ] Conflict prevention warning for concurrent edits
- [ ] "Take Over" functionality with notifications
- [ ] Offline/disconnected state handling
- [ ] Presence update latency < 2 seconds
- [ ] Graceful degradation when Realtime is unavailable

## Technical Requirements

### Database Changes

```sql
-- Add presence tracking table
CREATE TABLE idea_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'viewing' CHECK (status IN ('viewing', 'editing', 'idle')),
  editing_field TEXT, -- e.g., 'title', 'description', null if not editing
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE idea_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view presence for ideas they can access"
  ON idea_presence FOR SELECT
  USING (
    idea_id IN (
      SELECT id FROM ideas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own presence"
  ON idea_presence FOR ALL
  USING (user_id = auth.uid());
```

### API Endpoints

```typescript
// GET /api/ideas/[id]/presence
// Returns current presence list for an idea
Response: {
  success: true,
  data: {
    presence: Array<{
      userId: string;
      userName: string;
      avatarUrl: string | null;
      status: 'viewing' | 'editing' | 'idle';
      editingField: string | null;
      lastActiveAt: string;
    }>;
    totalViewers: number;
  }
}

// POST /api/ideas/[id]/presence
// Update own presence status
Body: {
  status: 'viewing' | 'editing' | 'idle';
  editingField?: string;
}
Response: {
  success: true,
  data: { presenceId: string }
}

// DELETE /api/ideas/[id]/presence
// Remove own presence (on page leave)
Response: {
  success: true
}
```

### Realtime Subscription

```typescript
// Subscribe to presence changes for an idea
const channel = supabase
  .channel(`idea:${ideaId}:presence`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'idea_presence',
      filter: `idea_id=eq.${ideaId}`,
    },
    (payload) => {
      handlePresenceChange(payload);
    }
  )
  .subscribe();
```

### Frontend Components

```typescript
// PresenceIndicator.tsx
interface PresenceIndicatorProps {
  ideaId: string;
  currentUserId: string;
}

// Shows avatars of users viewing the idea
// Shows "X users viewing" for large groups
// Shows editing indicator when user is actively editing

// ConflictWarning.tsx
interface ConflictWarningProps {
  fieldName: string;
  editingUser: {
    name: string;
    avatarUrl: string | null;
  };
  onTakeOver: () => void;
  onCancel: () => void;
}

// Shows warning when field is being edited by another user
// Provides "Take Over" and "Cancel" options
```

## Implementation Notes

### Performance Considerations

- Use Supabase Realtime for efficient real-time updates
- Debounce presence updates to avoid excessive database writes
- Implement presence cleanup for idle users (5 minutes inactive)
- Use optimistic UI updates for better perceived performance

### Security Considerations

- Row Level Security ensures users can only see presence for ideas they can access
- Presence data should not expose sensitive user information
- Rate limit presence updates to prevent abuse

### Edge Cases

- Handle simultaneous "Take Over" requests (last writer wins)
- Clean up presence records when users disconnect unexpectedly
- Handle Supabase Realtime connection failures gracefully
- Support users with disabled JavaScript ( degraded experience)

## Dependencies

### Depends On

- [ ] Supabase Realtime enabled
- [ ] US-IDEA-001: Idea Submission (ideas table)
- [ ] US-AUTH-001: User Signup (user authentication)

### Blocks

- [ ] Future: Real-time collaborative editing
- [ ] Future: Team workspaces

## Definition of Done

### Code Quality

- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] Code reviewed by at least one team member
- [ ] No TypeScript errors
- [ ] No linting warnings

### Testing

- [ ] Unit tests for presence components
- [ ] Integration tests for presence API
- [ ] E2E test for multi-user presence
- [ ] Load test for presence with 10+ concurrent users
- [ ] All acceptance criteria verified

### Documentation

- [ ] API documentation updated
- [ ] Component props documented
- [ ] Realtime subscription guide added

### Security

- [ ] RLS policies tested
- [ ] Presence data validation
- [ ] Rate limiting verified
- [ ] No sensitive data exposed

## Value Justification

### Business Value

1. **Improved Team Coordination**: Teams can work together on ideas without stepping on each other's toes
2. **Reduced Conflicts**: Real-time indicators prevent accidental overwrites
3. **Better UX**: Users feel confident working in parallel knowing others are visible
4. **Enterprise Ready**: Collaboration features are essential for team adoption

### Technical Value

1. **Realtime Infrastructure**: Establishes Supabase Realtime patterns for future features
2. **Presence Patterns**: Creates reusable patterns for other real-time features
3. **Conflict Resolution**: Builds foundation for more advanced collaborative editing

### Metrics

- **Adoption**: % of ideas viewed by multiple users
- **Engagement**: Average session duration with presence enabled
- **Conflict Reduction**: % reduction in concurrent edit conflicts
- **Team Size**: Average team size using collaboration features

## Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Presence and Presence State](https://supabase.com/docs/guides/realtime/presence)
- [API Reference](../../api.md)
- [User Personas](../personas.md)

## History

| Date       | Action        | Author    |
| ---------- | ------------- | --------- |
| 2026-08-06 | Story created | CMZ Agent |

---

_This user story follows the [User Story Engineer Guide](../../user-story-engineer.md) best practices._
