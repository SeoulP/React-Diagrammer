import { v4 as uuidv4 } from 'uuid';

export type Coords = {
    posX: number;
    posY: number;
}

export class TreeManager {
    private headNodes: Node[] = [];

    addHeadNode(node: Node) {
        if (!this.headNodes.includes(node)) {
            this.headNodes.push(node);
        }
    }

    removeHeadNode(node: Node) {
        this.headNodes = this.headNodes.filter(headNode => headNode !== node);
    }

    findNodeById(id: string): Node | null {
        for (const headNode of this.headNodes) {
            const foundNode = headNode.findNodeById(id);
            if (foundNode) {
                return foundNode;
            }
        }
        return null;
    }
}

const treeManager = new TreeManager();
export class Node {
    id: string;
    name: string = ''
    parent: Node | null = null;
    children: Node[] = [];
    coords: Coords = { posX: 0, posY: 0 };

    constructor(parent: Node | null = null) {
        this.id = uuidv4(); // Generate a GUID for each node
        this.parent = parent;
        if (parent) {
            parent.addNode(this);
        } else {
            treeManager.addHeadNode(this);
        }
    }

    setCoords(coords: Coords) {
        this.coords = coords;
    }

    setName(name: string) {
        this.name = name;
    }

    addNode(node: Node) {
        this.children.push(node);
    }

    removeNodeAndDescendants() {
        // Recursively remove all children
        while (this.children.length > 0) {
            this.children[0].removeNodeAndDescendants();
        }

        // Remove this node from its parent
        if (this.parent) {
            this.parent.removeNode(this);
        } else {
            // If this node has no parent, remove it from the TreeManager
            treeManager.removeHeadNode(this);
        }
    }

    removeNode(node: Node) {
        this.children = this.children.filter(child => child !== node);
        node.parent = null;
    }
    
    removeNodeAndOrphanChildren() {
        this.children.forEach((child) => {
            child.parent = null;
            treeManager.addHeadNode(child);
        })
        
        this.children = [];

        if (this.parent) {
            this.parent.removeNode(this);
        } else {
            treeManager.removeHeadNode(this);
        }
    }

    toArray(): Node[] {
        const elements: Node[] = [this];
        this.children.forEach(child => elements.push(...child.toArray()));
        return elements;
    }

    getParentsNames(): string {
        if (this.parent === null) {
            return "";
        }
        const parentNames = this.parent.getParentsNames();
        return parentNames + this.parent.name + '/';
    }

    findNodeById(id: string): Node | null {
        if (this.id === id) {
            return this;
        }
        for (const child of this.children) {
            const foundNode = child.findNodeById(id);
            if (foundNode) {
                return foundNode;
            }
        }
        return null;
    }

    setNewParent(parentId: string): string {
        const newParent = treeManager.findNodeById(parentId);

        if (!newParent) {
            return "New parent not found.";
        }

        if (newParent === this) {
            return "Cannot set node as its own parent.";
        }

        if (!this.isValidNewParent(newParent)) {
            return "Cannot set a descendant as the new parent.";
        }

        if (this.parent) {
            this.parent.removeNode(this);
        } else {
            treeManager.removeHeadNode(this);
        }

        this.parent = newParent;
        newParent.addNode(this);
        return "Successfully set new parent.";
    }

    isValidNewParent(node: Node): boolean {
        const stack: Node[] = [this];

        while (stack.length > 0) {
            const current = stack.pop();

            if (current) {
                if (current === node) {
                    return false;
                }

                if (current.children) {
                    stack.push(...current.children);
                }
            }
        }

        return true;
    }
}