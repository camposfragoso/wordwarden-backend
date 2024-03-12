var express = require("express")

const Folder = require("../models/folders")
const User = require("../models/users")

require("../models/connection")

var router = express.Router()

//POST : create a new folder for a given user, and in a given folder, save parent folder, and save it a as child folder

router.post("/", (req,res)=>{
  User.findOne({token : req.body.token}).then(data=>{
    const userId = data._id;

    const newFolder = new Folder({
      owner: userId,
      parentFolder : req.body.parentFolder,
    })
    newFolder.save().then((data)=>{
      Folder.updateOne({_id:req.body.parentFolder},{$push:{childrenFolders:data.id}}).then(()=>{

        // console.log(data)
        res.json({result : true, message:"new folder Created"})
      })
    })
  })
})


//GET : get all datas from a given folder, for a given user

router.get("/:parentFolderId/:token",(req,res)=>{
  User.findOne({token : req.params.token}).then(userData=>{
    if(userData!==null){
      Folder.findById(req.params.parentFolderId).populate("files").populate("childrenFolders").then(data=>{
        res.json({result : true, id: req.params.parentFolderId, name : data.name, parentFolder : data.parentFolder, childrenFolders : data.childrenFolders, files : data.files})
      })
    }
  })
})

module.exports = router