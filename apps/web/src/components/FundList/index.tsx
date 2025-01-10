// import PositionListItem from 'components/PositionListItem'
import FundListItem from 'components/FundListItem'
import { FundDetails } from 'dotoli/src/types/fund'
import styled from 'lib/styled-components'
import React from 'react'
import { MEDIA_WIDTHS } from 'theme'
import { useTranslation } from 'uniswap/src/i18n'

const DesktopHeader = styled.div`
  display: none;
  font-size: 14px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.surface3};

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    align-items: center;
    display: flex;
    justify-content: space-between;
    & > div:last-child {
      text-align: right;
      margin-right: 12px;
    }
  }
`

const MobileHeader = styled.div`
  font-weight: medium;
  padding: 8px;
  font-weight: 535;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.surface3};

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    display: none;
  }

  @media screen and (max-width: ${MEDIA_WIDTHS.deprecated_upToExtraSmall}px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

type FundListProps = React.PropsWithChildren<{
  isManagingFund: boolean
  funds: FundDetails[]
}>

export default function FundList({ isManagingFund, funds }: FundListProps) {
  const { t } = useTranslation()
  return (
    <>
      <DesktopHeader>
        {!isManagingFund ? <>{t('myaccount.investingfund')}</> : <>{t('myaccount.managingfund')}</>}
        {!isManagingFund ? funds && ' (' + funds.length + ')' : null}
      </DesktopHeader>
      <MobileHeader>
        {!isManagingFund ? <>{t('myaccount.investingfund')}</> : <>{t('myaccount.managingfund')}</>}
        {!isManagingFund ? funds && ' (' + funds.length + ')' : null}
      </MobileHeader>
      {funds.map((p) => {
        return <FundListItem key={p.fundId} fundDetails={p} />
      })}
    </>
  )
}
