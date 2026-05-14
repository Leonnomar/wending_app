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
                textAlign:"center",
                paddingTop:"30px",
                fontSize:"14px",
                letterSpacing:"4px",
                opacity:0.6
            }}>
                WEDDING GALLERY
            </div>
            <h1 style={{
                textAlign:"center",
                fontSize:"52px",
                marginTop:"30px",
                marginBottom:"10px",
                fontWeight:"bold",
                letterSpacing:"2px"
            }}>
                Sarahi & Emanuel 🌹
            </h1>

            <p style={{
                textAlign:"center",
                opacity:0.7,
                marginBottom:"30px"
            }}>
                Comparte tus recuerdos especiales
            </p>

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
                            onMouseOver={(e)=>{
                                e.currentTarget.style.transform = "scale(1.03)"
                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)"
                            }}
                            onMouseOut={(e)=>{
                                e.currentTarget.style.transform = "scale(1)"
                                e.currentTarget.style.boxShadow = "none"
                            }}
                            src={photo.image_url}
                            onClick={()=>{
                                setSelectedPhoto(photo)
                            }}
                            style={{
                                width:"100%",
                                height:"200px",
                                objectFit:"cover",
                                borderRadius:"10px",
                                transition:"all 0.25s 3ase",
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
                        background:"rgba(0,0,0,0.9)",
                        backdropFilter:"blur(10px)",
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        zIndex:1000
                    }}
                    >

                        <div
                        onClick={(e)=> e.stopPropagation()}
                        style={{
                            background:"rgba(20,20,25,0.95)",
                            border:"1px solid rgba(255,255,255,0.1)",
                            boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
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
                                borderRadius:"10px",
                                boxShadow:"0 20px 50px rgba(0,0,0,0.4)"
                            }}
                            />

                        </div>
                    </div>

                )}

            </div>
        </div>
    )
}