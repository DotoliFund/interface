import { useAccount } from 'hooks/useAccount'
import { Helmet } from 'react-helmet-async/lib/index'




export default function OverviewPage() {
  const account = useAccount()
//   const contextValue = useCreateTDPContext()
  //const { tokenColor } = contextValue

  return (
   // <ThemeProvider accent1={tokenColor ?? undefined}>
      <Helmet>
        <title>test123</title>
      </Helmet>
    //</ThemeProvider>
  )
}
