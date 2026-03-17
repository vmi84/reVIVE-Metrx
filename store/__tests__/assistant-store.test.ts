import { useAssistantStore } from '../assistant-store';

describe('useAssistantStore', () => {
  beforeEach(() => {
    useAssistantStore.getState().clearMessages();
  });

  it('initializes with a welcome message', () => {
    const { messages } = useAssistantStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('assistant');
    expect(messages[0].id).toBe('msg_welcome');
    expect(messages[0].content).toContain('recovery assistant');
  });

  it('adds a user message', () => {
    useAssistantStore.getState().addMessage('user', 'What is my IACI score?');
    const { messages } = useAssistantStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toBe('What is my IACI score?');
    expect(messages[1].id).toMatch(/^msg_/);
    expect(messages[1].timestamp).toBeGreaterThan(0);
  });

  it('adds an assistant message', () => {
    useAssistantStore.getState().addMessage('assistant', 'Your IACI score is 72.');
    const { messages } = useAssistantStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[1].role).toBe('assistant');
  });

  it('preserves message order', () => {
    const store = useAssistantStore.getState();
    store.addMessage('user', 'Question 1');
    store.addMessage('assistant', 'Answer 1');
    store.addMessage('user', 'Question 2');

    const { messages } = useAssistantStore.getState();
    expect(messages).toHaveLength(4); // welcome + 3
    expect(messages.map((m) => m.role)).toEqual(['assistant', 'user', 'assistant', 'user']);
  });

  it('sets loading state', () => {
    useAssistantStore.getState().setLoading(true);
    expect(useAssistantStore.getState().loading).toBe(true);

    useAssistantStore.getState().setLoading(false);
    expect(useAssistantStore.getState().loading).toBe(false);
  });

  it('sets error state', () => {
    useAssistantStore.getState().setError('Network error');
    expect(useAssistantStore.getState().error).toBe('Network error');
  });

  it('clears error when adding a message', () => {
    useAssistantStore.getState().setError('Some error');
    useAssistantStore.getState().addMessage('user', 'New message');
    expect(useAssistantStore.getState().error).toBeNull();
  });

  it('clearMessages resets to welcome message only', () => {
    const store = useAssistantStore.getState();
    store.addMessage('user', 'Test');
    store.addMessage('assistant', 'Response');
    store.setError('Error');

    store.clearMessages();
    const state = useAssistantStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].id).toBe('msg_welcome');
    expect(state.error).toBeNull();
  });

  it('generates unique message IDs', () => {
    const store = useAssistantStore.getState();
    store.addMessage('user', 'Msg 1');
    store.addMessage('user', 'Msg 2');
    store.addMessage('user', 'Msg 3');

    const ids = useAssistantStore.getState().messages.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
