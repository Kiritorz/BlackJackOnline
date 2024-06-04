import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

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

const saveKey = "blackjack-records"

const recordsToString = (records: RecordProps[]) => {
  return records.map((record: RecordProps) => {
    return `${record.r}-${record.m}-${record.ps}-${record.ds}`
  }).join(",")
}

const stringToRecords = (str: string | null) => {
  if (str === null || str === "") return []
  return str.split(",").map((record: string) => {
    const [r, m, ps, ds] = record.split("-")
    return { r, m, ps: parseInt(ps), ds: parseInt(ds) }
  }) as RecordProps[]
}

export const saveOne = (record: RecordProps) => {
  const records = stringToRecords(localStorage.getItem(saveKey))
  records.push(record)
  localStorage.setItem(saveKey, recordsToString(records))
}

interface GameHistoryModalProps {
  isGameHistoryOpen: boolean,
  onGameHistoryOpen: () => void,
  onGameHistoryOpenChange: ((isOpen: boolean) => void),
  refreshGameHistory: boolean,
  setRefreshGameHistory: Dispatch<SetStateAction<boolean>>
}

export const GameHistoryModal = (props: GameHistoryModalProps) => {
  // 将游戏记录保存到 LocalStorage

  const [records, setRecords] = useState<RecordProps[]>([])

  // 初始化
  useEffect(() => {
    setRecords(stringToRecords(localStorage.getItem(saveKey)))
  }, [])

  // 监听是否需要刷新
  useEffect(() => {
    if (props.refreshGameHistory) {
      setRecords(stringToRecords(localStorage.getItem(saveKey)))
      props.setRefreshGameHistory(false)
    }
  }, [props.refreshGameHistory])

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
      return records.length
    } else {
      return records.filter((record: RecordProps) => getResult(record) === result).length
    }
  }

  return (
    <div>
      <Modal size="3xl" isOpen={props.isGameHistoryOpen} onOpenChange={props.onGameHistoryOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col pb-2">
            <p className="text-2xl">Game History</p>
            {records === null || records.length === 0
              ? null
              : <p className="text-sm font-normal text-gray-500">{getCountByResult("all")} in total
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
            {records === null || records.length === 0
              ? <p className="text-center select-none text-gray-500 cursor-default">No History</p>
              : <div className="flex flex-col gap-2">
                {records.reverse().map((record: RecordProps, index: number) => {
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
          {records === null || records.length === 0
            ? null
            : <ModalFooter>
              <button className="w-full bg-danger/20 hover:bg-danger/30 text-danger hover: px-4 py-2 rounded-lg active:scale-95 transition ease-in-out"
                onClick={() => {
                  localStorage.removeItem(saveKey)
                  props.setRefreshGameHistory(true)
                  // 关闭窗口
                  props.onGameHistoryOpenChange(false)
                }}
              >
                Clear all history
              </button>
            </ModalFooter>}
        </ModalContent>
      </Modal>
    </div>
  )
}