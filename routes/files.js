var express = require("express")

const File = require("../models/files")
const User = require("../models/users")

require("../models/connection")


var router = express.Router()

//POST : create a new file

router.post("/",(req,res)=>{
  File.find({title : req.body.title}).then((data)=>{
    if(data!==null){

      User.findOne({token : req.body.token}).then(data =>{
        const author = data.id;
        
        const newFile = new File({
          content : req.body.content,
          author : author,
          title : req.body.title,
          locatedIn : req.body.path,
          activeAssistants : data.defaultActiveAssistants
    
        })
    
        newFile.save().then(()=>{
          File.find({title : req.body.title}).then(data=>{
            res.json({result : true, title : data.title})
          })
        })
      })
    }else{
      res.json({result : false, error:"already existing file with same title"})
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


module.exports = router