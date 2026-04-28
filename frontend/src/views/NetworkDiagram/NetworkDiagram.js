import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import api from "../../api";
import { useCenteredTree } from "../../helper";
import "echarts/lib/chart/tree";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";

function NetworkDiagram() {
  const [translate] = useCenteredTree();
  const [orgChart, setOrgChart] = useState([]);

  // Fetch data only once when the component mounts
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/material-dashboard-react/data.json", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const myJson = await response.json();
        const data = myJson.results;
        setOrgChart(setInitialExpandedNodes(transformData(data)));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (process.env.REACT_APP_ENVIRONMENT === "cloud") {
      getData();
    } else {
      api.networkStatus.getNetworkStatus().then((res) => {
        const data = res.results;
        setOrgChart(setInitialExpandedNodes(transformData(data)));
      });
    }
  }, []);

  const transformData = (data) => {
    return data.map((item) => {
      const ddcChildren = item.children.filter(
        (child) => child.ss_type === "GL_SS_ADDRESS_BACNET_DDC"
      );

      const cpmChildren = ddcChildren.flatMap((ddc) => {
        return ddc.children
          .filter((child) => child.ss_type === "NONGL_SS_CPM")
          .map((cpm) => {
            return {
              id: cpm.id,
              name: cpm.name,
              ss_type: cpm.ss_type,
              children: [
                {
                  id: ddc.id,
                  name: ddc.name,
                  ss_type: ddc.ss_type,
                  children: cpm.children.map((param) => ({
                    id: param.id,
                    name: param.name,
                    ss_type: param.ss_type,
                    value: param.value || null,
                    children: [], // Parameters do not have children
                  })),
                },
              ],
            };
          });
      });

      const chillerChildren = ddcChildren.flatMap((ddc) =>
        ddc.children
          .filter((child) => child.ss_type === "NONGL_SS_AIR_COOLED_CHILLER")
          .map((chiller) => {
            return {
              id: chiller.id,
              name: chiller.name,
              ss_type: chiller.ss_type,
              children: [
                {
                  id: ddc.id,
                  name: ddc.name,
                  ss_type: ddc.ss_type,
                  children: chiller.children.map((param) => ({
                    id: param.id,
                    name: param.name,
                    ss_type: param.ss_type,
                    value: param.value || null,
                    children: [],
                  })),
                },
              ],
            };
          })
      );
      const watercooledchillerChildren = ddcChildren.flatMap((ddc) =>
        ddc.children
          .filter((child) => child.ss_type === "NONGL_SS_CHILLER")
          .map((chiller) => {
            return {
              id: chiller.id,
              name: chiller.name,
              ss_type: chiller.ss_type,
              children: [
                {
                  id: ddc.id,
                  name: ddc.name,
                  ss_type: ddc.ss_type,
                  children: chiller.children.map((param) => ({
                    id: param.id,
                    name: param.name,
                    ss_type: param.ss_type,
                    value: param.value || null,
                    children: [],
                  })),
                },
              ],
            };
          })
      );

      const primaryPumpChildren = ddcChildren.flatMap((ddc) =>
        ddc.children
          .filter(
            (child) => child.ss_type === "NONGL_SS_PRIMARY_VARIABLE_PUMPS"
          )
          .map((pump) => {
            return {
              id: pump.id,
              name: pump.name,
              ss_type: pump.ss_type,
              children: [
                {
                  id: ddc.id,
                  name: ddc.name,
                  ss_type: ddc.ss_type,
                  children: pump.children.map((param) => ({
                    id: param.id,
                    name: param.name,
                    ss_type: param.ss_type,
                    value: param.value || null,
                    children: [],
                  })),
                },
              ],
            };
          })
      );

      // const secondarypumpChildren = ddcChildren.flatMap(ddc =>
      //     ddc.children.filter(child => child.ss_type === "NONGL_SS_SECONDARY_PUMPS").map(ahu => {
      //         return {
      //             id: ahu.id,
      //             name: ahu.name,
      //             ss_type: ahu.ss_type,
      //             children: [{
      //                 id: ddc.id,
      //                 name: ddc.name,
      //                 ss_type: ddc.ss_type,
      //                 children: ahu.children.map(param => ({
      //                   id: param.id,
      //                   name: param.name,
      //                   ss_type: param.ss_type,
      //                   value: param.value || null,
      //                   children: []
      //               }))
      //             }]
      //         };
      //     })
      // );

      const dptChildren = ddcChildren.flatMap((ddc) =>
        ddc.children
          .filter((child) => child.ss_type === "NONGL_SS_DPT_DEVICE")
          .map((dpt) => {
            return {
              id: dpt.id,
              name: dpt.name,
              ss_type: dpt.ss_type,
              children: [
                {
                  id: ddc.id,
                  name: ddc.name,
                  ss_type: ddc.ss_type,
                  children: dpt.children.map((param) => ({
                    id: param.id,
                    name: param.name,
                    ss_type: param.ss_type,
                    value: param.value || null,
                    children: [],
                  })),
                },
              ],
            };
          })
      );

      // Combine all children in the desired order
      const combinedChildren = [
        {
          id: "cpm-group",
          name: "CPMs",
          children: cpmChildren,
        },
        {
          id: "chiller-group",
          name: "Chillers",
          children: chillerChildren,
        },
        {
          id: "water-cooled-chiller-group",
          name: "Water Cooled Chillers",
          children: watercooledchillerChildren,
        },
        {
          id: "primary-pump-group",
          name: "Primary Pumps",
          children: primaryPumpChildren,
        },
        // {
        //     id: "ahu-group",
        //     name: "Secondary Pumps",
        //     children: secondarypumpChildren
        // },
        //   {
        //     id: "dpt-group",
        //     name: "DPTs",
        //     children: dptChildren
        // }
      ];

      return {
        id: item.id,
        name: item.name,
        ss_address_value: item.ss_address_value,
        children: combinedChildren,
      };
    });
  };

  // Function to set the initial expanded nodes
  const setInitialExpandedNodes = (nodes) => {
    return nodes.map((node) => {
      node.collapsed = true; // Start all nodes collapsed
      if (node.children) {
        node.children = setInitialExpandedNodes(node.children);
      }
      return node;
    });
  };

  // Function to handle user toggling node collapse/expand state
  const handleNodeToggle = (nodeId) => {
    const toggleNodeState = (nodes) => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          if (node.children && node.children.length > 0) {
            node.collapsed = !node.collapsed;
          }
        }
        if (node.children) {
          node.children = toggleNodeState(node.children);
        }
        return node;
      });
    };

    setOrgChart((prevOrgChart) => toggleNodeState([...prevOrgChart]));
  };

  return (
    <ReactEcharts
      option={{
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          formatter: (params) => {
            const value = params.data.value ? params.data.value : "";
            return `${params.name}: ${value}`;
          },
        },
        series: [
          {
            type: "tree",
            data: orgChart,
            top: "1%",
            left: "15%",
            bottom: "1%",
            right: "20%",
            symbolSize: 7,
            lineStyle: { color: "black" },
            label: {
              position: "top",
              verticalAlign: "bottom",
              align: "center",
              fontSize: 15,
            },
            leaves: {
              label: {
                position: "right", // Move last node names to the right
                verticalAlign: "middle",
                align: "left",
              },
            },
            emphasis: {
              focus: "descendant",
            },
            expandAndCollapse: true,
            initialTreeDepth: -1,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      }}
      style={{ height: "500px", width: "100%" }}
      onEvents={{
        click: (params) => handleNodeToggle(params.data.id),
      }}
    />
  );
}

export default NetworkDiagram;
