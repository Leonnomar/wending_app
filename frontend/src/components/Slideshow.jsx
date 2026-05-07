import { useEffect, useState } from "react"

export default function Slideshow(){

    const [photos, setPhotos] = useState([])
    const [index, setIndex] = useState(0)

    useEffect(()=>{

        async function loadPhotos() {

            const res = await fetch(`${import.meta.env.VITE_API_URL}/photos`)
            const data = await res.json()

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
        src={`${import.meta.env.VITE_API_URL}/uploads/${photos[index]}`}
        style={{
            width:"100%",
            height:"100vh",
            objectFit:"cover"
        }}
        />

    )
}