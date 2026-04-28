import React, { useState, useCallback, useEffect } from 'react';

//Paths used:
// floorCoords['meeting-rooms']['areas'] {name - title, coords - top left and bottom right coordinates
// (coordinates should be in the correct order), door - size, position: [top, right, bottom, left], offset from
// top or left
// floorCoords['hot-desking']['areas'] {name - title, coords - top left and bottom right coordinates
// (coordinates should be in the correct order)

export default function FloorMapGenerator01({
    width: width = 800, height: height = 500,
    floorCoords: floorCoords = null,
    roomStyle: roomStyle = null,
    wallStyle: wallStyle = null,
    seatStyle: seatStyle = null,
}) {
    if (roomStyle == null) roomStyle = {
        'fill': 'none',
        'strokeWidth': 1,
        'fillSelected': '#008',
        'titleStroke': '#000',
        'strokeHighlighted': 'blue'
    }
    if (wallStyle == null) wallStyle = {
        'fill': '#ccc',
        'strokeWidth': 0
    }
    if (seatStyle == null) seatStyle = {
        fill: '#ccc',
        strokeWidth: 0,
        seatGap: 4
    }
    const roomSpecs = {
        'roompath': ['meeting-rooms', 'areas'],
        'roomname': 'name',
        'roomcoords': 'coords',
        'doorSize': 'door-size',
        'doorOffset': 'door-offset',
        'doorPosition': 'door-position',
        'roomId': 'meeting_room_id',
        'doorSizeDefault': 40,
        'wallThickness': 10
    }
    const defaultFloorCoords = {
        "meeting-rooms": {
            "name": "my-map",
            "areas": [
                {
                    "name": "full-floor",
                    "meeting_room_id": "001a1557-18d4-483d-8c86-daf74ebf7bc5",
                    "shape": "rect",
                    "coords": [
                        50,
                        25,
                        750,
                        475
                    ],
                    'door-position': 'top',
                    'door-offset': 185,
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 10
                },
                {
                    "name": "conference-room",
                    "meeting_room_id": "008e92a8-f12a-4119-9c36-4cc5796b032a",
                    "shape": "rect",
                    "coords": [
                        50,
                        325,
                        250,
                        475
                    ],
                    'door-position': 'top',
                    'door-offset': 150,
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 6
                },
                {
                    "name": "ceo-office",
                    "meeting_room_id": "0085dea5-2282-46d0-8b55-4134c4dbbe31",
                    "shape": "rect",
                    "coords": [
                        50,
                        25,
                        210,
                        125
                    ],
                    'door-position': 'bottom',
                    'door-offset': 110,
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 10
                },
                {
                    "name": "control-room",
                    "meeting_room_id": "00985f88-e9b4-4a99-be1d-6ebe555a7b1d",
                    "shape": "rect",
                    "coords": [
                        50,
                        125,
                        150,
                        325
                    ],
                    'door-position': 'right',
                    'door-offset': 150,
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 6
                },
                {
                    "name": "refresh-room",
                    "meeting_room_id": "00a5d988-aa4b-4739-b191-4c8e79a9e98a",
                    "shape": "rect",
                    "coords": [
                        300,
                        25,
                        450,
                        125
                    ],
                    'door-position': 'bottom',
                    'door-offset': 55,
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 10
                },
                {
                    "name": "pantry-room",
                    "meeting_room_id": "9d350384-a621-4cda-9094-0bafe1dc5766",
                    "shape": "rect",
                    "coords": [
                        450,
                        25,
                        600,
                        125
                    ],
                    'door-offset': 20,
                    'door-position': 'bottom',
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 6
                },
                {
                    "name": "sales-office",
                    "meeting_room_id": "5375ba88-4e24-48e1-909e-30864b6eaee8",
                    "shape": "rect",
                    "coords": [
                        650,
                        125,
                        750,
                        225
                    ],
                    'door-position': 'left',
                    'door-offset': 20,
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 10
                },
                {
                    "name": "clean-room-lab",
                    "meeting_room_id": "050eabf9-9fb3-4fe7-8c9c-5a9303bfb833",
                    "shape": "rect",
                    "coords": [
                        650,
                        225,
                        750,
                        475
                    ],
                    'door-position': 'left',
                    'door-offset': 20,
                    "preFillColor": "rgba(0, 179, 0, 0.7)",
                    "no_of_seats": 6
                }
            ]
        },
    }

    const [selected, setSelected] = useState();
    const [decoratedRooms, setDecoratedRooms] = useState();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [floorRoomsMap, setFloorRoomsMap] = useState();

    useEffect((floorCoords) => {
        if (floorCoords == null || floorCoords == undefined) {
            floorCoords = defaultFloorCoords;
        }
        setFloorRoomsMap(prepareRooms(floorCoords, roomSpecs));
        setDataLoaded(true);
    }, [floorCoords]);

    function prepareRooms(fcoords, roomJSONpaths) {
        let mshape = {};
        let i, myid, id_roomMap = new Map(), myrooms;

        if (fcoords[roomJSONpaths['roompath'][0]] != undefined) {
            myrooms = fcoords[roomJSONpaths['roompath'][0]];
        } else {
            return <text>"Invalid Coordinates Specified"</text>
        }
        for (i = 1; i < roomJSONpaths['roompath'].length; i++) {
            myrooms = myrooms[roomJSONpaths['roompath'][i]];// Assumes elements are properly available
        }

        myrooms.map((mitem, index) => {
            mitem.x = mitem[roomJSONpaths['roomcoords']][0];
            mitem.y = mitem[roomJSONpaths['roomcoords']][1];
            mitem.width = mitem[roomJSONpaths['roomcoords']][2] - mitem.x;
            mitem.height = mitem[roomJSONpaths['roomcoords']][3] - mitem.y;

            myid = (mitem[roomJSONpaths['roomId']] != undefined) ? mitem[roomJSONpaths['roomId']] : '';
            // Mapping Room ID to the parent object having Room Details
            if (myid != '') {
                id_roomMap.set(myid, mitem);
            } else {
                console.log('This Room is not added to the list!')
            }
        });
        return id_roomMap;
    }

    function drawRooms(id_roomMap, roomJSONpaths, roomStyle, wallStyle) {
        let doorSizeDefault = roomJSONpaths['doorSizeDefault'];
        let wall = roomJSONpaths['wallThickness'];
        let hwall = wall / 2;
        let xl1, xl2, xr1, xr2;
        let yt1, yt2, yb1, yb2;
        let roomShapes = [];
        let doorPosition, doorOffset, doorSize;
        let mshape = {};
        let i, j, myrooms, roomEntry, mroom;

        myrooms = id_roomMap.values();
        roomEntry = myrooms.next();
        while (!roomEntry.done) {
            mroom = roomEntry.value;
            roomEntry = myrooms.next();

            //process room to draw
            mroom.x = mroom[roomJSONpaths['roomcoords']][0];
            mroom.y = mroom[roomJSONpaths['roomcoords']][1];
            mroom.width = mroom[roomJSONpaths['roomcoords']][2] - mroom.x;
            mroom.height = mroom[roomJSONpaths['roomcoords']][3] - mroom.y;

            // Room Layout
            mroom.fill = (roomStyle['fill'] != undefined) ? roomStyle['fill'] : 'none';
            mroom.strokeWidth = (roomStyle['strokeWidth'] != undefined) ? roomStyle['strokeWidth'] : '2';
            roomShapes.push(mroom);

            xl1 = mroom.x - hwall; xl2 = mroom.x + hwall;
            xr1 = xl1 + mroom.width; xr2 = xl2 + mroom.width;
            yt1 = mroom.y - hwall; yt2 = mroom.y + hwall;
            yb1 = yt1 + mroom.height; yb2 = yt2 + mroom.height;

            doorPosition = (mroom[roomJSONpaths['doorPosition']] != undefined) ? mroom[roomJSONpaths['doorPosition']] : 'top';
            doorOffset = (mroom[roomJSONpaths['doorOffset']] != undefined) ? mroom[roomJSONpaths['doorOffset']] : mroom.width / 3;
            doorSize = (mroom[roomJSONpaths['doorSize']] != undefined) ? mroom[roomJSONpaths['doorSize']] : doorSizeDefault;

            if (doorPosition == 'top') {
                mshape = {};
                mshape.x = xl1; mshape.y = yt1;
                mshape.width = doorOffset + hwall; mshape.height = wall;
                roomShapes.push(mshape);
                mshape = {};
                mshape.x = xl1 + doorOffset + hwall + doorSize; mshape.y = yt1;
                mshape.width = mroom.width - hwall - doorOffset - doorSize; mshape.height = wall;
                roomShapes.push(mshape);
            } else {
                mshape = {};
                mshape.x = xl1; mshape.y = yt1;
                mshape.width = mroom.width; mshape.height = wall;
                roomShapes.push(mshape);
            }
            // bottom
            if (doorPosition == 'bottom') {
                mshape = {};
                mshape.x = xl2; mshape.y = yb1;
                mshape.width = doorOffset - hwall; mshape.height = wall;
                roomShapes.push(mshape);
                mshape = {};
                mshape.x = xl2 + doorOffset - hwall + doorSize; mshape.y = yb1;
                mshape.width = mroom.width + hwall - doorOffset - doorSize; mshape.height = wall;
                roomShapes.push(mshape);
            } else {
                mshape = {};
                mshape.x = xl2; mshape.y = yb1;
                mshape.width = mroom.width; mshape.height = wall;
                roomShapes.push(mshape);
            }
            // left door
            if (doorPosition == 'left') {
                mshape = {};
                mshape.x = xl1; mshape.y = yt2;
                mshape.width = wall; mshape.height = doorOffset - hwall;
                roomShapes.push(mshape);
                mshape = {};
                mshape.x = xl1; mshape.y = yt2 + doorOffset + doorSize - hwall;
                mshape.width = wall; mshape.height = mroom.height - doorOffset - doorSize + hwall;
                roomShapes.push(mshape);
            } else {
                mshape = {};
                mshape.x = xl1; mshape.y = yt2;
                mshape.width = wall; mshape.height = mroom.height;
                roomShapes.push(mshape);
            }
            // right
            if (doorPosition == 'right') {
                mshape = {};
                mshape.x = xr1; mshape.y = yt1
                mshape.width = wall; mshape.height = doorOffset + hwall;
                roomShapes.push(mshape);
                mshape = {};
                mshape.x = xr1; mshape.y = yt1 + doorOffset + doorSize + hwall;
                mshape.width = wall; mshape.height = mroom.height - doorOffset - doorSize - hwall;
                roomShapes.push(mshape);
            } else {
                mshape = {};
                mshape.x = xr1; mshape.y = yt1;
                mshape.width = wall; mshape.height = mroom.height;
                roomShapes.push(mshape);
            }

        }

        return (
            <>
                {roomShapes.map((item) =>
                    <rect
                        fill={(item.fill == undefined) ? wallStyle['fill'] : item.fill}
                        strokeWidth={(item.strokeWidth == undefined) ? wallStyle['strokeWidth'] : item.strokeWidth}
                        x={item.x} y={item.y} width={item.width} height={item.height}
                    >
                        {/* {(item.name != undefined && item.name != '') ? <title>{item.name}</title> : ''} */}
                    </rect>
                )}
                {roomShapes.map((item) => (
                    (item[roomJSONpaths['roomId']] != undefined && item[roomJSONpaths['roomId']] != '')
                        ? (
                            <text x={item.x + item.width / 2} y={item.y + item.height / 3} textAnchor={"middle"}>
                                {/* {item[roomJSONpaths['roomId']].includes(focussedRooms) */}
                                {item[roomJSONpaths['roomId']] == decoratedRooms
                                    ? <tspan stroke={roomStyle['strokeHighlighted']} x={item.x + item.width / 2} dy="1.2em">{item[roomJSONpaths['roomname']]}</tspan>
                                    : <tspan stroke={roomStyle['titleStroke']} x={item.x + item.width / 2} dy="1.2em">{item[roomJSONpaths['roomname']]}</tspan>
                                }
                                <tspan
                                    x={item.x + item.width / 2} dy="1.2em"
                                    onClick={() => { setSelected(item[roomJSONpaths['roomId']]); }}>Click to Select</tspan>
                            </text>
                        )
                        : ''
                )
                )}
            </>
        );

    }

    function drawSeats(x = 260, y = 225, w = 380, h = 240, nx = 10, ny = 5, dd = 6) {
        let myseats = [], seat = {}, index = 1, snn;
        let hd = dd / 2, myx = x + hd, myy = y + hd, dx = w / nx, dy = h / ny;
        for (let i = 0; i < nx; i++) {
            myy = y + hd;
            if (i % 2 == 1 && i < nx - 1) {
                snn = {};
                snn.x = myx - hd; snn.width = 2 * dx;
                snn.y = y; snn.height = h;
                snn.fill = "none"; snn.stroke = '#ccc'; snn.strokeWidth = 1;
                myseats.push(snn);
            }
            for (let j = 0; j < ny; j++) {
                seat = {};
                seat.x = myx; seat.width = dx - dd;
                seat.y = myy; seat.height = dy - dd;
                seat.name = "S:" + (((i % 2 == 0) ? (ny - j - 1) : j) + ny * i + 1); //snn =  index++; 
                myseats.push(seat);
                myy += dy;
            }
            myx += dx;
        }
        return (
            <>
                {myseats.map((item) =>
                    <rect
                        fill={(item.fill == undefined) ? '#ccc' : item.fill} rx={2 * dd} ry={2 * dd}
                        strokeWidth={(item.strokeWidth == undefined) ? 0 : item.strokeWidth}
                        x={item.x} y={item.y} width={item.width} height={item.height}
                    >
                        <title>{item.name}</title>
                    </rect>
                )}
                {myseats.map((item) =>
                    <text x={item.x + dx / 2 - hd} y={item.y + dy / 2 - hd} textAnchor={"middle"}>{item.name}</text>
                )}
            </>
        );
    }

    function showRoomIDDetails(roomIdMap, roomSpecs, roomid) {
        let details = '', myobj;
        if (roomIdMap.has(roomid)) {
            myobj = roomIdMap.get(roomid);
            details += '[Name: ' + myobj[roomSpecs['roomname']];
            details += ': Id: ' + myobj[roomSpecs['roomId']];
            if (myobj['width'] != undefined) details += '; width: ' + myobj['width'];
            if (myobj['height'] != undefined) details += '; height: ' + myobj['height'];
            details += ': Seats: ' + myobj['no_of_seats'];
            details += ']'
        }
        return details;
    }

    function prepareRoomDecorator(roomIdMap, roomSpecs) {
        let details = '';
        let opts = [];
        let rooms = roomIdMap.entries(), result = rooms.next();
        while (!result.done) {
            details += '<option value="' + result.value[0] + '">' + result.value[1][roomSpecs['roomname']] + '</option>';
            opts.push(result.value[1]);
            result = rooms.next();
        }

        return (
            <formgroup align='top'>
                <label>Highlight Room:</label>
                <select
                    name="Rooms" id="selectedRoom"// multiple
                    // values={}
                    onChange={e => {
                        setDecoratedRooms(e.target.value);//e.target.id
                    }}
                >
                    {opts.map(item =>
                        <option value={item[roomSpecs['roomId']]}>
                            {item[roomSpecs['roomname']]}
                        </option>)
                    }
                </select>
            </formgroup >
        );
    }

    return (
        <div className="App">
            <p>Room {selected != undefined ? 'Selected: ' + showRoomIDDetails(floorRoomsMap, roomSpecs, selected) : ': NOT SELECTED'}</p>
            {dataLoaded ? prepareRoomDecorator(floorRoomsMap, roomSpecs) : 'Loading ...'}
            {dataLoaded
                ? <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height}>
                    <g transform={`translate(100, 20)`} stroke='#000'>
                        <g transform={"scale(0.8, 0.8)"}>
                            {drawRooms(floorRoomsMap, roomSpecs, roomStyle, wallStyle)}
                            {drawSeats()}
                        </g>
                        <rect fill="none" width={640} height={400} x={0} y={0} strokeWidth={(selected ? 2 : 1)} />
                    </g>
                </svg>
                : 'Loading'
            }
        </div>
    );
}
