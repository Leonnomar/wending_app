import { useEffect, useState } from "react"
import { supabase } from "../supabase";

export default function Gallery(){

    const [photos, setPhotos] = useState([])
    const [selectedPhoto, setSelectedPhoto] = useState(null)
    const [likes, setLikes] = useState({})
    const [comments, setComments] = useState({})
    const [name, setName] = useState(() => {
        return localStorage.getItem("name") || ""
    })
    const [text, setText] = useState("")

    async function loadComments(photo){

        const res = await fetch(`${import.meta.env.VITE_API_URL}/comments/${photo}`)
        const data = await res.json()

        setComments(prev => ({
            ...prev,
            [photo]: data
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

            setPhotos(data)
        }

        async function loadLikes(){

            const res = await fetch(`${import.meta.env.VITE_API_URL}/likes`)

            const data = await res.json()

            setLikes(data)
        }

        loadPhotos()
        loadLikes()

        const interval = setInterval(()=>{
            loadPhotos()
            loadLikes()
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

                    {photos.map((photo,i)=>(

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
                            loadComments(photo)
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

                        <br></br>

                        <div style={{
                            display:"flex",
                            justifyContent:"space-between",
                            alignItems:"center",
                            marginTop:"5px"
                        }}>

                            <button
                            onClick={async ()=>{

                                const res = await fetch(`${import.meta.env.VITE_API_URL}/like/${photo}`,{
                                    method:"POST"
                                })

                                const data = await res.json()

                                setLikes(prev => ({
                                    ...prev,
                                    [photo]: data.likes
                                }))

                            }}
                            style={{
                                marginTop:"5px",
                                background:"#ff4d6d",
                                color:"#fff",
                                border:"none",
                                padding:"5px 10px",
                                borderRadius:"5px",
                                cursor:"pointer"
                            }}
                            >
                                ❤️ {likes[photo] || 0}
                            </button>

                            <a
                            href={`${import.meta.env.VITE_API_URL}/download/${photo}`}
                            style={{
                                textDecoration:"none",
                                background:"#ff4d6d",
                                color:"#fff",
                                padding:"8px 12px",
                                borderRadius:"6px"
                            }}
                            >
                                ⬇

                            </a>
                            </div>

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
                        src={`${import.meta.env.VITE_API_URL}/uploads/${selectedPhoto}`}
                        style={{
                            width:"100%",
                            maxHeight:"60vh",
                            objectFit:"cover",
                            borderRadius:"10px"
                        }}
                        />

                        {/* BOTONES */}
                        <div style={{
                            display:"flex",
                            justifyContent:"space-between",
                            marginTop:"10px"
                        }}>

                            <button
                            onClick={async ()=>{

                                const res = await fetch(`${import.meta.env.VITE_API_URL}/like/${selectedPhoto}`,{
                                    method:"POST"
                                })

                                const data = await res.json()

                                setLikes(prev => ({
                                    ...prev,
                                    [selectedPhoto]: data.likes
                                }))
                            }}
                            style={{
                                background:"#ff4d6d",
                                color:"#fff",
                                border:"none",
                                padding:"8px 12px",
                                borderRadius:"6px",
                                cursor:"pointer"
                            }}
                            >
                                ❤️ {likes[selectedPhoto] || 0}
                            </button>

                            <a
                            href={`${import.meta.env.VITE_API_URL}/download/${selectedPhoto}`}
                            style={{
                                textDecoration:"none",
                                background:"#ff4d6d",
                                color:"#fff",
                                padding:"8px 12px",
                                borderRadius:"6px"
                            }}
                            >
                            ⬇ Descargar
                            </a>
                        </div>

                        {/* COMENTARIOS */}
                        <div style={{
                            marginTop:"10px",
                            textAlign:"left",
                            color:"#fff",
                            maxHeight:"150px",
                            overflowY:"auto"
                        }}>
                            {(comments[selectedPhoto] || []).map((c,i)=>(
                                <div key={i}>
                                    <strong>{c.name}:</strong> {c.text}
                                </div>
                            ))}

                        </div>

                        {/* INPUTS */}
                        <div style={{
                            marginTop:"10px",
                            display:"flex",
                            gap:"5px"
                        }}>

                            <input
                            placeholder="Tu nombre"
                            value={name}
                            onChange={(e)=>{
                                setName(e.target.value)
                                localStorage.setItem("name", e.target.value)
                            }}
                            style={{flex:1}}
                            />

                            <input
                            placeholder="Comentario"
                            value={text}
                            onChange={(e)=> setText(e.target.value)}
                            style={{flex:2}}
                            />

                            <button
                            onClick={async ()=>{

                                if(!name.trim() || !text.trim()){
                                    alert("Escribe tu nombre y comentario")
                                    return
                                }

                                await fetch(`${import.meta.env.VITE_API_URL}/comment/${selectedPhoto}`,{
                                    method:"POST",
                                    headers:{
                                        "Content-Type":"application/json"
                                    },
                                    body: JSON.stringify({ name, text })
                                })

                                setText("")

                                loadComments(selectedPhoto)

                            }}
                            style={{
                                background:"#ff4d6d",
                                color:"#fff",
                                border:"none",
                                padding:"8px",
                                borderRadius:"6px",
                                cursor:"pointer"
                            }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>

                )}

            </div>
        </div>
    )
}