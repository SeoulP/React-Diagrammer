// useDraggable.js
import { useCallback, useEffect, useRef, useState } from "react";

// Limits the frequency of a function
export const throttle = (f) => {
    let token = null; // Animation Frame ID
    let lastArgs = null; // Stores the throttle's most recent call arguments
    const invoke = () => {
        f(...lastArgs);
        token = null;
    };
    const result = (...args) => {
        lastArgs = args;
        if (!token) {
            token = requestAnimationFrame(invoke);
        }
    };
    result.cancel = () => token && cancelAnimationFrame(token);
    return result;
};

const id = (x) => x;
// complex logic should be a hook, not a component
export const useDraggable = ({ onDrag = id, onDragEnd = id, initialPosition = { posX: 0, posY: 0 } } = {}) => {
    const [pressed, setPressed] = useState(false);
    const position = useRef(initialPosition);
    const ref = useRef();
    const unsubscribe = useRef();

    const legacyRef = useCallback((elem) => {
        ref.current = elem;
        if (unsubscribe.current) {
            unsubscribe.current();
        }
        if (!elem) {
            return;
        }
        const handleMouseDown = (e) => {
            e.target.style.userSelect = "none";
            setPressed(true);
        };
        elem.addEventListener("mousedown", handleMouseDown);
        unsubscribe.current = () => {
            elem.removeEventListener("mousedown", handleMouseDown);
        };
        elem.style.transform = `translate(${initialPosition.posX}px, ${initialPosition.posY}px)`;
    }, [initialPosition]);

    useEffect(() => {
        if (!pressed) {
            return;
        }

        const handleMouseMove = throttle((event) => {
            if (!ref.current || !position.current) {
                return;
            }
            const pos = position.current;
            const elem = ref.current;
            position.current = onDrag({
                posX: pos.posX + event.movementX,
                posY: pos.posY + event.movementY
            });
            elem.style.transform = `translate(${position.current.posX}px, ${position.current.posY}px)`;
        });

        const handleMouseUp = (e) => {
            e.target.style.userSelect = "auto";
            setPressed(false);
            onDragEnd(position.current);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            handleMouseMove.cancel();
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [pressed, onDrag, onDragEnd]);

    return [legacyRef, pressed];
};
