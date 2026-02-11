import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ANIMALS } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getAnimalAvatar = (username: string) => {
    if (!username) return ANIMALS[0]
    let hash = 0
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % ANIMALS.length
    return ANIMALS[index]
}
