import { createContext, useContext, useState } from 'react'
import { getIndustry } from '../data/industries'

// The hero switcher's choice (Real Estate / Hospital / University),
// shared so the sections below it can follow along.
const IndustryCtx = createContext(null)

export function IndustryProvider({ children }) {
  const [industry, setIndustry] = useState('real-estate')
  return (
    <IndustryCtx.Provider value={{ industry, setIndustry, config: getIndustry(industry) }}>
      {children}
    </IndustryCtx.Provider>
  )
}

export const useIndustry = () => useContext(IndustryCtx)
