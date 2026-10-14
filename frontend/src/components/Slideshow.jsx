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

            if(error){
                console.log("Error al cargar fotos:", error)
                return
            }

            if(active && data){

                setPhotos(prev => {

                    const samePhotos =
                        prev.length === data.length &&
                        prev.every((photo, i) =>
                            photo.id === data[i].id
                        )

                    return samePhotos ? prev : data
                })
            }
        }

        loadPhotos()

        const refreshInterval = setInterval(
            loadPhotos,
            10000
        )

        return () => {
            active = false
            clearInterval(refreshInterval)
        }

    }, [])

    useEffect(() => {

        if(photos.length <= 1){
            return
        }

        const interval = setInterval(() => {

            setIndex(prev => (prev + 1) % photos.length)

        }, 4000)
        
        return () => clearInterval(interval)

    }, [photos.length])

    const safeIndex = photos.length
        ? index % photos.length
        : 0

    if(photos.length === 0){
        
        return(
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

    return(
        <div style={{
            position: "relative",
            width: "100%",
            height: "min(65vh, 600px)",
            minHeight: "300px",
            overflow: "hidden",
            borderRadius: "16px",
            background: colors.beige
        }}>

            <img
                key={photos[safeIndex].id}
                src={photos[safeIndex].image_url}
                alt="Recuerdo de la boda de Emanuel y Sarahi"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transition:"opacity 1s ease"
                }}
            />

            <div style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                    "linear-gradient(to top, rgba(79,85,67,0.45), transparent 45%)"
            }} />

        </div>

    )
}