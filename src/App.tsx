import { useState } from "react";
import { DraggablePanel } from "./components/DraggablePanel";
import { Leaf } from "./utils/Leaf.ts";
import { TreeManager } from "./utils/TreeManager.ts";
import { Coords } from "./utils/Coords.ts";
import "react-color-palette/css";
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from "react-toastify";
import { useLocalStorage } from "./utils/hooks/useLocalStorage";
import Toolbar from "./components/Toolbar";

export default function App() {
    const [tree, setTree] = useLocalStorage<TreeManager>("TreeManager", new TreeManager(), {
        serializer: value => TreeManager.toJson(value),
        deserializer: value => TreeManager.fromJson(value)
    });    
    const [isSettingNewRoot, setIsSettingNewRoot] = useState(false);
    const [LeafsNewRoot, setLeafsNewRoot] = useState<Leaf | null>(null);
    const [canvasSize] = useLocalStorage('CanvasSize', { dimX: window.innerWidth, dimY: window.innerHeight });
    const [colors] = useLocalStorage('colors', { 'primaryColor': "#6a5acd", 'secondaryColor': "#efefef" });

    const clearTree = () => {
        tree.clearTree();
        setTree(tree);
    }
    const addLeaf = (root: Leaf | null) => {
        tree.addLeaf(root);
        setTree(tree);
    };

    const updateLeafName = (node: Leaf, name: string) => {
        node.setName(name);
        setTree(tree);
    };

    const updateLeafDescription = (leaf: Leaf, description: string) => {
        leaf.setDescription(description);
        setTree(tree);
    };

    const deleteLeaf = (leaf: Leaf) => {
        leaf.tree.removeLeaf(leaf);
        setTree(tree);
        //leaf.removeLeafAndOrphanChildren();
    };

    const deleteBranch = (leaf: Leaf) => {
        leaf.tree.removeBranch(leaf);
        setTree(tree);
    };

    const moveNode = (node: Leaf, coords: Coords) => {
        node.setCoords(coords);
        setTree(tree);
    };

    const setNewRoot = (leaf: Leaf) => {
        toast.info("Select the new parent for the node.", { position: "top-center" });
        setIsSettingNewRoot(true);
        setLeafsNewRoot(leaf);
    };

    const selectNewParent = (parent: Leaf) => {
        if (!LeafsNewRoot) return;

        const notification = LeafsNewRoot.setNewRoot(parent.id);

        if (notification.includes("Success")) {
            toast.success(notification, { position: "top-center" });
        } else {
            toast.warning(notification, { position: "top-center" });
        }

        setIsSettingNewRoot(false);
        setTree(LeafsNewRoot.tree);
    };
    
    const removeRoot = (leaf: Leaf) => {
        leaf.removeRoot();
        setTree(tree);
    }
    
    return (
        <div className="flex h-screen flex-col">
            <ToastContainer />
            <div id="canvas" style={{
                width: canvasSize.dimX + 'px',
                height: canvasSize.dimY + 'px',
                backgroundSize: "40px 40px",
                backgroundImage: `radial-gradient(circle, ${colors.secondaryColor} 1.5px, ${colors.primaryColor} 1px)`
            }} className={'flex flex-1 absolute'}>
                {Array.from(tree.leaves.values()).map((leaf: Leaf) => (
                    <DraggablePanel
                        key={leaf.id}
                        node={leaf}
                        onAddNode={addLeaf}
                        onNameChange={updateLeafName}
                        onDescriptionChange={updateLeafDescription}
                        onReparent={setNewRoot}
                        onNewParentSelect={selectNewParent}
                        onRemoveRoot={removeRoot}
                        onDeleteBranch={deleteBranch}
                        onDelete={deleteLeaf}
                        onMove={moveNode}
                        isReparenting={isSettingNewRoot}
                    />
                ))}
            </div>
            <Toolbar addComponent={addLeaf} clearTree={clearTree}/>
        </div>
    );
}
