import { useRef } from "react"

export default function Camera(){

    const videoRef = useRef()
    const canvasRef = useRef()

    async function startCamera(){

        const stream = await navigator.mediaDevices.getUserMedia({
            video:true
        })

        videoRef.current.srcObject = stream

    }

    async function takePhoto(){

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        context.drawImage(video,0,0)

        canvas.toBlob(async (blob)=>{

            const formData = new FormData()

            formData.append("photo", blob, "photo.jpg")

            await fetch("http://localhost:5000/upload",{
                method:"POST",
                body:formData
            })

            console.log("Foto enviada")
        }, "image/jpeg")
    }

    return(

        <div>

            <button onClick={startCamera}>
                Abrir cámara
            </button>

            <br></br>

            <video
            ref={videoRef}
            autoPlay
            style={{width:"300px"}}
            />

            <br></br>

            <button onClick={takePhoto}>
                Tomar foto 📸
            </button>

            <br></br>

            <canvas
            ref={canvasRef}
            style={{width:"300px"}}
            />

        </div>
    )
}