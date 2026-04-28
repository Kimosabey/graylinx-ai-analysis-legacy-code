import React from "react";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Table from "components/Table/Table.js";
import { makeStyles } from "@material-ui/core";
import api from '../../api';
import { useEffect } from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// For Timeline
import Popover from "@material-ui/core/Popover";
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper";
// import moment from 'moment';
const { compareAsc, format,addDays,subDays,addMonths,getUnixTime } = require('date-fns');
import Timeline, { DateHeader, TimelineHeaders,SidebarHeader, TodayMarker,CustomMarker } from 'react-calendar-timeline';
// import Timeline, {
//     TimelineHeaders,
//     SidebarHeader,
//     DateHeader
//   } from "react-calendar-timeline/lib";
import 'react-calendar-timeline/lib/Timeline.css';
import { Dialog, DialogContent, Typography, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';

const useStyles= makeStyles((theme)=>({
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Helvetica'",
        marginBottom: "3px",
        textDecoration: "none",
        "& small": {
            color: "#777",
            fontSize: "65%",
            fontWeight: "400",
            lineHeight: "1"
        },
    },
    input:{
        fontSize:"25px"
    },
    paper:{
        cursor:'pointer',
        backgroundColor:'transparent'
    },
    data:{
        backgroundColor:'#26c6da',
        color:'balck'
    },
    div:{
        textAlign:'center',
        justifyContent:'center',
        color:'white',
        backgroundColor:'#26c6da',
        padding:'22px',
    },
    time:{
        [theme.breakpoints.up('lg')]:
            {width:'1800px'},
        [theme.breakpoints.up('md')]:
            {width:'1000px'}    
    },
   modal:{
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    justifyContent:'center',
    marginTop:'205px'
   }
}));

const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });
  
  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });
  
function MeetingRooms(props) {
    const classes = useStyles();
    const [room,setRoom] = React.useState([]);
    const [modal,setModal] = React.useState(false);
    const buildingID = localStorage.getItem('buildingID');
    useEffect(()=>{
        api.floor.building(buildingID).then(res=>{
            setRoom(res)
        })
    },[])
    const handleclick=(name)=>{
        setModal(true)
    }
    const handleclose=()=>{
        setModal(false)
    }
     const groups = [{id:1,title:'meeting-room-1'},{id:2,title:'meeting-room-2'},{id:3,title:'meeting-room 3'},
                     {id:4,title:'meeting-room 4'}]
     const items = [ 
        {
            id: 1,
            group: 1,
            title: 'SW meeting',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "09" + ":00" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "11" + ":30" + ":00")
            // end_time: moment().hour(11).minutes(30).seconds(0)
        },
        {
            id:5,
            group: 1,
            title: 'Monthly meeting',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "12" + ":00" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "15" + ":00" + ":00")
            // start_time:moment().hour(12).minute(0).seconds(0),
            // end_time:moment().hour(15).minutes(0).seconds(0)
        },
        {
            id:6,
            group: 1,
            title: 'meeting-room 1',
            start_time: format(addDays(new Date(),2),'yyyy-MM-dd'+ "14" + ":00" + ":00"),
            end_time: format(addDays(new Date(),2),'yyyy-MM-dd'+ "17" + ":00" + ":00")
            // start_time:moment().add(2,'day').hour(14).minute(0).seconds(0),
            // end_time:moment().add(2,'day').hour(17).minutes(0).seconds(0)
        },
        {
            id:13,
            group: 1,
            title: 'meeting-room 1',
            start_time: format(subDays(new Date(),1),'yyyy-MM-dd'+ "14" + ":00" + ":00"),
            end_time: format(subDays(new Date(),1),'yyyy-MM-dd'+ "17" + ":00" + ":00")
            // start_time:moment().subtract(1,'day').hour(14).minute(0).seconds(0),
            // end_time:moment().subtract(1,'day').hour(17).minutes(0).seconds(0)
        },
        {
            id: 2,
            group: 2,
            title: 'Hardware Meeting',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "09" + ":30" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "13" + ":30" + ":00")
            // start_time:moment().hour(9).minutes(30).seconds(0),
            // end_time:moment().hour(13).minutes(30).seconds(0)
        },
        {
            id:7,
            group: 2,
            title: 'Tech Talk',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "15" + ":30" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "18" + ":45" + ":00")
            // start_time:moment().hour(15).minutes(30).seconds(0),
            // end_time:moment().hour(18).minutes(45).seconds(0)
        },
        {
            id:8,
            group: 2,
            title: 'meeting-room 2',
            start_time: format(addDays(new Date(),1),'yyyy-MM-dd'+ "13" + ":30" + ":00"),
            end_time: format(addDays(new Date(),1),'yyyy-MM-dd'+ "16" + ":30" + ":00")
            // start_time:moment().add(1,'day').hour(13).minutes(30).seconds(0),
            // end_time:moment().add(1,'day').hour(16).minutes(30).seconds(0)
        },
        {
            id: 3,
            group: 3,
            title: 'Service now',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "08" + ":00" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "10" + ":00" + ":00")
            // start_time:moment().hour(8).minutes(0).seconds(0),
            // end_time:moment().hour(10).minutes(0).seconds(0)
        },
        {
            id:9,
            group: 3,
            title: 'WLMS Updates',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "12" + ":15" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "14" + ":30" + ":00")
            // start_time:moment().hour(12).minutes(15).seconds(0),
            // end_time:moment().hour(14).minutes(30).seconds(0)
        },
        {
            id:12,
            group: 3,
            title: 'meeting-room 3',
            start_time: format(subDays(new Date(),1),'yyyy-MM-dd'+ "12" + ":15" + ":00"),
            end_time: format(subDays(new Date(),1),'yyyy-MM-dd'+ "14" + ":30" + ":00")
            // start_time:moment().subtract(1,'day').hour(12).minutes(15).seconds(0),
            // end_time:moment().subtract(1,'day').hour(14).minutes(30).seconds(0)
        },
        {
            id: 4,
            group: 4,
            title: 'Scrum',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "10" + ":00" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "12" + ":30" + ":00")
            // start_time:moment().hour(10).minutes(0).seconds(0),
            // end_time:moment().hour(12).minutes(30).seconds(0)
        },
        {
            id:10,
            group: 4,
            title: 'HR meeting',
            start_time:format(new Date(), 'yyyy-MM-dd'+ "15" + ":00" + ":00"),
            end_time:format(new Date(), 'yyyy-MM-dd'+ "18" + ":00" + ":00")
            // start_time:moment().hour(15).minutes(0).seconds(0),
            // end_time:moment().hour(18).minutes(0).seconds(0)
        },
        {
            id:11,
            group: 4,
            title: 'meeting-room 4',
            start_time: format(addDays(new Date(),1),'yyyy-MM-dd'+ "08" + ":30" + ":00"),
            end_time: format(addDays(new Date(),1),'yyyy-MM-dd'+ "10" + ":30" + ":00")
            // start_time:moment().add(1,'day').hour(8).minutes(30).seconds(0),
            // end_time:moment().add(1,'day').hour(10).minutes(30).seconds(0)
        },
    ]
      var keys = {
        groupIdKey: "id",
        groupTitleKey: "title",
        groupRightTitleKey: "rightTitle",
        itemIdKey: "id",
        itemTitleKey: "title",
        itemDivTitleKey: "title",
        itemGroupKey: "group",
        itemTimeStartKey: "start",
        itemTimeEndKey: "end",
        groupLabelKey: "title"
      };      
      const minTime = getUnixTime(addMonths(new Date(),-6)) 
      const maxTime = getUnixTime(addMonths(new Date(),6)) 
      const defaultTimeStart = format(addMonths(new Date(),-6),'yyyy-MM-dd HH:mm:ss')
      const defaultTimeEnd = format(addMonths(new Date(),6),'yyyy-MM-dd HH:mm:ss')
      //   const minTime = moment().add(-6, 'months').valueOf()
    //   const maxTime = moment().add(6, 'months').valueOf()
    //   const defaultTimeStart = moment().add(-6,"months")
    //   const defaultTimeEnd = moment().add(6,"months")
    return(
        <GridContainer>
           <GridItem xs={8} sm={12} md={12} lg={12}>
            <Card>
                <CardHeader color="info">
                    <h4 className={classes.cardTitleWhite}>List of All Meeting Rooms</h4>
                </CardHeader>
                <CardBody>
                   <Paper className={classes.paper} onClick={handleclick}>
                    <Table className={classes.input}
                      tableHeaderColor="info"
                      tableHead={["Room Name", "Floor Name", "Type", "Capacity", "Description"]}
                      tableData={room.map((row,index) =>(
                          [row.name,
                           row.floor_name,
                           row.type,
                           row.no_of_seats,
                           row.description,
                          ]
                        ))}
                    />
                    </Paper>
                    <Dialog 
                        open={modal}
                        onClose={handleclose}
                        anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                        }}
                        maxWidth="xl"
                    >
                    <DialogTitle id="form-dialog-title" onClose={handleclose}>Schedule Details</DialogTitle>
                    <DialogContent>
                        {/* <div className={classes.modal}> */}
                            <Timeline 
                                stackItems={true}
                                groups={groups}
                                items={items}
                                key={keys}
                                lineHeight={50}
                                minResizeWidth={10}
                                defaultTimeStart={defaultTimeStart}
                                defaultTimeEnd={defaultTimeEnd}
                                onTimeChange={function (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) {
                                    if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
                                    updateScrollCanvas(minTime, maxTime)
                                    } else if (visibleTimeStart < minTime) {
                                    updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
                                    } else if (visibleTimeEnd > maxTime) {
                                    updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
                                    } else {
                                    updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
                                    }
                                }}
                            >
                        <TodayMarker/>
                        <TimelineHeaders>
                            <SidebarHeader> 
                                {({ getRootProps }) => {
                                return <div {...getRootProps()} className={classes.div}>
                                Room Name
                                </div>;
                                }}
                            </SidebarHeader>
                            <DateHeader unit="primaryHeader" className={classes.data}/>
                            <DateHeader />
                        </TimelineHeaders>
                    </Timeline> 
                    {/* </div>    */}
                </DialogContent>
            </Dialog>
            </CardBody>
            </Card> 
        </GridItem>
        </GridContainer>    
        
    )
}
export default MeetingRooms;