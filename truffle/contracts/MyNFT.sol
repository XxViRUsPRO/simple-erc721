// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mint() 
        public payable returns(uint256) {
            require(msg.value >= 0.1 ether, "Not enough ETH");
            address _recipient = msg.sender;
            uint256 newItemId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _mint(_recipient, newItemId);
            return newItemId;            
    }

    function getCount() public view returns(uint256) {
        return _tokenIdCounter.current();
    }

    function getOwner(uint256 _tokenId) public view returns(address) {
        return _ownerOf(_tokenId);
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}