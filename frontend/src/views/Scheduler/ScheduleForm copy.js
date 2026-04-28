import React, { Component } from "react";
import propTypes from "prop-types";
import { Form, Button, Input, Message, Dropdown, Confirm, Icon } from "semantic-ui-react";
import InlineError from "../../components/Messages/InlineError";
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import 'react-widgets/dist/css/react-widgets.css';
import 'semantic-ui-css/semantic.min.css'
//import dateFnsLocalizer from 'react-widgets-date-fns';
// import momentLocalizer from 'react-widgets-moment';
// import moment from 'moment';
const { compareAsc, format } = require('date-fns');
// import momentLocalizer from 'react-widgets-moment';
// import moment from 'moment';
// import { en } from "date-fns/locale";
// moment.locale('en')
// momentLocalizer()

class ScheduleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        title: '',
        floor: '',
        zones: [],
        action: 0,
        type: 0,
        type: 1,
        intensity: 100,
        channel: 0,
        start: this.props.start,
        end: this.props.end,
        intensityFlag: false
      },
      loading: false,
      errors: {},
      zones: [],
      selectedZones: [],
      confirmOpen: false
    };
  }
  
  componentDidMount() {
    if(this.props.mode === "edit") {
      this.setState({selectedZones: [], zones: this.props.contextdata.floors.find(res => res.value === this.props.details.floor.id).zones})
      
      // let obj = {
      //   id: this.props.details.floor.id,
      //   name: this.props.contextdata.floors.find(res => res.value === this.props.details.floor.id).text
      // }
      // this.setState({
      //   data: { ...this.state.data, floor: this.props.details.floor}
      // });
      this.state.data.floor = this.props.details.floor
      this.state.data.zones = this.props.details.zones
      
      this.setState({
        data: { ...this.state.data, 
          title: this.props.details.title, 
          action: this.props.details.action,
          intensity: this.props.details.intensity
        }
      })
    }
  }

  confirmOpen = () => this.setState({ confirmOpen: true })

  onChange = (e, { name, value }) => {
    if(name === 'floor') {
      this.setState({selectedZones: [], zones: this.props.contextdata.floors.find(res => res.value === value).zones})
      
      value = {
        id: value,
        name: this.props.contextdata.floors.find(res => res.value === value).text
      }
      this.setState({
        data: { ...this.state.data, [name]: value }
      });
    } else if(name === 'zones') {
      let zones = [];
      value.map(v => zones.push({
        id: v,
        name: this.state.zones.find(res => res.value === v).text
      }))
      this.setState({
        data: { ...this.state.data, [name]: zones },
        selectedZones: value
      });
    } else if (name === 'intensity'){
      this.setState({
        data: { ...this.state.data, [name]: parseInt(value), intensityFlag: true}
      });
    } else if (name === 'action') {
      this.setState({
        data: { ...this.state.data, [name]: value, intensityFlag: false }
      });
    } else if(name==='type'){ 
      this.setState({
        data: { ...this.state.data, [name]: value, intensityFlag: false }
      });
    }else {
      this.setState({
        data: { ...this.state.data, [name]: value }
      });
    }
  }

  onSubmit = () => {
    const { mode } = this.props;
    console.log("mode",mode)
    const errors = this.validate(this.state.data);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.setState({ loading: true });
      let sDate = format(new Date(this.state.data.start), 'yyyy-MM-dd HH:mm:ss');
      let eDate = format(new Date(this.state.data.end), 'yyyy-MM-dd HH:mm:ss');
      this.props.submit(this.state.data, sDate, eDate, mode, () => {
        this.setState({ loading: false });
      })/*.catch(err=>this.setState({errors:err.response.data.errors}))*/;
    }
  };

  validate = data => {
    const errors = {};
    if (!data.floor) errors.floor = "Floor Cannot be Empty!";
    if(data.title) {
      if(data.title.length >=5 && data.title.length <= 10){
        if(/[a-zA-Z_-]/.test(data.title) && /^[A-Za-z]/.test(data.title) && !/[\W][-]/.test(data.title)) {
          // 
        } else {
          errors.title = "Only alphabets, numbers, underscore, hyphen are allowed. Must begin with an alphabet"
        }
      } else {
        errors.title = "Title should be of length 5 to 10 characters"
      }
    } else {
      errors.title = "Title Cannot be Empty!";
    }
    // if (!data.title) errors.title = "Title Cannot be Empty!";
    if (!data.zones.length) errors.zones = "Zones Cannot be Empty!";
    if (data.end <= data.start) errors.date = "End date should be greater than start date"
    // if (!data.action) errors.action = "Action Cannot be Empty!";
    // if (!data.intensity) errors.intensity = "Intensity Cannot be Empty!";
    return errors;
  };

  render() {
    const { data, errors, loading } = this.state;
    const { mode } = this.props;

    return (
        <Form loading={loading}>
          {errors.global && <Message negative>
            <Message.Header>
              Something went wrong
            </Message.Header>
            <p>{errors.global}</p>
          </Message>}
          {mode === "create" ?
            <Form.Field>
              <label>Duration</label>
              {(format(new Date(this.props.start), 'yyyy-MM-dd HH:mm a') + ' to ' + (format(new Date(this.props.end), 'yyyy-MM-dd HH:mm a')))}
            </Form.Field>
            : <Form.Group>
                <Form.Field error={!!errors.date}>
                  <label>From</label>
                  <DateTimePicker
                    name="start"
                    value={new Date(data.start)} 
                    step={15}
                    onChange={value => this.setState({ data: { ...this.state.data, start: value } })}
                  />
                </Form.Field>
                <Form.Field error={!!errors.date}>
                  <label>To</label>
                    <DateTimePicker
                      name="end"
                      value={new Date(data.end)} 
                      step={15}
                      onChange={value => this.setState({ data: { ...this.state.data, end: value } })}
                    />
                </Form.Field>
            </Form.Group>
          }
          {mode === "edit" && errors.date &&
            <Form.Field>
              {errors.date && <InlineError text={errors.date} />}
            </Form.Field>
          }
          <Form.Field error={!!errors.title}>
            <label>Title</label>
            {mode === "create" ?
              <Input placeholder='Schedule Title' name="title" onChange={this.onChange} maxLength={10} />
              : <Input name="title" defaultValue={data.title} onChange={this.onChange} maxLength={10} />
            }
            {errors.title && <InlineError text={errors.title} />}
          </Form.Field>
          <Form.Field error={!!errors.floor}>
            <label>Floor</label>
            {mode === "create" ?
              <Form.Select name="floor" options={this.props.contextdata.floors} onChange={this.onChange} placeholder='Floor' />
              : <Form.Select name="floor" value={this.state.data.floor.id} options={this.props.contextdata.floors} onChange={this.onChange} placeholder='Floor' />
            }
            {errors.floor && <InlineError text={errors.floor} />}
          </Form.Field>
          <Form.Field error={!!errors.zones}>
            <label>Zones</label>
            {mode === "create" ?
              <Dropdown value={this.state.selectedZones} name="zones" placeholder='Zones' fluid multiple selection options={this.state.zones} onChange={this.onChange} onMouseDown={(e)=>e.preventDefault()}/>
              : <Dropdown value={this.state.data.zones.map(_d => _d.id)} name="zones" placeholder='Zones' fluid multiple selection options={this.state.zones} onChange={this.onChange} onMouseDown={(e)=>e.preventDefault()}/>
            }
            {errors.zones && <InlineError text={errors.zones} />}
          </Form.Field>
          {mode === "create" ?
            <Form.Group inline>
              <label>Action</label>
              <Form.Radio error={!!errors.action}
                label='OFF'
                value={0}
                name='action'
                checked={data.action === 0}
                onChange={this.onChange}
              />
              <Form.Radio error={!!errors.action}
                label='ON'
                value={1}
                name='action'
                checked={data.action === 1}
                onChange={this.onChange}
              />
              {errors.action && <InlineError text={errors.action} />}
            </Form.Group>
            :
            <Form.Group inline>
              <label>Action</label>
              <Form.Radio error={!!errors.action}
                label='OFF'
                value={0}
                name='action'
                checked={data.action === 0}
                onChange={this.onChange}
              />
              <Form.Radio error={!!errors.action}
                label='ON'
                value={1}
                name='action'
                checked={data.action === 1 || data.action === 2}
                onChange={this.onChange}
              />
              {errors.action && <InlineError text={errors.action} />}
            </Form.Group>
          }
          {mode === "create" ?
            <Form.Group inline>
              <label>Type</label>
              <Form.Radio error={!!errors.type}
                label='LMS'
                value={0}
                name='type'
                checked={data.type === 1}
                onChange={this.onChange}
              />
              <Form.Radio error={!!errors.type}
                label='Personal Cooling'
                value={1}
                name='type'
                checked={data.type === 0}
                onChange={this.onChange}
              />
              {errors.type && <InlineError text={errors.type} />}
            </Form.Group>
            :
            <Form.Group inline>
              <label>Type</label>
              <label>{data.type===1?'Personal Cooling':'LMS'}</label>
              {/* <Form.Radio error={!!errors.action}
                label='OFF'
                value={0}
                name='action'
                checked={data.action === 0}
                onChange={this.onChange}
              />
              <Form.Radio error={!!errors.action}
                label='ON'
                value={1}
                name='action'
                checked={data.action === 1 || data.action === 2}
                onChange={this.onChange}
              /> */}
              {errors.type && <InlineError text={errors.type} />}
            </Form.Group>
          }
          {mode === "create" ?
            <Form.Field  error={!!errors.intensity} style={{display: data.action === 1 ? 'block' : 'none' }}>
              <Form.Input
                label={`Intensity: ${data.intensity} `}
                min={10}
                max={100}
                onChange={this.onChange}
                step={10}
                type='range'
                value={data.intensity}
                name='intensity'
              />
            </Form.Field>
            :
            <Form.Field  error={!!errors.intensity} style={{display: data.action === 1 || data.action === 2 ? 'block' : 'none' }}>
              <Form.Input
                label={`Intensity: ${data.intensity === 0?'100':data.intensity} `}
                min={10}
                max={100}
                onChange={this.onChange}
                step={10}
                type='range'
                value={data.intensity === 0?'100':data.intensity}
                name='intensity'
              />
            </Form.Field>
          } 
            {mode === "create" ?
              <div>
                <Button onClick={this.onSubmit} positive floated="right" style={{"marginBottom":"5px"}}>Save</Button>
                <Button onClick={this.props.close} floated="right" style={{"marginBottom":"5px"}}>Cancel</Button>
              </div>
              : 
              <div>
                <Button onClick={this.onSubmit} positive floated="right" style={{"marginBottom":"5px"}}>Update</Button>
                <Button onClick={this.props.confirmOpen} color='red' icon labelPosition='left'><Icon name='trash' /> Delete </Button>
                <Button onClick={this.props.close} floated="right" style={{"marginBottom":"5px"}}>Cancel</Button>
              </div>
            }
            <Confirm
              size="small"
              open={this.state.confirmOpen}
              content='Are you sure you want to delete schedule?'
              onCancel={() => this.setState({ confirmOpen: false})}
              onConfirm={this.props.delete}
          />
        </Form>
    );
  }
}

ScheduleForm.propTypes = {
  submit: propTypes.func.isRequired
};

export default ScheduleForm;