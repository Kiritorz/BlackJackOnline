import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import { Cookies } from "react-cookie"
import { CookieSetKey } from "../cookie-request"
import { Dispatch, SetStateAction } from "react"

export interface RecordProps {
  // r: result (pw: player win, dw: dealer win, d: draw)
  r: "pw" | "dw" | "d",
  // m: mode (p: player, d: dealer)
  m: "p" | "d",
  // ps: player sum
  ps: number,
  // ds: dealer sum
  ds: number
}

const cookie = new Cookies()
const saveKey = "blackjack-records"

const getResult = (record: RecordProps) => {
  if (record.r === "pw" && record.m === "p" || record.r === "dw" && record.m === "d") {
    return "win"
  } else if (record.r === "pw" && record.m === "d" || record.r === "dw" && record.m === "p") {
    return "lose"
  } else {
    return "draw"
  }
}

const getCountByResult = (result: "win" | "lose" | "draw" | "all") => {
  if (result === "all") {
    return cookie.get(saveKey).length
  } else {
    return cookie.get(saveKey).filter((record: RecordProps) => getResult(record) === result).length
  }
}

export const saveOne = (record: RecordProps) => {
  cookie.update()
  if (cookie.get(CookieSetKey) === true) {
    if (cookie.get(saveKey) == undefined || cookie.get(saveKey).length === 0) {
      cookie.set(saveKey, [record])
    } else {
      cookie.set(saveKey, [...cookie.get(saveKey), record])
    }
  }
}

interface GameHistoryButtonProps {
  refresh: number,
  setRefresh: Dispatch<SetStateAction<number>>
}

export const GameHistoryButton = (props: GameHistoryButtonProps) => {
  // 将游戏记录保存到本地
  // 保存的数据结构为: {result: "pw" | "dw" | "draw", mode: "player" | "dealer", playerSum: number, dealerSum: number}

  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onOpenChange: onHistoryOpenChange } = useDisclosure()
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onOpenChange: onAlertOpenChange } = useDisclosure()

  return (
    <div className="absolute top-0 left-0 z-10">
      <div className="w-40 sm:w-44 m-2 px-2 py-1 rounded-lg select-none cursor-pointer bg-emerald-600 hover:bg-emerald-500 border-emerald-700
     text-white transition ease-in-out active:scale-95 text-center text-sm sm:text-base
      "
        role="presentation"
        onClick={() => {
          cookie.update()
          if (cookie.get(CookieSetKey) === true) {
            onHistoryOpen()
          } else {
            onAlertOpen()
          }
        }}
      >
        View Game History
      </div>
      <Modal size="3xl" isOpen={isHistoryOpen} onOpenChange={onHistoryOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col pb-2">
            <p className="text-2xl">Game History</p>
            {cookie.get(saveKey) == undefined
              ? null
              : <p className="text-sm font-normal text-gray-500">{cookie.get(saveKey).length} in total
                {
                  (getCountByResult("all") - getCountByResult("draw")) === 0
                    ? getCountByResult("win") === 0
                      ? null
                      : " / Win rate: 100.00%"
                    : ` / Win rate: ${(100 * getCountByResult("win") / (getCountByResult("all") - getCountByResult("draw"))).toFixed(2)}%`
                }
              </p>
            }
          </ModalHeader>
          <ModalBody className="mb-4">
            {cookie.get(saveKey) == undefined
              ? <p className="text-center select-none text-gray-500 cursor-default">No History</p>
              : <div className="flex flex-col gap-2">
                {cookie.get(saveKey).reverse().map((record: RecordProps, index: number) => {
                  return (
                    <div key={index} className="flex gap-2 sm:gap-4">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 text-sm sm:text-base aspect-square flex items-center justify-center rounded-lg text-white text-center select-none cursor-default
                    ${record.m === "p" ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {record.m === "p" ? "Player" : "Dealer"}
                      </div>
                      <div className="rounded-lg bg-gray-100 px-4 py-1 h-12 sm:h-16 w-full">
                        <p className={`font-bold text-sm sm:text-lg ${(record.r === "pw" && record.m === "p" || record.r === "dw" && record.m === "d")
                          ? "text-green-500"
                          : (record.r === "pw" && record.m === "d" || record.r === "dw" && record.m === "p")
                            ? "text-red-500"
                            : "text-orange-500"}`}>
                          {(record.r === "pw" && record.m === "p" || record.r === "dw" && record.m === "d") ? "Win" : (record.r === "pw" && record.m === "d" || record.r === "dw" && record.m === "p") ? "Lose" : "Draw"}
                        </p>
                        <p className="text-sm sm:text-base">Player: <b>{record.ps}</b> / Dealer: <b>{record.ds}</b></p>
                      </div>
                    </div>
                  )
                })}
              </div>
            }
          </ModalBody>
          {cookie.get(saveKey) == undefined
            ? null
            : <ModalFooter>
              <button className="w-full bg-danger/20 hover:bg-danger/30 text-danger hover: px-4 py-2 rounded-lg active:scale-95 transition ease-in-out"
                onClick={() => {
                  cookie.remove(saveKey)
                  onHistoryOpenChange()
                }}
              >
                Clear all history
              </button>
            </ModalFooter>}
        </ModalContent>
      </Modal>
      <Modal size="3xl" isOpen={isAlertOpen} onOpenChange={onAlertOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="text-2xl pb-2">
            Not Available
          </ModalHeader>
          <ModalBody className="mb-4">
            <div className="bg-red-100/80 py-2 px-4 rounded-lg border-l-4 border-l-red-600">
              <i>We are sorry that the game history is not available because you have not accepted the cookie policy. Please accept the cookie policy to view the game history.</i>
            </div>
            <p>You can accept the cookie policy by clicking the button below.</p>
          </ModalBody>
          <ModalFooter>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg
                            hover:bg-gray-700 active:scale-95 transition ease-in-out"
              onClick={() => {
                cookie.set(CookieSetKey, true)
                props.setRefresh(props.refresh + 1)
                onAlertOpenChange()
                onHistoryOpen()
              }}
            >Accept All Cookies</button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg
                            hover:bg-gray-700 active:scale-95 transition ease-in-out"
              onClick={() => {
                cookie.set(CookieSetKey, false)
                onAlertOpenChange()
              }}
            >Refuse</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}