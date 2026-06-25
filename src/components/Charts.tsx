import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

type ChartProps = {
  values: number[];
  height?: number;
  color?: string;
  filled?: boolean;
};

function makePath(values: number[], width: number, height: number) {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, Math.abs(max) * 0.02, 0.000001);
  const padding = 6;

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y =
        padding + ((max - value) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function LineChart({
  values,
  height = 210,
  color = '#1FE888',
  filled = true,
}: ChartProps) {
  const width = 360;
  const safeValues = values.length > 1 ? values : [0, 0];
  const path = useMemo(
    () => makePath(safeValues, width, height),
    [height, safeValues],
  );
  const areaPath = `${path} L ${width - 6} ${height} L 6 ${height} Z`;

  return (
    <View className="w-full overflow-hidden">
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgLinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.28" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        {filled ? <Path d={areaPath} fill="url(#chartFill)" /> : null}
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={354}
          cy={Math.max(
            6,
            Math.min(
              height - 6,
              Number(path.split(' ').at(-1) ?? height / 2),
            ),
          )}
          r={4}
          fill={color}
        />
      </Svg>
    </View>
  );
}

export function Sparkline({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  return (
    <View className="h-10 w-20">
      <LineChart
        values={values}
        height={40}
        color={positive ? '#1FE888' : '#FF4D47'}
        filled={false}
      />
    </View>
  );
}
