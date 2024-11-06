import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import StudentDashboard from './pages/StudentDashboard'
import { useEffect } from 'react'
import axios from 'axios'
import ShowTodayMenu from './components/ShowTodayMenu'
        
function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:7231/api/');
        console.log(response)
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <StudentDashboard />
    </>
  )
}

export default App
