const { OK } = require('http-status');

const uploadImage = (req, res, next) => {
  // console.log("q1 atr5fghyu7[p-================",req)
  res.status(OK).json({
    message: 'File uploaded successfully',
    filename: req.file.originalname
  });
};

module.exports = {
  uploadImage
};


// const uploadImage = (req, res, function (error){
//   if (error) { //instanceof multer.MulterError
//     res.status(500);
//     if (error.code == 'LIMIT_FILE_SIZE') {
//         error.message = 'File Size is too large. Allowed file size is 200KB';
//         error.success = false;
//     }
//     return res.json(error);
// } else {
//     if (!req.file) {
//         res.status(500);
//         res.json('file not found');
//     }
//     res.status(200);
//     res.json({
//         success: true,
//         message: 'File uploaded successfully!',
//         filename: req.file.originalname
//     });
// }
// } ) 



//1234567890-=
// const uploadImage = (req, res, next) => {
//   res.status(OK).json({
//     message: 'File uploaded successfully',
//     filename: req.file.originalname
//   });
// };