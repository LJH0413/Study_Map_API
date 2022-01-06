var express = require("express");
var router = express.Router();
const locationModel = require("../model/location");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/upload", (req, res, next) => {
  res.render("upload");
});

// get테스트
router.get("/test", (req, res, next) => {
  console.log("test 완료");
  res.json({
    message: "get 완료!",
  });
});
// post 테스트
router.post("/test2", (req, res, next) => {
  const test = req.body.test;
  console.log(test);
  res.json({
    message: "post 완료!",
  });
});

router.post("/location", (req, res, next) => {
  const { title, address, lat, lng } = req.body;
  let location = new locationModel();
  location.title = title;
  location.address = address;
  location.lat = lat;
  location.lng = lng;
  location
    .save()
    .then((result) => {
      console.log(result);
      res.json({
        message: "success",
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        message: "error",
      });
    });
});

//데이터 불러오기
router.get("/location", (req, res, next) => {
  locationModel
    .find({}, { _id: 0, __v: 0 })
    .then((result) => {
      res.json({
        message: "success",
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: "error",
      });
    });
});

module.exports = router;
