export interface AutoCalcButtonProps {
    checkMode: boolean,
    setCheckMode: (value: boolean) => void,
    isHidden: boolean,
}

export const AutoCalcButton = (props: AutoCalcButtonProps) => {
    return (
        <div className={`absolute top-0 right-0 w-28 sm:w-32 z-10 text-center select-none cursor-pointer m-2 transition ease-in-out
            active:scale-95 border-1 px-2 py-1 rounded-lg text-sm sm:text-base
            ${props.checkMode === true ? 'text-white bg-emerald-600 hover:bg-emerald-500  border-emerald-500' : 'text-gray-600 bg-gray-200 hover:bg-gray-300  border-gray-300'}`}
            role="presentation"
            onClick={() => {
                props.setCheckMode(!props.checkMode)
            }}
            hidden={props.isHidden}>
            {props.checkMode === true ? 'AutoCalc On' : 'AutoCalc Off'}
        </div>
    )
}