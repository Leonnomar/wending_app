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
        return null
    }

    return(

        <img
        src={photos[index].image_url}
        style={{
            width:"100%",
            height:"100vh",
            objectFit:"cover"
        }}
        />

    )
}