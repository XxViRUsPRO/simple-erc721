import { useState, useEffect, useCallback } from "react";
import { useEth } from "../contexts/EthContext";

const Component = () => {
  const {
    state: { web3, accounts, contract },
  } = useEth();

  const [balance, setBalance] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);
  const [owners, setOwners] = useState({});
  const [transferData, setTransferData] = useState({
    to: "",
    tokenId: 0,
  });

  useEffect(() => {
    const getCount = async () => {
      const count = await contract.methods.getCount().call();
      setTotalMinted(count);
    };
    contract && getCount();
  }, [contract, owners]);

  const handleAddressChange = useCallback(
    (e) => {
      const address = e.target.value;
      const match = address.match(/^0x[a-fA-F0-9]{40}$/);
      if (match) {
        setTransferData((prev) => ({ ...prev, to: address }));
        e.target.classList.remove("border-red-500");
      } else {
        e.target.classList.add("border-red-500");
      }
    },
    [setTransferData]
  );

  const handleTokenIdChange = useCallback(
    (e) => {
      const tokenId = e.target.value;
      const match = tokenId.match(/^[0-9]+$/);
      if (match) {
        setTransferData((prev) => ({ ...prev, tokenId }));
        e.target.classList.remove("border-red-500");
      } else {
        e.target.classList.add("border-red-500");
      }
    },
    [setTransferData]
  );

  useEffect(() => {
    const getBalance = async () => {
      const balance = web3.utils.fromWei(
        await web3.eth.getBalance(accounts[0]),
        "ether"
      );
      setBalance(balance);
    };
    web3 && accounts && getBalance();
  }, [accounts, web3]);

  useEffect(() => {
    const getOwners = async () => {
      const owners = {};
      for (let i = 0; i < totalMinted; i++) {
        const owner = await contract.methods.getOwner(i).call();
        owners[owner] = [...(owners[owner] || []), i];
      }
      setOwners(owners);
    };
    contract && getOwners();
  }, [totalMinted, contract]);

  const checkIfMined = useCallback(
    async (txHash) => {
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        console.log("Mined!");
      } else {
        console.log("Not mined yet...");
        setTimeout(() => {
          checkIfMined(txHash);
        }, 1000);
      }
    },
    [web3]
  );

  const mint = useCallback(async () => {
    const txHash = await contract.methods
      .mint()
      .send({ from: accounts[0], value: web3.utils.toWei("0.1", "ether") });
    checkIfMined(txHash.transactionHash).then(() => {
      window.location.reload();
    });
  }, [contract, accounts]);

  const transferTo = useCallback(async () => {
    if (transferData.to && transferData.tokenId) {
      const txHash = await contract.methods
        .transferFrom(accounts[0], transferData.to, transferData.tokenId)
        .send({ from: accounts[0] });
      checkIfMined(txHash.transactionHash).then(() => {
        window.location.reload();
      });
    } else {
      alert("Please enter a valid address and token ID");
    }
  }, [contract, accounts, transferData]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center border-2 rounded-lg p-3">
        <div className="text-xl">
          <div>Address: {accounts}</div>
          <div>Balance: {balance} ETH</div>
        </div>
        <hr className="my-3 w-full" />
        <div className="flex w-full justify-between items-end">
          <form
            className="
            flex flex-col items-center border-2 rounded-lg p-3
            [&>:not(:last-child)]:mb-3 [&>*]:px-3 [&>*]:py-1
            [&>*]:bg-gray-900 [&>*]:rounded [&>*]:focus:outline-none [&>*]:border
          "
          >
            <input
              type="text"
              placeholder="Address"
              onBlur={handleAddressChange}
            />
            <input
              type="number"
              placeholder="Token Id"
              onBlur={handleTokenIdChange}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                transferTo();
              }}
            >
              Transfer
            </button>
          </form>
          <div>
            <div>Total Minted: {totalMinted}</div>
            <button className="border rounded py-1 w-full" onClick={mint}>
              Mint
            </button>
          </div>
        </div>
      </div>
      <div>
        <div>
          {Object.keys(owners).map((owner) => (
            <div className="border-2 m-3 p-3" key={owner}>
              <div>Owner: {owner}</div>
              <div>Token ID/s: {owners[owner].join(", ")}</div>
              <ul className="list-inside">
                {owners[owner].map((id, i) => (
                  <li className="border p-3 my-2 last:mb-0" key={i}>
                    <NFT id={id} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NFT = ({ id }) => {
  const dir_cid = "QmcH3vkbBwf8M1P34KwABkxkAd8EPAeRu873ySxEu217L7";
  const token_uri = `https://ipfs.io/ipfs/${dir_cid}/${id}.txt`;
  const [content, setContent] = useState("");
  useEffect(() => {
    fetch(token_uri)
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, [token_uri]);
  return (
    <div>
      {content ? (
        <>
          <span>Token ID: {id}</span>
          <br></br>
          <span>Content: {content}</span>
        </>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
};

export default Component;
