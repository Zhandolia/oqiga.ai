import '../style/Home.css';
import Header from './Header';
import Experience from './Experience';
import Navbar from './Navbar';
import Footer from './Footer';
import data from "../static/data.json"

export default function Home() {

    return (
        <div className='home'>
            <Navbar />
            <Header />
        </div>
    )
}