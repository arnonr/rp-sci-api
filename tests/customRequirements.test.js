require('dotenv').config();

// Mock Prisma client to avoid real DB calls in testing
const mockPaperTypeFindFirst = jest.fn();
const mockPaperTypeCreate = jest.fn();
const mockPaperKindFindFirst = jest.fn();
const mockPaperKindCreate = jest.fn();
const mockPersonalTypeFindFirst = jest.fn();
const mockConditionFindFirst = jest.fn();
const mockConditionCreate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      paper_type: {
        findFirst: mockPaperTypeFindFirst,
        create: mockPaperTypeCreate,
      },
      paper_kind: {
        findFirst: mockPaperKindFindFirst,
        create: mockPaperKindCreate,
      },
      personal_type: {
        findFirst: mockPersonalTypeFindFirst,
      },
      condition: {
        findFirst: mockConditionFindFirst,
        create: mockConditionCreate,
      },
    })),
  };
});

const { initDatabase } = require('../utils/initDatabase');

describe('Database Master Data Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates paper_type, paper_kind, and conditions if not exist', async () => {
    // Mock no existing data for paper_type and paper_kind
    mockPaperTypeFindFirst.mockResolvedValue(null);
    mockPaperKindFindFirst.mockResolvedValue(null);
    
    // Mock personal types matching 'วิชาการ' and 'สนับสนุน'
    mockPersonalTypeFindFirst
      .mockResolvedValueOnce({ id: 1, name: 'สายวิชาการ' }) // First call for academic
      .mockResolvedValueOnce({ id: 2, name: 'สายสนับสนุนวิชาการ' }); // Second call for support

    // Mock no existing conditions
    mockConditionFindFirst.mockResolvedValue(null);

    await initDatabase();

    // Verify paper_type check and creation
    expect(mockPaperTypeFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: 'โครงการวิจัยบูรณาการระหว่างสาขา', deleted_at: null } })
    );
    expect(mockPaperTypeCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: 'โครงการวิจัยบูรณาการระหว่างสาขา', is_active: 1 } })
    );

    // Verify paper_kind check and creation
    expect(mockPaperKindFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: 'ผสมผสาน', deleted_at: null } })
    );
    expect(mockPaperKindCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: 'ผสมผสาน', is_active: 1 } })
    );

    // Verify condition check and creation for both academic and support
    expect(mockConditionCreate).toHaveBeenCalledTimes(2);
    expect(mockConditionCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          personal_type_id: 1,
          is_active: 1,
        }),
      })
    );
    expect(mockConditionCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          personal_type_id: 2,
          is_active: 1,
        }),
      })
    );
  });

  test('does not duplicate if already exist', async () => {
    mockPaperTypeFindFirst.mockResolvedValue({ id: 10, name: 'โครงการวิจัยบูรณาการระหว่างสาขา' });
    mockPaperKindFindFirst.mockResolvedValue({ id: 20, name: 'ผสมผสาน' });
    mockPersonalTypeFindFirst
      .mockResolvedValueOnce({ id: 1, name: 'สายวิชาการ' })
      .mockResolvedValueOnce({ id: 2, name: 'สายสนับสนุนวิชาการ' });

    mockConditionFindFirst.mockResolvedValue({ id: 30 }); // condition exists

    await initDatabase();

    expect(mockPaperTypeCreate).not.toHaveBeenCalled();
    expect(mockPaperKindCreate).not.toHaveBeenCalled();
    expect(mockConditionCreate).not.toHaveBeenCalled();
  });
});

describe('Project Code Prefix Year Configuration', () => {
  test('RUNNING_YEAR is configured to 70', () => {
    expect(process.env.RUNNING_YEAR).toBe('70');
  });
});
