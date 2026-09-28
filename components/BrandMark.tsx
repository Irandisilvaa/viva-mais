import { Image, ImageStyle, StyleProp } from 'react-native';

type BrandMarkProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandMark({ size = 38, style }: BrandMarkProps) {
  return (
    <Image
      source={require('@/assets/brand/viva-mais-mark.png')}
      style={[
        {
          width: size,
          height: size,
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  );
}
