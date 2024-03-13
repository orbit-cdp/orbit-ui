import { Input, Typography } from "@mui/material";
import { useState } from "react";
import { Divider } from "../components/common/Divider";
import { OpaqueButton } from "../components/common/OpaqueButton";
import { Row } from "../components/common/Row";
import { useWallet } from "../contexts/wallet";
import { useStore } from "../store/store";
import theme from "../theme";

export default function NetworkPage(){
  const {walletAddress,getNetworkDetails} = useWallet();
  const {network,setNetwork} = useStore((state) => state);
  const [newNetworkRPCUrl,setNewNetworkRPCUrl] = useState<string>();
  const [newNetworkPassphrase,setNewNetworkPassphrase] = useState<string>();

  function fetchFromWallet(){
    getNetworkDetails().then((networkDetails) => {
      if(networkDetails.rpc){
        setNewNetworkPassphrase(networkDetails.passphrase);
        setNewNetworkRPCUrl(networkDetails.rpc);
      }
    })
  }

  function handleUpdatenetworkClick(){
    if(newNetworkRPCUrl && newNetworkPassphrase){
      setNetwork(newNetworkRPCUrl,newNetworkPassphrase);
    }
  }


  return <>
  <>
      <Row>
        <Typography variant="h1">
          Network Configuration 
        </Typography>
      </Row>
      <Divider />
     {!!network.rpc &&  <Row sx={{gap:"1rem",flexDirection:"column"}}>

     <Typography variant="h2">
        Current Network Details
      </Typography>
      <Typography variant="h3">
        RPC Url
      </Typography>
      <Typography variant="h4">
        {network.rpc}
      </Typography>
      <Typography variant="h3">
        Passphrase

      </Typography>
      <Typography variant="h4">
        {network.passphrase}
      </Typography>

      </Row>}
      <Divider />
      <Row sx={{flexDirection:"column",gap:"1rem",alignItems:"start"}}>
      <Typography variant="h2">
        Update Network Details
      </Typography>

     <Row sx={{flexDirection:"column",display:"flex",gap:"1rem"}}>
     <Input placeholder="Input RPC Url" type="text" value={newNetworkRPCUrl} onChange={(e) => setNewNetworkRPCUrl(e.target.value)} />
      <Input placeholder="Input Passphrase " type="text" value={newNetworkPassphrase} onChange={(e) => setNewNetworkPassphrase(e.target.value)} />
      <OpaqueButton sx={{width:"20rem",margin:"auto"}} palette={theme.palette.backstop} onClick={fetchFromWallet}>Fetch From Wallet</OpaqueButton>
      <OpaqueButton sx={{width:"20rem",margin:"auto"}} palette={theme.palette.primary} onClick={handleUpdatenetworkClick}>Update</OpaqueButton>
     </Row>
      </Row>

      
    </>
</>
}