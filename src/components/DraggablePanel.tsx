import { useEffect, useRef, useState } from "react";
// @ts-ignore
import { useDraggable } from '../utils/hooks/useDraggable';
import { cn } from "../utils/TailwindMerge.ts";
import { Leaf } from "../utils/Leaf.ts";
import { Coords } from "../utils/Coords.ts";
import { truncateString } from "../utils/StringHelpers.ts";
import { ContextMenu } from "./ContextMenu.tsx";
import { ContextOption } from "./ContextOption.tsx";
import { useLocalStorage } from "../utils/hooks/useLocalStorage.tsx";

type Props = {
    leaf: Leaf;
    onAddNode: (parent: Leaf | null) => void;
    onNameChange: (node: Leaf, name: string) => void;
    onDescriptionChange: (node: Leaf, description: string) => void;
    onReparent: (node: Leaf) => void;
    onNewParentSelect: (node: Leaf) => void;
    onRemoveRoot: (node: Leaf) => void;
    onDeleteBranch: (node: Leaf) => void;
    onDelete: (node: Leaf) => void;
    onMove: (node: Leaf, coords: Coords) => void;
    onResize: (node: Leaf, coords: Coords) => void;
    isReparenting: boolean;
};

export const DraggablePanel = ({ leaf, onAddNode, onNameChange, onDescriptionChange, onReparent, onRemoveRoot, onNewParentSelect, onDelete, onMove, onResize, onDeleteBranch, isReparenting }: Props) => {
    const [headerValue, setHeaderValue] = useState("");
    const [textAreaValue, setTextAreaValue] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [contextVisible, setContextVisible] = useState(false);
    const [canvasSize] = useLocalStorage('CanvasSize', { dimX: window.innerWidth, dimY: window.innerHeight });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
            }
        };

        if (leaf.name) setHeaderValue(leaf.name);
        if (leaf.description) setTextAreaValue(leaf.description);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [leaf.name, leaf.description]);

    useEffect(() => {
        if (panelRef.current) {
            handleResize(panelRef.current.offsetWidth, panelRef.current.offsetHeight);
        }
    }, []);

    const resizeTextArea = () => {
        if (!textAreaRef.current) return;
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    };

    const handleResize = (width: number, height: number) => {
        const constrainedWidth = Math.min(Math.max(100, width), canvasSize.dimX - 24);
        const constrainedHeight = Math.min(Math.max(100, height), canvasSize.dimY - 24);
        onResize(leaf, { posX: constrainedWidth, posY: constrainedHeight });
    };

    const [ref, pressed] = useDraggable({
        onDrag: ({ posX, posY }: Coords) => {
            const constrainedX = Math.min(Math.max(0, posX), canvasSize.dimX - (panelRef.current?.offsetWidth || 0) - 30);
            const constrainedY = Math.min(Math.max(0, posY), canvasSize.dimY - (panelRef.current?.offsetHeight || 0) - 40);
            return { posX: constrainedX, posY: constrainedY };
        },
        onDragEnd: (coords: Coords) => {
            onMove(leaf, coords);
        },
        initialPosition: leaf.coords
    });

    return (
        <div
            className={cn("mt-6 ml-3 absolute min-h-28 min-w-44 bg-violet-300 text-lg text-white rounded-md shadow shadow-neutral-600 flex flex-row items-center border-2 border-transparent hover:border-violet-200 hover:cursor-move", pressed && "hover:bg-opacity-60", isShiftPressed && "resize-x overflow-hidden", isReparenting && "hover:cursor-pointer")}
            style={{ maxWidth: (canvasSize.dimX - 24) + 'px', width: leaf.dimensions.posX + 'px', height: leaf.dimensions.posY + 'px' }}
            onContextMenu={(e) => {
                e.preventDefault();
            }}
            onClick={() => {
                if (isReparenting && leaf) {
                    onNewParentSelect(leaf);
                }
            }}
            ref={isShiftPressed ? undefined : ref}
            onMouseUp={() => {
                if (isShiftPressed && panelRef.current) {
                    handleResize(panelRef.current.offsetWidth, panelRef.current.offsetHeight);
                }
            }}
        >

            <div ref={panelRef} className={"flex flex-col w-full h-full"}>
                <input id={"header"} type="text" placeholder={"Enter Name"} value={headerValue}
                       className={"absolute bg-indigo-100 text-sm text-slate-700 font-medium text-center max-w-36 h-6 ml-2 shadow shadow-violet-400 rounded-full -top-3 px-2 z-10 hover:bg-indigo-50"}
                       onChange={(e) => {
                           if (leaf) onNameChange(leaf, e.target.value);
                           setHeaderValue(e.target.value);
                       }}>
                </input>

                <div id={"panel"} className={"flex flex-col w-full h-full"}>
                    <div id={"parent-breadcrumb"} className={"text-neutral-500 relative text-xs top-2 h-4 max-w-32 text-nowrap pt-1 pl-4 underline"}>
                        <div>{leaf && truncateString(leaf?.getRootNames(leaf), 20)}</div>
                    </div>

                    <textarea
                        ref={textAreaRef}
                        className={cn("relative bottom-0 left-0 right-0 top-2 p-2 text-slate-800 text-sm resize-none m-2 ml-1 bg-indigo-100 shadow shadow-violet-400 rounded-md mt-5 hover:bg-indigo-50", textAreaValue === "" && "italic", pressed && "hover:bg-opacity-60")}
                        placeholder={"Enter description here..."}
                        value={textAreaValue}
                        onChange={(e) => {
                            resizeTextArea();
                            if (leaf) onDescriptionChange(leaf, e.target.value);
                            setTextAreaValue(e.target.value);
                        }}>
                    </textarea>
                </div>
            </div>

            <div className="absolute top-0 right-0">
                <button className={"p-1"} onClick={() => {
                    setContextVisible(!contextVisible);
                }}>
                    <svg className={"w-4 h-4 rotate-90 fill-slate-500 hover:fill-slate-600"} xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 448 512">
                        <path
                            d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/>
                    </svg>
                </button>
            </div>

            <ContextMenu contextVisible={contextVisible} setContextVisible={setContextVisible}>
                <ContextOption id={1} title={"Add Child"} onClick={() => {
                    onAddNode(leaf);
                }}></ContextOption>
                <ContextOption id={2} title={"Reparent"} onClick={() => {
                    onReparent(leaf);
                }}></ContextOption>
                <ContextOption id={3} title={"Decouple"} onClick={() => {
                    onRemoveRoot(leaf);
                }}></ContextOption>
                <ContextOption id={4} title={"Delete"} onClick={() => {
                    onDelete(leaf);
                }}></ContextOption>
                <ContextOption id={5} title={"Delete Branch"} onClick={() => {
                    onDeleteBranch(leaf);
                }}></ContextOption>
            </ContextMenu>
        </div>
    );
};
