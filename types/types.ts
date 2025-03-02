export type TUser = {
    name: string
    email: string
    role: string
    _id: string
  }
  
export type TCamera = {
    title: string,
    description: string,
    coordinates: [number, number],
    url: string,
    _id: string,
    address?: string,
    access?: {
        credentials: {
            login: string,
            password: string
        }
    },
    ownerContact?: {
        name: string,
        accounts: Array<{
            type: string,
            value: string
        }>
    }
}