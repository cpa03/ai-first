# Strategic Expansion: AI-Powered Idea Similarity Detection

**Date**: June 21, 2026
**Phase**: Phase 3 - Strategic Expansion (Product Mode)
**Related Issue**: #1932

---

## User Story

**As a** founder submitting multiple ideas,
**I want to** see similar existing ideas when I submit a new one,
**So that I** can avoid duplicates, build on existing work, and discover connections between my ideas.

---

## Acceptance Criteria

1. When a user submits a new idea, the system checks for similar existing ideas
2. Similar ideas are displayed with a similarity score (0-100%)
3. User can choose to view the similar idea or continue with their new idea
4. Similarity detection uses vector embeddings (already implemented in db/vectors.ts)
5. Response time for similarity check is < 2 seconds
6. False positives are minimized (precision > 80%)

---

## Value Justification

### Business Value

- **Reduces duplication**: Users avoid creating duplicate ideas
- **Increases engagement**: Users discover connections between ideas
- **Improves quality**: Users can build on existing work rather than starting from scratch
- **Differentiation**: Unique feature not available in basic planning tools

### Technical Feasibility

- Vector embeddings infrastructure already exists (pgvector)
- Similarity service already implemented (src/lib/similarity-service.ts)
- Database schema supports vector storage (vectors table)
- Only needs UI integration and API endpoint

### User Impact

- **Reach**: All users who submit ideas (100%)
- **Impact**: Medium - improves idea quality and reduces duplication
- **Confidence**: High - infrastructure already exists
- **Effort**: Low - mainly UI integration

---

## Implementation Plan

### Phase 1: API Integration (1 day)

- Create `/api/ideas/[id]/similar` endpoint
- Integrate with existing SimilarityService
- Add rate limiting for similarity checks

### Phase 2: UI Integration (1 day)

- Add similarity check to idea submission flow
- Display similar ideas with similarity scores
- Add "View Similar" and "Continue Anyway" buttons

### Phase 3: Polish (0.5 day)

- Add loading states
- Handle edge cases (no similar ideas, timeout)
- Add analytics tracking

---

## Success Metrics

- **Adoption**: > 30% of idea submissions trigger similarity check
- **Accuracy**: > 80% of shown similarities are relevant
- **Performance**: < 2 second response time for similarity check
- **User Satisfaction**: Positive feedback on similarity feature

---

## Dependencies

- SimilarityService (already implemented)
- Vector embeddings (already implemented)
- Idea submission flow (already implemented)

---

## Risks

| Risk                             | Mitigation                                     |
| -------------------------------- | ---------------------------------------------- |
| False positives annoy users      | Allow users to dismiss similarity suggestions  |
| Performance impact on submission | Run similarity check async, show results after |
| Vector index not optimized       | Add index on vectors table if needed           |

---

## Conclusion

This feature adds high value with low implementation effort by leveraging existing infrastructure. It addresses a real user need (avoiding duplicates) and differentiates IdeaFlow from basic planning tools.

---

_This expansion was identified by CMZ Agent following the ULW-Loop protocol._
