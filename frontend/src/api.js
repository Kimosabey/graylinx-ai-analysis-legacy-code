import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();
// axios.defaults.baseURL ="https://glint.graylinx.ai";
// axios.defaults.baseURL =
//     process.env.NODE_ENV !== "production" ? "https://192.168.1.157/" : "http://192.168.0.101:4004";

// before build comment line 10 to 13
axios.defaults.baseURL =
  process.env.NODE_ENV !== "production"
   ? "https://localhost:443/"
   // ? "https://192.168.1.116:443/"
    : "https://localhost:8543/";
// axios.defaults.baseURL =
//   process.env.NODE_ENV !== "production"
//     ? "https://192.168.1.129/"
//     : "https://localhost:8543/";
//"https://192.168.1.109:8053/"
// process.env.NODE_ENV !== "production" ? "http://localhost.charlesproxy.com/" : "http://192.168.0.101:4004";
//chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security
export default {
  auth: {
    login: (credentials, f) =>
      axios
        .post("/v1/auth/login", { credentials, force: f })
        .then((res) => res.data),
    logout: (data) =>
      axios
        .post(
          "/v1/auth/logout",
          { data },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
    resetPassword: (data, token) =>
      axios
        .post("/v1/auth/reset-password", data, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res)
        .catch((err) => {
          console.log("MyError:", err);
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    forgotPassword: (data, token) =>
      axios.post("/v1/auth/forgot-password", data).then((res) => res),
    // .catch((err) => {
    //     console.log("MyError:", err)
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),
  },
  dashboard: {
    getMetricData: (id) =>
      axios
        .get(`/v1/gl_analytics/subsystemId/${id}`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getENergyConsumedData: (asset, time) =>
      axios
        .get(
          `/v1/gl_analytics/energyConsumptionChart?device_type=${asset}&time_range=${time}`,
          {
            headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
          }
        )
        .then((res) => res.data),
    getAssetHealthEnergydData: (asset, time) =>
      axios
        .get(
          `/v1/gl_analytics/assetHealthEnergy?device_type=${asset}&time_range=${time}`,
          {
            headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
          }
        )
        .then((res) => res.data),
    getheatMapEnergydData: (asset, time) =>
      axios
        .get(
          `/v1/gl_analytics/heatMapEnergy?device_type=${asset}&time_range=${time}`,
          {
            headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
          }
        )
        .then((res) => res.data),
  },

  campus: {
    getTreeList: (id) =>
      axios
        .get(`/v1/campuses/${id}/tree?context=lms`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    glZones: (id) =>
      axios
        .get(`/v1/gl_zone/${id}`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    newglZones: (id) =>
      axios
        .get(`/v1/gl_zone/${id}/sch`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    weather: (req) =>
      axios.get(`/v1/newapis/outDoorWeatherApi`, req).then((res) => res.data),
    getHvacTreeList: (id) =>
      axios
        .get(`/v1/gl_zone/${id}/sch`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },
  users: {
    getClientDetails: (mailID) =>
      axios
        .get(`/v1/coworking/${mailID}/get_client_details`)
        .then((res) => res.data),
    uploadUsersData: (data) =>
      axios
        .post(`/v1/coworking/upload_cws_users_data`, data)
        .then((res) => res.data),
    usersData: (data) =>
      axios.get(`/v1/coworking/cws_users`, data).then((res) => res.data),
    deleteUser: (req) =>
      axios.post(`/v1/coworking/delete_cws_users`, req).then((res) => res.data),
  },
  config_control: {
    getConfigDetails: () =>
      axios.get(`/v1/campuses/configuration`).then((res) => res.data),

    configuration: (data) =>
      axios
        .post(`/v1/campuses/configuration`, {
          temperature: { min: data.minTemp, max: data.maxTemp },
          humidity: { min: data.minHum, max: data.maxHum },
          lux: { min: data.minLux, max: data.maxLux },
          overParked: { overParked: data.overParked },
          wastage: { wastage: data.wastage },
        })
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // })
  },
  schedule: {
    create: (data, user) =>
      axios
        .post(
          "/v1/schedules",
          { data, user },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
    edit: (id, data, user) =>
      axios
        .post(
          `/v1/schedules/${id}/edit`,
          { data, user },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
    // fetch: () =>
    //     axios
    //         .get(`/v1/schedules/fetch`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
    //         .then((res) => {
    //             return res.data
    //         })
    //         .catch((err) => {
    //             if (err.response.status === 440 || err.response.status === 401) {
    //                 window.location.reload();
    //             }
    //         }),
    fetch: (floorid, zoneid) =>
      axios
        .get(`/v1/schedules/${floorid}/${zoneid}`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("lmsJWT")) },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    delete: (scheduleID, user) =>
      axios
        .post(`/v1/schedules/${scheduleID}`, user, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    reccuringupdate: (scheduleID, data) =>
      axios
        .post(
          `/v1/hvac_recuuring_schedule/${scheduleID}/updateschedule`,
          data,
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    recurringfetch: () =>
      axios
        .get(`/v1/hvac_recuuring_schedule/getSchedule`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
  },

  hvac_schedule: {
    create: (data, user) =>
      axios
        .post(
          "/v1/hvac_schedules",
          { data, user },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
    edit: (id, data, user, running) =>
      axios
        .post(
          `/v1/hvac_schedules/${id}/edit`,
          { data, user, running },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
    hvac_fetch: () =>
      axios
        .get(`/v1/hvac_schedules/hvac_fetch`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    delete: (scheduleID, user, running) =>
      axios
        .post(
          `/v1/hvac_schedules/${scheduleID}`,
          { user, running },
          {
            headers: { Authorization: "Bearer ".concat(cookies.get("lmsJWT")) },
          }
        )
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    schedule_details: (id) =>
      axios
        .get(`/v1/gl_schedules/${id}/scheduleDetails`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    create_bms_schedule: (dat) =>
      axios
        // .post("/v1/hvac_schedules", { data }, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        // .then(res => res.data),
        .post(`/v1/gl_schedules/createWeeklySchedule`, dat, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    createHvacSchedule: (data) =>
      axios
        .post(
          "/v1/gl_schedules/createSchedule",
          { data },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
    showHvacSchedule: (buildingId) =>
      axios
        .get(
          `/v1/gl_schedules/${buildingId}/scheduleList`,
          {},
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
  },
  floor: {
    EmsData: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getEmsDeviceData`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    EmsGraphData: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getEnergyDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    EmsGraph24hrs: (deviceID, date) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/${date}/ems24hoursdata`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    EmsGraph7days: (deviceID, date) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/${date}/ems7daysdata`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    UpsData: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getUpsDeviceData`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    UpsGraphData: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getUpsDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    csuGraphData: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getcsuDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    floorList: (buildingID) =>
      axios
        .get(`/v1/gl_zone/${buildingID}`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    floorData: (buildingID) =>
      axios.get(`/v1/newapis/${buildingID}/floorData`).then((res) => res.data),
    getAhuInFloor: (floorID) =>
      axios.get(`/v1/newapis/${floorID}/ahuDevices`).then((res) => res.data),
    building: (buildingID) =>
      axios
        .get(`/v1/buildings/${buildingID}/meeting-rooms`)
        .then((res) => res.data),
    heatmap: (ID, type) =>
      axios
        // .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/latestStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        // .get(`http://192.168.1.102:3000/material-dashboard-react/data.json`)
        .get(`/v1/gl_analytics/${ID}/${type}/getdevicedatazoneid`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),
    devicemap: (ID, type) =>
      axios
        .get(`/v1/gl_analytics/${ID}/${type}/getdevicedatazoneid`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),
    hvacHeatmap: (ID) =>
      axios
        // .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/latestStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        // .get(`http://192.168.1.102:3000/material-dashboard-react/data.json`)
        .get(`v1/gl_analytics/${ID}/gethvacmapdatazoneid`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),
    checkCommandStatus: (ID) =>
      axios
        .get(`v1/subsystem/${ID}/checkCommandStatus`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),

    actualExcepted: (ID) =>
      axios
        .get(`v1/gl_analytics/${ID}/getAhuActualExpectedNew`)
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),
    ae: (ID) =>
      axios
        // .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/latestStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        // .get(`http://192.168.1.102:3000/material-dashboard-react/data.json`)
        .get(`/v1/gl_analytics/${ID}/getAhuActualExpectedNew`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),

    hvacHeatmap: (ID) =>
      axios
        // .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/latestStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        // .get(`http://192.168.1.102:3000/material-dashboard-react/data.json`)
        .get(`v1/gl_analytics/${ID}/gethvacmapdatazoneid`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),

    ConfigureSetpoints: (floorID) =>
      axios
        // .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/latestStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        // .get(`http://192.168.1.102:3000/material-dashboard-react/data.json`)
        .get(`v1/newapis/${floorID}/getAhuDeviceData`)
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),
    UpdateConfigureSetpoints: (deviceID, req) =>
      axios
        // .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/latestStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        // .get(`http://192.168.1.102:3000/material-dashboard-react/data.json`)
        .post(`/v1/subsystem/${deviceID}/subSystemSetpoint`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    // .catch((err) => {
    //     console.log("er------------", err)
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    //     if (err.response.status === 500) {
    //         console.log("helo", err)
    //     }
    // }),

    FloorMapGenerator01: (floorID, type, sensor_type) =>
      axios
        .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/latestStatus2`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        // .get(`https://localhost/heatmap.json`)
        .then((res) => res.data),
    // .catch((err) => {
    //     if (err.response.status === 440 || err.response.status === 401) {
    //         window.location.reload();
    //     }
    // }),
    createZones: (floorID, type, sensor_type) =>
      axios
        .get(`/v1/analytics/${sensor_type}/${floorID}/${type}/createZones`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        // .get(`https://localhost/heatmap.json`)
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    sensorChartData: (deviceID, param) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/${param}/getlast24hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    getAhu: (id) =>
      axios
        // .get(`/v1/zones/hot_desking/bookinglist?` +"user_id=" + user_id , { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        .get(`/v1/gl_analytics/${id}/getAhuData`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),

    getAhuLastHr: (id) =>
      axios
        .get(`/v1/gl_analytics/${id}/getAhuDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getVavLastHr: (id) =>
      axios
        .get(`/v1/gl_analytics/${id}/getVavDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),

    getMeetingRooms: (id, type, from, to) =>
      axios
        // .get(`/v1/coworking/${floorID}/meeting_room_list?` + "from="+ from + "&to="+ to + facilities)
        // .get(`/v1/coworking/${floorID}/meeting_room/booking-status?` + "from=" + from + "&to=" + to + facilities + "&attendies=" + noOfAttendies)
        .get(
          `/v1/gl_zone_booking/${id}/${type}/searchBookable?` +
            "from=" +
            from +
            "&to=" +
            to
        )
        .then((res) => res.data)
        .catch((err) => {
          console.log("err", err);
          console.log("api page", id);
          console.log("api page", type);
        }),

    getBookedSeatsList: (user_id, type) =>
      axios
        // .get(`/v1/zones/hot_desking/bookinglist?` +"user_id=" + user_id , { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        .get(`/v1/gl_zone_booking/${user_id}/${type}/bookingList`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getBookedRoomsList: (user_id, type) =>
      axios
        // .get(`/v1/zones/meeting_room/bookinglist?` + "user_id=" + user_id, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        .get(`/v1/gl_zone_booking/${user_id}/${type}/bookingList`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    bookMeetingRoom: (req) =>
      axios
        // .post(`/v1/coworking/meeting_room_booking`, req)
        .post(`/v1/gl_zone_booking/booking`, req)
        .then((res) => res.data),
    cancelSeatBooking: (req) =>
      axios
        .post(`/v1/coworking/hot_desking/cancel_booking`, req)
        .then((res) => res.data)
        .catch((error) => console.log("errrorrrr", error.data)),
    insertSelectedAlarm: (req) =>
      axios
        .post(
          `/v1/gl_alerts/insertSelectedAlarm`,
          { req },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data)
        .catch((error) => console.log("errrorrrr", error.data)),
    cancelMeetingRoomBooking: (req) =>
      axios
        .post(`/v1/coworking/meeting_room/cancel_booking`, req)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err.data.error);
          // err.message
        }),
    updateSeatBooking: (req) =>
      axios
        .post(`/v1/coworking/hot_desking/update_booking`, req)
        .then((res) => res.data),
    updateMeetingRoomBooking: (req) =>
      axios
        .post(`/v1/coworking/meeting_room/update_booking`, req)
        .then((res) => res.data),
    parkingStatus: (floorID) =>
      axios
        .get(`/v1/pms/${floorID}/parking-status`)
        // .get(`/v1/pms/ba27ad62-e6a0-4fcc-ae40-64a4e6e9ee34/parking-status`)
        .then((res) => res.data),
    getOccupancyStatus: (floorID) =>
      axios
        .get(`/v1/coworking/${floorID}/booking-status`)
        .then((res) => res.data),
    getOccupancyBookingStatus: (floorID) =>
      axios
        .get(`/v1/coworking/${floorID}/booking-status2`)
        .then((res) => res.data),
    currentLuxStatus: (buildingID) =>
      axios
        .get(`/v1/buildings/${buildingID}/currentLux`)
        .then((res) => res.data),

    updateAhu: (deviceID, req) =>
      axios
        .post(`/v1/subsystem/${deviceID}/subSystemSetpoint`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),

    getAhuFault: (id) =>
      axios
        .get(`/v1/newapis/${id}/faultTypeCount`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),

    getAlarmDataForAllDevices: () =>
      axios
        .get(`/v1/newapis/alarmDataForAllDevices`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    chillerGraphDataLast1Hr: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getChillerDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    insertSelectedChillerAlarm: (req) =>
      axios
        .post(`/v1/gl_alerts/insertSelectedChillerAlarm`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data)
        .catch((error) => console.log("errrorrrr", error.data)),
    cpmdevicemap: (ID, type) =>
      axios
        .get(`/v1/newapis/mycpmsnapshot`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    coolingTowerGraphDataLast1Hr: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getCoolingTowerDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmDataFetch: (deviceID) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/getCoolingTowerDataLast1Hr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
        cpmGetThresholdData: (deviceID) =>
      axios
        .get(`/v1/newapis/getThresholdValues`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmGetStatus: (deviceID) =>
      axios
        .get(`/v1/cpm/status`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmThresholdValues: (req) =>
        axios
          .post(`/v1/newapis/setThresholdValues`, req, {
            headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
          })
          .then((res) => res.data)
          .catch((error) => console.log("errrorrrr", error.data)),
    cpmGetDevData: (deviceID) =>
      axios
        .get(`/v1/newapis/myibmssnapshot`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmgetStatus: (deviceID) =>
      axios
        .get(`/v1/newapis/concurrentstatus`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmControl: (req) =>
      axios
        .post(`/v1/newapis/chillerModeCommand`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    chillerMode: (req) =>
      axios
        .post(`/v1/newapis/remoteLocal`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmOnOffControl: (req) =>
      axios
        .post(`/v1/newapis/controlaction`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    coolingTowerValve: (req) =>
      axios
        .post(`/v1/newapis/controlctoutletvalve`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    coolingTowerControls: (req) =>
      axios
        .post(`/v1/newapis/controlcoolingtowerfan`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    ctState: (req) =>
      axios
        .post(`/v1/newapis/getCtState`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    relinquishPriority: (req) =>
      axios
        .post(`/v1/subsystem/relinquishPriority`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmHeaderOnOffControl: (req) =>
      axios
        .post(`/v1/newapis/autoManualStatus`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmOverrideControl: (req) =>
      axios
        .post(`/v1/newapis/setManualState`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmCurrentState: () =>
      axios
        .get(`/v1/newapis/currentstate`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmOverrideState: () =>
      axios
        .get(`/v1/newapis/getManualState`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    cpmstate: () =>
      axios
        .get(`/v1/newapis/getcpmState`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    newDevicemapApi: (deviceID, type) =>
      axios
        .get(`/v1/gl_analytics/${deviceID}/${type}/newgetdevicedatazoneid`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getDeviceData: (req, id, type, time) =>
      axios
        .post(
          `/v1/gl_analytics/${id}/${type}/${time}/getDeviceDataLast1Hr`,
          req,
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data),
    getEnergyMeter: () =>
      axios
        .get(`/v1/newapis/ikw_per_tr`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
     getinstanceKWPerTr: () =>
      axios
        .get(`/v1/newapis/kw_per_tr_inst`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),   
     getPlantApi: () =>
  axios
    .get(`/v1/newapis/plantapi`, {
      headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
    })
    .then((res) => res.data),    
    getPlantMetrics: () =>
      axios
        .get(`/v1/newapis/plantSPC`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),    
    getChillerExtraParameters: () =>
      axios
        .get(`/v1/newapis/ikw_per_tr_ch`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getChillerikw: (payload) =>
      axios
        .post(`/v1/newapis/getTrKwValuesOfChiller`, payload, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),

    // getDeviceData: (id,type,time) =>
    //                                 axios
    //                                     .post(`/v1/gl_analytics/${id}/${type}/${time}/getDeviceDataLast1Hr`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
    //                                     .then(res => res.data),
  },

  zones: {
    zoneList: (floorID) =>
      axios
        .get(`/v1/gl_zone/${floorID}`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getZoneList: (floorID, data) =>
      axios
        .get(`/v1/coworking/${floorID}/hot_desking_list`, {
          params: data,
        })
        .then((res) => res.data),
    bookHotdesk: (data) =>
      axios.post(`/v1/coworking/hot_desking`, data).then((res) => res.data),
    // bookedSeatsList: (floorID, data) =>
    //     axios
    //         .get(`/v1/coworking/${floorID}/booked_seat_list`, {
    //             params: data
    //         })
    //         .then(res => res.data)

    bookedSeatsList: (floorID, data) =>
      axios
        .get(`/v1/coworking/${floorID}/hot_desking/booking-status?`, {
          params: data,
        })
        .then((res) => res.data),
  },
  notifications: {
    fetch: (zoneID, type) =>
      axios
        // .get(`/v1/alerts/${buildingID}`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        .get(`/v1/alerts/${zoneID}/alerts`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        // .get(`/v1/alerts/${buildingID}/temp?type=`+type)
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    alarm: (buildingID) =>
      axios
        // .get(`/v1/alerts/${buildingID}`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
        .get(`/v1/gl_alerts/${buildingID}/alerts`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data)
        .catch((err) => {
          console.log("alerts api err", err);
          // if (err.response.status === 440 || err.response.status === 401) {
          window.location.reload();

          //  }
        }),
  },
  controls: {
    floorlights: (floorId) =>
      axios
        .get(`/v1/floors/${floorId}/lights`, {
          headers: { Authorization: "Bearer".concat(cookies.get("lmsJWT")) },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          // console.log("111111111111111111err",err)
          if (err.response) {
            if (err.response.status === 440 || err.response.status === 401) {
              window.location.reload();
            }
          }
        }),
    zonelights: (zoneId) =>
      axios
        .get(`/v1/zones/${zoneId}/lights`, {
          headers: { Authorization: "Bearer".concat(cookies.get("lmsJWT")) },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    devicelights: (areaId) =>
      axios
        .get(`/v1/areas/${areaId}/lights`, {
          headers: { Authorization: "Bearer".concat(cookies.get("lmsJWT")) },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    eventStatus: (batchId, batchLength) =>
      axios
        //   .get(`/v1/lights/${batchId}/${batchLength}/eventStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('lmsJWT')) } })
        .get(`/v1/lights/${batchId}/${batchLength}/eventStatus`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            console.log("errrrrrrrrrrrrrrrrr", err);
            //   window.location.reload();
          }
        }),

    lights: (buildingId) =>
      axios
        .get(`/v1/buildings/${buildingId}/lights`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    controlLights: (payload, user) =>
      axios
        .post(
          `/v1/lights/event`,
          { payload, user },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
    controlSp: (payload, user, setpoint) =>
      axios
        .post(
          `/v1/lights/setpoint`,
          { payload, user, setpoint },
          { headers: { Authorization: "Bearer ".concat(cookies.get("token")) } }
        )
        .then((res) => res.data)
        .catch((err) => {
          if (err.response.status === 440 || err.response.status === 401) {
            window.location.reload();
          }
        }),
  },
  analytics: {
    liveStatus: (id, context) =>
      axios
        .get(`/v1/analytics/${context}/${id}/live-status`)
        .then((res) => res.data),
    todayComparison: (param, id, context) =>
      axios
        .get(`/v1/analytics/${param}/${id}/${context}/today-vs-day`)
        .then((res) => res.data),
    avgDistribution: (time, id, context) =>
      axios
        .get(`/v1/analytics/${context}/${id}/${time}/data`)
        .then((res) => res.data),
    thisMonthComparison: (id, context) =>
      axios
        .get(`/v1/analytics/${id}/${context}/thisMonth-vs-lastMonth`)
        .then((res) => res.data),
    cardData: (id, context, param) =>
      axios
        .get(`/v1/analytics/${context}/${id}/cards/${param}`)
        .then((res) => res.data),
    dashboardCards: (context, id) =>
      axios
        .get(`/v1/analytics/${context}/${id}/cardsForDashboard`)
        .then((res) => res.data),
    chiller1ReportData: (startDate, endDate) =>
      axios
        .get(
          `/v1/gl_reports/device/chiller_1?from=${startDate}&to=${endDate}`,        )
        .then((res) => res.data),
    chiller2ReportData: (startDate, endDate) =>
      axios
        .get(
          `/v1/gl_reports/device/chiller_2?from=${startDate}&to=${endDate}`,
        )
        .then((res) => res.data),
    chiller3ReportData: (startDate, endDate) =>
      axios
        .get(
          `/v1/gl_reports/device/chiller_3?from=${startDate}&to=${endDate}`,
        )
        .then((res) => res.data),
    chillerPlantData: (startDate, endDate) =>
      axios
        .get(
          `/v1/gl_reports/plant?from=${startDate}&to=${endDate}`,
        )
        .then((res) => res.data),
    btuMeterData: (startDate, endDate) =>
      axios
        .get(
          `/v1/gl_reports/btu-meter?from=${startDate}&to=${endDate}`,
        )
        .then((res) => res.data),
    summaryData: (startDate, endDate) =>
      axios
        .get(
          `/v1/gl_reports/summary?from=${startDate}&to=${endDate}`,
        )
        .then((res) => res.data),
    sendReportEmail: (data) =>
      axios
        .post(`/v1/gl_reports/sendReportEmail`, data)
        .then((res) => res.data),
    energyConsumptionChart: (deviceType, timeRange, startDate, endDate) =>
      axios
        .get(
          `/v1/gl_analytics/energyConsumptionChart?device_type=${deviceType}&time_range=${timeRange}&start_date=${startDate}&end_date=${endDate}`
        )
        .then((res) => res.data),
    energyConsumptionAssetWise: (deviceType, timeRange, startDate, endDate) =>
      axios
        .get(
          `/v1/gl_analytics/assetWiseEnergy?device_type=${deviceType}&time_range=${timeRange}&start_date=${startDate}&end_date=${endDate}`
        )
        .then((res) => res.data),
    energyConsumptionHeatmap: (deviceType, timeRange, startDate, endDate) =>
      axios
        .get(
          `/v1/gl_analytics/heatMapEnergy?device_type=${deviceType}&time_range=${timeRange}&start_date=${startDate}&end_date=${endDate}`
        )
        .then((res) => res.data),
    energyConsumptionAssetHealth: (deviceType, timeRange, startDate, endDate) =>
      axios
        .get(
          `/v1/gl_analytics/assetHealthAlarm?device_type=${deviceType}&time_range=${timeRange}&start_date=${startDate}&end_date=${endDate}`
        )
        .then((res) => res.data),
  },
  floorLevelAnalytics: {
    liveStatus: (floorID) =>
      axios
        // .get(`/v1/analytics/floor/${floorID}/live-status`)
        .get(`https://localhost:3000/live-status.json`)
        .then((res) => res.data),
    todayComparison: (param, floorID) =>
      axios
        // .get(`/v1/analytics/${param}/${floorID}/floor/today-vs-day`)
        .get(`https://localhost:3000/days.json`)
        .then((res) => res.data),
    avgDistribution: (time, id) =>
      axios
        .get(`/v1/analytics/floor/${id}/${time}/data`)
        .then((res) => res.data),
    monthsComparison: (id) =>
      axios
        // .get(`/v1/analytics/${id}/floor/thisMonth-vs-lastMonth`)
        .get(`https://localhost:3000/months.json`)
        .then((res) => res.data),
  },
  networkStatus: {
    getNetworkStatus: () =>
      axios
        .get(`/v1/coworking/network-status`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },
  events: {
    events_table: (req) =>
      axios.get(`/v1/newapis/getIbmsEvents`, req).then((res) => res.data),
    hide_event: (eventId) =>
      axios.get(`/v1/newapis/${eventId}/hideEvents`).then((res) => res),
  },

  alarms: {
    alarms_table: (req) =>
      axios.get(`/v1/newapis/glAlarm`, req).then((res) => res.data),
    delete_alarm: (req) =>
      axios
        .post(`/v1/gl_alerts/deleteAlarm`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    acknowledge_alarm: (req) =>
      axios
        .post(`/v1/gl_alerts/acknowledgeAlarm`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    critical_table: (req) =>
      axios.get(`/v1/newapis/glAlarmCritical`, req).then((res) => res.data),
    noncritical_table: (req) =>
      axios.get(`/v1/newapis/glAlarmNonCritical`, req).then((res) => res.data),
    technician_list: () =>
      axios
        .get(`/v1/gl_user/technicians`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getcauses_technician: (req) =>
      axios
        .post(`/v1/gl_user/sendCausesToTechnicians`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    getrestorealarms: (req) =>
      axios
        .post(`/v1/gl_alerts/restoreAlarm`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },
  // parkingSolution:{
  //     parkingStatus: (deviceID) =>
  //     axios
  //     .get(`/v1/pms/getParkingStatus`, { headers: { Authorization: 'Bearer '.concat(cookies.get('token')) } })
  //     .then(res => res.data),
  // },
  parkingSolution: {
    parkingStatusslots: (floorID) =>
      axios
        .get(`/v1/pms/${floorID}/getParkingStatus`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    LatestparkingGraph: () =>
      axios
        .get(`/v1/pms/getLatestParkingGraph`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    TrendParkingGraph: () =>
      axios
        .get(`/v1/pms/getTrendParkingGraph`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },

  reports: {
    ibmsevents_table: (req) =>
      axios.get(`/v1/newapis/glIbmsEvents`, req).then((res) => res.data),

    ibmsalarms_table: (req) =>
      axios.get(`/v1/newapis/glIbmsAlarms`, req).then((res) => res.data),

    critical_table: (req) =>
      axios.get(`/v1/newapis/alarmDeviceCritical`, req).then((res) => res.data),

    Device_critical: (req) =>
      axios
        .get(`/v1/newapis/alarmDeviceTypeCritical`, req)
        .then((res) => res.data),
    active_alarm: (req) =>
      axios
        .get(`/v1/newapis/mostActiveAlarmCritical`, req)
        .then((res) => res.data),
    restore_critical_alarm: (req) =>
      axios
        .get(`/v1/newapis/criticalAlarmRestored`, req)
        .then((res) => res.data),

    //non-critical alarms
    noncritical_table: (req) =>
      axios
        .get(`/v1/newapis/alarmDeviceNonCritical`, req)
        .then((res) => res.data),
    device_nonCritical: (req) =>
      axios
        .get(`/v1/newapis/alarmDeviceTypeNonCritical`, req)
        .then((res) => res.data),
    non_criticalalarm: (req) =>
      axios
        .get(`/v1/newapis/mostActiveAlarmNonCritical`, req)
        .then((res) => res.data),
    restore_noncritical_alarm: (req) =>
      axios
        .get(`/v1/newapis/nonCriticalAlarmRestored`, req)
        .then((res) => res.data),

    // user details apis

    user_control_deatils: (req) =>
      axios.get(`/v1/newapis/userDetails`, req).then((res) => res.data),

    acknowledged_by_user: (req) =>
      axios.get(`/v1/newapis/acknowledgedUser`, req).then((res) => res.data),

    ignored_by_user: (req) =>
      axios.get(`/v1/newapis/ignoredUser`, req).then((res) => res.data),

    login_login_details: (req) =>
      axios.get(`/v1/newapis/loginLogoutDetails`, req).then((res) => res.data),

    runhours_report: (req) =>
      axios.get(`/v1/newapis/runhoursreports`, req).then((res) => res.data),
  },
  alarmreports: {
    alarmsfor1year: (deviceID) =>
      axios
        .get(`/v1/newapis/${deviceID}/alarmsFor1Year`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    alarmsfor6months: (deviceID, req) =>
      axios
        .get(`/v1/newapis/${deviceID}/alarmsFor6Month`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    alarmsfor3months: (deviceID, req) =>
      axios
        .get(`/v1/newapis/${deviceID}/alarmsFor3Month`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    alarmsfor1month: (deviceID, req) =>
      axios
        .get(`/v1/newapis/${deviceID}/alarmsFor1Month`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    alarmsfor1week: (deviceID, req) =>
      axios
        .get(`/v1/newapis/${deviceID}/alarmsFor1Week`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
    alarmsfor1day: (deviceID, req) =>
      axios
        .get(`/v1/newapis/${deviceID}/alarmsFor1Day`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },

  analyticsrunhour: {
    analyticsrunhour: (data) =>
      axios
        .get(`/v1/gl_analytics/NONGL_SS_AHU/rh/${data}/metricGraphApiForAll`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },

  analyticsfaults: {
    analyticsfaults: (data) =>
      axios
        .get(`/v1/gl_analytics/getfaultanalytics`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },
  instrumentation: {
    instrumentation: (data) =>
      axios
        .get(`/v1/gl_user/instrumentation`, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },
  energy_consumption: {
    energy_consumption: (req) =>
      axios
        .post(`/v1/gl_ibms_analytics/getenergyConsumption`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },
  energy_consumption_prev_curr: {
    energy_consumption_prev_curr: (req) =>
      axios
        .post(`/v1/gl_ibms_analytics/getenergy`, req, {
          headers: { Authorization: "Bearer ".concat(cookies.get("token")) },
        })
        .then((res) => res.data),
  },
  
};
