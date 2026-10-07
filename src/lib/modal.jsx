import { createContext, useContext, useState } from 'react'

const ModalCtx = createContext(null)

export function ModalProvider({ children }) {
  const [reel, setReel] = useState(null)
  return <ModalCtx.Provider value={{ reel, open: setReel, close: () => setReel(null) }}>{children}</ModalCtx.Provider>
}

export const useModal = () => useContext(ModalCtx)
