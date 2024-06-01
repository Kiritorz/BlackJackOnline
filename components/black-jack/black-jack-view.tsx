import { BlackJackPlayerIcon } from "@/public/BlackJackPlayerIcon"
import { BlackJackDealerIcon } from "@/public/BlackJackDealerIcon"
import { Divider, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Card, CardProps } from "@/components/black-jack/card";
import { dealerPolicy, generateDeck, getCardValue, getDeckSum, hasUsableAce, hit, playerPolicy, stand } from "./black-jack";
import { GameHistoryButton, saveOne } from "./game-history-button";
import { AutoCalcButton } from "./auto-calc-button";
import { CookieRequest } from "../cookie-request";
import { FriendsMatchView } from "../ws/friends-match-view";

export const BlackJackView = () => {

    const [gameStatus, setGameStatus] = useState<"menu" | "gaming" | "await" | "standing" | "win" | "lose" | "draw">("menu")
    const [mode, setMode] = useState<"player" | "dealer">("player")
    const [checkMode, setCheckMode] = useState(false)
    const [endFlag, setEndFlag] = useState(false)

    const [cookieSetRefresh, setCookieSetRefresh] = useState(0)

    const [userTip, setUserTip] = useState("")
    const [endMessage, setEndMessage] = useState("")

    const { isOpen: isHelpOpen, onOpen: onHelpOpen, onClose: onHelpClose, onOpenChange: onHelpOpenChange } = useDisclosure()

    const [playerDeck, setPlayerDeck] = useState<CardProps[]>([])
    const [dealerDeck, setDealerDeck] = useState<CardProps[]>([])

    // 玩家智能体
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        const checkAndHitPlayer = () => {
            if (gameStatus === "gaming" && playerDeck[playerDeck.length - 1]?.isBusted !== true) {
                if (playerPolicy(getDeckSum(playerDeck), getCardValue(dealerDeck[0].symbol), hasUsableAce(playerDeck)) === false && endFlag === false) {
                    setGameStatus("standing");
                    if (timer) {
                        // 清除定时器
                        clearInterval(timer);
                        timer = null;
                    }
                } else {
                    hit("player", mode, playerDeck, dealerDeck, setPlayerDeck, setDealerDeck);
                }
            }
        };

        if (mode === "dealer") {
            if (gameStatus === "gaming" && playerDeck[playerDeck.length - 1]?.isBusted !== true) {
                timer = setInterval(checkAndHitPlayer, 1000);
            }
        }

        // 清除定时器
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [playerDeck, endFlag])

    // 庄家智能体
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        const checkAndHitDealer = () => {
            const playerSum = getDeckSum(playerDeck);
            const dealerSum = getDeckSum(dealerDeck);
            if (gameStatus === "standing" && dealerSum <= playerSum && dealerDeck[dealerDeck.length - 1]?.isBusted !== true) {
                if (dealerPolicy(getDeckSum(dealerDeck), hasUsableAce(dealerDeck)) === false && endFlag === false) {
                    setGameStatus("await");
                    if (timer) {
                        // 清除定时器
                        clearInterval(timer);
                        timer = null;
                    }
                } else {
                    hit("dealer", mode, playerDeck, dealerDeck, setPlayerDeck, setDealerDeck);
                }
            }
        };

        if (mode === "player") {
            if (gameStatus === "standing" && getDeckSum(dealerDeck) <= getDeckSum(playerDeck) && dealerDeck[dealerDeck.length - 1]?.isBusted !== true) {
                timer = setInterval(checkAndHitDealer, 1000);
            }
        }

        // 清除定时器
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [dealerDeck, endFlag]);

    // 游戏开始
    useEffect(() => {
        if (endFlag === false && gameStatus === "gaming" && (mode === "player" || mode === "dealer") && playerDeck.length === 0 && dealerDeck.length === 0) {
            setPlayerDeck(generateDeck("player", mode))
            setDealerDeck(generateDeck("dealer", mode))
        }
    }, [gameStatus, mode, playerDeck, dealerDeck, endFlag])

    // 游戏结束条件
    useEffect(() => {
        if (mode === "player") {
            if (playerDeck.length > 0 && gameStatus === "gaming") {
                if (getDeckSum(playerDeck) > 21) {
                    if (endFlag === false) setGameStatus("await")
                }
            }
            if (dealerDeck.length > 0 && gameStatus === "standing") {
                if (getDeckSum(dealerDeck) > 21 || getDeckSum(dealerDeck) > getDeckSum(playerDeck)) {
                    if (endFlag === false) setGameStatus("await")
                }
            }
        } else if (mode === "dealer") {
            if (playerDeck.length > 0 && gameStatus === "gaming") {
                if (getDeckSum(playerDeck) > 21) {
                    if (endFlag === false) setGameStatus("await")
                }
            }
            if (dealerDeck.length > 0 && gameStatus === "standing") {
                if (getDeckSum(dealerDeck) > 21) {
                    if (endFlag === false) setGameStatus("await")
                }
            }
        }
    }, [playerDeck, dealerDeck])

    // 游戏结束
    useEffect(() => {
        // 更新用户提示
        if (mode === "dealer" && gameStatus === "standing") {
            setUserTip("Your turn")
        }
        // 对多线程的处理
        else if (gameStatus === "win" || gameStatus === "lose" || gameStatus === "draw") {
            setEndFlag(true)
            setUserTip("")
        }
        // 结算状态判定
        else if (gameStatus === "await" && endFlag === false) {
            setEndFlag(true)
            setUserTip("Waiting for result")

            const playerSum = getDeckSum(playerDeck)
            const dealerSum = getDeckSum(dealerDeck)
            if (playerSum > 21) {
                setTimeout(() => {
                    console.log("Player busts!")
                    setEndMessage("Player busts!")
                    if (mode === "player") {
                        saveOne({ r: "dw", m: "p", ps: playerSum, ds: dealerSum })
                        setGameStatus("lose")
                    }
                    else {
                        saveOne({ r: "dw", m: "d", ps: playerSum, ds: dealerSum })
                        setGameStatus("win")
                    }
                }, 1500)
            } else if (dealerSum > 21) {
                setTimeout(() => {
                    console.log("Dealer busts!")
                    setEndMessage("Dealer busts!")
                    if (mode === "player") {
                        saveOne({ r: "pw", m: "p", ps: playerSum, ds: dealerSum })
                        setGameStatus("win")
                    }
                    else {
                        saveOne({ r: "pw", m: "d", ps: playerSum, ds: dealerSum })
                        setGameStatus("lose")
                    }
                }, 1500)
            } else if (playerSum < dealerSum) {
                console.log("Dealer wins!")
                setEndMessage("Dealer has higher score!")
                setTimeout(() => {
                    if (mode === "player") {
                        saveOne({ r: "dw", m: "p", ps: playerSum, ds: dealerSum })
                        setGameStatus("lose")
                    }
                    else {
                        saveOne({ r: "dw", m: "d", ps: playerSum, ds: dealerSum })
                        setGameStatus("win")
                    }
                }, 1500)
            } else if (playerSum > dealerSum) {
                console.log("Player wins!")
                setEndMessage("Player has higher score!")
                setTimeout(() => {
                    if (mode === "player") {
                        saveOne({ r: "pw", m: "p", ps: playerSum, ds: dealerSum })
                        setGameStatus("win")
                    }
                    else {
                        saveOne({ r: "pw", m: "d", ps: playerSum, ds: dealerSum })
                        setGameStatus("lose")
                    }
                }, 1500)
            } else {
                setTimeout(() => {
                    console.log("Draw!")
                    saveOne({ r: "d", m: mode === "player" ? "p" : "d", ps: playerSum, ds: dealerSum })
                    setEndMessage("It's a draw!")
                    setGameStatus("draw")
                }, 1500)
            }
        } else if (gameStatus === "standing" && dealerDeck.length === 2) {
            if (mode === "player") {
                setDealerDeck(dealerDeck.map(deck => ({
                    ...deck,
                    isHidden: false
                })))
            }
        }
    }, [gameStatus])

    const MenuView = (
        <div className="flex justify-between gap-4 sm:gap-16 w-11/12 sm:w-1/2 py-12 select-none">
            <div className="w-full flex flex-col justify-center text-center rounded-lg bg-white hover:bg-gray-100
cursor-pointer hover:text-gray-500 active:scale-95 transition ease-in-out transform-gpu"
                role="presentation"
                onClick={() => {
                    setPlayerDeck([])
                    setDealerDeck([])
                    setEndFlag(false)
                    setGameStatus("gaming")
                    setMode("player")
                    setUserTip("Your turn")
                }}
            >
                <h1 className="text-blue-600 font-bold text-3xl">Player</h1>
                <div className="mt-12 mx-auto">
                    <BlackJackPlayerIcon />
                </div>
                <p className="mt-12 font-semibold">Press to Start</p>
            </div>
            <Divider className="h-80 my-2" orientation="vertical" />
            <div className="w-full flex flex-col justify-center text-center rounded-lg bg-white hover:bg-gray-100
cursor-pointer hover:text-gray-500 active:scale-95 transition ease-in-out transform-gpu"
                role="presentation"
                onClick={() => {
                    setPlayerDeck([])
                    setDealerDeck([])
                    setEndFlag(false)
                    setGameStatus("gaming")
                    setMode("dealer")
                    setUserTip("Player's turn")
                }}
            >
                <h1 className="text-green-600 font-bold text-3xl">Dealer</h1>
                <div className="mt-12 mx-auto">
                    <BlackJackDealerIcon />
                </div>
                <p className="mt-12 font-semibold">Press to Start</p>
            </div>
        </div>
    )

    const GameView = (
        <div className="mt-20 w-11/12 sm:w-2/3">
            <div className="flex h-44 justify-center gap-4 bg-gray-100/50 px-2 sm:px-8 py-4 rounded-lg">
                {mode === "player"
                    ? <>{dealerDeck.map((card, index) => (
                        <Card key={index} symbol={card.symbol} suit={card.suit} isBusted={card.isBusted} isHidden={card.isHidden} />
                    ))}
                        {checkMode === true
                            ? <p className="my-auto font-semibold tracking-wider text-xl">= {dealerDeck.some(card => card.isHidden === true) ? '?' : getDeckSum(dealerDeck)}</p>
                            : null}
                    </>
                    : <>{playerDeck.map((card, index) => (
                        <Card key={index} symbol={card.symbol} suit={card.suit} isBusted={card.isBusted} isHidden={card.isHidden} />
                    ))}
                        {checkMode === true
                            ? <p className="my-auto font-semibold tracking-wider text-xl">= {playerDeck.some(card => card.isHidden === true) ? '?' : getDeckSum(playerDeck)}</p>
                            : null}
                    </>
                }
            </div>
            <div className="flex gap-4 justify-between my-4">
                <div className={`w-1/2 h-12  font-semibold rounded-lg text-center text-lg
                flex flex-col justify-center select-none transition ease-in-out
                ${mode === "player" && (gameStatus === "await" || gameStatus === "standing")
                        || mode === "dealer" && (gameStatus === "await" || gameStatus === "gaming")
                        ? 'cursor-default bg-gray-100/70 text-gray-500/80'
                        : 'cursor-pointer bg-yellow-100/80 text-orange-500 hover:bg-yellow-100 active:scale-95'}`}
                    role="presentation"
                    onClick={() => {
                        if (mode === "player" && gameStatus !== "await" && gameStatus !== "standing") {
                            hit("player", mode, playerDeck, dealerDeck, setPlayerDeck, setDealerDeck)
                        } else if (mode === "dealer" && gameStatus !== "await" && gameStatus !== "gaming") {
                            hit("dealer", mode, playerDeck, dealerDeck, setPlayerDeck, setDealerDeck)
                        }
                    }}
                >
                    <p className="tracking-wider">Hit</p>
                </div>
                <div className={`w-1/2 h-12  font-semibold rounded-lg text-center text-lg
                flex flex-col justify-center select-none transition ease-in-out
                ${mode === "player" && (gameStatus === "await" || gameStatus === "standing")
                        || mode === "dealer" && (gameStatus === "await" || gameStatus === "gaming")
                        ? 'cursor-default bg-gray-100/70 text-gray-500/80'
                        : 'cursor-pointer bg-green-100/80 text-green-500 hover:bg-green-100 active:scale-95'}`}
                    role="presentation"
                    onClick={() => {
                        if (mode === "player" && gameStatus !== "await" && gameStatus !== "standing") {
                            stand(mode, playerDeck, setPlayerDeck, setGameStatus, setUserTip)
                        } else if (mode === "dealer" && gameStatus !== "await" && gameStatus !== "gaming") {
                            stand(mode, playerDeck, setPlayerDeck, setGameStatus, setUserTip)
                        }
                    }}
                >
                    <p className="tracking-wider">Stand</p>
                </div>
            </div>
            <div className="flex h-44 justify-center gap-4 bg-gray-100/50 px-2 sm:px-8 py-4 rounded-lg">
                {mode === "player"
                    ? <>{playerDeck.map((card, index) => (
                        <Card key={index} symbol={card.symbol} suit={card.suit} isBusted={card.isBusted} isHidden={card.isHidden} />
                    ))}
                        {checkMode === true
                            ? <p className="my-auto font-semibold tracking-wider text-xl">= {getDeckSum(playerDeck)}</p>
                            : null}
                    </>
                    : <>{dealerDeck.map((card, index) => (
                        <Card key={index} symbol={card.symbol} suit={card.suit} isBusted={card.isBusted} isHidden={card.isHidden} />
                    ))}
                        {checkMode === true
                            ? <p className="my-auto font-semibold tracking-wider text-xl">= {getDeckSum(dealerDeck)}</p>
                            : null}
                    </>
                }
            </div>
        </div>
    )

    const GameOverView = (
        <div className="flex flex-col w-full items-center gap-4">
            <div key="GameOverPane" className={`mt-32 mb-20 flex flex-col justify-center h-36 w-full
            ${gameStatus === "win" ? 'bg-green-600'
                    : gameStatus === "lose" ? 'bg-red-600'
                        : gameStatus === "draw" ? "bg-orange-600" : ""}`}>
                <h1 className={`text-center text-6xl font-bold text-white`}>
                    {gameStatus === "win" ? 'You Win'
                        : gameStatus === "lose" ? 'You Lose'
                            : gameStatus === "draw" ? "Draw" : "What happened?"}
                </h1>
                <p className="text-center mt-2 text-white/60">
                    {endMessage}
                </p>
            </div>
            <div className="w-60 h-14 bg-yellow-100/80 text-orange-500  font-semibold rounded-lg text-center text-lg
                flex flex-col justify-center select-none cursor-pointer hover:bg-yellow-100 active:scale-95 transition ease-in-out"
                role="presentation"
                onClick={() => {
                    setGameStatus("menu")
                    setMode("player")
                }}
            >
                <p className="tracking-wider">Restart</p>
            </div>
        </div>
    )

    const MainView = (
        gameStatus === "menu" ? MenuView :
            gameStatus === "gaming" || gameStatus === "await" || gameStatus === "standing" ? GameView :
                gameStatus === "win" || gameStatus === "lose" || gameStatus === "draw" ? GameOverView : null
    )

    const Title = (
        <div className="absolute top-20">
            <div className="text-center select-none cursor-default">
                <h1 className="font-bold text-5xl">BlackJack</h1>
                <p className="text-teal-600/85 font-semibold">{userTip ?? ' '}</p>
            </div>
        </div>
    )

    const HelpButton = (
        gameStatus === "menu"
            ? <div className="cursor-pointer w-36 text-center px-2 py-1 bg-emerald-600 hover:bg-emerald-500  border-emerald-500 text-white select-none rounded-lg active:scale-95 transition ease-in-out"
                role="presentation" onClick={onHelpOpen}
            >How to play?
            </div>
            : null
    )

    return (
        <div className="relative flex">
            <CookieRequest refresh={cookieSetRefresh} />
            <GameHistoryButton refresh={cookieSetRefresh} setRefresh={setCookieSetRefresh} />
            <FriendsMatchView />
            <AutoCalcButton checkMode={checkMode} setCheckMode={setCheckMode} isHidden={gameStatus !== "gaming" && gameStatus !== "await" && gameStatus !== "standing"} />
            <section className="relative w-screen h-screen flex flex-col items-center justify-center gap-4 py-8">
                {Title}
                {MainView}
                {HelpButton}
            </section>
            <Modal size="3xl" isOpen={isHelpOpen} onOpenChange={onHelpOpenChange}>
                <ModalContent>
                    <ModalHeader className="text-2xl pb-2">How to play BlackJack?</ModalHeader>
                    <ModalBody className="mb-4 pt-0">
                        <p className="">Before you get started with <b>BlackJack</b>, you need to know how to play.
                            In this quick BlackJack guide, we’ll tell you the basics of how to do just that!
                        </p>
                        <div className="bg-green-100/80 py-2 px-4 rounded-lg border-l-4 border-l-green-600">
                            <li><i>The aim of BlackJack is to beat the dealer’s hand without going over 21.</i></li>
                            <li><i>If you go over 21, you go ‘bust’ and you’ve lost.</i></li>
                            <li><i>If the dealer reaches 21 before you, you’ve lost.</i></li>
                            <li><i>If the dealer goes bust and you’ve gotten closer to 21 than they have, you win!</i></li>
                            <li><i>Picture cards (King, Queen, Jack) count as ‘10’, while Aces can either be 1 or 11, depending on what makes better sense for your hand.
                                Cards 2-10 count at face value.</i></li>
                        </div>
                        <p>Tell the dealer to <b>hit</b> if you want another card.
                            <br />
                            Tell the dealer to <b>stand</b> if you’re happy with your cards and don’t want to be given another one.
                        </p>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    )
}