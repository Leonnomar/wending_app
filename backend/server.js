const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

if(!fs.existsSync("uploads")){
    fs.mkdirSync("uploads")
}

const app = express()

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.get("/", (req,res)=>{
    res.send("Wedding Gallery API funcionando")
})

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log("Servidor corriendo en puerto", PORT)
})

const multer = require("multer")

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/")
    },
    filename: function(req, file, cb){
        const uniqueName = Date.now() + ".jpg"
        cb(null, uniqueName)
    }
})

const upload = multer({ storage })

app.post("/upload", upload.single("photo"), (req,res)=>{
    console.log(req.file)

    res.json({
        message:"Foto recibida"
    })
})

app.get("/photos", (req,res)=>{

    fs.readdir("uploads", (err,files)=>{

        if(err){
            return res.status(500).json({error:"No se pudieron leer las fotos"})
        }

        res.json(files)
    })
})

app.get("/download/:name", (req,res)=>{
    
    const fileName = req.params.name

    const filePath = path.join(__dirname,"uploads",fileName)

    res.download(filePath)
    
})