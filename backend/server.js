let likes = {}
let comments = {}

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

app.post("/like/:photo", (req,res)=>{

    const photo = req.params.photo

    if(!likes[photo]){
        likes[photo] = 0
    }

    likes[photo]++

    res.json({likes: likes[photo]})

})

app.get("/likes", (req,res)=>{
    res.json(likes)
})

app.post("/comment/:photo", (req,res)=>{

    const photo = req.params.photo
    const { name, text } = req.body

    if(!comments[photo]){
        comments[photo] = []
    }

    comments[photo].push({ name, text })

    res.json(comments[photo])
})

app.get("/comments/:photo", (req,res)=>{

    const photo = req.params.photo

    res.json(comments[photo] || [])
})