var express = require("express")

const Folder = require("../models/folders")
const User = require("../models/users")

require("../models/connection")

var router = express.Router()

//POST : create a new folder for a given user, and in a given folder

router.post("/", (req,res)=>{
  User.findOne({token : req.body.token}).then(data=>{
    const userId = data._id;

    const newFolder = new Folder({
      owner: userId,
      parentFolder : req.body.parentFolderId,
    })
    newFolder.save().then(()=>{
      res.json({result : true, message:"new File Created"})
    })
  })
})


//GET : get all datas from a given folder, for a given user

router.get("/:parentFolderId/:token",(req,res)=>{
  User.findOne({token : req.params.token}).then(userData=>{
    if(userData!==null){
      Folder.findById(req.params.parentFolderId).populate("files").then(data=>{
        res.json({result : true, name : data.name, parentFolder : data.parentFolder, childrenFolders : data.childrenFolders, files : data.files})
      })
    }
  })
})

module.exports = router