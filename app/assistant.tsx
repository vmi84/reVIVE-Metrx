import { useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAssistantStore, ChatMessage } from '../store/assistant-store';
import { sendAssistantMessage } from '../lib/ai/assistant';
import { ChatBubble, TypingIndicator } from '../components/assistant/ChatBubble';
import { ChatInput } from '../components/assistant/ChatInput';
import { ThemedText } from '../components/ui/ThemedText';
import { COLORS } from '../lib/utils/constants';

export default function Assistant() {
  const messages = useAssistantStore((s) => s.messages);
  const loading = useAssistantStore((s) => s.loading);
  const error = useAssistantStore((s) => s.error);
  const addMessage = useAssistantStore((s) => s.addMessage);
  const setLoading = useAssistantStore((s) => s.setLoading);
  const setError = useAssistantStore((s) => s.setError);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(
    async (text: string) => {
      addMessage('user', text);
      setLoading(true);
      setError(null);

      try {
        // Get the latest messages including the one we just added
        const currentMessages = useAssistantStore.getState().messages;
        const reply = await sendAssistantMessage(currentMessages);
        addMessage('assistant', reply);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to get response';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [addMessage, setLoading, setError],
  );

  const handleRetry = useCallback(() => {
    // Retry the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove the error and re-send
      setError(null);
      setLoading(true);
      (async () => {
        try {
          const currentMessages = useAssistantStore.getState().messages;
          const reply = await sendAssistantMessage(currentMessages);
          addMessage('assistant', reply);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to get response';
          setError(msg);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [messages, addMessage, setLoading, setError]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="subtitle" style={styles.headerTitle}>
            Recovery Assistant
          </ThemedText>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <ThemedText variant="body" color={COLORS.primary}>
              Done
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        {/* Error message with retry */}
        {error && (
          <View style={styles.errorRow}>
            <ThemedText variant="caption" color={COLORS.error} style={styles.errorText}>
              Something went wrong.
            </ThemedText>
            <TouchableOpacity onPress={handleRetry}>
              <ThemedText variant="caption" color={COLORS.primary}>
                Retry
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={loading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  messageList: {
    paddingVertical: 12,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
  },
});
