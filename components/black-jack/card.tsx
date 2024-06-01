export interface CardProps {
    symbol: string
    suit: string
    isBusted?: boolean
    isHidden?: boolean
}

export const Card = (props: CardProps) => {
    return (
        props.isHidden === true
            ? <div className={`flex flex-col gap-6 items-center justify-center w-24 h-36 rounded-lg transition ease-in-out
        shadow-lg select-none cursor-default bg-gray-600 hover:bg-gray-700 border-1 border-gray-800`}>
            </div>
            : <div className={`flex flex-col gap-6 items-center justify-center w-24 h-36 rounded-lg transition ease-in-out
        shadow-lg select-none cursor-default ${props.isBusted === true ? 'bg-red-200/70 hover:bg-red-200 border-2 border-dashed border-red-500' : 'bg-white hover:bg-gray-100'}`}>
                <h1 className="text-3xl">{props.symbol}</h1>
                <p className={`text-center text-2xl ${props.suit === '♠' || props.suit === '♣' ? 'text-black' : 'text-red-500'}`}>{props.suit}</p>
            </div>
    )
}