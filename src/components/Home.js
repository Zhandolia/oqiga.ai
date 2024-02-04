import '../style/Home.css';
import Header from './Header';
import Experience from './Experience';
import Navbar from './Navbar';
import Footer from './Footer';
import data from "../static/data.json"

export default function Home() {
    const expEls = data.map(exp => {
        return (
            <Experience 
                company={exp.company}
                description={exp.description}
                image={exp.image}
                link={exp.link}
            />
        )
    })

    return (
        <div className='home'>
            <Navbar />
            <Header />
            {expEls}
            <Footer />
        </div>
    )
}