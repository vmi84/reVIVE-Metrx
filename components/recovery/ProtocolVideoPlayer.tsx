import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface ProtocolVideoPlayerProps {
  videoUrl: string | null;
  protocolName: string;
}

export function ProtocolVideoPlayer({ videoUrl, protocolName }: ProtocolVideoPlayerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePlayPress() {
    if (!videoUrl) return;

    Alert.alert(
      'Watch Demo Video',
      `View demonstration for ${protocolName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Watch',
          onPress: () => {
            setShowVideo(true);
            setLoading(true);
          },
        },
      ],
    );
  }

  if (!videoUrl) {
    return (
      <View style={styles.placeholder}>
        <ThemedText style={styles.placeholderIcon}>🎬</ThemedText>
        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.placeholderText}>
          No demo video available for this protocol
        </ThemedText>
      </View>
    );
  }

  if (!showVideo) {
    return (
      <TouchableOpacity onPress={handlePlayPress} activeOpacity={0.8} style={styles.posterContainer}>
        <View style={styles.poster}>
          <View style={styles.playButtonCircle}>
            <ThemedText style={styles.playIcon}>▶</ThemedText>
          </View>
          <ThemedText variant="body" color="#fff" style={styles.watchLabel}>
            Watch Demo Video
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  }

  // Detect YouTube URLs and use iframe embed; otherwise fall back to HTML5 video
  const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);

  const videoHtml = youtubeMatch
    ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; overflow: hidden; }
        iframe { width: 100%; height: 100vh; border: none; }
      </style>
    </head>
    <body>
      <iframe
        src="https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&playsinline=1&rel=0"
        allow="autoplay; encrypted-media; fullscreen"
        allowfullscreen
      ></iframe>
    </body>
    </html>
  `
    : `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
        video { width: 100%; max-height: 100vh; object-fit: contain; }
      </style>
    </head>
    <body>
      <video controls autoplay playsinline>
        <source src="${videoUrl}" type="video/mp4">
      </video>
    </body>
    </html>
  `;

  return (
    <View style={styles.videoContainer}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.loadingText}>
            Loading video...
          </ThemedText>
        </View>
      )}
      <WebView
        source={{ html: videoHtml }}
        style={styles.video}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={() => setLoading(false)}
        scrollEnabled={false}
        javaScriptEnabled
      />
      <TouchableOpacity onPress={() => setShowVideo(false)} style={styles.closeButton}>
        <ThemedText variant="caption" color={COLORS.primary} style={styles.closeText}>
          Close Video
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  posterContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  poster: {
    backgroundColor: '#1A1A2E',
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 4,
  },
  watchLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    height: 220,
  },
  loadingText: {
    marginTop: 8,
  },
  closeButton: {
    alignSelf: 'center',
    padding: 10,
  },
  closeText: {
    fontWeight: '600',
  },
  placeholder: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    fontSize: 28,
  },
  placeholderText: {
    textAlign: 'center',
  },
});
