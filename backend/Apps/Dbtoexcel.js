const { pool } = require('../Database/pool');
const excelJS = require("exceljs");

//const User = require("../Models/User"); // This has data to be used
//const excelJS = require("exceljs");
let User=[]





const getSetPoint = ()  => {
    pool.getConnection((err, connection) => {
      if (connection) {
          const query=`select f.name as floor_name,z.name as zone_name,a.name as area_name ,d.name as device_name,d.mac from device d inner join area a on d.area_id=a.id inner join zone z on a.zone_id=z.id inner join floor f on z.floor_id=f.id limit 2;`
        // const query = `select * from  gl_subsystem_process_map where status="processing" and param_id="ahu_set_point";`;
        connection.query(query, (error, results) => {
          connection.release();
          if (error) {
              console.log(error)
            //callback(error);
          } else {
              console.log("ressss",results)
              User=results
              exportUser();
           // callback(null, results);
          }
        });
      } else {
        callback('DB connection error');
      }
    });
  };
const exportUser = async (req, res) => { 
 
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("My Users"); // New Worksheet
  const path = "./files";  // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
      { header: "S no.", key: "s_no", width: 10 }, 
      { header: "First Name", key: "floor_name", width: 10 },
      { header: "Last Name", key: "zone_name", width: 10 },
      { header: "Email Id", key: "area_name", width: 10 },
      { header: "Gender", key: "device_name", width: 10 },
      { header: "Abc", key: "mac", width: 10 },
    ];
    // Looping through User data
    console.log("i ammammam ",User)
let counter = 1;
User.forEach((user) => {
  user.s_no = counter;
  worksheet.addRow(user); // Add data in worksheet
  counter++;
});
// Making first line in excel bold
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});
try {
  const data = await workbook.xlsx.writeFile(`${path}/users.xlsx`)
   .then(() => {
       console.log("done")
    //  res.send({
    //    status: "success",
    //    message: "file successfully downloaded",
    //    path: `${path}/users.xlsx`,
    //   });
   });
} catch (err) {
//     res.send({
//     status: "error",
//     message: "Something went wrong",
//   });
console.log("sjsjsj not done",err)
  }
};
 getSetPoint()

module.exports = exportUser;