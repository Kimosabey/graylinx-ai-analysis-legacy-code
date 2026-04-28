import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function SemiGauge({ value = 0, title = "" }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    const option = {
      title: {
        text: title,
        left: "center",
        top: "5%",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },

      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          center: ["50%", "75%"],
          radius: "90%",
          min: 0,
          max: title === "kW/TR" ? 1 : 1000, // dummy max for kW, TR

          // *** REMOVE ALL NUMBERS ***
          axisLabel: { show: false }, // hides numbers on the arc
          axisTick: { show: false }, // hides small ticks
          splitLine: { show: false }, // hides large tick lines

          axisLine: {
            lineStyle: {
              width: 10,
              //   color: [
              //     [0.25, "#FF6E76"],
              //     [0.5, "#FDDD60"],
              //     [0.75, "#58D9F9"],
              //     [1, "#7CFFB2"],
              //   ],
              color: [[1, "#58D9F9"]],
            },
          },

          pointer: {
            icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
            length: "20%",
            width: 14,
            offsetCenter: [0, "-45%"],
            itemStyle: { color: "auto" },
          },

          detail: {
            show: false, // hide the value text (optional)
          },

          data: [{ value }],
        },
      ],
    };

    chart.setOption(option);

    return () => chart.dispose();
  }, [value, title]);

  return <div ref={chartRef} style={{ width: "100%", height: "120px" }} />;
}
