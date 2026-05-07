import { useRef, useState } from "react"
import Slideshow from "./Slideshow";

export default function Camera(){

    const videoRef = useRef()
    const canvasRef = useRef()

    const [facingMode, setFacingMode] = useState("environment")
    const [cameraOpen, setCameraOpen] = useState(false)

    const [countdown, setCountdown] = useState(null)
    const [flash, setFlash] = useState(false)

    async function startCamera(){

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode }
        })

        videoRef.current.srcObject = stream

    }

    async function switchCamera() {

        const newMode =
            facingMode === "environment"
            ? "user"
            : "environment"

        setFacingMode(newMode)

        const currentStream = videoRef.current.srcObject

        if(currentStream){
            currentStream.getTracks().forEach(track => track.stop())
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newMode }
        })

        videoRef.current.srcObject = stream        
    }

    async function takePhoto(){

        setCountdown(3)

        let counter = 3

        const interval = setInterval(() => {

            counter--

            if(counter > 0){

                setCountdown(counter)

            }else{

                clearInterval(interval)

                setCountdown(null)

                setFlash(true)

                setTimeout(() => {
                    setFlash(false)
                },200)

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

                    alert("Foto subida 📸")

                }, "image/jpeg")
            }
        },1000)
    }

    return(

        <div>

            {/* BOTONES */}
            <div style={{
                position:"fixed",
                top:"20px",
                width:"100%",
                display:"flex",
                justifyContent:"center",
                gap:"10px",
                zIndex:9999
            }}>

                {!cameraOpen ? (

                    <button onClick={() => {
                        setCameraOpen(true)
                        startCamera()
                    }}>
                        Abrir cámara
                    </button>
                ) : (

                    <>
                        <button onClick={switchCamera}>
                            🔄 Cambiar cámara
                        </button>

                        <button onClick={() => {

                            const currentStream = videoRef.current.srcObject

                            if(currentStream){
                                currentStream.getTracks().forEach(track => track.stop())
                            }

                            setCameraOpen(false)
                        }}>
                            Cerrar
                        </button>
                    </>
                
                )}
            
            </div>

            {/* SLIDESHOW O CÁMARA */}
            {
                cameraOpen ? (

                    <>

                        <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            width:"100%",
                            height:"100vh",
                            objectFit:"cover",
                        }}
                        />

                        {
                    
                            countdown && (

                                <div style={{
                                    position:"fixed",
                                    top:0,
                                    left:0,
                                    width:"100%",
                                    height:"100%",
                                    display:"flex",
                                    justifyContent:"center",
                                    alignItems:"center",
                                    fontSize:"120px",
                                    color:"#fff",
                                    fontWeight:"bold",
                                    background:"rgba(0,0,0,0.3)",
                                    zIndex:9998
                                }}>
                                    {countdown}
                                </div>
                            )
                        }

                        {
                            flash && (

                                <div style={{
                                    position:"fixed",
                                    top:0,
                                    left:0,
                                    width:"100%",
                                    height:"100%",
                                    background:"#fff",
                                    zIndex:9999
                                }} />
                            )
                        }
                    
                    </>

                ) : (

                    <Slideshow />

                )
            }

            {/* BOTÓN FOTO */}
            {
                cameraOpen && (

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
                )
            }

            <canvas
            ref={canvasRef}
            style={{width:"300px"}}
            />

        </div>
    )
}