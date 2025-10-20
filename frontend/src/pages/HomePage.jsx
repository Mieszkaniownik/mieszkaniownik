import Footer from "../components/Footer";
import Header from "../components/Header";
import Home from "../components/Home";

function HomePage() {
  return (
    <>
      <Header />
      <main className="mt-18 flex min-h-[80vh] w-full flex-grow flex-col justify-center">
        <Home />
      </main>
      <Footer />
    </>
  );
}

export default HomePage;
