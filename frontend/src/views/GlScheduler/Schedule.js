import React, { Component } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
// import { parse } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Container, Header, Confirm } from "semantic-ui-react";
import ScheduleForm from "./ScheduleForm";
import 'semantic-ui-css/components/reset.min.css';
import 'semantic-ui-css/components/site.min.css';
import 'semantic-ui-css/components/container.min.css';
import 'semantic-ui-css/components/icon.min.css';
import 'semantic-ui-css/components/message.min.css';
import 'semantic-ui-css/components/header.min.css';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
// import "./workaround.css";

import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../../assets/css/react-big-calendar.sass';

import api from "../../api";
import jwt_decode from 'jwt-decode';
import Cookies from 'universal-cookie';
import { Form, Button, Input, Message, Dropdown, Icon } from "semantic-ui-react";
import InlineError from "../../components/Messages/InlineError";
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import { RRule } from 'rrule';
import { redColor, yellowColor, greenColor, whiteColor, greyColor, blackColor, blueColor, hexToRgb } from "assets/jss/material-dashboard-react.js";
const cookies = new Cookies();
let date = require('date-and-time');
const tree = require('../../assets/Data/org-data.json')
const timeZone = 'Asia/Kolkata';
const locales = {
  'en-IN': require('date-fns/locale/en-US'), // mapping en-IN to en-US
};
const localizer = momentLocalizer(moment);
// const options = [
//   { key: 'sun', text: 'Sunday', value: 0 },
//   { key: 'mon', text: 'Monday', value: 1 },
//   { key: 'tue', text: 'Tuesday', value: 2 },
//   { key: 'wed', text: 'Wednesday', value: 3 },
//   { key: 'thu', text: 'Thursday', value: 4 },
//   { key: 'fri', text: 'Friday', value: 5 },
//   { key: 'sat', text: 'Saturday', value: 6 },
// ]
// let rweek=[]



class Schedule extends Component {

  state = { 
    modalCreate: false, 
    modalView: false, 
    contextdata: {
      campus: {},
      building: {},
      floors: []
    },
    running:false,
    editrunning:false,
    events: [],
    details: {},
    tree: {},
    openmodal:false,
    errors: {},
    loading:false,
    weeks:[],
    rstart:moment().format('YYYY-MM-DD hh:mm A'),
    rend:moment().format('YYYY-MM-DD hh:mm A'),
    click:true,
    schID:''
  }
  combineAndConvertToIST = (dateStr, timeStr) => {
    console.log(`Date time  in : `,dateStr, timeStr)
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const parsedDate = parse(dateTimeStr, 'yyyy-MM-dd HH:mm:ss', new Date());
    // return utcToZonedTime(parsedDate, timeZone);
    return parsedDate;
  };

  componentDidMount = () => {
    // if(!Object.keys(this.props.tree).length) {
    //   const campusID = "989cf525-10bf-474f-abed-e109ff7af68f";
    //   // this.props.dispatch(execute(campusID, this.processData));
    // } else {
      // api.campus.getTreeList(localStorage.getItem("campusID"))
      api.campus.getHvacTreeList(localStorage.getItem("campusID"))
      .then(res => {
        console.log("res-->",res[0])
        this.setState({
          // tree: res
          tree: res[0]
        })
        this.processData()
      })
      .catch((error)=>{
    })    
  }
  componentWillMount() {
    api.schedule.recurringfetch().then(res => {
     console.log("res from will mount==========",res)
     if(res.length>0){
      let data=JSON.parse(res[0].data)
      let rweek=data.weekData
      // this.setState({selected:rweek})
    //   this.setState({
    //     options: [
    //       { key: 'sun', text: 'Sunday', value: 0 },
    //       { key: 'mon', text: 'Monday', value: 1 },
    //       { key: 'tue', text: 'Tuesday', value: 2 },
    //       { key: 'wed', text: 'Wednesday', value: 3 },
    //       { key: 'thu', text: 'Thursday', value: 4 },
    //       { key: 'fri', text: 'Friday', value: 5 },
    //       { key: 'sat', text: 'Saturday', value: 6 },
    //     ],
    //     selected: rweek,
    // })
  }
    });
  }

  parseTimeToMs = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number)
    return ((hours * 60 + minutes) * 60 + (seconds || 0)) * 1000
  }
  
   convertUTCToIST(date) {
    // Add 5 hours and 30 minutes
    return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  }

  generateEvents=(schedule)=> {
    console.log("generateEvents===schedule",schedule)
    const weekdayMap = {
      Sunday: RRule.SU,
      Monday: RRule.MO,
      Tuesday: RRule.TU,
      Wednesday: RRule.WE,
      Thursday: RRule.TH,
      Friday: RRule.FR,
      Saturday: RRule.SA
    }
  
    const [startYear, startMonth, startDay] = schedule.start.split('-').map(Number)
    const [endYear, endMonth, endDay] = schedule.end.split('-').map(Number)
  
    const [startHour, startMinute, startSecond] = schedule.startTime.split(':').map(Number)
    const [endHour, endMinute, endSecond] = schedule.endTime.split(':').map(Number)
    console.log(`startYear,${startYear} startMonth ${startMonth}- 1, startDay,${startDay} startHour,${startHour} startMinute,${startMinute} startSecond${startSecond}`)
    // const startDateTime = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHour, startMinute, startSecond || 0))
    // const endDateTime = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHour, endMinute, endSecond || 0))
    // const startDateTimeUTC =this.convertUTCToIST(startDateTime)
    // const endDateTimeUTC =this.convertUTCToIST(endDateTime)
    const startDateTime = this.combineAndConvertToIST(schedule.start, schedule.startTime);
    console.log("startDateTime",startDateTime)
    const endDateTime = this.combineAndConvertToIST(schedule.end, schedule.endTime);
    const duration = this.parseTimeToMs(schedule.endTime) - this.parseTimeToMs(schedule.startTime)
    console.log("weekdayMap[day]",schedule.weekdays.map(day => weekdayMap[day]))
    console.log("startDateTime12345",(startDateTime.toISOString()))
    // const startDateTimeIST = this.convertUTCToIST(startDateTimeUTC)
    // const endDateTimeIST = this.convertUTCToIST(endDateTimeUTC)
    // console.log("endDateTime",endDateTime)
    const rule = new RRule({
      freq: RRule.WEEKLY,
      interval: 1,
      byweekday: schedule.weekdays.map(day => weekdayMap[day]),
      dtstart: startDateTime,
      until: endDateTime
    })
  
    const occurrences = rule.all()
    const events = []
  
    occurrences.forEach((occurrence) => {
      events.push({
        id: schedule.id,
        title: schedule.title + ', ' + schedule.zones.map(z => z.name).join(', '),
        start: new Date(occurrence),
        end: new Date(occurrence.getTime() + duration),
        allDay: false,
        hexColor: this.getColor(schedule.action),
        priority: schedule.priority
      })
    })
    console.log("ebvent gen array",events)
    return events
  }

  handleSelect = (event) => {
    if(event.start < new Date()) {
      toast({
          type: 'error',
          icon: 'exclamation triangle',
          title: 'Error',
          description: 'You can create schedule for future time only.',
          time: 3000
      });
      return false;
    }
    let adjustedStart = new Date(event.start);
    adjustedStart.setMinutes(adjustedStart.getMinutes() + 1);
    if(event.start && event.end)
      this.setState({ modalCreate: true, start:adjustedStart, end: event.end })
    if(new Date(event.end).getHours() === 0 && new Date(event.end).getMinutes() === 0 && new Date(event.end).getSeconds() === 0 ) {
      let eDate = new Date(event.end);
      eDate.setHours(eDate.getHours()+23)
      eDate.setMinutes(eDate.getMinutes()+59)
      event.end = eDate
      this.setState({ modalCreate: true, start: event.start, end: eDate})
    }
    return true
  }

  view = (event) => { 
    console.log("eventeee",event)
    this.setState({ modalView: true, details: event });
  }
    confirmOpen= () => this.setState({confirmOpen:true,modalView:false})
  // confirmOpen = () => this.setState({ confirmOpen: false})
  confirmCancel = () => this.setState({ confirmCancel: true })

  handleConfirm = () => {
    const token = jwt_decode(cookies.get('token'))
    const user = {
      id: token.userId,
      name: token.username
    }
    let newDate = new Date(this.state.details.end);
    let startDate = new Date(this.state.details.start)
    let currDate = new Date()
    let diffInMilliSeconds = newDate - currDate;
    let difference = currDate-startDate
    if(difference >= 0){
      this.setState({running:true})
      this.state.running = true
    } else {
      this.setState({running:false})
    }
    if(diffInMilliSeconds <= 180000) {
      this.close()
      toast({
        type: 'error',
        icon: 'exclamation triangle',
        title: 'Error',
        description: "Schedule is about to start / running / already over",
        time: 3000
    });
    } else {
    // remove schedule
    console.log("this.state.details.id",this.state.details.id)
    api.hvac_schedule.delete(this.state.details.id, user,this.state.running).then(() => {
      this.setState({ confirmOpen: false, modalView: false });

      // delete object from event
      let events = this.state.events.filter(res => res.id !== this.state.details.id)
      this.setState({events});
      toast({
          type: 'success',
          icon: 'check circle',
          title: 'Success',
          description: 'Schedule details successfully deleted.',
          time: 3000
      });
    })
    }
  }

  handleCancelConfirm = () => {
    this.setState({ confirmCancel: false, modalView: false});
    let millisecs = new Date(this.state.details.start) - new Date();
    if((millisecs/(1000*60*60)) < 1){
      toast({
        type: 'error',
        icon: 'exclamation triangle',
        title: 'Error',
        description: 'Cancellation should be done 1 hour ahead.',
        time: 2000
    });
    } else {
      console.log("Successfully cancelled")
    }
  }

  handleCancel = () => this.setState({ confirmOpen: false })

  close = () => this.setState({ modalCreate: false, modalView: false })

  processSchedules = (data1, sd, ed, mode, callback) => {
    const token = jwt_decode(cookies.get('token'))
    const user = {
      id: token.userId,
      name: token.username
    }
    console.log("data----->",data1);
    if(data1.action === 0)
      data1.intensity = 0;
    if(data1.intensityFlag === true)
      data1.action = 2;
    data1.start = sd;
    data1.end = ed;
    if(mode === "create") {
      let data = {
        name: data1.title,
        target: {
          ss_id: data1.deviceId,
          ss_type: data1.deviceType,
          zone_idd: data1.floor,
          zone_type: "GL_LOCATION_TYPE_ZONE",
        },
        start_command: data1.action == 0 ? "TURN_OFF" : "TURN_ON",
        end_command: data1.action == 0 ? "TURN_ON" : "TURN_OFF",
        scheduleData: {
          start: data1.start,
          end: data1.end,
        },
        type: data1.scheduleType,
        weekData: data1.weekData,
      };
    console.log("create api payload -----------",data)
      // api.hvac_schedule.create(data, user).then((res) => {
      api.hvac_schedule.createHvacSchedule(data).then((res) => {
        console.log("create api",res)
        if(typeof callback === 'function')
          callback();
        this.close();
        toast({
            type: 'success',
            icon: 'check circle',
            title: 'Success',
            description: 'Schedule successfully created.',
            time: 3000
        });
  
        // reload map data
        let events = [...this.state.events];
        data.id = res.id;
        data.title=data1.title
        data.start = new Date(sd)
        data.end = new Date(ed)
        data.hexColor = this.getColor(data.start_command)
        events.push(data);
        this.setState({events})
      })
      .catch((e) => {
        this.close();
        if(e.response.data.code === 500) {
          toast({
            type: 'error',
            icon: 'exclamation triangle',
            title: 'Error',
            description: e.response.data.message,
            time: 3000
        });
        }
        if (e.response.data.message.includes("ER_DUP_ENTRY")) {
          toast({
              type: 'error',
              icon: 'exclamation triangle',
              title: 'Error',
              description: 'Schedule with this name already exists!!',
              time: 3000
          });
        }
      });
    } else {
      let startDate = new Date(this.state.details.start)
      let currDate = new Date()
      let difference = currDate-startDate
      if(difference >= 0){
        this.setState({editrunning:true})
        this.state.editrunning = true
      } else {
        this.setState({editrunning:false})
      }
      console.log("edit mode", data1)
      api.hvac_schedule.edit(this.state.details.id, data1, user,this.state.editrunning).then((res) => {
        console.log("edit api",res)
        if(typeof callback === 'function')
          callback();
        this.close();
        toast({
            type: 'success',
            icon: 'check circle',
            title: 'Success',
            description: 'Schedule successfully updated.',
            time: 3000
        });
  
        // reload map data
        let events = [...this.state.events], index;
        events.map((_event,i) => {
          if(_event.id === this.state.details.id) {
            index = i;
          }
          return null;
        });
        events.splice(index,1)
        data1.id = res.id;
        data1.start = new Date(sd)
        data1.end = new Date(ed)
        data1.hexColor = this.getColor(data1.intensity)
        events.push(data1);
        this.setState({events})
      })
      .catch((e) => {
        this.close();
        if(e.response.data.code === 500) {
          toast({
            type: 'error',
            icon: 'exclamation triangle',
            title: 'Error',
            description: e.response.data.message,
            time: 3000
        });
        }
        if (e.response.data.message.includes("ER_DUP_ENTRY")) {
          toast({
              type: 'error',
              icon: 'exclamation triangle',
              title: 'Error',
              description: 'Schedule with this name already exists!!',
              time: 3000
          });
        }
      });
    }
  }
  
  submit = (data, sd, ed, mode, callback) => {
    console.log("sd---",sd,"ed------",ed,"daata-----",data)
    // let newDate = sd;
    let newDate = new Date(sd);
    let currDate = new Date()
    let diffInMilliSeconds = newDate - currDate;
    console.log("newDate-----",newDate,"currDate-----",currDate)
    // if(diffInMilliSeconds <= 180000) {
    //   this.close()
    //   toast({
    //     type: 'error',
    //     icon: 'exclamation triangle',
    //     title: 'Error',
    //     description: "Schedule is about to start / running / already over",
    //     time: 3000
    // });
    // } else {
      console.log("processSchedules data-->",data,"Sd",sd,"ed",ed)
      this.processSchedules(data, sd, ed, mode, callback)
    // }
  }

  processData = () => {
    const data = {
      campus: {},
      building: {},
      floors: []
    };
    let temp = this.state.tree;
    console.log("temp.type",temp.type)
    while (!!temp.expanded) {
      // if (temp.type === "campus") {
      if (temp.type === "GL_LOCATION_TYPE_CAMPUS") {
        let campus = {
          name: temp.title,
          id: temp.id
        };
        data.campus = campus;
        console.log("11111111111111-->",data)

      // } else if (temp.type === "building") {
      } else if (temp.type === "GL_LOCATION_TYPE_BUILDING") {
        let building = {
          name: temp.title,
          id: temp.id
        };
        data.building = building;
        let n = temp.children.length;
        // console.log("------no of floor--------->",n)
        for (let i = 0; i < n; i++) {
          let temp1 = temp.children[i];
          console.log("floore name",temp1)
          // let zones = [];
          // temp1.children.map(v => zones.push(
          //   {
          //     text: v.title,
          //     value: v.id,
          //     key: v.id, 
          //   }
          // ))
          // console.log("after zone",zones.length)
          if(temp.children[i].type=="GL_LOCATION_TYPE_FLOOR"){
            let floor = {
              text: temp1.title,
              value: temp1.id,
              key: temp1.id
            };
            console.log("after zone",floor)
            data.floors.push(floor);
          }
        }
      }
      temp = temp.children[0];
      console.log("--we are------>",data)
    }
    this.setState(
      {
      contextdata: data,
    }); 
    this.fetch();
  }
  toIST = (date) => {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  }
  transformSchedulesToEvents = (data) => {
    const events = [];

    // Handle exception schedules
    data.schedules.exception.forEach((schedule) => {
      // const startDateTime = moment(`${schedule.date} ${schedule.start}`, 'YYYY-MM-DD HH:mm:ss').toDate();
      // const endDateTime = moment(`${schedule.date} ${schedule.end}`, 'YYYY-MM-DD HH:mm:ss').toDate();
      const startDateTime = parse(`${schedule.start} ${schedule.startTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
      const endDateTime = parse(`${schedule.end} ${schedule.endTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
      // const endDateTime = parse(`${schedule.end}${schedule.endTime}`, 'YYYY-MM-DD HH:mm:ss',new Date() );
      events.push({
        id: schedule.id,
        title: schedule.title+", " + schedule.zones.map((_val,index)=>_val.name),
        start: startDateTime,
        end: endDateTime,
        allDay: false,
        hexColor:this.getColor(schedule.action),
        priority: schedule.priority,
      });
    });

    // Handle recurring schedules using rrule
    data.schedules.recurring.forEach((schedule) => {
      // const rruleWeekdaysMap = {
      //   Sunday: RRule.SU,
      //   Monday: RRule.MO,
      //   Tuesday: RRule.TU,
      //   Wednesday: RRule.WE,
      //   Thursday: RRule.TH,
      //   Friday: RRule.FR,
      //   Saturday: RRule.SA,
      // };
      // const startDateTime = moment(`${schedule.start}`, 'YYYY-MM-DD').toDate();
      // const endDateTime = moment(`${schedule.date} ${schedule.end}`, 'YYYY-MM-DD HH:mm:ss').toDate();
      // console.log("startDateTime",startDateTime,"endDateTime",endDateTime);
      // const rule = new RRule({
      //   freq: RRule.WEEKLY,
      //   byweekday: schedule.weekdays.map((day) => rruleWeekdaysMap[day]),
      //   dtstart: startDateTime,
      //   until: moment(schedule.endDate, 'YYYY-MM-DD').toDate(),
      // });

      // const occurrences = rule.all();
      // occurrences.forEach((occurrence) => {
      //   events.push({
      //     id: schedule.id,
      //     title: schedule.title+", " + schedule.zones.map((_val,index)=>_val.name),
      //     start: new Date(occurrence),
      //     end: new Date(occurrence.getTime() + (endDateTime - startDateTime)),
      //     allDay: false,
      //     hexColor:this.getColor(schedule.action),
      //     priority: schedule.priority,
      //   });
      // });
      let myEvent= this.generateEvents(schedule)
       console.log(" myEvent",myEvent)
      //  events.push(myEvent)
      events.push(...myEvent);
    });

    return events;
  };
  // get all schedules
  fetch = () => {
    console.log("IN FETCH API");
    api.hvac_schedule.showHvacSchedule(localStorage.getItem('buildingID')).then(res=> {
      // console.log("fetch api",res)
      // let data = res.schedules.exception
      // for(let i in data){
      //   let startt = data[i].start
      //   let endd = data[i].end
      //   data[i].start =new Date(data[i].date.concat(` ${data[i].start}`))
      //   data[i].end = new Date(data[i].date.concat(` ${data[i].end}`))
      //   data[i].hexColor = this.getColor(data[i].action)
      // }
      let data = this.transformSchedulesToEvents(res)
      this.setState({
        events: data
      });
    });
  }

  getColor = (intensity) => {
    // if(intensity >= 0 && intensity < 25)
    //   return '#e9967a';
    // if(intensity >= 25 && intensity < 50)
    //   return '#e4c915';
    // if(intensity >= 50 && intensity < 75)
    //   return '#bacc42';
    // if(intensity >= 75 && intensity <= 100)
    //   return '#3cb14a';

    switch(intensity){
      case 'TURN_ON':
              return greenColor[0];
      case 'TURN_OFF':
              return redColor[0];

    }
  }

  eventStyleGetter = (event, start, end, isSelected) => {
    var style = {
      backgroundColor: event.hexColor,
      borderRadius: '0px',
      opacity: 1,
      color: '#fff',
      display: 'block',
      border: '1px solid #ffffff91'
    };
    return {
      style: style
    };
  }

  onChange=(e,{name,value})=>{
    console.log("eyyyyyyyyyyy",e)
    console.log("name",name)
    console.log("value",value)
    this.setState({weeks:value})
    this.setState({selected:value})
  }

  handledefaultclick=()=>{
    this.setState({openmodal:true})
    api.schedule.recurringfetch().then(res => {
        let data=JSON.parse(res[0].data)
        let d_date='2022-09-14'
        let start = data.timeData[0].ON
        let end = data.timeData[0].OFF
        let r_start=d_date.concat(" ",start)
        let r_end=d_date.concat(" ",end)
        this.setState({rstart:moment(r_start).format('YYYY-MM-DD hh:mm a')})
        this.setState({rend:moment(r_end).format('YYYY-MM-DD hh:mm a')})
        this.setState({schID:res[0].id})
    })
    .catch(err =>{
        console.log("err",err)
    })
  }

  handlecancelclick=()=>{
    this.setState({openmodal:false})
  }

  handlesaveclick=()=>{
    this.setState({openmodal:false})
    this.setState({click:false})
    let start=moment(this.state.rstart).format('HH:mm')
    let end=moment(this.state.rend).format('HH:mm')
    // console.log("weeks choosen",this.state.weeks)
    // console.log("start formatted",start)
    // console.log("end formatted",end)
    let data = {
      "timeData": [{ "ON": start,"OFF": end}],
      "weekData": this.state.weeks
    }
    api.schedule.reccuringupdate(this.state.schID,data).then(res=>{
        console.log("res",res)
        if(res=='Accepted'){
          toast({
            type: 'success',
            icon: 'check circle',
            title: 'Success',
            description: 'Default Schedule successfully updated.',
            time: 3000
        }); 
          setTimeout(() => {
            this.setState({click:true})
          }, 4000);
        }
    }).catch(err =>{
       console.log("err",err)
       toast({
        type: 'error',
        icon: 'exclamation triangle',
        title: 'Error',
        description: err,
        time: 3000
      });
      setTimeout(() => {
        this.setState({click:true})
      }, 4000);
    })
  }

  render() {
    const localizer = momentLocalizer(moment); // or globalizeLocalizer
    const { modalCreate, modalView,errors,start,end,loading,rstart,rend } = this.state
    
    if(localStorage.getItem("roleID") !== "3"){
    return (
      <div>
      <Container>
        {/* <Header
          as='h2'
          content="Schedule"
        /> */}

        {/* {this.state.events.length > 0 ?  */}
        {/* <Button onClick={this.handledefaultclick} positive floated="left" style={{"marginBottom":"5px"}} disabled={this.state.click==false?true:false}>Change Default</Button> */}
          <Calendar
            selectable
            defaultView={Views.WEEK}
            localizer={localizer}
            dayStartFrom={8}
            views={['month', 'week', 'day']}
            timeslots={2}
            step={5}
            style={{ height:window.innerHeight == '1080'? 800:500,width:window.innerHeight == '1080'? '95%': '100%' }}
            showMultiDayTimes
            events={this.state.events}
            scrollToTime={new Date(1970, 1, 1, 6)}
            // onSelectEvent={this.view}
            onSelectSlot={this.handleSelect}
            eventPropGetter={(this.eventStyleGetter)}
          />
        
        <SemanticToastContainer position="bottom-right" />
        <Dialog open={modalCreate} onClose={this.close} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">BMS Scheduler</DialogTitle>
          <DialogContent>
              <ScheduleForm mode="create" dateFormat={date} start={this.state.start} end={this.state.end} submit={this.submit} close={this.close} contextdata={this.state.contextdata} />
          </DialogContent>
        </Dialog>
        <Dialog open={modalView} onClose={this.close} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">BMS Scheduler</DialogTitle>
          <DialogContent>
            <ScheduleForm mode="edit" delete={this.handleConfirm} dateFormat={date} start={this.state.details.start} end={this.state.details.end} submit={this.submit} close={this.close} details={this.state.details} contextdata={this.state.contextdata}  confirmOpen={this.confirmOpen}/>
          </DialogContent>
        </Dialog>
        {/* create schedule modal */}
        {/* Cancel task */}
        {/* <Confirm
          open={this.state.confirmCancel}
          content='Are you sure you want to cancel the schedule?'
          onCancel={this.handleCancel}
          onConfirm={this.handleCancelConfirm}
        /> */}

        {/* Delete schedule modal */}
        <Confirm
          open={this.state.confirmOpen}
          content='Are you sure you want to delete schedule?'
          onCancel={this.handleCancel}
          onConfirm={this.handleConfirm}
        />
      </Container>
      {this.state.openmodal===true?
        <Dialog open={this.state.openmodal} onClose={this.close} aria-labelledby="form-dialog-title">
          <Form loading={loading} style={{margin:"25px"}}>
            <Form.Group>
                  <Form.Field error={!!errors.date}>
                    <label>From</label>
                    <DateTimePicker
                      date={false}
                      name="start"
                      value={new Date(rstart)}  
                      step={15}
                      onChange={value => this.setState({ rstart: value })}
                    />
                  </Form.Field>
                  <Form.Field error={!!errors.date}>
                    <label>To</label>
                      <DateTimePicker
                        date={false}
                        name="end"
                        value={new Date(rend)}  
                        step={15}
                        onChange={value => this.setState({ rend: value })}
                      />
                  </Form.Field>
            </Form.Group>
                  <Form.Field error={!!errors.floor}>
                    <label>Weeks</label>
                    <Dropdown 
                      name="weeks" 
                      placeholder='Weeks' 
                      fluid 
                      multiple 
                      selection 
                      options={this.state.options} 
                      onChange={this.onChange} 
                      onMouseDown={(e)=>e.preventDefault()}
                      defaultValue={this.state.selected}
                    />
                  </Form.Field>  
            <div>
              <Button positive floated="right" onClick={this.handlesaveclick} style={{"marginBottom":"5px"}}>Save</Button>
              <Button floated="right" onClick={this.handlecancelclick} style={{"marginBottom":"5px"}}>Cancel</Button>
            </div>
          </Form>
        </Dialog>
      :
        <div></div>
      }
      </div>
    );
      } 
  }
}

export default Schedule;
