import { useEffect, useState } from "react"
import { supabase } from "../supabase";

export default function Gallery(){

    const [photos, setPhotos] = useState([])
    const [selectedPhoto, setSelectedPhoto] = useState(null)
    
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

        const interval = setInterval(()=>{
            loadPhotos()
        },3000)

        return ()=> clearInterval(interval)

    },[])

    return(

        <div>

            <div style={{
                maxWidth:"1200px",
                margin:"0 auto"
            }}>

                <h2 style={{
                    textAlign:"center",
                    marginBottom:"20px",
                    fontSize:"28px"
                }}>
                    Galería 📸
                </h2>

                <div 
                style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))",
                    gap:"10px",
                    padding:"20px",
                }}
                >

                    {photos.map((photo)=>(

                        <div
                        key={photo.id}
                        style={{
                            position:"relative"
                        }}
                        >
                    
                            <img
                            onMouseOver={(e)=> e.currentTarget.style.transform="scale(1.05)"}
                            onMouseOut={(e)=> e.currentTarget.style.transform="scale(1)"}
                            src={photo.image_url}
                            onClick={()=>{
                                setSelectedPhoto(photo)
                            }}
                            style={{
                                width:"100%",
                                height:"200px",
                                objectFit:"cover",
                                borderRadius:"10px",
                                transition:"transform 0.2s",
                                cursor:"pointer"
                            }}
                            />

                        </div>

                    ))}

                </div>

                {selectedPhoto && (

                    <div
                    onClick={()=> setSelectedPhoto(null)}
                    style={{
                        position:"fixed",
                        top:0,
                        left:0,
                        width:"100%",
                        height:"100%",
                        background:"rgba(0,0,0,0.8)",
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        zIndex:1000
                    }}
                    >

                        <div
                        onClick={(e)=> e.stopPropagation()}
                        style={{
                            background:"#111",
                            padding:"20px",
                            borderRadius:"10px",
                            maxWidth:"500px",
                            width:"90%",
                            textAlign:"center"
                        }}
                        >

                            <img
                            src={selectedPhoto.image_url}
                            style={{
                                width:"100%",
                                maxHeight:"60vh",
                                objectFit:"cover",
                                borderRadius:"10px"
                            }}
                            />

                        </div>
                    </div>

                )}

            </div>
        </div>
    )
}