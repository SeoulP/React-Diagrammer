// useDraggable.d.ts
declare module '../utils/hooks/useDraggable' {
    import { RefCallback } from 'react';

    interface Position {
        posX: number;
        posY: number;
    }

    interface UseDraggableProps {
        onDrag?: (position: Position) => Position;
    }

    export function useDraggable(props?: UseDraggableProps): [RefCallback<HTMLDivElement>, boolean];
}