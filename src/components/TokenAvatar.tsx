import { Image, Text, View } from 'react-native';

import { tokenColor } from '@/utils/format';

export function TokenAvatar({
  symbol,
  image,
  size = 46,
}: {
  symbol: string;
  image?: string;
  size?: number;
}) {
  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="bg-panelSoft"
      />
    );
  }

  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tokenColor(symbol),
      }}
    >
      <Text className="font-black text-canvas">
        {symbol.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}
