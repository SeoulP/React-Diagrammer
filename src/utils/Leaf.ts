import { TreeManager } from './TreeManager';
import { Coords } from './Coords';
import { v4 as uuidv4 } from 'uuid';

export class Leaf {
    tree: TreeManager;
    id: string;
    name: string;
    description: string;
    root: Leaf | null;
    sprouts: Leaf[];
    coords: Coords;
    dimensions: Coords;

    constructor(tree: TreeManager, id: string = '', root: Leaf | null = null, sprouts: Leaf[] = [], coords: Coords = {posX: 0, posY: 0}, dimensions: Coords = {posX: 0, posY: 0}, name: string = '', description: string = '') {
        this.tree = tree;
        this.id = id !== '' ? id : uuidv4();
        this.root = root;
        this.sprouts = sprouts;
        this.name = name;
        this.description = description;
        this.coords = coords;
        this.dimensions = dimensions;
        
        if (root) {
            root.addSprout(this);
        }
    }
    
    setCoords(coords: Coords): void {
        this.coords = coords;
        this.tree.updateTree(this);
    }
    
    setDimensions(dimensions: Coords): void {
        this.dimensions = dimensions;
        this.tree.updateTree(this);
    }

    setName(name: string): void {
        this.name = name;
        this.tree.updateTree(this);
    }

    setDescription(description: string): void {
        this.description = description;
        this.tree.updateTree(this);
    }

    addSprout(sprout: Leaf): void {
        this.sprouts.push(sprout);
        sprout.root = this;
        this.tree.updateTree(this);
    }

    removeSprout(sprout: Leaf): void {
        this.sprouts = this.sprouts.filter(c => c !== sprout);
        sprout.root = null;
    }

    getRootNames(leaf: Leaf): string {
        if (leaf.root === null) {
            return "";
        }
        const parentNames = this.getRootNames(leaf.root);
        return parentNames + leaf.root.name + '/';
    }

    truncateBranch(): void {
        while (this.sprouts.length > 0) {
            this.sprouts[0].truncateBranch();
        }
        if (this.root) {
            this.root.removeSprout(this);
        } else {
            this.tree.removeBranch(this);
        }
    }

    setNewRoot(newParentId: string): string {
        const newParent = this.tree.findLeafById(newParentId);
        if (!newParent) {
            return "New root not found.";
        }
        if (newParent === this) {
            return "Cannot set leaf as its own root.";
        }
        if (!this.tree.isValidNewRoot(this, newParent)) {
            return "Cannot set a descendant as the new root.";
        }
        if (this.root) {
            const rootLeaf = this.tree.findLeafById(this.root.id);
            if (rootLeaf) rootLeaf.removeSprout(this);
        } else {
            this.tree.removeBranch(this);
        }
        this.root = newParent;
        const rootLeaf = this.tree.findLeafById(this.root.id);
        if (rootLeaf) rootLeaf.addSprout(this);
        this.tree.updateTree(this);
        this.tree.updateTree(this.root);
        return "Successfully set new root.";
    }
    
    removeRoot() {
        if (!this.root) return;
        const rootLeaf = this.tree.findLeafById(this.root.id);
        if (rootLeaf) rootLeaf.removeSprout(this);
        this.root = null;
        
        this.tree.addBranch(this);
        this.tree.updateTree(this);
        
    }
}
