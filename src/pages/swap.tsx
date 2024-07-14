import type { NextPage } from 'next';

// const Swap: NextPage = () => {
//   const router = useRouter();
//   const { viewType } = useSettings();
//   const { connected, walletAddress, backstopClaim } = useWallet();
//   const loadBlendData = useStore((state) => state.loadBlendData);
//   const { poolId } = router.query;
//   const safePoolId = typeof poolId === 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

//   const backstopData = useStore((state) => state.backstop);
//   const userBackstopData = useStore((state) => state.backstopUserData);
//   const userPoolEstimates = userBackstopData?.estimates.get(safePoolId);
//   const userPoolBackstopData = userBackstopData?.balances.get(safePoolId);
//   const [lpTokenEmissions, setLpTokenEmissions] = useState<bigint>();
//   const [sellCoin, setSellCoin] = useState('XLM');
//   const [receiveCoin, setReceiveCoin] = useState('USDC');
//   const [sellAmount, setSellAmount] = useState('');
//   const [receiveAmount, setReceiveAmount] = useState('');
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [txError, setTxError] = useState(false);
//   const [txErrorMessage, setTxErrorMessage] = useState('');
//   const [swapResult, setSwapResult] = useState<any>();
//   const [isLoading, setIsLoading] = useState(false);

//   const conversionRate = 0.0899; // 1 XLM = 0.0899 USDC

//   const handleSellAmountChange = (amount: string) => {
//     setSellAmount(amount);
//     setReceiveAmount((parseFloat(amount) * conversionRate).toFixed(2));
//   };

//   const handleReceiveAmountChange = (amount: string) => {
//     setReceiveAmount(amount);
//     setSellAmount((parseFloat(amount) / conversionRate).toFixed(2));
//   };

//   const handleClaimEmissionsClick = async () => {
//     if (connected && userBackstopData && userPoolEstimates?.emissions) {
//       let claimArgs: BackstopClaimArgs = {
//         from: walletAddress,
//         pool_addresses: [safePoolId],
//         to: walletAddress,
//       };
//       setLpTokenEmissions(BigInt(0));
//       await backstopClaim(claimArgs, false);
//       await loadBlendData(true, safePoolId, walletAddress);
//     }
//   };

//   const trade: InterfaceTrade = {
//     tradeType: TradeType.EXACT_INPUT,
//     inputAmount: { value: sellAmount, currency: sellCoin },
//     outputAmount: { value: receiveAmount, currency: receiveCoin },
//     path: [sellCoin, receiveCoin],
//   };

//   const { doSwap } = useSwapCallback(trade);

//   const handleSwap = async () => {
//     if (!connected) {
//       setTxErrorMessage('Wallet not connected');
//       setTxError(true);
//       return;
//     }

//     setIsLoading(true);
//     setTxError(false);
//     setTxErrorMessage('');

//     try {
//       const result = await doSwap();
//       setSwapResult(result);
//       setShowConfirm(true);
//     } catch (error: any) {
//       setTxErrorMessage(error.message || 'An unknown error occurred');
//       setTxError(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleConfirmDismiss = () => {
//     setShowConfirm(false);
//     setSwapResult(undefined);
//   };

//   const handleErrorDismiss = () => {
//     setTxError(false);
//     setTxErrorMessage('');
//     handleConfirmDismiss();
//   };

//   return (
//     <>
//       <PoolExploreBar poolId={safePoolId} />
//       <Row>
//         <SectionBase type="alt" sx={{ margin: '6px', padding: '6px' }}>
//           Swap
//         </SectionBase>
//       </Row>
//       <Divider />

//       {lpTokenEmissions !== undefined && lpTokenEmissions > BigInt(0) && (
//         <Row>
//           <Section
//             width={SectionSize.FULL}
//             sx={{
//               flexDirection: 'column',
//               paddingTop: '12px',
//             }}
//           >
//             <Typography variant="body2" sx={{ margin: '6px' }}>
//               Emissions to claim
//             </Typography>
//             <Row>
//               <Button
//                 sx={{
//                   width: '100%',
//                   margin: '6px',
//                   padding: '12px',
//                   color: theme.palette.text.primary,
//                   backgroundColor: theme.palette.background.default,
//                   '&:hover': {
//                     color: theme.palette.primary.main,
//                   },
//                 }}
//                 onClick={handleClaimEmissionsClick}
//               >
//                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
//                   <FlameIcon />
//                   <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
//                   <Box sx={{ display: 'flex', flexDirection: 'row' }}>
//                     <Typography variant="h4" sx={{ marginRight: '6px' }}>
//                       {toBalance(lpTokenEmissions, 7)}
//                     </Typography>
//                     <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
//                       BLND-USDC LP
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <ArrowForwardIcon fontSize="inherit" />
//               </Button>
//             </Row>
//           </Section>
//         </Row>
//       )}
//       <Section
//         width={SectionSize.FULL}
//         sx={{
//           flexDirection: 'column',
//           paddingTop: '12px',
//           backgroundColor: theme.palette.background.paper,
//         }}
//       >
//         <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//           <Box sx={{ width: '100%', flexDirection: 'column' }}>
//             <SwapSection>
//               <SwapCurrencyInputPanel
//                 label="You sell"
//                 value={sellAmount}
//                 onUserInput={handleSellAmountChange}
//                 onCurrencySelect={setSellCoin}
//                 currency={sellCoin}
//                 coins={['XLM', 'USDC']}
//               />
//             </SwapSection>
//             <ArrowContainer>
//               <ArrowForwardIcon fontSize="large" />
//             </ArrowContainer>
//             <OutputSwapSection>
//               <SwapCurrencyInputPanel
//                 label="You receive"
//                 value={receiveAmount}
//                 onUserInput={handleReceiveAmountChange}
//                 onCurrencySelect={setReceiveCoin}
//                 currency={receiveCoin}
//                 coins={['USDC', 'XLM']}
//               />
//             </OutputSwapSection>
//           </Box>
//         </Box>
//       </Section>

//       <Row>
//         <Button
//           sx={{
//             width: '100%',
//             margin: '12px',
//             padding: '16px',
//             backgroundColor: theme.palette.primary.main,
//             color: '#fff',
//           }}
//           onClick={handleSwap}
//           disabled={isLoading}
//         >
//           {isLoading ? <CircularProgress size="24px" /> : 'Swap'}
//         </Button>
//       </Row>

//       <Modal
//         open={txError}
//         onClose={handleErrorDismiss}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
//           <Typography variant="h6" sx={{ marginBottom: '12px' }}>
//             Transaction Error
//           </Typography>
//           <Typography variant="body1" sx={{ marginBottom: '12px' }}>
//             {txErrorMessage}
//           </Typography>
//           <Button
//             onClick={handleErrorDismiss}
//             sx={{ backgroundColor: theme.palette.error.main, color: '#fff' }}
//           >
//             Close
//           </Button>
//         </Box>
//       </Modal>

//       <Modal
//         open={showConfirm}
//         onClose={handleConfirmDismiss}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
//           <Typography variant="h6" sx={{ marginBottom: '12px' }}>
//             Swap Successful
//           </Typography>
//           <Typography variant="body1" sx={{ marginBottom: '12px' }}>
//             {swapResult}
//           </Typography>
//           <Button
//             onClick={handleConfirmDismiss}
//             sx={{ backgroundColor: theme.palette.success.main, color: '#fff' }}
//           >
//             Close
//           </Button>
//         </Box>
//       </Modal>

//       <BackstopQueueMod poolId={safePoolId} />
//     </>
//   );
// };

// export default Swap;

const Swap: NextPage = () => {
  return <></>;
};

export default Swap;
