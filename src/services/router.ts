import axios from './axios';

export const fetchRouter = async (network: string) => {
  if (network == 'mainnet')
    return { address: 'CBHNQTKJD76Q55TINIT3PPP3BKLIKIQEXPTQ32GUUU7I3CHBD5JECZLW' };

  const { data } = await axios.get(`/api/${network}/router`);

  return data;
};
