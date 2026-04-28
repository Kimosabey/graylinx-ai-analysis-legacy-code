import React, { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import api from '../../api';
import { useCenteredTree } from '../../helper';
import 'echarts/lib/chart/tree';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

function NetworkDiagram() {
  const [translate] = useCenteredTree();
  const [orgChart, setOrgChart] = useState([]);

  // Fetch data only once when the component mounts
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch('/material-dashboard-react/data.json', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const myJson = await response.json();
        const data = myJson.results;
        setOrgChart(setInitialExpandedNodes(data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (process.env.REACT_APP_ENVIRONMENT === 'cloud') {
      getData();
    } else {
      api.networkStatus.getNetworkStatus().then(res => {
        const data = res.results;
        setOrgChart(setInitialExpandedNodes(data));
      });
    }
  }, []);

  // Function to set the initial expanded nodes
  const setInitialExpandedNodes = (nodes) => {
    return nodes.map(node => {
      node.collapsed = true; // Start all nodes collapsed
      if (node.children) {
        node.children = setInitialExpandedNodes(node.children);
      }
      return node;
    });
  };

  // Function to handle user toggling node collapse/expand state
  const handleNodeToggle = (nodeId, nodes) => {
    const toggleNodeState = (nodes) => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          node.collapsed = !node.collapsed; // Toggle the collapsed state of the clicked node
        }
        if (node.children) {
          node.children = toggleNodeState(node.children); // Recursively update children nodes
        }
        return node;
      });
    };

    const updatedNodes = toggleNodeState(nodes);
    setOrgChart([...updatedNodes]);
  };

  return (
    <ReactEcharts
      option={{
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: params => {
            const value = params.data.value ? params.data.value : '';
            return `${params.name}: ${value}`;
          }
        },
        series: [
          {
            type: 'tree',
            data: orgChart,
            top: '1%',
            left: '15%',
            bottom: '1%',
            right: '20%',
            symbolSize: 7,
            lineStyle: { color: 'black' },
            label: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 15
            },
            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left'
              }
            },
            emphasis: {
              focus: 'descendant'
            },
            expandAndCollapse: true,
            initialTreeDepth: -1,
            animationDuration: 550,
            animationDurationUpdate: 750
          }
        ]
      }}
      style={{ height: '500px', width: '100%' }}
      onEvents={{
        'click': (params) => handleNodeToggle(params.data.id, orgChart),
      }}
    />
  );
}

export default NetworkDiagram;
