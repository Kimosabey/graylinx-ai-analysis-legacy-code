use uni_exp_new;
select 
gll.id as Location,
gl.ss_type device_ss_type,
gl.name as device_name,
gl.id as device_id,
gl.ss_address_value as device_table_name,
concat(gl.ss_address_value,'_metric') as metric_table,
device.ss_tag  as param_type,
device.ss_address_value as param_instance_id,
device.name as param_id, 
le.param_value as presentValue,
le.measured_time,
device.description as gl_code,
ddc.name as ddc_name,
ddc.id as ddc_id
from (
SELECT * FROM gl_subsystem
where description is not null and ss_parent is not null
) device

left join (select * from gl_subsystem gl where ss_type is not null and ss_address_type !='GL_SS_ADDRESS_IP') gl
on device.ss_parent = gl.id

left join gl_subsystem_latest_event le
    ON le.param_id = device.name and
    le.ss_id = gl.id
    
left join gl_location_subsystem_map glm
on glm.ss_id = gl.id

left join gl_location gll
on glm.zone_id = gll.id

left join (
select * from gl_subsystem gl where ss_type ='GL_SS_ADDRESS_BACNET_DDC') ddc
on gl.ss_parent = ddc.id


