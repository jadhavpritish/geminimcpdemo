import MoodArtGenerator from "./MoodArtGenerator";

function Home() {
  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-amber-200 via-orange-200 to-amber-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-800 to-amber-950">
              Mood Canvas
            </span>
          </h1>
          <p className="text-xl text-amber-950 max-w-2xl mx-auto font-medium">
            Transform your emotions into stunning AI-generated artwork with just a few clicks
          </p>
        </header>
        
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl p-6 md:p-8 border border-amber-400/50">
          <MoodArtGenerator />
        </div>
        
        <footer className="mt-16 text-center text-amber-950 text-sm">
          <p>© 2023 Mood Canvas. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default Home