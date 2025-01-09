import { gql } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import RangeBadge from 'components/Badge/RangeBadge'
import Loader from 'components/Icons/LoadingSpinner'
import { RowBetween } from 'components/Row'
import { FundDetails } from 'dotoli/src/types/fund'
import { request } from 'graphql-request'
import styled from 'lib/styled-components'
import { Link } from 'react-router-dom'
import { MEDIA_WIDTHS } from 'theme'
import { ThemedText } from 'theme/components'
import { shortenAddress } from 'uniswap/src/utils/addresses'
import { NumberType, useFormatter } from 'utils/formatNumbers'

const url = 'https://api.studio.thegraph.com/query/44946/dotoli/version/latest'
const query = gql`
  query GetFund($fundId: String!) {
    fund(id: $fundId, subgraphError: allow) {
      id
      fundId
      createdAtTimestamp
      updatedAtTimestamp
      manager
      investorCount
      currentUSD
    }
  }
`

const LinkRow = styled(Link)`
  align-items: center;
  display: flex;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${({ theme }) => theme.neutral1};
  padding: 16px;
  text-decoration: none;
  font-weight: 535;

  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.deprecated_hoverDefault};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
`

const FeeTierText = styled(ThemedText.BodyPrimary)`
  margin-left: 8px !important;
  line-height: 12px;
  color: ${({ theme }) => theme.neutral3};
`

const PrimaryPositionIdData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`

interface Fund {
  id: string
  fundId: string
  createdAtTimestamp: number
  updatedAtTimestamp: number
  manager: string
  investorCount: number
  currentUSD: number
}

interface FundListItemProps {
  fundDetails: FundDetails
}

interface Data {
  fund: Fund
}

export default function FundListItem({ fundDetails }: FundListItemProps) {
  const { formatNumber } = useFormatter()
  const { data } = useQuery({
    queryKey: ['fund', fundDetails.fundId],
    async queryFn() {
      return await request(url, query, { fundId: fundDetails.fundId })
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const jsonData: Data = JSON.parse(jsonString)

  return (
    <LinkRow to="www.google.com">
      {jsonData.fund ? (
        <RowBetween>
          <PrimaryPositionIdData>
            <ThemedText.SubHeader>{'fundId : '}</ThemedText.SubHeader>
            <FeeTierText>{jsonData.fund?.fundId}</FeeTierText>
            <ThemedText.SubHeader>{'manager : '}</ThemedText.SubHeader>
            <FeeTierText>{shortenAddress(jsonData.fund?.manager)}</FeeTierText>
            <ThemedText.SubHeader>{'USD : '}</ThemedText.SubHeader>
            <FeeTierText>
              {formatNumber({ input: jsonData.fund?.currentUSD, type: NumberType.FiatTokenPrice })}
            </FeeTierText>
            <ThemedText.SubHeader>{'investors : '}</ThemedText.SubHeader>
            <FeeTierText>{jsonData.fund?.investorCount}</FeeTierText>
          </PrimaryPositionIdData>
          <RangeBadge removed={false} inRange={true} />
        </RowBetween>
      ) : (
        <Loader />
      )}
    </LinkRow>
  )
}
