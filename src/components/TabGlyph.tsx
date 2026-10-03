import {
  Text,
} from 'react-native';

export function TabGlyph({
  glyph,
  focused,
}: {
  glyph: string;
  focused: boolean;
}) {

  return (
    <Text
      style={{
        fontSize: 20,
        color: focused
          ? '#208AEF'
          : '#64748B',
      }}
    >
      {glyph}
    </Text>
  );
}