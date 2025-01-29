import { NobsWeather } from "@/types/NobsWeather";
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, Line, G, Text as SvgText, Path } from "react-native-svg";
// import SvgImage from "react-native-svg/lib/typescript/elements/Image";
import { Image as SvgImage } from "react-native-svg";

interface WeatherWheelProps {
  data: NobsWeather;
}

const WeatherWheel: React.FC<WeatherWheelProps> = ({ data }) => {
  const size = 180; // Diameter of wheel: min-width of 180px, max-width of 360px
  const center = size / 2;
  const radius = size / 2 - 20;

  console.log(data);

  const createSlicePath = (startAngle: number, endAngle: number) => {
    const startX = center + radius * Math.cos(startAngle);
    const startY = center + radius * Math.sin(startAngle);
    const endX = center + radius * Math.cos(endAngle);
    const endY = center + radius * Math.sin(endAngle);

    return `
      M ${center},${center}
      L ${startX},${startY}
      A ${radius},${radius} 0 0,1 ${endX},${endY}
      Z
    `;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.name}</Text>
      <Svg width={size} height={size}>
        <G transform={`rotate(45, ${center}, ${center})`}>
          {/* Outer Circle */}
          {/* <Circle cx={center} cy={center} r={radius} stroke="black" strokeWidth={2} fill="none" /> */}

          {/* North */}
          <Path
            d={createSlicePath(-Math.PI, -Math.PI / 2)}
            fill="white"
            // fill="rgba(0, 145, 255, 0.2)"
          />
          {/* NE */}
          <Path d={createSlicePath(-Math.PI / 2, -Math.PI / 4)} fill="rgba(255, 0, 0, 0.2)" />
          {/* SE */}
          <Path d={createSlicePath(-Math.PI / 4, 0)} fill="rgba(0, 255, 0, 0.2)" />
          {/* South */}
          <Path
            d={createSlicePath(0, Math.PI / 2)} // South
            // fill="rgba(0, 145, 255, 0.2)"
            fill="white"
          />
          {/* SW */}
          <Path
            d={createSlicePath(Math.PI / 2, (3 * Math.PI) / 4)} // SW
            fill="rgba(255, 0, 255, 0.2)"
          />
          {/* NW */}
          <Path
            d={createSlicePath((3 * Math.PI) / 4, Math.PI)} // NW
            fill="rgba(0, 255, 255, 0.2)"
          />

          {/* Vertical Divider */}
          <Line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="black" strokeWidth={1} />

          {/* Horizontal Divider */}
          <Line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="black" strokeWidth={1} />

          {/* East Quarter Divider */}
          <Line x1={center} y1={center} x2={center + radius * Math.cos(Math.PI / 4)} y2={center - radius * Math.sin(Math.PI / 4)} stroke="black" strokeWidth={1} />

          {/* West Quarter Divider */}
          <Line x1={center} y1={center} x2={center - radius * Math.cos(Math.PI / 4)} y2={center + radius * Math.sin(Math.PI / 4)} stroke="black" strokeWidth={1} />

          {/* Thicken 'next 3 hour' lines pointing Northeast and Southeast */}
          <Line x1={center} y1={center} x2={center + radius} y2={center} stroke="black" strokeWidth={3} />
          <Line x1={center} y1={center} x2={center} y2={center - radius} stroke="black" strokeWidth={3} />
        </G>
        <SvgImage
          x={center - 32} // Center the image horizontally
          y={center - radius / 2 - 32} // Position vertically at the North slice
          width={64} // Icon width
          height={64} // Icon height
          href={{ uri: `https:${data.icon}` }} // Add 'https:' to the icon URL
        />
        ;{/* NE Slice */}
        <SvgText x={center + center / 2} y={center - radius / 6} fontSize={18} textAnchor="middle" fill="black">
          {data.nextTemp}°
        </SvgText>
        {/* SE Slice */}
        <SvgText x={center + center / 2} y={center + radius / 3} fontSize={18} textAnchor="middle" fill="black">
          {data.nextUV}
        </SvgText>
        {/* NW Slice */}
        <SvgText x={center / 2} y={center - radius / 6} fontSize={21} textAnchor="middle" fill="black">
          {data.aqi}
        </SvgText>
        {/* South Slice */}
        <SvgText x={center} y={center + radius / 2 + 15} fontSize={24} textAnchor="middle" fill="black">
          {data.temp}°
        </SvgText>
        {/* SW Slice */}
        <SvgText x={center / 2} y={center + radius / 3} fontSize={21} textAnchor="middle" fill="black">
          {data.uv}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontFamily: "SixtyfourConvergence-Regular",
  },
});

export default WeatherWheel;
