import { useEffect, useMemo, useState } from 'react'
import { IoCloseOutline, IoSearchOutline } from 'react-icons/io5'

import { COUNTRIES } from './countries'

type CountrySelectModalProps = {
  isOpen: boolean
  title: string
  selectedCountry: string
  onClose: () => void
  onSelect: (country: string) => void
}

export function CountrySelectModal({
  isOpen,
  title,
  selectedCountry,
  onClose,
  onSelect,
}: CountrySelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCountries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return COUNTRIES
    return COUNTRIES.filter((country) => country.toLowerCase().includes(normalizedSearch))
  }, [searchTerm])

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="country-modal-overlay" onClick={onClose} role="presentation">
      <div className="country-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <header className="country-modal-header">
          <h3>{title}</h3>
          <button type="button" className="country-modal-close" onClick={onClose} aria-label="Close country selector">
            <IoCloseOutline />
          </button>
        </header>

        <div className="country-modal-search">
          <IoSearchOutline />
          <input
            type="text"
            placeholder="Search country..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            autoFocus
          />
        </div>

        <div className="country-modal-list">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => {
              const isSelected = selectedCountry === country
              return (
                <button
                  key={country}
                  type="button"
                  className={isSelected ? 'country-option active' : 'country-option'}
                  onClick={() => onSelect(country)}
                >
                  {country}
                </button>
              )
            })
          ) : (
            <p className="country-modal-empty">No country found for "{searchTerm}".</p>
          )}
        </div>
      </div>
    </div>
  )
}
