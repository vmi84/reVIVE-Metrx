import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { ChatMessage } from '../../store/assistant-store';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <ThemedText
          variant="body"
          color={isUser ? '#FFFFFF' : COLORS.text}
          style={styles.text}
        >
          {message.content}
        </ThemedText>
      </View>
    </View>
  );
}

export function TypingIndicator() {
  return (
    <View style={[styles.row, styles.rowAssistant]}>
      <View style={[styles.bubble, styles.bubbleAssistant]}>
        <ThemedText variant="body" color={COLORS.textMuted} style={styles.text}>
          ···
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
});
