import { TabsItem, TabsSection, useTabsContent } from 'components/NavBar/Tabs/TabsContent'
import { useKeyPress } from 'hooks/useKeyPress'
import styled from 'lib/styled-components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Popover, Text } from 'ui/src'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'

const TabText = styled(Text)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    color: ${({ theme }) => theme.neutral1} !important;
  }
`

const Tab = ({
  label,
  isActive,
  path,
  items,
}: {
  label: string
  isActive?: boolean
  path: string
  items?: TabsItem[]
}) => {
  const [isOpen] = useState(false)
  const navigate = useNavigate()
  const popoverRef = useRef<Popover>(null)
  const location = useLocation()
  const navHotkeysEnabled = useFeatureFlag(FeatureFlags.NavigationHotkeys)

  const closeMenu = useCallback(() => {
    popoverRef.current?.close()
  }, [popoverRef])
  useEffect(() => closeMenu(), [location, closeMenu])

  const Label = (
    <NavLink to={path} style={{ textDecoration: 'none' }}>
      <TabText
        variant="subheading1"
        color={isActive || isOpen ? '$neutral1' : '$neutral2'}
        m="8px"
        gap="4px"
        cursor="pointer"
        userSelect="none"
      >
        {label}
      </TabText>
    </NavLink>
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!items || !isOpen) {
        return
      }
      const item = items.find((i) => i.quickKey.toUpperCase() === event.key || i.quickKey.toLowerCase() === event.key)
      if (!item) {
        return
      }
      if (item.internal) {
        navigate(item.href)
      } else {
        window.location.href = item.href
      }
      closeMenu()
    },
    [items, navigate, closeMenu, isOpen],
  )

  useKeyPress({
    callback: handleKeyDown,
    keys: items?.map((i) => i.quickKey.toLowerCase()),
    disabled: !navHotkeysEnabled || !isOpen,
  })

  return Label
}

export function Tabs() {
  const tabsContent: TabsSection[] = useTabsContent()
  return (
    <>
      {tabsContent.map(({ title, isActive, href, items }, index) => (
        <Tab key={`${title}_${index}`} label={title} isActive={isActive} path={href} items={items} />
      ))}
    </>
  )
}
