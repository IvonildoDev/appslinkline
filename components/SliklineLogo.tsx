import * as React from 'react';
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';

export default function SliklineLogo({ size = 100 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Fundo azul */}
      <Rect x="0" y="0" width="100" height="100" rx="20" fill="#2563eb" />
      {/* Círculo cinza */}
      <Circle cx="50" cy="50" r="30" fill="#6b7280" />
      {/* Texto SLK */}
      <SvgText
        x="50"
        y="58"
        fontSize="28"
        fontWeight="bold"
        fill="#fff"
        textAnchor="middle"
      >
        SLK
      </SvgText>
    </Svg>
  );
}
