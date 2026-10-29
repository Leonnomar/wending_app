import { useEffect, useRef, useState } from "react"
import Slideshow from "./Slideshow"
import { supabase } from "../supabase"
import { colors } from "../colors"

export default function Camera() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const fileInputRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const streamRef = useRef(null)
    const timerRef = useRef(null)
    const stopTimeoutRef = useRef(null)

    const [facingMode, setFacingMode] = useState("environment")
    const [cameraOpen, setCameraOpen] = useState(false)
    const [countdown, setCountdown] = useState(null)
    const [flash, setFlash] = useState(false)
    const [recording, setRecording] = useState(false)
    const [recordingSeconds, setRecordingSeconds] = useState(0)
    const [busy, setBusy] = useState(false)

    async function uploadMedia(file, mediaType) {
        if (!file) return

        const maxSize = 50 * 1024 * 1024

        if (file.size > maxSize) {
            alert("El archivo supera el límite de 50 MB.")
            return
        }

        if (mediaType === "video" && !file.type.toLowerCase().startsWith("video/")) {
            alert(`El archivo no parece ser un video válido: ${file.type || "tipo desconocido"}`)
            return
        }

        if (mediaType === "image" && !file.type.startsWith("image/")) {
            alert(`El archivo no parece ser una imagen válida: ${file.type || "tipo desconocido"}`)
            return
        }

        setBusy(true)

        try {
            const extension = file.name?.includes(".")
                ? file.name.split(".").pop().toLowerCase()
                : mediaType === "image" ? "jpg" : "mp4"

            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

            const { error: uploadError } = await supabase.storage
                .from("photos")
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from("photos")
                .getPublicUrl(fileName)

            const { error: dbError } = await supabase
                .from("photos")
                .insert([{
                    image_url: data.publicUrl,
                    media_type: mediaType
                }])

            if (dbError) throw dbError

            alert(mediaType ===  "image"
                ? "¡Foto subida! 📸"
                : "¡Video subido! 🎥")
        } catch (error) {
            console.error("Error al subir archivo:", error)

            const detail = [
                error?.message,
                error?.error,
                error?.statusCode
            ].filter(Boolean).join(" | ")

            alert(
                "Error al subir el archivo:\n" +
                (detail || JSON.stringify(error))
            )
        } finally {
            setBusy(false)
        }
    }

    async function startCamera(mode = facingMode){
        try{
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode },
                audio: true
            })

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (error) {
            console.error("Error al abrir la cámara:", error)
            alert("No se pudo abrir la cámara o el micrófono. Revisa los permisos del navegador.")
            setCameraOpen(false)
        }
    }

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }

    async function switchCamera() {
        if (recording) {
            alert("Detén la grabación antes de cambiar la cámara.")
            return
        }

        const newMode = facingMode === "environment"
            ? "user"
            : "environment"

        stopCamera()
        setFacingMode(newMode)
        await startCamera(newMode)
    }

    async function takePhoto(){
        if (!videoRef.current || busy || recording || countdown !== null) return

        if (!videoRef.current.videoWidth) {
            alert("Espera un momento a que la cámara esté lista.")
            return
        }

        setCountdown(3)

        let counter = 3

        const interval = setInterval(() => {
            counter--

            if (counter > 0){
                setCountdown(counter)
                return
            }
            
            clearInterval(interval)
            setCountdown(null)
            setFlash(true)

            setTimeout(() => setFlash(false), 200)

            const video = videoRef.current
            const canvas = canvasRef.current
            const context = canvas.getContext("2d")

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            context.drawImage(video, 0, 0)

            canvas.toBlob(async blob => {
                if (!blob) {
                    alert("No se pudo procesar la fotografía.")
                    return
                }

                const file = new File(
                    [blob],
                    `foto-${Date.now()}.jpg`,
                    { type: "image/jpeg" }
                )

                await uploadMedia(file, "image")
            }, "image/jpeg",0.92)
        },1000)
    }

    async function startRecording() {
        const stream = streamRef.current

        if (!stream || busy || recording) return

        if (typeof MediaRecorder === "undefined") {
            alert("Este navegador no permite grabar videos.")
            return
        }

        const mimeTypes = [
            "video/webm;codecs=vp8",
            "video/webm",
            "video/mp4",
            "video/quicktime"
        ]

        const mimeType = mimeTypes.find(type =>
            MediaRecorder.isTypeSupported(type)
        )
        
        try {
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream)

            mediaRecorderRef.current = recorder
            chunksRef.current = []

            recorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data)
                    console.log("Fragmento de video:", event.data.size)
                }
            }

            recorder.onerror = event => {
                console.error("Error de MediaRecorder:", event.error)
                alert("El navegador tuvo un problema al grabar el video.")
            }

            recorder.onstop = async () => {
                clearInterval(timerRef.current)
                clearTimeout(stopTimeoutRef.current)

                const blobType =
                    recorder.mimeType ||
                    chunksRef.current.find(chunk => chunk.type)?.type ||
                    "video/webm"

                const blob = new Blob(chunksRef.current, {
                    type: blobType
                })
                
                console.log("Video generado:", {
                    size: blob.size,
                    type: blob.type,
                    chunks: chunksRef.current.length
                })

                setRecording(false)
                setRecordingSeconds(0)

                if (!blob.size) {
                    alert("El navegador no generó datos de video. Prueba otro navegador.")
                    return
                }

                const extension = blobType.includes("mp4")
                    ? "mp4"
                    : blobType.includes("quicktime")
                        ? "mov"
                        : "webm"

                const file = new File(
                    [blob],
                    `video-${Date.now()}.${extension}`,
                    { type: blobType }
                )

                await uploadMedia(file, "video")
            }

            recorder.start(1000)

            console.log("Grabación iniciada:", {
                mimeType: recorder.mimeType,
                    state: recorder.state
            })

            setRecording(true)
            setRecordingSeconds(0)

            timerRef.current = setInterval(() => {
                if (recorder.state === "recording") {
                    setRecordingSeconds(seconds => {
                        const next = seconds + 1

                        if (next >= 30){
                            clearInterval(timerRef.current)

                            if (recorder.state !== "inactive") {
                                recorder.stop()
                            }

                            return 30
                        }

                        return next
                    })
               }
            }, 1000)

            stopTimeoutRef.current = setTimeout(() => {
                if (recorder.state !== "inactive"){
                    recorder.stop()
                }
            }, 30000)
        } catch (error) {
            console.error("No se pudo iniciar la grabación:", error)
            setRecording(false)
            alert(`No se pudo iniciar la grabación: ${error.message}`)
        }
    }

    function stopRecording() {
        const recorder = mediaRecorderRef.current

        if (recorder && recorder.state !== "inactive") {
            clearTimeout(stopTimeoutRef.current)
            recorder.stop()
        }
    }

    function closeCamera() {
        if (recording) {
            stopRecording()
        }

        stopCamera()
        setCameraOpen(false)
        setCountdown(null)
    }

    async function handleFileSelection(event) {
        const files = Array.from(event.target.files || [])

        for (const file of files) {
            if (file.type.startsWith("image/")) {
                await uploadMedia(file, "image")
            } else if (file.type.startsWith("video/")) {
                await uploadMedia(file, "video")
            } else {
                alert(`Tipo de archivo no compatible: ${file.name}`)
            }
        }

        event.target.value = ""
    }

    useEffect(() => {
        return() => {
            clearInterval(timerRef.current)
            clearTimeout(stopTimeoutRef.current)

            if (mediaRecorderRef.current?.state !== "inactive") {
                mediaRecorderRef.current?.stop()
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const buttonStyle = {
        background: colors.olive,
        color: "#fff",
        border: "none",
        padding: "11px 16px",
        borderRadius: "30px",
        fontWeight: "bold",
        cursor: "pointer"
    }

    return(
        <div>
            {/* BOTONES */}
            {!cameraOpen ? (
                <div
                    style={{
                        position: "fixed",
                        right: "20px",
                        bottom: "24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        gap: "10px",
                        zIndex: 9999
                    }}
                >
                    <button
                        onClick={() => {
                            setCameraOpen(true)
                            startCamera()
                        }}
                        style={buttonStyle}        
                    >
                        📸
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={busy}
                        style={buttonStyle}
                    >
                        🖼️
                    </button>
                </div>
            ) : (
                <>
                    <button 
                        onClick={switchCamera}
                        disabled={recording || busy}
                        style={{
                            ...buttonStyle,
                            position: "fixed",
                            left: "20px",
                            bottom: "30px",
                            zIndex: 9999
                        }}
                    >
                        🔄
                    </button>

                    <div
                        style={{
                            position: "fixed",
                            top: "20px",
                            right: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "10px",
                            zIndex: 9999
                        }}
                    >
                        <button
                            onClick={closeCamera}
                            style={{
                                ...buttonStyle,
                                background: colors.oliveDark
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelection}
                style={{ display: "none" }}
            />

            {/* SLIDESHOW O CÁMARA */}
            {cameraOpen ? (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            position: "fixed",
                            inset: 0,
                            width:"100%",
                            height:"100vh",
                            objectFit:"cover",
                            transform: facingMode === "user" ? "scaleX(-1)" : "none",
                            background: "#000",
                            zIndex: 9000
                        }}
                    />

                    {countdown !== null && (
                        <div style={{
                            position:"fixed",
                            inset: 0,
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
                    )}

                    {flash && (
                        <div style={{
                            position:"fixed",
                            inset: 0,
                            background:"#fff",
                            zIndex:9999
                        }} />
                    )}

                    {recording && (
                        <div style={{
                            position: "fixed",
                            top: "90px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(0,0,0,0.65)",
                            color: "#fff",
                            padding: "10px 18px",
                            borderRadius: "30px",
                            zIndex: 9999,
                            fontWeight: "bold"
                        }}>
                            🔴 REC {recordingSeconds}s / 30s
                        </div>
                    )}

                    <div style={{
                        position: "fixed",
                        bottom: "30px",
                        left: 0,
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignContent: "center",
                        gap: "20px",
                        zIndex: 9999
                    }}>
                        {/* BOTÓN FOTO */}
                        <button
                            onClick={takePhoto}
                            disabled={busy || recording || countdown !== null}
                            aria-label="Tomar fotografía"
                            style={{
                                width: "76px",
                                height: "76px",
                                background: colors.olive,
                                border: "5px solid white",
                                borderRadius: "50%",
                                cursor: "pointer",
                                fontSize: "28px"
                            }}
                        >
                            📸
                        </button>

                        <button
                            onClick={recording ? stopRecording : startRecording}
                            disabled={busy || countdown !== null}
                            aria-label={recording ? "Detener video" : "Grabar video"}
                            style={{
                                width: "76px",
                                height: "76px",
                                background: recording ? "#C62828" : colors.oliveDark,
                                color: "#fff",
                                border: "5px solid white",
                                borderRadius: "50%",
                                cursor: "pointer",
                                fontSize: "25px"
                            }}
                        >
                            {recording ? "⏹️" : "🎥"}
                        </button>
                    </div>
                </>
            ) : (
                <Slideshow />
            )}

            {busy && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    zIndex: 10000,
                    fontSize: "18px",
                    fontWeight: "bold"
                }}>
                    Subiendo recuerdo... ⏳
                    <span style={{ fontSize: "14px" }}>
                        No cierres esta página.
                    </span>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    )
}