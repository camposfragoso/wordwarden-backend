var express = require("express")

const Folder = require("../models/folders")
const User = require("../models/users")
const File = require("../models/files")

require("../models/connection")

var router = express.Router()

//POST : create a new folder for a given user,in his main folder, save parent folder, and save it a as child folder

router.post("/", (req, res) => {
  User.findOne({ token: req.body.token }).then(data => {
    // console.log(data._id)
    const userId = data._id;
    console.log(userId)

    const newFolder = new Folder({
      owner: userId,
    })

    newFolder.save().then((data) => {

      res.json({ result: true, message: "new folder Created" })

    })
  })
})



//GET : get all datas from a given folder, for a given user

router.get("/:parentFolderId/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then(userData => {
    if (userData !== null) {
      Folder.findById(req.params.parentFolderId).populate("files").populate("childrenFolders").then(data => {
        res.json({ result: true, id: req.params.parentFolderId, name: data.name, parentFolder: data.parentFolder, childrenFolders: data.childrenFolders, files: data.files })
      })
    }else{
      res.json({result:false, error:"user not found"})
    }
  })
})

//il faut que quand j’arrive sur un page, je récupére tous les dossiers dont l’owner est la personne qui est connectée, et que je populate tous ces dossiers là, pas besoin de faire un fetch à chaque fois, je le fais seulement quand il y a une suppression, ou un changement de dossier

//je fais donc ma nouvelle route get 

router.get("/:token",(req, res)=>{
  User.findOne({token:req.params.token}).then(userData=>{
    if(userData!==null){
      Folder.find({owner:userData._id}).populate("files").then(folderData=>{
    
        File.find({author:userData._id, isInFolder:false}).then(filesData=>{
          
          res.json({result:true, folderData:folderData, filesData:filesData})
        })
      })
    }else{
      res.json({result:false,error:"user not found"})
    }
  })
})

//UPDATE : put a file to a parent

router.put("/", (req, res) => {
  // Folder.findOne({_id:req.body.})
  Folder.updateOne({ _id: req.body.folderId }, { $push: { files: req.body.fileId } }).then(data => {
    if (data.acknowledged) {
      File.updateOne({_id:req.body.fileId},{isInFolder:true}).then(()=>{
        File.findById(req.body.fileId).then((data)=>{

          res.json({ result: true, isInFolder: data.isInFolder, message: `${req.body.fileId} moved to ${req.body.folderId}` })
        })
      })
    } else {
      res.json({ result: false, message: "could not move" })
    }
  })
})


//UPDATE :change folder name

router.put("/name",(req,res)=>{
  Folder.updateOne({ _id: req.body.folderId },{name:req.body.newName}).then(data=>{
    if(data.acknowledged){
      res.json({result:true, newName : req.body.newName})
    }
  })
})

//DELETE: delete a folder by id

router.delete("/", (req, res) => {
  Folder.findById(req.body.folderId)
    .then(folderData => {
      const fileDeletePromises = folderData.files.map(fileId => File.deleteOne({ _id: fileId }));
      return Promise.all(fileDeletePromises);
    })
    .then(() => {
      return Folder.deleteOne({ _id: req.body.folderId });
    })
    .then(() => {
      res.json({ result: true, message: "everything deleted" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ result: false, message: "an error occurred" });
    });
});
module.exports = router