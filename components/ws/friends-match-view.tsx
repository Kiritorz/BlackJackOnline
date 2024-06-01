import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import { useWebSocket } from 'next-ws/client';
import { Button, Input } from '@nextui-org/react';
import { getFindFriendsMessage, getNormalMessage } from '@/components/ws/client-message';

export const FriendsMatchView = () => {
  let ws = useWebSocket();
  // WebSocket on the client, null on the server

  const [roomId, setRoomId] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [responseMessage, setResponseMessage] = useState<string | null>();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const { isOpen: isMatchOpen, onOpen: onMatchOpen, onOpenChange: onMatchOpenChange } = useDisclosure()

  useEffect(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }
  }, [ws])

  const onMessage = useCallback(
    (event: MessageEvent<Blob>) =>
      void event.data.text().then(setResponseMessage),
    [],
  );

  useEffect(() => {
    ws?.addEventListener('message', onMessage);
    return () => ws?.removeEventListener('message', onMessage);
  }, [onMessage, ws]);

  return (
    <div className="absolute top-8 sm:top-10 left-0 z-10">
      <div className="w-40 sm:w-44 m-2 px-2 py-1 rounded-lg select-none cursor-pointer bg-blue-600 hover:bg-blue-500 border-blue-700
     text-white transition ease-in-out active:scale-95 text-center text-sm sm:text-base
      "
        role="presentation"
        onClick={() => {
          onMatchOpen()
        }}
      >
        Player with friends
      </div>
      <Modal size="3xl" isOpen={isMatchOpen} onOpenChange={onMatchOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col pb-2">
            <p className="text-base sm:text-2xl">Play BlackJack with your friends</p>
            <p className="text-sm font-normal text-gray-500">Input the same room id and connect to your friends!</p>
          </ModalHeader>
          <ModalBody className="mb-4">
            <div className='gap-4 flex flex-col justify-center'>
              <div className='flex gap-2'>
                <Input
                  className='w-1/2'
                  placeholder='Input room id'
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />

                <Button
                  className="w-1/2 bg-primary hover:bg-primary/80 active:scale-95 text-white p-2 rounded-lg transition ease-in-out"
                  onClick={() => {
                    if (roomId != null && roomId !== '') {
                      ws?.send(getFindFriendsMessage(roomId))
                    }
                  }}
                  isDisabled={!isConnected}
                >
                  {isConnected ? 'Match' : 'Connecting...'}
                </Button>
              </div>

              <div className='flex gap-2'>
                <Input
                  className='w-1/2'
                  placeholder='Input message'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <Button
                  className="w-1/2 bg-black hover:bg-black/80 active:scale-95 text-white p-2 rounded-lg transition ease-in-out"
                  onClick={() => {
                    if (message != null && message !== '') {
                      ws?.send(getNormalMessage(message))
                    }
                  }}
                  isDisabled={!isConnected}
                >
                  {isConnected ? 'Send' : 'Connecting...'}
                </Button>
              </div>

              <div>
                {responseMessage == null
                  ? <div className="bg-orange-100/80 py-2 px-4 rounded-lg border-l-4 border-l-orange-600">
                    <i>Waiting to receive message...</i>
                  </div>
                  : <div className="bg-green-100/80 py-2 px-4 rounded-lg border-l-4 border-l-green-600">
                    <p className='font-bold'>Server: </p>
                    <i>{`${responseMessage}`}</i>
                  </div>
                }
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}