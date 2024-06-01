import { Modal, ModalBody, ModalContent, ModalHeader, ModalProps } from "@nextui-org/react"

interface HelpModalProps {
    isOpen: boolean,
    onOpen: () => void,
    onOpenChange: (isOpen: boolean) => void,
}

export const HelpModal = (props: HelpModalProps) => {
    return (
        <Modal size="3xl" isOpen={props.isOpen} onOpenChange={props.onOpenChange}>
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
    )
}