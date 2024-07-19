import { Leaf } from './Leaf';
import { v4 as uuidv4 } from 'uuid';

import {parse, stringify} from 'flatted';
import {Coords} from "./Coords.ts";

class FlatLeaf {
    id: string = '';
    name: string = '';
    description: string = '';
    coords: Coords = {posX: 0, posY: 0};
}
class FlatBranch {
    id: string | null = null;
    flatBranches: FlatBranch[] = [];
}
export class TreeManager {
    id: string = uuidv4();
    branches: Set<string> = new Set<string>(); // Holds the IDs of the topmost Leaves
    leaves: Map<string,  Leaf> = new Map<string,  Leaf>(); // Holds _all_ Leaves on the tree

    static fromJson(json: string): TreeManager {
        const deserializedJson: [string, [FlatBranch[], FlatLeaf[]] | null] = parse(json);
        const treeManager = new TreeManager();
        treeManager.id = deserializedJson[0];
        const structure = deserializedJson[1] ? deserializedJson[1] : [[], []] as [FlatBranch[], FlatLeaf[]];
        treeManager.rebuildBranches(structure);
        return treeManager;
    }

    rebuildBranches(structure: [FlatBranch[], FlatLeaf[]]) {
        if (!structure) return;

        const [flatBranches, flatLeaves] = structure;

        // Populate the leaves map
        flatLeaves.forEach(flatLeaf => {
            const newLeaf = new Leaf(
                this,
                flatLeaf.id,
                null, // Parent will be set later
                [], // Initialize an empty array for sprouts
                flatLeaf.coords,
                flatLeaf.name,
                flatLeaf.description
            );
            this.leaves.set(flatLeaf.id, newLeaf);
        });

        // Helper function to recursively find a branch by its ID
        const findFlatBranchById = (branches: FlatBranch[], branchId: string): FlatBranch | undefined => {
            for (const branch of branches) {
                if (branch.id === branchId) {
                    return branch;
                }
                const found = findFlatBranchById(branch.flatBranches, branchId);
                if (found) {
                    return found;
                }
            }
            return undefined;
        };

        // Helper function to recursively rebuild branches
        const buildBranch = (branchId: string, parentLeaf: Leaf | null) => {
            const newLeaf = this.leaves.get(branchId);
            if (!newLeaf) return;

            // If there's no parent, it's a topmost leaf (branch)
            if (!parentLeaf) {
                this.branches.add(newLeaf.id);
            } else {
                parentLeaf.sprouts.push(newLeaf);
                newLeaf.root = parentLeaf;
            }

            // Recursively rebuild children
            const flatBranch = findFlatBranchById(flatBranches, branchId);
            if (flatBranch) {
                flatBranch.flatBranches.forEach(childBranch => {
                    if (childBranch.id) {
                        buildBranch(childBranch.id, newLeaf);
                    }
                });
            }
        };

        // Start rebuilding from topmost branches
        flatBranches.forEach(flatBranch => {
            if (flatBranch.id) {
                buildBranch(flatBranch.id, null);
            }
        });
    }
    static toJson(treeManager: TreeManager): string {
        const [flatBranchesSet, flatLeavesSet] = treeManager.flattenTree();

        const flatBranches: FlatBranch[] = [...flatBranchesSet];
        const flatLeaves: FlatLeaf[] = [...flatLeavesSet];
        
        const json = [treeManager.id, [flatBranches, flatLeaves]];
        return stringify(json);
    }

    flattenTree(): [Set<FlatBranch>, Set<FlatLeaf>] {
        const flatBranchesMap = new Set<FlatBranch>();
        const flatLeaves = new Set<FlatLeaf>();

        this.branches.forEach(leafId => {
            this.flattenBranches(leafId, flatBranchesMap, flatLeaves);
        });

        const flatBranches = new Set<FlatBranch>(flatBranchesMap.values());
        return [flatBranches, flatLeaves];
    }

    flattenBranches(branchId: string, flatBranches: Set<FlatBranch> = new Set<FlatBranch>(), flatLeaves: Set<FlatLeaf> = new Set<FlatLeaf>(), parentBranch: FlatBranch | null = null): [Set<FlatBranch>, Set<FlatLeaf>] {
        const leaf = this.leaves.get(branchId);
        if (!leaf) return [flatBranches, flatLeaves];

        const flatLeaf = new FlatLeaf();
        flatLeaf.id = leaf.id;
        flatLeaf.name = leaf.name;
        flatLeaf.description = leaf.description;
        flatLeaf.coords = leaf.coords;

        flatLeaves.add(flatLeaf);

        const flatBranch = new FlatBranch();
        flatBranch.id = flatLeaf.id;

        if (parentBranch) {
            parentBranch.flatBranches.push(flatBranch);
        } else {
            flatBranches.add(flatBranch);
        }

        if (leaf.sprouts && leaf.sprouts.length > 0) {
            leaf.sprouts.forEach(sprout => {
                this.flattenBranches(sprout.id, flatBranches, flatLeaves, flatBranch);
            });
        }

        return [flatBranches, flatLeaves];
    }

    updateTree(leaf: Leaf): void {
        this.leaves.set(leaf.id, leaf);
    }
    
    clearTree() {
        this.branches.clear();
        this.leaves.clear();
    }

    addBranch(leaf: Leaf): void {
        if (!this.branches.has(leaf.id)) {
            this.branches.add(leaf.id);
        }
    }

    removeBranch(leafToRemove: Leaf): void {
        this.branches.delete(leafToRemove.id);
        this.leaves.delete(leafToRemove.id);
    }

    addLeaf(root: Leaf | null = null) {
        const leaf = new Leaf(this, '', root);
        if (!root) {
            this.addBranch(leaf);
        }
        this.leaves.set(leaf.id, leaf);
    }

    removeLeaf(leafToRemove: Leaf): void {
        leafToRemove.sprouts.forEach((sprout: Leaf) => {
            sprout.root = null;
            this.branches.add(sprout.id);
        })
        this.branches.delete(leafToRemove.id);
        this.leaves.delete(leafToRemove.id);
    }

    findLeafById(id: string): Leaf | undefined {
        return this.leaves.get(id);
    }

    isValidNewRoot(leaf: Leaf, newRoot: Leaf): boolean {
        let current: Leaf | null = leaf;
        while (current) {
            if (current === newRoot) {
                return false;
            }
            current = current.root;
        }
        return true;
    }
}
