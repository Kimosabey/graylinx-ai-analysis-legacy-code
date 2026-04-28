import React, { Component } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
// import moment from "moment";
import { format } from 'date-fns';

import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import { Container,Confirm } from "semantic-ui-react";
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

const cookies = new Cookies();
let date = require('date-and-time');
// const tree = require('../../assets/Data/org-data.json')


class Schedule extends Component {
  state = { 
      modalCreate: false, 
      start: '', 
      end: '', 
      modalView: false, 
      contextdata: {
        campus: {},
        building: {},
        floors: []
      },
      events: [],
      details: {},
      tree: {},
    }

  componentDidMount = () => {
    // console.log("mapStateToProps",mapStateToProps)
    // if(!Object.keys(this.props.tree).length) {
    //   const campusID = "989cf525-10bf-474f-abed-e109ff7af68f";
    //   // this.props.dispatch(execute(campusID, this.processData));
    // } else {
      api.campus.getTreeList('19b9f822-fd73-413f-827b-009141aa605b').then(res => {
        this.setState({
          tree: res
        })
        this.processData()
      })
    // }
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
    if(event.start && event.end)
      this.setState({ modalCreate: true, start: event.start, end: event.end })
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
    let newDate = new Date(this.state.details.start);
    let currDate = new Date()
    let diffInMilliSeconds = newDate - currDate;
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
    api.schedule.delete(this.state.details.id, user).then(() => {
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

  processSchedules = (data, sd, ed, mode, callback) => {
    console.log("data",data)
    const token = jwt_decode(cookies.get('token'))
    const user = {
      id: token.userId,
      name: token.username
    }
    if(data.action === 0)
      data.intensity = 0;
    if(data.intensityFlag === true)
      data.action = 2;
    data.start = sd;
    data.end = ed;
    if(data.type=== 1){
      data.channel=0
    } else data.channel=5
    if(mode === "create") {
      api.schedule.create(data, user).then((res) => {
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
        data.start = new Date(sd)
        data.end = new Date(ed)
        data.hexColor = this.getColor(data.intensity)
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
      console.log("edit mode", data)
      api.schedule.edit(this.state.details.id, data, user).then((res) => {
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
        data.id = res.id;
        data.start = new Date(sd)
        data.end = new Date(ed)
        data.hexColor = this.getColor(data.intensity)
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
    }
  }
  
  submit = (data, sd, ed, mode, callback) => {
    let newDate = new Date(sd);
    let currDate = new Date()
    let diffInMilliSeconds = newDate - currDate;
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
      this.processSchedules(data, sd, ed, mode, callback)
    }
  }

  processData = () => {
    const data = {
      campus: {},
      building: {},
      floors: []
    };
    let temp = this.state.tree;
    while (!!temp.expanded) {
      if (temp.type === "campus") {
        let campus = {
          name: temp.title,
          id: temp.id
        };
        data.campus = campus;
      } else if (temp.type === "building") {
        let building = {
          name: temp.title,
          id: temp.id
        };
        data.building = building;
        let n = temp.children.length;
        for (let i = 0; i < n; i++) {
          let temp1 = temp.children[i];
          let zones = [];
          temp1.children.map(v => zones.push(
            {
              text: v.title,
              value: v.id,
              key: v.id, 
            }
          ))
          let floor = {
            text: temp1.title,
            value: temp1.id,
            key: temp1.id,
            zones: zones
          };
          data.floors.push(floor);
        }
      }
      temp = temp.children[0];
    }
    this.setState({
      contextdata: data,
    }); 

    this.fetch();
  }

  // get all schedules
  fetch = () => {
    api.schedule.fetch().then(res => {
      let data = res.schedules
      for(let i in data){
        data[i].start = new Date(data[i].start)
        data[i].end = new Date(data[i].end)
        data[i].hexColor = this.getColor(data[i].intensity)
      }
      this.setState({
        events: data
      });
    });
  }

  getColor = (intensity) => {
    console.log('intensity',intensity)
    if(intensity >= 0 && intensity < 25)
      return '#e9967a';
    if(intensity >= 25 && intensity < 50)
      return '#e4c915';
    if(intensity >= 50 && intensity < 75)
      return '#bacc42';
    if(intensity >= 75 && intensity <= 100)
      return '#3cb14a';
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

  render() {
    const locales = {'en-US': enUS,}
    const localizer = dateFnsLocalizer({format,parse,startOfWeek,getDay,locales,})
    // const localizer = momentLocalizer(moment); // or globalizeLocalizer
    const { modalCreate, modalView } = this.state
    
    if(localStorage.getItem("roleID") !== "3"){
    return (
      <div>
      <Container>
        {/* <Header
          as='h2'
          content="Schedule"
        /> */}

        {/* {this.state.events.length > 0 ?  */}
          <Calendar
            selectable
            defaultView={Views.WEEK}
            localizer={localizer}
            views={['month', 'week', 'day']}
            timeslots={2}
            step={15}
            style={{ height: 500,width: '95%' }}
            showMultiDayTimes
            events={this.state.events}
            scrollToTime={new Date(1970, 1, 1, 6)}
            onSelectEvent={this.view}
            onSelectSlot={this.handleSelect}
            eventPropGetter={(this.eventStyleGetter)}
          />
        
        <SemanticToastContainer position="bottom-right" />
        <Dialog open={modalCreate} onClose={this.close} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Scheduler</DialogTitle>
          <DialogContent>
              <ScheduleForm mode="create" dateFormat={date} start={this.state.start} end={this.state.end} submit={this.submit} close={this.close} contextdata={this.state.contextdata} />
          </DialogContent>
        </Dialog>
        <Dialog open={modalView} onClose={this.close} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Scheduler</DialogTitle>
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
      </div>
    );
      } 
  }
}

export default Schedule;
