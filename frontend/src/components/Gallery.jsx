import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { colors } from "../colors"

export default function Gallery(){

    const [photos, setPhotos] = useState([])
    const [selectedPhoto, setSelectedPhoto] = useState(null)

    const [comments, setComments] = useState({})
    const [name, setName] = useState(
        localStorage.getItem("guest_name") || ""
    )
    const [text, setText] = useState("")

    async function loadComments(photoId) {
        
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("photo_id", photoId)
            .order("created_at", { ascending:true })

        if(error){
            console.log(error)
            return
        }

        setComments(prev => ({
            ...prev,
            [photoId]: data
        }))
    }
    
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

            const photosWithLikes = await Promise.all(

                data.map(async (photo) => {

                    const { count } = await supabase
                        .from("likes")
                        .select("*", {
                            count:"exact",
                            head:true
                        })
                        .eq("photo_id", photo.id)

                    return {
                        ...photo,
                        likes: count || 0
                    }
                })
            )

            setPhotos(photosWithLikes)
        }

        loadPhotos()

        const interval = setInterval(()=>{
            loadPhotos()
        },3000)

        return ()=> clearInterval(interval)

    },[])

    return(
        <div style={{
            background: colors.beige,
            minHeight: "100vh",
            color: colors.oliveDark
        }}>
            <div style={{
                textAlign:"center",
                paddingTop:"30px",
                fontSize:"14px",
                letterSpacing:"4px",
                opacity:0.7,
                color: colors.olive
            }}>
                WEDDING GALLERY
            </div>
            <h1 style={{
                textAlign:"center",
                fontSize:"52px",
                marginTop:"30px",
                marginBottom:"10px",
                fontWeight:"bold",
                letterSpacing:"2px",
                color: colors.oliveDark
            }}>
                Emanuel & Sarahi 🌹
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
                                loadComments(photo.id)
                            }}
                            style={{
                                width:"100%",
                                height:"200px",
                                objectFit:"cover",
                                borderRadius:"10px",
                                transition:"all 0.25s ease",
                                cursor:"pointer"
                            }}
                            />

                            <button
                            onClick={async ()=>{

                                await supabase
                                    .from("likes")
                                    .insert([
                                        {
                                            photo_id: photo.id
                                        }
                                    ])
                                
                                setPhotos(prev =>
                                    prev.map(p =>
                                        p.id === photo.id
                                            ? { ...p, likes: (p.likes || 0) + 1 }
                                            : p
                                    )
                                )

                                setSelectedPhoto(prev => {
                                    if (!prev || prev.id !== photo.id) {
                                        return prev
                                    }

                                    return {
                                        ...prev,
                                        likes: (prev.likes || 0) + 1
                                    }
                                })
                            }}
                            style={{
                                position:"absolute",
                                bottom:"10px",
                                right:"10px",
                                background: colors.olive,
                                border:"none",
                                color:"#fff",
                                padding:"8px 12px",
                                borderRadius:"20px",
                                cursor:"pointer",
                                boxShadow:"0 5px 15px rgba(79,85,67,0.3)"
                            }}
                            >
                                ❤️ {photo.likes || 0}
                            </button>

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
                            border:`1px solid ${colors.oliveLight}`,
                            boxShadow:"0 20px 60px rgba(79,85,67,0.35)",
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
                                boxShadow:"0 20px 40px rgba(79,85,67,0.25)"
                            }}
                            />

                            <div style={{
                                marginTop:"15px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "12px",
                                color:"#fff",
                            }}>
                                <span style={{
                                    fontSize: "18px",
                                    fontWeight: "bold"
                                }}>
                                    ❤️ {selectedPhoto.likes || 0} Me gusta
                                </span>

                                <button
                                    onClick={async () => {
                                        const { error } = await supabase
                                            .from("likes")
                                            .insert([
                                                {
                                                    photo_id: selectedPhoto.id
                                                }
                                            ])
                                        if (error) {
                                            console.error("Error al dar like:", error)
                                            alert("No se pudo registrar el like")
                                            return
                                        }

                                        setPhotos(prev =>
                                            prev.map(photo =>
                                                photo.id === selectedPhoto.id
                                                    ? {
                                                        ...photo,
                                                        likes: (photo.likes || 0) + 1
                                                    }
                                                    : photo
                                            )
                                        )

                                        setSelectedPhoto (prev => {
                                            if (!prev) return prev

                                            return {
                                                ...prev,
                                                likes: (prev.likes || 0) + 1
                                            }
                                        })
                                    }}
                                    style={{
                                        background: colors.olive,
                                        border: "none",
                                        color: "#fff",
                                        padding: "8px 16px",
                                        borderRadius: "20px",
                                        cursor: "pointer",
                                        fontSize: "15px"
                                    }}
                                >
                                    ❤️ Me gusta
                                </button>
                                <a
                                    href={selectedPhoto.image_url}
                                    download={`recuerdo-${selectedPhoto.id}.jpg`}
                                    target="_blank"
                                    rel="noopener neroferrer"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        background: colors.beige,
                                        color: colors.oliveDark,
                                        border: `1px solid ${colors.oliveLight}`,
                                        padding: "8px 16px",
                                        borderRadius: "20px",
                                        textDecoration: "none",
                                        fontSize: "15px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    ⬇️ Descargar foto
                                </a>
                            </div>

                            <div style={{
                                marginTop:"20px",
                                color:"#fff"
                            }}>

                                {/* COMENTARIOS */}
                                <div style={{
                                    maxHeight:"200px",
                                    overflowY:"auto",
                                    textAlign:"left",
                                    marginBottom:"15px"
                                }}>

                                   {(comments[selectedPhoto.id] || []).map((comment)=>(

                                        <div
                                        key={comment.id}
                                        style={{
                                            marginBottom:"10px",
                                            padding:"10px",
                                            background:"rgba(255,255,255,0.06)",
                                            borderRadius:"10px"
                                        }}
                                        >
                                            <strong>{comment.name}</strong>
                                            <div>{comment.text}</div>
                                        </div>

                                    ))}

                                </div>

                                {/* INPUTS */}
                                <div style={{
                                    display:"flex",
                                    gap:"10px"
                                }}>

                                    <input
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e)=>{
                                        setName(e.target.value)

                                        localStorage.setItem(
                                            "guest_name",
                                            e.target.value
                                        )
                                    }}
                                    style={{
                                        flex:1,
                                        padding:"12px",
                                        borderRadius:"10px",
                                        border:"none"
                                    }}
                                    />

                                    <input
                                    placeholder="Comentario"
                                    value={text}
                                    onChange={(e)=> setText(e.target.value)}
                                    style={{
                                        flex:2,
                                        padding:"12px",
                                        borderRadius:"10px",
                                        border:"none"
                                    }}
                                    />

                                    <button
                                    onClick={async ()=>{
                                
                                        if(!name.trim() || !text.trim()){
                                            return
                                        }

                                        const { error } = await supabase
                                            .from("comments")
                                            .insert([
                                                {
                                                    photo_id: selectedPhoto.id,
                                                    name,
                                                    text
                                                }
                                            ])
                                        
                                        console.log(error)

                                        if (error){
                                            alert("Error al comentar")
                                            return
                                        }
        
                                        setText("")

                                        loadComments(selectedPhoto.id)
                                    }}
                                    style={{
                                        background:"#ff4d6d",
                                        border:"none",
                                        color:"#fff",
                                        padding:"0 20px",
                                        borderRadius:"10px",
                                        cursor:"pointer"
                                    }}
                                    >
                                        ➤
                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>

                )}

            </div>
        </div>
    )
}