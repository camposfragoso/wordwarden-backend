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


//GET : get collection infos of all of one user’s files

router.get("/:userId",(req, res)=>{
  File.find({author:req.params.userId}).then((data)=>{
    if(data===null){
      res.json({result : false, error:"could not find files for this user"})
    }else{
      const array = data.map(el=>{
        return {
          creationDate : el.creationDate,
          title : el.title,
          activeAssistants : el.activeAssistants,
          lastModified:el.lastModified,
          contentLength : el.content.length
        }
      })
      res.json({result:true, data:array})
    }
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
    if(data.ackcnowlegded===true){
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
    if(data.ackcnowlegded===true){
      res.json({result : true})
    }else{
      res.json({result:false,error : "couldn’t delete documents"})
    }
  })
})



module.exports = router