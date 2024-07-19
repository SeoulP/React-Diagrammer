import {useEffect, useState} from "react";

export default function useIsMobile () {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        
        const mobileFunction = () => {
                setIsMobile(window.innerWidth < 640);
            }
            
        document.addEventListener("resize", mobileFunction);
        
    }, []);
    
    return isMobile;
}