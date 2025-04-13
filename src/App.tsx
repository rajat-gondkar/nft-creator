import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum: any;
  }
}

// Contract address on Sepolia
const contractAddress = '0x8cFe8F5395c87522Ce96915c2B492960bd63633E';

// Contract ABI
const contractABI = [
  "function mint(string memory tokenURI) public returns (uint256)",
  "function owner() public view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Pinata configuration
const PINATA_JWT = String(process.env.REACT_APP_PINATA_JWT || '');
const PINATA_API_KEY = String(process.env.REACT_APP_PINATA_API_KEY || '');
const PINATA_SECRET_KEY = String(process.env.REACT_APP_PINATA_SECRET_KEY || '');

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PINATA_JWT:', PINATA_JWT ? 'JWT token is set' : 'JWT token is missing');
console.log('PINATA_API_KEY:', PINATA_API_KEY ? 'API key is set' : 'API key is missing');
console.log('PINATA_SECRET_KEY:', PINATA_SECRET_KEY ? 'Secret key is set' : 'Secret key is missing');
console.log('PRIVATE_KEY:', process.env.REACT_APP_PRIVATE_KEY ? 'Private key is set' : 'Private key is missing');
console.log('SEPOLIA_RPC_URL:', process.env.REACT_APP_SEPOLIA_RPC_URL ? 'RPC URL is set' : 'RPC URL is missing');

// Infura configuration
const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID!;
const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`;

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [nftName, setNftName] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [nftId, setNftId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNftName(event.target.value);
  };

  const uploadToPinata = async (file: File): Promise<string> => {
    try {
      console.log('Uploading to Pinata...');
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Set options for the request
      let options: RequestInit;
      
      if (PINATA_JWT) {
        // Use JWT authentication
        options = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`
          },
          body: formData
        };
      } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
        // Use API key authentication
        options = {
          method: 'POST',
          headers: {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
          },
          body: formData
        };
      } else {
        throw new Error('No Pinata authentication credentials available');
      }
      
      // Upload file to Pinata
      console.log('Uploading file to Pinata...');
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', options);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Pinata API error response:', errorData);
        throw new Error(`Pinata API error: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Pinata upload result:', result);
      
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      console.log('IPFS URL:', ipfsUrl);
      
      return ipfsUrl;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw new Error(`Failed to upload to Pinata: ${error}`);
    }
  };

  const uploadMetadataToPinata = async (metadata: any): Promise<string> => {
    try {
      console.log('Uploading metadata to Pinata...');
      
      // Set options for the request
      let options: RequestInit;
      
      if (PINATA_JWT) {
        // Use JWT authentication
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT}`
          },
          body: JSON.stringify(metadata)
        };
      } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
        // Use API key authentication
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
          },
          body: JSON.stringify(metadata)
        };
      } else {
        throw new Error('No Pinata authentication credentials available');
      }
      
      // Upload metadata to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', options);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Pinata API error response:', errorData);
        throw new Error(`Pinata API error: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Metadata Pinata upload result:', result);
      
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      console.log('Metadata IPFS URL:', metadataUrl);
      
      return metadataUrl;
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error);
      throw new Error(`Failed to upload metadata to Pinata: ${error}`);
    }
  };

  const mintNFT = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!nftName.trim()) {
      setError('Please enter a name for the NFT');
      return;
    }

    try {
      setLoading(true);
      setTxHash('');
      setNftId('');
      setError('');

      // Create a wallet instance
      const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY!, new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL));
      console.log('Wallet address:', wallet.address);

      // Upload file to Pinata
      const fileIpfsUrl = await uploadToPinata(file);
      console.log('File uploaded to Pinata:', fileIpfsUrl);

      // Create metadata
      const metadata = {
        name: nftName,
        description: `NFT created from ${file.name}`,
        image: fileIpfsUrl
      };

      // Upload metadata to Pinata
      const metadataIpfsUrl = await uploadMetadataToPinata(metadata);
      console.log('Metadata uploaded to Pinata:', metadataIpfsUrl);

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, wallet);
      console.log('Contract instance created');

      // Mint NFT
      console.log('Minting NFT...');
      const tx = await contract.mint(metadataIpfsUrl);
      console.log('Transaction sent:', tx.hash);

      setTxHash(tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Get the NFT ID from the Transfer event
      const transferEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog.name === 'Transfer';
        } catch (e) {
          return false;
        }
      });

      if (transferEvent) {
        const parsedLog = contract.interface.parseLog(transferEvent);
        const tokenId = parsedLog.args[2].toString();
        setNftId(tokenId);
        console.log('NFT ID:', tokenId);
      }

      // Save transaction details to file
      const transactionDetails = {
        transactionHash: tx.hash,
        tokenId: nftId,
        metadataUrl: metadataIpfsUrl,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(transactionDetails, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-${tx.hash}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Error minting NFT:', error);
      setError(error.message || 'Failed to mint NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <main>
        <h1>NFT Uploader</h1>
        <div className="upload-section">
          <div className="input-group">
            <label htmlFor="nft-name">NFT Name:</label>
            <input
              id="nft-name"
              type="text"
              value={nftName}
              onChange={handleNameChange}
              placeholder="Enter a name for your NFT"
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="file-upload">NFT Image:</label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
          {preview && (
            <div className="preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
          <button onClick={mintNFT} disabled={!file || !nftName.trim() || loading}>
            {loading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {txHash && (
          <div className="result">
            <h3>NFT Minted Successfully!</h3>
            <p>Name: {nftName}</p>
            <p>Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a></p>
            <p>NFT ID: {nftId}</p>
            <p>NFT Link: <a href={`https://testnets.opensea.io/assets/sepolia/${contractAddress}/${nftId}`} target="_blank" rel="noopener noreferrer">View on OpenSea</a></p>
            <p>Transaction details have been saved to a file.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
