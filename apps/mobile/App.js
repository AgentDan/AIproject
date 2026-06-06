/**
 * Mobile mirror of apps/client MVP: visuals, POST /api/commands, list commands, dismiss AI Response by tapping outside.
 * No Web SpeechRecognition — same behavior as browsers without speech (text input + FAB).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const WINDOW = Dimensions.get('window');

const DEFAULT_API =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

const SLATE_950 = '#020617';

function CommandTypeRows({ commands = [] }) {
  if (!Array.isArray(commands) || commands.length === 0) {
    return <Text style={styles.helpEmpty}>No commands returned.</Text>;
  }

  return commands.map((typeLabel, idx) => (
    <View key={`${typeLabel}-${idx}`} style={styles.intentChip}>
      <Text style={styles.intentChipText}>{typeLabel}</Text>
    </View>
  ));
}

function PreviewStage({ previewObject }) {
  const previewX = (previewObject?.transform?.position?.x || 0) * 90;
  const previewY = -(previewObject?.transform?.position?.y || 0) * 90;
  const previewColor = previewObject?.material?.color;
  const S = Math.min(WINDOW.width, WINDOW.height) * 0.7;
  const cap = Math.min(S, 620);
  const cyanTranslate = [{ translateX: previewX }, { translateY: previewY }];

  return (
    <View style={[styles.stageHost, { width: cap, height: cap }]}>
      <View style={[styles.stageGlowBase, { width: cap * 0.76, bottom: cap * 0.12 }]} />

      <View
        style={[
          styles.previewCyan,
          {
            left: cap * 0.25,
            top: cap * 0.22,
            width: cap * 0.34,
            height: cap * 0.34,
            borderRadius: cap * 0.067,
            borderWidth: 1,
            borderColor: previewColor ? 'rgba(207,250,254,0.55)' : 'rgba(207,250,254,0.45)',
            backgroundColor: previewColor ? `${previewColor}42` : 'rgba(103,232,249,0.15)',
            transform: [...cyanTranslate, { rotate: '12deg' }]
          }
        ]}
      />

      <View
        style={[styles.previewViolet, {
          right: cap * 0.2,
          top: cap * 0.34,
          width: cap * 0.27,
          height: cap * 0.27
        }]}
      />

      <View
        style={[styles.previewEmerald, {
          bottom: cap * 0.22,
          width: cap * 0.58,
          height: cap * 0.18,
          alignSelf: 'center'
        }]}
      />
    </View>
  );
}

function ClientApp() {
  const insets = useSafeAreaInsets();
  const [command, setCommand] = useState('');
  const canUseSpeech = false;
  const [latestPayload, setLatestPayload] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening] = useState(false);
  const [serverNotice, setServerNotice] = useState(null);
  const textInputRef = useRef(null);

  const showCommandField =
    !canUseSpeech || isListening || (isSubmitting && false);

  const sceneResult = latestPayload?.sceneResult ?? null;
  const previewObject = sceneResult?.previewUpdate?.objects?.[0];

  const noticeCardW = Math.min(WINDOW.width * 0.88, 640);
  const noticeMaxHHelp = Math.min(WINDOW.height * 0.78, 560);

  useEffect(() => {
    if (!showCommandField) {
      return undefined;
    }
    const t = requestAnimationFrame(() => textInputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [showCommandField]);

  async function sendCommandText(commandText) {
    const trimmedCommand = commandText.trim();
    if (!trimmedCommand) {
      setError('Enter a text command or provide a voice command transcript.');
      setServerNotice({
        type: 'error',
        message: canUseSpeech
          ? 'Use the round button: when empty, speak; when there is text, send.'
          : 'Type a command, then press Enter or the round send button.'
      });
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const apiResponse = await fetch(`${DEFAULT_API}/api/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: trimmedCommand,
          inputType: 'text',
          clientState: { source: 'apps/mobile', previewMode: 'fullscreen-mvp' }
        })
      });
      const payload = await apiResponse.json();
      if (!apiResponse.ok) {
        throw new Error(payload.message || 'Command request failed.');
      }
      setLatestPayload(payload);
      const commandList = payload?.data?.commands;
      if (Array.isArray(commandList)) {
        setServerNotice({
          type: 'success',
          responseType: 'command_list',
          message:
            (payload.explanation && String(payload.explanation).trim()) ||
            (payload.message && String(payload.message).trim()) ||
            'Available commands.',
          commandList
        });
      } else if (payload?.data?.kind === 'unknown') {
        setServerNotice({
          type: 'success',
          message:
            payload.data?.message ||
            payload.message ||
            'Command not recognized.'
        });
      } else {
        setServerNotice({
          type: 'success',
          responseType: payload.responseType,
          message: payload.explanation || 'The server processed the command.',
          intent: payload.aiServices?.actionPlan?.intent,
          resultStatus: payload.sceneResult?.status
        });
      }
      setCommand('');
    } catch (e) {
      setError(e.message);
      setServerNotice({ type: 'error', message: e.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRoundCommandButton() {
    if (isSubmitting) {
      return;
    }
    sendCommandText(command);
  }

  const roundDisabled = isSubmitting || !command.trim();
  const isCommandList =
    serverNotice?.responseType === 'command_list' ||
    (Array.isArray(serverNotice?.commandList) && serverNotice.commandList.length > 0);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(34,211,238,0.22)', 'rgba(15,23,42,0.26)', SLATE_950]}
        locations={[0, 0.34, 1]}
        start={{ x: 0.5, y: 0.48 }}
        end={{ x: 0.52, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.gridHint} />

      <View style={styles.centerPiece}>
        <PreviewStage previewObject={previewObject} />
      </View>

      {serverNotice ?
        <>
          <Pressable
            style={styles.noticeBackdrop}
            onPress={() => setServerNotice(null)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss response"
          />
          <View pointerEvents="box-none" style={[styles.noticeCardWrap, { top: WINDOW.height * 0.06 + insets.top * 0.5 }]}>
            <View
              style={[
                styles.noticeBlur,
                { width: noticeCardW },
                serverNotice && isCommandList ? { maxHeight: noticeMaxHHelp } : null
              ]}
            >
              <View style={styles.noticeRow}>
                <View
                  style={[
                    styles.noticeLed,
                    { backgroundColor: serverNotice.type === 'error' ? '#fca5a5' : '#86efac' }
                  ]}
                />
                <View style={styles.noticeRight}>
                  <Text style={styles.noticeKicker}>AI Response</Text>
                  <Text style={styles.noticeBody}>{serverNotice.message}</Text>
                  {isCommandList ?
                    <ScrollView
                      style={styles.helpScrollOuter}
                      contentContainerStyle={styles.helpScrollInner}
                      showsVerticalScrollIndicator
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                    >
                      <CommandTypeRows commands={serverNotice.commandList} />
                    </ScrollView>
                  : null}

                  <View style={[styles.chipBar, isCommandList && styles.chipBarHelp]}>
                    {isCommandList ?
                      <View style={styles.chip}>
                        <Text style={styles.chipTxt}>list commands</Text>
                      </View>
                    : null}
                    {!isCommandList && serverNotice.intent ?
                      <View style={styles.chip}>
                        <Text style={styles.chipTxt}>{serverNotice.intent}</Text>
                      </View>
                    : null}
                    {!isCommandList && serverNotice.resultStatus ?
                      <View style={styles.chip}>
                        <Text style={styles.chipTxt}>{String(serverNotice.resultStatus)}</Text>
                      </View>
                    : null}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </>
      : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.commandDock,
          { bottom: Math.max(insets.bottom, 12) + 8, paddingHorizontal: WINDOW.width * 0.04 }
        ]}
      >
        <View
          style={[
            styles.commandBarOuter,
            showCommandField ? styles.commandBarOuterExpanded : styles.commandBarOuterMini
          ]}
        >
          {showCommandField ?
            <>
              <View
                style={[
                  styles.voiceLed,
                  { backgroundColor: isListening ? 'rgba(110,231,183,0.9)' : 'rgba(255,255,255,0.35)' }
                ]}
              />
              <TextInput
                ref={textInputRef}
                style={styles.commandInput}
                value={command}
                onChangeText={setCommand}
                placeholder="Type command"
                placeholderTextColor="rgba(255,255,255,0.35)"
                returnKeyType="send"
                onSubmitEditing={handleRoundCommandButton}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          : null}
          <Pressable
            onPress={handleRoundCommandButton}
            disabled={roundDisabled}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.roundBtnPressed,
              isListening && styles.roundBtnListen,
              command.trim() ? styles.roundBtnSend : styles.roundBtnIdle,
              roundDisabled && styles.roundBtnDisabled
            ]}
            accessibilityRole="button"
          >
            <View style={styles.roundBtnInner}>
              {isSubmitting ?
                <ActivityIndicator color="#0f172a" size="small" />
              : <Text style={styles.roundBtnGlyph}>{isListening ? '…' : '●'}</Text>}
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {error ?
        <View style={[styles.errorBanner, { top: Math.max(insets.top, 10) + 6, left: 22 }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ClientApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SLATE_950
  },
  gridHint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02
  },
  centerPiece: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },

  stageHost: {
    position: 'relative',
    overflow: 'visible'
  },
  stageGlowBase: {
    position: 'absolute',
    alignSelf: 'center',
    left: '12%',
    height: 96,
    borderRadius: 999,
    backgroundColor: 'rgba(34,211,238,0.1)'
  },

  previewCyan: {
    position: 'absolute',
    borderRadius: 28,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  previewViolet: {
    position: 'absolute',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.4)',
    backgroundColor: 'rgba(167,139,250,0.15)',
    transform: [{ rotate: '-6deg' }],
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6
  },
  previewEmerald: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167,243,208,0.3)',
    backgroundColor: 'rgba(110,231,183,0.1)'
  },

  noticeBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40
  },
  noticeCardWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    elevation: 12
  },
  noticeBlur: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(15,23,42,0.78)',
    paddingHorizontal: 24,
    paddingVertical: 20
  },
  noticeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  noticeLed: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4
  },
  noticeRight: { flex: 1, minHeight: 0 },
  noticeKicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)'
  },
  noticeBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)'
  },

  helpScrollOuter: {
    flexGrow: 0,
    maxHeight: 320,
    marginTop: 12
  },
  helpScrollInner: {
    paddingRight: 4,
    paddingBottom: 4
  },
  helpEmpty: { marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  intentChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6
  },
  intentChipText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(167,243,208,0.95)'
  },

  chipBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    paddingTop: 4
  },
  chipBarHelp: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  chipTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.78)' },

  commandDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 60,
    elevation: 20
  },
  commandBarOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.36)',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16
  },
  commandBarOuterExpanded: {
    width: Math.min(WINDOW.width * 0.92, 520),
    paddingHorizontal: 12,
    gap: 8
  },
  commandBarOuterMini: {
    paddingHorizontal: 4
  },
  voiceLed: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginLeft: 2
  },
  commandInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    fontSize: 14,
    color: '#fff'
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  roundBtnInner: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  roundBtnPressed: { opacity: 0.94, transform: [{ scale: 0.98 }] },
  roundBtnIdle: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  roundBtnSend: {
    borderColor: 'rgba(52,211,153,0.55)',
    backgroundColor: 'rgba(16,185,129,0.25)'
  },
  roundBtnListen: {
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.65)'
  },
  roundBtnDisabled: {
    opacity: 0.55
  },
  roundBtnGlyph: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0f172a'
  },

  errorBanner: {
    position: 'absolute',
    zIndex: 55,
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 12
  },
  errorText: {
    fontSize: 13,
    color: '#fecaca'
  }
});
