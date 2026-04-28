import React, { Component } from "react";
import {Calendar, momentLocalizer,Views} from "react-big-calendar";
import moment from "moment";
import { Container, Modal, Item, Header, Button, Icon, Popup, Confirm, Label, Progress,Dropdown,Grid } from "semantic-ui-react";
import ScheduleForm from "./ScheduleForm";
// import "./workaround.css";
// import Navbar from "../components/navbar";
import { Redirect } from "react-router-dom";
import { message} from 'antd';

// for reducer
// import { execute } from '../Reducer/tree';
import { connect } from "react-redux";

import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';
import '../../assets/css/react-big-calendar.sass';

import api from "../../api";
import jwt_decode from 'jwt-decode';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
let date = require('date-and-time');

class scheduler extends Component {

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
    newtitle:'',
    viewopened:false,
    running:false,
    editrunning:false,
    zones:[],
    fdata:'',
    zdata:'',
    zonelist:[]
  }

  componentDidMount = () => {
    // if(!Object.keys(this.props.tree).length) {
    //   const campusID = localStorage.getItem("campusID");
    //   this.props.dispatch(execute(campusID, this.processData));
    // } else {
    //   this.processData()
    // }
    // api.campus.getTreeList('19b9f822-fd73-413f-827b-009141aa605b').then(res => {
      api.campus.getTreeList(localStorage.getItem('campusID')).then(res => {
      this.setState({
        tree: res
      })
      this.processData()
    })
  }

  handleSelect = (event) => {
    // console.log(event.start)
    let start_mins = new Date(event.start).getMinutes();
    let start_hour = new Date(event.start).getHours();
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
    if((new Date(event.start) - new Date())/(1000*60) < 3) {
      if(start_mins >= 12 && start_mins <= 15){
        
        //console.log(`if-1, You can create schedule at ${start_hour-12 ? start_hour-12 : start_hour}:30 only`)
        toast({
          type: 'error',
          icon: 'exclamation triangle',
          title: 'Error',
          description: 'You can create schedule at '+(start_hour > 12 ? (start_hour-12) : start_hour)+':30 only',
          time: 3000
        })
      } else if(start_mins >= 27 && start_mins <= 30){
        
        //console.log(`elseif-1, You can create schedule at ${start_hour-12 ? start_hour-12 : start_hour}:45 only`)
        
        toast({
          type: 'error',
          icon: 'exclamation triangle',
          title: 'Error',
          description: 'You can create schedule at '+(start_hour > 12 ? (start_hour-12) : start_hour)+':45 only',
          time: 3000
        })
      } else if(start_mins >= 42 && start_mins <= 45){
        
        //console.log(`elseif-2, You can create schedule at ${start_hour-12 ? start_hour-12+1 : start_hour}:00 only`)
        toast({
          type: 'error',
          icon: 'exclamation triangle',
          title: 'Error',
          description: 'You can create schedule at '+(start_hour > 12 ? start_hour-12+1 : start_hour)+':00 only',
          time: 3000
        })
      } else if((start_mins >= 57 && start_mins <= 59) || start_mins == 0) {
        
        //console.log(`elseif-3, You can create schedule at ${start_hour-12 ? start_hour-12 : start_hour}:15 only`)
        toast({
          type: 'error',
          icon: 'exclamation triangle',
          title: 'Error',
          description: 'You can schedule at '+(start_hour > 12 ? (start_hour-12) : start_hour)+':15 only.',
          time: 3000
        })
      }
      return false;
    }
    if(event.start && event.end)
      this.setState({ modalCreate: true, start: event.start, end: event.end })
    if(new Date(event.end).getHours() == 0 && new Date(event.end).getMinutes() == 0 && new Date(event.end).getSeconds() == 0 ) {
      let eDate = new Date(event.end);
      eDate.setHours(eDate.getHours()+23)
      eDate.setMinutes(eDate.getMinutes()+59)
      event.end = eDate
      this.setState({ modalCreate: true, start: event.start, end: eDate})
    }
    return true
  }

  view = (event) => { 
    let endDate = new Date(event.end);
    let currDate = new Date()
    let diffInMilliSeconds = endDate - currDate;
    // console.log(event, endDate, currDate, diffInMilliSeconds)
    if(diffInMilliSeconds <= 180000) {
      var endMins = endDate.getMinutes();
      if((endMins >= 12 && endMins <= 15) || (endMins >= 27 && endMins <= 30) 
        || (endMins >= 42 && endMins <= 45) || (endMins >= 57 && endMins <= 59)) {
          this.close()
          toast({
            type: 'info',
            icon: 'exclamation triangle',
            title: 'Error',
            description: "Kindly schedule after 15 mins",
            time: 3000
        });
      } else {
        this.close()
        toast({
          type: 'error',
          icon: 'exclamation triangle',
          title: 'Error - Cannot Edit',
          description: "Schedule is already completed",
          time: 3000
      });
    }
    } else {
      this.setState({newtitle:event.title,viewopened:true})
      event.title = event.orgtitle
      this.setState({ modalView: true, details: event });
    }
  }

  confirmOpen = () => this.setState({ confirmOpen: true })

  confirmCancel = () => this.setState({ confirmCancel: true })

  handleConfirm = () => {
    const token = jwt_decode(cookies.get("token"))
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
        description: "Schedule is already over",
        time: 3000
    });
    } else {
    // remove schedule
    api.schedule.delete(this.state.details.id, user,this.state.running).then(() => {
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
      // console.log("Successfully cancelled")
    }
  }

  handleCancel = () => this.setState({ confirmOpen: false })

  close = () => {
    if(this.state.viewopened==true){
    this.state.details.title = this.state.newtitle
    this.setState({ modalCreate: false, modalView: false ,viewopened:false})
  } else{
    this.setState({ modalCreate: false, modalView: false })
   }
  }

  processSchedules = (data, sd, ed, mode, callback) => {
    const token = jwt_decode(cookies.get("token"))
    const user = {
      id: token.userId,
      name: token.username
    }
    console.log("processSchedules---------",data)
    if(data.action === 0)
      data.intensity = 0;
    if(data.intensityFlag === true)
      data.action = 2;
    data.start = sd;
    data.end = ed;
    if(mode === "create") {
      api.schedule.create(data, user).then((res) => {
        if(typeof callback === 'function'){
          callback();
        this.close();
        toast({
            type: 'success',
            icon: 'check circle',
            title: 'Success',
            description: 'Schedule successfully created.',
            time: 3000
        });
      //  } else if (res.message.includes("ER_DUP_ENTRY")) {
      //     toast({
      //         type: 'error',
      //         icon: 'exclamation triangle',
      //         title: 'Error',
      //         description: 'Schedule with this name already exists!!',
      //         time: 3000
      //     });
        }
  
        // reload map data
        let events = [...this.state.events];
        data.id = res.id;
        data.start = new Date(sd)
        data.end = new Date(ed)
        data.hexColor = this.getColor(data.intensity)
        data["orgtitle"] = data.title
        data.title = data.title + ", " + data.floor.name + ", " + data.zones.map((_val,index)=>_val.name)
        events.push(data);
        this.setState({events})
      })
      .catch((e) => {
        // console.log("catch block===============================")
        // console.log("e.response.data.message")
        // console.log(e.response.data.message.includes("ER_DUP_ENTRY"))
        this.close();
        // if (e.response.data.message.includes("ER_DUP_ENTRY")) {
        //   toast({
        //       type: 'error',
        //       icon: 'exclamation triangle',
        //       title: 'Error',
        //       description: 'Schedule with this name already exists!!',
        //       time: 3000
        //   });
        // }  
        // else if(e.response.data.code === 500) {
        if(e.response.data.code === 500) {
          toast({
            type: 'error',
            icon: 'exclamation triangle',
            title: 'Error',
            description: e.response.data.message,
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
      api.schedule.edit(this.state.details.id, data, user,this.state.editrunning).then((res) => {
        // if(res.message.includes('Conflict in Schedule name')){
        //   this.close();
        //   callback();
        //   toast({
        //     type: 'error',
        //     icon: 'exclamation triangle',
        //     title: 'Error',
        //     description: 'Schedule with this name already exists!!',
        //     time: 3000
        // });
        // }else if(typeof callback === 'function'){
        if(typeof callback === 'function'){
          callback();
        this.close();
        toast({
            type: 'success',
            icon: 'check circle',
            title: 'Success',
            description: 'Schedule successfully updated.',
            time: 3000
        });
      }
        // reload map data
        let events = [...this.state.events], index;
        events.map((_event,i) => {
          if(_event.id === this.state.details.id) {
            index = i;
          }
          return null;
        });
        events.splice(index,1)
        data.id = this.state.details.id;
        data.start = new Date(sd)
        data.end = new Date(ed)
        data.hexColor = this.getColor(data.intensity)
        data["orgtitle"] = data.title
        data.title = data.title + ", " + data.floor.name + ", " + data.zones.map((_val,index)=>_val.name)
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
        // else if (e.response.data.message.includes("ER_DUP_ENTRY")) {
        //   toast({
        //       type: 'error',
        //       icon: 'exclamation triangle',
        //       title: 'Error',
        //       description: 'Schedule with this name already exists!!',
        //       time: 3000
        //   });
        // }
      });
    }
  }
  
  submit = (data, sd, ed, mode, callback) => {
    let newDate = new Date(sd);
    let endDate = new Date(ed);
    let currDate = new Date()
    let diffInMilliSeconds = endDate - currDate;
    if(diffInMilliSeconds <= 180000) {
      this.close()
      toast({
        type: 'error',
        icon: 'exclamation triangle',
        title: 'Error',
        description: "Schedule is about to start / running",
        time: 3000
    });
    } else 
      this.processSchedules(data, sd, ed, mode, callback)
  }

  processData = () => {
    const data = {
      campus: {},
      building: {},
      floors: []
    };
    let temp = this.state.tree;
    if(temp.children!=undefined){
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
        let zones = [];
        for (let i = 0; i < n; i++) {
          let temp1 = temp.children[i];
          // console.log("temp1111111111111111111",temp1)
          temp1.children.map(v => zones.push(
            {
              text: v.title,
              value: v.id,
              key: v.id, 
              fid:temp1.id
            }
            ))
          // console.log("zone",zones)
          let floor = {
            text: temp1.title,
            value: temp1.id,
            key: temp1.id,
            zones: zones.filter(res=>res.fid==temp1.id)
          };
          data.floors.push(floor);
          data.floors.sort(function(a,b) {return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0);});
          // this.setState({zones:zones})
          this.setState({zonelist:zones})
          // console.log("floor",floor)
        }
      }
      temp = temp.children[0];
    }
    }
    this.setState({
      contextdata: data,
    }); 
    // console.log("this.state.details",this.state.details)
    // this.fetch();
    // console.log("this.state.contextdata.floors",this.state.contextdata.floors)
    // console.log("this.state.zones",this.state.zones)
  }
  
  // get all schedules
  fetch = () => {
    this.state.fdata==''||this.state.zdata=='' ?
    // message.error('Floor/Zone cant be empty',4)
    toast({
      type: 'error',
      icon: 'exclamation triangle',
      title: 'Error',
      description: "Floor/Zone cant be empty",
      time: 3000
  })
    :  
    api.schedule.fetch(this.state.fdata,this.state.zdata).then(res => {
      res.schedules==''?
        // message.error("No schedule created",4)
        toast({
          type: 'error',
          icon: 'exclamation triangle',
          title: 'Error',
          description: "No schedule created",
          time: 3000
      })  
      :
      // message.success("Data updated",4)
      toast({
        type: 'success',
        icon: 'check circle',
        title: 'Success',
        description: 'Data updated',
        time: 3000
    })
      let events = res.schedules
      for(let i in events){
        events[i].start = new Date(events[i].start)
        events[i].end = new Date(events[i].end)
        events[i].hexColor = this.getColor(events[i].intensity)
        events[i].orgtitle = events[i].title
        events[i].title = events[i].title + ", " + events[i].floor.name + ", " + events[i].zones.map((_val,index)=>_val.name)
      }
        this.setState({
          events: events
        });
    });
    // api.schedule.fetch().then(res => {
    //   let data = res.schedules
    //   for(let i in data){
    //     data[i].start = new Date(data[i].start)
    //     data[i].end = new Date(data[i].end)
    //     data[i].hexColor = this.getColor(data[i].intensity)
    //   }
    //   this.setState({
    //     events: data
    //   });
    // });
  }

  getColor = (intensity) => {
    // if(intensity==0)
    // return '#FF0000';
    // if(intensity==100)
    // return '#2EFF2E';
    // if(intensity > 0 && intensity <=99)
    // return '#ADD8E6'
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
  floorChange=(event,data)=>{
    // console.log("data floorchange------",data)
    // console.log("data floorchange------",event.target.value)
    this.setState({fdata:data.value})
    // console.log("before filter")
    // console.log("this.stae.zones",this.state.zones)
    let z_data=[];
    this.state.zonelist.map((el,i)=>{
      // console.log("data.value",data.value)
      // console.log("el.fid",el.fid)
      if(el.fid==data.value){
        z_data.push(el)
        z_data.sort(function(a,b) {return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0);});
        this.setState({zones:z_data})
      }
    })
    // console.log("after filter")
    // console.log("this.stae.zones",this.state.zones)
  }
  zoneChange=(event,data)=>{
    // console.log("data zonechange---------",data)
    // console.log("data zonechange---------",event.target.value)
    this.setState({zdata:data.value})
  }

  render() {
    const localizer = momentLocalizer(moment)
    const { modalCreate, modalView } = this.state 
    
    if(localStorage.getItem("roleID") !== "3"){
    return (
      <div>
      {/* <Navbar history={this.props.history} pathname={this.props.history.location.pathname} role={localStorage.getItem('roleID')}/> */}
      <Container>
        <Header
          as='h2'
          content="Schedule"
        />
           <div style={{marginBottom:"9px"}}> 
            <Dropdown placeholder='Floors' onChange={this.floorChange}  selection options={this.state.contextdata.floors} style={{marginRight:"5px"}} />
            <Dropdown placeholder='Zones'onChange={this.zoneChange} multiple selection options={this.state.zones}  style={{marginRight:"5px"}}/>
            <Button primary onClick={()=>this.fetch()}>Submit</Button>
            </div>                                      
        {/* {this.state.events.length > 0 ?  */}
          <Calendar
            selectable
            defaultView={Views.WEEK}
            localizer={localizer}
            views={['month', 'week', 'day']}
            timeslots={2}
            step={15}
            showMultiDayTimes
            events={this.state.events}
            scrollToTime={new Date(1970, 1, 1, 6)}
            onSelectEvent={this.view}
            onSelectSlot={this.handleSelect}
            eventPropGetter={(this.eventStyleGetter)}
          />
        
          {/* <Segment loading basic>
            <Placeholder fluid>
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
               <Placeholder.Line length='full' />
             </Placeholder>
          </Segment>
        } */}

        <SemanticToastContainer position="bottom-right" />

        {/* create schedule modal */}
        <Modal dimmer={"inverted"} size={"tiny"} open={modalCreate} onClose={this.close} closeOnDimmerClick={false}>
          <Modal.Header>Add Schedule</Modal.Header>
          <Modal.Content>
            <ScheduleForm mode="create" dateFormat={date} start={this.state.start} end={this.state.end} submit={this.submit} close={this.close} contextdata={this.state.contextdata} />
          </Modal.Content>
        </Modal>
        <Modal dimmer={"inverted"} size={"tiny"} open={modalView} onClose={this.close} closeOnDimmerClick={false}>
          <Modal.Header>Edit Schedule</Modal.Header>
          <Modal.Content>
            <ScheduleForm mode="edit" delete={this.handleConfirm} dateFormat={date} start={this.state.details.start} end={this.state.details.end} submit={this.submit} close={this.close} details={this.state.details} contextdata={this.state.contextdata} />
          </Modal.Content>
        </Modal>
        {/* view schedule modal */}
        <Modal dimmer={"inverted"} size={"tiny"} onClose={this.close} closeOnDimmerClick={false}>
          <Modal.Header>Schedule Details</Modal.Header>
          <Modal.Content>
            {Object.keys(this.state.details).length > 0 && <Item.Group>
              <Item>
                <Item.Content>
                  <Item.Header>Start</Item.Header>
                  <Item.Description>{date.format(this.state.details.start, 'ddd MMM DD at hh:mm A')}</Item.Description>
                </Item.Content>
                <Item.Content>
                  <Item.Header>End</Item.Header>
                  <Item.Description>{date.format(this.state.details.end, 'ddd MMM DD at hh:mm A')}</Item.Description>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Header>Title</Item.Header>
                  <Item.Description>{this.state.details.title}</Item.Description>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Header>Floor</Item.Header>
                  <Item.Description>{this.state.details.floor.name}</Item.Description>
                </Item.Content>
                <Item.Content>
                  <Item.Header>Zones</Item.Header>
                  <Item.Description><Label.Group circular>{this.state.details.zones.map((v, i) => <Label key={'label-' + i}>{v.name}</Label>)}</Label.Group></Item.Description>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Header>Action</Item.Header>
                  <Item.Description>
                    {
                      this.state.details.action === 0
                        ? <Label circular color={"red"} key={"red"}>Off</Label>
                        : <Label circular color={"green"} key={"green"}>On</Label>
                    }
                  </Item.Description>
                </Item.Content>
                <Item.Content>
                  <Item.Header>Intensity</Item.Header>
                  <Item.Description>
                    {this.state.details.action === 2 && (this.state.details.intensity >= 0 && this.state.details.intensity < 25) && <Popup
                      trigger={<Progress percent={this.state.details.intensity} progress size='medium' color='red' />}
                      content={'Intensity ' + this.state.details.intensity + '%'}
                      size='small'
                    />}
                    {this.state.details.action === 2 && (this.state.details.intensity >= 25 && this.state.details.intensity < 50) && <Popup
                      trigger={<Progress percent={this.state.details.intensity} progress size='medium' color='yellow' />}
                      content={'Intensity ' + this.state.details.intensity + '%'}
                      size='small'
                    />}
                    {this.state.details.action === 2 && (this.state.details.intensity >= 50 && this.state.details.intensity < 75) && <Popup
                      trigger={<Progress percent={this.state.details.intensity} progress size='medium' color='olive' />}
                      content={'Intensity ' + this.state.details.intensity + '%'}
                      size='small'
                    />}
                    {this.state.details.action === 2 && (this.state.details.intensity >= 75 && this.state.details.intensity <= 100) && <Popup
                      trigger={<Progress percent={this.state.details.intensity} progress size='medium' color='green' />}
                      content={'Intensity ' + this.state.details.intensity + '%'}
                      size='small'
                    />}
                  </Item.Description>
                </Item.Content>
              </Item>
            </Item.Group> }

          </Modal.Content>
          <Modal.Actions>
            <Popup
              trigger={<Button onClick={this.confirmOpen} color='red' icon labelPosition='left'><Icon name='trash' /> Delete </Button>}
              content='Delete schedule'
              size='small'
            />
            
            <Button onClick={this.close}>Close</Button>
          </Modal.Actions>
        </Modal>
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
      } else {
        return (
          <Redirect to="/statistics/building" />
        )
      }
  }
}

// function mapStateToProps(state) {
//   return {
//     tree: state.tree.data
//   };
// }

export default scheduler;