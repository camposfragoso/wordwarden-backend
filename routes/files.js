var express = require("express")

const File = require("../models/files")
const User = require("../models/users")
const Folder = require("../models/folders")

require("../models/connection")


var router = express.Router()

//POST : save a new file

router.post("/", async (req, res) => {
  try {
    const file = await File.findById(req.body.fileId);
    if (file) {
      const date = new Date();
      await File.updateOne(
        { _id: req.body.fileId },
        { title: req.body.title, content: req.body.content, lastModified: date }
      );
      console.log('new file')
      return res.json({ result: true });
    } else {
      console.log("pour aller vers la création")
      const user = await User.findOne({ token: req.body.token });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const author = user._id;
      let newFile;
      if(req.body.parentFolderId){

        newFile = new File({
          content: req.body.content,
          author: author,
          title: req.body.title,
          activeAssistants: user.defaultActiveAssistants,
          isInFolder:true
        });
      }else{
        newFile = new File({
          content: req.body.content,
          author: author,
          title: req.body.title,
          activeAssistants: user.defaultActiveAssistants,
        });
      }
      const savedFile = await newFile.save();
      if(req.body.parentFolderId){
        await Folder.updateOne(
          { _id: req.body.parentFolderId },
          { $push: { files: savedFile._id } }
        );
      }
      return res.json({ result: true, data: savedFile });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//UPDATE : update the folder the filel belong to



//GET : get collection infos of all of one user’s files

router.get("/:token",(req, res)=>{
  User.findOne({token : req.params.token}).then((data)=>{
    // console.log("voilà les données utilisateur",data)
    const userId = data._id
    // console.log(userId)
    File.find({author:userId}).then((data)=>{
      if(data===null){
        res.json({result : false, error:"could not find files for this user"})
      }else{
        console.log(data)
        const array = data.map(el=>{
          return {
            creationDate : el.creationDate,
            title : el.title,
            activeAssistants : el.activeAssistants,
            lastModified:el.lastModified,
            content : el.content
          }
        })
        res.json({result:true, data:array})
      }
    })
  })
  
})

//GET : get content of one file

router.get("/:fileId",(req, res)=>{
  File.findById(req.params.fileId).then(data=>{
    console.log(data)
    if(data===null){
      res.json({result:false, error:"file not found"})
    }else{
      res.json({result:true, data:data})
    }
  })
})

//PUT : modify content of a file for every modification

router.put("/:id",(req, res)=>{
  const date = new Date()
  File.updateOne({_id:req.params.id},{content:req.body.content, lastModified: date}).then(()=>{
    res.json({result : true})
  })
})

//PUT : modifyTitle

router.put("title/:id",(req, res)=>{
  const date = new Date()
  File.updateOne({_id:req.params.id},{title : req.body.title, lastModified:date}).then(()=>{
    res.json({result:true, message:"title modified"})
  })
})

//PUT :add active assistants for a file found by ID

router.put("addAssistant/:id",(req, res)=>{
  const date = new Date()
  const newAssistant = {assistant: req.body.assistantId, degreeOfIntervention : 2}
  File.updateOne({_id:req.params.id},{$push:{activeAssistants: newAssistant}, lastModified:date }).then(()=>{
    res.json({result : true, newAssistant : newAssistant})
  })
})

//PUT : remove active assistant for a file by ID
router.put("removeAssistant/:id",(req,res)=>{
  const date = new Date();
  const assistantToRemoveId = req.body.assistantId
  File.updateOne({_id:req.params.id},{lastModified:date, $pull:{activeAssistants:{_id:assistantToRemoveId}}}).then(()=>{
    res.json({result:true, removedAssistant : assistantToRemoveId})
  })
})


//PUT : change Assistant force of intervention in a document

router.put("changeForce/:id",(req,res)=>{
  const date = new Date();
  const assistantToChange = req.body.assistantId;
  const force = req.body.force

  File.updateOne({_id:req.params.id,"activeAssistants.assistant": assistantToChange},{$set:{
    "activeAssistants.$.degreeOfIntervention":force,
    lastModified:date
  }}).then(()=>{
    res.json({result:true})
  })
})


//DELETE : delete one file, acording to id

router.delete("/:id",(req,res)=>{
  File.deleteOne({_id:req.params.id}).then((data)=>{
    console.log(data)
    if(data.deletedCount===1){
      res.json({result:true})
    }else{
      res.json({result:false, error:"no document deleted"})
    }
  })
})


//DELETE : delete all files from 1 user
router.delete("/",(req, res)=>{
  File.deleteMany({author : req.body.authorId}).then((data)=>{
    console.log(data)
    if(data===true){
      res.json({result : true})
    }else{
      res.json({result:false,error : "couldn’t delete documents"})
    }
  })
})



module.exports = router