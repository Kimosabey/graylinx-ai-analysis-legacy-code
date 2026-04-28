const dbpool = require("./DatabasePool");
const express = require("express");
const router = express.Router();
const bacnet = require("./hvacBACnetClient");
const path = require("path");

// const { handleUIAction } = require("./control_module/actions.js");

// CPM Imports
const notifier = require("./CPM/Notification_Handler");
const jw = require("./CPM_modular/decision_engine");
const dataHandler = require("./CPM_modular/CPM_Data_Handler");
const controlHandler = require("./control_module/ui_controls.js");
const cpmUtils = require("./CPM_modular/CPM_Utilities");
// const alarm = require('./Apps/Alarm_others/Alarm_other_Json_1');
const runhour = require("./Apps/Run_hour/run_hour");

// const { runHourJob } = require("./control_module/run_hour_module/run_hour.js");

const schedulars = require("./control_module/schedules");

const {
  startProcessAlarms,
} = require("./control_module/alarm_module/alarm_module.js");

const site_scripts = require("./control_module/cpm_module/cpm_site_config.js");

var mydata = {};
// APIs and Implementation
// Integration Experiments
// Load Large Data
// Prepare Queries for the APIs identified
// Validate access from different Front Ends
// Check Logging, Log Rotation and other features
// Integrate BACnet simulated devices; Check the behaviours
// insert into GL_Zone (name,id,zone_type,zone_tag,description,coordinates,zone_parent')
//  values('Zone-00002','2a728808-9cd9-42db-add6-286b42095561','GL_ZONE_TYPE_BUILDING',
// 'Solution|C~1|B~1~1','Building-00001',"100,100,450,300",
// 'e03d8951-d567-4f3b-a482-dbf7335ca135');
// Data Transformation to and fro Senzopt <==> Graylinx_New
// SELECT param_id, avg(param_value) AS mean, count(param_value) AS cnt, sum(param_value) AS total FROM GL_Zone_Subsystem_MAP zss, GL_Subsystem_Output_MAP sso, (WITH RECURSIVE subordinates AS (
//     SELECT id,name,zone_type,zone_parent FROM GL_Zone WHERE id='029476fa-2c44-4345-b23d-77d8592cddc0'
// UNION
//     SELECT p.id,p.name,p.zone_type,p.zone_parent FROM GL_Zone p INNER JOIN subordinates s ON p.zone_parent = s.id
// ) SELECT * FROM subordinates) AS children WHERE sso.ss_id = zss.ss_id AND zss.zone_id=children.id GROUP BY param_id

function glapis() {
  return [
    { api: "/v1/users", query: "select * from gl_user" },
    {
      api: "/v1/users/:id",
      query: "select username, first_name, last_name from user where id = ?",
    },
    {
      api: "/v1/config/default-setpoints",
      query: "SELECT * FROM default_setpoint",
    },
    {
      api: "/v1/config/default-thresholds",
      query: "SELECT * FROM default_threshold",
    },
    {
      api: "/v1/config/default-parking-configs",
      query: "SELECT * FROM default_parking_threshold",
    },
    {
      api: "/v1/organizations/",
      query0: "SELECT * FROM organization",
      query:
        "SELECT * FROM GL_Zone WHERE zone_type='GL_ZONE_TYPE_ORGANIZATION'",
    },
    {
      api: "/v1/organizations/:id",
      query: "SELECT * FROM organization WHERE id = ?",
    },
    {
      api: "/v1/organizations/:id/campuses",
      query:
        "select organization.id, organization.name, campus.id, campus.name from campus left join organization on campus.organization_id = organization.id where campus.organization_id = ?",
    },
    { api: "/v1/campuses/", query: "SELECT * FROM campus" },
    { api: "/v1/campuses/:id", query: "SELECT * FROM campus WHERE id = ?" },
    {
      api: "/v1/campuses/:id/tree",
      query:
        "select * from campus left outer join building on building.campus_id = campus.id left outer join floor on floor.building_id = building.id left outer join zone on zone.floor_id = floor.id left outer join device on device.zone_id = zone.id where campus.id = ? and (device.type IN (?)) and floor.type IS NULL",
    },
    {
      api: "/v1/campuses/:id/buildings",
      query:
        "select campus.id, campus.name, building.id, building.name from building left join campus on building.campus_id = campus.id where building.campus_id = ?",
    },
    { api: "/v1/buildings/", query: "SELECT * FROM building" },
    {
      api: "/v1/buildingsnew",
      query:
        "SELECT * FROM gl_bms_db.GL_Zone where zone_type='GL_ZONE_TYPE_BUILDING'",
    },
    { api: "/v1/buildingsts", query: "SELECT * FROM tablespace.building" },
    { api: "/v1/buildings/:id", query: "SELECT * FROM building WHERE id = ?" },
    {
      api: "/v1/ems/floors/:id/cumulative-consumptions",
      query:
        "select zss.zone_id, concat(DATE(measured_time),'T', LPAD(HOUR(measured_time),2,0), ':00:00') AS timestamp, round(sum(param_value),2) AS consumption from gl_bms_infor.GL_Subsystem_Output_MAP sso, gl_bms_infor.GL_Zone_Subsystem_MAP zss where param_id='consumption' AND sso.ss_id=zss.ss_id AND zss.zone_id=? AND measured_time > '2022-02-16T00:00:00' group by timestamp order by timestamp",
    },

    {
      api: "/v1/buildings/:id/floors",
      query:
        "select building.id, building.name, floor.id, floor.name, floor.type from floor left join building on floor.building_id = building.id where floor.building_id = ? order by floor.created_at asc",
    },
    { api: "/v1/floors/", query: "SELECT * FROM floor" },
    { api: "/v1/floors/:id", query: "SELECT * FROM floor WHERE id = ?" },

    {
      api: "/v1/floors/:id/zones",
      query:
        "select floor.id, floor.name, zone.id, zone.name from zone left join floor on zone.floor_id = floor.id where zone.floor_id = ?",
    },
    {
      api: "/v1/floors/:id/:deviceType/data",
      query:
        "select d.id, d.name, e.data, e.created_at from latest_event e left join device d on d.id = e.device_id left join zone z on z.id = d.zone_id where z.floor_id = ? and e.device_type = ?",
    },
    {
      api: "/v1/floors/:id/summary-parameters",
      query:
        "select e.data from event e left outer join device d on d.id = e.device_id where d.zone_id=? and d.type=? and e.created_at > date_sub(curdate(), interval 1 day)",
    },
    {
      api: "/v1/zonesinfor/",
      query:
        "SELECT * FROM gl_bms_infor.GL_Zone where zone_type='GL_ZONE_TYPE_ZONE'",
    },
    { api: "/v1/zones/", query: "SELECT * FROM zone" },
    { api: "/v1/zones/:id", query: "SELECT * FROM zone WHERE id = ?" },

    {
      api: "/v1/zones/:id/devices",
      query: "SELECT * FROM device WHERE type = ? and zone_id = ?",
    },
    {
      api: "/v1/zones/:id/devices",
      query: "SELECT * FROM device WHERE zone_id = ?",
    },
    {
      api: "/v1/zones/:id/devices/details",
      query: "SELECT * FROM device WHERE zone_id = ?",
    },
    {
      api: "/v1/zones/:id/scenes",
      query: "SELECT * FROM scene WHERE zone_id = ?",
    },
    {
      api: "/v1/zones/:id/scenes/:sceneId",
      query: "SELECT * FROM scene WHERE id = ?",
    },

    {
      api: "/v1/zones/:id/scenes/:sceneId/execute",
      query: "INSERT INTO scene_execution SET ?",
    },
    { api: "/v1/devices/", query: "SELECT * FROM device" },
    { api: "/v1/devices/", query: "SELECT * FROM device WHERE mac = ?" },
    { api: "/v1/devices/:id", query: "SELECT * FROM device WHERE id = ?" },
    {
      api: "/v1/devices/:id/hierarchy",
      query:
        "select d.id as deviceId, d.name as deviceName, d.type as deviceType, d.mac as mac, z.id as zoneId, z.name as zoneName, f.id as floorId, f.floor_number as floorNumber, f.name as floorName, b.id as buildingId, b.name as buildingName, c.id as campusId, c.name as campusName from device d inner join zone z on z.id = d.zone_id inner join floor f on f.id = z.floor_id inner join building b on b.id = f.building_id inner join campus c on c.id = b.campus_id where d.id = ?",
    },

    {
      api: "/v1/devices/:id/events",
      query: "select * from latest_event where device_id=?",
    },
    {
      api: "/v1/devices/:id/thresholds",
      query:
        "select parameter_name, minimum, maximum, step from  default_threshold where device_type = ? and parameter_type = ?",
    },
    {
      api: "/v1/devicesByZone/:id",
      query: "SELECT * FROM device WHERE zone_id = ?",
    },
    { api: "/v1/gateways/", query: "SELECT * FROM gateway" },
    { api: "/v1/gateways/:id", query: "SELECT * FROM gateway WHERE id = ?" },
    {
      api: "/v1/vavs/:id/setpoints",
      query: "select parameter_name, value from setpoint where device_id = ?",
    },
    {
      api: "/v1/vavs/:id/thresholds",
      query:
        "select parameter_name, minimum, maximum, step from default_threshold where device_type = ? and parameter_type = ?",
    },
    {
      api: "/v1/vavs/buildings/:id/vav-data",
      query: "select device_name, data from latest_event where building_id = ?",
    },
    {
      api: "/v1/vavs/floors/:id/vav-data",
      query: "select device_name, data from latest_event where floor_id = ?",
    },
    {
      api: "/zoneswithsubsystems",
      query:
        "SELECT zone_id, glz.name AS zone_name, zone_type, zone_parent, zone_tag, ss_id, gls.name AS system_name, ss_type, ss_parent FROM GL_Zone_Subsystem_MAP glzs, GL_Zone glz, GL_Subsystem gls WHERE glzs.zone_id = glz.id AND glzs.ss_id = gls.id",
    },
    {
      api: "/zonessubsystemsstatus",
      query:
        "SELECT zone_id, glzs.ss_id, glz.name AS zone_name, gls.name AS system_name, measured_time, param_id, param_value FROM GL_Zone_Subsystem_MAP glzs, GL_Zone glz, GL_Subsystem gls, GL_Subsystem_Output_MAP glst WHERE glzs.zone_id = glz.id AND glzs.ss_id = glst.ss_id AND glzs.ss_id=gls.id",
    },
    {
      api: "/zonessubsystemssignals",
      query:
        "SELECT zone_id, glzs.ss_id, glz.name AS zone_name, gls.name AS system_name, triggered_time, param_id, param_value FROM GL_Zone_Subsystem_MAP glzs, GL_Zone glz, GL_Subsystem gls, GL_Subsystem_Input_MAP glst WHERE glzs.zone_id = glz.id AND glzs.ss_id = glst.ss_id AND glzs.ss_id=gls.id",
    },
    {
      api: "/zoneshvacparameters",
      query:
        "SELECT zone_id, glzs.ss_id, glz.name AS zone_name, gls.name AS system_name, measured_time, param_id, param_value FROM GL_Zone_Subsystem_MAP glzs, GL_Zone glz, GL_Subsystem gls, GL_Subsystem_Output_MAP glst WHERE glzs.zone_id = glz.id AND glzs.ss_id = glst.ss_id AND glzs.ss_id=gls.id AND param_id in ('occupancy','temperature','damper_position')",
    },
    {
      api: "/mysubsystemstree",
      query: "SELECT * FROM GL_Subsystem WHERE is_active = 1 ORDER BY uuid",
    },
    // { "api": "/:id/getAhuDeviceData", "query" : "select soo.ss_id,soo.measured_time,soo.param_id,soo.param_value from gl_subsystem_output_map soo right join (select max(measured_time) as mea,som.ss_id as sid,param_id,param_value from gl_subsystem_output_map som where som.ss_id=? and (param_id !='fan_motor_speed' and param_id !='supply_air_flow') group by som.ss_id)as smax on soo.measured_time=smax.mea"},
    {
      api: "/:id/getAhuDeviceData",
      query:
        "WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT * FROM subordinates sub inner join gl_location_subsystem_map zs on sub.id=zs.zone_id inner join gl_subsystem sb on sb.id=zs.ss_id inner join (select somo.ss_id,somo.measured_time,somo.param_id,somo.param_value from gl_subsystem_output_map somo inner join (select max(measured_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_output_map som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id,som.param_id)as late on (late.mea=somo.measured_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id))as smax on smax.ss_id=sb.id where sb.ss_type like '%ahu%';",
    },
    {
      api: "/:id/floorData",
      query: "select * from gl_location where zone_parent=?",
    },
    {
      api: "/:id/ahuDevices",
      query:
        " WITH RECURSIVE subordinates AS (SELECT id,name,zone_parent FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT s.id as zoneId,s.name as zoneName,dev.deviceName,dev.deviceId FROM subordinates s inner join gl_location st on st.id=s.zone_parent inner join (select s.name as deviceName,z.name as zoneName,s.id as deviceId from gl_subsystem s inner join gl_location_subsystem_map zs  on s.id=zs.ss_id inner join   gl_location z on  z.id=zs.zone_id where s.ss_type like '%NONGL_SS_AHU%') as dev on dev.zoneName=s.name;",
    },
    {
      api: "/getIbmsEvents",
      query:
        "select glie.id AS 'Id', event_time AS 'Time_stamp', glie.show_hide AS 'Show_Hide', gat.description AS 'Category', gls.ss_tag AS 'DeviceID', gls.ss_type AS 'DeviceType', gp.id AS 'Key', param_value AS 'Value', gp.unit_display AS 'Unit', glu.name AS 'Set_by', IF(alarm_id = 'NO_ALARM', 'No', 'Yes') AS 'Alarm', gp2.tag AS 'Alarm_Synopsis', gat2.description AS 'Criticality' FROM gl_ibms_event glie, gl_all_type gat, gl_all_type gat2, gl_parameter gp, gl_parameter gp2, gl_subsystem gls, gl_user glu WHERE glie.category=gat.type AND glie.ss_id=gls.id AND glie.param_id=gp.id AND glie.triggering_user=glu.id AND glie.alarm_id=gp2.id AND glie.criticality=gat2.type AND glie.show_hide='GL_EVENT_SHOW'",
    },
    {
      api: "/:id/hideEvents",
      query:
        "UPDATE gl_ibms_event SET show_hide='GL_EVENT_HIDE' WHERE id IN (?)",
    },
    //gl_alarm api
    {
      api: "/glAlarm",
      query:
        "select ga.id AS 'Alarm_Id',gs.id AS 'ss_id',gs.ss_type AS 'Category',gs.name AS 'Device name', alarm_code AS 'Alarm Code', measured_time AS 'Measured_time', param_id AS 'param id', param_value AS 'param value', message AS 'Message',acknowledged AS 'Acknowledged', restore AS 'Restore', delete_alarm AS 'Delete alarm' from gl_alarm ga, gl_subsystem gs where ga.ss_id=gs.id AND ga.delete_alarm=0;",
    },
    // gl_alarm critical alarms api
    {
      api: "/glAlarmCritical",
      query:
        "select ga.id AS 'Alarm_Id',gs.id AS 'ss_id',gs.ss_type AS 'Category',gs.name AS 'Device_name', alarm_code AS 'Alarm Code', measured_time AS 'Measured_time', param_id AS 'param id', param_value AS 'param value', message AS 'Description',acknowledged AS 'Acknowledge', restore AS 'Restore', delete_alarm AS 'Delete alarm' from gl_alarm ga, gl_subsystem gs where ga.ss_id=gs.id AND ga.restore=0 AND alarm_code>100 and alarm_code<299;",
    },
    //gl_alarm non-critical alarms api
    {
      api: "/glAlarmNonCritical",
      query:
        "select ga.id AS 'Alarm_Id',gs.id AS 'ss_id',gs.ss_type AS 'Category',gs.name AS 'Device_name', sp.tag AS 'Parameter', alarm_code AS 'Alarm Code', measured_time AS 'Measured_time', param_id AS 'param id', param_value AS 'param value', message AS 'Description',acknowledged AS 'Acknowledged', restore AS 'Restore', delete_alarm AS 'Ignore' from gl_alarm ga, gl_subsystem gs, gl_parameter sp where ga.ss_id=gs.id AND ga.param_id=sp.id AND ga.restore=0 AND alarm_code>300;",
    },
    //gl_ibms events api
    {
      api: "/glIbmsEvents",
      query:
        "select gls.name AS 'DeviceName',event_time AS 'measured_time', gat.description AS 'Category', gp.id AS 'Parameter', param_value AS 'Value', gp.unit_display AS 'Unit' FROM gl_ibms_event glie, gl_all_type gat, gl_parameter gp, gl_subsystem gls WHERE glie.category=gat.type AND glie.ss_id=gls.id AND glie.param_id=gp.id and glie.created_at>now() - interval 10 hour;",
    },
    //gl_ibms alarms api
    {
      api: "/glIbmsAlarms",
      query:
        "select  gls.name AS 'DeviceID', event_time AS 'Time stamp',gat.description AS 'Category',glie.description AS 'Description', gat2.description AS 'Criticality' FROM gl_ibms_event glie, gl_all_type gat, gl_all_type gat2, gl_subsystem gls WHERE glie.category=gat.type AND glie.ss_id=gls.id AND glie.criticality=gat2.type AND category='GL_EVENT_CATEGORY_MEASURED';",
    },
    // apis for critical for report
    {
      api: "/alarmDeviceCritical",
      query:
        "select gs.name AS 'Device_Name', measured_time AS 'measured_time', message AS 'Description',acknowledged AS 'Acknowledged' from gl_alarm ga, gl_subsystem gs where ga.ss_id=gs.id AND ga.delete_alarm=0 AND ga.restore=0 AND alarm_code<299;",
    },
    // {"api":"/alarmDeviceTypeCritical","query":"select ss.name AS 'Device_Name', gl.measured_time AS 'measured_time',gl.message AS 'Description' from gl_alarm gl inner join gl_subsystem ss on  gl.ss_id=ss.id where alarm_code=200 AND acknowledged=0;"},
    {
      api: "/mostActiveAlarmCritical",
      query:
        "select gs.name AS 'Device_Name', measured_time AS  'measured_time', message AS 'Description',acknowledged AS 'Acknowledged' from gl_alarm ga, gl_subsystem gs where ga.ss_id=gs.id  AND ga.restore=0 AND alarm_code>100 and alarm_code<299 order by ga.measured_time;",
    },

    //apis for non critical for report
    {
      api: "/alarmDeviceNonCritical",
      query:
        "select gs.name AS 'DeviceName', gp.tag AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=0 AND ga.restore=0 AND alarm_code>300;",
    },
    // {"api":"/alarmDeviceTypeNonCritical","query":"select gl.param_id AS 'Device_Name', gl.measured_time AS 'measured_time',gl.message AS 'Description' from gl_alarm gl where alarm_code=201 AND  delete_alarm=0;"},
    {
      api: "/mostActiveAlarmNonCritical",
      query:
        "select gs.name AS 'DeviceName', gp.tag AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=0 AND ga.restore=0 AND alarm_code>300 order by ga.measured_time;",
    },
    //api for critical alarm which are restored

    {
      api: "/criticalAlarmRestored",
      query:
        "select gs.name AS 'Device_Name', measured_time AS  'measured_time', message AS 'Description',acknowledged AS 'Acknowledged' from gl_alarm ga, gl_subsystem gs where ga.ss_id=gs.id  AND ga.restore=1 AND alarm_code>100 and alarm_code<299 order by ga.measured_time;",
    },

    //api for non critical alarm which are restored

    {
      api: "/nonCriticalAlarmRestored",
      query:
        "select gs.name AS 'DeviceName', gp.tag AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.restore=1 AND alarm_code>300 order by ga.measured_time;",
    },

    //api on user inputs with user details

    {
      api: "/userDetails",
      query:
        "select gs.name as 'DeviceName',gi.param_id as 'Parameter',gi.param_value as 'Value',gi.triggered_time,gu.username from gl_subsystem gs, gl_subsystem_input_map gi, user gu where gs.id=gi.ss_id AND gi.user_id=gu.id;",
    },

    //alarms acknowledged by user

    {
      api: "/acknowledgedUser",
      query:
        "select gs.name AS 'DeviceName',measured_time AS 'measured_time', message AS 'Description',acknowledged AS 'Acknowledged',gu.username as 'Username' from gl_alarm ga, gl_subsystem gs, user gu where ga.ss_id=gs.id AND ga.user_id=gu.id AND ga.acknowledged=1 AND alarm_code>100 and alarm_code<299 order by ga.measured_time;",
    },

    //alarms ignored by user

    {
      api: "/ignoredUser",
      query:
        "select gs.name AS 'DeviceName', param_id as 'Parameter', measured_time AS 'measured_time', message AS 'Description',delete_alarm AS 'Ignore',gu.username as 'Username' from gl_alarm ga, gl_subsystem gs, user gu where ga.ss_id=gs.id AND ga.user_id=gu.id AND ga.delete_alarm=1 AND alarm_code>300 order by ga.measured_time;",
    },

    { api: "/mynotify", method: "post" },
    { api: "/mypost", method: "post" },
    { api: "/mycpmnotify", method: "post" },
    { api: "/controlaction", method: "post" },
    { api: "/setpoint", method: "post" },
    { api: "/autoManualStatus", method: "post" },
    { api: "/currentState", method: "" },
    { api: "/mycpmsnapshot", query: "" },
    { api: "/myibmssnapshot", query: "" },
    { api: "/concurrentstatus", query: "" },
    { api: "/controlctoutletvalve", method: "post" },
    { api: "/controlcoolingtowerfan", method: "post" },
    { api: "/getcpmState", query: "" },
    { api: "/getCtState", method: "post" },
    { api: "/getManualState", query: "" },
    { api: "/setManualState", method: "post" },
    { api: "/getTrKwValuesOfChiller", method: "post" },
    { api: "/getThresholdValues", query: "" },
    { api: "/setThresholdValues", method: "post" },

    //user login and logout details

    {
      api: "/loginLogoutDetails",
      query:
        "select u.username as 'Username',date(us.created_at) as LoginDate,sum(TIMEDIFF(us.modified_at, us.created_at)) as ActiveTime_in_sec from user u inner join gl_user_session us on u.id=us.user_id where us.is_active=0 group by username,date(us.created_at);",
    },

    //alarm analytics API for all devices
    {
      api: "/alarmDataForAllDevices",
      query:
        "select s.name as Devicename,ss_id as DeviceId,count(*) as count from gl_alarm gl inner join gl_subsystem s on gl.ss_id=s.id where gl.measured_time >= date_sub(CURRENT_TIMESTAMP(),interval 1 year) and gl.measured_time < CURRENT_TIMESTAMP() group by ss_id;",
    },

    //alarm fault type count for device level
    {
      api: "/:id/faultTypeCount",
      query:
        "select gls.name as Devicename,gla.param_id, gla.mycount AS parameter_count,gla.source from gl_subsystem gls,(select count(*) as mycount,source,param_id,ss_id from gl_alarm where ss_id=? and source is not null group by source,param_id,ss_id order by param_id) as gla where gls.id=gla.ss_id;",
    },
    {
      api: "/alarmDataForAllDevices",
      query:
        "select s.name as Devicename,ss_id as DeviceId,count(*) as count from gl_alarm gl inner join gl_subsystem s on gl.ss_id=s.id where gl.measured_time >= date_sub(CURRENT_TIMESTAMP(),interval 1 year) and gl.measured_time < CURRENT_TIMESTAMP() group by ss_id;",
    },

    //alarm fault type count for device level
    {
      api: "/:id/faultTypeCountOneDay",
      query:
        "SELECT gs.name as Devicename,gl.param_id,gl.measured_time, COUNT(*) AS parameter_count FROM gl_alarm gl inner join gl_subsystem gs on gl.ss_id=gs.id where gl.ss_id=? and gl.measured_time >= date_sub(CURRENT_TIMESTAMP(),interval 1 day) and gl.measured_time < CURRENT_TIMESTAMP() GROUP BY param_id;",
    },

    //alarm analytics API for particular parameter under single device
    {
      api: "/:id/particularDeviceAlarm",
      query: "select param_id,measured_time from gl_alarm where ss_id=?;",
    },

    //outdoor weather API for UI
    {
      api: "/outDoorWeatherApi",
      query:
        "select param_id,param_value,measured_time from gl_subsystem gl inner join gl_subsystem_latest_event gls on gl.id=gls.ss_id where gl.ss_type='GL_WEATHER_SERVICE';",
    },
    //// apis for 1 day and 1 week and 1 month and 3 months and 6 months and 1 year data for alarms
    // 1 day
    {
      api: "/:id/alarmsFor1Day",
      query:
        "select gs.name AS 'DeviceName', ga.param_id AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=1 AND ga.restore=1 AND alarm_code>300 and ga.measured_time >= date_sub('2023-08-08',interval 1 day) and ga.measured_time < '2023-08-08' and gs.id=?;",
    },
    // 1 week
    {
      api: "/:id/alarmsFor1Week",
      query:
        "select gs.name AS 'DeviceName', ga.param_id AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=1 AND ga.restore=1 AND alarm_code>300 and ga.measured_time >= date_sub('2023-08-08',interval 1 week) and ga.measured_time < '2023-08-08' and gs.id=?;",
    },
    // 1 month
    {
      api: "/:id/alarmsFor1Month",
      query:
        "select gs.name AS 'DeviceName', ga.param_id AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=1 AND ga.restore=1 AND alarm_code>300 and ga.measured_time >= date_sub('2023-08-08',interval 1 month) and ga.measured_time < '2023-08-08' and gs.id=?;",
    },
    // 3 months
    {
      api: "/:id/alarmsFor3Month",
      query:
        "select gs.name AS 'DeviceName', ga.param_id AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=1 AND ga.restore=1 AND alarm_code>300 and ga.measured_time >= date_sub('2023-08-08',interval 3 month) and ga.measured_time < '2023-08-08' and gs.id=?;",
    },
    // 6 months
    {
      api: "/:id/alarmsFor6Month",
      query:
        "select gs.name AS 'DeviceName', ga.param_id AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=1 AND ga.restore=1 AND alarm_code>300 and ga.measured_time >= date_sub('2023-08-08',interval 6 month) and ga.measured_time < '2023-08-08' and gs.id=?;",
    },
    // 1 year
    {
      api: "/:id/alarmsFor1Year",
      query:
        "select gs.name AS 'DeviceName', ga.param_id AS 'Parameter', measured_time AS 'measured_time', message AS 'Description', delete_alarm AS 'Ignore_alarm' from gl_alarm ga, gl_subsystem gs, gl_parameter gp where ga.ss_id=gs.id AND ga.param_id=gp.id AND ga.delete_alarm=1 AND ga.restore=1 AND alarm_code>300 and ga.measured_time >= date_sub('2023-08-08',interval 1 year) and ga.measured_time < '2023-08-08' and gs.id=?;",
    },
    {
      api: "/cc/totalcount",
      query:
        "select ss_type as Type, count(*) as Count from gl_subsystem where ss_type is not null group by ss_type;",
    },

    {
      api: "/cc/eqpcount",
      query:
        "select now() timenow, date(modified_at) mydate, hour(modified_at) myhour, min(modified_at), max(modified_at), count(*) mycount from gl_subsystem_latest_event where modified_at <= now() and modified_at > subtime(now(),'1 00:00:00') group by mydate, myhour order by mydate desc, myhour desc;",
    },
    {
      api: "/locations_tree",
      query:
        "select id,name,zone_tag,zone_type,zone_parent as parentId  from gl_location",
    },
    {
      api: "/locations_subsystems_tree",
      query:
        "select ss.id,name,ss_tag,ss_type,ss_parent,lss.zone_id as parentId  from gl_subsystem as ss, gl_location_subsystem_map as lss where ss.id=lss.ss_id",
    },

    {
      api: "/subsystems_points_tree",
      query:
        "select ss.id,name,description,ss_tag,ss_address_value,ss_parent as parentId  from gl_subsystem as ss where ss_type is null",
    },

    {
      api: "/solution_tree",
      query:
        "(select id, zone_parent as parentId, name, zone_tag as Detail1, zone_type as type, description as Detail2 from gl_location) UNION (select myss.id id, zone_id as parentId, name, concat(ss_tag, ' - ', description) as tag, ss_type as type, concat(ss_parent, ' @ ', ss_address_value) as description from gl_subsystem myss, gl_location_subsystem_map mylss where myss.id=mylss.ss_id) UNION (select myss.id id, ss_parent parentId, name, concat(param_value, ' @ ', measured_time) as value, concat(ss_tag, ':', ss_address_value) as type,  description as CodeName from gl_subsystem myss, gl_subsystem_latest_event myssle where myss.ss_type is null and myss.ss_parent=myssle.ss_id and myss.name = myssle.param_id)",
    },

    {
      api: "/solution_tree_3",
      query:
        "(select id, zone_parent as parentId, name, zone_tag as Detail1, zone_type as type, description as Detail2 from gl_location limit 3) UNION (select myss.id id, zone_id as parentId, name, concat(ss_tag, ' - ', description) as tag, ss_type as type, concat(ss_parent, ' @ ', ss_address_value) as description from gl_subsystem myss, gl_location_subsystem_map mylss where myss.id=mylss.ss_id limit 3) UNION (select myss.id id, ss_parent parentId, name, concat(param_value, ' @ ', measured_time) as value, concat(ss_tag, ':', ss_address_value) as type,  description as CodeName from gl_subsystem myss, gl_subsystem_latest_event myssle where myss.ss_type is null and myss.ss_parent=myssle.ss_id and myss.name = myssle.param_id limit 3)",
    },

    {
      api: "/mytestsql",
      query:
        "call executeMyQueries((select group_concat(description separator '') from my_query));",
    },
    {
      api: "/ikw_per_tr",
      query:
        "SELECT metric_id, metric_value, measured_time FROM cpm_0001bc0000_metric WHERE measured_time >= NOW() - INTERVAL 7 DAY order by measured_time DESC",
    },
    {
      api: "/ikw_per_tr_ch",
      query:
        "SELECT ss_id, metric_id, metric_value, measured_time FROM ( SELECT t.* FROM ch_0001b00000_metric t JOIN ( SELECT metric_id, MAX(measured_time) AS latest_time FROM ch_0001b00000_metric GROUP BY metric_id ) x ON t.metric_id = x.metric_id AND t.measured_time = x.latest_time ) AS t1 UNION ALL SELECT ss_id, metric_id, metric_value, measured_time FROM ( SELECT t.* FROM ch_0002b00000_metric t JOIN ( SELECT metric_id, MAX(measured_time) AS latest_time FROM ch_0002b00000_metric GROUP BY metric_id ) x ON t.metric_id = x.metric_id AND t.measured_time = x.latest_time ) AS t2;",
    },

    {
      api: "/kw_per_tr_inst",
      query:
        "SELECT " +
        // ── Chiller 1 ──
        "ch1_on AS chiller_1_is_running, " +
        "ch1_kw AS chiller_1_kw, " +
        "ch1_fla AS chiller_1_fla, " +
        "ch1_entering AS chiller_1_entering_temp, " +
        "ch1_leaving AS chiller_1_leaving_temp, " +
        "CASE WHEN ch1_on = 0 THEN 0 " +
        "     ELSE ROUND((btu_flow / NULLIF((ch1_on + ch2_on), 0)) * (ch1_entering - ch1_leaving) * 0.33, 4) " +
        "END AS chiller_1_tr, " +
        "CASE WHEN ch1_on = 0 OR ((btu_flow / NULLIF((ch1_on + ch2_on), 0)) * (ch1_entering - ch1_leaving) * 0.33) <= 0 THEN 0 " +
        "     ELSE ROUND(ch1_kw / ((btu_flow / NULLIF((ch1_on + ch2_on), 0)) * (ch1_entering - ch1_leaving) * 0.33), 4) " +
        "END AS chiller_1_kw_per_tr, " +
        // ── Chiller 2 ──
        "ch2_on AS chiller_2_is_running, " +
        "ch2_kw AS chiller_2_kw, " +
        "ch2_fla AS chiller_2_fla, " +
        "ch2_entering AS chiller_2_entering_temp, " +
        "ch2_leaving AS chiller_2_leaving_temp, " +
        "CASE WHEN ch2_on = 0 THEN 0 " +
        "     ELSE ROUND((btu_flow / NULLIF((ch1_on + ch2_on), 0)) * (ch2_entering - ch2_leaving) * 0.33, 4) " +
        "END AS chiller_2_tr, " +
        "CASE WHEN ch2_on = 0 OR ((btu_flow / NULLIF((ch1_on + ch2_on), 0)) * (ch2_entering - ch2_leaving) * 0.33) <= 0 THEN 0 " +
        "     ELSE ROUND(ch2_kw / ((btu_flow / NULLIF((ch1_on + ch2_on), 0)) * (ch2_entering - ch2_leaving) * 0.33), 4) " +
        "END AS chiller_2_kw_per_tr, " +
        // ── BTU Flow ──
        "btu_flow AS btu_meter_actual_flow " +
        "FROM (SELECT " +
        // ── Chiller 1 status + KW + temps + FLA ──
        "COALESCE((SELECT CASE WHEN LOWER(param_value) IN ('1','on','active','running','true','yes','run') OR (param_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$' AND CAST(param_value AS DECIMAL(20,6)) > 0) THEN 1 ELSE 0 END FROM ch_0001b00000_om_p WHERE param_id = 'sts_on_off_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch1_on, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM em_0001000000_om_p WHERE param_id = 'par_avg_active_power_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch1_kw, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM ch_0001b00000_om_p WHERE param_id = 'par_comp_percent_load_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch1_fla, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM ch_0001b00000_om_p WHERE param_id = 'par_evap_entering_temp_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch1_entering, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM ch_0001b00000_om_p WHERE param_id = 'sts_evap_leaving_temp_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch1_leaving, " +
        // ── Chiller 2 status + KW + temps + FLA ──
        "COALESCE((SELECT CASE WHEN LOWER(param_value) IN ('1','on','active','running','true','yes','run') OR (param_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$' AND CAST(param_value AS DECIMAL(20,6)) > 0) THEN 1 ELSE 0 END FROM ch_0002b00000_om_p WHERE param_id = 'sts_on_off_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch2_on, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM em_0002000000_om_p WHERE param_id = 'par_avg_active_power_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch2_kw, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM ch_0002b00000_om_p WHERE param_id = 'par_comp_percent_load_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch2_fla, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM ch_0002b00000_om_p WHERE param_id = 'par_evap_entering_temp_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch2_entering, " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM ch_0002b00000_om_p WHERE param_id = 'sts_evap_leaving_temp_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch2_leaving, " +
        // ── BTU Meter Actual Flow ──
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM coh_0001c00000_om_p WHERE param_id = 'par_actual_flow_00' ORDER BY created_at DESC LIMIT 1), 0) AS btu_flow" +
        ") AS t",
    },
    {
      api: "/plantapi",
      query:
        "SELECT CASE WHEN btu_tr = 0 OR (ch1_on = 0 AND ch2_on = 0) THEN 0 ELSE ROUND(total_kw / btu_tr, 2) END AS kw_per_tr, total_kw, btu_tr FROM (SELECT " +
        // ── Chiller kW (CH1, CH2, CH3 — 2 compressors each) ──
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM em_0001000000_om_p WHERE param_id = 'par_avg_active_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM em_0002000000_om_p WHERE param_id = 'par_avg_active_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        // ── Primary pump kW (PV1, PV2, PV3) ──
        "ABS(COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM pu_0001b10000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0)) + " +
        "ABS(COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM pu_0002b10000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0)) + " +
        "ABS(COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM pu_0003b10000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0)) + " +
        // ── Condenser pump kW from energy meter tables (CP01, CP02, CP03) ──
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM condpu_0001b40000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM condpu_0002b40000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM condpu_0003b40000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        // ── CT fan kW (CT1, CT2, CT3 — 2 fans each) ──
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM em_0007000000_om_p WHERE param_id = 'par_avg_active_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM em_0008000000_om_p WHERE param_id = 'par_avg_active_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM em_0009000000_om_p WHERE param_id = 'par_avg_active_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        // -- Secondary Pumps
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM secpu_0001b30000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM secpu_0002b30000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM secpu_0002b30000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM secpu_0004b30000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM secpu_0005b30000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) + " +
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM secpu_0006b30000_om_p WHERE param_id = 'par_avg_power_00' ORDER BY created_at DESC LIMIT 1), 0) AS total_kw, " +
        // ── BTU meter TR (actual_power) ──
        "COALESCE((SELECT CAST(param_value AS DECIMAL(20,6)) FROM coh_0001c00000_om_p WHERE param_id = 'par_actual_power_00' ORDER BY created_at DESC LIMIT 1), 0) AS btu_tr, " +
        // ── Chiller on/off: SAFE_ON handles '1','active','on','running' etc. ──
        "COALESCE((SELECT CASE WHEN LOWER(param_value) IN ('1','on','active','running','true','yes','run') OR (param_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$' AND CAST(param_value AS DECIMAL(20,6)) > 0) THEN 1 ELSE 0 END FROM ch_0001b00000_om_p WHERE param_id = 'sts_on_off_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch1_on, " +
        "COALESCE((SELECT CASE WHEN LOWER(param_value) IN ('1','on','active','running','true','yes','run') OR (param_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$' AND CAST(param_value AS DECIMAL(20,6)) > 0) THEN 1 ELSE 0 END FROM ch_0002b00000_om_p WHERE param_id = 'sts_on_off_00' ORDER BY created_at DESC LIMIT 1), 0) AS ch2_on) AS t",
    },
  ];
}

function prepareResults(err, myres, results = [], fields = []) {
  // console.log(results, fields);
  if (err) {
    myres.json(err.message);
  } else {
    myres.json(results);
  }
}

function toModify(err, myres, results = [], fields = []) {
  try {
    var otherapis = glapis();
    for (let i = 0; i < otherapis.length; i++) {
      //console.log(`Testing Request: ${req.url} with body ${JSON.stringify(req.body, null, ' ')}`);
      if (
        otherapis[i]["method"] &&
        otherapis[i]["method"].toLowerCase() === "post"
      ) {
        router.post(otherapis[i]["api"], (req, res) => {
          // mydata['newData'] = req.body;
          if ("activeScenario" in mydata) {
            if ("192.168.1.49:2602" in req.body) {
              if ("192.168.1.49:2602" in mydata["nowReceived"])
                mydata["lastReceived"]["192.168.1.49:2602"] =
                  mydata["nowReceived"]["192.168.1.49:2602"];
              mydata["nowReceived"]["192.168.1.49:2602"] =
                req.body["measured_time"];
            }
            if ("192.168.1.49:2601" in req.body) {
              if ("192.168.1.49:2601" in mydata["nowReceived"])
                mydata["lastReceived"]["192.168.1.49:2601"] =
                  mydata["nowReceived"]["192.168.1.49:2601"];
              mydata["nowReceived"]["192.168.1.49:2601"] =
                req.body["measured_time"];
            }
          } else {
            mydata["activeScenario"] = "1234";
            mydata["lastReceived"] = {};
            mydata["nowReceived"] = {};
          }
          console.log(
            `POST request ${
              req.url
            } at ${new Date().toLocaleString()} with body ${JSON.stringify(
              req.body,
              null,
              " ",
            )} and Sample Data - ${JSON.stringify(mydata, null, " ")}`,
          );
          res.json(req.body);
        });
      } else {
        router.get(otherapis[i]["api"], (req, res) => {
          if (otherapis[i]["api"].indexOf("/:id") !== -1) {
            dbpool.executeQuery(otherapis[i]["query"], prepareResults, res, [
              req.params.id,
            ]);
          } else {
            dbpool.executeQuery(otherapis[i]["query"], prepareResults, res);
          }
          // res.send('Queried');
        });
      }
    }
  } catch (e) {
    console.log(e.message);
  }
}

function handleMyPost() {
  try {
    var otherapis = glapis();
    for (let i = 0; i < otherapis.length; i++) {
      //console.log(`Testing Request: ${req.url} with body ${cpmUtils.myPrint(req.body)}`);
      if (
        otherapis[i]["method"] &&
        otherapis[i]["method"].toLowerCase() === "post"
      ) {
        router.post(otherapis[i]["api"], (req, res) => {
          console.log(
            `POST request ${
              req.url
            } at ${cpmUtils.getCurrentTime()} body ${cpmUtils.myPrint(
              req.body,
            )} `,
          );
          if (otherapis[i]["api"] === "/mypost") {
            controlHandler.pbs2_mypost_response(req, res);
          } else if (otherapis[i]["api"] === "/getCtState") {
            controlHandler.getCoolingTowerState(req, res);
          } else if (otherapis[i]["api"] === "/mynotify") {
            notifier.processStateTransition(req, res);
          } else if (otherapis[i]["api"] === "/mycpmnotify") {
            // notifier.processCPMNotification(req, res);
            jw.processMyCpmNotification(req, res);
          } else if (otherapis[i]["api"] === "/controlaction") {
            controlHandler.handleUIAction(req, res);
          } else if (otherapis[i]["api"] === "/controlctoutletvalve") {
            controlHandler.ControlCoolingTowerOutletValve(req, res);
          } else if (otherapis[i]["api"] === "/autoManualStatus") {
            controlHandler.set_cpm_metric_state(req, res);
          } else if (otherapis[i]["api"] === "/controlcoolingtowerfan") {
            controlHandler.ControlCoolingTowerFanNoRelationship(req, res);
          } else if (otherapis[i]["api"] === "/setManualState") {
            controlHandler.set_manual_metric_state(req, res);
          } else if (otherapis[i]["api"] === "/getTrKwValuesOfChiller") {
            controlHandler.get_tr_kw_values_of_chiller(req, res);
          } else if (otherapis[i]["api"] === "/setThresholdValues") {
            controlHandler.set_cpm_add_remove_threshold(req, res);
          } else {
            res.json(
              `handleMyPost-Unhandled Post Request - ${otherapis[i]["api"]}`,
            );
          }

          // res.json(req.body);
        });
      } else {
        router.get(otherapis[i]["api"], (req, res) => {
          if (otherapis[i]["api"].indexOf("/:id") !== -1) {
            dbpool.executeQuery(otherapis[i]["query"], prepareResults, res, [
              req.params.id,
            ]);
          } else if (otherapis[i]["api"] === "/mycpmsnapshot") {
            notifier.getCPMSnapshotHandler(req, res);
          } else if (otherapis[i]["api"] === "/myibmssnapshot") {
            controlHandler.send_plant_snapshot(req, res);
          } else if (otherapis[i]["api"] === "/currentState") {
            dataHandler.getCurrentState(req, res);
          } else if (otherapis[i]["api"] === "/concurrentstatus") {
            dataHandler.ConCurrentStatus(req, res);
          } else if (otherapis[i]["api"] === "/getcpmState") {
            controlHandler.get_cpm_metric_state(req, res);
          } else if (otherapis[i]["api"] === "/getManualState") {
            controlHandler.get_manual_metric_state(req, res);
          } else if (otherapis[i]["api"] === "/getThresholdValues") {
            controlHandler.get_cpm_add_remove_threshold(req, res);
          } else {
            dbpool.executeQuery(otherapis[i]["query"], prepareResults, res);
          }

          // res.send('Queried');
        });
      }
    }
  } catch (e) {
    console.log(e.message);
  }
}

// dataHandler.initialize();
//dataHandler.initialize("./CPM_modular/modular.json");
handleMyPost();

// dataHandler.initialize(getMasterScenariosFile());
// setInterval(() => jw.processWatchDog(), 1000);
// setInterval(() => jw.processAlarms(), 10000);

// creates to avoid multiple run cpm calls at same time

async function runCPM() {
  try {
    await site_scripts.site_cpm_handler();
    console.log("CPM handler executed successfully");
  } catch (err) {
    console.error("CPM handler failed:", err);
  } finally {
    console.log("Scheduling next CPM handler execution in 15 seconds");
    setTimeout(runCPM, 15000);
  }
}

async function runAlarms() {
  try {
    await startProcessAlarms();
    console.log("startProcessAlarms successfully");
  } catch (err) {
    console.error("startProcessAlarms failed:", err);
  } finally {
    console.log("Scheduling next startProcessAlarms execution in 15 seconds");
    setTimeout(runAlarms, 5000);
  }
}

runAlarms();
runCPM();

module.exports = router;
