import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { TokenAvatar } from '@/components/TokenAvatar';
import type { Token, TradeSide } from '@/types';
import { formatCurrency } from '@/utils/format';

const QUICK_AMOUNTS = [10, 50, 100];

export function TradeSheet({
  visible,
  token,
  initialSide = 'buy',
  onClose,
  onSubmit,
}: {
  visible: boolean;
  token: Token | null;
  initialSide?: TradeSide;
  onClose: () => void;
  onSubmit: (side: TradeSide, amount: number) => Promise<void>;
}) {
  const [side, setSide] = useState<TradeSide>(initialSide);
  const [amount, setAmount] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSide(initialSide);
  }, [initialSide, visible]);

  if (!token) return null;

  const numericAmount = Number(amount);
  const quantity =
    numericAmount > 0 ? numericAmount / Math.max(token.priceUsd, 0.000000001) : 0;

  async function submit() {
    if (!numericAmount || numericAmount <= 0) return;
    setSubmitting(true);
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
      await onSubmit(side, numericAmount);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-[32px] border-t border-line bg-panel px-5 pb-10 pt-4">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TokenAvatar
                symbol={token.symbol}
                image={token.image}
                size={42}
              />
              <View>
                <Text className="text-lg font-bold text-ink">
                  Trade {token.symbol}
                </Text>
                <Text className="text-sm text-muted">
                  {formatCurrency(token.priceUsd)}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-panelSoft"
            >
              <X size={20} color="#F8FAFC" />
            </Pressable>
          </View>

          <View className="mb-5 flex-row rounded-2xl bg-canvas p-1">
            {(['buy', 'sell'] as const).map((value) => (
              <Pressable
                key={value}
                onPress={() => setSide(value)}
                className={`flex-1 rounded-xl py-3 ${
                  side === value
                    ? value === 'buy'
                      ? 'bg-chad'
                      : 'bg-danger'
                    : ''
                }`}
              >
                <Text
                  className={`text-center font-bold capitalize ${
                    side === value ? 'text-canvas' : 'text-muted'
                  }`}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-2 text-sm font-semibold text-muted">
            Amount in USD
          </Text>
          <View className="mb-4 flex-row items-center rounded-2xl border border-line bg-canvas px-4">
            <Text className="text-2xl font-bold text-muted">$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#526078"
              className="flex-1 py-4 text-3xl font-black text-ink"
            />
          </View>

          <View className="mb-5 flex-row gap-2">
            {QUICK_AMOUNTS.map((value) => (
              <Pressable
                key={value}
                onPress={() => setAmount(String(value))}
                className="flex-1 rounded-xl bg-panelSoft py-3"
              >
                <Text className="text-center font-bold text-ink">${value}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mb-5 flex-row justify-between rounded-2xl bg-canvas px-4 py-3">
            <Text className="text-sm text-muted">Estimated amount</Text>
            <Text className="text-sm font-bold text-ink">
              {quantity.toLocaleString('en-US', {
                maximumFractionDigits: 4,
              })}{' '}
              {token.symbol}
            </Text>
          </View>

          <Text className="mb-3 text-center text-xs text-muted">
            Safe preview mode · trades are stored locally and never broadcast.
          </Text>
          <Pressable
            disabled={submitting || !numericAmount}
            onPress={submit}
            className={`items-center rounded-2xl py-4 ${
              side === 'buy' ? 'bg-chad' : 'bg-danger'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#020817" />
            ) : (
              <Text className="text-base font-black capitalize text-canvas">
                {side} {token.symbol}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
