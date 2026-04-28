import React ,{ useEffect,useCallback,useRef} from "react";
import {AgGridReact} from 'ag-grid-react';
import { useSelector } from 'react-redux';
import { combine } from "rrule/dist/esm/dateutil";

export default function AlertsMain() {
    const gridRef = useRef();
    const alerts = useSelector(state => state.alarm.alarmData)
    const[post,setPost]=React.useState(null);
    const [test,setTest]=React.useState(null);

    let myheading = {'Device_name':"Device_name", 'date':"date",'time':"time",  'Description': "Message"};
    let mykeys = Object.keys(myheading);
    let columnDefs = [];
    for (let i=0; i<mykeys.length; i++){
        switch (mykeys[i]){
          case 'Device_name' :
            columnDefs.push({'field': mykeys[i], 'filter': true,width:'157px','sortable': true,lockPosition: 'left','tooltipField': 'Device_name' ,cellStyle:{'border-right-color':'#e2e2e2'}}); 
            break;
            case 'date' :
              columnDefs.push({'field': mykeys[i], 'filter':'agDateColumnFilter','suppressAndOrCondition':true,width:'157px','sortable': true,lockPosition: 'left','tooltipField': 'Device_name' ,cellStyle:{'border-right-color':'#e2e2e2'}}); 
              break;
              case 'time' :
                columnDefs.push({'field': mykeys[i], width:'157px','sortable': true,lockPosition: 'left','tooltipField': 'Device_name' ,cellStyle:{'border-right-color':'#e2e2e2'}}); 
                break;
         
       
          default :
           columnDefs.push({'field': mykeys[i],flex:'3',lockPosition: 'left',  'sortable': true,cellStyle:{'border-right-color':'#e2e2e2'}});  
        }
        
    }

    const onSelectionChanged1= useCallback((alarms) => {      
    }, []);

    const onFirstDataRendered1 = useCallback((params)=>{
        gridRef.current.api.sizeColumnsToFit();
      },[]);


    useEffect(()=>{
              
        alerts.system.map((res) =>{
          let mes_time=res.Measured_time.split(' ')
          res.date=mes_time[0]
          res.time=mes_time[1]
         })
        setPost(alerts.system);
        alerts.solution.map((res) =>{
          let mes_time=res.Measured_time.split(' ')
          res.date=mes_time[0]
          res.time=mes_time[1]         
         })
        //  setPost(...alerts.solution);
      setTest(alerts.solution);
      },[alerts]);

      const combinedData = [...(post || []), ...(test || [])];
      console.log("combined",combinedData);

      const sizeToFit = useCallback(() => {
        gridRef.current.api.sizeColumnsToFit();
      }, []);
    
      const autoSizeAll = useCallback((skipHeader) => {
        const allColumnIds = [];
        gridRef.current.columnApi.getAllColumns().forEach((column) => {
          allColumnIds.push(column.getColId());
        });
        gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
      }, []);

   return(
    <div>
     <h2>TOTAL ALARMS</h2>
         <button onClick={sizeToFit}>Size to Fit</button>
          <button onClick={() => autoSizeAll(false)}>Auto-Size All</button>
    <div className="ag-theme-alpine" style={{height:400, width: '100%',marginTop:"2vh"}}>
            <AgGridReact
         ref={gridRef} 
         rowData={combinedData} 
         columnDefs={columnDefs} 
          rowSelection={'single'} 
          onSelectionChanged={onSelectionChanged1}
         pagination={true}
         paginationPageSize={10}
         suppressMenuHide="true"
         suppressFilterButton="true"
         onFirstDataRendered = {onFirstDataRendered1}
         rowDrag={false}
         
         
         >
         </AgGridReact>
  </div>
  </div>
   )
}
