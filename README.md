# NFT Uploader

A modern React application for minting NFTs with custom names and images on the Ethereum Sepolia testnet.

![NFT Uploader Screenshot](screenshot.png)

## Features

- **Custom NFT Naming**: Give your NFTs unique names
- **Image Upload**: Upload and preview images before minting
- **IPFS Storage**: Automatically uploads images and metadata to IPFS via Pinata
- **Blockchain Integration**: Mints NFTs on the Ethereum Sepolia testnet
- **Transaction Tracking**: View transaction details and NFT IDs
- **Transaction History**: Automatically saves transaction details to JSON files

## Technologies Used

- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **Ethers.js**: Ethereum blockchain interaction
- **Pinata**: IPFS storage and pinning
- **Web3**: Blockchain connectivity

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask or another Web3 wallet
- Pinata account for IPFS storage
- Ethereum Sepolia testnet ETH (for gas fees)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nft-uploader.git
   cd nft-uploader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_PINATA_JWT=your_pinata_jwt_token
   REACT_APP_PINATA_API_KEY=your_pinata_api_key
   REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key
   REACT_APP_PRIVATE_KEY=your_ethereum_private_key
   REACT_APP_SEPOLIA_RPC_URL=your_sepolia_rpc_url
   REACT_APP_INFURA_PROJECT_ID=your_infura_project_id
   ```

   > **Note**: You can get a Pinata JWT token from your Pinata account dashboard. The private key should be from a wallet with Sepolia testnet ETH.

4. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Enter a name for your NFT in the "NFT Name" field
2. Upload an image file using the file input
3. Preview your image in the preview section
4. Click "Mint NFT" to mint your NFT
5. Wait for the transaction to be confirmed
6. View the transaction details and NFT ID
7. A JSON file with transaction details will be automatically downloaded

## Smart Contract

This application interacts with an NFT smart contract deployed on the Ethereum Sepolia testnet. The contract address is:

```
0x8cFe8F5395c87522Ce96915c2B492960bd63633E
```

## IPFS Storage

The application uses Pinata for IPFS storage. When you upload an image and mint an NFT:

1. The image is uploaded to IPFS via Pinata
2. Metadata (name, description, image URL) is created and uploaded to IPFS
3. The metadata IPFS URL is used to mint the NFT

## Development

### Project Structure

```
nft-uploader/
├── public/              # Static files
├── src/                 # Source code
│   ├── App.tsx          # Main application component
│   ├── App.css          # Styles
│   └── index.tsx        # Entry point
├── .env                 # Environment variables
├── craco.config.js      # Webpack configuration
└── package.json         # Dependencies and scripts
```

### Customization

- To change the smart contract, update the `contractAddress` and `contractABI` in `App.tsx`
- To modify the metadata structure, update the metadata object in the `mintNFT` function

## License

MIT

## Acknowledgements

- [Ethers.js](https://docs.ethers.org/) for Ethereum interaction
- [Pinata](https://pinata.cloud/) for IPFS storage
- [Sepolia Testnet](https://sepoliafaucet.com/) for test ETH
