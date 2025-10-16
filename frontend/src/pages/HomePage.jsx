import Footer from '../components/Footer'
import Home from '../components/Home'
import Header from '../components/Header'

function HomePage() {
  {
    /* Render */
  }
  return (
    <>
      <Header />
      <main className="w-full flex justify-center flex-grow flex-col min-h-[80vh] mt-18">
        <Home />
      </main>
      <Footer />
    </>
  )
}

export default HomePage
