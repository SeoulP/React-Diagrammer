import {useEffect, useRef, useState} from "react";
import { DraggablePanel } from "./components/DraggablePanel.tsx";
import { Node } from "./utils/LinkedList.ts";
import {ColorPicker, useColor} from "react-color-palette";
import "react-color-palette/css";
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from "react-toastify";

export default function App() {
    const getLocalStorageColor = (key: string, defaultColor: string) => {
        const storedColor = window.localStorage.getItem(key);
        return storedColor ? storedColor : defaultColor;
    };


    const [nodes, setNodes] = useState<Node[]>([]);
    const [dimX, setDimX] = useState(window.innerWidth);
    const [dimY, setDimY] = useState(window.innerHeight - 10);
    const [primaryColor, setPrimaryColor] = useColor(getLocalStorageColor('primaryColor', "#6a5acd"));
    const [secondaryColor, setSecondaryColor] = useColor(getLocalStorageColor('secondaryColor', "#efefef"));
    const [primaryOpen, setPrimaryOpen] = useState(false);
    const [secondaryOpen, setSecondaryOpen] = useState(false);
    const primaryRef = useRef<HTMLDivElement>(null);
    const secondaryRef = useRef<HTMLDivElement>(null);
    const helpPanelRef = useRef<HTMLDivElement>(null);
    const [helpPanelVisible, setHelpPanelVisible] = useState(false);
    const [isReparenting, setIsReparenting] = useState(false);
    const [reparentingNode, setReparentingNode] = useState<Node>();
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (primaryRef.current && !primaryRef.current.contains(event.target)) {
                setPrimaryOpen(false);
            }
            if (secondaryRef.current && !secondaryRef.current.contains(event.target)) {
                setSecondaryOpen(false);
            }

            if (helpPanelRef.current && !helpPanelRef.current.contains(event.target)) {
                setHelpPanelVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [primaryRef, secondaryRef, helpPanelRef]);

    useEffect(() => {
        console.log(nodes);
    }, [nodes]);
    const addComponent = (parent: Node | null) => {
        const newNode = new Node(parent);
        updateNodesState(newNode);
    };

    const updateNodeName = (node: Node, name: string) => {
        node.setName(name); // Assume setName is a method in Node class to update the name
        updateNodesState(node);
    };

    const deleteNode = (nodeForDeletion: Node) => {
        nodeForDeletion.removeNodeAndOrphanChildren();
        setNodes(nodes.filter(node => node !== nodeForDeletion));
    }
    
    const deleteBranch = (node: Node) => {
        // Collect all nodes to be removed
        const nodesToRemove = collectNodesToRemove(node);

        // Remove the node and its descendants from the tree structure
        node.removeNodeAndDescendants();

        // Remove the nodes from the `nodes` array
        setNodes((prevNodes) => {
            return prevNodes.filter(n => !nodesToRemove.has(n));
        });
    };

// Helper function to collect all nodes to be removed
    const collectNodesToRemove = (rootNode: Node): Set<Node> => {
        const nodesToRemove = new Set<Node>();
        const traverse = (node: Node) => {
            nodesToRemove.add(node);
            node.children.forEach(child => traverse(child));
        };
        traverse(rootNode);
        return nodesToRemove;
    };

    const handleReparent = (node: Node) => {
        toast.info("Select the new parent for the node.", {position: "top-center"});
        setIsReparenting(true);
        setReparentingNode(node); 
    };
    
    const selectNewParent = (parent: Node) => {
        console.log("selectNewParent called with parent:", parent);
        console.log("Current reparentingNode:", reparentingNode);
        
        if (!reparentingNode) return;
        
        const notification = reparentingNode.setNewParent(parent.id);
        
        notification.includes("Success") ? toast.success(notification, {position: "top-center"}) : toast.warning(notification,  {position: "top-center"});
        
        updateNodesState(reparentingNode);
        setIsReparenting(false);
    }

    const updateNodesState = (updatedNode: Node) => {
        setNodes((prevNodes) => {
            const allNodes = new Set(prevNodes);
            allNodes.add(updatedNode);
            return Array.from(allNodes);
        });
    };
    
    
    return (
        
        <div className="flex flex-col h-screen">
            <ToastContainer/>
            <div id="canvas" style={{width: dimX  + 'px', height: dimY + 'px', 
                                        backgroundSize: "40px 40px",
                                        backgroundImage: `radial-gradient(circle, ${secondaryColor.hex} 1.5px, ${primaryColor.hex} 1px)`}} 
                                        className={'flex flex-1 absolute'}>
                {nodes.map((node, index) => (
                    <DraggablePanel
                        key={node.id}
                        node={node}
                        onAddNode={addComponent}
                        onNameChange={updateNodeName}
                        onReparent={handleReparent}
                        onNewParentSelect={selectNewParent}
                        onDeleteBranch={deleteBranch}
                        onDelete={deleteNode}
                        isReparenting={isReparenting}
                        canvasSize={{dimX, dimY}} 
                    />
                ))}
            </div>

            <div id="toolbar"
                 className="bg-slate-300 w-full h-12 fixed bottom-0 flex justify-between shadow shadow-slate-500">

                <div id={"attribute-settings"} className={"flex flex-row items-center gap-4 font-medium text-xl text-slate-500 px-4 max-md:text-md max-sm:text-sm max-md:gap-2"}>
                    
                    <div id={"dimensions"} className={"flex flex-row justify-end gap-4 max-sm:gap-0 max-sm:flex-col"}>
                        <div className={"flex flex-row items-center justify-end"}>
                            <div>X:</div>
                            <input type="number" value={dimX} placeholder={"100"}
                                   className={"w-16 h-8 max-sm:h-5 ml-2 rounded-md text-right px-2 shadow shadow-slate-500 max-sm:rounded-b-none"}
                                   onChange={(e) => {
                                       setDimX(Number.parseInt(e.target.value))
                                   }}/>
                        </div>
                        <div className={"flex flex-row items-center justify-end"}>
                            <div>Y:</div>
                            <input type="number" value={dimY} placeholder={"100"}
                                   className={"w-16 h-8 max-sm:h-5 ml-2 rounded-md text-right px-2 shadow shadow-slate-500 max-sm:rounded-t-none"}
                                   onChange={(e) => {
                                       setDimY(Number.parseInt(e.target.value))
                                   }}/>
                        </div>
                    </div>

<div id={"colors"} className={"flex flex-row gap-4 max-sm:gap-0 max-sm:flex-col max-sm:items-end max-sm:text-sm"}>
                        <div ref={primaryRef} className={"flex flex-row justify-center items-center"}>
                            <div>Primary:</div>
                            <div className={"w-16 h-8 max-md:w-8 max-sm:h-4 max-sm:w-4 ml-2 rounded-md bg-amber-500 shadow shadow-slate-500 hover:cursor-pointer"}
                                 style={{backgroundColor: primaryColor.hex}}
                                 onClick={() => setPrimaryOpen(!primaryOpen)}></div>
                            {primaryOpen &&
                                <div className={"fixed bottom-14"}>
                                    <ColorPicker height={128} color={primaryColor}
                                        onChange={(e) => {
                                            window.localStorage.setItem('primaryColor', e.hex)
                                            setPrimaryColor(e);}}>
                                    </ColorPicker>
                                </div>}
                        </div>

                        <div ref={secondaryRef} className={"flex flex-row justify-center items-center"}>
                            <div>Secondary:</div>
                            <div className={"w-16 h-8 max-md:w-8 max-sm:w-4 max-sm:h-4 ml-2 rounded-md bg-amber-500 shadow shadow-slate-500 hover:cursor-pointer"}
                                 style={{backgroundColor: secondaryColor.hex}}
                                 onClick={() => setSecondaryOpen(!secondaryOpen)}></div>
                            
                            {secondaryOpen && 
                                <div className={"fixed bottom-14"}>
                                    <ColorPicker height={128} color={secondaryColor}
                                        onChange={(e) => {
                                            window.localStorage.setItem('secondaryColor', e.hex);
                                            setSecondaryColor(e);}}>
                                    </ColorPicker>
                                </div>}
                        </div>
</div>

                </div>

                <div className={"flex flex-row items-center gap-4 mr-4"}>
                    <input
                        className="relative md:hidden m-2 rounded-full text-slate-50 bg-green-400 px-4 py-1 shadow shadow-slate-500 hover:bg-green-300"
                        type="button"
                        value="Add Comp"
                        onClick={() => addComponent(null)}/>
                    <input
                    className="relative max-md:hidden m-2 rounded-full text-slate-50 bg-green-400 px-4 py-1 shadow shadow-slate-500 hover:bg-green-300"
                    type="button"
                    value="Add Component"
                    onClick={() => addComponent(null)}/>

                    <button
                        className={"bg-slate-50 flex justify-center items-center rounded-full shadow shadow-slate-500"}
                        onClick={() => {
                            setHelpPanelVisible(!helpPanelVisible)
                        }}>
                        <svg className={"fill-slate-400 w-4 h-4 m-1"} xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 320 512">
                            <path
                                d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/>
                        </svg>
                    </button>
                    {helpPanelVisible &&
                        <div ref={helpPanelRef}
                             className={"rounded-md fixed bottom-14 bg-slate-300 shadow shadow-slate-500 p-2"}>
                            <div>Press 'Shift' to resize panels</div>
                            <div className={"text-xs italic"}>Made by Seoul Peterson</div>
                        </div>}

                </div>

            </div>

        </div>

    );
}
