import React, { useState, useEffect } from 'react';

//https://www.npmjs.com/package/svg-to-dataurl
// https://stackoverflow.com/questions/51135958/using-degrees-symbols-in-react-and-jsx
function overlayTextboxes(myImages = []) {
    return <>
        {myImages.map((imgx, index) => {
            return (imgx["textBox"] === undefined)
                ? <></>
                : <>
                    <text x={imgx['x']} y={imgx['y']} fontSize="1.2em">{imgx['textBox']}</text>
                </>
        })}
    </>
}

function addParameterBoxes() {
    return <>
            {/* <rect x={258} y={25} width={87} height={55} fill='#0ff'></rect> */}
        <rect x={440} y={80} width={150} height={55} fill='#00f'></rect>
        <text x={445} y={95} fontSize="0.75em" stroke='#fff'>S/Air Temperature S/P: 14.4&#8451;</text>
        <text x={445} y={110} fontSize="0.75em" stroke='#fff'>S/Air Pressure S/P: 355 Pa</text>
        <text x={445} y={125} fontSize="0.75em" stroke='#fff'>Mix Pressure S/P: -175 Pa</text>
        <rect x={248} y={26} width={60} height={50} fill='#00f'></rect>
        <text x={295} y={27} fontSize="0.75em" stroke='#fff'>29.2 &#8451;</text>
        <text x={295} y={42} fontSize="0.75em" stroke='#fff'>28 %rh</text>
        <text x={295} y={57} fontSize="0.75em" stroke='#fff'>7 kJ/kg</text>
        <rect x={550} y={155} width={45} height={50} fill='#00f'></rect>
        <text x={555} y={168} fontSize="0.75em" stroke='#fff'>350 Pa</text>
        <text x={555} y={183} fontSize="0.75em" stroke='#fff'>14.5 &#8451;</text>
        <text x={555} y={198} fontSize="0.75em" stroke='#fff'>61 %rh</text>
        <rect x={206} y={216} width={60} height={50} fill='#00f'></rect>
        <text x={95} y={118} fontSize="0.75em" stroke='#fff'>33%</text>
        <rect x={63} y={230} width={35} height={20} fill='#00f'></rect>
        <text x={70} y={243} fontSize="0.75em" stroke='#fff'>55%</text>
        <rect x={165} y={218} width={75} height={20} fill='#00f'></rect>
        <text x={170} y={230} fontSize="0.75em" stroke='#fff'>Status : Clean</text>
        <rect x={250} y={218} width={85} height={35} fill='#00f'></rect>
        <text x={254} y={230} fontSize="0.75em" stroke='#fff'>Status : Running</text>
        <text x={254} y={245} fontSize="0.75em" stroke='#fff'>Speed : 97%</text>
        <rect x={350} y={235} width={60} height={35} fill='#00f'></rect>
        <text x={354} y={247} fontSize="0.75em" stroke='#fff'>76%</text>
        <text x={354} y={262} fontSize="0.75em" stroke='#fff'>CHW Valve</text>
        <rect x={420} y={235} width={60} height={35} fill='#00f'></rect>
        <text x={424} y={247} fontSize="0.75em" stroke='#fff'>0%</text>
        <text x={424} y={262} fontSize="0.75em" stroke='#fff'>CW Mode</text>
        <rect x={146} y={168} width={45} height={30} fill='#00f'></rect>
        <text x={150} y={180} fontSize="0.75em" stroke='#fff'>-163 Pa</text>
        <text x={150} y={192} fontSize="0.75em" stroke='#fff'>28.5 &#8451;</text>
    </>
}
function addBoxedParameters(textboxes = []) {
    const getAlertPoints = (x1, y1, h1) => {
        let mypoints = '';
        mypoints += `${x1 + 0.25 * h1},${y1 + 0.75 * h1} `;
        mypoints += `${x1 + 0.75 * h1},${y1 + 0.75 * h1} `;
        mypoints += `${x1 + 0.5 * h1},${y1 + 0.25 * h1}`;
        return mypoints;
    }
    let myx, myy, textXd = 5, textYd = 15;
    return textboxes.map(box => {
        myx = box['x']; myy = box['y'];
        return <>
        {/* <svg width="800" height="800">
  <defs>
    <pattern x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" id="SvgjsPattern1008">
      <polygon points="100 100,100 100" fill="#ff00ff" stroke-width="1" patternUnits="objectBoundingBox"/>
      <polygon points="0,0 100,0 100,100" fill="#00ff00" stroke-width="1" patternUnits="objectBoundingBox"/>
    </pattern>
  </defs>
  <rect width="100" height="100" x="0" y="75" rx="20" ry="20" fill="url(&quot;#SvgjsPattern1008&quot;)"/>
</svg> */}
{/* <svg width="12cm" height="4cm" viewBox="0 0 1200 400"
   rx='18px' ry='18px' >

  <rect x="3" y="6" width="1198" height="398"
        fill="none" stroke="blue" stroke-width="2" rx='18px' ry='18px'/>

  <rect x="400" y="9" width="400" height="200"
        fill="yellow" stroke="navy" stroke-width="10"  />
</svg> */}

                               {/* <rect filter='drop-shadow(0 0 4px #969696)' x={myx} y={myy} width={box['width']} height={box['height']} fill={box['color']}  rx="18" ry="18"> */}
                       
            <rect filter='drop-shadow(0 0 4px #969696)'  x={myx} y={myy} width={box['width']} height={box['height']/2 } fill='#fff' ></rect>
            <rect filter='drop-shadow(0 0 4px #969696)'  x={myx} y={myy + box['height'] / 2} width={box['width']} height={box['height'] / 2} fill={box['color']} ></rect>
            {/* </rect> */}
         { (box['color']=="#f00") ? <> <polygon points={getAlertPoints(myx, myy + box['height'] / 2, 32)} fill="#ff0"  />
            <text textAnchor='middle' x={myx + 16} y={myy + 0.75 * box['height'] + 8} fontSize={box['textSize']} stroke='#000'>!</text> </> :<></>}
             
            

          {box['textitems'].map(item => {
                myy += textYd;
                let nameValue=item.split(':');
                if(nameValue.length==1){nameValue.push(nameValue[0])}
                return <><text x={myx} y={myy} fontSize={box['textSize']} stroke={box['textColor']}>{nameValue[0]}</text>
              
                { (box['color']=="#f00") ? <><text x={myx + textXd} y={myy +box['height'] / 2 } fontSize={box['textSize']} stroke={box['textColor']}></text></> : <><text x={myx + textXd} y={myy + box['height'] / 2} fontSize={box['textSize']+0.50} fill='#fff' >{nameValue[1]}</text></>}
                
                </>
            }
            )}
        </>
    })
}

function prepareView(myImages = [], w = 120, h = 100, startx = 0, starty = 0, tw = 900, th = 200, arrow = 8, addBoxes = false, myBoxData=[]) {
    var myx = startx, myy = starty + h / 2;
    return <svg xmlns='http://www.w3.org/2000/svg' width={tw} height={th}>
        <rect x={0} y={0} width={tw} height={th} fill='#fff'></rect>
        {myImages.map((imgx, index) => {
            myx += imgx['w'] + w / 2;
            return <>
                {(imgx["topdown"] === undefined)
                    ?
                    <>
                        {(imgx["textin"] !== undefined) ? <text x={myx - imgx['w'] - w / 2} y={myy + h / 2 - 10} fontSize="0.7em">{imgx["textin"]}</text> : ''}
                        {(imgx["textout"] !== undefined) ? <text x={myx} y={myy + h / 2 + 10} fontSize="0.7em">{imgx["textout"]}</text> : ''}
                        <line x1={myx - imgx['w'] - w / 2} x2={myx - imgx['w']} y1={myy + h / 2} y2={myy + h / 2} stroke='#000'></line>
                        <line x1={myx - imgx['w'] - arrow} y1={myy + h / 2 - arrow} x2={myx - imgx['w']} y2={myy + h / 2} strokeWidth={2} stroke='#000'></line>
                        <line x1={myx - imgx['w'] - arrow} y1={myy + h / 2 + arrow} x2={myx - imgx['w']} y2={myy + h / 2} strokeWidth={2} stroke='#000'></line>
                    </>
                    :
                    <>
                        {(imgx["textin"] !== undefined) ? <text x={myx - w / 2} y={myy - h / 4} fontSize="0.7em">{imgx["textin"]}</text> : ''}
                        {(imgx["textout"] !== undefined) ? <text x={myx} y={myy + h / 2 + 10} fontSize="0.7em">{imgx["textout"]}</text> : ''}
                        <line x1={myx - w / 2} x2={myx - w / 2} y1={myy - h / 2} y2={myy} stroke='#000'></line>
                        <line x1={myx - w / 2 - arrow} y1={myy - arrow} x2={myx - w / 2} y2={myy} strokeWidth={2} stroke='#000'></line>
                        <line x1={myx - w / 2 + arrow} y1={myy - arrow} x2={myx - w / 2} y2={myy} strokeWidth={2} stroke='#000'></line>
                    </>
                }
                <image x={myx - imgx['w']} y={myy} width={imgx['w']} height={imgx['h']} xlinkHref={imgx["url"]}></image>
            </>;
        })}
        <line x1={myx} x2={myx + w / 2} y1={myy + h / 2} y2={myy + h / 2} stroke='#000'></line>
        <line x1={myx + w / 2 - arrow} y1={myy + h / 2 - arrow} x2={myx + w / 2} y2={myy + h / 2} strokeWidth={2} stroke='#000'></line>
        <line x1={myx + w / 2 - arrow} y1={myy + h / 2 + arrow} x2={myx + w / 2} y2={myy + h / 2} strokeWidth={2} stroke='#000'></line>
        {overlayTextboxes(myImages)}
        {addBoxes ? addBoxedParameters(myBoxData) : ''}
        {/* {addBoxes ? addParameterBoxes() : ''} */}
        {/* <foreignObject x1={100} width={250} height={250}><object type = "image/png" data="./BuildingDashboard.png" width="250" height="200"></object></foreignObject> */}
    </svg>;
}

function getTableData(myinput = [], param_map = {}) {
    // var param_map = { "location": 'Location', "ahu_id": 'AHU Id', "ahu_on_off": 'Fan On Cmd On/off', "mode": 'VFD mode Ramp up / down', "ahu_vfd_mode": 'VFD Mode Auto/Manual', "ahu_run_status": 'AHU Run status On/off', "ahu_set_point": 'T Set Point Deg C', "ahu_in_air_temperature": 'RAT Deg C', "ahu_supply_air_temperature": 'SAT Deg C', "ahu_chilled_valve": 'ChW valve %', "ahu_trip_status": 'Trip status On/off', "ahu_filter_status": 'Filter status Off=clean' };
    var myoutput = [], odata = [];
    var param_ids = {}, output_ids = {}, i = 0, j = 0;
    var params = Object.keys(param_map);
    params.forEach((key, index) => {
        param_ids[key] = i++;
    });
    for (i = 0; i < myinput.length; i++) {
        if (output_ids[myinput[i]["id"]] === undefined) {
            odata = [];
            for (j = 0; j < params.length; j++) {
                odata[j] = '---';
            }
            odata[param_ids['location']] = param_map['location'];
            odata[param_ids['ahu_id']] = myinput[i]["name"];
            output_ids[myinput[i]["id"]] = myoutput.push(odata) - 1;
        } else {
            myoutput[output_ids[myinput[i]["id"]]][param_ids[myinput[i]["param_id"]]] = myinput[i]["param_value"];
        }
    }
    // console.log(myoutput);
    return myoutput;
}
function getTableDataJSON(myinput = [], param_map = {}) {
    // var param_map = { "location": 'Location', "ahu_id": 'AHU Id', "ahu_on_off": 'Fan On Cmd On/off', "mode": 'VFD mode Ramp up / down', "ahu_vfd_mode": 'VFD Mode Auto/Manual', "ahu_run_status": 'AHU Run status On/off', "ahu_set_point": 'T Set Point Deg C', "ahu_in_air_temperature": 'RAT Deg C', "ahu_supply_air_temperature": 'SAT Deg C', "ahu_chilled_valve": 'ChW valve %', "ahu_trip_status": 'Trip status On/off', "ahu_filter_status": 'Filter status Off=clean' };
    var myoutput = [], odata = {};
    var param_ids = {}, output_ids = {}, i = 0, j = 0;
    var params = Object.keys(param_map);
    params.forEach((key, index) => {
        param_ids[key] = i++;
    });
    for (i = 0; i < myinput.length; i++) {
        if (output_ids[myinput[i]["id"]] === undefined) {
            odata = {};
            for (j = 0; j < params.length; j++) {
                odata[params[j]] = '---';
            }
            odata['location'] = param_map['location'];
            odata['ahu_id'] = myinput[i]["name"];
            output_ids[myinput[i]["id"]] = myoutput.push(odata) - 1;
        } else {
            myoutput[output_ids[myinput[i]["id"]]][myinput[i]["param_id"]] = myinput[i]["param_value"];
        }
    }
    return myoutput;
}

function prepareTable(headings = [], rowdata = []) {
    return <><span>arguments.callee.toString()</span>
        <table style={{ border: "1px solid" }}>
            <tr>{headings.map((hx) => {
                return <th style={{ border: "1px solid" }}>{hx}</th>
            })}</tr>
            {rowdata.map((rd) => {
                return <tr>
                    {rd.map(celld => <td style={{ border: "1px solid" }}>{celld}</td>)}
                </tr>
            })}
        </table></>;
}
// {Object.values(this)[0].name}
export default function GRHA({
    myimage = '/GraylinxPhoto.png',
    width = 500,
    height = 500,
    text1 = '',
    text1x = 350,
    text1y = 150,
    text2 = '',
    text2x = 350,
    text2y = 350,
    addBoxes = false,
    boxWidth = 0,
    boxHeight = 0,
    boxData = null
}) {
    const [myNewColor, setMyNewColor] = useState('#00ffff');
    const [myCircleColor, setMyCircleColor] = useState('00ff00');
    var ahu_params = { "location": 'Location', "ahu_id": 'AHU Id', "ahu_on_off": 'Fan On Cmd On / Off', "mode": 'VFD Mode Ramp Up / Down', "ahu_vfd_mode": 'VFD Mode Auto / Manual', "ahu_run_status": 'AHU Run status On / Off', "ahu_set_point": 'T Set Point \u00b0C', "ahu_in_air_temperature": 'RAT \u00b0C', "ahu_supply_air_temperature": 'SAT \u00b0C', "ahu_chilled_valve": 'ChW Valve %', "ahu_trip_status": 'Trip Status On / Off', "ahu_filter_status": 'Filter Status Off = Clean' };
    var ahu_data = [
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_on_off",
            "param_value": "on"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_vfd_mode",
            "param_value": "67"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "mode",
            "param_value": "off"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_run_status",
            "param_value": "on"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_set_point",
            "param_value": "19"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_in_air_temperature",
            "param_value": "21"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_supply_air_temperature",
            "param_value": "20"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_chilled_valve",
            "param_value": "68"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_trip_status",
            "param_value": "on"
        },
        {
            "id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4ba1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_filter_status",
            "param_value": "0"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_on_off",
            "param_value": "of"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_vfd_mode",
            "param_value": "27"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "mode",
            "param_value": "off"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_run_status",
            "param_value": "on"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_set_point",
            "param_value": "18.5"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_in_air_temperature",
            "param_value": "25"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_supply_air_temperature",
            "param_value": "21"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_chilled_valve",
            "param_value": "48"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_trip_status",
            "param_value": "off"
        },
        {
            "id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "name": "AHU_WS",
            "zone_parent": "bfa9eb1d-da60-4a50-b8e3-3370141e94c4",
            "zone_id": "0011fc20-64b0-4dac-b3d6-317aa8b2b6f2",
            "ss_id": "01f8d696-5abc-4da1-a3be-415bedaed456",
            "created_at": "2022-04-05 16:49:36",
            "modified_at": "2022-05-03 10:40:09",
            "ss_tag": null,
            "description": null,
            "ss_type": "NONGL_SS_AHU",
            "ss_shape": "circle",
            "ss_status": "GL_SS_STATUS_ACTIVE",
            "ss_address_type": null,
            "ss_address_value": null,
            "ss_parent": null,
            "coordinates": "[350.640,713]",
            "measured_time": "2022-05-03 15:30:00",
            "param_id": "ahu_filter_status",
            "param_value": "0"
        }
    ]
    var defaultBoxData = [
        { 'x': 258, 'y': 25, 'width': 87, 'height': 55, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["S/Air Temperature S/P: 14.4 C", "S/Air Pressure S/P: 355 Pa", "Mix Pressure S/P: -175 Pa"] },
        { 'x': 290, 'y': 12, 'width': 50, 'height': 55, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["29.2 C", "28% rh", "7 kJ/kg"] },
        { 'x': 550, 'y': 155, 'width': 45, 'height': 50, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["350 Pa", "14.5 C", "61 %rh"] },
        { 'x': 88, 'y': 105, 'width': 35, 'height': 20, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["33%"] },
        { 'x': 63, 'y': 230, 'width': 35, 'height': 20, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["55%"] },
        { 'x': 165, 'y': 218, 'width': 75, 'height': 20, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["Status : Clean"] },
        { 'x': 250, 'y': 218, 'width': 85, 'height': 35, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["Status : Running", "Speed : 97%"] },
        { 'x': 350, 'y': 235, 'width': 60, 'height': 35, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["76%", "CHW Valve"] },
        { 'x': 420, 'y': 235, 'width': 60, 'height': 35, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["0%", "CW Mode"] },
        { 'x': 146, 'y': 168, 'width': 45, 'height': 30, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["-163 Pa", "28.5 C"] }
    ];
    boxData = (boxData === null) ? defaultBoxData : boxData;


    // useEffect(() => setMyCircleColor(mycolor), [mycolor]);
    // const renderForeignObjectNode = ({
    //     nodeDatum,
    //     foreignObjectProps
    // }) => {
    //     return (<g>
    //         <circle r={15} ></circle>
    //         {/* `foreignObject` requires width & height to be explicitly set. */}
    //         {/* <foreignObject {...foreignObjectProps}>
    //             <div style={{ border: "1px solid black", backgroundColor: '#fff000' }}>
    //                 <p style={{ textAlign: "center" }}>{nodeDatum.name.substr(0, 9)}</p>
    //                 {nodeDatum.children && (
    //                     <div>
    //                         <button style={{ width: "100%" }} >
    //                             <h3>{"+ / -"}</h3>
    //                         </button>
    //                         <button style={{ width: "100%" }}>
    //                             <small>{(nodeDatum.attributes['zone_type'] + '@' + nodeDatum.id).substr(0, 9)}</small>
    //                         </button>
    //                     </div>
    //                 )}
    //             </div>
    //         </foreignObject> */}
    //     </g>
    //     );
    // }
    function handleClick() {
        setMyCircleColor(myNewColor);
    }
    function updateNewColor() {
        setMyNewColor('#008000');
    }
    return (
        <><div className="App">
            {/* {prepareTable(Object.values(ahu_params), getTableData(ahu_data, ahu_params))} */}
            {prepareView([
                { "url": myimage, 'w': width, 'h': height },
                { "textBox": text1, 'x': text1x, 'y': text1y },
                { "textBox": text2, 'x': text2x, 'y': text2y }
            ], 0, 0, 0, 0, width + boxWidth, height + boxHeight, 0, addBoxes, boxData)}
        </div></>
    );
}
