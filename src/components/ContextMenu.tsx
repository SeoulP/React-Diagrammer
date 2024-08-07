import {ReactElement, useEffect, useRef, useState} from "react";
import {ContextOptionProps} from "./ContextOption.tsx";

type Props = {
    contextVisible: boolean;
    setContextVisible: (visible: boolean) => void;
    children: ReactElement<ContextOptionProps>[];
};
export function ContextMenu({children, contextVisible, setContextVisible}: Props) {
    const contextRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextRef.current && !contextRef.current.contains(event.target as Node)) {
                setVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [contextRef]);
    
    useEffect(() => {
        setVisible(contextVisible);
    }, [contextVisible]);

    useEffect(() => {
        if (!visible) setContextVisible(false);
    }, [visible, setContextVisible]);
    
    if (visible) return (
        <div ref={contextRef} onContextMenu={(e) => e.preventDefault} 
             className="absolute -top-1 -right-4 m-5 rounded-md border-2 bg-violet-100 text-sm text-slate-600 shadow shadow-slate-500 z-60">
            <ul>
                {children.map((child) => {
                        return (
                            <li key={child.props.id} onClick={() => {
                                if (child.props.onClick) child.props.onClick();
                                setVisible(false);
                            }}>{child}</li>
                        );
                })}
            </ul>
        </div>
    );
}