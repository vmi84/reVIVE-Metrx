import { sendAssistantMessage } from '../assistant';
import { ChatMessage } from '../../../store/assistant-store';

// Mock the supabase module to add functions.invoke
jest.mock('../../supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

// Mock the context gatherer
jest.mock('../assistant-context', () => ({
  gatherAssistantContext: jest.fn(() => ({
    iaciScore: 72,
    readinessTier: 'train',
    phenotype: 'Locally Fatigued',
    subsystems: { autonomic: 80, musculoskeletal: 55 },
    penalties: [],
    limiters: ['musculoskeletal'],
    protocolClass: 'B',
    topModalities: ['Yoga', 'Walking'],
    checkinCompleted: true,
    deviceSynced: true,
    deviceSource: 'whoop',
    hrv: 65,
    rhr: 55,
    recoveryScore: 72,
    sleepHours: 7.5,
    sportProfiles: [],
    recentWorkoutCount: 3,
  })),
}));

const { supabase } = require('../../supabase');
const mockInvoke = supabase.functions.invoke as jest.Mock;

function makeMessage(role: 'user' | 'assistant', content: string, id?: string): ChatMessage {
  return {
    id: id ?? `msg_${Date.now()}_${Math.random()}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

describe('sendAssistantMessage', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('sends messages to the assistant-chat edge function', async () => {
    mockInvoke.mockResolvedValue({
      data: { reply: 'Your score is 72.' },
      error: null,
    });

    const messages = [
      makeMessage('assistant', 'Welcome!', 'msg_welcome'),
      makeMessage('user', 'What is my score?'),
    ];

    const reply = await sendAssistantMessage(messages);
    expect(reply).toBe('Your score is 72.');
    expect(mockInvoke).toHaveBeenCalledWith('assistant-chat', {
      body: expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'What is my score?' }),
        ]),
        context: expect.objectContaining({
          iaciScore: 72,
          deviceSource: 'whoop',
        }),
      }),
    });
  });

  it('trims messages to the last 10', async () => {
    mockInvoke.mockResolvedValue({
      data: { reply: 'Response' },
      error: null,
    });

    // Create 15 messages
    const messages: ChatMessage[] = [];
    for (let i = 0; i < 15; i++) {
      messages.push(makeMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`));
    }

    await sendAssistantMessage(messages);

    const sentBody = mockInvoke.mock.calls[0][1].body;
    expect(sentBody.messages).toHaveLength(10);
    // Should be the last 10 messages
    expect(sentBody.messages[0].content).toBe('Message 5');
    expect(sentBody.messages[9].content).toBe('Message 14');
  });

  it('throws on API error', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error('Edge function error'),
    });

    const messages = [makeMessage('user', 'Test')];
    await expect(sendAssistantMessage(messages)).rejects.toThrow('Assistant error');
  });

  it('returns fallback message when reply is empty', async () => {
    mockInvoke.mockResolvedValue({
      data: { reply: null },
      error: null,
    });

    const messages = [makeMessage('user', 'Test')];
    const reply = await sendAssistantMessage(messages);
    expect(reply).toContain('Sorry');
  });

  it('includes device-agnostic context', async () => {
    mockInvoke.mockResolvedValue({
      data: { reply: 'Response' },
      error: null,
    });

    await sendAssistantMessage([makeMessage('user', 'Test')]);

    const sentContext = mockInvoke.mock.calls[0][1].body.context;
    // Verify context uses generic field names, not Whoop-specific
    expect(sentContext).toHaveProperty('hrv');
    expect(sentContext).toHaveProperty('rhr');
    expect(sentContext).toHaveProperty('recoveryScore');
    expect(sentContext).toHaveProperty('deviceSource');
    // No whoop-specific field names in the context keys
    Object.keys(sentContext).forEach((key) => {
      expect(key.toLowerCase()).not.toContain('whoop');
    });
  });
});

describe('sendAssistantMessage offline', () => {
  it('returns offline message when Supabase not configured', async () => {
    // Re-mock with isSupabaseConfigured = false
    jest.resetModules();
    jest.doMock('../../supabase', () => ({
      isSupabaseConfigured: false,
      supabase: { functions: { invoke: jest.fn() } },
    }));
    jest.doMock('../assistant-context', () => ({
      gatherAssistantContext: jest.fn(() => ({})),
    }));

    const { sendAssistantMessage: sendOffline } = require('../assistant');
    const reply = await sendOffline([makeMessage('user', 'Test')]);
    expect(reply).toContain('network connection');
  });
});
