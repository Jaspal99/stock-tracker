import {
  Compass,
  House,
  Sparkles,
  WalletCards,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { AppTab } from '@/types';

const tabs = [
  { id: 'home' as const, label: 'Home', Icon: House },
  { id: 'memes' as const, label: 'Memes', Icon: Sparkles },
  { id: 'discover' as const, label: 'Discover', Icon: Compass },
  { id: 'portfolio' as const, label: 'Account', Icon: WalletCards },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <View className="flex-row border-t border-line bg-[#080E1D] px-3 pb-2 pt-3">
      {tabs.map(({ id, label, Icon }) => {
        const selected = active === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            className="flex-1 items-center gap-1"
          >
            <Icon
              size={23}
              color={selected ? '#1FE888' : '#7E8BA3'}
              strokeWidth={selected ? 2.6 : 2}
            />
            <Text
              className={`text-[11px] font-semibold ${
                selected ? 'text-chad' : 'text-muted'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
