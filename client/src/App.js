import { useEffect, useRef, useState } from "react";


function App() {

  const [url, setUrl] = useState('');
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });


  const location = new URLSearchParams(window.location.search).get('location');

  const getResolution = async () => {
    try {
      const response = await fetch(`http://${location}:8000/resolution/`);
      const data = await response.json();
      if (response.ok)
        setResolution(data);
    }
    catch (error) {
      console.error('Error fetching resolution', error);
    }
  }

  const getScreenshot = async () => {
    try {
      const response = await fetch(`http://${location}:8000/screenshot/`);
      const image = await response.blob();
      const imageUrl = URL.createObjectURL(image);
      setUrl(imageUrl);
    }
    catch (error) {
      console.error('Error fetching image', error);
    }
  }

  useEffect(() => {
    getResolution();
    const interval = setInterval(() => {
      getScreenshot();
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const getCoordinates = (e) => {
    const x = e.clientX - img.current.getBoundingClientRect().x;
    const y = e.clientY - img.current.getBoundingClientRect().y;

    const xPercent = x / img.current.width;
    const yPercent = y / img.current.height;

    return {
      x: xPercent * resolution.width,
      y: yPercent * resolution.height,
    }
  }

  const handleMouseMove = (e) => {
    const { x, y } = getCoordinates(e);
    try {
      fetch(`http://${location}:8000/mouse/move/${Math.floor(x)}/${Math.floor(y)}`);
    }
    catch (error) {
      console.error('Error moving mouse', error);
    }
    console.log("move", x, y);
  }

  const handleClick = (e) => {
    const { x, y } = getCoordinates(e);
    try {
      fetch(`http://${location}:8000/mouse/click/${Math.floor(x)}/${Math.floor(y)}/${e.button}`);
    }
    catch (error) {
      console.error('Error clicking mouse', error);
    }
    console.log("click", x, y);
  }

  const img = useRef(null);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      padding: '12px',
      display: 'flex',
    }}>
      <img
        ref={img}
        src={url}
        alt="Screen"
        style={{
          // height: '100%',
          display: 'block',
          width: '100vw',
        }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onContextMenu={(e) => {e.preventDefault(); handleClick(e);}}
      />
      
    </div>
  );
}

export default App;
