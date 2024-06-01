
import { useEffect, useState } from "react"
import { Cookies } from "react-cookie"

export const CookieSetKey = "blackjack-cookie-accepted"

const cookie = new Cookies()

interface CookieRequestProps {
    refresh: number
}

export const CookieRequest = (props: CookieRequestProps) => {

    const [isSet, setIsSet] = useState(true)

    const checkCookieSet = () => {
        cookie.update()
        if (cookie.get(CookieSetKey) !== true && cookie.get(CookieSetKey) !== false) {
            setIsSet(false)
        } else if (cookie.get(CookieSetKey) === true) {
            setIsSet(true)
        }
    }

    useEffect(() => {
        checkCookieSet()
    }, [])

    useEffect(() => {
        checkCookieSet()
    }, [props.refresh])

    return (
        isSet === false
            ? <div className="absolute bottom-0 z-20 w-full">
                <div className="bg-gray-800 text-white px-4 py-4 sm:py-6">
                    <div className="container mx-auto">
                        <div className="flex justify-between items-center">
                            <p className="text-sm sm:text-base">We use cookies to ensure you get the best experience on our website.</p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button className="bg-white text-sm sm:text-base text-gray-800 px-4 py-2 rounded-lg
                            hover:bg-gray-100 active:scale-95 transition ease-in-out"
                                    onClick={() => {
                                        cookie.set(CookieSetKey, true)
                                        setIsSet(true)
                                    }}
                                >Accept</button>
                                <button className="bg-white text-sm sm:text-base text-gray-800 px-4 py-2 rounded-lg
                            hover:bg-gray-100 active:scale-95 transition ease-in-out"
                                    onClick={() => {
                                        cookie.set(CookieSetKey, false)
                                        setIsSet(true)
                                    }}
                                >Refuse</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            : null
    )
}