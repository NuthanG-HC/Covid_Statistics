const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8081

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');


app.get('/totalRecovered', async (req,res)=>{
    let add =0;
  let sum = await connection.find().sort({recovered:-1})
  sum.filter((arr)=>add+=arr.recovered)
   res.json({
    data:{
        _id:"total",
        recovered: add
    }
   
   })
})

app.get('/totalActive', async (req,res)=>{
  let sub =0;
  let sum = await connection.find().sort({recovered:-1})
  sum.filter((arr)=>sub+=(arr.infected - arr.recovered ))
   res.json({
    data:{
        _id:"total",
        active: sub
    }
   
   })
})
app.get('/totalDeath', async (req,res)=>{
    let dea =0;
    let sum = await connection.find().sort({recovered:-1})
    sum.filter((arr)=>dea+=(arr.death))
     res.json({
      data:{
          _id:"total",
          death: dea
      }
     
     })
  })
app.get('/hotspotStates', async (req, res) => {
    let result;
     try {
      result = await connection.aggregate([
        {$project:{_id:0,"state":"$state",
        "rate":{$round:[{$divide:[{$subtract:["$infected","$recovered"]},"$infected"]},5]}}}
       ]) 
     
       const finalresult =result.filter((data)=>{
           return data.rate>0.1
       });
      
       res.status(200).json({
         data: finalresult
       })
     } catch (e) {
       res.status(500).json({
         status: 'Failed',
         message: e.message
       })
     }
   })
 
app.get('/healthyStates', async (req, res) => {
     let result
     try {
        result = await connection.aggregate([
        {$project:{_id:0,"state":"$state",
        "mortality":{$round:[{$divide:["$death","$infected"]},5]}}}
       ]) 
   const finalresult = result.filter((data)=>{
     return data.mortality<0.005
   })
       res.status(200).json({
         data: finalresult
       })
     } catch (e) {
       res.status(500).json({
         status: 'Failed',
         message: e.message
       })
     }
   })


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;