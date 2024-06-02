import { Dispatch, SetStateAction } from "react"
import { CardProps } from "./card"

const suits = ["♠", "♣", "♦", "♥"]
const symbols = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// 玩家策略
export const playerPolicy = (playerSum: number, dealerShowing: number, usableAce: boolean) => {

    const noUsableAceActionMatrix = [
        // dealerShowing = A, 2, 3, 4, 5, 6, 7, 8, 9, 10
        // selfSum = 12
        [1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        // selfSum = 13
        [1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        // selfSum = 14
        [1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        // selfSum = 15
        [1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        // selfSum = 16
        [1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        // selfSum = 17
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // selfSum = 18
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // selfSum = 19
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // selfSum = 20
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // selfSum = 21
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]

    const usableAceActionMatrix = [
        // dealerShowing = A, 2, 3, 4, 5, 6, 7, 8, 9, 10
        // selfSum = 12
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // selfSum = 13
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // selfSum = 14
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // selfSum = 15
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // selfSum = 16
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // selfSum = 17
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // selfSum = 18
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        // selfSum = 19
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // selfSum = 20
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // selfSum = 21
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]

    // playerSum < 12 时, 固定要牌
    if (playerSum < 12) return true
    else return usableAce ? (usableAceActionMatrix[playerSum - 12][dealerShowing - 1] === 1) : (noUsableAceActionMatrix[playerSum - 12][dealerShowing - 1] === 1)
}

// 庄家策略
export const dealerPolicy = (dealerSum: number, usableAce: boolean) => {

    return dealerSum < 17
}

// 计算牌面总和
export const getDeckSum = (deck: CardProps[]) => {
    const sum = deck.reduce((acc, card) => acc + getCardValue(card.symbol), 0)
    return hasUsableAce(deck) ? sum + 10 : sum
}

// 获取牌面值
export const getCardValue = (symbol: string) => {
    if (symbol === 'A') return 1
    if (['J', 'Q', 'K'].includes(symbol)) return 10
    return parseInt(symbol)
}

// 
export const hasUsableAce = (deck: CardProps[]) => {
    return deck.some(card => card.symbol === 'A') && deck.reduce((acc, card) => acc + getCardValue(card.symbol), 0) <= 11
}

// 生成牌堆
export const generateDeck = (who: "player" | "dealer", mode: "player" | "dealer") => {
    let deck: CardProps[] = []

    if (mode === "player") {
        for (let i = 0; i < 2; i++) {
            const randomSuit = suits[Math.floor(Math.random() * suits.length)]
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
            if (who === "dealer" && i > 0) {
                deck.push({ symbol: randomSymbol, suit: randomSuit, isHidden: true })
            } else {
                deck.push({ symbol: randomSymbol, suit: randomSuit })
            }
        }
    } else if (mode === "dealer") {
        for (let i = 0; i < 2; i++) {
            const randomSuit = suits[Math.floor(Math.random() * suits.length)]
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
            if (who === "player") {
                deck.push({ symbol: randomSymbol, suit: randomSuit, isHidden: true })
            } else {
                deck.push({ symbol: randomSymbol, suit: randomSuit })
            }
        }
    }
    return deck
}

// 抽牌
export const hit = (
    who: "player" | "dealer",
    mode: "player" | "dealer",
    playerDeck: CardProps[],
    dealerDeck: CardProps[],
    setPlayerDeck: Dispatch<SetStateAction<CardProps[]>>,
    setDealerDeck: Dispatch<SetStateAction<CardProps[]>>,
    isSoundOpen: boolean
) => {
    if (isSoundOpen) playHitSound()
    const randomSuit = suits[Math.floor(Math.random() * suits.length)]
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
    if (who === "player") {
        if (getDeckSum(playerDeck) + getCardValue(randomSymbol) > 21 && !hasUsableAce(playerDeck)) {
            setPlayerDeck([...playerDeck.map(card => ({
                ...card,
                isHidden: false
            })), { symbol: randomSymbol, suit: randomSuit, isBusted: true }])
        } else {
            if (mode === "dealer") {
                setPlayerDeck([...playerDeck, { symbol: randomSymbol, suit: randomSuit, isHidden: true }])
            } else {
                setPlayerDeck([...playerDeck, { symbol: randomSymbol, suit: randomSuit }])
            }
        }
    } else if (who === "dealer") {
        if (getDeckSum(dealerDeck) + getCardValue(randomSymbol) > 21 && !hasUsableAce(dealerDeck)) {
            setDealerDeck([...dealerDeck, { symbol: randomSymbol, suit: randomSuit, isBusted: true }])
        } else {
            setDealerDeck([...dealerDeck, { symbol: randomSymbol, suit: randomSuit }])
        }
    }
}

const playHitSound = () => {
    const audioElement = new Audio()

    const sound = {
        src: "/sounds/card-drop.mp3",
        volume: 0.5,
        playbackRate: 1
    }

    audioElement.src = sound.src
    audioElement.playbackRate = sound.playbackRate
    audioElement.volume = sound.volume

    audioElement.play()
}

// 停牌
export const stand = (
    mode: "player" | "dealer",
    playerDeck: CardProps[],
    setPlayerDeck: Dispatch<SetStateAction<CardProps[]>>,
    setGameStatus: Dispatch<SetStateAction<"menu" | "gaming" | "await" | "standing" | "win" | "lose" | "draw">>,
    setUserTip: Dispatch<SetStateAction<string>>,
) => {
    if (mode === "player") {
        setGameStatus("standing")
        setUserTip("Dealer's turn")
    } else if (mode === "dealer") {
        setPlayerDeck(playerDeck.map(deck => ({
            ...deck,
            isHidden: false
        }))
        )
        setGameStatus("await")
    }
}