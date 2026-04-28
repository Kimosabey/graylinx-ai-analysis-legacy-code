import React, { Component } from "react";
import propTypes from "prop-types";
import {
  Form,
  Button,
  Input,
  Message,
  Dropdown,
  Confirm,
  Icon,
} from "semantic-ui-react";
import InlineError from "../../components/Messages/InlineError";
import DateTimePicker from "react-widgets/lib/DateTimePicker";
import "react-widgets/dist/css/react-widgets.css";
import "semantic-ui-css/semantic.min.css";
import momentLocalizer from "react-widgets-moment";
import moment from "moment";
import api from "../../api";
import { da } from "date-fns/locale";

moment.locale("en");
momentLocalizer();

class ScheduleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        title: "",
        floor: [],
        optionsFloor: [],
        zones: [],
        action: 0,
        type: 1,
        intensity: 100,
        channel: 0,
        start: this.props.start,
        end: this.props.end,
        intensityFlag: false,
        scheduleType: "exception",
        selectedDAys: [],
        recstart: moment().format("YYYY-MM-DD hh:mm A"),
        recend: moment().format("YYYY-MM-DD hh:mm A"),
        deviceType: "",
        deviceId: "",
      },
      loading: false,
      errors: {},
      floors: this.props.contextdata.floors,
      zones: [],
      selectedZones: [],
      confirmOpen: false,
      selectedEquipment: [],
      equipment_id: [],
      options: [
        { key: "sun", text: "Sunday", value: 0 },
        { key: "mon", text: "Monday", value: 1 },
        { key: "tue", text: "Tuesday", value: 2 },
        { key: "wed", text: "Wednesday", value: 3 },
        { key: "thu", text: "Thursday", value: 4 },
        { key: "fri", text: "Friday", value: 5 },
        { key: "sat", text: "Saturday", value: 6 },
      ],
      // SS_VENTILATOR_1,SS_SUBE_FAN,SS_HTE_FAN,SS_BRE_FAN,NONGL_SS_AHU,FRESH_AIR_UNIT
      equipment_type: [
        {
          key: "pp",
          text: "Primary Pump",
          value: "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
        },
        {
          key: "sp",
          text: "Secondary Pump",
          value: "NONGL_SS_SECONDARY_PUMPS",
        },
        {
          key: "cp",
          text: "Condenser Pump",
          value: "NONGL_SS_CONDENSER_PUMPS",
        },
        { key: "ct", text: "Cooling Tower", value: "NONGL_SS_COOLING_TOWER" },
        // { key: 'chiller', text: 'CPM', value: "NONGL_SS_AIR_COOLED_CHILLER"}
      ],
      // options:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    };
  }

  componentDidMount() {
    if (this.props.mode === "edit") {
      console.log(
        "this.props.contextdata.floors",
        this.props.contextdata.floors
      );
      console.log("this.props.details", this.props.details);
      this.setState({
        selectedZones: [],
        zones: this.props.contextdata.floors.find(
          (res) => res.value === this.props.details.floor.id
        ).zones,
      });

      // let obj = {
      //   id: this.props.details.floor.id,
      //   name: this.props.contextdata.floors.find(res => res.value === this.props.details.floor.id).text
      // }
      // this.setState({
      //   data: { ...this.state.data, floor: this.props.details.floor}
      // });
      this.state.data.floor = this.props.details.floor;
      this.state.data.zones = this.props.details.zones;

      this.setState({
        data: {
          ...this.state.data,
          title: this.props.details.title,
          action: this.props.details.action,
          intensity: this.props.details.intensity,
        },
      });
    }
  }

  confirmOpen = () => this.setState({ confirmOpen: true });

  onChange = (e, { name, value }) => {
    console.log("onchange for weeks", name, value);
    console.log("Field Name:", name);
    console.log("Selected Value:", value);
    if (name === "floor") {
      // this.setState({selectedZones: [], zones: this.props.contextdata.floors.find(res => res.value === value).zones})
      // let floors = [];
      // value = {
      //   id: value,
      //   name: this.props.contextdata.floors.find(res => res.value === value).text
      // }
      // value.map(v => floors.push(v))
      const { floors } = this.props.contextdata;
      const allValues = floors.map((option) => option.value);
      if (value.includes("ALL")) {
        if (this.state.selectedZones.includes("ALL")) {
          // Deselect "ALL" if it's already selected
          this.setState({
            data: { ...this.state.data, [name]: [] },
            selectedZones: [],
          });
        } else {
          // Select all floors when "ALL" is selected
          this.setState({
            selectedZones: allValues,
            data: { ...this.state.data, [name]: allValues },
          });
        }
      } else {
        // If a specific floor is selected while "ALL" is active, remove "ALL"
        const newSelected = value.filter((v) => v !== "ALL");
        this.setState({
          selectedZones: newSelected,
          data: { ...this.state.data, [name]: newSelected },
        });

        // Automatically select "ALL" if all individual options are selected
        if (newSelected.length === allValues.length) {
          this.setState({
            selectedZones: allValues,
            data: { ...this.state.data, [name]: allValues },
          });
        }
      }
      // this.setState({
      //   data: { ...this.state.data, [name]: value },
      //   selectedZones: value
      // });
    } else if (name === "zones") {
      let zones = [];
      // value.map(v => zones.push({
      //   id: v,
      //   name: this.state.zones.find(res => res.value === v).text
      // }))
      value.map((v) => zones.push(v));
      this.setState({
        data: { ...this.state.data, [name]: zones },
        selectedZones: value,
      });
    } else if (name === "intensity") {
      this.setState({
        data: {
          ...this.state.data,
          [name]: parseInt(value),
          intensityFlag: true,
        },
      });
    } else if (name === "action") {
      if (value == 1) {
        this.setState({
          data: {
            ...this.state.data,
            [name]: value,
            intensity: 100,
            intensityFlag: false,
          },
        });
      } else {
        this.setState({
          data: { ...this.state.data, [name]: value, intensityFlag: false },
        });
      }
    } else if (name == "scheduleType") {
      this.setState({
        data: { ...this.state.data, [name]: value },
      });
    } else if (name == "weekData") {
      // this.setState({
      //   data: { ...this.state.data, [name]: value}
      // });
      const week = this.state.options;
      const allValues = week.map((option) => option.value);
      console.log("all values in eqp", allValues);
      if (value.includes("ALL")) {
        if (this.state.selectedZones.includes("ALL")) {
          console.log('"ALL" already selected — Deselecting all');
          // Deselect "ALL" if it's already selected
          this.setState({
            data: { ...this.state.data, [name]: [] },
            selectedDAys: [],
          });
        } else {
          console.log("Selecting ALL values");
          // Select all floors when "ALL" is selected
          this.setState({
            selectedDAys: allValues,
            data: { ...this.state.data, [name]: allValues },
          });
        }
      } else {
        // If a specific floor is selected while "ALL" is active, remove "ALL"
        const newSelected = value.filter((v) => v !== "ALL");
        console.log("New Selected after removing ALL:", newSelected);
        this.setState({
          selectedDAys: newSelected,
          data: { ...this.state.data, [name]: newSelected },
        });

        // Automatically select "ALL" if all individual options are selected
        if (newSelected.length === allValues.length) {
          console.log("All individual values selected — Auto-selecting ALL");
          this.setState({
            selectedDAys: allValues,
            data: { ...this.state.data, [name]: allValues },
          });
        }
      }
    } else if (name == "deviceType") {
      console.log("cahange in EQPTYPE", name, ":", value);
      // this.setState({
      //         data:{ ...this.state.data, [name]: value },
      //       })
      // const  eqp  =
      // const allValues = eqp.map(option => option.value);
      // console.log("all values in eqp",allValues)
      // if (value.includes('ALL')) {
      //   if (this.state.selectedZones.includes('ALL')) {
      //     // Deselect "ALL" if it's already selected
      //     this.setState({
      //       data:{ ...this.state.data, [name]: [] },
      //       selectedEquipment: []
      //     })
      //   } else {
      //     // Select all floors when "ALL" is selected
      //     this.setState({ selectedEquipment: allValues,
      //       data:{ ...this.state.data, [name]: allValues }
      //      });
      //   }
      //   api.floor.cpmGetDevData().then((ibmsSnapshot)=>{
      //     let optflr = [], eqp = ['NONGL_SS_AHU','NONGL_SS_CSU','NONGL_SS_AIR_COOLED_CHILLER']
      //     eqp.map((selectedEqpMapped)=>{
      //       if(ibmsSnapshot[selectedEqpMapped]){
      //              Object.values(ibmsSnapshot[selectedEqpMapped]).map((eqpFlr)=>{
      //                this.state.floors.map((eachflr)=>{
      //                  if(eachflr.key == eqpFlr.Equipment_Group){
      //                      optflr.push(eachflr)
      //                  }
      //              })
      //              })
      //       }
      //      })
      //      const uniqueData = optflr.filter((item, index, self) =>
      //       index === self.findIndex((t) => t.text === item.text)
      //     );
      //     this.setState({optionsFloor: uniqueData})
      //   })
      // }else {
      console.log("my value---->", value);
      api.floor.cpmGetDevData().then((ibmsSnapshot) => {
        console.log("ibmsSnapshot", ibmsSnapshot[value]);
        const ab = ibmsSnapshot[value];
        let eqp_ids = [];
        // Object.entries(ab).map(([key, value], index) => ({
        //   key: index,
        //   text: value.name,
        //   value: key // or value.id if you want
        // }));
        Object.entries(ab).forEach(([key, value], index) => {
          console.log("key ", key, "text", value.name, "value", index);
          eqp_ids.push({
            key: index,
            text: value.name,
            value: key,
          });
        });
        this.setState({
          device_id: eqp_ids,
          data: { ...this.state.data, [name]: value },
        });
        // console.log("only eqp",eqp)
        //   let optflr = []
        //   value.map((selectedEqpMapped)=>{
        //     if(ibmsSnapshot[selectedEqpMapped]){
        //            Object.values(ibmsSnapshot[selectedEqpMapped]).map((eqpFlr)=>{
        //              this.state.floors.map((eachflr)=>{
        //                if(eachflr.key == eqpFlr.Equipment_Group){
        //                    optflr.push(eachflr)
        //                }
        //            })
        //            })
        //     }
        //    })
        //    const uniqueData = optflr.filter((item, index, self) =>
        //     index === self.findIndex((t) => t.text === item.text)
        //   );
        //   this.setState({optionsFloor: uniqueData})
      });

      //////////////////////////////////////
      // api.floor.cpmGetDevData().then((res)=>{
      //   value.map((val)=>{
      //     if(res[val]){
      //       let optflr = []
      //   let data=Object.values(res[val]).sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      //   Object.values(data).map((eqpFlr)=>{
      //     this.state.floors.map((allflr)=>{
      //       if(eqpFlr.Equipment_Group == allflr.key){
      //         console.log("allflr",allflr)
      //         optflr.push(allflr)
      //       }
      //     })
      //   })
      //   this.setState({optionsFloor: optflr})
      //   // setAllEquipmentData(data)
      //   // setDeviceImage(true)
      //  }
      // })
      // })
      // console.log("optionsFloor",this.state.floors)
      // If a specific floor is selected while "ALL" is active, remove "ALL"
      // const newSelected = value.filter(v => v !== 'ALL');
      // this.setState({ selectedEquipment: newSelected,
      //   data:{ ...this.state.data, [name]: newSelected }
      //  });

      // Automatically select "ALL" if all individual options are selected
      // if (newSelected.length === allValues.length) {
      //   this.setState({ selectedEquipment: allValues,
      //     data:{ ...this.state.data, [name]: allValues }
      //    });
      // }
      // }
    } else if (name == "deviceId") {
      console.log("00000000000000000name", name, ":", value);
      this.setState({
        data: { ...this.state.data, [name]: value },
      });
    } else {
      this.setState({
        data: { ...this.state.data, [name]: value },
      });
    }
  };

  onSubmit = () => {
    console.log("data------", this.state.data);
    const { mode } = this.props;
    console.log("mode", mode);
    const errors = this.validate(this.state.data);
    console.log("i am error in schform144", errors);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.setState({ loading: true });
      // let sDate = moment(this.state.data.start).format('YYYY-MM-DD HH:mm:ss');
      // let eDate = moment(this.state.data.end).format('YYYY-MM-DD HH:mm:ss')
      let sDate;
      let eDate;
      console.log("this satate----befro submeet", this.state);
      if (this.state.data.scheduleType == "exception") {
        sDate = moment(this.state.data.start).format("MM-DD-YYYY HH:mm:ss");
        eDate = moment(this.state.data.end).format("MM-DD-YYYY HH:mm:ss");
      } else {
        console.log("IN RECURRING ST & ET", this.state.data);
        sDate = moment(this.state.data.start).format("HH:mm");
        eDate = moment(this.state.data.end).format("HH:mm");
      }
      this.props.submit(this.state.data, sDate, eDate, mode, () => {
        this.setState({ loading: false });
      }) /*.catch(err=>this.setState({errors:err.response.data.errors}))*/;
    }
  };

  validate = (data) => {
    const errors = {};
    if (!data.deviceType) errors.deviceType = "deviceType  cannot be Empty!";
    if (data.title) {
      if (data.title.length >= 5 && data.title.length <= 20) {
        if (
          /[a-zA-Z_-]/.test(data.title) &&
          /^[A-Za-z]/.test(data.title) &&
          !/[\W][-]/.test(data.title)
        ) {
          //
        } else {
          errors.title =
            "Only alphabets, numbers, underscore, hyphen are allowed. Must begin with an alphabet";
        }
      } else {
        errors.title = "Title should be of length 5 to 10 characters";
      }
    } else {
      errors.title = "Title Cannot be Empty!";
    }
    // if (!data.title) errors.title = "Title Cannot be Empty!";
    if (!data.deviceType.length)
      errors.deviceType = "DeviceType Cannot be Empty!";
    if (!data.deviceType.length)
      errors.deviceType = "DeviceType Cannot be Empty!";
    if (data.end <= data.start)
      errors.date = "End date should be greater than start date";
    // if (!data.action) errors.action = "Action Cannot be Empty!";
    // if (!data.intensity) errors.intensity = "Intensity Cannot be Empty!";
    return errors;
  };

  render() {
    const { data, errors, loading } = this.state;
    const { mode } = this.props;
    const { floors } = this.props.contextdata;
    const week = this.state.options;
    const equipment_type = this.state.equipment_type;
    // const optionsFloor = [{ key: 'all', text: 'ALL', value: 'ALL' }, ...floors];
    // const optionsFloor = [{ key: 'all', text: 'ALL', value: 'ALL' }, ...floors];
    const optionsWeek = [{ key: "all", text: "ALL", value: "ALL" }, ...week];
    const optionsEquipments = equipment_type;
    const device_ids = this.state.device_id;
    const optionDevices = device_ids;
    return (
      <Form loading={loading}>
        {errors.global && (
          <Message negative>
            <Message.Header>Something went wrong</Message.Header>
            <p>{errors.global}</p>
          </Message>
        )}
        {mode === "create" ? (
          <Form.Group inline>
            <label>Schedule Type</label>
            <Form.Radio
              error={!!errors.scheduleType}
              label="Exception"
              value={"exception"}
              name="scheduleType"
              checked={data.scheduleType === "exception"}
              onChange={this.onChange}
            />
            <Form.Radio
              error={!!errors.scheduleType}
              label="Recurring"
              value={"recurring"}
              name="scheduleType"
              checked={data.scheduleType === "recurring"}
              onChange={this.onChange}
            />
            {errors.scheduleType && <InlineError text={errors.scheduleType} />}
          </Form.Group>
        ) : (
          <Form.Group inline>
            <label>Schedule Type</label>
            <Form.Radio
              error={!!errors.action}
              label="Exception"
              value={"exception"}
              name="scheduleType"
              checked={data.scheduleType === 0}
              onChange={this.onChange}
            />
            <Form.Radio
              error={!!errors.scheduleType}
              label="Recurring"
              value={"recurring"}
              name="scheduleType"
              checked={data.scheduleType === 1 || data.scheduleType === 2}
              onChange={this.onChange}
            />
            {errors.scheduleType && <InlineError text={errors.scheduleType} />}
          </Form.Group>
        )}
        {mode === "create" && data.scheduleType === "recurring" ? (
          <Form.Group>
            <Form.Field error={!!errors.date}>
              <label>From</label>
              <DateTimePicker
                date={false}
                name="start"
                value={new Date(data.start)}
                step={15}
                onChange={(value) =>
                  this.setState({ data: { ...this.state.data, start: value } })
                }
              />
            </Form.Field>
            <Form.Field error={!!errors.date}>
              <label>To</label>
              <DateTimePicker
                date={false}
                name="end"
                value={new Date(data.end)}
                step={15}
                onChange={(value) =>
                  this.setState({ data: { ...this.state.data, end: value } })
                }
              />
            </Form.Field>
          </Form.Group>
        ) : mode === "create" && data.scheduleType === 0 ? (
          <Form.Group>
            <Form.Field error={!!errors.date}>
              <label>From</label>
              <DateTimePicker
                name="start"
                value={new Date(data.start)}
                step={15}
                onChange={(value) =>
                  this.setState({ data: { ...this.state.data, start: value } })
                }
              />
            </Form.Field>
            <Form.Field error={!!errors.date}>
              <label>To</label>
              <DateTimePicker
                name="end"
                value={new Date(data.end)}
                step={15}
                onChange={(value) =>
                  this.setState({ data: { ...this.state.data, end: value } })
                }
              />
            </Form.Field>
          </Form.Group>
        ) : (
          <Form.Group>
            <Form.Field error={!!errors.date}>
              <label>From</label>
              <DateTimePicker
                name="start"
                value={new Date(data.start)}
                step={15}
                onChange={(value) =>
                  this.setState({ data: { ...this.state.data, start: value } })
                }
              />
            </Form.Field>
            <Form.Field error={!!errors.date}>
              <label>To</label>
              <DateTimePicker
                name="end"
                value={new Date(data.end)}
                step={15}
                onChange={(value) =>
                  this.setState({ data: { ...this.state.data, end: value } })
                }
              />
            </Form.Field>
          </Form.Group>
        )}
        {mode === "create" && data.scheduleType === "recurring" ? (
          <Form.Field error={!!errors.floor}>
            <label>Weeks</label>
            <Dropdown
              name="weekData"
              placeholder="Weeks"
              fluid
              multiple
              selection
              // options={this.state.options}
              options={optionsWeek}
              onChange={this.onChange}
              onMouseDown={(e) => e.preventDefault()}
              defaultValue={this.state.selected}
              value={this.state.selectedDAys}
            />
          </Form.Field>
        ) : (
          <></>
        )}
        {mode === "edit" && errors.date && (
          <Form.Field>
            {errors.date && <InlineError text={errors.date} />}
          </Form.Field>
        )}
        <Form.Field error={!!errors.title}>
          <label>Title</label>
          {mode === "create" ? (
            <Input
              placeholder="Schedule Title"
              name="title"
              onChange={this.onChange}
              maxLength={25}
            />
          ) : (
            <Input
              name="title"
              defaultValue={data.title}
              onChange={this.onChange}
              maxLength={25}
            />
          )}
          {errors.title && <InlineError text={errors.title} />}
        </Form.Field>
        <Form.Field error={!!errors.floor}>
          <label>Device Type</label>
          {mode === "create" ? (
            <Dropdown
              name="deviceType"
              options={optionsEquipments}
              onChange={this.onChange}
              placeholder="Device Type"
              value={this.state.device_type}
              fluid
              single
              selection
            />
          ) : (
            // <Dropdown name="equipment_type" options={optionsEquipments} onChange={this.onChange} placeholder='Equipment_type' value={this.state.equipment_type}  single selection />
            //   <Dropdown
            //   name="Equipment_type"
            //   options={optionsEquipments}
            //   placeholder='Equipment_type'
            //   onChange={this.onChange}
            //   value={this.state.equipment_type}
            //   fluid
            //   selection
            // />
            <Form.Select
              name="floor"
              value={this.state.data.floor.id}
              options={this.props.contextdata.floors}
              onChange={this.onChange}
              placeholder="Floor"
            />
          )}
          {errors.floor && <InlineError text={errors.floor} />}
        </Form.Field>
        <Form.Field error={!!errors.floor}>
          <label>Device</label>
          {mode === "create" ? (
            <Dropdown
              name="deviceId"
              options={device_ids}
              onChange={this.onChange}
              placeholder="Device"
              value={this.state.data.deviceId}
              single
              selection
            />
          ) : (
            <Form.Select
              name="floor"
              value={this.state.data.floor.id}
              options={this.props.contextdata.floors}
              onChange={this.onChange}
              placeholder="Floor"
            />
          )}
          {errors.floor && <InlineError text={errors.floor} />}
        </Form.Field>

        {/* <Form.Field error={!!errors.floor}>
            <label>Floor</label>
            {mode === "create" ?
              <Dropdown name="floor" options={this.state.optionsFloor} onChange={this.onChange} placeholder='Floor' value={this.state.selectedZones} fluid multiple selection />
              : <Form.Select name="floor" value={this.state.data.floor.id} options={this.props.contextdata.floors} onChange={this.onChange} placeholder='Floor' />
            }
            {errors.floor && <InlineError text={errors.floor} />}
          </Form.Field> */}
        {/*
          <Form.Field error={!!errors.zones}>
            <label>Zones</label>
            {mode === "create" ?
              <Dropdown value={this.state.selectedZones} name="zones" placeholder='Zones' fluid multiple selection options={this.state.zones} onChange={this.onChange} onMouseDown={(e)=>e.preventDefault()}/>
              : <Dropdown value={this.state.data.zones.map(_d => _d.id)} name="zones" placeholder='Zones' fluid multiple selection options={this.state.zones} onChange={this.onChange} onMouseDown={(e)=>e.preventDefault()}/>
            }
            {errors.zones && <InlineError text={errors.zones} />}
          </Form.Field>
          */}
        {mode === "create" ? (
          <Form.Group inline>
            <label>Action</label>
            <Form.Radio
              error={!!errors.action}
              label="OFF"
              value={0}
              name="action"
              checked={data.action === 0}
              onChange={this.onChange}
            />
            <Form.Radio
              error={!!errors.action}
              label="ON"
              value={1}
              name="action"
              checked={data.action === 1}
              onChange={this.onChange}
            />
            {errors.action && <InlineError text={errors.action} />}
          </Form.Group>
        ) : (
          <Form.Group inline>
            <label>Action</label>
            <Form.Radio
              error={!!errors.action}
              label="OFF"
              value={0}
              name="action"
              checked={data.action === 0}
              onChange={this.onChange}
            />
            <Form.Radio
              error={!!errors.action}
              label="ON"
              value={1}
              name="action"
              checked={data.action === 1 || data.action === 2}
              onChange={this.onChange}
            />
            {errors.action && <InlineError text={errors.action} />}
          </Form.Group>
        )}
        {/* {mode === "create" ?
            <Form.Field  error={!!errors.intensity} style={{display: data.action === 1 ? 'block' : 'none' }}>
              <Form.Input
                label={`Intensity: ${data.intensity} `}
                min={10}
                max={100}
                onChange={this.onChange}
                step={10}
                type='range'
                value={data.duration}
                name='intensity'
              />
            </Form.Field>
            :
            <Form.Field  error={!!errors.intensity} style={{display: data.action === 1 || data.action === 2 ? 'block' : 'none' }}>
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
          }  */}
        {mode === "create" ? (
          <div>
            <Button
              onClick={this.onSubmit}
              positive
              floated="right"
              style={{ marginBottom: "5px" }}
            >
              Save
            </Button>
            <Button
              onClick={this.props.close}
              floated="right"
              style={{ marginBottom: "5px" }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <Button
              onClick={this.onSubmit}
              positive
              floated="right"
              style={{ marginBottom: "5px" }}
            >
              Update
            </Button>
            <Button
              onClick={this.props.confirmOpen}
              color="red"
              icon
              labelPosition="left"
            >
              <Icon name="trash" /> Delete{" "}
            </Button>
            <Button
              onClick={this.props.close}
              floated="right"
              style={{ marginBottom: "5px" }}
            >
              Cancel
            </Button>
          </div>
        )}
        <Confirm
          size="small"
          open={this.state.confirmOpen}
          content="Are you sure you want to delete schedule?"
          onCancel={() => this.setState({ confirmOpen: false })}
          onConfirm={this.props.delete}
        />
      </Form>
    );
  }
}

ScheduleForm.propTypes = {
  submit: propTypes.func.isRequired,
};

export default ScheduleForm;
