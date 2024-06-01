export const getFindFriendsMessage = (message: string) => {
    return 'ff:' + message
}

export const isFindFriendsMessage = (message: string) => {
    return message.startsWith('ff:')
}

export const getNormalMessage = (message: string) => {
    return 'nm:' + message
}

export const isNormalMessage = (message: string) => {
    return message.startsWith('nm:')
}