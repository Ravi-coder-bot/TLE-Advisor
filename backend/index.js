const express =  require('express');
const cors = require('cors');
const analysisRoute = require('./routes/analysisRoute');



const app =  express();
app.use(cors());
app.use(express.json());  


const PORT = process.env.PORT ||  5000 ; 

app.get('/' , (req,res)=>{
    res.json({message : 'Hello world'}); 
})

app.use('/api/analysis' , analysisRoute );

app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);
})