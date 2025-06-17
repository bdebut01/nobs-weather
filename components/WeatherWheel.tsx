import { NobsWeather } from "@/types/NobsWeather";
import { colors } from "@/util/colors";
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, Line, G, Path, RadialGradient, Defs, Stop } from "react-native-svg";
import { Image as SvgImage } from "react-native-svg";

interface WeatherWheelProps {
  data: NobsWeather;
  isPinned?: boolean;
}

const WHEEL_FILL_COLORS = {
  // icon: "#EBE1D5", // tan, shades of soft green blue
  // temp: "#AD9082",
  // uv: "#98A8A2",
  // aqi: "#61788C",
  next: "rgba(0, 0, 0, 0)",
  icon: "#D9ECFF",
  temp: "#9ac1d0",
  uv: "#89a666",
  aqi: "#D9ECFF",
  nextUV: "#2f591c",
  nextTemp: "#4f729a",
  // next: "#2B91AD",
  start: "#ffffff",
  // end: "#69bf9a", // mint green
  end: colors.DEPTH_FOUR,
  // end: "#4e7ba6",
  nextStart: "#ffffff",
  // nextEnd: "#4c5059",
  nextEnd: colors.DEPTH_ZERO,
};

const WeatherWheel: React.FC<WeatherWheelProps> = ({ data, isPinned }) => {
  const size = 170; // Diameter of wheel: min-width of 180px, max-width of 360px
  const center = size / 2;
  const radius = size / 2 - 20;
  const iconSize = 55;

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
    <View style={[styles.container, styles.shadow]}>
      <Svg width={size} height={size}>
        <G transform={`rotate(45, ${center}, ${center})`}>
          {/* Outer Circle */}
          <Defs>
            {/* Radial Gradient for Next Slice */}
            <RadialGradient id="nextGradient" cx="0%" cy="100%" r="150%">
              <Stop offset="0%" stopColor={WHEEL_FILL_COLORS.nextStart} />
              <Stop offset="100%" stopColor={WHEEL_FILL_COLORS.nextEnd} />
            </RadialGradient>

            {/* Radial Gradient for Current Slice */}
            <RadialGradient id="currentGradient" cx="50%" cy="50%" r="80%">
              <Stop offset="0%" stopColor={WHEEL_FILL_COLORS.start} />
              <Stop offset="80%" stopColor={WHEEL_FILL_COLORS.end} />
            </RadialGradient>
          </Defs>

          <Circle cx={center} cy={center} r={radius} stroke="black" strokeWidth={0} fill="black" />

          {/* North: Current Icon */}
          <Path
            d={createSlicePath(-Math.PI, -Math.PI / 2)}
            fill={WHEEL_FILL_COLORS.icon}
            // fill="rgba(0, 145, 255, 0.2)"
          />

          {/* NE: Next Temp */}
          {/* <Path d={createSlicePath(-Math.PI / 2, -Math.PI / 4)} fill={WHEEL_FILL_COLORS.temp} />
          {/* SE: Next UV */}
          {/* <Path d={createSlicePath(-Math.PI / 4, 0)} fill={WHEEL_FILL_COLORS.uv} /> */}
          <Path d={createSlicePath(-Math.PI / 2, -Math.PI / 4)} fill={WHEEL_FILL_COLORS.nextTemp} />
          {/* SE: Next UV */}
          <Path d={createSlicePath(-Math.PI / 4, 0)} fill={WHEEL_FILL_COLORS.nextUV} />
          {/* Next slice overlay (to allow darkening) */}
          {/* <Path d={createSlicePath(-Math.PI / 2, 0)} fill={WHEEL_FILL_COLORS.next} /> */}

          {/* South: Current Temp */}
          {/* <Path
            d={createSlicePath(0, Math.PI / 2)} // South
            fill={WHEEL_FILL_COLORS.temp}
          /> */}
          <Path
            d={createSlicePath(0, Math.PI / 2)} // South
            fill={WHEEL_FILL_COLORS.aqi}
          />

          {/* SW: Current UV */}
          <Path
            d={createSlicePath(Math.PI / 2, (3 * Math.PI) / 4)} // SW
            fill={WHEEL_FILL_COLORS.uv}
          />
          {/* NW: Current AQI */}
          {/* <Path
            d={createSlicePath((3 * Math.PI) / 4, Math.PI)} // NW
            fill={WHEEL_FILL_COLORS.aqi}
          /> */}
          <Path
            d={createSlicePath((3 * Math.PI) / 4, Math.PI)} // NW
            fill={WHEEL_FILL_COLORS.temp}
          />

          <Circle cx={center} cy={center} r={radius} stroke="black" strokeWidth={2} fill="url(#currentGradient)" />

          {/* Mess around with current gradient */}
          <Path
            d={`
              M ${center},${center}
              L ${center + radius * Math.cos(-Math.PI / 2)},${center + radius * Math.sin(-Math.PI / 2)}
              A ${radius},${radius} 0 0,1 ${center + radius * Math.cos(0)},${center + radius * Math.sin(0)}
              A ${radius},${radius} 0 0,1 ${center + radius * Math.cos(Math.PI / 2)},${center + radius * Math.sin(Math.PI / 2)}
              A ${radius},${radius} 0 0,1 ${center + radius * Math.cos(Math.PI)},${center + radius * Math.sin(Math.PI)}
              A ${radius},${radius} 0 0,1 ${center + radius * Math.cos((3 * Math.PI) / 2)},${center + radius * Math.sin((3 * Math.PI) / 2)}
              Z
            `}
            fill={"url(#currentGradient)"}
          />

          <Path d={createSlicePath(-Math.PI / 2, 0)} fill={"url(#nextGradient)"} />

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

        {/* North Slice: Current Icon */}
        <SvgImage
          x={center - iconSize / 2} // Center the image horizontally
          y={center - radius} // Position vertically at the North slice
          width={iconSize}
          height={iconSize}
          href={{ uri: `https:${data.icon}` }} // Add 'https:' to the icon URL
        />

        {/* NE Slice: Next Temperature */}
        <Text
          style={[
            styles.wheelText,
            styles.nextData,
            {
              top: center - radius / 2.6,
              left: center + center / 3.2,
              fontSize: data.nextTemp.toString().length >= 3 ? 15 : 18,
            },
          ]}
        >
          {data.nextTemp}°
        </Text>

        {/* SE Slice: Next UV */}
        <Text style={[styles.wheelText, styles.wheelUV, styles.nextData, { top: center + radius / 6, left: center + center / 2.5 }]}>{data.nextUV}</Text>

        {/* South Slice: AQI */}
        {/* <Text style={[styles.wheelText, { top: center + radius / 2.5, left: center - 15, fontSize: 24 }]}>{data.temp}°</Text> */}
        <Text style={[styles.wheelText, styles.wheelAQI, { top: center + radius / 2.8, left: center - 12, fontSize: 32 }]}>{data.aqi}</Text>

        {/* SW Slice: Current UV */}
        <Text style={[styles.wheelText, styles.wheelUV, { top: center + radius / 6, right: center + center / 2.5 }]}>{data.uv}</Text>

        {/* NW Slice: Current Temp. */}
        {/* <Text style={[styles.wheelText, styles.wheelAQI, { top: center - radius / 2.5, right: center + center / 2.8 }]}>{data.aqi}</Text> */}
        <Text
          style={[
            styles.wheelText,
            {
              top: center - radius / 2.5,
              right: center + center / 3.5,
              fontSize: data.temp.toString().length >= 3 ? 15 : 18, // Smaller font for 3 digits
            },
          ]}
        >
          {data.temp}°
        </Text>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5, // For Android
  },
  wheelText: {
    position: "absolute",
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  wheelUV: {
    fontFamily: "SixtyfourConvergence-Regular",
    // color: "#2B91AD",
  },
  wheelAQI: {
    fontFamily: "AlumniSansPinstripe-Regular",
    color: "#000000",
  },
  nextData: {
    color: "white",
    // Give slightly darker overlay
    // backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
});

export default WeatherWheel;
