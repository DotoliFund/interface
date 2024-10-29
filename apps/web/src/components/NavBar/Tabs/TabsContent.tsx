import { MenuItem } from 'components/NavBar/CompanyMenu/Content'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'uniswap/src/i18n'

export type TabsSection = {
  title: string
  href: string
  isActive?: boolean
  items?: TabsItem[]
  closeMenu?: () => void
}

export type TabsItem = MenuItem & {
  icon?: JSX.Element
  quickKey: string
}

// eslint-disable-next-line
export const useTabsContent = (props?: { includeNftsLink?: boolean }): TabsSection[] => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return [
    {
      title: t('common.trade'),
      href: '/swap',
      isActive: pathname.startsWith('/swap'),
      items: [],
    },
    {
      title: t('common.pool'),
      href: '/pool',
      isActive: pathname.startsWith('/pool'),
      items: [],
    },
    {
      title: t('common.overview'),
      href: '/overview',
      isActive: pathname.startsWith('/overview'),
      items: [],
    },
  ]
}
