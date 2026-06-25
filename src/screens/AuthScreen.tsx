import { LinearGradient } from 'expo-linear-gradient';
import { Apple, ArrowRight, Globe2 } from 'lucide-react-native';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthScreen({
  onGoogle,
  onApple,
  onPreview,
  loading,
  previewMode,
}: {
  onGoogle: () => void;
  onApple: () => void;
  onPreview: () => void;
  loading: boolean;
  previewMode: boolean;
}) {
  return (
    <LinearGradient
      colors={['#020817', '#07162D', '#0C2035']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-1 items-center justify-center">
          <View className="mb-7 h-28 w-28 items-center justify-center overflow-hidden rounded-[32px] border border-line bg-black">
            <Image
              source={require('../../reference-assets/logo/dark.png')}
              className="h-24 w-24"
              resizeMode="contain"
            />
          </View>
          <Text className="text-center text-5xl font-black tracking-tight text-ink">
            Chad Trader
          </Text>
          <Text className="mt-4 max-w-[320px] text-center text-base leading-6 text-muted">
            Find momentum early, research Solana tokens, and trade without
            leaving the app.
          </Text>

          <View className="mt-12 w-full gap-3">
            <Pressable
              disabled={loading}
              onPress={onGoogle}
              className="flex-row items-center justify-center gap-3 rounded-2xl bg-white py-4"
            >
              <Globe2 size={21} color="#020817" />
              <Text className="text-base font-bold text-canvas">
                Continue with Google
              </Text>
            </Pressable>
            <Pressable
              disabled={loading}
              onPress={onApple}
              className="flex-row items-center justify-center gap-3 rounded-2xl border border-line bg-panel py-4"
            >
              <Apple size={22} color="#F8FAFC" fill="#F8FAFC" />
              <Text className="text-base font-bold text-ink">
                Continue with Apple
              </Text>
            </Pressable>

            {previewMode ? (
              <Pressable
                disabled={loading}
                onPress={onPreview}
                className="mt-2 flex-row items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <ActivityIndicator color="#1FE888" />
                ) : (
                  <>
                    <Text className="font-bold text-chad">
                      Open reviewer preview
                    </Text>
                    <ArrowRight size={18} color="#1FE888" />
                  </>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>

        <View className="pb-4">
          <Text className="text-center text-xs leading-5 text-muted">
            Self-custodial Solana wallet powered by Privy. By continuing, you
            agree to the Terms and acknowledge the risks of trading crypto.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
