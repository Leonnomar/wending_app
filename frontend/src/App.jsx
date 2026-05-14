import Camera from './components/Camera'
import Gallery from './components/Gallery'

function App() {

  return (

    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(180deg,#0f0f12,#1a1a22)",
      color:"white"
    }}>
      <Camera />
      <Gallery />

    </div>

  )

}

export default App
