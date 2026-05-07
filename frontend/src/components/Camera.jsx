import { useRef, useState } from "react"

export default function Camera(){

    const videoRef = useRef()
    const canvasRef = useRef()

    const [facingMode, setFacingMode] = useState("environment")

    async function startCamera(){

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode }
        })

        videoRef.current.srcObject = stream

    }

    async function switchCamera() {

        const newMode =
            facingMode === "enviroment"
            ? "user"
            : "environment"

        setFacingMode(newMode)

        const currentStream = videoRef.current.srcObject

        if(currentStream){
            currentStram.getTracks().forEach(track => track.stop())
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newMode }
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

            await fetch(`${import.meta.env.VITE_API_URL}/upload`,{
                method:"POST",
                body:formData
            })

            video.play()
            alert("Foto subida 📸")
        }, "image/jpeg")
    }

    return(

        <div>

            <button onClick={startCamera}>
                Abrir cámara
            </button>
            <button
            onClick={switchCamera}
            style={{
                marginLeft:"10px"
            }}
            >
                🔄 Cambiar cámara
            </button>

            <br></br>

            <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
                width:"100%",
                height:"100vh",
                objectFit:"cover",
                position:"relative",
                zIndex:1
            }}
            />

            <br></br>

            <button 
            onClick={takePhoto}
            style={{
                position:"fixed",
                bottom:"20px",
                left:"50%",
                transform:"translateX(-50%)",
                background:"#ff4d6d",
                color:"#fff",
                border:"none",
                padding:"15px 25px",
                borderRadius:"50px",
                fontSize:"28px",
                zIndex:9999
            }}>
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