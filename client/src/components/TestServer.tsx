import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ToastContainer, toast } from 'react-toastify';

export default function TestServer(){
    const [server, setServer] = useState<Boolean>(false);

    async function server_connect(){
        const response = await api.get('/health');
        if(response.status == 200){
            toast("Connected to the backend Server. Enjoy the site!");
            setServer(true);
        }
    }

    useEffect(() => {
        server_connect();
    },[]);
    return <>
        <div
            className={server ? `hidden` : `animate-marquee flex items-center whitespace-nowrap`} 
        >    
            Backend server starting up from Cold Start!!
        </div>
        <ToastContainer />

        {/* <div
            className={server ? `hidden` : `animate-marquee2 flex items-center whitespace-nowrap`} 
        >    
            Hello World!!
        </div> */}
        
    </>
}