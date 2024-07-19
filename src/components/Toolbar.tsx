import {ColorPicker} from 'react-color-palette';
import {useEffect, useRef, useState} from 'react';
import useIsMobile from '../utils/hooks/useIsMobile.tsx';
import {useLocalStorage} from '../utils/hooks/useLocalStorage.tsx';
import {hexToIColor} from '../utils/IColorConverter.ts';
import {Leaf} from '../utils/Leaf.ts';

type Props = {
    addComponent: (parent: Leaf | null) => void;
    clearTree: () => void;
};
export default function Toolbar({addComponent, clearTree}: Props) {
    const [canvasSize, setCanvasSize] = useLocalStorage('CanvasSize', {
        dimX: window.innerWidth,
        dimY: window.innerHeight,
    });
    const [colors, setColors] = useLocalStorage('colors', {
        primaryColor: '#6a5acd',
        secondaryColor: '#efefef',
    });
    const [primaryOpen, setPrimaryOpen] = useState(false);
    const [secondaryOpen, setSecondaryOpen] = useState(false);
    const primaryRef = useRef<HTMLDivElement>(null);
    const secondaryRef = useRef<HTMLDivElement>(null);
    const helpPanelRef = useRef<HTMLDivElement>(null);
    const [helpPanelVisible, setHelpPanelVisible] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;

            if (event.target && primaryRef.current && !primaryRef.current.contains(target)) {
                setPrimaryOpen(false);
            }
            if (secondaryRef.current && !secondaryRef.current.contains(target)) {
                setSecondaryOpen(false);
            }

            if (helpPanelRef.current && !helpPanelRef.current.contains(target)) {
                setHelpPanelVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [primaryRef, secondaryRef, helpPanelRef]);

    const isMobile = useIsMobile();

    return (
        <div id="toolbar" className="fixed bottom-0 flex h-12 w-full justify-between bg-slate-300 shadow shadow-slate-500">
            <div id={'attribute-settings'} className={'max-md:text-md flex flex-row items-center gap-4 px-4 text-xl font-medium text-slate-500 max-md:gap-2 max-sm:text-sm'}>
                <div id={'dimensions'} className={'flex flex-row justify-end gap-4 max-sm:flex-col max-sm:gap-0'}>
                    <div className={'flex flex-row items-center justify-end'}>
                        <div>X:</div>
                        <input className={'ml-2 h-8 w-16 rounded-md px-2 text-right shadow shadow-slate-500 max-sm:h-5 max-sm:rounded-b-none'}
                               type="number" value={canvasSize.dimX} placeholder={'100'}
                               onChange={(e) => {
                                   setCanvasSize({
                                       ...canvasSize,
                                       dimX: Number.parseInt(e.target.value),
                                   });
                               }}/>
                    </div>
                    <div className={'flex flex-row items-center justify-end'}>
                        <div>Y:</div>
                        <input className={'ml-2 h-8 w-16 rounded-md px-2 text-right shadow shadow-slate-500 max-sm:h-5 max-sm:rounded-t-none'}
                               type="number" value={canvasSize.dimY} placeholder={'100'}
                               onChange={(e) => {
                                   setCanvasSize({...canvasSize, dimY: Number.parseInt(e.target.value)});
                               }}/>
                    </div>
                </div>

                <div id={'colors'} className={'flex flex-row gap-4 max-md:flex-col max-md:items-end max-md:gap-0 max-md:text-sm'}>
                    <div ref={primaryRef} className={'flex flex-row items-center justify-center'}>
                        <div>Primary:</div>
                        <div className={'ml-2 h-8 w-16 rounded-md bg-amber-500 shadow shadow-slate-500 hover:cursor-pointer max-lg:w-8 max-md:h-4 max-md:w-4'}
                             style={{backgroundColor: colors.primaryColor}}
                             onClick={() => setPrimaryOpen(!primaryOpen)}/>

                        {primaryOpen && (
                            <div className={'fixed bottom-14'}>
                                <ColorPicker height={128} color={hexToIColor(colors.primaryColor)}
                                             onChange={(e) => {
                                                 setColors({...colors, primaryColor: e.hex});
                                             }}/>
                            </div>
                        )}
                    </div>

                    <div ref={secondaryRef} className={'flex flex-row items-center justify-center'}>
                        <div>Secondary:</div>
                        <div className={'ml-2 h-8 w-16 rounded-md bg-amber-500 shadow shadow-slate-500 hover:cursor-pointer max-lg:w-8 max-md:h-4 max-md:w-4'}
                             style={{backgroundColor: colors.secondaryColor}}
                             onClick={() => setSecondaryOpen(!secondaryOpen)}></div>

                        {secondaryOpen && (
                            <div className={'fixed bottom-14'}>
                                <ColorPicker height={128} color={hexToIColor(colors.secondaryColor)}
                                             onChange={(e) => {
                                                 setColors({
                                                     ...colors,
                                                     secondaryColor: e.hex,
                                                 });
                                             }}></ColorPicker>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={'mr-4 flex flex-row items-center gap-4'}>
                
                <button className="relative m-2 rounded-full bg-green-400 px-4 py-1 text-slate-50 shadow shadow-slate-500 hover:bg-green-300"
                        onClick={() => addComponent(null)}>
                    Add {isMobile ? 'Comp' : 'Component'}
                </button>
                
                <button className={""} onClick={() => clearTree()}>
                    <svg className={"fill-red-500 w-6 h-6"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>
                </button>

                <button className={'flex items-center justify-center rounded-full bg-slate-50 shadow shadow-slate-500'}
                        onClick={() => {
                            setHelpPanelVisible(!helpPanelVisible);
                        }}>
                    <svg className={'m-1 h-4 w-4 fill-slate-400'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/>
                    </svg>
                </button>

                {helpPanelVisible && (
                    <div ref={helpPanelRef} className={'fixed bottom-14 rounded-md bg-slate-300 p-2 shadow shadow-slate-500'}>
                        <div>Press 'Shift' to resize panels</div>
                        <div className={'text-xs italic'}>Made by Seoul Peterson</div>
                    </div>
                )}
            </div>
        </div>
    );
}
