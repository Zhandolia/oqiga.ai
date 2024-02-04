import './style/App.css';
import Home from './components/Home';
import About from './components/About';
import Story from './components/Story';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className='app'>
      <ScrollToTop>
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="about" element={ <About /> } />
          <Route path="story" element={ <Story /> } />
        </Routes>
      </ScrollToTop>
    </div>
  );
}

export default App;
