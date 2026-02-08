
process.env.OPENAI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

jest.mock('@/lib/db', () => ({
  dbService: {
    getIdea: jest.fn(),
    getIdeaDeliverablesWithTasks: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
}));

import { GET } from '@/app/api/ideas/[id]/tasks/route';
import { dbService } from '@/lib/db';

describe('/api/ideas/[id]/tasks GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with task hours summary', async () => {
    const ideaId = 'idea-123';
    const mockIdea = { id: ideaId, user_id: 'test-user-id' };
    const mockDeliverablesWithTasks = [
      {
        id: 'del-1',
        title: 'Deliverable 1',
        tasks: [
          { id: 'task-1', status: 'completed', estimate: 5 },
          { id: 'task-2', status: 'todo', estimate: 3 },
        ],
      },
      {
        id: 'del-2',
        title: 'Deliverable 2',
        tasks: [
          { id: 'task-3', status: 'completed', estimate: 2 },
        ],
      },
    ];

    (dbService.getIdea as jest.Mock).mockResolvedValue(mockIdea);
    (dbService.getIdeaDeliverablesWithTasks as jest.Mock).mockResolvedValue(mockDeliverablesWithTasks);

    const request = new Request(`http://localhost/api/ideas/${ideaId}/tasks`);
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.summary).toEqual({
      totalDeliverables: 2,
      totalTasks: 3,
      completedTasks: 2,
      totalHours: 10,
      completedHours: 7,
      overallProgress: 67, // Math.round((2/3)*100)
    });
  });

  it('should handle zero tasks correctly', async () => {
    const ideaId = 'idea-456';
    const mockIdea = { id: ideaId, user_id: 'test-user-id' };
    const mockDeliverablesWithTasks = [
      {
        id: 'del-1',
        title: 'Deliverable 1',
        tasks: [],
      },
    ];

    (dbService.getIdea as jest.Mock).mockResolvedValue(mockIdea);
    (dbService.getIdeaDeliverablesWithTasks as jest.Mock).mockResolvedValue(mockDeliverablesWithTasks);

    const request = new Request(`http://localhost/api/ideas/${ideaId}/tasks`);
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.summary.totalHours).toBe(0);
    expect(data.data.summary.completedHours).toBe(0);
    expect(data.data.summary.overallProgress).toBe(0);
  });
});
