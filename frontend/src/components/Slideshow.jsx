import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { colors } from "../colors"

export default function Slideshow(){
    const [photos, setPhotos] = useState([])
    const [index, setIndex] = useState(0)

    useEffect(()=>{
        let active = true

        async function loadPhotos() {
            const { data, error } = await supabase
                .from("photos")
                .select("*")
                .order("created_at", { ascending:false })

            if (error) {
                console.error("Error al cargar recuerdos:", error)
                return
            }

            if(active && data){

                setPhotos(data)
            }
        }

        loadPhotos()

        const refreshInterval = setInterval(loadPhotos, 10000)

        return () => {
            active = false
            clearInterval(refreshInterval)
        }

    }, [])

    useEffect(() => {
        if (photos.length <= 1) return

        const current = photos[index]

        if (current?.media_type === "video") return

        const interval = setTimeout(() => {
            setIndex(prev => (prev + 1) % photos.length)
        }, 4000)

        return () => clearTimeout(interval)
    }, [photos, index])

    const safeIndex = photos.length ? index % photos.length : 0
    const current = photos[safeIndex]

    function nextMemory() {
        setIndex(prev => (prev + 1) % photos.length)
    }

    if (photos.length === 0) {
        return (
            <div style={{
                minHeight: "350px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "20px",
                color: colors.oliveDark,
                background: colors.beige,
                borderRadius: "16px"
            }}>
                Esperando nuevos recuerdos ✨
            </div>
        )
    }

    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "min(65vh, 600px)",
            minHeight: "300px",
            overflow: "hidden",
            borderRadius: "16px",
            background: "#000"
        }}>

            {current.media_type === "video" ? (
                <video
                    key={current.id}
                    src={current.image_url}
                    controls
                    autoPlay
                    playsInline
                    onEnded={nextMemory}
                    onError={(e) => {
                        console.error(
                            "No se pudo reproducir el video:",
                            current.image_url,
                            e.currentTarget.error
                        )
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain"
                    }}
                />
            ) : (
                <img
                    key={current.id}
                    src={current.image_url}
                    alt="Recuerdo de la boda de Emanuel y Sarahi"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transition:"opacity 1s ease"
                    }}
                />
            )}

            <div style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: current.media_type === "video"
                    ? "none"
                    : "linear-gradient(to top, rgba(79,85,67,0.45), transparent 45%)"
            }} />

            {current.media_type === "video" && (
                <button
                    onClick={nextMemory}
                    style={{
                        position: "absolute",
                        right: "12px",
                        top: "12px",
                        zIndex: 2,
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "20px",
                        background: "rgba(0,0,0,0.65)",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    Siguiente recuerdo →
                </button>
            )}

        </div>
    )
}