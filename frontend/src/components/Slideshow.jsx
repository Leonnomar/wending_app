import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Slideshow(){

    const [photos, setPhotos] = useState([])
    const [index, setIndex] = useState(0)

    useEffect(()=>{

        async function loadPhotos() {

            const { data, error } = await supabase
                .from("photos")
                .select("*")
                .order("created_at", { ascending:false })

            if(error){
                console.log(error)
                return
            }

            setPhotos(data)
        }

        loadPhotos()

    },[])

    useEffect(()=>{

        const interval = setInterval(()=>{

            setIndex(prev =>
                photos.length ? (prev + 1) % photos.length : 0
            )

        },3000)

        return ()=> clearInterval(interval)

    },[photos])

    if(photos.length === 0){
        return(

            <div style={{
                height:"100vh",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                fontSize:"24px",
                opacity:0.7,
                color:"#fff",
                background:"#000"
            }}>
                Cargando recuerdos ✨
            </div>
        )
    }

    return(

        <div style={{
            position:"relative",
            width:"100%",
            height:"100vh",
            overflow:"hidden"
        }}>

            <img
            src={photos[index].image_url}
            style={{
                width:"100%",
                height:"100%",
                objectFit:"cover",
                transition:"opacity 1s ease"
            }}
            />

            <div style={{
                position: "absolute",
                top:0,
                left:0,
                width:"100%",
                height:"100%",
                background:"linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                zIndex:2
            }} />
        </div>

    )
}