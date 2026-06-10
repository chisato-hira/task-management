import Header from './components/Header'
import Board from './components/Board'

function App() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="p-6">
        <Board />
      </main>
    </div>
  )
}

export default App
