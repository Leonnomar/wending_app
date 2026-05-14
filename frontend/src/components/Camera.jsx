import { useRef, useState } from "react"
import Slideshow from "./Slideshow"
import { supabase } from "../supabase"

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

                    console.log("Iniciando subida...")

                    const fileName = `${Date.now()}.jpg`

                    // SUBIR IMAGEN
                    const { error: uploadError } = await supabase.storage
                        .from("photos")
                        .upload(fileName, blob)

                    console.log("Upload error:", uploadError)

                    if(uploadError){
                        return
                    }

                    // OBTENER URL
                    const { data } = supabase.storage
                        .from("photos")
                        .getPublicUrl(fileName)

                    console.log("Public URL:", data.publicUrl)

                    // GUARDAR EN DB
                    const { error: dbError } = await supabase
                        .from("photos")
                        .insert([
                            {
                                image_url: data.publicUrl
                            }
                        ])

                    
                    console.log("DB error", dbError)

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
            }}
            >

                {!cameraOpen ? (

                    <button onClick={() => {
                        setCameraOpen(true)
                        startCamera()
                    }}
                    style={{
                        background:"linear-gradient(135deg,#ff4d6d,#ff758f)",
                        color:"#fff",
                        border:"none",
                        padding:"12px 22px",
                        borderRadius:"50px",
                        fontSize:"16px",
                        fontWeight:"bold",
                        cursor:"pointer",
                        boxShadow:"0 10px 30px rgab(255,77,109,0.35)",
                        transition:"0.2s"
                    }}
                    onMouseOver={(e)=>{
                        e.currentTarget.style.transform = "scale(1.05)"
                    }}
                    onMouseOut={(e)=>{
                        e.currentTarget.style.transform = "scale(1)"
                    }}
                    >
                        Abrir cámara
                    </button>
                ) : (

                    <>
                        <button 
                        onClick={switchCamera}
                        style={{
                            background:"rgba(255,255,255,0.2)",
                            backdropFilter:"blur(10px)",
                            color:"#fff",
                            border:"1px solid rgba(255,255,255,0.3)",
                            padding:"10px 18px",
                            borderRadius:"50px",
                            cursor:"pointer"
                        }}
                        >
                            🔄 Cambiar cámara
                        </button>

                        <button onClick={() => {

                            const currentStream = videoRef.current.srcObject

                            if(currentStream){
                                currentStream.getTracks().forEach(track => track.stop())
                            }

                            setCameraOpen(false)
                        }}
                        style={{
                            background:"rgba(0,0,0,0.5)",
                            color:"#fff",
                            border:"none",
                            padding:"10px 18px",
                            borderRadius:"50px",
                            cursor:"pointer"
                        }}
                        >
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
                        bottom:"30px",
                        left:"50%",
                        transform:"translateX(-50%)",
                        width:"90px",
                        height:"90px",
                        background:"#ff4d6d",
                        border:"6px solid white",
                        borderRadius:"50%",
                        cursor:"pointer",
                        boxShadow:"0 10px 40px rgba(255,77,109,0.5)",
                        zIndex:9999
                    }}>
                        📸
                    </button>
                )
            }

            <canvas
            ref={canvasRef}
            style={{display:"none"}}
            />

        </div>
    )
}