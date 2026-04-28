import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

function normalizeChartData(mapData = [], timeRange) {
  let xAxisLabels = [];
  console.log(timeRange, "timeRange", mapData);

  if (timeRange === "daily") {
    // 24 hours
    xAxisLabels = Array.from({ length: 24 }, (_, i) => i.toString());
  }

  if (timeRange === "weekly") {
    xAxisLabels = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
  }

  if (timeRange === "monthly") {
    xAxisLabels = ["Week1", "Week2", "Week3", "Week4"];
  }

  // Convert API data to lookup object
  const dataMap = {};
  mapData.forEach(item => {
    dataMap[item.label] = item.value;
  });

  const values = xAxisLabels.map(label =>
    dataMap[label] !== undefined ? dataMap[label] : null
  );

  return { labels: xAxisLabels, values };
}

function getHeatmapXAxis(timeRange) {
  if (timeRange === "daily") {
    return Array.from({ length: 24 }, (_, i) => i.toString());
  }

  if (timeRange === "weekly") {
    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
  }

  if (timeRange === "monthly") {
    return ["Week1", "Week2", "Week3", "Week4"];
  }

  return [];
}

function formatDeviceName(name = "") {
  // Remove tabs, multiple spaces, trim
  const cleanName = name.replace(/\s+/g, " ").trim();

  // Split by underscore OR space
  const parts = cleanName.split(/[_ ]+/);

  const prefix = parts
    .filter(p => /^[a-zA-Z]+$/.test(p))
    .map(p => p[0].toUpperCase())
    .join("");

  const numbers = parts
    .filter(p => /^\d+$/.test(p))
    .join("");

  return `${prefix}${numbers}`;
}





export function LargeAreaChart(mapData, timeRange = "week") {
  const chartRef = useRef(null);
  const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  useEffect(() => {
    if (!chartRef.current || !mapData?.length) return;

    const chartInstance = echarts.init(chartRef.current);

    const { labels, values } = normalizeChartData(mapData, timeRange);

    const option = {
      tooltip: {
        trigger: "axis",
        formatter: params => {
          const p = params[0]; // only one series
          const label = p.axisValue;
          const value = p.value;

          return `
      <b>${label || label}</b><br/>
      Energy: ${value || 0} kWh
    `;
        },
      },
      title: {
        text: "Energy Consumption KWh",
        left: "left",
        textStyle: { fontSize: 14 },
      },
      grid: {
        left: "5%",
        right: "10%",
        top: "15%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        // axisLabel: {
        //   rotate: 45,
        // },
        axisLabel: {
          formatter: value => dayShortMap[value] || value,
        },
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "Energy",
          type: "line",
          smooth: true,
          symbol: "none",
          itemStyle: {
            color: "rgb(255, 70, 131)",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgb(255, 158, 68)" },
              { offset: 1, color: "rgb(255, 70, 131)" },
            ]),
          },
          data: values,
        },
      ],
    };

    chartInstance.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chartInstance.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chartInstance.dispose();
    };
  }, [mapData, timeRange]);
  // IMPORTANT: The key is to set height and width to 100% and absolute position
  // This prevents the chart from affecting the parent container's layout
  return (
    <>
      {mapData?.length > 0 ?
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        /> : <p style={{ position: 'absolute', top: "50%", bottom: "50%", left: "0", right: "0" }}>No Data Available</p>}
    </>
  );
}

export function WaterfallChart(mapData = {}) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !mapData?.waterfall?.length) return;

    const chart = echarts.init(chartRef.current);

    // ----- Prepare asset names -----
    const assetNameMap = {}; // shortName -> fullName

    const assets = mapData.waterfall.map(d => {
      const shortName = formatDeviceName(d.asset);
      assetNameMap[shortName] = d.asset; // store full name
      return shortName;
    });

    const values = mapData.waterfall.map(d => d.consumption);

    const total = values.reduce((a, b) => a + b, 0);

    // ----- Build waterfall data -----
    let cumulative = total;
    const helper = [0];
    const bars = [total];

    values.forEach(v => {
      cumulative -= v;
      helper.push(cumulative);
      bars.push(v);
    });

    const categories = ["All", ...assets];

    const option = {
      title: {
        text: "Energy Consumption By Asset Type (KWh)",
        left: "left",
        textStyle: { fontSize: 14 },
      },

      tooltip: {
        formatter: params => {
          if (params.dataIndex === 0) {
            return `<b>Total</b><br/>${total} kWh`;
          }

          const shortName = categories[params.dataIndex];
          const fullName = assetNameMap[shortName];

          return `<b>${fullName}</b><br/>${params.value} kWh`;
        },
      },

      grid: {
        left: "5%",
        right: "5%",
        top: "30%",
        bottom: "10%",
        containLabel: true,
      },

      xAxis: {
        type: "category",
        data: categories,
      },

      yAxis: {
        type: "value",
        name: "kWh",
      },

      series: [
        // Invisible helper bars
        {
          type: "bar",
          barMaxWidth: 40,
          stack: "total",
          itemStyle: { color: "transparent" },
          data: helper,
        },

        // Actual bars
        {
          type: "bar",
          stack: "total",
          data: bars,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#83bff6" },
              { offset: 0.5, color: "#188df0" },
              { offset: 1, color: "#188df0" },
            ]),
          },
          label: {
            show: true,
            position: "top",
            formatter: p =>
              p.dataIndex === 0
                ? `All\n${p.value} kWh`
                : `${categories[p.dataIndex]}\n${p.value} kWh`,
          },
        },
      ],
    };

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [mapData]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}


export function Heatmap(mapData = [], timeRange = "weekly") {
  const chartRef = useRef(null);

  console.log(mapData, "mapData12");


  // Fixed X-axis
  const xAxisLabels = getHeatmapXAxis(timeRange);
  const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  // Flatten API response
  const heatmapList = mapData.flatMap(device =>
    device.data.map(item => ({
      device_name: device.device_name.trim(),
      time_label: item.day,     // hour/day/week
      energy_kwh: item.energy_kwh,
    }))
  );
  const deviceNameMap = {}; // shortName -> fullName

  heatmapList.forEach(item => {
    const shortName = formatDeviceName(item.device_name);
    deviceNameMap[shortName] = item.device_name; // store full name
  });
  // Y-axis (Devices)
  const devices = [...new Set(
    heatmapList.map(d => formatDeviceName(d.device_name))
  )];

  // Create lookup: device + time => value
  const valueMap = {};
  heatmapList.forEach(item => {
    const shortName = formatDeviceName(item.device_name);
    valueMap[`${shortName}_${item.time_label}`] = item.energy_kwh;
  });

  // Build full heatmap matrix
  const heatmapData = [];
  devices.forEach((device, yIndex) => {
    xAxisLabels.forEach((label, xIndex) => {
      heatmapData.push([
        xIndex,
        yIndex,
        valueMap[`${device}_${label}`] ?? null,
      ]);
    });
  });

  // Max value for color scaling
  const maxValue = Math.max(
    ...heatmapData.map(d => d[2] || 0),
    0
  );

  /* ---------- Chart ---------- */
  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        formatter: ({ value }) => {
          const shortName = devices[value[1]];
          const fullName = deviceNameMap[shortName];
          const time = xAxisLabels[value[0]];
          const val = value[2];

          if (val == null) {
            return `
        <b>${fullName}</b><br/>
        ${time}: No Data
      `;
          }

          return `
      <b>${fullName}</b><br/>
      ${time}: ${val} kWh
    `;
        },
      },

      title: {
        text: "Energy Consumption Heatmap (KWh)",
        left: "left",
        textStyle: { fontSize: 14 },
      },

      grid: {
        left: "10%",
        right: "10%",
        top: "15%",
        bottom: "15%",
      },

      xAxis: {
        type: "category",
        data: xAxisLabels,
        splitArea: { show: true },
        axisLabel: {
          formatter: value => dayShortMap[value] || value,
        },
      },

      yAxis: {
        type: "category",
        data: devices,
        splitArea: { show: true },
      },

      visualMap: {
        min: 0,
        max: maxValue,
        orient: "horizontal",
        left: "center",
        bottom: "2%",
        show: false,
      },

      series: [
        {
          type: "heatmap",
          data: heatmapData,
          label: {
            show: true,
            formatter: ({ value }) => (value[2] == null ? "-" : value[2]),
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0,0,0,0.4)",
            },
          },
        },
      ],
    };

    chartInstance.setOption(option);

    const resizeObserver = new ResizeObserver(() =>
      chartInstance.resize()
    );
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chartInstance.dispose();
    };
  }, [mapData, timeRange]);


  return (
    <>
      {mapData?.length > 0 ?
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        /> : <p style={{ position: 'absolute', top: "50%", bottom: "50%", left: "0", right: "0" }}>No Data Available</p>}
    </>
  );
}

export function ResponsiveBarChart(mapData) {
  const chartRef = useRef(null);
  console.log(mapData, "checkingdata");
  const labels = mapData.map(item =>
    formatDeviceName(item.device_name)
  );
  const values = mapData.map(x => x.energy_kwh);
  const deviceNameMap = {};
  mapData.forEach(item => {
    const shortName = formatDeviceName(item.device_name);
    deviceNameMap[shortName] = item.device_name;
  });

  console.log(deviceNameMap,"deviceNameMap");
  
  useEffect(() => {
    let chartInstance = null;

    // Initialize chart with a small delay
    const timer = setTimeout(() => {
      if (chartRef.current) {
        // Initialize the chart
        chartInstance = echarts.init(chartRef.current);

        // Chart configuration
        const option = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: params => {
              const { name, value } = params[0];
              const fullName = deviceNameMap[name];

              return `
            <b>${fullName}</b><br/>
           Fault: ${value} kWh
          `;
            },
          },

          grid: {
            left: "10%",
            right: "10%",
            top: "20%",
            bottom: "15%",
          },
          title: {
            left: "left",
            text: "Asset Health #Fault",
            textStyle: {
              fontSize: 14,
            },
          },
          xAxis: {
            type: "category",
            data: labels,
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: "value",
          },
          // dataZoom: [
          //   {
          //     type: "inside",
          //     start: 0,
          //     end: 100,
          //   },
          //   {
          //     start: 0,
          //     end: 100,
          //     height: 20,
          //   },
          // ],
          series: [
            {
              data: values,
              type: "bar",
              barMaxWidth: 40,
              // Add a gradient to the bars
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#83bff6" },
                  { offset: 0.5, color: "#188df0" },
                  { offset: 1, color: "#188df0" },
                ]),
              },
              emphasis: {
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "#2378f7" },
                    { offset: 0.7, color: "#2378f7" },
                    { offset: 1, color: "#83bff6" },
                  ]),
                },
              },
            },
          ],
        };


        chartInstance.setOption(option);
      }
    }, 100);


    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    // Create a resize observer to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // Cleanup function
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [mapData]);

  // Set height and width to 100% and absolute position
  // This prevents the chart from affecting the parent container's layout
  return (
    <>
      {mapData?.length > 0 ?
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        /> : <p style={{ position: 'absolute', top: "50%", bottom: "50%", left: "0", right: "0" }}>No Data Available</p>}
    </>

  );
}


